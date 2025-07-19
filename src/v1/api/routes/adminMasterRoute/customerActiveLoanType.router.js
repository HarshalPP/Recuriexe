const express = require("express");
const router = express.Router();

const { addActiveLoanType, activeLoanTypeDetail, activeLoanTypeGetList } = require("../../controller/adminMaster/customerActiveLoanType.controller")

router.post("/add", addActiveLoanType)
router.get("/detail", activeLoanTypeDetail)
router.get("/getList", activeLoanTypeGetList)

module.exports = router;
