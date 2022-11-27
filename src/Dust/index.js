import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import * as THREE from "three";
import DustGeometry from "./DustGeometry";

export default class Dust extends THREE.Object3D {
  constructor() {
    super();
  }

  getPoints() {
    return new Promise((resolve, reject) => {
      try {
        const geometry = new DustGeometry({
          count: 200,
          areaSize: 20,
        });
        this.material = new THREE.PointsMaterial({
          size: 1.0,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        // const mesh = new THREE.InstancedMesh(
        //   geometry,
        //   this.material,
        //   this.count
        // );

        const points = new THREE.Points(geometry, this.material);
        // mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
        // mesh.name = "Rain";
        // mesh.translateY(2.0);
        resolve(points);
      } catch (error) {
        reject(error);
      }
    });
  }
}
