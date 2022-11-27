import { getSavedPlants } from "../utils/plants";

import * as THREE from "three";

import Plant from "./Plant";

export default class Plants extends THREE.Object3D {
  allPlants;

  constructor() {
    super();

    this.allPlants = [];
  }

  updateTime(time) {
    for (const plant of this.allPlants) {
      plant.material.uniforms.time.value = time;
    }
  }

  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const root = new THREE.Object3D();
        for (const plant of getSavedPlants()) {
          const mesh = await new Plant({ type: plant.type }).getMesh();
          mesh.translateY(1.5);
          root.add(mesh);
          this.allPlants.push(mesh);
        }
        resolve(root);
      } catch (error) {
        reject(error);
      }
    });
  }
}
