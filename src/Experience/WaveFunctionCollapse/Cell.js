import { prototypes } from "../Prototype.js";
import { randomBetween } from "../Utils/SeededRandom.js";
import { Vector3 } from "three";

/**
 * Cell = position in the 3D matrix that represents the map.
 */
class Cell {
  constructor(coordinates) {
    /**
     * @type {Vector3}
     */
    this.coordinates = coordinates;

    /**
     * @type {String[]} empty if collapsed
     */
    this.possiblePrototypeIds = prototypes.map((prototype) => prototype.id);

    /**
     * @type {Prototype[]} empty if collapsed // TODO : keep this ? or just use the ids
     */
    this.possiblePrototypes = prototypes;

    /**
     * @type {Boolean}
     */
    this.collapsed = false;

    /**
     * Prototype id of the collapsed cell
     */
    this.prototypeId = null;
  }

  /**
   * Collapse the cell with a prototype id
   *
   * (Choose a random prototype then remove the other
   * ones from the list of possible prototypes)
   */
  collapse(isBlank = false) {
    // TODO : use weight to select the prototype
    let theChosenOne;
    if (isBlank) {
      theChosenOne = "blank-R-1"; // TODO : remove hard coded value
    } else {
      const prototypeByBiggestWeight = this.getBiggesteWeightPrototypes();
      theChosenOne =
        prototypeByBiggestWeight[
          randomBetween(0, this.possiblePrototypeIds.length - 1)
        ];
    }
    this.possiblePrototypeIds = [];
    this.possiblePrototypes = [];
    this.prototypeId = theChosenOne;
    this.collapsed = true;
  }

  getBiggesteWeightPrototypes() {
    const maxWeight = Math.max(
      ...this.possiblePrototypes.map((prototype) => prototype.weight),
    );
    return this.possiblePrototypes
      .filter((prototype) => prototype.weight === maxWeight)
      .map((prototype) => prototype.id);
  }

  /**
   * Get the entropy of the cell
   * @returns {number}
   */
  getEntropy() {
    // TODO : check if necessary
    if (this.collapsed) return Infinity;

    return this.possiblePrototypeIds.length;
  }

  /**
   * constrain the cell
   * @param {String} prototypeId
   */
  constrain(prototypeId) {
    this.possiblePrototypeIds = this.possiblePrototypeIds.filter(
      (pId) => pId !== prototypeId,
    );
    this.possiblePrototypes = this.possiblePrototypes.filter(
      (prototype) => prototype.id !== prototypeId,
    );
  }
}

export default Cell;
