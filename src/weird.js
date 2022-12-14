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

const _setupScene = (context) => {
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });
  // WebGL background color
  renderer.setClearColor("#fff", 1);
  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
  camera.position.set(0, 8, -34);
  camera.lookAt(new THREE.Vector3());
  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);
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
  return {touchTracker, raycaster, pointer};
}

const _setupLighting = (scene) => {
  const directionalLight = new THREE.DirectionalLight();
  directionalLight.position.set(-30, 60, -30);
  scene.add(directionalLight);
  const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
  scene.add(ambientLight);
}

const _setupSkybox = (scene, textureLoader, gltfLoader) => {    
  gltfLoader.load(__dirname + "/Skybox/cube.glb", (gltf) => {
    textureLoader.load(__dirname + "/Skybox/tex.png", (texture) => {
      const skyboxGeom = gltf.scene.children[0].geometry;
      const skyboxMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
      });
      const skyboxMesh = new THREE.Mesh(skyboxGeom, skyboxMat);
      skyboxMesh.scale.set(500,500,500);
      skyboxMesh.rotateX(Math.PI);
      scene.add(skyboxMesh);
    });
  });
}

const _setupOurLad = (scene, gltfLoader) => {    
  gltfLoader.load(__dirname + "/Bloke/bloke2.glb", (gltf) => {
      const bloke = gltf.scene.children[0];
      bloke.name = "Bloke";
      bloke.scale.set(2.5, 2.5, 2.5);
      bloke.translateY(2.5);
      bloke.rotateX(Math.PI / 2);
      scene.add(bloke);
  });
}

const sketch = async ({ context }) => {
  const gltfLoader = new THREE.GLTFLoader();
  const textureLoader = new THREE.TextureLoader;

  const {scene, renderer, camera, controls} = _setupScene(context);
  const {touchTracker, raycaster, pointer} = _setupTouchTracker();
  _setupLighting(scene);
  _setupSkybox(scene, textureLoader, gltfLoader);
  _setupOurLad(scene, gltfLoader);

  
  const stats = threeStats();
  document.body.appendChild(stats.dom);

  // -- GROUND
  gltfLoader.load(__dirname + "/Ground/durtcube2.glb", (gltf) => {
    textureLoader.load(__dirname + "/Ground/groundTexture.jpg", (texture) => {
      const ground = gltf.scene.children[0];
      const modelledGroundMat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      const modelledGroundCube = new THREE.Mesh(ground.geometry, modelledGroundMat);
      modelledGroundCube.rotateX(Math.PI);
      modelledGroundCube.scale.set(2.1, 2, 2.1);
      modelledGroundCube.translateY(2.8);

      modelledGroundCube.name = "New Ground";
      scene.add(modelledGroundCube);
    });
  });

  // -- GROUND OLD
  const groundGeometry = new GroundGeometry();
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
      geometry: gltf.scene.children[0].geometry
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
  // boxMat.transparent = true;
  boxMat.opacity = 0;
  const boxMesh = new THREE.Mesh(boxGeom, boxMat);
  boxMesh.translateY(0.5);
  boxMesh.name = "Intersector";
  scene.add(boxMesh);

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
      // update the ray with the camera and pointer position
      raycaster.setFromCamera(pointer, camera);
      // calculate objects intersecting the ray
      const intersects = raycaster.intersectObjects(scene.children);
      for (let i = 0; i < intersects.length; i++) {
        // if (!intersects[i] || intersects[i].name !== "Intersector") return;
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
