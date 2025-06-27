import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import corsOptions from "./config/corsOptions.js";
import globalErrorHandler from "./errorHandler/ErrorController.js";
import CustomError from "./errorHandler/CustomError.js";

import routes from "./routes/index.js";

const app = express();

// 1. Security and performance middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(mongoSanitize());
app.use(compression());

// 2. Logging in development
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// 3. Health check endpoint - placed before main routes
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    status: "ok",
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 4. Main API routes
app.use("/api", routes);

// 5. Catch-all route for undefined endpoints
app.all("*", (req, res, next) => {
  const errorMessage = `Resource not found. The requested URL ${req.originalUrl} was not found on this server.`;
  next(new CustomError(errorMessage, 404, "ROUTE-404"));
});

// 6. Global error handler
app.use(globalErrorHandler);

export default app;
