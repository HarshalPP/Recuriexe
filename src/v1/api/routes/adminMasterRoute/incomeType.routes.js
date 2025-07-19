const express = require("express");
const router = express.Router();

const {addIncomeType,deleteIncomeType, allIncomeType,updateIncomeType } = require("../../controller/adminMaster/incomeTypeMechanism")

router.post("/add",addIncomeType)
router.delete("/delete/:incomeTypeId",deleteIncomeType)
router.patch("/update/:incomeTypeId",updateIncomeType)
router.get("/all/list", allIncomeType)

 module.exports = router;
 