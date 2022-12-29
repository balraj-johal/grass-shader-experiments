varying vec2 vUv;
varying vec3 vGroundPosition;
varying vec3 vViewDirection;
varying vec3 vCameraPosition;
varying vec3 vNormal;
varying float vColor;
varying float vRain;
varying float vClumpDistance;
varying float vDebug;

uniform sampler2D touchTex;

void main () {
  float clumpColorInfluence = clamp(vClumpDistance / 9.5, 0.0, 1.0);

  vec3 baseColor = mix(
    vec3(0.192, 0.431, 0.216), //healthy
    vec3(0.74, 0.65, 0.35), //dry
    clumpColorInfluence
  );
  vec3 tipColor = mix(
    vec3(0.296, 0.665, 0.333), //healthy
    vec3(1.00, 0.90, 0.57), //dry
    clumpColorInfluence
  );
  vec3 gradientColor = mix(baseColor, tipColor, vUv.y);

  mediump vec3 lightVector = vec3(10.5, 10.2, 11.0);

  // ensure it's normalized
  lightVector = normalize(lightVector);
  vec3 normal = normalize(vNormal);

  // calculate the dot product of the lightVector to the vertex normal
  mediump vec3 lightContribution = vec3(0.0);
  float ambientLightContribution = 0.0;
  lightContribution += ambientLightContribution;
  mediump float directionalLightContribution = max(0.0, dot(normal, lightVector));
  lightContribution += directionalLightContribution;

  // -- specular highlights - ref https://www.rastertek.com/dx10tut10.html
  // vec4 specularColor = vec4(0.0);
  // float specularPower = 1.0;
  // // Calculate the reflection vector based on the light intensity, normal vector, and light direction.
  // vec3 reflection = normalize(2.0 * 1.0 * normal - lightVector); 
  // // Determine the amount of specular light based on the reflection vector, viewing direction, and specular power.
  // vec3 specularContribution = vec3(pow(clamp(dot(reflection, vViewDirection), 0.0, 1.0), specularPower));
  // // lightContribution += specularContribution;

  // -- apply base gradient colors
  gl_FragColor = vec4(gradientColor, 1.0);
  // -- apply random desaturation
  gl_FragColor -= vColor / 3.0;
  // -- apply clump influence
  // gl_FragColor.rgb *= clamp(lightContribution, 0.0, 1.0);

  if (vRain > 0.0) {
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), 0.3 );
  }
  
  gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
  if (vDebug > 0.01) {
    gl_FragColor = vec4(vec3(vDebug), 1.0);
  }
}