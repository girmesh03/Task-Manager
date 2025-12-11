/**
 * Socket.IO Singleton Instance
 *
 * Provides a centralized Socket.IO server instance that can be accessed
 * throughout the application. Initialized once in server.js.
 *
 * @module utils/socketInstance
 */

let io = null;

/**
 * Initialize the Socket.IO server instance
 * @param {import('socket.io').Server} socketServer - Socket.IO server instance
 */
export const initializeSocket = (socketServer) => {
  io = socketServer;
};

/**
 * Get the Socket.IO server instance
 * @returns {import('socket.io').Server | null} Socket.IO server instance
 * @throws {Error} If Socket.IO has not been initialized
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
};

export default { initializeSocket, getIO };
