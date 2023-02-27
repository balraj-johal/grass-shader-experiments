import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import * as THREE from "three";

export default class Cat extends THREE.Object3D {
  constructor() {
    super();
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(__dirname + "/Cat.glb", (gltf) => {
          console.log(gltf);
          const elements = gltf.scene.children;
          const cat = elements[0];
          console.log(elements)
          const catMat = new THREE.ShaderMaterial({
            uniforms: {
              lightDirection: { value: new THREE.Vector3(15, 15, 15) },
              colors: { 
                value: [
                  new THREE.Color('#d1654f').convertLinearToSRGB(),
                  new THREE.Color('#e8b0af').convertLinearToSRGB(),
                  new THREE.Color('#eed0bd').convertLinearToSRGB(),
                  new THREE.Color('#ffffff').convertLinearToSRGB(),
                ] 
              },
              thresholds: { value: [0.2, 0.925, 1] }
            },
            vertexShader: vert,
            fragmentShader: frag,
          });
          cat.material = catMat;
          resolve(cat);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
