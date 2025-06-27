import rateLimit from "express-rate-limit";
import CustomError from "../errorHandler/CustomError.js";

// Environment-based configuration
const WINDOW_MINUTES = process.env.RATE_LIMIT_WINDOW || 15;
const MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS || 100;
const SKIP_DEV = process.env.RATE_LIMIT_SKIP_DEV !== "false";

// Trust reverse proxy for client IP
const trustProxy = process.env.NODE_ENV === "production";

const authLimiter = rateLimit({
  windowMs: WINDOW_MINUTES * 60 * 1000,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy,
  skip: (req) => SKIP_DEV && process.env.NODE_ENV === "development",
  handler: (req, res, next) => {
    next(
      new CustomError(
        "Too many requests, please try again later",
        429,
        "RATE_LIMITED",
        {
          retryAfter: WINDOW_MINUTES * 60,
          limit: MAX_REQUESTS,
          window: WINDOW_MINUTES,
        }
      )
    );
  },
  keyGenerator: (req) => {
    return req.user?._id || req.ip;
  },
});

// Specialized limiter for authentication endpoints
const authEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  trustProxy,
  skip: (req) => SKIP_DEV && process.env.NODE_ENV === "development",
  handler: (req, res, next) => {
    next(
      new CustomError(
        "Too many authentication attempts, please try again later",
        429,
        "AUTH_RATE_LIMITED",
        {
          retryAfter: 15 * 60,
        }
      )
    );
  },
  keyGenerator: (req) => req.ip,
});

export { authLimiter, authEndpointLimiter };
