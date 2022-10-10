// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glslify = require("glslify");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const vertexShader = glslify(/* GLSL */`
  varying vec2 vUv;
  uniform float time;

  void main () {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
  }
`)
const fragmentShader = glslify(/* GLSL */`
  varying vec2 vUv;

  void main () {
    gl_FragColor = vec4(vec3(0.35, 0.5, 0), 1.0);
  }
`)

const groundMeshBasic = (width, height, color) => {
  const geometry = new THREE.PlaneGeometry(width, height, width, height);

  // Setup a material
  const material = new THREE.MeshBasicMaterial({ 
    color: color, 
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  // Setup a mesh with geometry + material
  mesh.rotateX(-Math.PI / 2);
  return mesh;
}

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#fff", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  // const camera = new THREE.OrthographicCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  const ground = groundMeshBasic(3, 3, 0x009900);
  ground.position.setY(-1);
  scene.add(ground);

  
  const dummy = new THREE.Object3D();
  const GRASS_NUM = 5;
  const count = Math.pow(GRASS_NUM, 3);

  // Grass stuff
  // const grassGeometry = new THREE.PlaneGeometry(0.1, 1, 1, 4);
  // const grassGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
  const grassGeometry = new THREE.BufferGeometry();
  const points = [
      new THREE.Vector3(-1, 1, -1),//c
      new THREE.Vector3(-1, -1, 1),//b
      new THREE.Vector3(1, 1, 1),//a   
  
      new THREE.Vector3(1, 1, 1),//a    
      new THREE.Vector3(1, -1, -1),//d  
      new THREE.Vector3(-1, 1, -1),//c
  
      new THREE.Vector3(-1, -1, 1),//b
      new THREE.Vector3(1, -1, -1),//d  
      new THREE.Vector3(1, 1, 1),//a
  
      new THREE.Vector3(-1, 1, -1),//c
      new THREE.Vector3(1, -1, -1),//d    
      new THREE.Vector3(-1, -1, 1),//b
  ]
  
  grassGeometry.setFromPoints(points)
  grassGeometry.computeVertexNormals()

  grassGeometry.translate(0, 0.5, 0);
  const grassMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: {
        value: 0
      }
    },
    side: THREE.DoubleSide
  })
  const baseGrassMesh = new THREE.InstancedMesh(grassGeometry, grassMaterial, count);
  baseGrassMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
  // const baseGrassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
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

      if (baseGrassMesh) {
        let i = 0;
        const offset = ( GRASS_NUM - 1 ) / 2;
        for ( let x = 0; x < GRASS_NUM; x ++ ) {
          for ( let y = 0; y < GRASS_NUM; y ++ ) {
            for ( let z = 0; z < GRASS_NUM; z ++ ) {
              // dummy.position.set(0,0,0);
              // dummy.position.set( offset * x / 10, offset * y / 10, offset * z / 10 );
              // dummy.position.set( offset - x, offset - y, offset - z );
              dummy.position.set( 30, 100, z * 1 );
              // dummy.rotation.y = (  );
              // dummy.rotation.z = dummy.rotation.y * 2;

              dummy.updateMatrix();

              baseGrassMesh.setMatrixAt( i ++, dummy.matrix );
            }
          }
        }
        baseGrassMesh.instanceMatrix.needsUpdate = true;
      }
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};


canvasSketch(sketch, settings);
