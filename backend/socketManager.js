// backend/socketManager.js
import setupSocketIO from "./socket.js";
import { corsSocketOptions } from "./config/corsOptions.js";

let io;

/**
 * Initializes the Socket.IO server and stores the instance.
 * This should be called once when the server starts.
 * @param {http.Server} server - The HTTP server instance.
 * @returns The initialized Socket.IO instance.
 */
export const initializeSocketIO = (server) => {
  // `setupSocketIO` configures and returns the `io` instance.
  io = setupSocketIO(server, corsSocketOptions);
  console.log("✅ Socket.IO initialized.");
  return io;
};

/**
 * A getter function to safely access the `io` instance from other modules (e.g., services).
 * This avoids circular dependencies and ensures the instance is initialized before use.
 * @returns The Socket.IO server instance.
 */
export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initializeSocketIO() first."
    );
  }
  return io;
};
