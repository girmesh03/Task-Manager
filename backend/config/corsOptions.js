// backend/config/corsOptions.js
import allowedOrigins from "./allowedOrigins.js";
import CustomError from "../errorHandler/CustomError.js";

/**
 * Centralized origin validation function for CORS.
 * This prevents code duplication and ensures consistent behavior.
 * @param {string | undefined} origin - The origin header from the request.
 * @param {function} callback - The callback function to be called by the CORS middleware.
 */
const validateOrigin = (origin, callback) => {
  // Allow requests with no origin (e.g., server-to-server, mobile apps, Postman)
  // and requests from whitelisted origins.
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    // For security, explicitly reject origins that are not on the whitelist.
    callback(new CustomError("Not allowed by CORS", 403));
  }
};

/**
 * CORS configuration for standard Express HTTP/S requests.
 */
export const corsOptions = {
  origin: validateOrigin,
  credentials: true, // Allows cookies to be sent with requests.
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  optionsSuccessStatus: 200, // For legacy browser compatibility.
};

/**
 * CORS configuration specifically for Socket.IO connections.
 */
export const corsSocketOptions = {
  origin: validateOrigin,
  credentials: true,
};

export default corsOptions;
