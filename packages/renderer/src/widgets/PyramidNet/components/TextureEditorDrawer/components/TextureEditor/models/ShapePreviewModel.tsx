import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import npot from 'nearest-power-of-two';
import OrbitControls from 'threejs-orbit-controls';
import Canvg from 'canvg';
import {
  AmbientLight,
  BackSide,
  BasicShadowMap,
  DoubleSide,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshDistanceMaterial,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  Texture,
  WebGLRenderer,
  WireframeGeometry,
} from 'three';
import fileDownload from 'js-file-download';
import { computed, observable, reaction } from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { TextureSvgUnobserved } from '../components/TextureArrangement/components/TextureSvg';
import { TextureEditorModel } from './TextureEditorModel';
import { ImageFaceDecorationPatternModel } from '../../../../../models/ImageFaceDecorationPatternModel';
import { IS_ELECTRON_BUILD, IS_WEB_BUILD } from '../../../../../../../../../common/constants';
import { RawFaceDecorationModel } from '../../../../../models/RawFaceDecorationModel';
import { PathFaceDecorationPatternModel } from '../../../../../models/PathFaceDecorationPatternModel';
import { boundingBoxAttrsToViewBoxStr } from '../../../../../../../common/util/svg';
import { electronApi } from '../../../../../../../../../common/electron';

// shadow casting technique from https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shadowmap_pointlight.html

const resolveSceneFromModelPath = (gltfLoader, path) => (new Promise((resolve, reject) => {
  gltfLoader.load(path, ({ scene }) => { resolve(scene); }, null, (e) => { reject(e); });
}));

export class ShapePreviewModel {
  constructor(private parentTextureEditor: TextureEditorModel, private rendererContainer: HTMLElement) {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.scene = new Scene();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = BasicShadowMap;
    rendererContainer.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.ambientLight = new AmbientLight(this.lightColor);
    this.ambientLight.intensity = 2;
    this.scene.add(this.ambientLight);

    // alphaOnChange will add/remove as needed
    const sphereGeometry = new SphereGeometry(this.sphereRadius, 20, 20);
    const sphereMaterial = new MeshPhongMaterial({
      color: 0xff0000,
      shininess: 10,
      specular: 0x111111,
      side: BackSide,
    });
    this.castSphere = new Mesh(sphereGeometry, sphereMaterial);
    this.castSphere.receiveShadow = true;

    // this will only be added to the scene if useAlpha === true
    this.internalLight = new PointLight(this.lightColor, 3, 20);
    this.internalLight.castShadow = true;
    this.internalLight.shadow.camera.near = 0.1;
    this.internalLight.shadow.camera.far = this.sphereRadius + this.MARGIN;
    this.internalLight.shadow.bias = -0.005;

    this.camera = new PerspectiveCamera(
      60, this.canvasDimensions.width / this.canvasDimensions.height, 0.1, this.cameraFar,
    );
    this.camera.position.set(0, 0, this.cameraRadius);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.maxDistance = this.maxCameraRadius;
    this.controls.autoRotateSpeed = 1.2;

    if (this.shapeMesh) {
      // runs when the shape has already been loaded because the router leaves and returns to texture editor
      this.alphaOnChange();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const disposers = [
      // update renderer dimensions
      reaction(() => [this.canvasDimensions, this.renderer], () => {
        if (this.renderer) {
          const {
            width,
            height,
          } = this.canvasDimensions;
          this.renderer.setSize(width, height);
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
        }
      }, { fireImmediately: true }),

      // auto rotate update controls
      reaction(() => [this.parentTextureEditor.autoRotatePreview], () => {
        this.controls.autoRotate = this.parentTextureEditor.autoRotatePreview;
      }, { fireImmediately: true }),

      // shape change
      reaction(() => [this.parentTextureEditor.shapeName.value], async () => {
        await this.setShape(this.parentTextureEditor.shapeName.value);
      }, { fireImmediately: true }),

      // texture change
      reaction(() => {
        const { faceDecoration, faceBoundary } = this.parentTextureEditor;
        const listenProps:any[] = [this.shapeMesh, faceBoundary];
        if (!faceDecoration || faceDecoration instanceof RawFaceDecorationModel) { return listenProps; }
        const { pattern, transform: { transformMatrix } } = faceDecoration;
        listenProps.push(transformMatrix);
        if (pattern instanceof PathFaceDecorationPatternModel) {
          listenProps.push(pattern.isPositive, pattern.pathD);
        } else if (pattern instanceof ImageFaceDecorationPatternModel) {
          listenProps.push(pattern.imageData, pattern.isBordered);
        }
        return listenProps;
      }, () => {
        this.applyTextureToMesh();
      }),

      // use alpha change
      reaction(() => [this.resolvedUseAlphaTexturePreview, this.useAlpha], () => {
        this.alphaOnChange();
      }),
    ];

    // TODO: is IIFE needed here
    this.animationFrame = requestAnimationFrame(((renderer, controls, camera, scene) => {
      const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
      };
      return animate;
    })(this.renderer, this.controls, this.camera, this.scene));

    // // TODO: Can instantiation be deferred until canvas available?
    // return () => {
    //   cancelAnimationFrame(this.animationFrame);
    //   for (const disposer of disposers) {
    //     disposer();
    //   }
    // };
  }

