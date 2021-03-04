import { getParentOfType, types } from 'mobx-state-tree';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import npot from 'nearest-power-of-two';
import OrbitControls from 'threejs-orbit-controls';
import Canvg, { presets } from 'canvg';
import {
  Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, Scene, WebGLRenderer,
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
    renderer: null,
    scene: new Scene(),
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
      rendererContainer.appendChild(self.renderer.domElement);
      self.renderer.setPixelRatio(window.devicePixelRatio);
      self.camera = new PerspectiveCamera(
        30, self.canvasDimensions.width / self.canvasDimensions.height, 0.1, 2000,
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

      self.animationFrame = requestAnimationFrame(((renderer, controls, camera, scene) => {
        const animate = () => {
          controls.update();
          renderer.render(scene, camera);
          window.requestAnimationFrame(animate);
        };
        return animate;
      })(self.renderer, self.controls, self.camera, self.scene));

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
        // TODO: throw if material not MeshPhong
        // @ts-ignore
        const ctx = textureCanvas.getContext('2d');
        // @ts-ignore
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

          self.scene.traverse((child) => {
            const meshChild = (child as Mesh);
            if (meshChild.isMesh) {
              const normalizingScale = self.IDEAL_RADIUS / meshChild.geometry.boundingSphere.radius;
              meshChild.scale.fromArray([normalizingScale, normalizingScale, normalizingScale]);
              const oldMaterial = meshChild.material;
              meshChild.material = new MeshBasicMaterial();
              // @ts-ignore
              meshChild.material.map = oldMaterial.map;
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
