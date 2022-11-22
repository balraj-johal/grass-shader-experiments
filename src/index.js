import * as THREE from "three";

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

require("three/examples/js/controls/OrbitControls.js");
const threeStats = require("three/examples/js/libs/stats.min.js");

import { degreesToRads } from "./utils";
import rand from "./utils/rand";

import canvasSketch from "canvas-sketch";

import grassFrag from "./Grass/fragment.glsl";
import grassVert from "./Grass/vertex.glsl";
import GrassGeometry from "./Grass/GrassGeometry";

import groundFrag from "./Ground/fragment.glsl";
import groundVert from "./Ground/vertex.glsl";
import GroundGeometry from "./Ground/GroundGeometry";
import RenderTexture from "./Interaction/RenderTexture";
import Skybox from "./Skybox/Skybox";

const settings = {
  animate: true,
  context: "webgl",
};

const getSavedPlants = () => {
  let saved = window.localStorage.getItem("SAVED_PLANTS");
  if (!saved) {
    saved = [];
    window.localStorage.setItem("SAVED_PLANTS", saved);
    return saved;
  }
  return JSON.parse(saved);
}

const savePlant = (plant) => {
  let saved = window.localStorage.getItem("SAVED_PLANTS");
  if (!saved) {
    saved = [];
  } else {
    saved = JSON.parse(saved);
  }
  saved.push(plant);
  window.localStorage.setItem("SAVED_PLANTS", JSON.stringify(saved));
}

const mapUVToWorld = (coord) => {
  return (coord * 20) - 10;
}

const state = {
  clicked: false,
  savedPlants: getSavedPlants(),
}

const GRASS_COUNT = 20000;


const _setupScene = (context) => {
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });
  // WebGL background color
  renderer.setClearColor("#fff", 1);
  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
  camera.position.set(0, 8, -34);
  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);
  controls.target = new THREE.Vector3(0.0, 3.0, 0.0);
  // set max vertical camera rotation from top down
  controls.minPolarAngle = degreesToRads(45);
  controls.maxPolarAngle = degreesToRads(85);
  const scene = new THREE.Scene();

  return {scene, renderer, camera, controls};
}

const _setupTouchTracker = () => {
  const touchTracker = new RenderTexture();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("click", () => {
    if (!state.clicked) state.clicked = true;
  })
  return {touchTracker, raycaster, pointer};
}

const _setupLighting = (scene) => {
  const directionalLight = new THREE.DirectionalLight();
  directionalLight.position.set(-30, 60, -30);
  scene.add(directionalLight);
  const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
  scene.add(ambientLight);
}

const sketch = async ({ context }) => {
  const gltfLoader = new THREE.GLTFLoader();
  const textureLoader = new THREE.TextureLoader;

  const {scene, renderer, camera, controls} = _setupScene(context);
  const {touchTracker, raycaster, pointer} = _setupTouchTracker();
  _setupLighting(scene);

  
  const stats = threeStats();
  document.body.appendChild(stats.dom);

  // -- GROUND OLD
  const groundGeometry = new GroundGeometry();
  const noiseTex = textureLoader.load(
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
  const groundPlane = new THREE.InstancedMesh(groundGeometry, groundMaterial, 1);
  groundPlane.name = "Old Ground";
  groundPlane.rotateX(Math.PI / 2);
  scene.add(groundPlane);

  // -- GRASS
  let grassMaterial;
  gltfLoader.load(__dirname + "/Grass/GrassBlade.glb", (gltf) => {
    const grassGeometry = new GrassGeometry({
      grassCount: GRASS_COUNT,
      scene,
      geometry: gltf.scene.children[0].geometry,
    });

    grassGeometry.attributes["offset"].needsUpdate;
    grassGeometry.attributes["scale"].needsUpdate;
    grassGeometry.attributes["color"].needsUpdate;
    grassGeometry.attributes["angle"].needsUpdate;

    const uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib["lights"],
      {
        time: { value: 0 },
        noiseTex: { value: noiseTex },
        touchTex: { value: touchTracker.texture },
      }
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
  boxMesh.name = "Intersector";
  scene.add(boxMesh);

  // -- SUN DEBUGGER
  const sunGeom = new THREE.BoxGeometry(1, 1, 1);
  const sunMat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
  const sunMesh = new THREE.Mesh(sunGeom, sunMat);
  sunMesh.name = "Sun";
  sunMesh.position.set(10.5, 10.2, 11.0);
  scene.add(sunMesh);

  const plantsRoot = new THREE.Object3D();
  for (const plant of state.savedPlants) {
    const plantGeom = new THREE.BoxGeometry(3, 3, 3);
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x99ff00 });
    const plantMesh = new THREE.Mesh(plantGeom, plantMat);
    plantMesh.position.set(
      plant.position.x,
      plant.position.y,
      plant.position.z,
      );
    plantsRoot.add(plantMesh);
  }
  scene.add(plantsRoot);


  const skybox = new Skybox();
  skybox.getMesh().then(mesh => scene.add(mesh));

  return {
    // Handle resize events
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render scene
    render({ time }) {
      if (grassMaterial?.uniforms) grassMaterial.uniforms.time.value = time;

      touchTracker.update();

      // -- CHECK RAYCAST
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      for (let i = 0; i < intersects.length; i++) {
        // if (!intersects[i] || intersects[i].name !== "Intersector") return;
        const uvCoords = {
          x: intersects[i].uv.x,
          y: 1 - intersects[i].uv.y,
        };
        touchTracker.addTouch(uvCoords);
        if (state.clicked) {
          savePlant({
            position: {
              x: mapUVToWorld(uvCoords.x),
              y: 0,
              z: mapUVToWorld(uvCoords.y),
            },
          })
          state.clicked = false;
        }
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
