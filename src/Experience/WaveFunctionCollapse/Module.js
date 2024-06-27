import * as THREE from "three";
import { Orientations } from "./Orientations.js";

export class Module {
  /*

  	public Module(GameObject prefab, int rotation, int index) {
		this.Rotation = rotation;
		this.Index = index;
		this.Prefab = prefab;
		this.Prototype = this.Prefab.GetComponent<ModulePrototype>();
		this.Name = this.Prototype.gameObject.name + " R" + rotation;
		this.PLogP = this.Prototype.Probability * Mathf.Log(this.Prototype.Probability);
	}
   */

  constructor(prefab, prefabModulePrototype, rotation, index) {
    /**
     * @type {number}
     */
    this.rotation = rotation;

    /**
     * @type {number}
     */
    this.index = index;

    /**
     * @type {THREE.Object3D} // TODO : or mesh ? or scene ?
     */
    this.prefab = prefab;

    /**
     * @type {ModulePrototype}
     */
    this.prefabModulePrototype = prefabModulePrototype;

    /**
     * @type {string}
     */
    this.name = this.prefabModulePrototype.name + " R" + rotation;

    /**
     * This is precomputed to make entropy calculation faster
     * @type {number}
     */
    this.pLogP =
      this.prefabModulePrototype.probability *
      Math.log(this.prefabModulePrototype.probability);

    /**
     * @type {Array<ModuleSet>}
     */
    this.possibleNeighbors;

    /**
     * @type {Array<Array<Module>>}
     */
    this.possibleNeighborsArray;
  }

  /**
   *
   * @param {number} direction
   * @param {Module} module
   */
  fitsModule(direction, module) {
    let otherDirection = (direction + 3) % 6;

    if (Orientations.isHorizontal(direction)) {
      let f1 =
        this.prefabModulePrototype.faces[
          Orientations.rotate(direction, this.rotation)
        ];
      let f2 =
        module.prefabModulePrototype.faces[
          Orientations.rotate(otherDirection, module.rotation)
        ];
      return (
        f1.connector === f2.connector &&
        (f1.symmetric || f1.flipped !== f2.flipped)
      );
    } else {
      let f1 = this.prefabModulePrototype.faces[direction];
      let f2 = module.prefabModulePrototype.faces[otherDirection];
      return (
        f1.connector === f2.connector &&
        (f1.invariant ||
          (f1.rotation + this.rotation) % 4 ===
            (f2.rotation + module.rotation) % 4)
      );
    }
  }

  /**
   *
   * @param {number} direction
   * @param {number} connector
   */
  fitsConnector(direction, connector) {
    if (Orientations.isHorizontal(direction)) {
      let f = this.getFace(direction);
      return f.connector === connector;
    } else {
      let f = this.prefabModulePrototype.faces[direction];
      return f.connector === connector;
    }
  }

  /**
   * @param {number} direction
   */
  getFace(direction) {
    return this.prefabModulePrototype.faces[
      Orientations.rotate(direction, this.rotation)
    ];
  }

  toString() {
    return this.name;
  }
}
