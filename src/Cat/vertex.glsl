varying vec3 vNormal; // passed to fragment shader
varying vec3 vPosition;

void main() {
  vNormal = normal;
  vPosition = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}