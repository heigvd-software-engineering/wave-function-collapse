import Cell from "./Cell.js";
import Vector3 from "./Utils/Vector3.js";

export default class Map {
  constructor(mapSize) {
    /**
     * Size of the map in cells unit
     * @type {Vector3} mapSize
     */
    this.mapSize = new Vector3(mapSize.x, mapSize.y, mapSize.z);

    /**
     * 3D map of cells
     * @type {Cell[][][]}
     */
    this.map = [];

    this.initEmptyMap();
  }

  /**
   * init 3d map (3d empty matrice of mapSize)
   */
  initEmptyMap() {
    // init 3d map, 3d matrice of mapSize
    for (let x = 0; x < this.mapSize.x; x++) {
      this.map[x] = [];
      for (let y = 0; y < this.mapSize.y; y++) {
        this.map[x][y] = [];
        for (let z = 0; z < this.mapSize.z; z++) {
          this.map[x][y][z] = new Cell(new Vector3(x, y, z));
        }
      }
    }
  }

  /**
   * Set the map cell at the given position
   * @param { Cell } cell
   * @param { Vector3 } position
   */
  setMapAtPosition(cell, position) {
    this.map[position.x][position.y][position.z] = cell;
  }

  /**
   * Get the map cell at the given position
   * @param { Vector3 } coords
   * @returns { Cell }
   */
  getCellAt(coords) {
    if (!this.isCoordsValid(coords)) {
      throw new Error(`Invalid coords ${coords}`);
    }

    return this.map[coords.x][coords.y][coords.z];
  }

  /**
   * Return false if the coords are out of the map
   * @param {Vector3} coords
   * @returns {boolean}
   */
  isCoordsValid(coords) {
    return (
      coords.x >= 0 &&
      coords.x < this.mapSize.x &&
      coords.y >= 0 &&
      coords.y < this.mapSize.y &&
      coords.z >= 0 &&
      coords.z < this.mapSize.z
    );
  }

  /**
   * Clear the map
   */
  clear() {
    this.initEmptyMap();
  }
}
