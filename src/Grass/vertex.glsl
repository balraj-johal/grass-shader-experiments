attribute float ref;
attribute vec3 scale;
attribute vec3 offset;
attribute float angle;
attribute float color;

uniform float time;
uniform sampler2D noiseTex;
uniform sampler2D touchTex;
uniform float count;

varying vec3 vViewPosition;
varying vec2 vUv;
varying vec3 vGroundPosition;
varying vec3 vNormal;
varying vec2 vPosUV;
varying float vOpacity;
varying float vParticleType;
varying float vAngle;
varying float vStreak;

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

    m = m*m ;
    m = m*m ;

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

void main () {
  // -- apply scale
  vec3 scaled = position * scale;

  // -- apply z/y/z offset
  vec3 transformed = scaled + offset;
  vGroundPosition = transformed;
  
  // -- displace grass blades vertically to follow terrain
  float sinkIntoGround = 0.1; // ensures bottom vertices hidden

  /* 
    ok this is some real dodgy stuff
    as I'm sampling from the noise texture using the ground mesh's UV's
    I need to make the instanced grass blade's locations map to the ground's UV

    this should be fixed to have them both sample from world space coords but...

    so right now I add half the AREA_SIZE to map from 0-AREA_SIZE, 
    then divide by AREA_SIZE to get back to 0-1 
  */
  vec3 mappedToGroundUV = (transformed.xyz + vec3(10.0)) / 20.0;
  transformed.y += texture2D(noiseTex, mappedToGroundUV.xz).z * 1.0 - sinkIntoGround;

  //TODO:  mix two noise textures?

  // -- generate simplex noise displacement
  float bendScale = 1.25;
  float yInfluence = pow(uv.y, bendScale);

  vec3 displacement = vec3(0.0);
  float noiseScale = 0.0825;
  float noiseTimeScale = 0.25;
  float noisePower = 0.25;
  displacement = vec3(snoise(transformed.xz * noiseScale + (time * noiseTimeScale)) * noisePower);

  // -- apply noise displacement
  transformed.xz += displacement.x * yInfluence;


  // -- get and apply mouse based displacement
  float touchInfluence = texture2D(touchTex, mappedToGroundUV.xz).r;
  transformed.xz += touchInfluence * yInfluence;

  vec4 mvPosition = modelViewMatrix * vec4( transformed.xyz, 1.0 ); // modelViewPosition

  // -- finalise position
  gl_Position = projectionMatrix * mvPosition;

  vUv = uv;
}
