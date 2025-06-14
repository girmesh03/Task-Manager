// backend/mock/seedRunner.js
import dotenv from "dotenv";
dotenv.config({ path: "../.env" }); // Ensure correct .env path

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import resetAndSeedDatabase from "./seedDatabase.js";

const run = async () => {
  try {
    console.log("Connecting to database to run seeder...");
    await connectDB();
    mongoose.connection.once("open", async () => {
      console.log("DB connected for seeding.");
      await resetAndSeedDatabase();
      await mongoose.connection.close();
      console.log("Seeding complete. Database connection closed.");
      process.exit(0);
    });
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exit(1);
  }
};

run();
