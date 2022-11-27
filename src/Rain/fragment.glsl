uniform vec3 topColor;
uniform vec3 baseColor;

varying float vVisible;
varying vec2 vUv;
varying float vColor;

void main() {
  float mixer = smoothstep(0.364, 0.660, vUv.y);
  if (vVisible > 0.0) {
    gl_FragColor = vec4(mix(topColor, baseColor, mixer), 1.0);
  } else {
    gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), 1.0);
  }
}