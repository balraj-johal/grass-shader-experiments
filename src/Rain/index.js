import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import * as THREE from "three";
import RainGeometry from "./RainGeometry";

export default class Rain extends THREE.Object3D {
  width;
  height;
  count;
  material;
  waterTex;

  constructor(params) {
    super();

    this.size = 0.01;
    this.height = 0.5;
    this.count = params.count;
    this.waterTex = params.waterTex;
  }

  updateTime(time) {
    if (!this.material) return;
    this.material.uniforms.time.value = time;
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const baseGeometry = new THREE.BoxGeometry(
          this.size,
          this.height,
          this.size
        );
        const geometry = new RainGeometry({
          count: this.count,
          geometry: baseGeometry,
        });
        this.material = new THREE.ShaderMaterial({
          uniforms: {
            topColor: { value: new THREE.Color(0xdef3ef) },
            baseColor: { value: new THREE.Color(0xafc6c1) },
            time: { value: 0 },
            waterTex: { value: this.waterTex },
          },
          vertexShader: vert,
          fragmentShader: frag,
          transparent: true,
        });
        const mesh = new THREE.InstancedMesh(
          geometry,
          this.material,
          this.count
        );
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
        mesh.name = "Rain";
        mesh.translateY(2.0);
        resolve(mesh);
      } catch (error) {
        reject(error);
      }
    });
  }
}
