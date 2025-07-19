const express = require("express");
const router = express.Router();

const {
    legalNoticeAdd,
    getAllLegalNotice, InactiveLegalNotice
} = require("../../controller/adminMaster/legalNotice.controller")

router.post("/add",legalNoticeAdd)
router.get("/getAll",getAllLegalNotice)
router.post("/delete",InactiveLegalNotice)

 module.exports = router;
 