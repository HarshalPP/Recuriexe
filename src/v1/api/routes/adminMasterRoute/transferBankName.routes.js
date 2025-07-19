const express = require("express");
const router = express.Router();

const {
    transferBankNameAdd,
    transferBankNameDelete,
    updateTransferBankName,
    getAllTransferBankName,
  } = require("../../controller/adminMaster/transferBankName.controller");

router.post("/add",    transferBankNameAdd);
router.post("/update", updateTransferBankName);
router.get("/getAll",  getAllTransferBankName);
router.post("/delete", transferBankNameDelete);

module.exports = router;
