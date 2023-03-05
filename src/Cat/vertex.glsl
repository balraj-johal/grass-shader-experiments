varying vec3 vNormal; // passed to fragment shader
varying vec3 vPosition;
#include <common>
#include <skinning_pars_vertex>

void main() {
  vNormal = normal;
  vPosition = position;
  #include <skinbase_vertex>
  #include <begin_vertex>
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <skinning_vertex>
  #include <project_vertex>

  // gl_Position = projectionMatrix * modelViewMatrix * vec4( mvposition, 1.0 );
}