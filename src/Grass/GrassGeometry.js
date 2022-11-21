import * as THREE from "three";

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

require("three/examples/js/loaders/GLTFLoader.js");

const AREA_SIZE = 20;
const CLUMP_DENSITY = 0.1; //per unit of area
const TILE_SIZE = AREA_SIZE / (AREA_SIZE * CLUMP_DENSITY);
const tileMap = {};

const roundDownToNearestMultiple = (number, multiple) => {
  return Math.floor(number / multiple) * multiple;
};
// given a point, return the tile containing that point
const assignTile = (pointX, pointZ) => {
  const tileX = roundDownToNearestMultiple(pointX, TILE_SIZE);
  const tileZ = roundDownToNearestMultiple(pointZ, TILE_SIZE);
  const tile = tileMap[`${tileX}.${tileZ}`];
  if (!tile) console.log("point is not within a registered tile.");
  return tileMap[`${tileX}.${tileZ}`];
};
// given a point, randomly offset it, ensuring it stays within it's tile
const jitterPoint = (point, step) => {
  return point + ((Math.random() - 1) * step) / 2;
};
// gets all the tiles surrounding a given one, including itself.
const getSurroundingTiles = (tile) => {
  const surroundingTiles = [tile];
  const tilesToCheck = [];
  // top 3
  tilesToCheck.push(
    [tile.x - TILE_SIZE, tile.z + TILE_SIZE],
    [tile.x, tile.z + TILE_SIZE],
    [tile.x + TILE_SIZE, tile.z + TILE_SIZE]
  );
  // left right
  tilesToCheck.push([tile.x - TILE_SIZE, tile.z], [tile.x + TILE_SIZE, tile.z]);
  // bottom 3
  tilesToCheck.push(
    [tile.x - TILE_SIZE, tile.z - TILE_SIZE],
    [tile.x, tile.z - TILE_SIZE],
    [tile.x + TILE_SIZE, tile.z - TILE_SIZE]
  );
  tilesToCheck.forEach((tileCoords) => {
    const nearbyTile = tileMap[`${tileCoords[0]}.${tileCoords[1]}`];
    if (nearbyTile) surroundingTiles.push(nearbyTile);
  });
  return surroundingTiles;
};

const getDistanceVector = (x1, z1, x2, z2) => {
  return [x1 - x2, z1 - z2];
};
const getVectorMagnitude = (vector) => {
  const aSquared = Math.pow(vector[0], 2);
  const bSquared = Math.pow(vector[1], 2);
  const cSquared = aSquared + bSquared;
  return Math.sqrt(cSquared);
};
// given a list of tiles to check, calculates the distance vector
// from the given point coords to the clump points of each tile,
// returning the closest one (i.e. with the lowest magnitude)
const getClosestClumpToPoint = (surroundingTiles, pointX, pointZ) => {
  let currentClosest = {
    clump: {},
    distanceVector: [],
    distance: Infinity,
  };
  surroundingTiles.forEach((tile) => {
    const distVector = getDistanceVector(
      pointX,
      pointZ,
      tile.clump.center.x,
      tile.clump.center.z
    );
    const distance = getVectorMagnitude(distVector);
    if (distance < currentClosest.distance) {
      currentClosest.clump = tile.clump;
      currentClosest.distanceVector = distVector;
      currentClosest.distance = distance;
    }
  });
  if (!currentClosest) console.log("no closest clump");
  console.log();
  return currentClosest;
};

function returnRGB(hexColor) {
  var hex = Math.floor(hexColor);
  let r = ((hex >> 16) & 255) / 255;
  let g = ((hex >> 8) & 255) / 255;
  let b = (hex & 255) / 255;

  return {
    r,
    g,
    b,
  };
}

