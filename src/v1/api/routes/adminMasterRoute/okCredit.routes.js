const express = require("express");
const router = express.Router();

const {
    okCreditAssign,
    creditNoUpdate,
    getAllOkCreditAssign,
    okCreditActiveOrInactive
} = require("../../controller/adminMaster/okCredit.controller")

router.post("/assign",okCreditAssign)
router.post("/updateCreditNo",creditNoUpdate)
router.get("/getAllAssign",getAllOkCreditAssign)
router.post("/activeOrInactive",okCreditActiveOrInactive)

 module.exports = router;
 