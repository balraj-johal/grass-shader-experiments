import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import GroundGeometry from "./GroundGeometry";

import * as THREE from "three";

export default class Ground extends THREE.Object3D {
  noiseTex;
  touchTex;

  constructor(params) {
    super();

    this.noiseTex = params.noiseTex;
    this.touchTex = params.touchTex;
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const geometry = new GroundGeometry();
        const material = new THREE.ShaderMaterial({
          vertexShader: vert,
          fragmentShader: frag,
          uniforms: {
            noiseTex: { value: this.noiseTex },
            touchTex: { value: this.touchTex },
          },
          side: THREE.DoubleSide,
        });
        material.uniformsNeedUpdate = true;

        const mesh = new THREE.InstancedMesh(geometry, material, 1);
        mesh.name = "Old Ground";
        mesh.rotateX(Math.PI / 2);
        resolve(mesh);
      } catch (error) {
        reject(error);
      }
    });
  }
}
