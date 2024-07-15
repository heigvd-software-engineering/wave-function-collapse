import * as THREE from "three";
import * as Prototype from "../Prototype.js";
import Stack from "../Utils/Language/Stack.js";
import { prototypes } from "../Prototype.js";
import Cell from "./Cell.js";
import { randomBetween } from "../Utils/SeededRandom.js";

/**
 * Utils
 */
const deepCopy = (object) => {
  return JSON.parse(JSON.stringify(object));
};

const DIRECTIONS = {
  posX: new THREE.Vector3(1, 0, 0),
  negX: new THREE.Vector3(-1, 0, 0),
  posY: new THREE.Vector3(0, 1, 0),
  negY: new THREE.Vector3(0, -1, 0),
  posZ: new THREE.Vector3(0, 0, 1),
  negZ: new THREE.Vector3(0, 0, -1),
};

// Map Data
/**
 * 3D map of cells
 * @type {Cell[][][]}
 */
let map = [];

/**
 * Size of the map in cells unit
 * @type {THREE.Vector3} mapSize
 */
let mapSize = new THREE.Vector3(0);

// /**
//  * Size of a cell
//  * @type {THREE.Vector3} cellSize
//  */
// let cellSize = new THREE.Vector3(0);
//
// /**
//  * Get the real size of the map in the 3D world from its cell coordinates
//  * @returns {THREE.Vector3} mapSize
//  */
// const getMapSize = () => {
//   return new THREE.Vector3(
//     mapSize.x * cellSize.x,
//     mapSize.y * cellSize.y,
//     mapSize.z * cellSize.z,
//   );
// };
//
// /**
//  * Get the real coordinates of a cell in the 3D world from a cell coordinates
//  * @param {THREE.Vector3} coords cell coordinates
//  * @returns {THREE.Vector3} realCoords
//  */
// const getRealCoords = (coords) => {
//   return new THREE.Vector3(
//     coords.x * cellSize.x,
//     coords.y * cellSize.y,
//     coords.z * cellSize.z,
//   );
// };

/**
 * @type {Stack<THREE.Vector3>}
 */
const stack = new Stack();

let nbCollapsed = 0;

/**
 * Checks if any cell has more than one possible prototype then the total number of collapsed cells
 *
 * @returns {boolean} isFullyCollapsed
 */
const isFullyCollapsed = () => {
  let newNbCollapsed = 0;
  let allCollapsed = true;

  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      for (let z = 0; z < mapSize.z; z++) {
        const cell = map[x][y][z];
        if (!cell.collapsed) {
          // One cell has more than one possible prototype
          // so the map is not fully collapsed
          allCollapsed = false;
        } else {
          newNbCollapsed++;
        }
      }
    }
  }

  nbCollapsed = newNbCollapsed;

  // All cells have only one possible prototype
  // so the map is fully collapsed
  return allCollapsed;
};

const progressPercentage = () => {
  return (nbCollapsed / (mapSize.x * mapSize.y * mapSize.z)) * 100;
};

/**
 * Initialize the WFC algorithm
 * @param newCellSize
 * @param newMapSize
 * @param prototypes
 */
const initialize = ({ newMapSize }) => {
  mapSize = newMapSize;

  // init 3d map, 3d matrice of mapSize
  for (let x = 0; x < mapSize.x; x++) {
    map[x] = [];
    for (let y = 0; y < mapSize.y; y++) {
      map[x][y] = [];
      for (let z = 0; z < mapSize.z; z++) {
        map[x][y][z] = new Cell(new THREE.Vector3(x, y, z));
      }
    }
  }
};

/**
 * Get the cell with the minimum entropy (= the cell that contains the least number of possible prototypes)
 * If there are multiple cells with the same entropy, return a random one or use weights to choose one
 * @returns {Cell}
 */
