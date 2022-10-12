varying vec2 vUv;

void main () {
  vec3 color1 = vec3(0.192, 0.431, 0.216);
  vec3 color2 = vec3(0.247, 0.710, 0.294);

  vec3 color = mix(color1, color2, vUv.y);

  gl_FragColor = vec4(color, 1.0);
}