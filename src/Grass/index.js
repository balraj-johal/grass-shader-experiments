import frag from "./fragment.glsl";
import vert from "./vertex.glsl";

import GrassGeometry from "./GrassGeometry";

const GRASS_COUNT = 10000;

export default class Grass extends THREE.Object3D {
  noiseTex;
  touchTex;
  waterTex;

  constructor(params) {
    super();

    this.noiseTex = params.noiseTex;
    this.touchTex = params.touchTex;
    this.waterTex = params.waterTex;
  }

  updateTime(time) {
    if (!this.grassMaterial) return;
    this.grassMaterial.uniforms.time.value = time;
  }

  getMesh() {
    return new Promise((resolve, reject) => {
      try {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(__dirname + "/GrassBladeBentMore.glb", (gltf) => {
          const geometry = new GrassGeometry({
            grassCount: GRASS_COUNT,
            geometry: gltf.scene.children[0].geometry,
          });

          geometry.attributes["offset"].needsUpdate;
          geometry.attributes["scale"].needsUpdate;
          geometry.attributes["color"].needsUpdate;
          geometry.attributes["angle"].needsUpdate;

          const uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib["lights"],
            {
              time: { value: 0 },
              noiseTex: { value: this.noiseTex },
              touchTex: { value: this.touchTex },
              waterTex: { value: this.waterTex },
            },
          ]);

          this.grassMaterial = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms,
            side: THREE.DoubleSide,
            lights: true,
          });
          this.grassMaterial.clipping = false;
          this.grassMaterial.uniformsNeedUpdate = true;

          const mesh = new THREE.InstancedMesh(
            geometry,
            this.grassMaterial,
            GRASS_COUNT
          );
          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
          resolve(mesh);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
