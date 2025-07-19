
const express = require("express");
const router = express.Router();

const {branchWiseTable, managerWiseTable ,employeeWiseTable} = require("../controller/collection/collectionDashboard.controller")

router.get("/branchWiseTable",   branchWiseTable)
router.get("/managerWiseTable",  managerWiseTable)
router.get("/employeeWiseTable", employeeWiseTable)


 module.exports = router;
 

    