const getMinEntropy = () => {
  let minEntropy = Infinity;
  let minEntropyCells = [];

  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      for (let z = 0; z < mapSize.z; z++) {
        const cell = getCell(new THREE.Vector3(x, y, z));
        const cellEntropy = cell.getEntropy();

        if (!cell.collapsed && cellEntropy < minEntropy) {
          minEntropy = cellEntropy;
          minEntropyCells = [cell];
        } else if (!cell.collapsed && cellEntropy === minEntropy) {
          minEntropyCells.push(cell);
        }
      }
    }
  }

  const rnd = randomBetween(0, minEntropyCells.length - 1);

  // If there are multiple cells with the same entropy, return a random one
  // TODO : use weights to choose one
  return minEntropyCells[rnd];
};

const getMinEntropyCoords = () => {
  return getMinEntropy().coordinates;
};

/**
 * @param {THREE.Vector3} coords
 * @returns {boolean}
 */
const isCoordsValid = (coords) => {
  return (
    coords.x >= 0 &&
    coords.x < mapSize.x &&
    coords.y >= 0 &&
    coords.y < mapSize.y &&
    coords.z >= 0 &&
    coords.z < mapSize.z
  );
};

/**
 * Get the 6 neighbours of a cell
 *
 * If a neighbour is outside the map, don't return it
 *
 * @param {THREE.Vector3} coords
 * @returns {THREE.Vector3[]}
 */
const getNeighboursCoords = (coords) => {
  const neighboursCoords = [];

  for (const direction of Object.values(DIRECTIONS)) {
    const directionCoords = coords.clone().add(direction);
    if (isCoordsValid(directionCoords)) {
      neighboursCoords.push(directionCoords);
    }
  }

  return neighboursCoords;
};

/**
 * Returns an array of directions (i.e. THREE.Vector3(1, 0, 0) for the right neighbour)
 * @param {THREE.Vector3} coords
 * @returns {THREE.Vector3[]}
 */
const getNeighboursDirection = (coords) => {
  const possibleDirections = [];

  for (const direction of Object.values(DIRECTIONS)) {
    const directionCoords = coords.clone().add(direction);
    if (isCoordsValid(directionCoords)) {
      possibleDirections.push(direction);
    }
  }

  return possibleDirections;
};

/**
 * Return the list of possible prototypes for a cell, returns an empty array if the cell is collapsed
 * @param {THREE.Vector3} coords
 * @returns {string[]} possiblePrototypes
 */
const getPossiblePrototypes = (coords) => {
  return getCell(coords).possiblePrototypeIds;
};

/**
 * Get Cell from coords
 * @param {THREE.Vector3} coords
 * @returns {Cell}
 */
const getCell = (coords) => {
  if (!isCoordsValid(coords)) {
    console.error("Invalid coords", coords);
    throw new Error("Invalid coords");
  }

  return map[coords.x][coords.y][coords.z];
};

/**
 * Collapse the cell at coords
 *
 * @param coords
 */
const collapse = (coords, isBlank = false) => {
  getCell(coords).collapse(isBlank);
};

/**
 * Remove the prototype from the list of possible prototypes
 * @param {THREE.Vector3} coords
 * @param {string} prototype
 */
const constrain = (coords, prototype) => {
  getCell(coords).constrain(prototype);
};

/**
 * Get the prototype from its id
 * @param {string} id
 * @returns {Prototype | undefined} prototype
 */
const getPrototypeFromId = (id) => {
  return prototypes.find((p) => p.id === id);
};

/**
 * Get collaped prototype id from coords
 * @param {THREE.Vector3} coords
 * @returns {String | undefined} prototype
 */
const getCollapsedPrototypeId = (coords) => {
  const collapsed = map[coords.x][coords.y][coords.z];

  if (collapsed.length !== 1) return undefined; // Not collapsed

  return collapsed;
};

/**
 * TODO doc
 *
 * @param {THREE.Vector3} coords
 * @param {THREE.Vector3} direction
 * @returns {String[]} prototype ids
 */
