import express from 'express'
const router = express.Router();


import {addOrUpdateFormStage , toggleFieldAttributes , getAllFormStages} from "../../controllers/formStageController/formStage.controller.js"
import { verifyEmployeeToken , IsAuthenticated } from '../../middleware/authicationmiddleware.js';


router.post("/addOrUpdateFormStage" , verifyEmployeeToken , addOrUpdateFormStage)
router.post("/toggleFieldAttributes" , verifyEmployeeToken , toggleFieldAttributes)
router.get("/getAllFormStages" ,  getAllFormStages)
export default router;


