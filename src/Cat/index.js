import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import * as THREE from "three";
const speed = 5;

const lerp = (a, b, t) => {
  return a + (b - a) * t;
};

export default class Cat extends THREE.Object3D {
  mixer;
  animationBlendSpeed = 0.15;

  walkAction;
  walking;

  clock;
  cat;

  targetRotation = 0;
  targetPosition = {
    x: 0,
    z: 0,
  };
  moving = false;

  constructor() {
    super();
    this.clock = new THREE.Clock();
  }

  setTargetRotation(angle) {
    this.targetRotation = angle * (Math.PI / 180);
  }

  setTargetPosition(x, z) {
    this.targetPosition = {
      x: x,
      z: z,
    };
  }

  updateAnimation() {
    if (!this.mixer) return;
    const delta = this.clock.getDelta();
    this.mixer.update(delta);

    if (Math.abs(this.cat.rotation.y - this.targetRotation) > 0.1) {
      this.moving = true;
      const newRotation = lerp(this.cat.rotation.y, this.targetRotation, 0.05);
      this.cat.rotation.set(0, newRotation, 0);
    } else {
      console.log("dun rotating");
    }

    if (this.moving) {
      const xDiff = Math.abs(this.cat.position.x - this.targetPosition.x);
      const zDiff = Math.abs(this.cat.position.z - this.targetPosition.z);
      if (xDiff > 0.1 && zDiff > 0.1) {
        this.cat.position.addScaledVector(this.getForwardZ(), speed * delta);
        this.walking = true;
      } else {
        this.walking = false;
      }
    }

    this.updateBlendValues();
  }

  getPosition() {
    return {
      x: this.cat.position.x,
      y: this.cat.position.y,
    };
  }

  getForwardZ() {
    return this.cat.getWorldDirection(new THREE.Vector3(0, 0, 0));
  }

  updateBlendValues() {
    let walkTarget = 0;
    if (this.walking) {
      walkTarget = 1;
    }
    const currentWeight = this.walkAction.getEffectiveWeight();
    const newWeight = lerp(currentWeight, walkTarget, this.animationBlendSpeed);
    this.walkAction.setEffectiveWeight(newWeight);
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
          this.walkAction = this.mixer.clipAction(walkClip);
          this.walkAction.setEffectiveWeight(0);
          this.walkAction.enablefd = true;
          this.walkAction.play();

          const catMat = new THREE.ShaderMaterial({
            uniforms: {
              lightDirection: { value: new THREE.Vector3(15, 15, 15) },
              colors: {
                value: [
                  new THREE.Color("#e8d9af").convertLinearToSRGB(),
                  new THREE.Color("#ffffdf").convertLinearToSRGB(),
                  new THREE.Color("#ffffdf").convertLinearToSRGB(),
                  new THREE.Color("#ffffff").convertLinearToSRGB(),
                ],
              },
              thresholds: { value: [0.05, 0.925, 1] },
            },
            vertexShader: vert,
            fragmentShader: frag,
          });

          cat.children[1].material = catMat;
          this.cat = cat;

          resolve(cat);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
