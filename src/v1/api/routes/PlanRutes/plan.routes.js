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


export default router;