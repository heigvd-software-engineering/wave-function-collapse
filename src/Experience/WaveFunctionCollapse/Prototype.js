import { TILE_ROTATION, TILE_TYPE } from "./Constants/Tiles.js";
import { DIRECTIONS } from "./Constants/Direction.js";
import { SOCKET_TYPE } from "./Constants/Sockets.js";
import {
  socketsCompatiblityCheck,
  getOppositeSocketFace,
  getSocketType,
} from "./SocketsUtils.js";

class Prototype {
  constructor(name, rotation, sockets, weight = 0) {
    /**
     * Model name
     * @type {String}
     */
    this.name = name;

    /**
     * Rotation of the model (0 to 3, clockwise)
     * @type {Number}
     */
    this.rotation = rotation;

    /**
     * Weight of the model (higher is more frequent)
     * @type {number}
     */
    this.weight = weight;

    // Sockets
    this.sockets = sockets;

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

    this.id = `${this.name}-R${this.rotation}`;
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
        const socket = prototype.sockets[face];
        const other_socket = other_prototype.sockets[opposite_face];

        if (socketsCompatiblityCheck(socket, other_socket)) {
          valid_neighbours[face].push(other_prototype);
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
  return prototypes.filter((prototype) => prototype.name === type);
};

export {
  prototypes,
  TILE_TYPE,
  TILE_ROTATION,
  SOCKET_TYPE,
  getPrototypeById,
  getPrototypesByType,
};
