// backend/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

/**
 * A rate limiter specifically for authentication-related endpoints.
 * It helps prevent brute-force attacks on login, password reset, etc.
 * The limiter is automatically disabled in the development environment.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: "fail",
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
  skip: (req) => process.env.NODE_ENV === "development",
});

export default authLimiter;
