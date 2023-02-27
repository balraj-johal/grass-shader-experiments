varying vec3 vNormal; // recieved from vertex shader
varying vec3 vPosition;

uniform mat4 modelMatrix; // default three uniform
uniform vec3 lightDirection;
uniform vec3 colors[4];
uniform float thresholds[3];

void main() {
  vec3 worldPosition = (modelMatrix * vec4( vPosition, 1.0 )).xyz;
  vec3 worldNormal = normalize( vec3( modelMatrix * vec4( vNormal, 0.0 ) ) );
  vec3 lightVector = normalize( lightDirection - worldPosition );
  float lightLevel = dot( worldNormal, lightVector );

  vec3 color = vec3(0.0);

  // TODO: optimise by removing if statements, as they're inefficient
  if (lightLevel > thresholds[2]) {
    color = colors[3];
  } else if (lightLevel > thresholds[1]) {
    color = colors[2];
  } else if (lightLevel > thresholds[0]) {
    color = colors[1];
  } else {
    color = colors[0];
  }
  
  gl_FragColor = vec4( color, 1.0 );
}