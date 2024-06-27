export class ModulePrototype {
  constructor() {
    /**
     * @type {number}
     */
    this.probability = 1.0;

    /**
     * @type {boolean}
     */
    this.spawn = true;

    /**
     * @type {boolean}
     */
    this.isInterior = false;

    this.reset();
  }

  reset() {
    /**
     * @type {HorizontalFaceDetails}
     */
    this.left = new HorizontalFaceDetails();

    /**
     * @type {VerticalFaceDetails}
     */
    this.down = new VerticalFaceDetails();

    /**
     * @type {HorizontalFaceDetails}
     */
    this.back = new HorizontalFaceDetails();

    /**
     * @type {HorizontalFaceDetails}
     */
    this.right = new HorizontalFaceDetails();

    /**
     * @type {VerticalFaceDetails}
     */
    this.up = new VerticalFaceDetails();

    /**
     * @type {HorizontalFaceDetails}
     */
    this.forward = new HorizontalFaceDetails();

    for (let face of this.faces) {
      face.excludedNeighbours = [];
    }
  }

  update() {}

  get faces() {
    //TODO
  }
}

ModulePrototype.FaceDetails = class FaceDetails {
  constructor() {
    /**
     * @type {boolean}
     */
    this.walkable = false;

    /**
     * @type {number}
     */
    this.connector = 0;

    /**
     * @type {ModulePrototype[]}
     */
    this.excludedNeighbours = [];
    this.enforceWalkableNeighbor = false;
    this.isOcclusionPortal = false;
  }

  resetConnector() {
    this.connector = 0;
  }
};

ModulePrototype.HorizontalFaceDetails = class HorizontalFaceDetails extends (
  FaceDetails
) {
  constructor() {
    super();
    /**
     * @type {boolean}
     */
    this.symmetric = false;
    /**
     * @type {boolean}
     */
    this.flipped = false;
  }

  toString() {
    return this.connector + (this.symmetric ? "s" : this.flipped ? "F" : "");
  }

  resetConnector() {
    super.resetConnector();
    this.symmetric = false;
    this.flipped = false;
  }
};

ModulePrototype.VerticalFaceDetails = class VerticalFaceDetails extends (
  FaceDetails
) {
  constructor() {
    super();
    /**
     * @type {boolean}
     */
    this.invariant = false;
    /**
     * @type {number}
     */
    this.rotation = 0;
  }

  toString() {
    return (
      this.connector +
      (this.invariant
        ? "i"
        : this.rotation !== 0
          ? "_bcd".charAt(this.rotation)
          : "")
    );
  }

  resetConnector() {
    super.resetConnector();
    this.invariant = false;
    this.rotation = 0;
  }
};
