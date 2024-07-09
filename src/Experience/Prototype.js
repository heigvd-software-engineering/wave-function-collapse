import Sources from "./sources.js";
import * as THREE from "three";

// TODO factorize (same as in WaveFunctionCollapse.js)
const DIRECTIONS = {
  posX: new THREE.Vector3(1, 0, 0),
  negX: new THREE.Vector3(-1, 0, 0),
  posY: new THREE.Vector3(0, 1, 0),
  negY: new THREE.Vector3(0, -1, 0),
  posZ: new THREE.Vector3(0, 0, 1),
  negZ: new THREE.Vector3(0, 0, -1),
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
  V_0_S: "V_0_S",
  /*
   xxxxxxx
   x#####x
   x#####x
   x#####x
   xxxxxxx
  */
  V_0_G_S: "V_0_G_S",
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
  V_0_S_B: "V_0_S_B",
  V_1_B: "V_1_B",
  V_1_F_B: "V_1_F_B",
  V_2_0_B: "V_2_0_B",
  V_2_1_B: "V_2_1_B",
  V_2_2_B: "V_2_2_B",
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

class Prototype {
  constructor(type, rotation, sockets, weight = 0) {
    this.type = type;
    this.mesh = Sources.find((source) => source.name === this.type)?.path;
    this.rotation = rotation;
    this.weight = weight;

    // Sockets
    this.posX = sockets.posX;
    this.negX = sockets.negX;
    this.posY = sockets.posY;
    this.negY = sockets.negY;
    this.posZ = sockets.posZ;
    this.negZ = sockets.negZ;

    /**
     * Valid Neighbours
     * @type {}
     */
    this.valid_neighbours = null;

    this.id = `${this.type}-R${this.rotation}`;
  }

  /**
   * @param {THREE.Vector3} direction // TODO maybe change to a type ?
   * @returns {Prototype[]} possiblePrototypes
   */
  getPossiblePrototypesInDirection(direction) {
    // TODO : pas très esthétique

    if (direction.equals(DIRECTIONS.posX)) {
      return this.valid_neighbours.posX;
    } else if (direction.equals(DIRECTIONS.negX)) {
      return this.valid_neighbours.negX;
    } else if (direction.equals(DIRECTIONS.posY)) {
      return this.valid_neighbours.posY;
    } else if (direction.equals(DIRECTIONS.negY)) {
      return this.valid_neighbours.negY;
    } else if (direction.equals(DIRECTIONS.posZ)) {
      return this.valid_neighbours.posZ;
    } else if (direction.equals(DIRECTIONS.negZ)) {
      return this.valid_neighbours.negZ;
    } else {
      console.error("Invalid direction");
      return [];
    }
  }
}

const generateNeightbourList = () => {
  const grouped_prototypes = Object.groupBy(
    prototypes,
    (prototype) => prototype.type,
  );

  prototypes.forEach((prototype) => {
    const valid_neighbours = {
      posX: [],
      negX: [],
      posY: [],
      negY: [],
      posZ: [],
      negZ: [],
    };

    for (let validNeighboursFace in valid_neighbours) {
      const face = validNeighboursFace; // e.g. posX
      const opposite_face = getOppositeSocketFace(face); // e.g. negX

      // For each face of the prototype, check compatibility with all opposite faces from all other prototypes
      prototypes.forEach((other_prototype) => {
        const socket = getSocketType(prototype[face]);
        const other_socket = getSocketType(other_prototype[opposite_face]);

        if (socket.isHorizontal) {
          // Horizontal H_...
          if (
            socket.isSymmetrical &&
            prototype[face] === other_prototype[opposite_face]
          ) {
            valid_neighbours[face].push(other_prototype);
          } else {
            // if Asymmetrical ..._F or none
            // Should snap to the same opposite socket
            // (if it has ..._F should snap to the same socket without _F and vice versa)
            if (
              prototype[face] === other_prototype[opposite_face] + "_F" ||
              prototype[face] + "_F" === other_prototype[opposite_face]
            ) {
              valid_neighbours[face].push(other_prototype);
            }
          }
        } else {
          // Vertical V_...
          if (
            // TODO : Ground ?
            socket.socketId === other_socket.socketId &&
            socket.verticalOrientation === other_socket.verticalOrientation
          ) {
            valid_neighbours[face].push(other_prototype);
          }
        }
      });
    }

    prototype.valid_neighbours = valid_neighbours;
  });
};

/**
 * Get the opposite socket face (e.g. posZ -> negZ)
 * @param socketFace
 * @returns {string} opposite socketFace
 */
const getOppositeSocketFace = (socketFace) => {
  if (socketFace.includes("pos")) {
    return socketFace.replace("pos", "neg");
  } else {
    return socketFace.replace("neg", "pos");
  }
};

/**
 * Decode the socket string to an object
 * (e.g. H_4_F -> {socketId: 4, isSymmetrical: false, verticalOrientation: 0, isFlipped: true, hasReverseGround: false, isHorizontal: true, hasGround: false, isBottom: false})
 * @param socket
 * @returns {{
 *   isHorizontal: boolean,
 *   socketId: socketId,
 *   isSymmetrical: boolean,
 *   verticalOrientation: number,
 *   isFlipped: boolean,
 *   hasReverseGround: boolean,
 *   hasGround: boolean,
 *   isBottom: boolean
 * }}
 */
const getSocketType = (socket) => {
  return {
    isHorizontal: socket.includes("H"),
    socketId: getSocketId(socket),
    isSymmetrical: socket.includes("S"),
    hasGround: socket.includes("G"),
    hasReverseGround: socket.includes("R"),
    isFlipped: socket.includes("F"),
    verticalOrientation: getVerticalSocketOrientation(socket),
    isBottom: socket.includes("B"),
  };
};

/**
 * Get the socket id from the socket string (e.g. H_5_S -> 5)
 * @param socket
 * @returns socketId
 */
const getSocketId = (socket) => {
  const split = socket.split("_");
  return split[1];
};

/**
 * Get the vertical orientation from the socket string (e.g. V_2_1_B -> 1)
 * @param socket
 * @returns socketOrientation
 */
const getVerticalSocketOrientation = (socket) => {
  const socketNoBottom = socket.replace("_B", "");
  const split = socketNoBottom.split("_");
  const orientation = split[split.length - 1];
  return orientation;
};

// TODO : verifier les bottoms, la direction semble incorrecte
const prototypes = [
  new Prototype(TILE_TYPE.BLANK, TILE_ROTATION.R_None, {
    posX: SOCKET_TYPE.H_0_S,
    negX: SOCKET_TYPE.H_0_S,
    posY: SOCKET_TYPE.V_0_S,
    negY: SOCKET_TYPE.V_0_S_B,
    posZ: SOCKET_TYPE.H_0_S,
    negZ: SOCKET_TYPE.H_0_S,
  }),
  new Prototype(TILE_TYPE.C1, TILE_ROTATION.R_None, {
    posX: SOCKET_TYPE.H_5_S,
    negX: SOCKET_TYPE.H_5_S,
    posY: SOCKET_TYPE.V_0_G_S,
    negY: SOCKET_TYPE.V_0_S_B,
    posZ: SOCKET_TYPE.H_5_S,
    negZ: SOCKET_TYPE.H_5_S,
  }),
  new Prototype(TILE_TYPE.W1, TILE_ROTATION.R0, {
    posX: SOCKET_TYPE.H_1_S,
    negX: SOCKET_TYPE.H_1_S,
    posY: SOCKET_TYPE.V_1_1,
    negY: SOCKET_TYPE.V_1_F_B,
    posZ: SOCKET_TYPE.H_0_S,
    negZ: SOCKET_TYPE.H_0_S,
  }),
  new Prototype(TILE_TYPE.W1, TILE_ROTATION.R1, {
    posX: SOCKET_TYPE.H_0_S,
    negX: SOCKET_TYPE.H_0_S,
    posY: SOCKET_TYPE.V_1_1,
    negY: SOCKET_TYPE.V_1_F_B,
    posZ: SOCKET_TYPE.H_1_S,
    negZ: SOCKET_TYPE.H_1_S,
  }),
  new Prototype(TILE_TYPE.W1, TILE_ROTATION.R2, {
    posX: SOCKET_TYPE.H_1_S,
    negX: SOCKET_TYPE.H_1_S,
    posY: SOCKET_TYPE.V_1_1,
    negY: SOCKET_TYPE.V_1_F_B,
    posZ: SOCKET_TYPE.H_0_S,
    negZ: SOCKET_TYPE.H_0_S,
  }),
  new Prototype(TILE_TYPE.W1, TILE_ROTATION.R3, {
    posX: SOCKET_TYPE.H_0_S,
    negX: SOCKET_TYPE.H_0_S,
    posY: SOCKET_TYPE.V_1_1,
    negY: SOCKET_TYPE.V_1_F_B,
    posZ: SOCKET_TYPE.H_1_S,
    negZ: SOCKET_TYPE.H_1_S,
  }),
  new Prototype(TILE_TYPE.WA1, TILE_ROTATION.R0, {
    posX: SOCKET_TYPE.H_1_S,
    negX: SOCKET_TYPE.H_0_S,
    posY: SOCKET_TYPE.V_2_1,
    negY: SOCKET_TYPE.V_2_2_B,
    posZ: SOCKET_TYPE.H_1_S,
    negZ: SOCKET_TYPE.H_0_S,
  }),
  new Prototype(TILE_TYPE.WA1, TILE_ROTATION.R1, {
    posX: SOCKET_TYPE.H_0_S,
    negX: SOCKET_TYPE.H_1_S,
    posY: SOCKET_TYPE.V_2_2,
    negY: SOCKET_TYPE.V_2_1_B,
    posZ: SOCKET_TYPE.H_1_S,
    negZ: SOCKET_TYPE.H_0_S,
  }),
  new Prototype(TILE_TYPE.WA1, TILE_ROTATION.R2, {
    posX: SOCKET_TYPE.H_0_S,
    negX: SOCKET_TYPE.H_1_S,
    posY: SOCKET_TYPE.V_2_3,
    negY: SOCKET_TYPE.V_2_0_B,
    posZ: SOCKET_TYPE.H_0_S,
    negZ: SOCKET_TYPE.H_1_S,
  }),
  new Prototype(TILE_TYPE.WA1, TILE_ROTATION.R3, {
    posX: SOCKET_TYPE.H_1_S,
    negX: SOCKET_TYPE.H_0_S,
    posY: SOCKET_TYPE.V_2_0,
    negY: SOCKET_TYPE.V_2_3_B,
    posZ: SOCKET_TYPE.H_0_S,
    negZ: SOCKET_TYPE.H_1_S,
  }),
  new Prototype(TILE_TYPE.WART1, TILE_ROTATION.R0, {
    posX: SOCKET_TYPE.H_4_F,
    negX: SOCKET_TYPE.H_5_S,
    posY: SOCKET_TYPE.V_2_RG_1,
    negY: SOCKET_TYPE.V_2_2_B,
    posZ: SOCKET_TYPE.H_4,
    negZ: SOCKET_TYPE.H_5_S,
  }),
  new Prototype(TILE_TYPE.WART1, TILE_ROTATION.R1, {
    posX: SOCKET_TYPE.H_5_S,
    negX: SOCKET_TYPE.H_4,
    posY: SOCKET_TYPE.V_2_RG_2,
    negY: SOCKET_TYPE.V_2_1_B,
    posZ: SOCKET_TYPE.H_4_F,
    negZ: SOCKET_TYPE.H_5_S,
  }),
  new Prototype(TILE_TYPE.WART1, TILE_ROTATION.R2, {
    posX: SOCKET_TYPE.H_5_S,
    negX: SOCKET_TYPE.H_4_F,
    posY: SOCKET_TYPE.V_2_RG_3,
    negY: SOCKET_TYPE.V_2_0_B,
    posZ: SOCKET_TYPE.H_5_S,
    negZ: SOCKET_TYPE.H_4,
  }),
  new Prototype(TILE_TYPE.WART1, TILE_ROTATION.R3, {
    posX: SOCKET_TYPE.H_4,
    negX: SOCKET_TYPE.H_5_S,
    posY: SOCKET_TYPE.V_2_RG_0,
    negY: SOCKET_TYPE.V_2_3_B,
    posZ: SOCKET_TYPE.H_5_S,
    negZ: SOCKET_TYPE.H_4_F,
  }),
  new Prototype(TILE_TYPE.WAT1, TILE_ROTATION.R0, {
    posX: SOCKET_TYPE.H_4,
    negX: SOCKET_TYPE.H_0_S,
    posY: SOCKET_TYPE.V_2_G_1,
    negY: SOCKET_TYPE.V_2_2_B,
    posZ: SOCKET_TYPE.H_4_F,
    negZ: SOCKET_TYPE.H_0_S,
  }),
  new Prototype(TILE_TYPE.WAT1, TILE_ROTATION.R1, {
    posX: SOCKET_TYPE.H_0_S,
    negX: SOCKET_TYPE.H_4_F,
    posY: SOCKET_TYPE.V_2_G_2,
    negY: SOCKET_TYPE.V_2_1_B,
    posZ: SOCKET_TYPE.H_4,
    negZ: SOCKET_TYPE.H_0_S,
  }),
  new Prototype(TILE_TYPE.WAT1, TILE_ROTATION.R2, {
    posX: SOCKET_TYPE.H_0_S,
    negX: SOCKET_TYPE.H_4,
    posY: SOCKET_TYPE.V_2_G_3,
    negY: SOCKET_TYPE.V_2_0_B,
    posZ: SOCKET_TYPE.H_0_S,
    negZ: SOCKET_TYPE.H_4_F,
  }),
  new Prototype(TILE_TYPE.WAT1, TILE_ROTATION.R3, {
    posX: SOCKET_TYPE.H_4_F,
    negX: SOCKET_TYPE.H_0_S,
    posY: SOCKET_TYPE.V_2_G_0,
    negY: SOCKET_TYPE.V_2_3_B,
    posZ: SOCKET_TYPE.H_0_S,
    negZ: SOCKET_TYPE.H_4,
  }),
  new Prototype(TILE_TYPE.WT1, TILE_ROTATION.R0, {
    posX: SOCKET_TYPE.H_4,
    negX: SOCKET_TYPE.H_4_F,
    posY: SOCKET_TYPE.V_1_G_1,
    negY: SOCKET_TYPE.V_1_B,
    posZ: SOCKET_TYPE.H_5_S,
    negZ: SOCKET_TYPE.H_0_S,
  }),
  new Prototype(TILE_TYPE.WT1, TILE_ROTATION.R1, {
    posX: SOCKET_TYPE.H_0_S,
    negX: SOCKET_TYPE.H_5_S,
    posY: SOCKET_TYPE.V_1_G_2,
    negY: SOCKET_TYPE.V_1_F_B,
    posZ: SOCKET_TYPE.H_4,
    negZ: SOCKET_TYPE.H_4_F,
  }),
  new Prototype(TILE_TYPE.WT1, TILE_ROTATION.R2, {
    posX: SOCKET_TYPE.H_4_F,
    negX: SOCKET_TYPE.H_4,
    posY: SOCKET_TYPE.V_1_G_3,
    negY: SOCKET_TYPE.V_1_B,
    posZ: SOCKET_TYPE.H_0_S,
    negZ: SOCKET_TYPE.H_5_S,
  }),
  new Prototype(TILE_TYPE.WT1, TILE_ROTATION.R3, {
    posX: SOCKET_TYPE.H_5_S,
    negX: SOCKET_TYPE.H_0_S,
    posY: SOCKET_TYPE.V_1_G_0,
    negY: SOCKET_TYPE.V_1_F_B,
    posZ: SOCKET_TYPE.H_4_F,
    negZ: SOCKET_TYPE.H_4,
  }),
];

generateNeightbourList();

// prototypes.forEach((prototype) => {
// console.log("\n\n");
// console.log(prototype.id);
// console.log(prototype.mesh);
// for (let validNeighboursKey in prototype.valid_neighbours) {
//   console.log("## " + validNeighboursKey);
//   prototype.valid_neighbours[validNeighboursKey].forEach((neighbour) => {
//     console.log("# " + neighbour.id);
//   });
// }
// });

const getPrototypeById = (id) => {
  return prototypes.find((prototype) => prototype.id === id);
};

const getPrototypesByType = (type) => {
  return prototypes.filter((prototype) => prototype.type === type);
};

export {
  prototypes,
  TILE_TYPE,
  TILE_ROTATION,
  SOCKET_TYPE,
  getPrototypeById,
  getPrototypesByType,
};
