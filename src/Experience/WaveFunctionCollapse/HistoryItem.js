class HistoryItem {
  constructor(slot) {
    /**
     * @type {Map<THREE.Vector3, ModuleSet>}
     */
    this.removedModules = new Map();

    /**
     * @type {Slot}
     */
    this.slot = slot;
  }
}
