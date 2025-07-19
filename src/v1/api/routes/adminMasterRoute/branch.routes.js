const express = require("express");
const router = express.Router();

const {
  branchAdd,
  updateBranch,
  branchDetailByCompanyId,
  getAllBranch,
  getAllBranchSheet,
  branchActiveOrInactive,
  deleteBranch,
  updateBranchPaymentGateway,
  getRegionalBranch
} = require("../../controller/adminMaster/branch.controller");

router.post("/branchAdd", branchAdd);
router.post("/updateBranch", updateBranch);
router.get("/branchDetail/:companyId", branchDetailByCompanyId);

router.get("/getAllBranchSheet", getAllBranchSheet);
router.post("/activeOrInactive", branchActiveOrInactive);
router.post("/deleteBranch", deleteBranch);
router.post("/updateBranchPaymentGateway", updateBranchPaymentGateway);
router.get("/getRegionalBranch", getRegionalBranch);


module.exports = router;
