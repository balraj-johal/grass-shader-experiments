uniform vec3 topColor;
uniform vec3 baseColor;

varying vec2 vUv;

void main() {
  float mixer = smoothstep(0.364, 0.660, vUv.y);
  gl_FragColor = vec4(mix(topColor, baseColor, mixer), 1.0);
}