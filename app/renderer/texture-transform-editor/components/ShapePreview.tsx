import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import OrbitControls from 'threejs-orbit-controls';
import '../style.css';

const {
  Scene, WebGLRenderer, PerspectiveCamera, PointLight,
} = THREE;

const loader = new GLTFLoader();

export const ShapePreview = ({
  width, height, textureTransform, shapeId,
}) => {
  const [renderer, setRenderer] = useState();
  const [camera, setCamera] = useState();
  const [scene, setScene] = useState();
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
    if (!threeContainerRef.current) { return; }
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

    const light = new PointLight(0xffffff);
    light.position.set(400, 600, 0);
    light.intensity = 1;
    theScene.add(light);

    const globalLight = new (THREE.AmbientLight)(0xffffff);
    // soft white light
    globalLight.intensity = 0.1;
    theScene.add(globalLight);

    const theCamera = new PerspectiveCamera(45, width / height, 0.1, 2000);
    theCamera.position.set(304, 159 + offsetY, 0);
    setCamera(theCamera);

    const theControls = new OrbitControls(theCamera, theRenderer.domElement);
    theControls.autoRotate = true;
    theScene.add(theCamera);
    setScene(theScene);

    function animate() {
      window.requestAnimationFrame(animate);
      theControls.update();
      theRenderer.render(theScene, theCamera);
    }
    animate();
  }, [threeContainerRef]);

  useEffect(() => {
    if (!shapeId || !camera || !scene) { return; }

    loader.load(
      // resource URL
      `../models/${shapeId}.gltf`,
      ({ scene: importScene }) => {
        scene.add(importScene);

        // only set the polyhedron once, there should be only one mesh
        scene.traverse((child) => {
          // @ts-ignore
          if (child.isMesh) {
            camera.lookAt(child.position);
            child.scale.fromArray([10, 10, 10]);

            // @ts-ignore
            const { material } = child;
            const textureCanvas:HTMLCanvasElement = document.querySelector('#texture-canvas');
            debugger; // eslint-disable-line no-debugger
            // eslint-disable-next-line no-param-reassign
            material.map.image = textureCanvas;
            material.needsUpdate = true;
            setPolyhedronShape(child);
          }
        });
      },
      null,
      // called when loading has errors
      (error) => {
        console.log(error);
      },
    );
  }, [shapeId, camera, scene]);

  useEffect(() => {
    if (polyhedronShape) {
      polyhedronShape.material.map.needsUpdate = true;
    }
  }, [textureTransform]);

  return (
    <div ref={threeContainerRef} id="3d-preview-container" />
  );
};
