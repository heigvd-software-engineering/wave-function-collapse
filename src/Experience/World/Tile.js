import * as THREE from "three";
import Experience from "../Experience.js";
import { gsap } from "gsap";
import { Vector3 } from "three";
import * as Prototype from "../Prototype.js";

/**
 * A Tile is a 3D object that can be fit into a {Cell}
 */
export default class Tile {
  static TILE_WIDTH = 4;
  static TILE_HEIGHT = 4;

  constructor(prototype, position = new Vector3()) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.prototype = prototype;
    this.helper = null;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder(this.prototype.id);
    }

    // Resource
    if (this.prototype.type === Prototype.TILE_TYPE.BLANK) {
      this.resource = null;
      this.model = {};
      this.model.position = new Vector3(position.x, position.y, position.z);
      this.model.rotation = new Vector3();
    } else {
      this.resource = this.resources.items[this.prototype.type];
      this.setModel(position);
    }
  }

  setModel(position) {
    this.model = this.resource.scene.clone();
    this.scene.add(this.model);

    this.model.position.set(position.x, position.y, position.z);
    this.model.rotation.y = -this.prototype.rotation * (Math.PI / 2); // negative for clockwise rotation

    // Debug
    if (this.debug.active) {
      // Debug box
      const box = new THREE.Box3();
      const boxPosition = this.model.position
        .clone()
        .add(new Vector3(0, Tile.TILE_HEIGHT / 2, 0));
      box.setFromCenterAndSize(
        boxPosition,
        new THREE.Vector3(Tile.TILE_WIDTH, Tile.TILE_HEIGHT, Tile.TILE_WIDTH),
      );
      this.helper = new THREE.Box3Helper(box, 0xff0000);

      this.scene.add(this.helper);

      // Debug rotation
      this.debugRotation = this.prototype.rotation;
      this.debugFolder.add(this, "debugRotation", 0, 3, 1).onChange(() => {
        gsap.to(this.model.rotation, {
          y: -this.debugRotation * (Math.PI / 2),
          duration: 0.25,
        });
      });
    }

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.material = new THREE.MeshStandardMaterial({
          color: "#65edff",
          side: THREE.DoubleSide,
        });
      }
    });
  }

  updateHelper() {
    if (this.helper) {
      this.helper.box = this.createBox();
    }
  }

  setBoxHelper() {
    if (this.debug.active) {
      this.helper = new THREE.Box3Helper(this.createBox(), 0xff0000);
    }
  }

  createBox() {
    const box = new THREE.Box3();
    const boxPosition = this.model.position
      .clone()
      .add(new Vector3(0, Tile.TILE_HEIGHT / 2, 0));
    box.setFromCenterAndSize(
      boxPosition,
      new THREE.Vector3(Tile.TILE_WIDTH, Tile.TILE_HEIGHT, Tile.TILE_WIDTH),
    );
    return box;
  }

  update() {}
}
