import express from "express";
const router = express.Router();

import {
  addDesignationController,
  getAllDesignationController,
  getAllInactiveDesignationController,
  updateDesignationController,
  getDesignationByIdController,
  deactivateDesignationByIdController,
  getdeparmentwithdesignation,
  getDepartmentsWithDesignations,
  getJobDescriptionsByDesignation,
  generateDesignationFromAI,
  createBulkDesignations
} from "../../controllers/designationController/designation.controller.js"
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

// Routes
router.post("/add", verifyEmployeeToken , addDesignationController);
router.get("/getAll", verifyEmployeeToken , getAllDesignationController);
router.get("/getAllInactive", verifyEmployeeToken ,getAllInactiveDesignationController);
router.get("/getDesignationById/:designationId", verifyEmployeeToken , getDesignationByIdController);
router.post("/delete/:designationId", verifyEmployeeToken , deactivateDesignationByIdController);
router.post("/update", verifyEmployeeToken ,updateDesignationController);
router.get("/departmentwithdesingnation" , verifyEmployeeToken , getdeparmentwithdesignation)
router.get("/getDepartmentsWithDesignations" , verifyEmployeeToken , getDepartmentsWithDesignations)
router.get("/getJobDescriptionsByDesignation/:designationId" ,  verifyEmployeeToken ,getJobDescriptionsByDesignation)
router.post("/generateDesignationFromAI" ,  verifyEmployeeToken ,generateDesignationFromAI)
router.post("/add", verifyEmployeeToken , addDesignationController);
router.post("/createBulkDesignations" , verifyEmployeeToken , createBulkDesignations)

export default router;
