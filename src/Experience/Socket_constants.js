// B = bottom
// H = horizontal
// V = vertical
// S = symmetrical
// G = ground
// RG = reverse ground
// F = flipped
//
// [V/H]_[SOCKET_ID]_[S/F]?_[G/RG]?_[ROTATION_Number]?_[B]?
export const SOCKET_TYPE = {
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
