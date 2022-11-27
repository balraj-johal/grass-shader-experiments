uniform vec3 topColor;
uniform vec3 baseColor;

varying vec3 vGroundPosition;
varying vec2 vUv;
varying float vColor;

void main() {
  float mixer = smoothstep(0.364, 0.660, vUv.y);
  gl_FragColor = vec4(mix(topColor, baseColor, mixer), 1.0);
}