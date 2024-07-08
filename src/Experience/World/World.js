import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Tile from "./Tile.js";
import * as THREE from "three";
import * as Prototype from "../Prototype.js";
import { Vector3 } from "three";

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
      this.tileDebugFolder.close();
    }

    // Wait for resources
    this.resources.on("ready", () => {
      // Setup
      this.environment = new Environment();

      // this.tiles = {
      //   ceiling_1: new Tile("ceiling_1"),
      //   // ground_1: new Tile("ground_1"),
      //   wall_1: new Tile("wall_1"),
      //   wall_angle_1: new Tile("wall_angle_1"),
      //   wall_angle_reverse_top_1: new Tile("wall_angle_reverse_top_1"),
      //   wall_angle_top_1: new Tile("wall_angle_top_1"),
      //   wall_top_1: new Tile("wall_top_1"),
      // };

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
  setMapHelper(mapSize, cellSize) {
    for (let x = 0; x < mapSize.x; x++) {
      for (let y = 0; y < mapSize.y; y++) {
        for (let z = 0; z < mapSize.z; z++) {
          // Debug box
          const box = new THREE.Box3();
          const boxPos = new Vector3(
            x * cellSize.x,
            y * cellSize.y,
            z * cellSize.z,
          );
          box.setFromCenterAndSize(
            boxPos,
            new THREE.Vector3(cellSize.x, cellSize.y, cellSize.z),
          );
          const helper = new THREE.Box3Helper(box, 0xff0000);

          this.scene.add(helper);
        }
      }
    }
  }

  /**
   *
   * @param {Cell[][][]} map
   * @param {Prototype[]} prototypes
   * @param {THREE.Vector3} cellSize
   */
  instantiateMap(map, prototypes, cellSize) {
    this.finalMap = map;
    this.tilesMap = [];
    for (let x = 0; x < map.length; x++) {
      this.tilesMap[x] = [];
      for (let y = 0; y < map[x].length; y++) {
        this.tilesMap[x][y] = [];
        for (let z = 0; z < map[x][y].length; z++) {
          this.tilesMap[x][y][z] = null;
        }
      }
    }

    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        for (let z = 0; z < map[x][y].length; z++) {
          const cell = map[x][y][z];

          if (this.debug.active && !cell.collapsed) {
            // Select error color
            let color;
            if (cell.possiblePrototypeIds.length === 0) {
              color = 0xff0000; // RED = Not collapsed but no possible prototype
            } else {
              color = 0x0000ff; // BLUE = Not collapsed
            }

            const geometry = new THREE.BoxGeometry(
              cellSize.x * 0.9,
              cellSize.y * 0.9,
              cellSize.z * 0.9,
            );

            const material = new THREE.MeshBasicMaterial({
              color: color,
            });

            material.transparent = true;
            material.opacity = 0.1;
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(x * cellSize.x, y * cellSize.y, z * cellSize.z);

            this.tilesMap[x][y][z] = { model: cube, cell: cell };

            this.scene.add(cube);
            continue;
          }

          const prototype = Prototype.getPrototypeById(cell.prototypeId);

          if (prototype) {
            const tile = new Tile(
              prototype,
              new Vector3(x * cellSize.x, y * cellSize.y, z * cellSize.z),
              this.tileDebugFolder,
            );
            tile.cell = cell;
            this.tilesMap[x][y][z] = tile;
          } else {
            console.error("Prototype not found, cell :", cell);
          }
        }
      }
    }
  }

  /**
   * Clear the world
   * TODO : not clean (difference between Tiles and "Debug cube")
   */
  clear() {
    if (!this.finalMap) return;

    this.tilesMap.forEach((x) => {
      x.forEach((y) => {
        y.forEach((z) => {
          if (z) {
            if (z.clear) {
              z.clear();
            }
            this.scene.remove(z.model);
          }
        });
      });
    });

    this.finalMap = null;
    this.tilesMap = null;
  }

  onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  update() {}
}
