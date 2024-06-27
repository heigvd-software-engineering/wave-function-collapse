import * as THREE from "three";

export class Orientations {
  static LEFT = 0;
  static DOWN = 1;
  static BACK = 2;
  static RIGHT = 3;
  static UP = 4;
  static FORWARD = 5;

  /**
   * @type {THREE.Quaternion[]}
   */
  static rotations;

  /**
   * @type {THREE.Vector3[]}
   */
  static vectors;

  /**
   * @type {THREE.Vector3[]}
   */
  static directions;

  /**
   * @type {number[]}
   */
  static HorizontalDirections = [0, 2, 3, 5];

  /**
   * @type {string[]}
   */
  static Names = [
    "-Red (Left)",
    "-Green (Down)",
    "-Blue (Back)",
    "+Red (Right)",
    "+Green (Up)",
    "+Blue (Forward)",
  ];

  static get Rotations() {
    if (!this.rotations) {
      this.initialize();
    }
    return this.rotations;
  }

  static get Direction() {
    if (!this.directions) {
      this.initialize();
    }
    return this.directions;
  }

  static initialize() {
    this.vectors = [
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ];

    this.rotations = this.vectors.map((vector) =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        vector,
      ),
    );
    this.directions = this.vectors.map(
      (vector) =>
        new THREE.Vector3(
          Math.round(vector.x),
          Math.round(vector.y),
          Math.round(vector.z),
        ),
    );
  }

  static rotate(direction, amount) {
    if (direction === 1 || direction === 4) {
      return direction;
    }
    return this.HorizontalDirections[
      (this.HorizontalDirections.indexOf(direction) + amount) % 4
    ];
  }

  static isHorizontal(orientation) {
    return orientation !== 1 && orientation !== 4;
  }

  static getIndex(direction) {
    if (direction.x < 0) {
      return 0;
    } else if (direction.y < 0) {
      return 1;
    } else if (direction.z < 0) {
      return 2;
    } else if (direction.x > 0) {
      return 3;
    } else if (direction.y > 0) {
      return 4;
    } else {
      return 5;
    }
  }
}
