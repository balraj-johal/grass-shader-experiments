import { getSavedPlants } from "../../utils/plants";

import * as THREE from "three";

import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

export default class Plant extends THREE.Object3D {
  material;
  type;

  constructor(params) {
    super();

    this.type = params.type;
  }

  updateTime(time) {
    if (!this.material) return;
    this.material.uniforms.time.value = time;
  }

  generatePlantMesh() {
    let geometry;
    let color;
    switch (this.type) {
      case "Red":
        geometry = new THREE.PlaneGeometry(0.2, 2.0, 2.0, 5.0);
        color = 0x990000;
        break;
      default:
        geometry = new THREE.PlaneGeometry(0.2, 2.0, 2.0, 5.0);
        color = 0x999900;
        break;
    }
    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        time: { value: 0 },
        // noiseTex: { value: this.noiseTex },
        // touchTex: { value: this.touchTex },
        // waterTex: { value: this.waterTex },
        // color: new THREE.Color(color),
      },
      side: THREE.DoubleSide,
    });
    // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    return new THREE.Mesh(geometry, this.material);
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const mesh = this.generatePlantMesh();
        resolve(mesh);
      } catch (error) {
        reject(error);
      }
    });
  }
}