  @observable
  shapeMesh = null;

  gltfExporter = new GLTFExporter() as GLTFExporter;

  gltfLoader = new GLTFLoader() as GLTFLoader;

  // @ts-ignore
  textureCanvas = document.createElement('canvas');

  scene = null;

  lightColor = 0x404040;

  internalLight = null;

  ambientLight = null;

  castSphere = null;

  renderer = null;

  shapeWireframe = null;

  shapeMaterialMap = null;

  camera = null;

  controls = null;

  disposers = null;

  animationFrame = null;

  // TODO = make this value adjustable with alpha texture on (changes result in loss of shadows;
  IDEAL_RADIUS = 6;

  TEXTURE_BITMAP_SCALE = 0.5;

  MARGIN = 1;

  @computed
  get canvasDimensions() {
    // defaults allow camera to be initialized before shapePreviewDimensions have been defined
    const {
      width = 1,
      height = 1,
    } = this.parentTextureEditor?.shapePreviewDimensions || {};
    return { width, height };
  }

  @computed
  get cameraRadius() {
    return this.IDEAL_RADIUS * 3.1;
  }

  @computed
  get sphereRadius() {
    return this.IDEAL_RADIUS * 3;
  }

  @computed
  get maxCameraRadius() {
    return this.sphereRadius - this.MARGIN;
  }

  @computed
  get cameraFar() {
    return this.sphereRadius + this.maxCameraRadius + this.MARGIN;
  }

  @computed
  get resolvedUseAlphaTexturePreview() {
    return (this.parentTextureEditor.faceDecoration?.pattern as PathFaceDecorationPatternModel)?.useAlphaTexturePreview;
  }

  @computed
  get useAlpha() {
    return this.resolvedUseAlphaTexturePreview || !this.parentTextureEditor.faceDecoration.pattern;
  }

  alphaOnChange() {
    if (this.useAlpha) {
      this.shapeMesh.material = new MeshPhongMaterial({
        map: this.shapeMaterialMap,
        alphaMap: this.shapeMaterialMap,
        side: DoubleSide,
        alphaTest: 0.5,
        transparent: true,
      });

      // will this be exported? customDepthMaterial is not
      // eslint-disable-next-line max-len
      // see https://stackoverflow.com/questions/64973079/threejs-customdepthmaterial-property-on-mesh-not-included-in-scene-tojson-outp
      this.shapeMesh.customDistanceMaterial = new MeshDistanceMaterial({
        alphaMap: this.shapeMesh.material.alphaMap,
        alphaTest: this.shapeMesh.material.alphaTest,
      });
      this.shapeMesh.castShadow = true;
      this.shapeMesh.material.needsUpdate = true;
      this.scene.add(this.castSphere);
      this.scene.add(this.internalLight);
    } else {
      this.shapeMesh.material = new MeshBasicMaterial({ map: this.shapeMaterialMap, side: DoubleSide });
      this.shapeMesh.customDistanceMaterial = undefined;
      //  if useAlphaTexturePreview initially false, we remove something that's not in the scene already on 1st call
      this.scene.remove(this.castSphere);
      this.scene.remove(this.internalLight);
    }
    this.shapeMesh.castShadow = this.useAlpha;
  }

