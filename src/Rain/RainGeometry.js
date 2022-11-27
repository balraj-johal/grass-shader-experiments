import * as THREE from "three";
import rand from "../utils/rand";

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

require("three/examples/js/loaders/GLTFLoader.js");

const AREA_SIZE = 20;

export default class RainGeometry extends THREE.InstancedBufferGeometry {
  constructor(params) {
    super();

    this.copy(params.geometry);

    const count = params.count;
    const refs = [];
    const offsets = [];
    const timeOffsets = [];
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
      scales.push(MIN_HEIGHT + rand.generate() * HEIGHT_RANGE_FACTOR);
      scales.push(MIN_WIDTH + rand.generate() * WIDTH_RANGE_FACTOR);
      // rotation
      angles.push(0 * rand.generate());
      // position
      const positions = {
        x: rand.generate() * AREA_SIZE - AREA_SIZE / 2,
        y: 0.0,
        z: rand.generate() * AREA_SIZE - AREA_SIZE / 2,
      };
      offsets.push(positions.x);
      offsets.push(positions.y);
      offsets.push(positions.z);
      // time offset
      timeOffsets.push(2.0 * rand.generate());
      // colours
      colors.push(rand.generate());
    }

    this.instanceCount = count;

    this.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(new Float32Array(colors), 1, false)
    );
    this.setAttribute(
      "ref",
      new THREE.InstancedBufferAttribute(new Float32Array(refs), 1, false)
    );
    this.setAttribute(
      "scale",
      new THREE.InstancedBufferAttribute(new Float32Array(scales), 3, false)
    );
    this.setAttribute(
      "offset",
      new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, false)
    );
    this.setAttribute(
      "timeOffset",
      new THREE.InstancedBufferAttribute(
        new Float32Array(timeOffsets),
        1,
        false
      )
    );
    this.setAttribute(
      "angle",
      new THREE.InstancedBufferAttribute(new Float32Array(angles), 1, false)
    );
  }
}
