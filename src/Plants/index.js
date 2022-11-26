import { getSavedPlants } from "../utils/plants";

import * as THREE from "three";

export default class Plants extends THREE.Object3D {
  constructor() {
    super();
  }

  getAll() {
    return new Promise((resolve, reject) => {
      try {
        const root = new THREE.Object3D();
        for (const plant of getSavedPlants()) {
          const plantGeom = new THREE.BoxGeometry(3, 3, 3);
          const plantMat = new THREE.MeshStandardMaterial({ color: 0x99ff00 });
          const plantMesh = new THREE.Mesh(plantGeom, plantMat);
          plantMesh.name = "Plant";
          plantMesh.position.set(
            plant.position.x,
            plant.position.y,
            plant.position.z
          );
          root.add(plantMesh);
        }
        resolve(root);
      } catch (error) {
        reject(error);
      }
    });
  }
}
