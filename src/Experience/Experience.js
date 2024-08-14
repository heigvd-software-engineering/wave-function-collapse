import * as THREE from "three";

import Debug from "./Utils/Debug.js";
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";
import WorldSingleTiles from "./World/WorldSingleTiles.js";
import Resources from "./Utils/Resources.js";

import sources from "./sources.js";
import { WaveFunctionCollapse } from "./WaveFunctionCollapse/WaveFunctionCollapse.js";
import * as Prototype from "./WaveFunctionCollapse/Prototype.js";
import { prototypes } from "./WaveFunctionCollapse/Prototype.js"; // TODO : remove this import

let instance = null;

export default class Experience {
  constructor(_canvas) {
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

    if (this.debug.active && this.debug.singleTileDebug) {
      this.world = new WorldSingleTiles();
    } else {
      this.world = new World();
    }

    // Wave Function Collapse

    // Keep in mind : on the side and the top border, the tiles are automatically blank
    /**
     * Size of the map in a 3D vector
     * @type {THREE.Vector3}
     */
    this.mapSize = new THREE.Vector3(10, 5, 10);
    this.cellSize = new THREE.Vector3(4, 4, 4);
    this.WFC = new WaveFunctionCollapse(prototypes, this.mapSize);

    this.wfcDebugObject = {
      manualIteration: () => {
        const partialMap = this.WFC.start(true);
        this.setMap(partialMap);
      },
      resumeOrStartIterations: () => {
        const finalMap = this.WFC.start();
        this.setMap(finalMap);
      },
      clearWFC: () => {
        this.WFC.reset();
        this.world.clear();
      },
    };

    if (!this.debug.singleTileDebug) {
      const mapSizeDebugFolder = this.debug.ui.addFolder("Map Size");
      mapSizeDebugFolder
        .add(this.mapSize, "x")
        .min(4)
        .max(20)
        .step(1)
        .onFinishChange(() => {
          this.wfcDebugObject.clearWFC();
        })
        .name("X");
      mapSizeDebugFolder
        .add(this.mapSize, "y")
        .min(2)
        .max(10)
        .step(1)
        .onFinishChange(() => {
          this.wfcDebugObject.clearWFC();
        })
        .name("Y");
      mapSizeDebugFolder
        .add(this.mapSize, "z")
        .min(4)
        .max(20)
        .step(1)
        .onFinishChange(() => {
          this.wfcDebugObject.clearWFC();
        })
        .name("Z");
    }

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  setMap(map) {
    this.world.clear();

    if (this.debug.active) {
      this.world.setMapHelper(this.mapSize, this.cellSize);
    }

    this.world.instantiateMap(map, Prototype.prototypes, this.cellSize);

    if (this.debug.active) this.addClickEvent();
  }

  start() {
    this.resources.on("ready", () => {
      if (this.debug.active) {
        this.world.setMapHelper(this.mapSize, this.cellSize);
      }

      // TODO : if bug with ressources init, put the new WaveFunctionCollapse in the resources ready event
      // this.WFC.initialize({
      //   newMapSize: this.mapSize,
      // });

      // TODO : keep this debug without debug mode active to start the WFC, need to make real button in the future instead of debug ui
      // Do not keep this when in singleTileDebug mode
      if (!this.debug.singleTileDebug) {
        this.debug.ui
          .add(this.wfcDebugObject, "manualIteration")
          .name("Manual Iteration");

        this.debug.ui
          .add(this.wfcDebugObject, "resumeOrStartIterations")
          .name("Resume or Start Iterations");

        this.debug.ui
          .add(this.wfcDebugObject, "clearWFC")
          .name("Clear the map and WFC");
      }
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
        console.log("Clicked on a tile"); // TODO : to remove
        console.log("Showing tile contents :");
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

  // TOOD : WIP, not tested
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
