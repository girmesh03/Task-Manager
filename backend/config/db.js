// backend/config/db.js
import mongoose from "mongoose";

/**
 * Connects to the MongoDB database using the URI from environment variables.
 * It enforces strict query mode for better data integrity.
 * If the connection fails on startup, it terminates the application process.
 */
const connectDB = async () => {
  try {
    // Strict query mode helps prevent querying for fields not defined in the schema.
    mongoose.set("strictQuery", true);

    if (!process.env.MONGODB_URI) {
      console.error("FATAL ERROR: MONGODB_URI is not defined.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // This console log is now in server.js inside the 'open' event listener,
    // which is a more accurate place to confirm the connection is ready.
  } catch (error) {
    // If the initial connection fails, the application cannot run.
    console.error("MongoDB connection FAILED:", error.message);
    process.exit(1);
  }
};

export default connectDB;
