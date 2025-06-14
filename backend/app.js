// backend/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import apiRoutes from "./routes/index.js";
import corsOptions from "./config/corsOptions.js";
import globalErrorHandler from "./errorHandler/ErrorController.js";
import CustomError from "./errorHandler/CustomError.js";

const app = express();

// === 1. Global Middleware ===

// Set essential security HTTP headers.
app.use(helmet());
// Enable CORS with whitelisted origins.
app.use(cors(corsOptions));
// Parse JSON bodies with a reasonable payload limit.
app.use(express.json({ limit: "10kb" }));
// Parse URL-encoded bodies.
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Parse cookies from incoming requests.
app.use(cookieParser());
// Sanitize user-supplied data to prevent MongoDB operator injection.
app.use(mongoSanitize());

// Use HTTP request logger only in development for cleaner production logs.
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// === 2. API Routes ===
// All API routes are prefixed with `/api/v1`.
app.use("/api/v1", apiRoutes);

// === 3. Error Handling ===
// A catch-all middleware for any requests to routes that do not exist.
app.all("*", (req, res, next) => {
  next(
    new CustomError(
      `The requested URL ${req.originalUrl} was not found on this server.`,
      404
    )
  );
});

// The global error handling middleware that catches all errors passed to `next()`.
app.use(globalErrorHandler);

export default app;
