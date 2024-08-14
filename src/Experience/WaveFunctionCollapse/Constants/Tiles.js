// Number of (π/2) rotations
const TILE_ROTATION = {
  R_None: -1, // For symmetrical tiles
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
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

export { TILE_ROTATION, TILE_TYPE };
