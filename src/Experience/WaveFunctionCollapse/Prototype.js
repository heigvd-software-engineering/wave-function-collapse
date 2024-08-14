import { TILE_ROTATION, TILE_TYPE } from "../Tile_constants.js";
import { DIRECTIONS } from "./Constants/Direction_constants.js";
import { SOCKET_TYPE } from "../Socket_constants.js";

class Prototype {
  constructor(type, rotation, sockets, weight = 0) {
    this.type = type;
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
     * @type {{
     *  posX: String[],
     *  negX: String[],
     *  posY: String[],
     *  negY: String[],
     *  posZ: String[],
     *  negZ: String[]
     * }}
     */
    this.valid_neighbours = {
      posX: [],
      negX: [],
      posY: [],
      negY: [],
      posZ: [],
      negZ: [],
    };

    this.id = `${this.type}-R${this.rotation}`;
  }

  /**
   * @param {Vector3} direction // TODO maybe change to a type ?
   * @returns {String[]} possiblePrototypesIds
   */
  getPossiblePrototypeIdsInDirection(direction) {
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

// TODO : not clean
const generateNeighbourIdList = () => {
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

    // Get only the ids
    for (let validNeighboursKey in valid_neighbours) {
      valid_neighbours[validNeighboursKey] = valid_neighbours[
        validNeighboursKey
      ].map((neighbour) => neighbour.id);
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
 *  socketId: string,
 *  isSymmetrical: boolean,
 *  verticalOrientation: string,
 *  isFlipped: boolean,
 *  hasReverseGround: boolean,
 *  isHorizontal: boolean,
 *  hasGround: boolean,
 *  isBottom: boolean
 * }}
 */
const getSocketType = (socket) => {
  return {
    isHorizontal: isHorizontalSocket(socket),
    socketId: getSocketId(socket),
    isSymmetrical: socket.includes("S"),
    hasGround: socket.includes("G"),
    hasReverseGround: socket.includes("R"),
    isFlipped: socket.includes("F"),
    verticalOrientation: getVerticalSocketOrientation(socket),
    isBottom: socket.includes("B"),
    isBlank: socket.split("_")[1] === "0",
  };
};

const isHorizontalSocket = (socket) => {
  return socket.includes("H");
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
 * @returns {string} socketOrientation
 */
const getVerticalSocketOrientation = (socket) => {
  if (!isHorizontalSocket(socket)) {
    const socketNoBottom = socket.replace("_B", "");
    const split = socketNoBottom.split("_");
    const orientation = split[split.length - 1];
    return orientation;
  } else {
    return "-1";
  }
};

const prototypes = [
  new Prototype(
    TILE_TYPE.BLANK,
    TILE_ROTATION.R_None,
    {
      posX: SOCKET_TYPE.H_0_S,
      negX: SOCKET_TYPE.H_0_S,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_0_0_B,
      posZ: SOCKET_TYPE.H_0_S,
      negZ: SOCKET_TYPE.H_0_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.C1,
    TILE_ROTATION.R_None,
    {
      posX: SOCKET_TYPE.H_5_S,
      negX: SOCKET_TYPE.H_5_S,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_0_0_B,
      posZ: SOCKET_TYPE.H_5_S,
      negZ: SOCKET_TYPE.H_5_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.W1,
    TILE_ROTATION.R0,
    {
      posX: SOCKET_TYPE.H_1_S,
      negX: SOCKET_TYPE.H_1_S,
      posY: SOCKET_TYPE.V_1_0,
      negY: SOCKET_TYPE.V_1_0_B,
      posZ: SOCKET_TYPE.H_0_S,
      negZ: SOCKET_TYPE.H_0_S,
    },
    2,
  ),
  new Prototype(
    TILE_TYPE.W1,
    TILE_ROTATION.R1,
    {
      posX: SOCKET_TYPE.H_0_S,
      negX: SOCKET_TYPE.H_0_S,
      posY: SOCKET_TYPE.V_1_1,
      negY: SOCKET_TYPE.V_1_1_B,
      posZ: SOCKET_TYPE.H_1_S,
      negZ: SOCKET_TYPE.H_1_S,
    },
    2,
  ),
  // new Prototype(
  //   TILE_TYPE.W1,
  //   TILE_ROTATION.R2,
  //   {
  //     posX: SOCKET_TYPE.H_1_S,
  //     negX: SOCKET_TYPE.H_1_S,
  //     posY: SOCKET_TYPE.V_1_0,
  //     negY: SOCKET_TYPE.V_1_0_B,
  //     posZ: SOCKET_TYPE.H_0_S,
  //     negZ: SOCKET_TYPE.H_0_S,
  //   },
  //   2,
  // ),
  // new Prototype(
  //   TILE_TYPE.W1,
  //   TILE_ROTATION.R3,
  //   {
  //     posX: SOCKET_TYPE.H_0_S,
  //     negX: SOCKET_TYPE.H_0_S,
  //     posY: SOCKET_TYPE.V_1_1,
  //     negY: SOCKET_TYPE.V_1_1_B,
  //     posZ: SOCKET_TYPE.H_1_S,
  //     negZ: SOCKET_TYPE.H_1_S,
  //   },
  //   2,
  // ),
  new Prototype(
    TILE_TYPE.WA1,
    TILE_ROTATION.R0,
    {
      posX: SOCKET_TYPE.H_1_S,
      negX: SOCKET_TYPE.H_0_S,
      posY: SOCKET_TYPE.V_2_1,
      negY: SOCKET_TYPE.V_2_1_B,
      posZ: SOCKET_TYPE.H_1_S,
      negZ: SOCKET_TYPE.H_0_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WA1,
    TILE_ROTATION.R1,
    {
      posX: SOCKET_TYPE.H_0_S,
      negX: SOCKET_TYPE.H_1_S,
      posY: SOCKET_TYPE.V_2_2,
      negY: SOCKET_TYPE.V_2_2_B,
      posZ: SOCKET_TYPE.H_1_S,
      negZ: SOCKET_TYPE.H_0_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WA1,
    TILE_ROTATION.R2,
    {
      posX: SOCKET_TYPE.H_0_S,
      negX: SOCKET_TYPE.H_1_S,
      posY: SOCKET_TYPE.V_2_3,
      negY: SOCKET_TYPE.V_2_3_B,
      posZ: SOCKET_TYPE.H_0_S,
      negZ: SOCKET_TYPE.H_1_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WA1,
    TILE_ROTATION.R3,
    {
      posX: SOCKET_TYPE.H_1_S,
      negX: SOCKET_TYPE.H_0_S,
      posY: SOCKET_TYPE.V_2_0,
      negY: SOCKET_TYPE.V_2_0_B,
      posZ: SOCKET_TYPE.H_0_S,
      negZ: SOCKET_TYPE.H_1_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WART1,
    TILE_ROTATION.R0,
    {
      posX: SOCKET_TYPE.H_4_F,
      negX: SOCKET_TYPE.H_5_S,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_2_1_B,
      posZ: SOCKET_TYPE.H_4,
      negZ: SOCKET_TYPE.H_5_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WART1,
    TILE_ROTATION.R1,
    {
      posX: SOCKET_TYPE.H_5_S,
      negX: SOCKET_TYPE.H_4,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_2_2_B,
      posZ: SOCKET_TYPE.H_4_F,
      negZ: SOCKET_TYPE.H_5_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WART1,
    TILE_ROTATION.R2,
    {
      posX: SOCKET_TYPE.H_5_S,
      negX: SOCKET_TYPE.H_4_F,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_2_3_B,
      posZ: SOCKET_TYPE.H_5_S,
      negZ: SOCKET_TYPE.H_4,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WART1,
    TILE_ROTATION.R3,
    {
      posX: SOCKET_TYPE.H_4,
      negX: SOCKET_TYPE.H_5_S,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_2_0_B,
      posZ: SOCKET_TYPE.H_5_S,
      negZ: SOCKET_TYPE.H_4_F,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WAT1,
    TILE_ROTATION.R0,
    {
      posX: SOCKET_TYPE.H_4,
      negX: SOCKET_TYPE.H_0_S,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_2_1_B,
      posZ: SOCKET_TYPE.H_4_F,
      negZ: SOCKET_TYPE.H_0_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WAT1,
    TILE_ROTATION.R1,
    {
      posX: SOCKET_TYPE.H_0_S,
      negX: SOCKET_TYPE.H_4_F,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_2_2_B,
      posZ: SOCKET_TYPE.H_4,
      negZ: SOCKET_TYPE.H_0_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WAT1,
    TILE_ROTATION.R2,
    {
      posX: SOCKET_TYPE.H_0_S,
      negX: SOCKET_TYPE.H_4,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_2_3_B,
      posZ: SOCKET_TYPE.H_0_S,
      negZ: SOCKET_TYPE.H_4_F,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WAT1,
    TILE_ROTATION.R3,
    {
      posX: SOCKET_TYPE.H_4_F,
      negX: SOCKET_TYPE.H_0_S,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_2_0_B,
      posZ: SOCKET_TYPE.H_0_S,
      negZ: SOCKET_TYPE.H_4,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WT1,
    TILE_ROTATION.R0,
    {
      posX: SOCKET_TYPE.H_4,
      negX: SOCKET_TYPE.H_4_F,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_1_0_B,
      posZ: SOCKET_TYPE.H_5_S,
      negZ: SOCKET_TYPE.H_0_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WT1,
    TILE_ROTATION.R1,
    {
      posX: SOCKET_TYPE.H_0_S,
      negX: SOCKET_TYPE.H_5_S,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_1_1_B,
      posZ: SOCKET_TYPE.H_4,
      negZ: SOCKET_TYPE.H_4_F,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WT1,
    TILE_ROTATION.R2,
    {
      posX: SOCKET_TYPE.H_4_F,
      negX: SOCKET_TYPE.H_4,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_1_0_B,
      posZ: SOCKET_TYPE.H_0_S,
      negZ: SOCKET_TYPE.H_5_S,
    },
    1,
  ),
  new Prototype(
    TILE_TYPE.WT1,
    TILE_ROTATION.R3,
    {
      posX: SOCKET_TYPE.H_5_S,
      negX: SOCKET_TYPE.H_0_S,
      posY: SOCKET_TYPE.V_0_0,
      negY: SOCKET_TYPE.V_1_1_B,
      posZ: SOCKET_TYPE.H_4_F,
      negZ: SOCKET_TYPE.H_4,
    },
    1,
  ),
];

generateNeighbourIdList();

/**
 * Get the prototype by its id
 * @param id
 * @returns {Prototype}
 */
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
