import * as THREE from "three";

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

import canvasSketch from "canvas-sketch";
import glslify from "glslify";

import GrassGeometry from "./GrassGeometry/GrassGeometry";

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
};

const vertexShader = glslify(/* GLSL */ `
  attribute float ref;
  attribute float scale;
  attribute vec3 offset;
  attribute float angle;
  attribute float color;

  uniform float time;
  uniform float count;

  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec2 vPosUV;
  varying float vOpacity;
  varying float vParticleType;
  varying float vAngle;
  varying float vStreak;

  #define PI 3.1415926



  // SIMPLEX NOISE
  // https://thebookofshaders.com/edit.php#11/2d-snoise-clear.frag
  
  //
  // Description : GLSL 2D simplex noise function
  //      Author : Ian McEwan, Ashima Arts
  //  Maintainer : ijm
  //     Lastmod : 20110822 (ijm)
  //     License :
  //  Copyright (C) 2011 Ashima Arts. All rights reserved.
  //  Distributed under the MIT License. See LICENSE file.
  //  https://github.com/ashima/webgl-noise
  //
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
  
      // Precompute values for skewed triangular grid
      const vec4 C = vec4(0.211324865405187,
                          // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,
                          // 0.5*(sqrt(3.0)-1.0)
                          -0.577350269189626,
                          // -1.0 + 2.0 * C.x
                          0.024390243902439);
                          // 1.0 / 41.0
  
      // First corner (x0)
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
  
      // Other two corners (x1, x2)
      vec2 i1 = vec2(0.0);
      i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
      vec2 x1 = x0.xy + C.xx - i1;
      vec2 x2 = x0.xy + C.zz;
  
      // Do some permutations to avoid
      // truncation effects in permutation
      i = mod289(i);
      vec3 p = permute(
              permute( i.y + vec3(0.0, i1.y, 1.0))
                  + i.x + vec3(0.0, i1.x, 1.0 ));
  
      vec3 m = max(0.5 - vec3(
                          dot(x0,x0),
                          dot(x1,x1),
                          dot(x2,x2)
                          ), 0.0);
  
      m = m*m ;
      m = m*m ;
  
      // Gradients:
      //  41 pts uniformly over a line, mapped onto a diamond
      //  The ring size 17*17 = 289 is close to a multiple
      //      of 41 (41*7 = 287)
  
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
  
      // Normalise gradients implicitly by scaling m
      // Approximation of: m *= inversesqrt(a0*a0 + h*h);
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);
  
      // Compute final noise value at P
      vec3 g = vec3(0.0);
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
      return 130.0 * dot(m, g);
  }



  void main () {
    // -- apply z/y/z offset
	  vec3 transformed = position + offset;
    vec4 mvPosition = modelViewMatrix * vec4( transformed.xyz, 1.0 ); //modelViewPosition

    // -- apply scale
    float s = scale * 1.0;
    mvPosition.xyz += position * s;


    //
    float bendScale = 1.5;
    float yInfluence = pow(uv.y, bendScale);

    // -- sin wave displacement
    // float timeScale = 2.5;
    // float wavePower = 0.25;
    // uv.y ensures displacement is not applied to root
    // mvPosition.x += sin(time/timeScale) * wavePower * yInfluence;


    //TODO: displacement is same on all channels, mix two noise textures?

    // -- generate simplex noise displacement
    vec3 displacement = vec3(0.0);
    float noiseScale = 0.0825;
    float noiseTimeScale = 0.25;
    displacement = vec3(snoise(mvPosition.xz * noiseScale + (time * noiseTimeScale))*0.500);

    // -- apply displacement
    mvPosition.xz += displacement.x * yInfluence;

    // -- finalise position
  	gl_Position = projectionMatrix * mvPosition;

    vUv = uv;
  }
`);
const fragmentShader = glslify(/* GLSL */ `
  varying vec2 vUv;

  void main () {
    gl_FragColor = vec4(vec3(0.35, 0.5, 0), 1.0);
  }
`);

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
  const baseGrassMesh = new THREE.InstancedMesh(geometry, grassMaterial, GRASS_COUNT);
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
