import * as THREE from "three";
import * as Prototype from "../Prototype.js";
import Stack from "../Utils/Language/Stack.js";
import { prototypes } from "../Prototype.js";

/**
 * Utils
 */
const deepCopy = (object) => {
  return JSON.parse(JSON.stringify(object));
};

/**
 * Seedable random function
 */
function seededRandom(seed) {
  var m = 2 ** 35 - 31;
  var a = 185852;
  var s = seed % m;
  return function () {
    return (s = (s * a) % m) / m;
  };
}

/**
 * Returns a random number between min and max (inclusive)
 * @param {number} min (inclusive)
 * @param {number} max (inclusive)
 */
const randomBetween = (min, max) => {
  const SEED = 10;
  return Math.floor(seededRandom(SEED) * (max - min + 1) + min);
};

const DIRECTIONS = {
  POS_X: new THREE.Vector3(1, 0, 0),
  NEG_X: new THREE.Vector3(-1, 0, 0),
  POS_Y: new THREE.Vector3(0, 1, 0),
  NEG_Y: new THREE.Vector3(0, -1, 0),
  POS_Z: new THREE.Vector3(0, 0, 1),
};

// Map Data
let map = [];
let mapSize = new THREE.Vector3(0);
let cellSize = new THREE.Vector3(0);

/**
 * @type {Stack<THREE.Vector3>}
 */
const stack = new Stack();

/**
 * Checks if any cell has more than one possible prototype then return false
 *
 * @returns {boolean} isFullyCollapsed
 */
const isFullyCollapsed = () => {
  // TODO : this function can be used for showing progress

  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      for (let z = 0; z < mapSize.z; z++) {
        if (map[x][y][z].length > 1) {
          // One cell has more than one possible prototype
          // so the map is not fully collapsed
          return false;
        }
      }
    }
  }

  // All cells have only one possible prototype
  // so the map is fully collapsed
  return true;
};

/**
 * @param cellSize {THREE.Vector3}
 * @param mapSize {THREE.Vector3}
 * @param prototypes {Array<Prototype>}
 */
const initialize = ({ newCellSize, newMapSize, prototypes }) => {
  mapSize = newMapSize;
  cellSize = newCellSize;

  // init 3d map, 3d matrice of mapSize
  for (let x = 0; x < mapSize.x; x++) {
    map[x] = [];
    for (let y = 0; y < mapSize.y; y++) {
      map[x][y] = [];
      for (let z = 0; z < mapSize.z; z++) {
        map[x][y][z] = prototypes.map((p) => p.id);
      }
    }
  }
};

/**
 * Get the cell with the minimum entropy (= the cell that contains the least number of possible prototypes)
 * If there are multiple cells with the same entropy, return a random one or use weights to choose one
 * @returns {null}
 */
