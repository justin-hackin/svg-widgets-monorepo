import React from 'react';
import { observer } from 'mobx-react';
import {
  Mesh, MeshPhongMaterial, Object3D, PerspectiveCamera, Renderer, Scene, WebGLRenderer,
} from 'three';
import Canvg, { presets } from 'canvg';
import ReactDOMServer from 'react-dom/server';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import OrbitControls from 'threejs-orbit-controls';
import '../style.css';
import requireStatic from '../../requireStatic';
import { TextureSvgUnobserved } from './TextureSvg';
import { useMst } from '../models';
import { viewBoxAttrsToString } from '../../../common/util/svg';
import { ITextureTransformEditorModel } from '../models/TextureTransformEditorModel';

const { useEffect, useRef, useState } = React;

const IDEAL_RADIUS = 60;

const loader = new GLTFLoader();

export const ShapePreview = observer(() => {
  const store:ITextureTransformEditorModel = useMst();
  const {
    texture, faceBoundary, shapeName, placementAreaDimensions: { width, height }, autoRotatePreview,
    shapeObject, setShapeObject,
  } = store;
  const [renderer, setRenderer] = useState<Renderer>();
  const [camera, setCamera] = useState<PerspectiveCamera>();
  const [controls, setControls] = useState<OrbitControls>();
  const [scene, setScene] = useState<Scene>();
  const [readyForCanvasRender, setReadyForCanvasRender] = useState<boolean>(true);

  const polyhedronObjectRef = useRef<Object3D>();
  const threeContainerRef = useRef<HTMLDivElement>();
  const requestRef = React.useRef<number>(0);

  const { viewBoxAttrs } = faceBoundary || {};
  const { transformMatrixDraggedStr, pattern: { isPositive = undefined } = {} } = texture || {};

  // update shape texture
  useEffect(() => {
    if (shapeObject && viewBoxAttrs && readyForCanvasRender) {
      setReadyForCanvasRender(false);
      const textureCanvas = new window.OffscreenCanvas(viewBoxAttrs.width, viewBoxAttrs.height);
      // TODO: throw if material not MeshPhong
      // @ts-ignore
      const { material }: {material: MeshPhongMaterial} = shapeObject;
      const ctx = textureCanvas.getContext('2d');
      // @ts-ignore
      const svgStr = ReactDOMServer.renderToString(
        React.createElement(TextureSvgUnobserved, { viewBox: viewBoxAttrsToString(viewBoxAttrs), store }),
      );
      // @ts-ignore
      Canvg.from(ctx, svgStr, presets.offscreen()).then(async (v) => {
        await v.render();
        // @ts-ignore
        material.map.image = textureCanvas.transferToImageBitmap();
        // @ts-ignore
        material.map.needsUpdate = true;
        setReadyForCanvasRender(true);
      });
    }
  }, [shapeObject, transformMatrixDraggedStr, isPositive, viewBoxAttrs]);

  // renderer boundary size change
  useEffect(() => {
    if (!threeContainerRef.current || !camera || !renderer) { return; }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }, [width, height, threeContainerRef, camera, renderer]);

  // THREE rendering setup
  useEffect(() => {
    if (threeContainerRef.current && shapeObject) { return undefined; }
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

    const globalLight = new (THREE.AmbientLight)(0xffffff);
    // soft white light
    globalLight.intensity = 2.0;
    theScene.add(globalLight);

    const theCamera = new PerspectiveCamera(45, width / height, 0.1, 2000);
    theCamera.position.set(300, 0, 300);
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
  }, [threeContainerRef, shapeObject]);

  useEffect(() => {
    if (controls) {
      controls.autoRotate = autoRotatePreview;
    }
  }, [autoRotatePreview, controls]);

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
            const scale = IDEAL_RADIUS / child.geometry.boundingSphere.radius;
            child.scale.fromArray([scale, scale, scale]);
            setShapeObject(child);
          }
        });
      },
    );
  }, [shapeName, camera, scene]);

  // @ts-ignore
  return (<div ref={threeContainerRef} id="3d-preview-container" />);
});
