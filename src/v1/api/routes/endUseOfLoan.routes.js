
const express = require("express");
const router = express.Router();

const { endUseOfLoanAdd, endUseOfLoanList, endUseOfLoanDelete } = require("../controller/endUseOfLoan.controller")

router.post("/add", endUseOfLoanAdd)
router.get("/list", endUseOfLoanList)
router.post("/delete", endUseOfLoanDelete)

 module.exports = router;
 

    
