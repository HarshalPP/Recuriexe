const express = require("express");
const router = express.Router();

const {employeeAllocationAdd ,employeeAllocationUpdate , getAllocationEmployeeList,
    getAllocationAndNoAllocation 
} = require("../../controller/adminMaster/employeeAllocation.controller")

router.post("/add",employeeAllocationAdd)
router.post("/update",employeeAllocationUpdate)
router.get("/by",getAllocationAndNoAllocation)
router.get("/employeList",getAllocationEmployeeList)


 module.exports = router;
 