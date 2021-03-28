import {
  flow, getParentOfType, types,
} from 'mobx-state-tree';
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
  MeshBasicMaterial,
  MeshDistanceMaterial,
  BasicShadowMap, LineSegments, WireframeGeometry, Object3D,
} from 'three';
import { reaction } from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import { TextureSvgUnobserved } from '../components/TextureSvg';
import { viewBoxAttrsToString } from '../../../util/svg';
import requireStatic from '../../../../renderer/requireStatic';
import { EVENTS } from '../../../constants';
import { TextureEditorModel } from './TextureEditorModel';

// shadow casting technique from https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shadowmap_pointlight.html

const resolveSceneFromModelPath = (gltfLoader, path) => (new Promise((resolve, reject) => {
  gltfLoader.load(path, ({ scene }) => { resolve(scene); }, null, (e) => { reject(e); });
}));

export const ShapePreviewModel = types.model('ShapePreview', {})
  .volatile(() => ({
    gltfExporter: new GLTFExporter(),
    gltfLoader: new GLTFLoader(),
    scene: null,
    lightColor: 0x404040,
    internalLight: null,
    ambientLight: null,
    castSphere: null,
    renderer: null,
    shapeMesh: null,
    shapeWireframe: null,
    shapeMaterialMap: null,
    camera: null,
    controls: null,
    animationFrame: null,
    // TODO: make this value adjustable with alpha texture on (changes result in loss of shadows)
    IDEAL_RADIUS: 6,
    TEXTURE_BITMAP_SCALE: 0.5,
    MARGIN: 1,
    disposers: [],
  }))
  .views((self) => ({
    get canvasDimensions() {
      // defaults allow camera to be initialized before placementAreaDimensions have been defined
      const {
        width = 1,
        height = 1,
      } = this.parentTextureEditor.placementAreaDimensions || {};
      return { width, height };
    },
    get parentTextureEditor() {
      return getParentOfType(self, TextureEditorModel);
    },
    get cameraRadius() {
      return self.IDEAL_RADIUS * 3.1;
    },
    get sphereRadius() {
      return self.IDEAL_RADIUS * 3;
    },
    get maxCameraRadius() {
      return this.sphereRadius - self.MARGIN;
    },
    get cameraFar() {
      return this.sphereRadius + this.maxCameraRadius + self.MARGIN;
    },
    get resolvedUseAlphaTexturePreview() {
      return this.parentTextureEditor && this.parentTextureEditor.texture
        && this.parentTextureEditor.texture.pattern && this.parentTextureEditor.texture.pattern.useAlphaTexturePreview;
    },
    get useAlpha() {
      return this.resolvedUseAlphaTexturePreview || !this.parentTextureEditor.texture;
    },
  }))
  .actions((self) => {
    const setShapeTexture = (imageBitmap) => {
      if (!self.shapeMesh) {
        throw new Error('setShapeTexture: shapeMesh does not exist');
      }
      const { material }: { material: MeshPhongMaterial } = self.shapeMesh;
      material.map.image = imageBitmap;
      material.map.needsUpdate = true;
    };
    return {
      setShapeTexture,
      setMaterialMap(map) { self.shapeMaterialMap = map; },
      setShapeMesh(shape) { self.shapeMesh = shape; },
      setShapeWireframe(wireframe) { self.shapeWireframe = wireframe; },
      applyTextureToMesh: flow(function* () {
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
        const v = yield Canvg.from(ctx, svgStr, presets.offscreen());
        const {
          width: vbWidth,
          height: vbHeight,
        } = viewBoxAttrs;
        v.resize(
          npot(vbWidth * self.TEXTURE_BITMAP_SCALE),
          npot(vbHeight * self.TEXTURE_BITMAP_SCALE), 'none',
        );
        yield v.render();
        setShapeTexture(textureCanvas.transferToImageBitmap());
      }),
    };
  })
  .actions((self) => {
    const alphaOnChange = () => {
      if (self.useAlpha) {
        self.shapeMesh.material = new MeshPhongMaterial({
          map: self.shapeMaterialMap,
          alphaMap: self.shapeMaterialMap,
          side: DoubleSide,
          alphaTest: 0.5,
          transparent: true,
        });

        // will this be exported? customDepthMaterial is not
        // eslint-disable-next-line max-len
        // see https://stackoverflow.com/questions/64973079/threejs-customdepthmaterial-property-on-mesh-not-included-in-scene-tojson-outp
        self.shapeMesh.customDistanceMaterial = new MeshDistanceMaterial({
          alphaMap: self.shapeMesh.material.alphaMap,
          alphaTest: self.shapeMesh.material.alphaTest,
        });
        self.shapeMesh.castShadow = true;
        self.shapeMesh.material.needsUpdate = true;
        self.scene.add(self.castSphere);
        self.scene.add(self.internalLight);
      } else {
        self.shapeMesh.material = new MeshBasicMaterial({ map: self.shapeMaterialMap, side: DoubleSide });
        self.shapeMesh.customDistanceMaterial = undefined;
        //  if useAlphaTexturePreview initially false, we remove something that's not in the scene already on 1st call
        self.scene.remove(self.castSphere);
        self.scene.remove(self.internalLight);
      }
      self.shapeMesh.castShadow = self.useAlpha;
    };
    const setShape = flow(function* (shapeName) {
      const modelUrl = requireStatic(`models/${shapeName}.gltf`);
      const importScene = yield resolveSceneFromModelPath(self.gltfLoader, modelUrl);
      // @ts-ignore
      const meshChild:Mesh = importScene.children.find((child) => (child as Mesh).isMesh);
      const normalizingScale = self.IDEAL_RADIUS / meshChild.geometry.boundingSphere.radius;
      // move transforms into mesh so wireframe is similarly aligned
      meshChild.scale.setScalar(normalizingScale);

      if (self.shapeMesh) {
        self.scene.remove(self.shapeMesh);
        self.scene.remove(self.shapeWireframe);
      }
      // @ts-ignore
      self.setMaterialMap(meshChild.material.map as Texture);
      self.setShapeMesh(meshChild);
      self.scene.add(meshChild);
      const wireframe = new WireframeGeometry(self.shapeMesh.geometry);
      const wireframeLineSegments = new LineSegments(wireframe);
      const wireframeMaterial:any = wireframeLineSegments.material;
      wireframeMaterial.depthTest = true;
      const shapeWireframe = new Object3D();
      shapeWireframe.add(wireframeLineSegments);
      shapeWireframe.scale.copy(meshChild.scale);
      // push wireframe out just a tiny bit so it is always infront of the textured mesh
      shapeWireframe.scale.multiplyScalar(1.001);
      shapeWireframe.rotation.copy(meshChild.rotation);

      self.scene.add(shapeWireframe);
      self.setShapeWireframe(shapeWireframe);
      alphaOnChange();
    });
    const setup = (rendererContainer) => {
      self.renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      self.scene = new Scene();
      self.renderer.shadowMap.enabled = true;
      self.renderer.shadowMap.type = BasicShadowMap;
      rendererContainer.appendChild(self.renderer.domElement);
      self.renderer.setPixelRatio(window.devicePixelRatio);

      self.ambientLight = new AmbientLight(self.lightColor);
      self.ambientLight.intensity = 2;
      self.scene.add(self.ambientLight);

      // alphaOnChange will add/remove as needed
      const sphereGeometry = new SphereGeometry(self.sphereRadius, 20, 20);
      const sphereMaterial = new MeshPhongMaterial({
        color: 0xff0000,
        shininess: 10,
        specular: 0x111111,
        side: BackSide,
      });
      self.castSphere = new Mesh(sphereGeometry, sphereMaterial);
      self.castSphere.receiveShadow = true;

      // this will only be added to the scene if useAlpha === true
      self.internalLight = new PointLight(self.lightColor, 3, 20);
      self.internalLight.castShadow = true;
      self.internalLight.shadow.camera.near = 1;
      self.internalLight.shadow.camera.far = self.sphereRadius + self.MARGIN;
      self.internalLight.shadow.bias = -0.005;

      self.camera = new PerspectiveCamera(
        60, self.canvasDimensions.width / self.canvasDimensions.height, 0.1, self.cameraFar,
      );
      self.camera.position.set(0, 0, self.cameraRadius);

      self.controls = new OrbitControls(self.camera, self.renderer.domElement);
      self.controls.enablePan = false;
      self.controls.maxDistance = self.maxCameraRadius;

      if (self.shapeMesh) {
        // runs when the shape has already been loaded because the router leaves and returns to texture editor
        alphaOnChange();
      }

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
        setShape(self.parentTextureEditor.shapeName);
      }, { fireImmediately: true }));

      // texture change
      self.disposers.push(reaction(() => {
        const {
          texture: {
            transformMatrixDraggedStr = undefined,
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
          self.shapeMesh, boundaryPathD, isPositive, patternPathD, imageData, isBordered, transformMatrixDraggedStr,
        ];
      }, () => {
        self.applyTextureToMesh();
      }));

      // use alpha change
      self.disposers.push(reaction(() => [self.resolvedUseAlphaTexturePreview, self.useAlpha], () => {
        alphaOnChange();
      }));

      self.animationFrame = requestAnimationFrame(((renderer, controls, camera, scene) => {
        const animate = () => {
          controls.update();
          renderer.render(scene, camera);
          window.requestAnimationFrame(animate);
        };
        return animate;
      })(self.renderer, self.controls, self.camera, self.scene));
    };
    return {
      alphaOnChange,
      setShape,
      setup,
      tearDown() {
        if (self.animationFrame) {
          cancelAnimationFrame(self.animationFrame);
        }
        for (const disposer of self.disposers) {
          disposer();
        }
      },
      beforeDestroy() {
        this.tearDown();
      },
      async downloadShapeGLTF() {
        return self.gltfExporter
          .parse(self.shapeMesh, (shapeGLTF) => {
            globalThis.ipcRenderer.invoke(EVENTS.DIALOG_SAVE_GLB, shapeGLTF, {
              message: 'Save shape preview',
              defaultPath: `${self.parentTextureEditor.getFileBasename()}.glb`,
            });
          }, { binary: true });
      },
    };
  });
