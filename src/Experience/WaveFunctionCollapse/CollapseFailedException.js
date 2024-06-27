export class CollapseFailedException extends Error {
  constructor(slot) {
    super();
    this.slot = slot;
  }
}
