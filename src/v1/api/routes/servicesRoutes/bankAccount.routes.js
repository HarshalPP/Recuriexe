const express = require("express");
const router = express.Router();

const { bankAccountDetail} = require("../../services/bankAccount.services")

router.post("/bankAccountDetail",bankAccountDetail)



 module.exports = router;



