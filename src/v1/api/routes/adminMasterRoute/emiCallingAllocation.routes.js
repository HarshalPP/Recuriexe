const express = require("express");
const router = express.Router();

const {
    emiCallingAllocationAdd,
    emiCallingAllocationUpdate,
    emiCallingAllocationModelAndNoAllocation,
    getemiCallingAllocationList
} = require("../../controller/adminMaster/emiCallingAllocation.controller")

router.post("/add",emiCallingAllocationAdd)
router.post("/update",emiCallingAllocationUpdate)
router.get("/by",emiCallingAllocationModelAndNoAllocation)
router.get("/employeList",getemiCallingAllocationList)


 module.exports = router;
 