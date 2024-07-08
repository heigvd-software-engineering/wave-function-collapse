import * as THREE from "three";
import Experience from "./Experience.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.debug = this.experience.debug;

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100,
    );
    this.instance.position.set(8, 4.05, 0.05);

    // Debug camera position for all faces
    if (this.debug.active) {
      const setAllViewFalse = () => {
        this.viewPosX = false;
        this.viewNegX = false;
        this.viewPosY = false;
        this.viewNegY = false;
        this.viewPosZ = false;
        this.viewNegZ = false;
      };

      const duration = 1;

      setAllViewFalse();
      this.viewPosX = true;

      this.debugFolder = this.debug.ui.addFolder("Camera");
      this.debugFolder.close();
      this.debugFolder
        .add(this, "viewPosX")
        .listen()
        .onChange(() => {
          setAllViewFalse();

          this.viewPosX = true;

          gsap.to(this.instance.position, {
            x: 8,
            y: 4.05,
            z: 0.05,
            duration: duration,
          });
        });
      this.debugFolder
        .add(this, "viewNegX")
        .listen()
        .onChange(() => {
          setAllViewFalse();

          this.viewNegX = true;

          gsap.to(this.instance.position, {
            x: -8,
            y: 4.1,
            z: 0.05,
            duration: duration,
          });
        });
      this.debugFolder
        .add(this, "viewPosY")
        .listen()
        .onChange(() => {
          setAllViewFalse();

          this.viewPosY = true;

          gsap.to(this.instance.position, {
            x: 0.05,
            y: 4.05,
            z: 8,
            duration: duration,
          });
        });
      this.debugFolder
        .add(this, "viewNegY")
        .listen()
        .onChange(() => {
          setAllViewFalse();

          this.viewNegY = true;

          gsap.to(this.instance.position, {
            x: 0.05,
            y: 4.05,
            z: -8,
            duration: duration,
          });
        });
      this.debugFolder
        .add(this, "viewPosZ")
        .listen()
        .onChange(() => {
          setAllViewFalse();

          this.viewPosZ = true;

          gsap.to(this.instance.position, {
            x: 0.05,
            y: 8,
            z: 0,
            duration: duration,
          });
        });
      this.debugFolder
        .add(this, "viewNegZ")
        .listen()
        .onChange(() => {
          setAllViewFalse();

          this.viewNegZ = true;

          gsap.to(this.instance.position, {
            x: 0.05,
            y: -8,
            z: 0,
            duration: duration,
          });
        });
    }

    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
