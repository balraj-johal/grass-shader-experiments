import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
} from "three";

export default class GrassGeometry extends InstancedBufferGeometry {
  constructor() {
    super();

    const geometry = new THREE.PlaneGeometry(0.1, 1, 1, 4);

    this.copy(geometry);

    const GRASS_COUNT = 500;
    const refs = [];
    const offsets = [];
    const scales = [];
    const colors = [];
    const angles = [];

    const colourPalette = [0xffffff];

    function returnRGB(hexColor) {
      var hex = Math.floor(hexColor);
      let r = ((hex >> 16) & 255) / 255;
      let g = ((hex >> 8) & 255) / 255;
      let b = (hex & 255) / 255;

      return {
        r,
        g,
        b,
      };
    }

    for (let i = 0; i < GRASS_COUNT; i++) {
      refs.push(i);

      // scales.push(0.2 + Math.random() * (1.5 - 0.2));
      scales.push(0.2);

      angles.push(Math.PI * 2 * Math.random());

      offsets.push((Math.random() * 2 - 1) * 3.0); //x
      offsets.push(1.0);  //y
      // offsets.push(Math.random() * 5.0);  //y
      offsets.push((Math.random() * 2 - 1) * 2.0); //z
      console.log(offsets);

      const color = returnRGB(
        colourPalette[
          Math.floor(Math.random() * colourPalette.length)
        ].toString()
      );

      colors.push(color.r);
      colors.push(color.g);
      colors.push(color.b);
    }

    this.instanceCount = GRASS_COUNT;
    
    this.setAttribute(
      "color",
      new InstancedBufferAttribute(new Float32Array(colors), 3, false)
    );
    this.setAttribute(
      "scale",
      new InstancedBufferAttribute(new Float32Array(scales), 1, false)
    );
    this.setAttribute(
      "ref",
      new InstancedBufferAttribute(new Float32Array(refs), 1, false)
    );
    this.setAttribute(
      "offset",
      new InstancedBufferAttribute(new Float32Array(offsets), 3, false)
    );
    this.setAttribute(
      "angle",
      new InstancedBufferAttribute(new Float32Array(angles), 1, false)
    );
  }
}