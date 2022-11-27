attribute float ref;
attribute vec3 scale;
attribute vec3 offset;
attribute float timeOffset;
attribute float angle;
attribute float color;

uniform float time;
uniform sampler2D noiseTex;
uniform sampler2D waterTex;
uniform float count;

varying vec3 vCameraPosition;
varying vec3 vViewDirection;
varying vec2 vUv;
varying float vVisible;
varying vec3 vNormal;
varying float vColor;

#define PI 3.1415926

// what is this one idek
vec4 quatConj(vec4 q) {
  return vec4(-q.x, -q.y, -q.z, q.w);
}
vec4 quatMultiply(vec4 q1, vec4 q2)
{
  vec4 qr;
  qr.x = (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y);
  qr.y = (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x);
  qr.z = (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w);
  qr.w = (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z);
  return qr;
}
// build quaternion tranformation
vec3 rotateVertexPosition(vec3 position, vec3 axis, float angle) {
  vec4 qr = quatFromAxisAngle(axis, angle);
  vec4 qr_conj = quatConj(qr);
  vec4 q_pos = vec4(position.x, position.y, position.z, 0);

  vec4 q_tmp = quatMultiply(qr, q_pos);
  qr = quatMultiply(q_tmp, qr_conj);

  return vec3(qr.x, qr.y, qr.z);
}
// apply rotation in degrees
vec3 applyRotationTransform( vec3 position, vec2 rotation ) {
  vec3 pos = position;
  pos = rotateVertexPosition(pos, vec3(0.0, 1.0, 0.0), rotation.y);
  return pos;
}
float getVectorMagnitude(vec2 vector) {
  float aSquared = pow(vector.x, 2.0);
  float bSquared = pow(vector.y, 2.0);
  return sqrt(aSquared + bSquared);
}

void main () {
  // -- apply scale
  vec3 scaled = position * scale;

  // -- apply y rotation
  vec3 rotated = applyRotationTransform(scaled, vec2(0.0, angle));

  // -- apply z/y/z offset
  vec3 transformed = rotated + offset;
  
  // -- get modelViewPosition
  vec4 mvPosition = modelViewMatrix * vec4( transformed.xyz, 1.0 ); 

  // -- finalise position
  gl_Position = projectionMatrix * mvPosition;

  vUv = uv;
  vColor = color;
}
