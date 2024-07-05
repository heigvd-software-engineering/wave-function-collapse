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

    this.finalMap = null;
    this.tilesMap = null;

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
          // console.log("helper", helper.position);

          this.scene.add(helper);
        }
      }
    }
  }

  /**
   *
   * @param {string[][][][]} map
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
          // console.log("x y z", x, y, z);
          if (map[x][y][z].length === 0 || map[x][y][z].length > 1) {
            let color;
            if (map[x][y][z].length === 0) {
              color = 0xff0000;
            } else {
              color = 0x0000ff;
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

            cube.prototypeContent = map[x][y][z];
            this.tilesMap[x][y][z] = cube;

            this.scene.add(cube);
          } else {
            const prototype = prototypes.find(
              (prototype) => prototype.id === map[x][y][z][0],
            );

            if (prototype) {
              const tile = new Tile(
                prototype,
                new Vector3(x * cellSize.x, y * cellSize.y, z * cellSize.z),
              );
              const tileModel = tile.model.clone();
              tileModel.tile = tile;
              this.tilesMap[x][y][z] = tileModel;
            } else {
              console.error("Prototype not found, cell :", map[x][y][z][0]);
            }
          }
        }
      }
    }
  }

  onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  update() {}
}
