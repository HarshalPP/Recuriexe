import express from 'express';
const router = express.Router();

import {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan,
    assignPlanToOrganization
} from '../../controllers/PlanController/planController.js';



router.post('/createPlan', createPlan);
router.get('/getAllPlans', getAllPlans);
router.get('/getPlanById/:id', getPlanById);
router.post('/updatePlan/:id', updatePlan);
router.post('/deletePlan/:id', deletePlan);
router.post('/assignPlanToOrganization', assignPlanToOrganization);

export default router;