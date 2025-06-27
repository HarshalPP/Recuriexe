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
    assignPlanToOrganization
} from '../../controllers/PlanController/planController.js';

import{ createAICreditPlan,getAICreditPlanById,getAllAICreditPlans,updateAICreditPlan,deleteAICreditPlan,assignAICreditsToOrganization} from "../../controllers/PlanController/AiPlan.controller.js"


// prepaid Plan // 
router.post('/createPlan', createPlan);
router.get('/getAllPlans', getAllPlans);
router.get('/getPlanById/:id', getPlanById);
router.post('/updatePlan/:id', updatePlan);
router.post('/deletePlan/:id', deletePlan);
router.post('/assignPlanToOrganization', assignPlanToOrganization);



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
router.post("/aiPlanAssign", assignAICreditsToOrganization);


export default router;