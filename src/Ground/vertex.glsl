attribute float ref;
attribute float scale;
attribute vec3 offset;
attribute float angle;
attribute float color;

uniform sampler2D noiseTex;
uniform float count;

// varying vec3 vViewPosition;
varying vec2 vUv;
// varying vec3 vNormal;
// varying vec2 vPosUV;
// varying float vOpacity;
// varying float vParticleType;
// varying float vAngle;
// varying float vStreak;

#define PI 3.1415926

void main () {
  vec3 displaced = position;
  // due to rotation z here is the vertical axis
  displaced.z -= texture2D(noiseTex, uv).z;

  // -- finalise position
  vec4 mvPosition = modelViewMatrix * vec4( displaced.xyz, 1.0 ); //modelViewPosition
  gl_Position = projectionMatrix * mvPosition;

  vUv = uv;
}
