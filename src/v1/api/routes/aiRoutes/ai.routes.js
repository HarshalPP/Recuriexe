import express from "express";
const router = express.Router();
import {createAIConfig , updateAIConfig ,deleteAIConfig,getAllAIConfigs , screenApplicantAPI} from "../../controllers/AIController/aiConfig.controller.js"
import { IsAuthenticated } from "../../middleware/authicationmiddleware.js";



router.post("/ai-config", createAIConfig);
router.get("/getAll" , getAllAIConfigs)
router.post("/ai-config/:id", updateAIConfig);
router.post("/ai-deleteconfig/:organizationId", deleteAIConfig);
router.post("/screen-applicant", screenApplicantAPI);

export default router;