import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import * as THREE from "three";
const speed = 3;

export default class Cat extends THREE.Object3D {
  mixer;
  clock;
  cat;

  constructor() {
    super();
    this.clock = new THREE.Clock();
  }

  updateAnimation() {
    if (!this.mixer) return;
    const delta = this.clock.getDelta();
    this.mixer.update(delta);

    this.cat.position.set(0, 0, this.cat.position.z + speed * delta);
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(__dirname + "/catanimated.glb", (gltf) => {
          console.log(gltf);
          const elements = gltf.scene.children;
          const cat = elements[0];

          this.mixer = new THREE.AnimationMixer(gltf.scene);
          const walkClip = THREE.AnimationClip.findByName(
            gltf.animations,
            "a_walk"
          );
          const action = this.mixer.clipAction(walkClip);
          console.log(this.mixer);
          action.play();

          console.log(cat);

          const catMat = new THREE.ShaderMaterial({
            uniforms: {
              lightDirection: { value: new THREE.Vector3(15, 15, 15) },
              colors: {
                value: [
                  new THREE.Color("#d1654f").convertLinearToSRGB(),
                  new THREE.Color("#e8b0af").convertLinearToSRGB(),
                  new THREE.Color("#eed0bd").convertLinearToSRGB(),
                  new THREE.Color("#ffffff").convertLinearToSRGB(),
                ],
              },
              thresholds: { value: [0.2, 0.925, 1] },
            },
            vertexShader: vert,
            fragmentShader: frag,
          });
          cat.material = catMat;
          this.cat = cat;
          resolve(cat);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
