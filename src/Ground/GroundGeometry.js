import { InstancedBufferAttribute, InstancedBufferGeometry } from "three";

const AREA_SIZE = 10;
export default class GroundGeometry extends InstancedBufferGeometry {
  constructor() {
    super();

    const geometry = new THREE.PlaneGeometry(
      AREA_SIZE,
      AREA_SIZE,
      AREA_SIZE,
      AREA_SIZE
    );

    this.copy(geometry);

    const refs = [];
    const offsets = [];
    const colors = [];

    for (let i = 0; i < AREA_SIZE; i++) {
      refs.push(i);

      // scales.push(0.2 + Math.random() * (0.5 - 0.2));

      // angles.push(Math.PI * 2 * Math.random());

      // //x
      // offsets.push(Math.random() * AREA_SIZE - AREA_SIZE / 2);
      // //y
      // offsets.push(0.0);
      // //z
      // offsets.push(Math.random() * AREA_SIZE - AREA_SIZE / 2);

      // const color = returnRGB(
      //   colourPalette[
      //     Math.floor(Math.random() * colourPalette.length)
      //   ].toString()
      // );

      // colors.push(color.r);
      // colors.push(color.g);
      // colors.push(color.b);
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
