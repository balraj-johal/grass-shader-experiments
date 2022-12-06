import * as THREE from "three";
// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

require("three/examples/js/controls/OrbitControls.js");
const threeStats = require("three/examples/js/libs/stats.min.js");

import canvasSketch from "canvas-sketch";

import RenderTexture from "./Interaction/RenderTexture";
import Skybox from "./Skybox";
import Ground from "./Ground";
import InteractionBox from "./Ground/InteractionBox";
import Grass from "./Grass";
import Plants from "./Plants";
import Rain from "./Rain";
import Dust from "./Dust";

import { degreesToRads, mapUVToWorld } from "./utils/assorted";
import { getSavedPlants, updateLastAction, savePlant } from "./utils/plants";
import { isNewDay } from "./utils/date";

const InteractionState = {
  None: "None",
  Watering: "Watering",
  Planting: "Planting",
};

const state = {
  clicked: false,
  savedPlants: getSavedPlants(),
  interactionState: InteractionState.None,
  touchTracker: null,
  wateringTracker: null,
};

const _setupScene = (context) => {
  const renderer = new THREE.WebGLRenderer({ canvas: context.canvas });
  renderer.setClearColor("#fff", 1);

  // Setup camera controller
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
  camera.position.set(0, 8, -34);
  const controls = new THREE.OrbitControls(camera, context.canvas);
  controls.target = new THREE.Vector3(0.0, 3.0, 0.0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.2;
  controls.enableDamping = true;

  // pause auto rotate on interact
  if (state.interactionState !== InteractionState.None) {
    controls.autoRotate = false;
  } else {
    controls.autoRotate = true;
  }
  // document.querySelector("canvas").addEventListener("click", () => {
  //   controls.autoRotate = false;
  //   setTimeout(() => {
  //     controls.autoRotate = true;
  //   }, 1500);
  // });

  // set max vertical camera rotation from top down
  controls.minPolarAngle = degreesToRads(40);
  controls.maxPolarAngle = degreesToRads(80);

  const scene = new THREE.Scene();
  return { scene, renderer, camera, controls };
};

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
  });
  return { touchTracker, raycaster, pointer };
};

const _setupLighting = (scene) => {
  const directionalLight = new THREE.DirectionalLight();
  directionalLight.position.set(-30, 60, -30);
  scene.add(directionalLight);
  const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
  scene.add(ambientLight);
};

const _checkInteraction = (intersects) => {
  switch (state.interactionState) {
    case InteractionState.None:
      return;
    case InteractionState.Planting:
      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.name === "Intersector") {
          const uvCoords = { x: intersects[i].uv.x, y: 1 - intersects[i].uv.y };
          state.touchTracker.addTouch(uvCoords);
          if (state.clicked && isNewDay()) {
            savePlant({
              position: {
                x: mapUVToWorld(uvCoords.x),
                y: 0.0,
                z: mapUVToWorld(uvCoords.y),
              },
              type: "Red",
            });
            updateLastAction();
            state.clicked = false;
          }
        }
      }
      break;
    case InteractionState.Watering:
      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.name === "Intersector") {
          const uvCoords = { x: intersects[i].uv.x, y: 1 - intersects[i].uv.y };
          state.wateringTracker.drawTouch(uvCoords, false);
        }
      }
      break;
    default:
      break;
  }
};

const refreshStorage = () => {
  localStorage.setItem("WATER_TEX", "");
};

const sketch = async ({ context }) => {
  if (isNewDay()) refreshStorage();
  // -- setup
  const textureLoader = new THREE.TextureLoader();
  const noiseTex = textureLoader.load("./textures/noiseTexture.png");

  const { scene, renderer, camera, controls } = _setupScene(context);
  const { touchTracker, raycaster, pointer } = _setupTouchTracker();
  state.touchTracker = touchTracker;
  state.wateringTracker = new RenderTexture(false, "wateringTexture");

  document.addEventListener('keyup', (event) => {
    const keyName = event.key;
    if (keyName === 'p') {
      state.interactionState = InteractionState.Planting;
      console.log("Planting");
    } else if (keyName === 'w') {
      state.interactionState = InteractionState.Watering;
      console.log("Watering");
    }
  }, false);

  _setupLighting(scene);

  const stats = threeStats();
  document.body.appendChild(stats.dom);

  // -- add scene elements
  const skybox = new Skybox();
  skybox.getMesh().then((mesh) => scene.add(mesh));

  const ground = new Ground({
    noiseTex,
    touchTex: touchTracker.texture,
  });
  ground.getMesh().then((mesh) => scene.add(mesh));

  const interactionBox = new InteractionBox();
  interactionBox.getMesh().then((mesh) => scene.add(mesh));

  const grass = new Grass({
    noiseTex,
    touchTex: touchTracker.texture,
    waterTex: state.wateringTracker.texture,
  });
  grass.getMesh().then((mesh) => scene.add(mesh));

  const plants = new Plants();
  plants.getAll().then((root) => scene.add(root));

  const rain = new Rain({
    count: 1200,
    waterTex: state.wateringTracker.texture,
  });
  rain.getMesh().then((mesh) => scene.add(mesh));

  // const dust = new Dust({
  //   count: 150,
  //   waterTex: state.wateringTracker.texture,
  // });
  // dust.getPoints().then((points) => scene.add(points));

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },

    render({ time }) {
      // update animated objects
      grass.updateTime(time);
      rain.updateTime(time);
      plants.updateTime(time);

      // handle raycast interactions
      raycaster.setFromCamera(pointer, camera);
      _checkInteraction(raycaster.intersectObjects(scene.children));
      state.clicked = false;

      // update interaction canvases
      state.wateringTracker.update();
      touchTracker.update();

      // general
      controls.update();
      stats.update();
      renderer.render(scene, camera);
    },

    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

// launch app
canvasSketch(sketch, {
  animate: true,
  context: "webgl",
});
