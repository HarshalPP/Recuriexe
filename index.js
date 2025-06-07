import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js"
import connectDB from "./src/v1/api/config/db.js"
import swaggerDocs from './src/v1/api/Utils/swagger.js'

dotenv.config();

const PORT = process.env.PORT || 4000;
swaggerDocs(app, PORT );
const server = http.createServer(app);

// Connect to MongoDB
connectDB().then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });