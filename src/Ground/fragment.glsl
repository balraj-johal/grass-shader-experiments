varying vec2 vUv;
uniform sampler2D noiseTex;
uniform sampler2D touchTex;

void main () {
  vec3 color = vec3(0.388, 0.333, 0.184);
  vec3 color2 = vec3(0.247, 0.710, 0.294);

  vec3 noiseTex = texture2D(noiseTex, vUv).rgb;
  vec3 touchTex = texture2D(touchTex, vUv).rgb;

  //mix noise texture to fake shadows
  color = mix(color2, noiseTex, 0.15);

  // // show touch tex
  color = mix(color, touchTex, 0.5);

  gl_FragColor = vec4(color, 1.0);
}