varying vec2 vUv;
varying vec3 vGroundPosition;
varying vec3 vNormal;

uniform sampler2D touchTex;

void main () {
  vec3 color1 = vec3(0.192, 0.431, 0.216);
  vec3 color2 = vec3(0.247, 0.710, 0.294);

  vec3 color = mix(color1, color2, vUv.y);

  mediump vec3 lightVector = vec3(0.5, 0.2, 1.0);

  // ensure it's normalized
  lightVector = normalize(lightVector);
  vec3 normal = normalize(vNormal);

  // calculate the dot product of
  // the lightVector to the vertex normal
  mediump float lightContribution = 0.0;
  mediump float directionalLightContribution = max(0.0, dot(vNormal, lightVector));
  float ambientLightContribution = 0.6;
  lightContribution += directionalLightContribution;
  lightContribution += ambientLightContribution;
  lightContribution = clamp(lightContribution, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
  gl_FragColor.rgb *= lightContribution;
}