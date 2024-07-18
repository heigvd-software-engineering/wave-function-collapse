import GUI from "lil-gui";

export default class Debug {
  constructor() {
    this.active = window.location.hash.includes("#debug");
    this.singleTileDebug = window.location.hash === "#debug-single-tile";

    // TODO: Keep the debug for buttons, maybe make some real buttons after
    // if (this.active) {
    this.ui = new GUI();
    // }
  }
}
