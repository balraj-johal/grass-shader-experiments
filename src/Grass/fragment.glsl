varying vec2 vUv;
varying vec3 vGroundPosition;

uniform sampler2D touchTex;

void main () {
  vec3 color1 = vec3(0.192, 0.431, 0.216);
  vec3 color2 = vec3(0.247, 0.710, 0.294);

  vec3 color = mix(color1, color2, vUv.y);

  vec3 touchColor = texture2D(touchTex, vUv).rgb;
  touchColor = texture2D(touchTex, vGroundPosition.xz).rgb;

  gl_FragColor = vec4(touchColor, 1.0);
  gl_FragColor = vec4(color, 1.0);
}