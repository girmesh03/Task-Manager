// backend/server.js
import dotenv from "dotenv";
dotenv.config(); // Must be the first line to load environment variables.

import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocketIO } from "./socketManager.js";
import resetAndSeedDatabase from "./mock/seedDatabase.js";

// Get port from environment variables, with a fallback.
const PORT = process.env.PORT || 5000;

// Create the HTTP server using the Express app.
const server = http.createServer(app);

// Initialize Socket.IO using our decoupled manager.
initializeSocketIO(server);

// Establish the connection to MongoDB.
connectDB();

// Listen for the 'open' event from Mongoose, which signifies a successful connection.
mongoose.connection.once("open", async () => {
  console.log("✅ MongoDB connection successful.");

  // This check is for initial development setup.
  // It ensures a SuperAdmin exists. For production, this could be removed
  // or replaced with a more robust startup check.
  const User = mongoose.model("User");
  const superAdminExists = await User.findOne({ role: "SuperAdmin" });
  if (!superAdminExists && process.env.NODE_ENV !== "production") {
    console.warn("⚠️ No SuperAdmin found. Running initial database seed...");
    await resetAndSeedDatabase();
  }

  // Start the server only after the database is connected.
  server.listen(PORT, () =>
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  );
});

// Listen for Mongoose connection errors.
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});
