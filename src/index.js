import * as THREE from "three";

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

import canvasSketch from "canvas-sketch";

import fragmentShader from "./Grass/fragment.glsl";
import vertexShader from "./Grass/vertex.glsl";
import GrassGeometry from "./Grass/GrassGeometry";

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
};

const groundMeshBasic = (width, height, color) => {
  const geometry = new THREE.PlaneGeometry(width, height, width, height);

  // Setup a material
  const material = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  // Setup a mesh with geometry + material
  mesh.rotateX(-Math.PI / 2);
  return mesh;
};

const GRASS_COUNT = 2000;

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  renderer.setClearColor("#fff", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(-1, 3, -6);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  // const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  const ground = groundMeshBasic(10, 10, 0x009900);
  ground.position.setY(0);
  scene.add(ground);

  // Grass stuff
  const geometry = new GrassGeometry();
  geometry.computeVertexNormals(); // TODO: is this useful?

  geometry.attributes["offset"].needsUpdate;
  geometry.attributes["scale"].needsUpdate;
  geometry.attributes["color"].needsUpdate;
  geometry.attributes["angle"].needsUpdate;

  geometry.translate(0, 0.5, 0);
  const grassMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { time: { value: 0 } },
    side: THREE.DoubleSide,
  });
  const baseGrassMesh = new THREE.InstancedMesh(
    geometry,
    grassMaterial,
    GRASS_COUNT
  );
  baseGrassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
  scene.add(baseGrassMesh);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      grassMaterial.uniforms.time.value = time;
      grassMaterial.uniformsNeedUpdate = true;

      // controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      // controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
