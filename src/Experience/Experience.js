import * as THREE from "three";

import Debug from "./Utils/Debug.js";
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";
import Resources from "./Utils/Resources.js";

import sources from "./sources.js";

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

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  // TODO : Clean this part
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

    // Click on a tile
    window.addEventListener("click", (event) => {
      if (this.intersects?.length > 0) {
        console.info("# Showing tile contents :");
        this.intersects
          .sort((a, b) => a.distance - b.distance)
          .forEach((intersect) => {
            if (intersect.object.prototypeContent) {
              console.info(
                "## Uncollapsed tile : ",
                intersect.object.prototypeContent,
              );
            } else {
              console.info("## Collapsed tile : ", intersect.object.tile);
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

    // Raycaster TODO Clean this part
    if (this.mouse) {
      if (this.intersects) {
        this.intersects.forEach((intersect) => {
          if (intersect.object.prototypeContent) {
            intersect.object.material.color.set("#ff0000");
          }
        });
      }

      const rayCaster = new THREE.Raycaster();
      rayCaster.setFromCamera(this.mouse, this.camera.instance);

      const objectsToTest = this.world.tilesMap.flat(2);

      this.intersects = rayCaster.intersectObjects(objectsToTest);
      this.intersects.forEach((intersect) => {
        if (intersect.object.prototypeContent) {
          intersect.object.material.color.set("#00ff00");
        }
      });
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
