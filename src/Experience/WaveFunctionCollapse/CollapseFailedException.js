export class CollapseFailedException extends Error {
  constructor(slot) {
    super();

    /**
     * @type {Slot}
     */
    this.slot = slot;
  }
}
