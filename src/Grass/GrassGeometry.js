import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
} from "three";

export default class GrassGeometry extends InstancedBufferGeometry {
  constructor() {
    super();

    const geometry = new THREE.PlaneGeometry(0.1, 1, 1, 4);

    this.copy(geometry);

    const GRASS_COUNT = 2000;
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

    const AREA_SIZE = 10;
    for (let i = 0; i < GRASS_COUNT; i++) {
      refs.push(i);

      scales.push(0.2 + Math.random() * (0.5 - 0.2));

      // angles.push(Math.PI * 2 * Math.random());

      //x
      offsets.push((Math.random() * AREA_SIZE - (AREA_SIZE/2))); 
      //y
      offsets.push(0.0);  
      //z
      offsets.push((Math.random() * AREA_SIZE - (AREA_SIZE/2)));

      // const color = returnRGB(
      //   colourPalette[
      //     Math.floor(Math.random() * colourPalette.length)
      //   ].toString()
      // );

      // colors.push(color.r);
      // colors.push(color.g);
      // colors.push(color.b);
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