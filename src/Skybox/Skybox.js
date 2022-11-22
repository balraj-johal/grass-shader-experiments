import {  } from "three";

const AREA_SIZE = 20;
const RESOLUTION = 2;
export default class Skybox extends THREE.Object3D {
  constructor(scene) {
    super();
  }

   getMesh() {
    return new Promise((resolve, reject) => {
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load(__dirname + "/GradientUVCube.glb", (gltf) => {
        const skyboxGeom = gltf.scene.children[0].geometry;
        const testGeom = new THREE.BoxGeometry(3, 3, 3);
        const skyboxMat = new THREE.ShaderMaterial({
          uniforms: {
            color1: {
              value: new THREE.Color("red")
            },
            color2: {
              value: new THREE.Color("purple")
            }
          },
          vertexShader: `
            varying vec2 vUv;
        
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
          
            varying vec2 vUv;
            
            void main() {
              float mixer = smoothstep(0.364, 0.660, vUv.y);
              gl_FragColor = vec4(mix(color1, color2, mixer), 1.0);
            }
          `,
          side: THREE.BackSide
        });
        const testMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const mesh = new THREE.Mesh(skyboxGeom, skyboxMat);
        // const mesh = new THREE.Mesh(testGeom, testMat);
        mesh.scale.set(50,50,50);
        console.log("awaited", mesh);
        resolve(mesh);
      });
    })
  }
}
