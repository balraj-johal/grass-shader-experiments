varying vec2 vUv;
uniform sampler2D noiseTex;

void main () {
  vec3 color = vec3(0.388, 0.333, 0.184);
  vec3 noiseTex = texture2D(noiseTex, vUv).rgb;

  //mix noise texture to fake shadows
  color = mix(color, noiseTex, 0.15);

  gl_FragColor = vec4(color, 1.0);
}