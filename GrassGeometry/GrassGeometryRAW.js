

export default class GrassGeometry extends THREE.InstancedBufferGeometry {
  
  constructor() {
    super();

    this.config = componentsConfig.sparkles;

    const geometry = new PlaneBufferGeometry(
      this.config.particleScale,
      this.config.particleScale
    );

    this.copy(geometry);

    const particleCount = this.config.count;
    const refs = [];
    const offsets = [];
    const opacities = [];
    const scales = [];
    const colors = [];
    const sparkles = [];
    const angles = [];
    const particleTypes = [];
    const streaks = [];
    const startTimes = [];

    const colourPalette = [0xffffff];
    const vieraSpikesPositions = [];
    const loubiFlipPositions = [];
    const poolStudPositions = [];

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

    let particleTypeCount = 0;

    for (let i = 0; i < particleCount; i++) {
      particleTypeCount++;

      // particle types determine the style of particle

      if (particleTypeCount % 35 === 0) {
        // bokeh type
        particleTypes.push(1);
        streaks.push(0);
      } else if (particleTypeCount % 5 === 0) {
        //sparkle streak type
        particleTypes.push(2);
        streaks.push(1);
      } else {
        // sparkle point type
        particleTypes.push(3);
        streaks.push(0);
      }

      vieraSpikesPositions.push(0);
      vieraSpikesPositions.push(0);
      vieraSpikesPositions.push(0);

      loubiFlipPositions.push(0);
      loubiFlipPositions.push(0);
      loubiFlipPositions.push(0);

      poolStudPositions.push(0);
      poolStudPositions.push(0);
      poolStudPositions.push(0);

      refs.push(i);
      scales.push(0.2 + Math.random() * (1.5 - 0.2));
      angles.push(Math.PI * 2 * Math.random());

      offsets.push((Math.random() * 2 - 1) * 3.0);
      offsets.push(Math.random() * 5.0);
      offsets.push((Math.random() * 2 - 1) * 2.0);

      sparkles.push(Math.random());

      const startTime = (i * 10 * Math.random()) / this.config.count;
      startTimes.push(startTime);

      opacities.push(0.5 + Math.random() * 0.5);

      const color = returnRGB(
        colourPalette[
          Math.floor(Math.random() * colourPalette.length)
        ].toString()
      );

      colors.push(color.r);
      colors.push(color.g);
      colors.push(color.b);
    }

    this.instanceCount = particleCount;

    this.setAttribute(
      "vieraSpikesPosition",
      new InstancedBufferAttribute(
        new Float32Array(vieraSpikesPositions),
        3,
        false
      )
    );
    this.setAttribute(
      "loubiFlipPosition",
      new InstancedBufferAttribute(
        new Float32Array(loubiFlipPositions),
        3,
        false
      )
    );
    this.setAttribute(
      "poolStudPosition",
      new InstancedBufferAttribute(
        new Float32Array(poolStudPositions),
        3,
        false
      )
    );
    this.setAttribute(
      "color",
      new InstancedBufferAttribute(new Float32Array(colors), 3, false)
    );
    this.setAttribute(
      "opacity",
      new InstancedBufferAttribute(new Float32Array(opacities), 1, false)
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
      "sparkle",
      new InstancedBufferAttribute(new Float32Array(sparkles), 1, false)
    );
    this.setAttribute(
      "particleType",
      new InstancedBufferAttribute(new Float32Array(particleTypes), 1, false)
    );
    this.setAttribute(
      "streak",
      new InstancedBufferAttribute(new Float32Array(streaks), 1, false)
    );
    this.setAttribute(
      "angle",
      new InstancedBufferAttribute(new Float32Array(angles), 1, false)
    );
    this.setAttribute(
      "startTime",
      new InstancedBufferAttribute(new Float32Array(startTimes), 1, false)
    );
  }
}