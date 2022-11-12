attribute float ref;
attribute vec3 scale;
attribute vec3 offset;
attribute float angle;
attribute float color;
attribute vec2 clumpDistance;
attribute float clumpHeightAddition;

uniform float time;
uniform sampler2D noiseTex;
uniform sampler2D touchTex;
uniform float count;
uniform mat4 u_world;

varying vec3 vViewPosition;
varying vec3 vViewDirection;
varying vec2 vUv;
varying vec3 vGroundPosition;
varying vec3 vNormal;
varying vec2 vPosUV;
varying float vOpacity;
varying float vParticleType;
varying float vAngle;
varying float vStreak;

const vec2 forwardVector = vec2(0.0, 1.0);

#define PI 3.1415926

// SIMPLEX NOISE
// https://thebookofshaders.com/edit.php#11/2d-snoise-clear.frag
//
// Description : GLSL 2D simplex noise function
//      Author : Ian McEwan, Ashima Arts
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License :
//  Copyright (C) 2011 Ashima Arts. All rights reserved.
//  Distributed under the MIT License. See LICENSE file.
//  https://github.com/ashima/webgl-noise
//
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,
                        // -1.0 + 2.0 * C.x
                        0.024390243902439);
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0),
                        dot(x1,x1),
                        dot(x2,x2)
                        ), 0.0);

    m = m*m;
    m = m*m;

    // Gradients:
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple
    //      of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}

// -- rotation helpers
// attrib: https://thebookofshaders.com/08/
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}
// attrib: rob ty
vec4 quatFromAxisAngle(vec3 axis, float angle) {
  vec4 qr;
  float half_angle = (angle * 0.5) * 3.14159 / 180.0;
  qr.x = axis.x * sin(half_angle);
  qr.y = axis.y * sin(half_angle);
  qr.z = axis.z * sin(half_angle);
  qr.w = cos(half_angle);
  return qr;
}
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

  // -- apply clump influence on blade height
  float distanceToClump = getVectorMagnitude(clumpDistance);
  float clumpRadius = 2.5;
  float clumpMaxHeightAddition = 1.5;
  if (distanceToClump < clumpRadius) {
    // TODO: make not linear
    float normalisedDistanceFromClump = 
        (clumpRadius - distanceToClump) / clumpRadius;
    // flatten off the tops of the clumps to make it look more natural
    normalisedDistanceFromClump = clamp(normalisedDistanceFromClump, 0.0, 0.4);
    float clumpHeightInfluence = clumpHeightAddition * normalisedDistanceFromClump;
    scaled.y *= 1.0 + clumpHeightInfluence;
  } 

  // -- apply y rotation
  vec3 rotated = applyRotationTransform(scaled, vec2(0.0, angle));
  vec3 rotatedNormal = applyRotationTransform(normal, vec2(0.0, angle));

  // -- apply z/y/z offset
  vec3 transformed = rotated + offset;

  // -- move all blades of glass to the closest clump point
  // transformed.xz -= clumpDistance;

  // -- ensure grass y position matches the displaced ground position
  /* 
    ok this is some real dodgy stuff
    as I'm sampling from the noise texture using the ground mesh's UV's
    I need to make the instanced grass blade's locations map to the ground's UV

    this should be fixed to have them both sample from world space coords but...

    so right now I add half the AREA_SIZE to map from 0-AREA_SIZE, 
    then divide by AREA_SIZE to get back to 0-1 
  */
  vec3 mappedToGroundUV = (transformed.xyz + vec3(10.0)) / 20.0;
  transformed.y += texture2D(noiseTex, mappedToGroundUV.xz).z * 1.0;

  // -- generate first wind displacement
  vec3 totalDisplacement = vec3(0.0);
  float noiseScale = 0.045;
  float noiseTimeScale = 0.15;
  float windPower = 0.5;
  float scrollByTime = time * noiseTimeScale;
  float primaryWindDirection = 45.0;
  vec2 windVector = rotate2d(primaryWindDirection * PI / 180.0) * forwardVector;

  // -- apply first wind displacement
  totalDisplacement.xz = vec2(snoise(transformed.xz * noiseScale + scrollByTime)) * windVector;
  totalDisplacement += 0.5; // ensure wind only pushes forwards
  totalDisplacement *= windPower;
  totalDisplacement *= scale.y; // Make displacement proportional to height

  // -- get mouse displacement amount
  float touchInfluencePower = 5.0;
  float touchInfluence = texture2D(touchTex, mappedToGroundUV.xz).r * touchInfluencePower;

  // -- apply radial displacement around mouse points
  float sampleRes = 0.005; // how granularly to check around a point for mapping touchTex gradient > displacement
  float zTouchDisplacement = texture2D(touchTex, mappedToGroundUV.xz).r - texture2D(touchTex, mappedToGroundUV.xz + vec2(0.0, sampleRes)).r;
  float xTouchDisplacement = texture2D(touchTex, mappedToGroundUV.xz).r - texture2D(touchTex, mappedToGroundUV.xz + vec2(sampleRes, 0.0)).r;
  vec3 totalTouchDisplacement = vec3(xTouchDisplacement, 0.0, zTouchDisplacement);
  totalTouchDisplacement *= touchInfluencePower;
  totalDisplacement += totalTouchDisplacement;

  // -- apply total displacement - primarily to uv top, none to bottom
  float bendScale = 2.0;
  float yInfluence = pow(uv.y, bendScale);
  transformed.xz += totalDisplacement.xz * yInfluence;

  // -- get modelViewPosition
  vec4 mvPosition = modelViewMatrix * vec4( transformed.xyz, 1.0 ); 

  // -- finalise position
  gl_Position = projectionMatrix * mvPosition;

  // pass blade position to the fragment shader using a varying
  vGroundPosition = transformed;
  vNormal = normal;
  // vNormal *= mat3(u_world);
  vViewDirection = normalize(cameraPosition.xyz - transformed.xyz);
  vUv = uv;
}
