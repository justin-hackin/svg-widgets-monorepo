import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import OrbitControls from 'threejs-orbit-controls';
import '../style.css';

const IDEAL_RADIUS = 60;

const {
  Scene, WebGLRenderer, PerspectiveCamera,
} = THREE;

const loader = new GLTFLoader();

export const ShapePreview = ({
  width, height, textureTransform, shapeId, textureCanvas,
}) => {
  const [renderer, setRenderer] = useState();
  const [camera, setCamera] = useState();
  const [scene, setScene] = useState();
  const [polyhedronMesh, setPolyhedronMesh] = useState();
  const [polyhedronObject, setPolyhedronObject] = useState();

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

    const globalLight = new (THREE.AmbientLight)(0xffffff);
    // soft white light
    globalLight.intensity = 1.0;
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
        if (polyhedronObject) {
          scene.remove(polyhedronObject);
        }
        scene.add(importScene);
        setPolyhedronObject(importScene);

        // only set the polyhedron once, there should be only one mesh
        scene.traverse((child) => {
          // @ts-ignore
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
      (error) => {
        console.log(error);
      },
    );
  }, [shapeId, camera, scene]);

  useEffect(() => {
    if (polyhedronMesh && textureCanvas) {
      // @ts-ignore
      const { material } = polyhedronMesh;
      textureCanvas.getContext('2d');
      material.map.image = textureCanvas.transferToImageBitmap();
      polyhedronMesh.material.map.needsUpdate = true;
    }
  }, [textureTransform, polyhedronMesh, textureCanvas, shapeId]);

  return (
    <div ref={threeContainerRef} id="3d-preview-container" />
  );
};
