import Vector3 from "./Utils/Vector3.js";
import { getPrototypeById } from "./Prototype.js";
import Stack from "../Utils/Language/Stack.js";
import { randomBetween } from "../Utils/SeededRandom.js";
import { DIRECTIONS } from "./Constants/Direction.js";
import Map from "./Map.js";

class WaveFunctionCollapse {
  /**
   * @param { Prototype[] } prototypes
   * @param { Vector3 } mapSize
   */
  constructor(prototypes, mapSize, startFromBottom = true) {
    /**
     * 3D Grid of the WFC
     * @type {Map}
     */
    this.map = new Map(mapSize);

    /**
     * Stack of the cells to propagate
     * @type {Stack<Vector3>}
     */
    this.stack = new Stack();

    /**
     * Number of collapsed cells
     * @type {number}
     */
    this.nbCollapsed = 0;

    /**
     * Current iteration number
     * @type {number}
     */
    this.iteration = 0;

    // TODO : remove this after startFromBottom mode is stable ?
    this.startFromBottom = startFromBottom;
  }

  /**
   * Checks if any cell has more than one possible prototype then the total number of collapsed cells
   *
   * @returns {boolean} isFullyCollapsed
   */
  isFullyCollapsed() {
    let newNbCollapsed = 0;
    let allCollapsed = true;

    for (let x = 0; x < this.map.mapSize.x; x++) {
      for (let y = 0; y < this.map.mapSize.y; y++) {
        for (let z = 0; z < this.map.mapSize.z; z++) {
          const cell = this.getCell(new Vector3(x, y, z));
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

    this.nbCollapsed = newNbCollapsed;

    // All cells have only one possible prototype
    // so the map is fully collapsed
    return allCollapsed;
  }

  progressPercentage() {
    return (
      (this.nbCollapsed /
        (this.map.mapSize.x * this.map.mapSize.y * this.map.mapSize.z)) *
      100
    );
  }

  /**
   * Get the cell with the minimum entropy (= the cell that contains the least number of possible prototypes)
   * If there are multiple cells with the same entropy, return a random one or use weights to choose one
   * @returns {Cell}
   */
  getMinEntropy() {
    let minEntropy = Infinity;
    let minEntropyCells = [];

    for (let x = 0; x < this.map.mapSize.x; x++) {
      for (let y = 0; y < this.map.mapSize.y; y++) {
        for (let z = 0; z < this.map.mapSize.z; z++) {
          const cell = this.getCell(new Vector3(x, y, z));
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
  }

  getMinEntropyCoords() {
    return this.getMinEntropy().coordinates;
  }

  /**
   * Returns an array of directions (i.e. Vector3(1, 0, 0) for the right neighbour) that are valid for the given coords
   * @param {Vector3} coords
   * @returns {Vector3[]}
   */
  getNeighboursDirection(coords) {
    const possibleDirections = [];

    for (const direction of Object.values(DIRECTIONS)) {
      const directionCoords = coords.clone().add(direction);
      if (this.map.isCoordsValid(directionCoords)) {
        possibleDirections.push(direction);
      }
    }

    return possibleDirections;
  }

  /**
   * Return the list of possible prototypes for a cell, returns an empty array if the cell is collapsed
   * @param {Vector3} coords
   * @returns {string[]} possiblePrototypes
   */
  getPossiblePrototypes(coords) {
    if (this.isOnSideBorder(coords)) return ["blank-R-1"]; // TODO : remove hard coded value
    return this.getCell(coords).possiblePrototypeIds;
  }

  /**
   * Get Cell from coords
   * @param {Vector3} coords
   * @returns {Cell}
   */
  getCell(coords) {
    return this.map.getCellAt(coords);
  }

  /**
   * Collapse the cell at coords
   *
   * @param coords
   * @param isBlank
   */
  collapse(coords, isBlank = false) {
    this.getCell(coords).collapse(isBlank);
  }

  /**
   * Remove the prototype from the list of possible prototypes
   * @param {Vector3} coords
   * @param {string} prototype
   */
  constrain(coords, prototype) {
    this.getCell(coords).constrain(prototype);
  }

  /**
   * Get the possible prototypes in the given direction
   *
   * @param {Vector3} coords
   * @param {Vector3} direction
   * @returns {String[]} prototype ids
   */
  getPossiblePrototypesInDirection(coords, direction) {
    const cell = this.getCell(coords);
    const possiblePrototypes = [];

    // If the cell is collapsed, push the prototype id only
    if (cell.collapsed) {
      possiblePrototypes.push(cell.prototypeId);
    } else {
      possiblePrototypes.push(...cell.possiblePrototypeIds);
    }

    const possiblePrototypesInDirectionOutput = [];

    for (const possiblePrototype of possiblePrototypes) {
      const prototype = getPrototypeById(possiblePrototype);

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
  }

  /**
   * @param {Vector3} coords
   */
  propagate(coords) {
    this.stack.push(coords);

    while (!this.stack.isEmpty()) {
      const currentCoords = this.stack.pop();

      const directions = this.getNeighboursDirection(currentCoords);

      for (const direction of directions) {
        const neighbourCoords = currentCoords.clone().add(direction);

        const neighbourPossiblePrototypes =
          this.getPossiblePrototypes(neighbourCoords);

        if (neighbourPossiblePrototypes.length === 0) continue;

        // Must be called each time, because the possible prototypes can change
        const currentPossiblePrototypes = this.getPossiblePrototypesInDirection(
          currentCoords,
          direction,
        );

        // Compare the two lists
        for (const neighbourPossiblePrototype of neighbourPossiblePrototypes) {
          if (!currentPossiblePrototypes.includes(neighbourPossiblePrototype)) {
            this.constrain(neighbourCoords, neighbourPossiblePrototype);
            if (!this.stack.includes(neighbourCoords)) {
              this.stack.push(neighbourCoords);
            }
          }
        }
      }
    }
  }

  allSideBorderCollapsed() {
    for (let x = 0; x < this.map.mapSize.x; x++) {
      for (let y = 0; y < this.map.mapSize.y; y++) {
        for (let z = 0; z < this.map.mapSize.z; z++) {
          const coords = new Vector3(x, y, z);
          if (this.isOnSideBorder(coords) && !this.getCell(coords).collapsed) {
            return false;
          }
        }
      }
    }
    return true;
  }

  allBottomBorderCollapsed() {
    for (let x = 0; x < this.map.mapSize.x; x++) {
      for (let z = 0; z < this.map.mapSize.z; z++) {
        const coords = new Vector3(x, 0, z);
        if (this.isOnBottomBorder(coords) && !this.getCell(coords).collapsed) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Returns true if the cell is on the side border of the map
   * @param {Vector3} coords
   * @returns {boolean}
   */
  isOnSideBorder(coords) {
    return this.isOnXSideBorder(coords) || this.isOnZSideBorder(coords);
  }

  /**
   * Returns true if the cell is on the X side border of the map
   * @param {Vector3} coords
   * @returns {boolean}
   */
  isOnXSideBorder(coords) {
    return coords.x === 0 || coords.x === this.map.mapSize.x - 1;
  }

  /**
   * Returns true if the cell is on the Z side border of the map
   * @param {Vector3} coords
   * @returns {boolean}
   */
  isOnZSideBorder(coords) {
    return coords.z === 0 || coords.z === this.map.mapSize.z - 1;
  }

  /**
   * Returns true if the cell is on the top border of the map
   * @param {Vector3} coords
   * @returns {boolean}
   */
  isOnTopBorder(coords) {
    return coords.y === this.map.mapSize.y - 1;
  }

  /**
   * Returns true if the cell is on the bottom border of the map
   * @param {Vector3} coords
   * @returns {boolean}
   */
  isOnBottomBorder(coords) {
    return coords.y === 0;
  }

  sideBorderIteration() {
    for (let x = 0; x < this.map.mapSize.x; x++) {
      for (let y = 0; y < this.map.mapSize.y; y++) {
        for (let z = 0; z < this.map.mapSize.z; z++) {
          const coords = new Vector3(x, y, z);
          if (this.isOnSideBorder(coords) || this.isOnTopBorder(coords)) {
            this.collapse(coords, true);
            this.propagate(coords);
          }
        }
      }
    }
  }

  bottomBorderIteration(single) {
    for (let x = 0; x < this.map.mapSize.x; x++) {
      for (let z = 0; z < this.map.mapSize.z; z++) {
        const coords = new Vector3(x, 0, z);
        if (this.isOnBottomBorder(coords) && !this.getCell(coords).collapsed) {
          this.collapse(coords);
          this.propagate(coords);
          if (single) return; // TODO : not clean
        }
      }
    }
  }

  iterate() {
    const coords = this.getMinEntropyCoords();
    this.collapse(coords);
    this.propagate(coords);
  }

  start(isManualIteration = false) {
    try {
      while (!this.allSideBorderCollapsed()) {
        this.sideBorderIteration();
      }
      if (isManualIteration) {
        this.manualIterations();
      } else {
        this.automaticIterations();
      }
    } catch (error) {
      console.error("WFC error", error);
    }
    return this.map.map;
  }

  automaticIterations() {
    while (this.startFromBottom && !this.allBottomBorderCollapsed()) {
      this.bottomBorderIteration();
    }
    while (!this.isFullyCollapsed()) {
      this.iterate();
    }
  }

  manualIterations() {
    if (this.startFromBottom && !this.allBottomBorderCollapsed()) {
      this.bottomBorderIteration(true);
    } else if (!this.isFullyCollapsed()) {
      this.iterate();
    }
  }

  reset() {
    this.map.clear();
    this.stack.clear();
    this.nbCollapsed = 0;
    this.iteration = 0;
  }
}

export { WaveFunctionCollapse };
