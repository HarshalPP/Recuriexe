
const express = require("express");
const router = express.Router();
const {
  CreatejinamEntry,jinamEntryDetails
} = require("../../controller/fileProccess/jinamEntry.controller");


router.post("/", CreatejinamEntry);
router.get("/:customerId",  jinamEntryDetails);
// router.get("/", finalSactionList);


module.exports = router;
