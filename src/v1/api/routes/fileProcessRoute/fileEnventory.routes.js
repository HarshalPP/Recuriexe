
const express = require("express");
const router = express.Router();
const {
    jinamManagement,fileEnventroyDetails
} = require("../../controller/fileProccess/fileEnventory.controller");
const { upload } = require("../../../../../Middelware/multer");



router.post("/",  upload.fields([
    { name: "allPhysicalSanctionDocument", maxCount: 5 },
    { name: "allPhysicalDisbursementDocument", maxCount: 5 },
  ]), jinamManagement);

router.get("/:customerId", fileEnventroyDetails);
// router.get("/", finalSactionList);


module.exports = router;
