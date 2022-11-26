import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

export default class Skybox extends THREE.Object3D {
  constructor() {
    super();
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(__dirname + "/Skybox.glb", (gltf) => {
          const skyboxGeom = gltf.scene.children[0].geometry;
          const skyboxMat = new THREE.ShaderMaterial({
            uniforms: {
              topColor: { value: new THREE.Color(0xdef3ef) },
              baseColor: { value: new THREE.Color(0xafc6c1) },
            },
            vertexShader: vert,
            fragmentShader: frag,
            side: THREE.BackSide,
          });
          const mesh = new THREE.Mesh(skyboxGeom, skyboxMat);
          mesh.name = "Skybox";
          mesh.scale.set(50, 50, 50);
          resolve(mesh);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
