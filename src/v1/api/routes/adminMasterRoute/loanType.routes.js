const express = require("express");
const router = express.Router();

const { loanTypeAdd, updateLoanType,  loanTypeDetailById ,getAllLoanTypes } = require("../../controller/adminMaster/loanType.controller")

router.post("/add", loanTypeAdd)
router.post("/update", updateLoanType)
router.get('/getAll', getAllLoanTypes)
router.get('/getDetail', loanTypeDetailById)

module.exports = router;
