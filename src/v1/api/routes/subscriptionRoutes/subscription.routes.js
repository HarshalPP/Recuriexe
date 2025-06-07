import express from 'express'
const router = express.Router();
import {createPlan , getAllPlans , updatePlan , deletePlan} from "../../controllers/subscriptionController/subscriptionPlan.controller.js"
import {subscribeToPlan , getSubscription} from "../../controllers/subscriptionController/subscription.controller.js"

// subscriptionPlan //
router.post("/createPlan" , createPlan)
router.get("/getAllPlans" , getAllPlans)
router.post("/updatePlan/:id" , updatePlan)
router.post("/deletePlan/:id" , deletePlan)



// Subscription //

router.post("/subscribeToPlan" , subscribeToPlan)
router.get("/getSubscription" , getSubscription)

export default router;