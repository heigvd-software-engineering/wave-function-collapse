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

const socketsCompatiblityCheck = (socket, other_socket) => {
  const socketType = getSocketType(socket);
  const other_socketType = getSocketType(other_socket);

  // Checks if the other prototype is compatible with the current prototype
  if (socketType.isHorizontal) {
    // Horizontal H_...
    if (socketType.isSymmetrical && socket === other_socket) {
      return true;
    } else {
      // if Asymmetrical ..._F or none
      // Should snap to the same opposite socket
      // (if it has ..._F should snap to the same socket without _F and vice versa)
      if (socket === other_socket + "_F" || socket + "_F" === other_socket) {
        return true;
      }
    }
  } else {
    // Vertical V_...
    if (
      // TODO : Ground ?
      socketType.socketId === other_socketType.socketId &&
      socketType.verticalOrientation === other_socketType.verticalOrientation
    ) {
      return true;
    }
  }
};

export {
  getOppositeSocketFace,
  getSocketType,
  isHorizontalSocket,
  getSocketId,
  getVerticalSocketOrientation,
  socketsCompatiblityCheck,
};
