import { Vector3 } from "three";

// TODO factorize (same as in WaveFunctionCollapse.js)
const DIRECTIONS = {
  posX: new Vector3(1, 0, 0),
  negX: new Vector3(-1, 0, 0),
  posY: new Vector3(0, 1, 0),
  negY: new Vector3(0, -1, 0),
  posZ: new Vector3(0, 0, 1),
  negZ: new Vector3(0, 0, -1),
};

// Number of (π/2) rotations
const TILE_ROTATION = {
  R_None: -1, // For symmetrical tiles
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
};

// B = bottom
// H = horizontal
// V = vertical
// S = symmetrical
// G = ground
// RG = reverse ground
// F = flipped
//
// [V/H]_[SOCKET_ID]_[S/F]?_[G/RG]?_[ROTATION_Number]?_[B]?
const SOCKET_TYPE = {
  /*
   xxxxxxx
   x     x
   x     x
   x     x
   xxxxxxx
  */
  H_0_S: "H_0_S",
  /*
   xxxxxxx
   x  │  x
   x  │  x
   x  │  x
   xxxxxxx
  */
  H_1_S: "H_1_S",
  /*
    xxxxxxx
    x──┐  x
    x  |  x
    x  |  x
    xxxxxxx
   */
  H_4: "H_4",
  /*
    xxxxxxx
    x  ┌──x
    x  |  x
    x  |  x
    xxxxxxx
   */
  H_4_F: "H_4_F",
  /*
    xxxxxxx
    x─────x
    x     x
    x     x
    xxxxxxx
   */
  H_5_S: "H_5_S",

  ////
  // VERTICALS
  ////
  /*
   xxxxxxx
   x     x
   x     x
   x     x
   xxxxxxx
  */
  V_0_0: "V_0_0",
  /*
   xxxxxxx
   x#####x
   x#####x
   x#####x
   xxxxxxx
  */
  V_0_G_0: "V_0_G_S",
  /*
   xxxxxxx
   x  │  x
   x  │  x
   x  │  x
   xxxxxxx
  */
  V_1_0: "V_1_0",
  /*
   xxxxxxx
   x     x
   x─────x
   x     x
   xxxxxxx
  */
  V_1_1: "V_1_1",
  /*
   xxxxxxx
   x     x
   x─────x
   x#####x
   xxxxxxx
  */
  V_1_G_0: "V_1_G_0",
  /*
   xxxxxxx
   x##│  x
   x##│  x
   x##│  x
   xxxxxxx
  */
  V_1_G_1: "V_1_G_1",
  /*
   xxxxxxx
   x#####x
   x─────x
   x     x
   xxxxxxx
  */
  V_1_G_2: "V_1_G_2",
  /*
   xxxxxxx
   x  │##x
   x  │##x
   x  │##x
   xxxxxxx
  */
  V_1_G_3: "V_1_G_3",
  /*
   xxxxxxx
   x     x
   x  ┌──x
   x  │  x
   xxxxxxx
  */
  V_2_0: "V_2_0",
  /*
   xxxxxxx
   x     x
   x──┐  x
   x  │  x
   xxxxxxx
  */
  V_2_1: "V_2_1",
  /*
   xxxxxxx
   x  |  x
   x──│  x
   x     x
   xxxxxxx
  */
  V_2_2: "V_2_2",
  /*
   xxxxxxx
   x  |  x
   x  └──x
   x     x
   xxxxxxx
  */
  V_2_3: "V_2_3",
  /*
   xxxxxxx
   x     x
   x  ┌──x
   x  │##x
   xxxxxxx
  */
  V_2_G_0: "V_2_G_0",
  /*
   xxxxxxx
   x     x
   x──┐  x
   x##│  x
   xxxxxxx
  */
  V_2_G_1: "V_2_G_1",
  /*
   xxxxxxx
   x##|  x
   x──│  x
   x     x
   xxxxxxx
  */
  V_2_G_2: "V_2_G_2",
  /*
   xxxxxxx
   x  |##x
   x  └──x
   x     x
   xxxxxxx
  */
  V_2_G_3: "V_2_G_3",
  /*
   xxxxxxx
   x#####x
   x##┌──x
   x##│  x
   xxxxxxx
  */
  V_2_RG_0: "V_2_RG_0",
  /*
   xxxxxxx
   x#####x
   x──┐##x
   x  │##x
   xxxxxxx
  */
  V_2_RG_1: "V_2_RG_1",
  /*
   xxxxxxx
   x  |##x
   x──│##x
   x#####x
   xxxxxxx
  */
  V_2_RG_2: "V_2_RG_2",
  /*
   xxxxxxx
   x##|  x
   x##└──x
   x#####x
   xxxxxxx
  */
  V_2_RG_3: "V_2_RG_3",

  //// VERTICALS BOTTOM
  /*
   xxxxxxx
   x     x
   x     x
   x     x
   xxxxxxx
  */
  V_0_0_B: "V_0_0_B",
  /*
   xxxxxxx
   x  │  x
   x  │  x
   x  │  x
   xxxxxxx
  */
  V_1_0_B: "V_1_0_B",
  /*
   xxxxxxx
   x     x
   x─────x
   x     x
   xxxxxxx
  */
  V_1_1_B: "V_1_1_B",
  /*
   xxxxxxx
   x     x
   x  ┌──x
   x  │  x
   xxxxxxx
  */
  V_2_0_B: "V_2_0_B",
  /*
   xxxxxxx
   x     x
   x──┐  x
   x  │  x
   xxxxxxx
  */
  V_2_1_B: "V_2_1_B",
  /*
   xxxxxxx
   x  |  x
   x──│  x
   x     x
   xxxxxxx
  */
  V_2_2_B: "V_2_2_B",
  /*
   xxxxxxx
   x  |  x
   x  └──x
   x     x
   xxxxxxx
  */
  V_2_3_B: "V_2_3_B",
};

// Tile types and their corresponding mesh names
const TILE_TYPE = {
  BLANK: "blank",
  C1: "ceiling_1",
  G1: "ground_1",
  W1: "wall_1",
  WA1: "wall_angle_1",
  WART1: "wall_angle_reverse_top_1",
  WAT1: "wall_angle_top_1",
  WT1: "wall_top_1",
};

export { DIRECTIONS, SOCKET_TYPE, TILE_ROTATION, TILE_TYPE };
