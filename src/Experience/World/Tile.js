import * as THREE from "three";
import Experience from "../Experience.js";
import { gsap } from "gsap";
import * as Prototype from "../WaveFunctionCollapse/Prototype.js";

/**
 * A Tile is a 3D object that can be fit into a {Cell}
 */
export default class Tile {
  static TILE_WIDTH = 4;
  static TILE_HEIGHT = 4;

  constructor(prototype, position = new THREE.Vector3(), tileDebugFolder) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.tileDebugFolder = tileDebugFolder;
    this.prototype = prototype;
    this.helper = null;
    this.position = position;
    this.orientation = -1;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.tileDebugFolder.addFolder(this.prototype.id);
    }

    // Resource
    if (this.prototype.name === Prototype.TILE_TYPE.BLANK) {
      this.resource = null;
      this.model = {
        position: position.clone(),
        rotation: new THREE.Vector3(),
        isObject3D: false,
      };
    } else {
      this.resource = this.resources.items[this.prototype.name];
      this.orientation = this.prototype.rotation;
      this.setModel();
    }
  }

  /**
   * Get the position (clone) of the tile in the world
   * @returns {THREE.Vector3}
   */
  getPosition() {
    return this.position.clone();
  }

  /**
   * Set the position of the tile in the world
   * @param {THREE.Vector3} position
   */
  setPosition(position) {
    this.position = position;
    this.setModelPosition(position);
  }

  // TODO : Fix this offset
  offsetVector = new THREE.Vector3(0, Tile.TILE_HEIGHT / 2, 0);

  /**
   * Get the position (clone) of the model in the world with the offset
   * @returns {THREE.Vector3}
   */
  getModelPosition() {
    return this.getPosition().add(this.offsetVector);
  }

  /**
   * Set the position of the model in the world
   * @param position
   */
  setModelPosition(position) {
    this.model.position.set(position.x, position.y, position.z);
  }

  /**
   * Set the rotation of the model in the world
   * @param {THREE.Vector3} rotation
   */
  setModelRotation(rotation) {
    this.model.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  /**
   * Set the model orientation in the world
   * @param {number} orientation
   */
  setModelOrientation(orientation) {
    const orientationInRad = -orientation * (Math.PI / 2);
    const rotation = new THREE.Vector3(0, orientationInRad, 0);
    this.setModelRotation(rotation); // negative for clockwise rotation
  }

  /**
   * Set the model of the tile
   */
  setModel() {
    this.model = this.resource.scene.clone();

    this.setModelPosition(this.getPosition());
    this.setModelOrientation(this.orientation);

    // Debug
    if (this.debug.active) {
      this.setHelper();

      // Debug rotation
      this.debugRotation = this.orientation;
      this.debugFolder.add(this, "debugRotation", 0, 3, 1).onChange(() => {
        gsap.to(this.model.rotation, {
          y: -this.debugRotation * (Math.PI / 2),
          duration: 0.25,
        });
      });
    }

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.material = new THREE.MeshStandardMaterial({
          color: "#65edff",
          side: THREE.DoubleSide,
        });
      }
    });
  }

  clear() {
    this.scene.remove(this.model);
    if (this.helper) {
      this.scene.remove(this.helper);
    }
  }

  setHelper() {
    if (this.helper) {
      this.updateBoxHelper();
    } else {
      this.initBoxHelper();
    }
  }

  initBoxHelper() {
    // Debug box
    const box = new THREE.Box3();

    box.setFromCenterAndSize(
      this.getModelPosition(),
      new THREE.Vector3(Tile.TILE_WIDTH, Tile.TILE_HEIGHT, Tile.TILE_WIDTH),
    );

    this.helper = new THREE.Box3Helper(box, 0xff0000);

    this.scene.add(this.helper);
  }

  updateBoxHelper() {
    this.helper.box.setFromCenterAndSize(
      this.getModelPosition(),
      new THREE.Vector3(Tile.TILE_WIDTH, Tile.TILE_HEIGHT, Tile.TILE_WIDTH),
    );
  }

  clear() {
    this.clearModel();
    this.clearBoxHelper();
  }

  clearModel() {
    this.scene.remove(this.model);
  }

  clearBoxHelper() {
    this.scene.remove(this.helper);
  }

  update() {}
}
