import express from 'express';
const router = express.Router();

import {
    createPlan,
    createfreetrail,
    getAllfreeplan,
    updatefreetrail,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan,
    assignPlanToOrganization,
    upgradeOrganizationPlan
} from '../../controllers/PlanController/planController.js';

import {
  createCreditRule,
  getAllCreditRules,
  updateCreditRule,
  deleteCreditRule,
} from "../../controllers/AIController/aiCreditRule.controller.js"

import{ createAICreditPlan,getAICreditPlanById,getAllAICreditPlans,updateAICreditPlan,deleteAICreditPlan,assignAICreditsToOrganization} from "../../controllers/PlanController/AiPlan.controller.js"
import {verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"


// prepaid Plan // 
router.post('/createPlan', createPlan);
router.get('/getAllPlans', getAllPlans);
router.get('/getPlanById/:id', getPlanById);
router.post('/updatePlan/:id', updatePlan);
router.post('/deletePlan/:id', deletePlan);
router.post('/assignPlanToOrganization', assignPlanToOrganization);
router.post("/upgradeOrganizationPlan"  , verifyEmployeeToken , upgradeOrganizationPlan)



// Free trail plan //


router.post("/createfreetrail" , createfreetrail)
router.get("/getAllfreeplan" ,  getAllfreeplan)
router.post("/updatefreetrail/:id" , updatefreetrail)



// add on ai credit plan


router.post("/creditaiplans", createAICreditPlan);
router.get("/aiplans", getAllAICreditPlans);
router.get("/aiplans/:id", getAICreditPlanById);
router.put("/aiplans/:id", updateAICreditPlan);
router.delete("/aiplans/:id", deleteAICreditPlan);
router.post("/aiPlanAssign", verifyEmployeeToken , assignAICreditsToOrganization);


router.post("/createCreditRule", createCreditRule);
router.get("/getAllCreditRules", getAllCreditRules);
router.post("/updateCreditRule/:id", updateCreditRule);
router.post("/deleteCreditRule/:id", deleteCreditRule);


export default router;