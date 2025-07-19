
const express = require("express");
const router = express.Router();

const {upload} = require("../../../../Middelware/multer.js")

const {incomesectionLatter} = require("../controller/ratnaaFin/IncomeSanctionLetter.controller.js")


router.get("/incomeSanction",incomesectionLatter)

// router.post("/applicantLatterr",applicantLatterr)


 module.exports = router;
 


