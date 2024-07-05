import Experience from "./Experience/Experience.js";
import * as WFC from "./Experience/WaveFunctionCollapse/WaveFunctionCollapse.js";
import * as THREE from "three";
import * as Prototype from "./Experience/Prototype.js";

const experience = new Experience(document.querySelector("canvas.webgl"));

experience.resources.on("ready", () => {
  const cellSize = new THREE.Vector3(4, 4, 4);
  const mapSize = new THREE.Vector3(5, 1, 5);

  experience.world.setMapHelper(mapSize, cellSize);

  WFC.initialize({
    newCellSize: cellSize,
    newMapSize: mapSize,
    prototypes: Prototype.prototypes,
  });

  const finalMap = WFC.start();

  experience.world.instantiateMap(finalMap, Prototype.prototypes, cellSize);
  console.log("addClickEvent");
  experience.addClickEvent();
});