  async setShape(shapeName: string) {
    const modelUrl = new URL(`../../../../../../../../static/models/${shapeName}.gltf`, import.meta.url).href;
    const importScene = await resolveSceneFromModelPath(this.gltfLoader, modelUrl);
    // @ts-ignore
    const meshChild:Mesh = importScene.children.find((child) => (child as Mesh).isMesh);
    const normalizingScale = this.IDEAL_RADIUS / meshChild.geometry.boundingSphere.radius;
    // move transforms into mesh so wireframe is similarly aligned
    meshChild.scale.setScalar(normalizingScale);

    if (this.shapeMesh) {
      this.scene.remove(this.shapeMesh);
      this.scene.remove(this.shapeWireframe);
    }
    // @ts-ignore
    this.setMaterialMap(meshChild.material.map as Texture);
    this.setShapeMesh(meshChild);
    this.scene.add(meshChild);
    const wireframe = new WireframeGeometry(this.shapeMesh.geometry);
    const wireframeLineSegments = new LineSegments(wireframe);
    const wireframeMaterial:any = wireframeLineSegments.material;
    wireframeMaterial.depthTest = true;
    const shapeWireframe = new Object3D();
    shapeWireframe.add(wireframeLineSegments);
    shapeWireframe.scale.copy(meshChild.scale);
    // push wireframe out just a tiny bit so it is always infront of the textured mesh
    shapeWireframe.scale.multiplyScalar(1.001);
    shapeWireframe.rotation.copy(meshChild.rotation);

    this.scene.add(shapeWireframe);
    this.setShapeWireframe(shapeWireframe);
    this.alphaOnChange();
  }

  setMaterialMap(map) {
    this.shapeMaterialMap = map;
    this.shapeMaterialMap.image = this.textureCanvas;
  }

  setShapeMesh(shape) { this.shapeMesh = shape; }

  setShapeWireframe(wireframe) { this.shapeWireframe = wireframe; }

  async applyTextureToMesh(this) {
    const {
      shapeMesh,
      parentTextureEditor: { faceDecoration = undefined, faceBoundary: { boundingBoxAttrs = undefined } = {} } = {},
    } = this;
    if (!shapeMesh || !boundingBoxAttrs || faceDecoration instanceof RawFaceDecorationModel) {
      return;
    }

    const svgStr = ReactDOMServer.renderToString(
      React.createElement(TextureSvgUnobserved, {
        viewBox: boundingBoxAttrsToViewBoxStr(boundingBoxAttrs),
        store: this.parentTextureEditor,
      }),
    );
    const {
      width: vbWidth,
      height: vbHeight,
    } = boundingBoxAttrs;
    const scaleWidth = npot(vbWidth * this.TEXTURE_BITMAP_SCALE);
    const scaleHeight = npot(vbHeight * this.TEXTURE_BITMAP_SCALE);
    this.textureCanvas.setAttribute('width', vbWidth);
    this.textureCanvas.setAttribute('height', vbHeight);
    const ctx = this.textureCanvas.getContext('2d');
    const v = await Canvg.from(ctx, svgStr, {
      ignoreAnimation: true,
      ignoreMouse: true,
      enableRedraw: false,
    });
    v.resize(scaleWidth, scaleHeight, 'none');
    await v.render();
    this.shapeMesh.material.map.needsUpdate = true;
  }

  async downloadShapeGLTF() {
    const defaultPath = `${this.parentTextureEditor.fileBasename}.glb`;
    return this.gltfExporter
      // @ts-ignore
      .parse(this.shapeMesh, async (shapeGLTF: ArrayBuffer) => {
        if (IS_ELECTRON_BUILD) {
          await electronApi.saveGlbWithDialog(shapeGLTF, 'Save shape preview', defaultPath);
        }
        if (IS_WEB_BUILD) {
          fileDownload(new Blob([shapeGLTF]), defaultPath);
        }
      }, { binary: true });
  }
}
