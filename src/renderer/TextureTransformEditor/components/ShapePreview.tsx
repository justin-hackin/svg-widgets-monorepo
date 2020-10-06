import React from 'react';
import {
  Mesh, MeshPhongMaterial, Object3D, PerspectiveCamera, Renderer, Scene, WebGLRenderer,
} from 'three';
import Canvg, { presets } from 'canvg';
import ReactDOMServer from 'react-dom/server';

import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import OrbitControls from 'threejs-orbit-controls';
import '../style.css';
import requireStatic from '../../requireStatic';
import { TextureSvg } from './TextureSvg';
import { viewBoxAttrsToString } from '../util';

const { useEffect, useRef, useState } = React;

const IDEAL_RADIUS = 60;

const loader = new GLTFLoader();

export const ShapePreview = ({
  width, height, shapeId, viewBoxAttrs, textureTransformMatrixStr,
  texturePathD, boundaryPathD, transformOriginDragged, isPositive,
}) => {
  const [renderer, setRenderer] = useState<Renderer>();
  const [camera, setCamera] = useState<PerspectiveCamera>();
  const [polyhedronMesh, setPolyhedronMesh] = useState<Mesh>();
  const [scene, setScene] = useState<Scene>();
  // TODO: use this or loose it
  const [offsetY] = useState(85);

  const polyhedronObjectRef = useRef<Object3D>();
  const threeContainerRef = useRef<HTMLDivElement>();
  const textureCanvasRef = useRef<OffscreenCanvas>();
  const requestRef = React.useRef<number>();

  // update shape texture
  useEffect(() => {
    if (polyhedronMesh && viewBoxAttrs) {
      textureCanvasRef.current = new window.OffscreenCanvas(viewBoxAttrs.width, viewBoxAttrs.height);
      // TODO: throw if material not MeshPhong
      // @ts-ignore
      const { material }: {material: MeshPhongMaterial} = polyhedronMesh;
      const ctx = textureCanvasRef.current.getContext('2d');
      // @ts-ignore
      const svgInnerContent = ReactDOMServer.renderToString(React.createElement(TextureSvg, {
        texturePathD, boundaryPathD, textureTransformMatrixStr, transformOriginDragged, isPositive,
      }));
      const svgStr = `<svg viewBox="${
        viewBoxAttrsToString(viewBoxAttrs)}">${svgInnerContent}</svg>`;
      Canvg.from(ctx, svgStr, presets.offscreen()).then(async (v) => {
        await v.render();
        material.map.image = textureCanvasRef.current.transferToImageBitmap();
        material.map.needsUpdate = true;
      });
    }
  }, [polyhedronMesh, texturePathD, boundaryPathD, textureTransformMatrixStr, transformOriginDragged, isPositive]);

  // renderer boundary size change
  useEffect(() => {
    if (!threeContainerRef.current || !camera || !renderer) { return; }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }, [width, height, threeContainerRef, camera, renderer]);

  // THREE rendering setup
  useEffect(() => {
    if (threeContainerRef.current && polyhedronMesh) { return undefined; }
    const theScene = new Scene();
    const theRenderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    theRenderer.setPixelRatio(window.devicePixelRatio);
    threeContainerRef.current.appendChild(theRenderer.domElement);
    setRenderer(theRenderer);

    const globalLight = new (THREE.AmbientLight)(0xffffff);
    // soft white light
    globalLight.intensity = 2.0;
    theScene.add(globalLight);

    const theCamera = new PerspectiveCamera(45, width / height, 0.1, 2000);
    theCamera.position.set(304, 159 + offsetY, 0);
    setCamera(theCamera);

    const theControls = new OrbitControls(theCamera, theRenderer.domElement);
    theControls.enablePan = false;
    theControls.autoRotate = true;
    theScene.add(theCamera);
    setScene(theScene);

    const animate = () => {
      window.requestAnimationFrame(animate);
      theControls.update();
      theRenderer.render(theScene, theCamera);
    };
    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [threeContainerRef, polyhedronMesh]);


  useEffect(() => {
    if (!shapeId || !camera || !scene) { return; }
    loader.load(
      // resource URL
      requireStatic(`models/${shapeId}.gltf`),
      ({ scene: importScene }) => {
        if (polyhedronObjectRef.current) {
          scene.remove(polyhedronObjectRef.current);
        }
        scene.add(importScene);
        polyhedronObjectRef.current = importScene;

        // only set the polyhedron once, there should be only one mesh
        scene.traverse((child: Mesh) => {
          if (child.isMesh) {
            const scale = IDEAL_RADIUS / child.geometry.boundingSphere.radius;
            camera.lookAt(child.position);
            child.scale.fromArray([scale, scale, scale]);
            setPolyhedronMesh(child);
          }
        });
      },
      null,
      // called when loading has errors
      () => {
        // TODO: handle error
      },
    );
  }, [shapeId, camera, scene]);


  return (
    <div ref={threeContainerRef} id="3d-preview-container" />
  );
};
