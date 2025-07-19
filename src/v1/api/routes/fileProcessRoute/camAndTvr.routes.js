
const express = require("express");
const router = express.Router();

const {
    camReport,
    tvrFunCTION,
    camReportGET,
    tvrGET
} = require("../../controller/fileProccess/camAndTvr.controller");



router.post("/camreport", camReport);
router.post("/tvr", tvrFunCTION);
router.get("/camreport", camReportGET);
router.get("/tvr", tvrGET);









module.exports = router;
