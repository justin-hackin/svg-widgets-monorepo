import { getParentOfType, types } from 'mobx-state-tree';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import npot from 'nearest-power-of-two';
import OrbitControls from 'threejs-orbit-controls';
import Canvg, { presets } from 'canvg';
import {
  AmbientLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  Texture,
  WebGLRenderer,
  SphereGeometry,
  BackSide,
  DoubleSide,
  PlaneGeometry,
  NearestFilter,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshDepthMaterial,
  RGBADepthPacking,
  sRGBEncoding,
  MeshLambertMaterial,
} from 'three';
import { reaction } from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import { TextureSvgUnobserved } from '../components/TextureSvg';
import { viewBoxAttrsToString } from '../../../common/util/svg';
import { EVENTS } from '../../../main/ipc';
import requireStatic from '../../requireStatic';
import { TextureEditorModel } from './TextureEditorModel';

export const ShapePreviewModel = types.model({})
  .volatile(() => ({
    gltfExporter: new GLTFExporter(),
    gltfLoader: new GLTFLoader(),
    scene: new Scene(),
    lightColor: 0x404040,
    internalLight: null,
    ambientLight: null,
    castPlane: null,
    renderer: null,
    shapeScene: null,
    shapeMesh: null,
    camera: null,
    controls: null,
    animationFrame: null,
    IDEAL_RADIUS: 60,
    TEXTURE_BITMAP_SCALE: 0.2,

    disposers: [],
  }))
  .views((self) => ({
    get canvasDimensions() {
      const {
        width,
        height,
      } = this.parentTextureEditor.placementAreaDimensions || {};
      return width ? {
        width,
        height,
      } : undefined;
    },
    get parentTextureEditor() {
      return getParentOfType(self, TextureEditorModel);
    },
  }))
  .actions((self) => ({
    setup(rendererContainer) {
      self.renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      self.renderer.shadowMap.enabled = true;
      rendererContainer.appendChild(self.renderer.domElement);
      self.renderer.setPixelRatio(window.devicePixelRatio);

      const planeGeometry = new PlaneGeometry(100000, 100000);
      const planeMaterial = new MeshPhongMaterial({ color: 0xffffff });
      planeMaterial.side = DoubleSide;
      self.castPlane = new Mesh(planeGeometry, planeMaterial);
      self.castPlane.position.z = -100;
      self.castPlane.receiveShadow = true;
      self.scene.add(self.castPlane);

      // self.ambientLight = new AmbientLight(self.lightColor);
      // self.ambientLight.intensity = 1;
      // self.scene.add(self.ambientLight);

      self.internalLight = new PointLight(self.lightColor);
      self.internalLight.castShadow = true;
      self.internalLight.intensity = 2;

      self.camera = new PerspectiveCamera(
        60, self.canvasDimensions.width / self.canvasDimensions.height, 0.1, 40000,
      );
      self.camera.position.set(0, 0, 200);
      self.controls = new OrbitControls(self.camera, self.renderer.domElement);
      // update renderer dimensions
      self.disposers.push(reaction(() => [self.canvasDimensions, self.renderer], () => {
        if (self.renderer) {
          const {
            width,
            height,
          } = self.canvasDimensions;
          self.renderer.setSize(width, height);
          self.camera.aspect = width / height;
          self.camera.updateProjectionMatrix();
        }
      }, { fireImmediately: true }));

      // auto rotate update controls
      self.disposers.push(reaction(() => [self.parentTextureEditor.autoRotatePreview], () => {
        self.controls.autoRotate = self.parentTextureEditor.autoRotatePreview;
      }, { fireImmediately: true }));

      // shape change
      self.disposers.push(reaction(() => [self.parentTextureEditor.shapeName], () => {
        this.setShape(self.parentTextureEditor.shapeName);
      }, { fireImmediately: true }));

      self.disposers.push(reaction(() => {
        const {
          texture: {
            scale = undefined, rotate = undefined, translate = undefined,
            faceBoundary: { pathD: boundaryPathD = undefined } = {},
            pattern: {
              isPositive = undefined,
              pathD: patternPathD = undefined,
              imageData = undefined,
              isBordered = undefined,
            } = {},
          } = {},
        } = self.parentTextureEditor;
        return [
          self.shapeMesh, scale, rotate, translate, boundaryPathD, isPositive, patternPathD, imageData, isBordered,
        ];
      }, () => {
        const {
          shapeMesh,
          parentTextureEditor: { faceBoundary: { viewBoxAttrs } },
        } = self;
        if (!shapeMesh || !viewBoxAttrs) {
          return;
        }
        const textureCanvas = new window.OffscreenCanvas(viewBoxAttrs.width, viewBoxAttrs.height);
        const ctx = textureCanvas.getContext('2d');
        const svgStr = ReactDOMServer.renderToString(
          React.createElement(TextureSvgUnobserved, {
            viewBox: viewBoxAttrsToString(viewBoxAttrs),
            store: self.parentTextureEditor,
          }),
        );
        Canvg.from(ctx, svgStr, presets.offscreen())
          .then(async (v) => {
            const {
              width: vbWidth,
              height: vbHeight,
            } = viewBoxAttrs;
            v.resize(
              npot(vbWidth * self.TEXTURE_BITMAP_SCALE),
              npot(vbHeight * self.TEXTURE_BITMAP_SCALE), 'none',
            );
            await v.render();
            this.setShapeTexture(textureCanvas.transferToImageBitmap());
          });
      }));

      self.animationFrame = requestAnimationFrame(((renderer, controls, camera, scene) => {
        const animate = () => {
          controls.update();
          renderer.render(scene, camera);
          window.requestAnimationFrame(animate);
        };
        return animate;
      })(self.renderer, self.controls, self.camera, self.scene));
    },
    beforeDestroy() {
      if (self.animationFrame) {
        cancelAnimationFrame(self.animationFrame);
      }
      for (const disposer of self.disposers) {
        disposer();
      }
    },
    async downloadShapeGLTF() {
      return self.gltfExporter
        .parse(self.shapeMesh, (shapeGLTF) => {
          globalThis.ipcRenderer.invoke(EVENTS.SAVE_GLB, shapeGLTF, {
            message: 'Save shape preview',
            defaultPath: `${self.parentTextureEditor.getFileBasename()}.glb`,
          });
        }, { binary: true });
    },
    setShapeMesh(shape) {
      self.shapeMesh = shape;
    },
    setShapeScene(scene) {
      self.shapeScene = scene;
    },

    setShape(shapeName) {
      const modelUrl = requireStatic(`models/${shapeName}.gltf`);
      self.gltfLoader.load(
        // resource URL
        modelUrl,
        ({ scene: importScene }) => {
          if (self.shapeScene) {
            self.scene.remove(self.shapeScene);
          }
          self.scene.add(importScene);
          this.setShapeScene(importScene);
          self.shapeScene.add(self.internalLight);

          self.scene.traverse((child) => {
            // TODO: three.js advises not modifying model within this function
            const meshChild = (child as Mesh);
            if (meshChild.isMesh) {
              const normalizingScale = self.IDEAL_RADIUS / meshChild.geometry.boundingSphere.radius;
              meshChild.scale.fromArray([normalizingScale, normalizingScale, normalizingScale]);
              // @ts-ignore
              const oldMaterialMap = (meshChild.material.map as Texture);
              meshChild.material = new MeshLambertMaterial({
                /* eslint-disable object-property-newline */
                // @ts-ignore
                map: oldMaterialMap, alphaMap: oldMaterialMap, magFilter: NearestFilter,
                side: DoubleSide, transparent: true, alphaTest: 0.5,
                /* eslint-enable */
              });
              meshChild.castShadow = true;
              meshChild.customDepthMaterial = new MeshDepthMaterial({
                depthPacking: RGBADepthPacking,
                map: oldMaterialMap,
                alphaTest: 0.5,
              });
              this.setShapeMesh(child);
            }
          });
        },
      );
    },
    setShapeTexture(imageBitmap) {
      if (!self.shapeMesh) {
        throw new Error('setShapeTexture: shapeMesh does not exist');
      }
      const { material }: { material: MeshPhongMaterial } = self.shapeMesh;
      material.map.image = imageBitmap;
      material.map.needsUpdate = true;
    },
  }));
