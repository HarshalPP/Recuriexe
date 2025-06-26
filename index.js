// server.js or index.js
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./src/v1/api/config/db.js";
import swaggerDocs from './src/v1/api/Utils/swagger.js';
import { startCallScheduler } from './src/v1/api/worker/callSheduler.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Swagger setup
swaggerDocs(app, PORT);

// Connect to MongoDB first
connectDB().then(async () => {
  console.log("✅ MongoDB connected");

  // Now it's safe to initialize scheduler
   await startCallScheduler();

  // Start the server
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
  process.exit(1);
});
