
const express = require("express");
const router = express.Router();

const {bodEodAdd , getbodEodByEmployeeId , getbodEodById ,
    getbodEodByManagerId, updateEodByemployeId,getbodEodVerify, bodEodUpdateByManager} = require("../../controller/taskManagement/bodEod.controller")

router.post("/add", bodEodAdd)
router.get("/getBy", getbodEodByEmployeeId)
router.get("/taskBy", getbodEodById)
router.get("/bodEodByManagerId", getbodEodByManagerId)
router.post("/update", updateEodByemployeId)
router.get("/Verify", getbodEodVerify)
router.post("/updateByManager", bodEodUpdateByManager)

 module.exports = router;
 

    
