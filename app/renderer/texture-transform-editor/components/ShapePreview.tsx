import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import OrbitControls from 'threejs-orbit-controls';

const {
  Scene, WebGLRenderer, PerspectiveCamera, PointLight,
} = THREE;

const loader = new GLTFLoader();

export const ShapePreview = ({ width, height, textureTransform }) => {
  const [scene, setScene] = useState();
  const [renderer, setRenderer] = useState();
  const [camera, setCamera] = useState();

  const [polyhedronShape, setPolyhedronShape] = useState();

  const [offsetY] = useState(85);

  const threeContainerRef = useRef();

  useEffect(() => {
    if (!threeContainerRef.current || !camera || !renderer) { return; }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }, [width, height, threeContainerRef, camera, renderer]);

  useEffect(() => {
    if (polyhedronShape) {
      polyhedronShape.material.map.needsUpdate = true;
    }
  }, [textureTransform]);

  useEffect(() => {
    if (!threeContainerRef.current) { return; }
    const theScene = new Scene();
    const theRenderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    const theCamera = new PerspectiveCamera(45, width / height, 0.1, 2000);
    const theControls = new OrbitControls( theCamera, theRenderer.domElement );
    theControls.autoRotate = true;
    theRenderer.setPixelRatio(window.devicePixelRatio);
    theScene.add(theCamera);

    let wasSet = false;
    loader.load(
      // resource URL
      '../models/great-disdyakisdodecahedron.gltf',
      ({ scene: importScene }) => {
        theScene.add(importScene);
        theCamera.position.set(304, 159 + offsetY, 0);
        const light = new PointLight(0xffffff);
        light.position.set(400, 600, 0);
        light.intensity = 1;
        theScene.add(light);
        const globalLight = new (THREE.AmbientLight)(0xffffff);
        // soft white light
        globalLight.intensity = 0.1;
        theScene.add(globalLight);
        // renderer.domElement
        //   .addEventListener('selectstart', (e) => { e.preventDefault(); return false; }, false);
        // @ts-ignore
        threeContainerRef.current.appendChild(theRenderer.domElement);
        // only set the polyhedron once, there should be only one mesh
        theScene.traverse((child) => {
          // @ts-ignore
          if (!wasSet && child.isMesh) {
            wasSet = true;
            theCamera.lookAt(child.position);
            child.scale.fromArray([10, 10, 10]);

            // @ts-ignore
            const { material } = child;
            const textureCanvas:HTMLCanvasElement = document.querySelector('#texture-canvas');
            // eslint-disable-next-line no-param-reassign
            material.map.image = textureCanvas;
            material.needsUpdate = true;
            setPolyhedronShape(child);
          }
        });

        setScene(theScene);
        setRenderer(theRenderer);
        setCamera(theCamera);
        function animate() {
          window.requestAnimationFrame(animate);
          theControls.update();
          theRenderer.render(theScene, theCamera);
        }
        animate();
      },
      // called while loading is progressing
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      // called when loading has errors
      (error) => {
        console.log(error);
      },
    );
  }, [threeContainerRef]);

  return (
    <div ref={threeContainerRef} id="3d-preview-container" />
  );
};
