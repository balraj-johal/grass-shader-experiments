import { InstancedBufferAttribute, InstancedBufferGeometry } from "three";

const AREA_SIZE = 20;
const RESOLUTION = 2;
export default class GroundGeometry extends InstancedBufferGeometry {
  constructor() {
    super();

    const geometry = new THREE.PlaneGeometry(
      AREA_SIZE,
      AREA_SIZE,
      AREA_SIZE * RESOLUTION,
      AREA_SIZE * RESOLUTION
    );

    this.copy(geometry);

    const refs = [];
    const offsets = [];
    const colors = [];

    for (let i = 0; i < AREA_SIZE; i++) {
      refs.push(i);
    }

    this.instanceCount = 1;

    this.setAttribute(
      "color",
      new InstancedBufferAttribute(new Float32Array(colors), 3, false)
    );
    this.setAttribute(
      "ref",
      new InstancedBufferAttribute(new Float32Array(refs), 1, false)
    );
    this.setAttribute(
      "offset",
      new InstancedBufferAttribute(new Float32Array(offsets), 3, false)
    );
  }
}