export default class GrassGeometry extends THREE.InstancedBufferGeometry {
  constructor(params) {
    super();

    this.copy(params.geometry);

    const GRASS_COUNT = params.grassCount;
    const refs = [];
    const offsets = [];
    const scales = [];
    const colors = [];
    const angles = [];
    const clumpDistances = [];
    const clumpHeightAdditions = [];

    const colourPalette = [0xffffff];

    // build tilemap
    const TILE_MAP_SIZE = AREA_SIZE * CLUMP_DENSITY;
    for (let x = -TILE_MAP_SIZE / 2; x < TILE_MAP_SIZE / 2; x++) {
      for (let z = -TILE_MAP_SIZE / 2; z < TILE_MAP_SIZE / 2; z++) {
        // create clump data
        const worldCoords = { x: x * TILE_SIZE, z: z * TILE_SIZE };
        const initialClumpPoint = {
          x: worldCoords.x + TILE_SIZE / 2,
          z: worldCoords.z + TILE_SIZE / 2,
        };
        // add to tilemap
        tileMap[`${worldCoords.x}.${worldCoords.z}`] = {
          clump: {
            center: {
              x: jitterPoint(initialClumpPoint.x, TILE_SIZE),
              z: jitterPoint(initialClumpPoint.z, TILE_SIZE),
            },
            heightAddition: Math.random() + 0.75 * 1.5,
            colorInfluence: 0x000000,
          },
          id: `${worldCoords.x}.${worldCoords.z}`,
          x: worldCoords.x,
          z: worldCoords.z,
        };
      }
    }

    // apply randomness to each instance
    const MIN_HEIGHT = 1.2;
    const HEIGHT_RANGE_FACTOR = 0.9;
    const MIN_WIDTH = 3.5;
    const WIDTH_RANGE_FACTOR = 1.2;
    for (let i = 0; i < GRASS_COUNT; i++) {
      refs.push(i);
      // scaling
      scales.push(1.0);
      scales.push(MIN_HEIGHT + Math.random() * HEIGHT_RANGE_FACTOR);
      scales.push(MIN_WIDTH + Math.random() * WIDTH_RANGE_FACTOR);
      // rotation
      angles.push(90 * Math.random());
      // position
      const positions = {
        x: Math.random() * AREA_SIZE - AREA_SIZE / 2,
        y: 0.0,
        z: Math.random() * AREA_SIZE - AREA_SIZE / 2,
      };
      offsets.push(positions.x);
      offsets.push(positions.y);
      offsets.push(positions.z);
      // colours
      colors.push(Math.random());
      // assign tile that the blade is in
      const tile = assignTile(positions.x, positions.z);
      // find closest clump point to the blade's current position,
      // checking all points in all surrounding tiles
      const closestClump = getClosestClumpToPoint(
        getSurroundingTiles(tile),
        positions.x,
        positions.z
      );
      // add the vector from the grass blade to the clump center to
      // the clumpDistance buffer attribute.
      // this in theory will be used to push all blades of grass to
      // their assigned clump point.
      clumpDistances.push(closestClump.distanceVector[0]);
      clumpDistances.push(closestClump.distanceVector[1]);
      clumpHeightAdditions.push(closestClump.clump.heightAddition);
    }

    this.instanceCount = GRASS_COUNT;

    this.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(new Float32Array(colors), 1, false)
    );
    this.setAttribute(
      "scale",
      new THREE.InstancedBufferAttribute(new Float32Array(scales), 3, false)
    );
    this.setAttribute(
      "ref",
      new THREE.InstancedBufferAttribute(new Float32Array(refs), 1, false)
    );
    this.setAttribute(
      "offset",
      new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3, false)
    );
    this.setAttribute(
      "angle",
      new THREE.InstancedBufferAttribute(new Float32Array(angles), 1, false)
    );
    this.setAttribute(
      "clumpDistance",
      new THREE.InstancedBufferAttribute(
        new Float32Array(clumpDistances),
        2,
        false
      )
    );
    this.setAttribute(
      "clumpHeightAddition",
      new THREE.InstancedBufferAttribute(
        new Float32Array(clumpHeightAdditions),
        1,
        false
      )
    );
  }
}
