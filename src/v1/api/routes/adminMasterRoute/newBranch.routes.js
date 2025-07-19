const express = require("express");
const router = express.Router();
// const { upload } = require("../../../Middelware/multer");
const {
  addBranchController,
  getAllBranchController,
  getRegionalBranchController,
  getBranchByIdController,
  getBranchByRegionalIdController,
  updateBranchController,
  deactivateBranchByIdController,
  getAllInactiveBranchController,
  branchWiseEmployeeList,
  getAllCountWebsiteController,
  getAllBranchdata,
  branchesByRegionalBranch,
  allRegionalBranches,
  getAllMapBranchController
} = require("../../controller/adminMaster/newBranch.controller");

// const path = require("path");

router.post("/add", addBranchController);
router.get("/getAll", getAllBranchController);
router.get("/map", getAllMapBranchController);
router.get("/getAllCount", getAllCountWebsiteController);
router.get("/getAllInactive", getAllInactiveBranchController);
router.get("/branchesByRegionalBranch", branchesByRegionalBranch);
router.get("/allRegionalBranches", allRegionalBranches);
router.get("/getRegional", getRegionalBranchController);
router.get("/getBranchById/:branchId", getBranchByIdController);
router.get("/getBranchByRegionalId/:branchId", getBranchByRegionalIdController);
router.post("/update", updateBranchController);
router.post("/delete/:branchId", deactivateBranchByIdController);
router.get("/getAllBranchdata" , getAllBranchdata);

//branch wise employee
router.get("/branchEmployeeList", branchWiseEmployeeList);

// get branch alll with Name 




module.exports = router;
