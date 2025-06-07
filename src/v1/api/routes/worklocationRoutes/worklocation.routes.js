import express from "express"
const router = express.Router();
// const { upload } = require("../../../Middelware/multer");
import {
  addWorkLocationController,
  getAllWorkLocationController,
  getWorkLocationByIdController,
  getWorkLocationByBranchIdController,
  updateWorkLocationController,
  deactivateWorkLocationByIdController,
  getAllInactiveWorkLocationController,
  toggleWorkLocationStatusController
} from "../../controllers/worklocationController/worklocation.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"

// const path = require("path");

router.post("/add", verifyEmployeeToken ,addWorkLocationController);
router.get("/getAll", verifyEmployeeToken, getAllWorkLocationController);
router.get("/getById/:workLocationId", verifyEmployeeToken ,getWorkLocationByIdController);
router.get("/getByBranchId/:branchId", verifyEmployeeToken, getWorkLocationByBranchIdController);
router.post("/delete/:workLocationId", verifyEmployeeToken, deactivateWorkLocationByIdController);
router.post("/update", verifyEmployeeToken ,updateWorkLocationController);
router.get("/getAllInactive", verifyEmployeeToken ,getAllInactiveWorkLocationController);
router.post("/toggleStatus/:workLocationId", verifyEmployeeToken, toggleWorkLocationStatusController);

export default router;
