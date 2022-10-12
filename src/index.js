import * as THREE from "three";

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

import canvasSketch from "canvas-sketch";

import grassFrag from "./Grass/fragment.glsl";
import grassVert from "./Grass/vertex.glsl";
import GrassGeometry from "./Grass/GrassGeometry";

import groundFrag from "./Ground/fragment.glsl";
import groundVert from "./Ground/vertex.glsl";
import GroundGeometry from "./Ground/GroundGeometry";

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
};

const GRASS_COUNT = 5000;

const sketch = async ({ context }) => {
  // -- SETUP
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });
  // WebGL background color
  renderer.setClearColor("#fff", 1);
  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(-1, 6, -12);
  camera.lookAt(new THREE.Vector3());
  // Setup camera controller
  // const controls = new THREE.OrbitControls(camera, context.canvas);
  const scene = new THREE.Scene();


  // -- GROUND
  const groundGeometry = new GroundGeometry();
  const noiseTex = new THREE.TextureLoader().load( "./textures/noiseTexture.png" );
  const groundMaterial = new THREE.ShaderMaterial({
    vertexShader: groundVert,
    fragmentShader: groundFrag,
    uniforms: {
      noiseTex: { value: noiseTex },
    },
    side: THREE.DoubleSide,
  });
  groundMaterial.uniformsNeedUpdate = true;
  const groundMesh = new THREE.InstancedMesh(groundGeometry, groundMaterial, 1);
  groundMesh.rotateX(Math.PI / 2);
  scene.add(groundMesh);


  // -- GRASS
  const grassGeometry = new GrassGeometry();
  grassGeometry.computeVertexNormals(); // TODO: is this useful?

  grassGeometry.attributes["offset"].needsUpdate;
  grassGeometry.attributes["scale"].needsUpdate;
  grassGeometry.attributes["color"].needsUpdate;
  grassGeometry.attributes["angle"].needsUpdate;

  grassGeometry.translate(0, 0.5, 0);
  const grassMaterial = new THREE.ShaderMaterial({
    vertexShader: grassVert,
    fragmentShader: grassFrag,
    uniforms: { time: { value: 0 } },
    side: THREE.DoubleSide,
  });
  grassMaterial.clipping = false;
  const grassMesh = new THREE.InstancedMesh(
    grassGeometry,
    grassMaterial,
    GRASS_COUNT
  );
  grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
  // scene.add(grassMesh);


  // -- RENDER LOOP
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
