import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Tile from "./Tile.js";
import * as THREE from "three";
import * as Prototype from "../WaveFunctionCollapse/Prototype.js";
import { Vector3 } from "three";
import { DIRECTIONS } from "../WaveFunctionCollapse/Constants/Direction.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.finalMap = null;
    this.tilesMap = null;

    if (this.debug.active) {
      this.tileDebugFolder = this.debug.ui.addFolder("TILES");
    }

    // Wait for resources
    this.resources.on("ready", () => {
      // Setup
      this.environment = new Environment();

      // Debug for showing each prototype once (without directions, useful for seeing a prototype in every direction)
      const axesHelper = new THREE.AxesHelper(20);
      axesHelper.position.set(-2, 0, -2);
      this.scene.add(axesHelper);

      // Debug for showing a single tile, change the [ ] number to get another rotation TODO
      // const prototype = Prototype.getPrototypesByType("blank")[0];
      const prototype = Prototype.getPrototypesByType("ceiling_1")[0];
      // const prototype = Prototype.getPrototypesByType("wall_1")[1];
      // const prototype = Prototype.getPrototypesByType("wall_top_1")[3];
      // const prototype = Prototype.getPrototypesByType("wall_angle_1")[3];
      // const prototype = Prototype.getPrototypesByType("wall_angle_reverse_top_1")[3];
      // const prototype = Prototype.getPrototypesByType("wall_angle_top_1")[3];

      this.tile = new Tile(
        prototype,
        new THREE.Vector3(0),
        this.tileDebugFolder,
      );

      this.scene.add(this.tile.model);
      this.tile.setHelper();

      // Debug for showing neighbours
      let neighboursTiles = {
        posX: [],
        negX: [],
        posY: [],
        negY: [],
        posZ: [],
        negZ: [],
      };
      for (let validNeighboursFace in prototype.valid_neighbours) {
        prototype.valid_neighbours[validNeighboursFace].forEach((neighbour) => {
          const n = Prototype.getPrototypeById(neighbour);
          neighboursTiles[validNeighboursFace].push(
            new Tile(n, new THREE.Vector3(), this.tileDebugFolder),
          );
        });
      }

      /**
       * Add a tile in a direction
       * @param {Tile[]} tiles
       * @param {THREE.Vector3} direction
       */
      const addInDirection = (tiles, direction) => {
        let i = 1;
        for (let tile of tiles) {
          const newPos = tile
            .getPosition()
            .add(direction.clone().multiplyScalar(i * (Tile.TILE_WIDTH + 1)));

          tile.setPosition(newPos);

          if (tile.model.isObject3D) {
            this.scene.add(tile.model);
          }

          i++;
          tile.setHelper();
        }
      };

      for (let direction in neighboursTiles) {
        const tiles = neighboursTiles[direction];
        const directionVec = DIRECTIONS[direction];
        addInDirection(tiles, directionVec);
      }

      //// Debug for showing every prototype and their different direction
      // this.tiles = {};
      // Prototype.prototypes.forEach((prototypes) => {
      //   if (!this.tiles[prototypes.type]) this.tiles[prototypes.type] = [];
      //   this.tiles[prototypes.type].push(new Tile(prototypes));
      // });
      //
      // let i = -4;
      // let j = -4;
      // for (let tileType in this.tiles) {
      //   this.tiles[tileType].forEach((tile) => {
      //     tile.model.position.x = i * (Tile.TILE_WIDTH + 1);
      //     tile.model.position.z = j * (Tile.TILE_WIDTH + 1);
      //     tile.updateHelper();
      //     i++;
      //   });
      //   i = 0;
      //   j++;
      // }
    });
  }

  // TODO : create Map class
  /**
   *
   * @param {THREE.Vector3} mapSize
   * @param {THREE.Vector3} cellSize
   */
  setMapHelper(mapSize, cellSize) {}

  /**
   *
   * @param {Cell[][][]} map
   * @param {Prototype[]} prototypes
   * @param {THREE.Vector3} cellSize
   */
  instantiateMap(map, prototypes, cellSize) {}

  /**
   * Clear the world
   */
  clear() {}

  onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  update() {}
}
