const express = require("express");
const router = express.Router();

const {workLocationAdd , updateWorkLocation , workLocationByBranchId , getAllWorkLocation , workLocationActiveOrInactive} = require("../../controller/adminMaster/workLocation.controller")

router.post("/workLocationAdd",workLocationAdd)
router.post("/updateWorkLocation",updateWorkLocation)
router.get("/getAllWorkLocation",getAllWorkLocation)
router.get("/detailBy/:branchId",workLocationByBranchId)
router.post("/activeOrInactive",workLocationActiveOrInactive)
// router.get("/getAllProduct",getAllProduct)

 module.exports = router;
 