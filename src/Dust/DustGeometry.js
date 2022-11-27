import * as THREE from "three";
import rand from "../utils/rand";

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

export default class DustGeometry extends THREE.InstancedBufferGeometry {
  areaSize;

  constructor(params) {
    super();

    this.areaSize = params.areaSize;

    const geometry = new THREE.BufferGeometry();
    this.copy(geometry);

    const count = params.count;
    const refs = [];
    const offsets = [];
    const scales = [];
    const colors = [];
    const angles = [];

    const colourPalette = [0xffffff];

    // apply randomness to each instance
    const MIN_HEIGHT = 1.0;
    const HEIGHT_RANGE_FACTOR = 0.0;
    const MIN_WIDTH = 1.0;
    const WIDTH_RANGE_FACTOR = 0.0;
    for (let i = 0; i < count; i++) {
      refs.push(i);
      // scaling
      scales.push(1.0);
      scales.push(1.0);
      scales.push(1.0);
      // scales.push(MIN_HEIGHT + rand.generate() * HEIGHT_RANGE_FACTOR);
      // scales.push(MIN_WIDTH + rand.generate() * WIDTH_RANGE_FACTOR);
      // rotation
      angles.push(0 * rand.generate());
      // position
      const positions = {
        x: rand.generate() * this.areaSize - this.areaSize / 2,
        y: rand.generate() * this.areaSize - this.areaSize / 2,
        z: rand.generate() * this.areaSize - this.areaSize / 2,
      };
      offsets.push(positions.x);
      offsets.push(positions.y);
      offsets.push(positions.z);
      // colours
      colors.push(rand.generate());
    }

    const positions = new Float32Array(parameters.count * 3);
    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * 3;
      positions[i3 + 1] = (Math.random() - 0.5) * 3;
      positions[i3 + 2] = (Math.random() - 0.5) * 3;
    }

    this.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    this.instanceCount = count;

    // this.setAttribute(
    //   "position",
    //   new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, false)
    // );
  }
}
