export default class Skybox extends THREE.Object3D {
  constructor() {
    super();
  }

   getMesh() {
    return new Promise((resolve, reject) => {
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load(__dirname + "/GradientUVCube.glb", (gltf) => {
        const skyboxGeom = gltf.scene.children[0].geometry;
        const skyboxMat = new THREE.ShaderMaterial({
          uniforms: {
            topColor: {
              value: new THREE.Color(0xDEF3EF)
            },
            baseColor: {
              value: new THREE.Color(0xAFC6C1)
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
            uniform vec3 topColor;
            uniform vec3 baseColor;
          
            varying vec2 vUv;
            
            void main() {
              float mixer = smoothstep(0.364, 0.660, vUv.y);
              gl_FragColor = vec4(mix(topColor, baseColor, mixer), 1.0);
            }
          `,
          side: THREE.BackSide
        });
        const mesh = new THREE.Mesh(skyboxGeom, skyboxMat);
        // const mesh = new THREE.Mesh(testGeom, testMat);
        mesh.scale.set(50,50,50);
        resolve(mesh);
      });
    })
  }
}
