// backend/mock/seedDatabase.js
import Department from "../models/DepartmentModel.js";
import User from "../models/UserModel.js";
// ... other model imports

const setupSuperAdminAndDepartment = async () => {
  /* ... (As defined in Phase 1) */
};

const resetAndSeedDatabase = async () => {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "FATAL: Database seeding is disabled in production. Aborting."
    );
    return;
  }
  try {
    console.log("--- Starting Database Reset and Seeding ---");
    // ... (deleteMany calls for all relevant collections)
    await Department.deleteMany({});
    await User.deleteMany({});
    console.log("Collections cleared.");
    await setupSuperAdminAndDepartment();
    console.log("--- Database Seeding Completed ---");
  } catch (error) {
    console.error("FATAL: Error during database seeding:", error);
    process.exit(1);
  }
};
export default resetAndSeedDatabase;
