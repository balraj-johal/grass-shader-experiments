varying vec2 vUv;
varying float vRain;

// uniform sampler2D touchTex;
uniform vec3 color;

void main () {
  gl_FragColor = vec4(color, 1.0);

  // if (vRain > 0.0) {
  //   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), 0.3);
  // }
  
  gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
}