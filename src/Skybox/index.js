import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import * as THREE from "three";

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
              topColor: { value: new THREE.Color(0xfde9e5) },
              baseColor: { value: new THREE.Color(0xfde9e5) },
            },
            vertexShader: vert,
            fragmentShader: frag,
            side: THREE.BackSide,
          });
          const mesh = new THREE.Mesh(skyboxGeom, skyboxMat);
          mesh.name = "Skybox";
          mesh.scale.set(500, 500, 500);
          resolve(mesh);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
