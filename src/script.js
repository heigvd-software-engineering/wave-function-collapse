import Experience from "./Experience/Experience.js";
import * as WFC from "./Experience/WaveFunctionCollapse/WaveFunctionCollapse.js";
import * as THREE from "three";
import * as Prototype from "./Experience/Prototype.js";

const experience = new Experience(document.querySelector("canvas.webgl"));

experience.start();
