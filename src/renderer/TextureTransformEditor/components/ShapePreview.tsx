import React from 'react';
import { observer } from 'mobx-react';
import {
  Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Renderer, Scene, WebGLRenderer,
} from 'three';
import Canvg, { presets } from 'canvg';
import ReactDOMServer from 'react-dom/server';
import npot from 'nearest-power-of-two';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import OrbitControls from 'threejs-orbit-controls';
import '../style.css';
import requireStatic from '../../requireStatic';
import { TextureSvgUnobserved } from './TextureSvg';
import { useMst } from '../models';
import { viewBoxAttrsToString } from '../../../common/util/svg';
import { ITextureEditorModel } from '../models/TextureEditorModel';

const { useEffect, useRef, useState } = React;

const IDEAL_RADIUS = 60;
const TEXTURE_BITMAP_SCALE = 0.2;
const loader = new GLTFLoader();

export const ShapePreview = observer(() => {
  const store:ITextureEditorModel = useMst();
  const {
    faceBoundary, shapeName, placementAreaDimensions: { width, height }, autoRotatePreview, texture,
    shapePreview: { shapeObject, setShapeObject, setShapeTexture },
  } = store;
  const {
    scale, rotate, translate, pattern: { isPositive = undefined } = {},
  } = texture || {};

  const [renderer, setRenderer] = useState<Renderer>();
  const [camera, setCamera] = useState<PerspectiveCamera>();
  const [controls, setControls] = useState<OrbitControls>();
  const [scene, setScene] = useState<Scene>();

  const polyhedronObjectRef = useRef<Object3D>();
  const threeContainerRef = useRef<HTMLDivElement>();
  const requestRef = React.useRef<number>(0);

  const { viewBoxAttrs } = faceBoundary || {};

  useEffect(() => {
    if (!shapeObject || !viewBoxAttrs) { return; }

    const textureCanvas = new window.OffscreenCanvas(viewBoxAttrs.width, viewBoxAttrs.height);
    // TODO: throw if material not MeshPhong
    // @ts-ignore
    const ctx = textureCanvas.getContext('2d');
    // @ts-ignore
    const svgStr = ReactDOMServer.renderToString(
      React.createElement(TextureSvgUnobserved, { viewBox: viewBoxAttrsToString(viewBoxAttrs), store }),
    );
    // @ts-ignore
    Canvg.from(ctx, svgStr, presets.offscreen()).then(async (v) => {
      const {
        width: vbWidth,
        height: vbHeight,
      } = viewBoxAttrs;
      v.resize(
        npot(vbWidth * TEXTURE_BITMAP_SCALE),
        npot(vbHeight * TEXTURE_BITMAP_SCALE), 'none',
      );
      await v.render();
      setShapeTexture(textureCanvas.transferToImageBitmap());
    });
  }, [shapeObject, scale, rotate, translate, isPositive, viewBoxAttrs]);

  // renderer boundary size change
  useEffect(() => {
    if (!threeContainerRef.current || !camera || !renderer) { return; }
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }, [width, height, threeContainerRef, camera, renderer]);

  // THREE rendering setup
  useEffect(() => {
    if (!threeContainerRef || renderer) { return undefined; }
    const theScene = new Scene();
    const theRenderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    theRenderer.setPixelRatio(window.devicePixelRatio);
    // @ts-ignore
    threeContainerRef.current.appendChild(theRenderer.domElement);
    setRenderer(theRenderer);

    const theCamera = new PerspectiveCamera(30, width / height, 0.1, 2000);
    theCamera.position.set(0, 0, 200);
    setCamera(theCamera);

    const theControls = new OrbitControls(theCamera, theRenderer.domElement);
    theControls.enablePan = false;
    theControls.autoRotate = autoRotatePreview;
    setControls(theControls);
    theScene.add(theCamera);
    setScene(theScene);

    const animate = () => {
      window.requestAnimationFrame(animate);
      theControls.update();
      theRenderer.render(theScene, theCamera);
    };
    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [threeContainerRef]);

  useEffect(() => {
    if (controls) {
      controls.autoRotate = autoRotatePreview;
    }
  }, [autoRotatePreview, controls]);

  // shape change
  useEffect(() => {
    if (!shapeName || !camera || !scene) { return; }
    loader.load(
      // resource URL
      requireStatic(`models/${shapeName}.gltf`),
      ({ scene: importScene }) => {
        if (polyhedronObjectRef.current) {
          scene.remove(polyhedronObjectRef.current);
        }
        scene.add(importScene);
        polyhedronObjectRef.current = importScene;

        // only set the polyhedron once, there should be only one mesh
        // @ts-ignore
        scene.traverse((child: Mesh) => {
          if (child.isMesh) {
            const normalizingScale = IDEAL_RADIUS / child.geometry.boundingSphere.radius;
            child.scale.fromArray([normalizingScale, normalizingScale, normalizingScale]);
            const oldMaterial = child.material;
            child.material = new MeshBasicMaterial();
            // @ts-ignore
            child.material.map = oldMaterial.map;
            setShapeObject(child);
          }
        });
      },
    );
  }, [shapeName, camera, scene]);

  // @ts-ignore
  return (<div ref={threeContainerRef} id="3d-preview-container" />);
});
