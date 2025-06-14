// backend/config/allowedOrigins.js

/**
 * Loads the list of allowed origins for CORS from an environment variable.
 * Defaults to common local development ports if the environment variable is not set.
 *
 * The `CORS_ALLOWED_ORIGINS` variable should be a comma-separated string of URLs.
 * Example: "http://localhost:3000,https://my-production-app.com"
 */
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

export default allowedOrigins;
