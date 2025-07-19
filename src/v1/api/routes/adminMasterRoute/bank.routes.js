const express = require("express");
const router = express.Router();

const {
  bankNameAdd,
  bankNameDelete,
  updateBankName,
  getAllBankName,
} = require("../../controller/adminMaster/bank.controller");

router.post("/add", bankNameAdd);
router.post("/update", updateBankName);
router.get("/getAll", getAllBankName);
router.post("/delete", bankNameDelete);

module.exports = router;
