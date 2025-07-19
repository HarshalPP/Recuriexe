
const express = require("express");
const router = express.Router();
const {
    createDisbursement,finalSactionDetails,finalSactionList
} = require("../../controller/fileProccess/disbursement.controller");


router.post("/", createDisbursement);

router.get("/disbus", finalSactionDetails);

router.get("/", finalSactionList);


module.exports = router;
