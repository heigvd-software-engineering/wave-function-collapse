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
    this.helperTiles = [];

    if (this.debug.active) {
      this.tileDebugFolder = this.debug.ui.addFolder("TILES");
      this.tileDebugFolder.close();
    }

    // Wait for resources
    this.resources.on("ready", () => {
      // Setup
      this.environment = new Environment();

      // Debug for showing each prototype once (without directions, useful for seeing a prototype in every direction)
      if (this.debug.active) {
        const axesHelper = new THREE.AxesHelper(40);
        axesHelper.position.set(-4, -4, -4);
        this.scene.add(axesHelper);
      }
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
          this.helperTiles.push(helper);

          this.scene.add(helper);
        }
      }
    }
  }

  /**
   * Clear the map helpers
   * TODO : not clean, would be best in a helper array
   */
  clearMapHelper() {
    for (let i = 0; i < this.helperTiles.length; i++) {
      this.scene.remove(this.helperTiles[i]);
    }
  }

  /**
   *
   * @param {Cell[][][]} map
   * @param {Prototype[]} prototypes
   * @param {THREE.Vector3} cellSize
   */
  instantiateMap(map, prototypes, cellSize) {
    if (this.resources.ready) {
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

            if (!cell.collapsed) {
              if (this.debug.active) {
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
                cube.position.set(
                  x * cellSize.x,
                  y * cellSize.y,
                  z * cellSize.z,
                );

                this.tilesMap[x][y][z] = { model: cube, cell: cell };

                this.scene.add(cube);
              } else {
                this.tilesMap[x][y][z] = {
                  model: { isObject3D: false },
                  cell: cell,
                };
              }
              continue;
            }

            const prototype = Prototype.getPrototypeById(cell.prototypeId);

            if (prototype) {
              const tile = new Tile(
                prototype,
                new Vector3(
                  x * cellSize.x,
                  y * cellSize.y - Tile.TILE_HEIGHT / 2, // TODO : fix this offset
                  z * cellSize.z,
                ),
                this.tileDebugFolder,
              );
              this.tilesMap[x][y][z] = {
                model: tile.model,
                tile: tile,
                cell: cell,
              };
              if (tile.model && tile.model.isObject3D) {
                // avoid adding blank tiles TODO : blank tile as model ?
                this.scene.add(tile.model);
              }
            } else {
              console.error("Prototype not found, cell :", cell);
            }
          }
        }
      }
    } else {
      // TODO : test
      this.resources.on("ready", () => {
        this.instantiateMap(map, prototypes, cellSize);
      });
    }
  }

  /**
   * Clear the world
   * TODO : WIP
   */
  clear() {
    this.clearMapHelper();

    if (!this.finalMap) return;

    // TODO : not clean
    this.tilesMap.forEach((x) => {
      x.forEach((y) => {
        y.forEach((z) => {
          if (z) {
            if (z.clear) {
              z.clear();
            }
            if (z.tile) {
              z.tile.clear();
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
