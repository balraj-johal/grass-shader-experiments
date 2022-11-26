/* 
  Fake box is needed as I can't raycast against my ground mesh,
  probably partly because it's displaced in a vertex shader, but
  also for some other reason as commenting out displacement 
  doesn't fix it.
*/

import * as THREE from "three";

export default class InteractionBox extends THREE.Object3D {
  constructor() {
    super();
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const boxGeom = new THREE.BoxGeometry(20, 0, 20);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        boxMat.transparent = true;
        boxMat.opacity = 0;
        const boxMesh = new THREE.Mesh(boxGeom, boxMat);
        boxMesh.translateY(0.5);
        boxMesh.name = "Intersector";
        resolve(boxMesh);
      } catch (error) {
        reject(error);
      }
    });
  }
}