const getPossiblePrototypesInDirection = (coords, direction) => {
  const cell = getCell(coords);
  const possiblePrototypes = [];

  if (cell.collapsed) {
    possiblePrototypes.push(cell.prototypeId);
  } else {
    possiblePrototypes.push(...cell.possiblePrototypeIds);
  }

  const possiblePrototypesInDirectionOutput = [];

  for (const possiblePrototype of possiblePrototypes) {
    const prototype = Prototype.getPrototypeById(possiblePrototype);

    if (!prototype) {
      console.error("Prototype not found", possiblePrototype);
      throw new Error("Prototype not found");
    }

    const possiblePrototypeIdsInDirection =
      prototype.getPossiblePrototypeIdsInDirection(direction);

    /**
     * Add the possible prototypes in the direction to the output only once
     */
    possiblePrototypeIdsInDirection.forEach((p) => {
      if (!possiblePrototypesInDirectionOutput.includes(p)) {
        possiblePrototypesInDirectionOutput.push(p);
      }
    });
  }

  return possiblePrototypesInDirectionOutput;
};

/**
 * @param {THREE.Vector3} coords
 */
const propagate = (coords) => {
  console.log("propagate", coords);
  stack.push(coords);

  while (!stack.isEmpty()) {
    const currentCoords = stack.pop();

    const directions = getNeighboursDirection(currentCoords);

    for (const direction of directions) {
      const neighbourCoords = currentCoords.clone().add(direction);

      const neighbourPossiblePrototypes =
        getPossiblePrototypes(neighbourCoords);

      if (neighbourPossiblePrototypes.length === 0) continue;

      // Must be called each time, because the possible prototypes can change
      const currentPossiblePrototypes = getPossiblePrototypesInDirection(
        currentCoords,
        direction,
      );

      // Compare the two lists
      for (const neighbourPossiblePrototype of neighbourPossiblePrototypes) {
        if (!currentPossiblePrototypes.includes(neighbourPossiblePrototype)) {
          constrain(neighbourCoords, neighbourPossiblePrototype);
          if (!stack.includes(neighbourCoords)) {
            stack.push(neighbourCoords);
          }
        }
      }
    }
  }
};

let iteration = 0;

const allSideBorderCollapsed = () => {
  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      for (let z = 0; z < mapSize.z; z++) {
        const coords = new THREE.Vector3(x, y, z);
        if (isOnSideBorder(coords) && !getCell(coords).collapsed) {
          return false;
        }
      }
    }
  }
  return true;
};

function isOnSideBorder(coords) {
  return (
    coords.x === 0 ||
    coords.x === mapSize.x - 1 ||
    coords.z === 0 ||
    coords.z === mapSize.z - 1
  );
}

const iterate = () => {
  const coords = getMinEntropyCoords();
  console.log(`iteration ${iteration} coords`, coords);
  collapse(coords);
  propagate(coords);
};

const sideBorderIteration = () => {
  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      for (let z = 0; z < mapSize.z; z++) {
        const coords = new THREE.Vector3(x, y, z);
        if (isOnSideBorder(coords)) {
          console.log(`border iteration ${iteration} coords`, coords);
          collapse(coords, true);
          propagate(coords);
        }
      }
    }
  }
};

const renderResult = () => {
  // TODO

  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      for (let z = 0; z < mapSize.z; z++) {
        console.log(map[x][y][z]);
      }
    }
  }
};

const printMap = () => {
  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      for (let z = 0; z < mapSize.z; z++) {
        console.log(x, y, z);
        console.log(map[x][y][z]);
      }
    }
  }
};

const start = () => {
  console.log("Start WFC");
  try {
    while (!allSideBorderCollapsed()) {
      sideBorderIteration();
    }
    while (!isFullyCollapsed()) {
      console.log(`Iteration ${iteration++} -- ${progressPercentage()}%`);
      iterate();
    }
    console.log("WFC done");
  } catch (error) {
    console.error("WFC error", error);
  }
  return map;
};

const manualIterate = () => {
  try {
    while (!allSideBorderCollapsed()) {
      sideBorderIteration();
    }
    if (!isFullyCollapsed()) {
      console.log(`Iteration ${iteration++} -- ${progressPercentage()}%`);
      iterate();
    } else {
      console.log("WFC done");
    }
  } catch (error) {
    console.error("WFC error", error);
  }
  return map;
};

const reset = () => {
  initialize({
    newMapSize: mapSize,
  });
  iteration = 0;
};

export { initialize, start, manualIterate, reset };
