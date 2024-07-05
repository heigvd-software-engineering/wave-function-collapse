import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Tile from "./Tile.js";
import * as THREE from "three";
import * as Prototype from "../Prototype.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

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

      this.tiles = {};
      Prototype.prototypes.forEach((prototypes) => {
        if (!this.tiles[prototypes.type]) this.tiles[prototypes.type] = [];
        this.tiles[prototypes.type].push(new Tile(prototypes));
      });

      let i = -4;
      let j = -4;
      for (let tileType in this.tiles) {
        this.tiles[tileType].forEach((tile) => {
          tile.model.position.x = i * (Tile.TILE_WIDTH + 1);
          tile.model.position.z = j * (Tile.TILE_WIDTH + 1);
          tile.updateHelper();
          i++;
        });
        i = 0;
        j++;
      }
    });
  }

  update() {}
}
