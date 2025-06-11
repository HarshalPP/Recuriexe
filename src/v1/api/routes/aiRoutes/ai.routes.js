import express from "express";
const router = express.Router();
import {createAIConfig , updateAIConfig ,deleteAIConfig,getAllAIConfigs , screenApplicantAPI , screenCandidateAIProfile} from "../../controllers/AIController/aiConfig.controller.js"
import { IsAuthenticated , verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";
import {createAiScreening , getAiScreening , getAiScreeningById , updateAiScreening , deleteAiScreening , createAIRule , getAIRules , getAIRuleById , updateAIRule , deleteAIRule , getCategoriesForAIScreening} from "../../controllers/AIController/aiScreeningController.js";


router.post("/ai-config", createAIConfig);
router.get("/getAll" , getAllAIConfigs)
router.post("/ai-config/:id", updateAIConfig);
router.post("/ai-deleteconfig/:organizationId", deleteAIConfig);
router.post("/screen-applicant", screenApplicantAPI);
router.post("/screen-candidate",verifyEmployeeToken,  screenCandidateAIProfile);


// AI Screening Routes
router.post("/create-ai-screening", verifyEmployeeToken, createAiScreening);
router.get("/get-ai-screening", verifyEmployeeToken, getAiScreening);
router.get("/get-ai-screening/:id", verifyEmployeeToken, getAiScreeningById);
router.post("/update-ai-screening/:id", verifyEmployeeToken, updateAiScreening);
router.post("/delete-ai-screening/:id", verifyEmployeeToken, deleteAiScreening);
router.get("/get-categories", verifyEmployeeToken, getCategoriesForAIScreening);


// AI Rule Routes
router.post("/create-ai-rule", verifyEmployeeToken, createAIRule);
router.get("/get-ai-rules", verifyEmployeeToken, getAIRules);
router.get("/get-ai-rule/:id", verifyEmployeeToken, getAIRuleById);
router.post("/update-ai-rule/:id", verifyEmployeeToken, updateAIRule);
router.post("/delete-ai-rule/:id", verifyEmployeeToken, deleteAIRule);

export default router;