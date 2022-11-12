import * as THREE from "three";

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

require("three/examples/js/controls/OrbitControls.js");
const threeStats = require("three/examples/js/libs/stats.min.js");

import canvasSketch from "canvas-sketch";

import grassFrag from "./Grass/fragment.glsl";
import grassVert from "./Grass/vertex.glsl";
import GrassGeometry from "./Grass/GrassGeometry";

import groundFrag from "./Ground/fragment.glsl";
import groundVert from "./Ground/vertex.glsl";
import GroundGeometry from "./Ground/GroundGeometry";
import RenderTexture from "./Interaction/RenderTexture";

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
};

const GRASS_COUNT = 20000;

const degreesToRads = (degree) => {
  return (degree * Math.PI) / 180;
};

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
  camera.position.set(0, 8, -34);
  camera.lookAt(new THREE.Vector3());
  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);
  // set max vertical camera rotation from top down
  controls.minPolarAngle = degreesToRads(45);
  controls.maxPolarAngle = degreesToRads(85);
  const scene = new THREE.Scene();
  
  const loader = new THREE.GLTFLoader();

  // -- INTERACTION
  let touchTracker = new RenderTexture();

  // get raycaster
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  window.addEventListener("pointermove", onPointerMove);

  // -- GROUND
  const groundGeometry = new GroundGeometry();
  // groundGeometry.computeVertexNormals();
  const noiseTex = new THREE.TextureLoader().load(
    "./textures/noiseTexture.png"
  );
  const groundMaterial = new THREE.ShaderMaterial({
    vertexShader: groundVert,
    fragmentShader: groundFrag,
    uniforms: {
      noiseTex: { value: noiseTex },
      touchTex: { value: touchTracker.texture },
    },
    side: THREE.DoubleSide,
  });
  groundMaterial.uniformsNeedUpdate = true;
  const groundMesh = new THREE.InstancedMesh(groundGeometry, groundMaterial, 1);
  groundMesh.rotateX(Math.PI / 2);
  // scene.add(groundMesh);

  // -- DIRTCUBE GROUND
  const textureLoader = new THREE.TextureLoader;
  loader.load(__dirname + "/Ground/durtcube.glb", (gltf) => {
    const ground = gltf.scene.children[0];
    textureLoader.load(__dirname + "/Ground/groundTexture.jpg", (texture) => {
      const ground = gltf.scene.children[0];
      const groundMaterial2 = new THREE.MeshStandardMaterial({
        map: texture
      });
      const groundMesh2 = new THREE.Mesh(ground.geometry, groundMaterial2);
      groundMesh2.rotateX(Math.PI);
      // scene.add(groundMesh2);
    });
  });

  // -- GRASS
  let grassMaterial;
  loader.load(__dirname + "/Grass/GrassBlade.glb", (gltf) => {
    const grassGeometry = new GrassGeometry({
      grassCount: GRASS_COUNT,
      scene,
      geometry: gltf.scene.children[0].geometry
    });

    grassGeometry.attributes["offset"].needsUpdate;
    grassGeometry.attributes["scale"].needsUpdate;
    grassGeometry.attributes["color"].needsUpdate;
    grassGeometry.attributes["angle"].needsUpdate;

    let uniforms = {
      time: { value: 0 },
      noiseTex: { value: noiseTex },
      touchTex: { value: touchTracker.texture },
    };
    uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib["lights"],
      uniforms
    ]);

    grassMaterial = new THREE.ShaderMaterial({
      vertexShader: grassVert,
      fragmentShader: grassFrag,
      uniforms,
      side: THREE.DoubleSide,
      lights: true
    });

    grassMaterial.clipping = false;
    grassMaterial.uniformsNeedUpdate = true;

    const grassMesh = new THREE.InstancedMesh(
      grassGeometry,
      grassMaterial,
      GRASS_COUNT
    );
    grassMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    scene.add(grassMesh);
  });

  const light = new THREE.DirectionalLight();
  light.position.set(-30, 60, -30);
  scene.add(light);


  // -- INTERSECTION BOX
  /* 
    Fake box is needed as I can't raycast against my ground mesh,
    probably partly because it's displaced in a vertex shader, but
    also for some other reason as commenting out displacement 
    doesn't fix it.
  */
  const boxGeom = new THREE.BoxGeometry(20, 0, 20);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  boxMat.transparent = true;
  boxMat.opacity = 0;
  const boxMesh = new THREE.Mesh(boxGeom, boxMat);
  boxMesh.translateY(0.5);
  scene.add(boxMesh);

  // -- STATS
  const stats = threeStats();
  document.body.appendChild(stats.dom);

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
      if (grassMaterial?.uniforms) grassMaterial.uniforms.time.value = time;

      touchTracker.update();

      // -- CHECK RAYCAST
      // update the ray with the camera and pointer position
      raycaster.setFromCamera(pointer, camera);
      // calculate objects intersecting the ray
      const intersects = raycaster.intersectObjects(scene.children);
      for (let i = 0; i < intersects.length; i++) {
        if (!intersects[i]) return;
        const uvCoords = {
          x: intersects[i].uv.x,
          y: 1 - intersects[i].uv.y,
        };
        touchTracker.addTouch(uvCoords);
      }

      controls.update();
      stats.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
