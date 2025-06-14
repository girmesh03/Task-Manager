// backend/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet"; // Security middleware
import mongoSanitize from "express-mongo-sanitize"; // Security middleware

import apiRoutes from "./routes/index.js";
import corsOptions from "./config/corsOptions.js";
import globalErrorHandler from "./errorHandler/ErrorController.js";
import CustomError from "./errorHandler/CustomError.js";

const app = express();

// --- Core Middleware ---
// Set security HTTP headers
app.use(helmet());
// Enable CORS with specific options
app.use(cors(corsOptions));
// Parse JSON bodies
app.use(express.json({ limit: "10kb" })); // Smaller limit for security
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Parse cookies
app.use(cookieParser());
// Sanitize MongoDB query data
app.use(mongoSanitize());

// HTTP request logger in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --- API Routes ---
app.use("/api/v1", apiRoutes);

// --- Error Handling ---
// Catch-all for unhandled routes
app.all("*", (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
