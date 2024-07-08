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
  collapse() {
    // TODO : use weight to select the prototype
    const theChosenOne =
      this.possiblePrototypeIds[
        randomBetween(0, this.possiblePrototypeIds.length - 1)
      ];
    this.possiblePrototypeIds = [];
    this.prototypeId = theChosenOne;
    this.collapsed = true;
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
  }
}

export default Cell;
