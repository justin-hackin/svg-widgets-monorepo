import React from 'react';
import {
  Mesh, MeshPhongMaterial, Object3D, PerspectiveCamera, Renderer, Scene, WebGLRenderer,
} from 'three';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import OrbitControls from 'threejs-orbit-controls';
import '../style.css';
import requireStatic from '../../requireStatic';

const { useEffect, useRef, useState } = React;

const IDEAL_RADIUS = 60;

const loader = new GLTFLoader();

export const ShapePreview = ({
  width, height, changeRenderFlag, shapeId, textureCanvas,
}) => {
  const [renderer, setRenderer] = useState<Renderer>();
  const [camera, setCamera] = useState<PerspectiveCamera>();
  const [scene, setScene] = useState<Scene>();
  const [polyhedronMesh, setPolyhedronMesh] = useState<Mesh>();
  const [polyhedronObject, setPolyhedronObject] = useState<Object3D>();

  const [offsetY] = useState(85);

  const threeContainerRef = useRef<HTMLDivElement>();
  const requestRef = React.useRef<number>();


  useEffect(() => {
    if (!threeContainerRef.current || !camera || !renderer) { return; }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }, [width, height, threeContainerRef, camera, renderer]);

  useEffect(() => {
    if (threeContainerRef.current) {
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
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [threeContainerRef]);


  useEffect(() => {
    if (!shapeId || !camera || !scene) { return; }
    loader.load(
      // resource URL
      requireStatic(`models/${shapeId}.gltf`),
      ({ scene: importScene }) => {
        if (polyhedronObject) {
          scene.remove(polyhedronObject);
        }
        scene.add(importScene);
        setPolyhedronObject(importScene);

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

  useEffect(() => {
    if (polyhedronMesh && textureCanvas) {
      // TODO: throw if material not MeshPhong
      // @ts-ignore
      const { material }: {material: MeshPhongMaterial} = polyhedronMesh;
      textureCanvas.getContext('2d');
      material.map.image = textureCanvas.transferToImageBitmap();
      material.map.needsUpdate = true;
    }
  }, [changeRenderFlag]);

  return (
    <div ref={threeContainerRef} id="3d-preview-container" />
  );
};
