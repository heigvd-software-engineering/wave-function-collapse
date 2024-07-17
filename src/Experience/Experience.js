import * as THREE from "three";

import Debug from "./Utils/Debug.js";
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";
// import World from "./World/WorldSingleTiles.js";
import Resources from "./Utils/Resources.js";

import sources from "./sources.js";
import * as WFC from "./WaveFunctionCollapse/WaveFunctionCollapse.js";
import * as Prototype from "./Prototype.js";
import { mapRange } from "gsap/gsap-core";

let instance = null;

export default class Experience {
  constructor(_canvas, cellSize = 4, mapSize = 10) {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;

    // Global access
    window.experience = this;

    // Options
    this.canvas = _canvas;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  start() {
    this.resources.on("ready", () => {
      const cellSize = new THREE.Vector3(4, 4, 4);

      // Keep in mind : on the side and the top border, the tiles are automatically blank
      const mapSize = new THREE.Vector3(10, 5, 10);

      this.world.setMapHelper(mapSize, cellSize);

      WFC.initialize({
        newMapSize: mapSize,
      });

      // const finalMap = WFC.start();

      let WfcDebugObject = {
        manualIteration: () => {
          const finalMap = WFC.manualIterate();

          this.world.clear();
          this.world.instantiateMap(finalMap, Prototype.prototypes, cellSize);

          if (this.debug.active) this.addClickEvent();
        },
        resumeOrStartIterations: () => {
          const finalMap = WFC.start();

          this.world.clear();
          this.world.instantiateMap(finalMap, Prototype.prototypes, cellSize);

          if (this.debug.active) this.addClickEvent();
        },
        clearWFC: () => {
          WFC.reset();
          this.world.clear();
        },
      };

      this.debug.ui
        .add(WfcDebugObject, "manualIteration")
        .name("Manual Iteration");

      this.debug.ui
        .add(WfcDebugObject, "resumeOrStartIterations")
        .name("Resume or Start Iterations");

      this.debug.ui.add(WfcDebugObject, "clearWFC").name("Clear");
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  // TODO : Clean this part
  // TODO Click Debug not working currently
  addClickEvent() {
    if (this.world.finalMap === null) {
      return;
    }

    /**
     * Mouse
     */
    this.mouse = new THREE.Vector2();
    this.currentIntersect = null;
    this.currentIntersectClicked = false;

    // Click on a tile TODO Click Debug not working currently
    window.addEventListener("click", (event) => {
      if (this.intersects?.length > 0) {
        console.info("# Showing tile contents :");
        this.intersects
          .sort((a, b) => a.distance - b.distance)
          .forEach((intersect) => {
            if (intersect.object.cell) {
              console.info("## Uncollapsed tile : ", intersect.object.cell);
            }
          });
      }
    });

    // Get the mouse position in normalized coordinates (-1 to +1)
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / this.sizes.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.sizes.height) * 2 + 1;
      // Do not shoot the ray here because some browser fire more event than the frame rate
    });
  }

  update() {
    this.camera.update();
    this.world.update();

    // TODO Click Debug not working currently
    if (this.debug.active && this.world.tilesMap) {
      // Raycaster TODO Clean this part
      if (this.mouse) {
        if (this.intersects) {
          this.intersects.forEach((intersect) => {
            intersect.object.material.opacity = 0.1;
          });
        }

        const rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(this.mouse, this.camera.instance);

        // TODO : error here
        const objectsToTest = this.world.tilesMap
          .flat(2)
          .filter((t) => t !== null)
          .filter((t) => t.model.isObject3D) // remove the blanks from the raycaster;
          .map((tile) => {
            // add the cell to the model for debug in raycaster
            tile.model.cell = JSON.parse(JSON.stringify(tile.cell));
            return tile.model;
          });
        try {
          this.intersects = rayCaster.intersectObjects(objectsToTest);
        } catch (error) {
          console.error("Error with raycaster", error);
        }
        this.intersects.forEach((intersect) => {
          intersect.object.material.opacity = 0.25;
        });
      }
    }

    this.renderer.update();
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    // Traverse the whole scene
    this.scene.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key];

          // Test if there is a dispose function
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.controls.dispose();
    this.renderer.instance.dispose();

    if (this.debug.active) this.debug.ui.destroy();
  }
}
