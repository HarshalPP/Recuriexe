import mongoose from "mongoose";
import dotenv from "dotenv";
import { initializeScheduledJobs } from "../Utils/LinkedIn/scheduler.js"; // named export
import {schedulePlanExpiryCheck} from "../controllers/PlanController/planController.js"
import {restoreScheduledJobs} from "../services/Linkedinservice/socialMedia.service.js"
// import {scheduleInstagramTokenRefresh} from "../controllers/SociaMedia Controller/instagram.auth.js"

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Now it's safe to initialize scheduler
    console.log("⚙️ Initializing scheduled LinkedIn jobs...");
    await initializeScheduledJobs();

    await schedulePlanExpiryCheck();
    restoreScheduledJobs();

    // scheduleInstagramTokenRefresh();

  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
