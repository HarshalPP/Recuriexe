
const express = require("express");
const router = express.Router();

const {upload} = require("../../../../../Middelware/multer")

const {addLMS, createCase,createLoanCase ,uploadLoanFile,handleFullLoanProcess,getCustomerData,uploadLoanFileWithBody} = require("../../controller/ratnaaFin/ratnaaFin.contoller")
const { sectionLatter } = require("../../controller/ratnaaFin/sectionLatter.controller")
const {applicantLatter} = require("../../controller/ratnaaFin/newApplicant.controller")
const {LdAndPdDeed} = require("../../controller/ratnaaFin/loanDocument.controller")


router.post("/add", addLMS)
router.post("/create", createCase)
router.post("/lms", handleFullLoanProcess)
router.post("/create-loan", createLoanCase)


router.post("/upload-doc",upload.fields([{name:"cam",maxCount:1},
    {name:"section",maxCount:1},
    {name:"gst",maxCount:1},
    {name:"electricityBill",maxCount:1}
]) , uploadLoanFile)


router.post("/customer", getCustomerData)
router.post("/sectionLatter", sectionLatter)
router.post("/applicantLatter",applicantLatter)
router.post("/ldandpg",LdAndPdDeed)
router.post("/Uploaddocs", uploadLoanFileWithBody)

// router.post("/applicantLatterr",applicantLatterr)


 module.exports = router;
 


