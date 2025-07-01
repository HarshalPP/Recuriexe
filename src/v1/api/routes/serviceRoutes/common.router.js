import express from "express";
const router = express.Router();
import iciciRouter from "./icici.routes.js"


router.use('/icici',iciciRouter)

export default router;