const getMinEntropyCoords = () => {
  let minEntropy = Infinity;
  let minEntropyCoords = [];

  for (let x = 0; x < mapSize.x; x++) {
    for (let y = 0; y < mapSize.y; y++) {
      for (let z = 0; z < mapSize.z; z++) {
        if (map[x][y][z].length <= minEntropy) {
          minEntropy = map[x][y][z].length;
          minEntropyCoords.push(new THREE.Vector3(x, y, z));
        }
      }
    }
  }

  // If there are multiple cells with the same entropy, return a random one
  // TODO : use weights to choose one
  return minEntropyCoords[randomBetween(0, minEntropyCoords.length - 1)];
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
  const x = coords.x;
  const y = coords.y;
  const z = coords.z;

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
 * @returns {Vector3[]}
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
 * Return the list of possible prototypes for a cell
 * @param {THREE.Vector3} coords
 * @returns {Prototype[]} possiblePrototypes
 */
const getPossiblePrototypes = (coords) => {
  return map[coords.x][coords.y][coords.z];
};

/**
 * Collapse the cell at coords
 *
 * (Choose a random prototype then remove the other
 * ones from the list of possible prototypes)
 *
 * @param coords
 */
const collapse = (coords) => {
  const possiblePrototypes = getPossiblePrototypes(coords);

  // TODO : use weights to choose the prototype
  const theChosenOne =
    possiblePrototypes[randomBetween(0, possiblePrototypes.length - 1)];

  if (!theChosenOne) {
    console.error("collapse error");
    console.error("No prototype found at coords", coords);
    console.error("Cell", map[coords.x][coords.y][coords.z]);
    printMap();
  }

  map[coords.x][coords.y][coords.z] = [theChosenOne];
};

/**
 * Remove the prototype from the list of possible prototypes
 * @param {THREE.Vector3} coords
 * @param {Prototype} prototype
 */
const constrain = (coords, prototype) => {
  map[coords.x][coords.y][coords.z] = map[coords.x][coords.y][coords.z].filter(
    (p) => p.id !== prototype.id,
  );
};

// Get prorotype from id
const getPrototypeFromId = (id) => {
  return prototypes.find((p) => p.id === id);
};

/**
 * Returns the list of possible prototypes for the current cell in the direction "direction"
 *
 * @param {THREE.Vector3} coords
 * @param {THREE.Vector3} direction
 * @returns {Prototype[]}
 */
const getPossiblePrototypesInDirection = (coords, direction) => {
  const currentPrototype = getPossiblePrototypes(coords)[0];

  console.log(
    `getPossiblePrototypesInDirection ${coords} ${direction}: Prototype ${currentPrototype}`,
  );

  if (!currentPrototype) {
    console.error("getPossiblePrototypesInDirection error");
    console.error("No prototype found at coords", coords);
    console.error("Cell", map[coords.x][coords.y][coords.z]);
    printMap();
  }
  return getPrototypeFromId(currentPrototype).getPossiblePrototypesInDirection(
    direction,
  );
};

/**
 * @param {THREE.Vector3} coords
 */
const propagate = (coords) => {
  console.log("propagate", coords);
  stack.push(coords);

  while (!stack.isEmpty()) {
    const currentCoords = stack.pop();
    console.log("currentCoords", currentCoords);

    const directions = getNeighboursDirection(currentCoords);
    console.log("directions", directions);

    for (const direction of directions) {
      const neighbourCoords = currentCoords.clone().add(direction);
      console.log(`neighbourCoords ${direction}`, neighbourCoords);

      const neigbhourPossiblePrototypes =
        getPossiblePrototypes(neighbourCoords);
      console.log(
        `neigbhourPossiblePrototypes ${direction}`,
        neigbhourPossiblePrototypes,
      );

      if (neigbhourPossiblePrototypes.length === 0) continue;

      // Must be called each time, because the possible prototypes can change
      const currentPossiblePrototypes = getPossiblePrototypesInDirection(
        currentCoords,
        direction,
      );
      console.log(
        `currentPossiblePrototypes ${direction}`,
        currentPossiblePrototypes,
      );

      // Compare the two lists
      for (const neighbourPossiblePrototype of neigbhourPossiblePrototypes) {
        if (!currentPossiblePrototypes.includes(neighbourPossiblePrototype)) {
          console.log(
            `neighbourPossiblePrototype ${neighbourPossiblePrototype} is not in currentPossiblePrototypes`,
          );
          console.log("constrain", neighbourCoords, neighbourPossiblePrototype);

          constrain(neighbourCoords, neighbourPossiblePrototype);
          console.log(
            "Constrained neighbour content :",
            map[neighbourCoords.x][neighbourCoords.y][neighbourCoords.z],
          );

          if (!stack.includes(neighbourCoords)) {
            stack.push(neighbourCoords);
          }
        }
      }
    }
  }
};

const iterate = () => {
  const coords = getMinEntropyCoords();
  collapse(coords);
  propagate(coords);
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
  while (!isFullyCollapsed()) {
    iterate();
  }
  renderResult();
};

// Execution (debug)

console.log("Init Wave Function Collapse");
initialize({
  newCellSize: new THREE.Vector3(2, 2, 2),
  newMapSize: new THREE.Vector3(4, 4, 4),
  prototypes: Prototype.prototypes,
});

console.log("Start Wave Function Collapse");
start();
