import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import * as THREE from "three";

export default class Tree extends THREE.Object3D {
  constructor() {
    super();
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(__dirname + "/Tree.glb", (gltf) => {
          console.log(gltf);
          const treeRoot = new THREE.Object3D();
          const elements = gltf.scene.children;
          const Treetop0 = elements[0];
          const Treetop1 = elements[1];
          const treetopMat = new THREE.ShaderMaterial({
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
          Treetop0.material = treetopMat;
          Treetop1.material = treetopMat;
          const Trunk = elements[2];
          const trunkMat = new THREE.ShaderMaterial({
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
          Trunk.material = trunkMat;
          treeRoot.add(Trunk);
          treeRoot.add(Treetop0);
          treeRoot.add(Treetop1);
          resolve(treeRoot);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
