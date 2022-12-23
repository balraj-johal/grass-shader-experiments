import * as THREE from "three";
import rand from "../utils/rand";

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = THREE;

require("three/examples/js/loaders/GLTFLoader.js");

import { getDistanceVector, getVectorMagnitude } from "../utils/vector";
import { roundDownToNearestMultiple } from "../utils/assorted";

const AREA_SIZE = 20;
const CLUMP_DENSITY = 0.2; //per unit of area
const TILE_SIZE = AREA_SIZE / (AREA_SIZE * CLUMP_DENSITY);
const tileMap = {};

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
  return point + ((rand.generate() - 1) * step) / 2;
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
  return currentClosest;
};

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
            heightAddition: rand.generate() + 0.75 * 1.5,
            colorInfluence: 0x000000,
          },
          id: `${worldCoords.x}.${worldCoords.z}`,
          x: worldCoords.x,
          z: worldCoords.z,
        };
      }
    }

    // apply randomness to each instance
    const MIN_HEIGHT = 0.6;
    const HEIGHT_RANGE_FACTOR = 1.9;
    const MIN_WIDTH = 3.2;
    const WIDTH_RANGE_FACTOR = 1.8;
    for (let i = 0; i < GRASS_COUNT; i++) {
      refs.push(i);
      // scaling
      scales.push(1.0);
      scales.push(MIN_HEIGHT + rand.generate() * HEIGHT_RANGE_FACTOR);
      scales.push(MIN_WIDTH + rand.generate() * WIDTH_RANGE_FACTOR);
      // rotation
      angles.push(100 * rand.generate() - 270);
      // position
      const positions = {
        x: rand.generate() * AREA_SIZE - AREA_SIZE / 2,
        y: 0.0,
        z: rand.generate() * AREA_SIZE - AREA_SIZE / 2,
      };
      offsets.push(positions.x);
      offsets.push(positions.y);
      offsets.push(positions.z);
      // colours
      colors.push(rand.generate());
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
