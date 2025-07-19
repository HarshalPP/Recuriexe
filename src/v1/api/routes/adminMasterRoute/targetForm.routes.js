const express = require("express");
const router = express.Router();

const {newTargetAdd ,getAllTarget,updateTarget , targetActiveOrInactive, addEmployeeTarget,
  empTargetDetails
 } = require("../../controller/adminMaster/targetForm.controller");


  router.post("/add",newTargetAdd)
  router.get("/getAll",getAllTarget)
  router.post("/update",updateTarget)
  router.post("/activeAndInactive",targetActiveOrInactive)

  // add target for employee
  router.post("/addTarget",addEmployeeTarget)

   // list target for employee
   router.get("/empTargetDetail",empTargetDetails) 


module.exports = router;
