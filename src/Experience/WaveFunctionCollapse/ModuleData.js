import * as THREE from "three";
import { Module } from "./Module.js";

export class ModuleData {
  /**
   * @type {Array<Module>}
   */
  static current;

  constructor(prototypes) {
    /**
     * @type {Array<THREE.Object3D>}
     */
    this.prototypes = prototypes;

    /**
     * @type {Array<Module>}
     */
    this.modules = [];
  }

  // must be called manually after deserialization
  onAfterDeserialize() {
    ModuleData.current = this.modules;
    for (let module of this.modules) {
      module.possibleNeighborsArray = module.possibleNeighbors.map((ms) =>
        ms.toArray(),
      );
    }
  }

  savePrototypes() {
    // Not used, only unity editor
  }
}
