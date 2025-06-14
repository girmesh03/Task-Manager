// backend/socket.js
import jwt from "jsonwebtoken";
import { Server as SocketIOServer } from "socket.io";

/**
 * Parses the access token from the socket's cookie header.
 * @param {string} cookieHeader - The `socket.handshake.headers.cookie` string.
 * @returns {string|null} The token string or null if not found.
 */
const getAccessTokenFromCookie = (cookieHeader) => {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split("; ");
  const tokenCookie = cookies.find((c) => c.startsWith("access_token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
};

/**
 * Configures the Socket.IO server, including authentication middleware and event listeners.
 * @param {http.Server} server - The HTTP server to attach to.
 * @param {object} corsOptions - The CORS configuration for Socket.IO.
 * @returns The configured Socket.IO server instance.
 */
const setupSocketIO = (server, corsOptions) => {
  const io = new SocketIOServer(server, { cors: corsOptions });

  // Middleware for authenticating every new socket connection.
  io.use((socket, next) => {
    const token = getAccessTokenFromCookie(socket.handshake.headers.cookie);
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify the token without a DB call for high performance.
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return next(
          new Error("Authentication error: Invalid or expired token")
        );
      }
      // Attach the trusted user payload to the socket for use in event handlers.
      socket.user = decoded;
      next();
    });
  });

  // Main connection handler.
  io.on("connection", (socket) => {
    const { _id, department } = socket.user;

    // Have the user join a room named after their own user ID.
    // This allows for sending notifications directly to this specific user.
    socket.join(_id.toString());

    // Have the user join a room for their department.
    // This allows for broadcasting events to everyone in a department.
    if (department) {
      socket.join(department.toString());
    }

    socket.on("disconnect", () => {
      // Optional: Add logic for user presence tracking if needed.
    });

    socket.on("error", (err) => {
      console.error(`Socket error on socket ${socket.id}:`, err.message);
    });
  });

  return io;
};

export default setupSocketIO;
