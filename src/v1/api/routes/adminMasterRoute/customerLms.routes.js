const express = require("express");
const router = express.Router();
const { upload } = require("../../../../../Middelware/multer");

const {customerFinexeAdd,getAllFinexeCustomer, customerLmsAdd,emiDetailXcelDownload ,
    uploadEmiDetails} = require("../../controller/adminMaster/customerLms.controller")

router.post("/disbursedCustomer",customerFinexeAdd)
router.get("/getAllDisbursedCustomer",getAllFinexeCustomer)

router.post("/add",customerLmsAdd)
router.post("/emiDetailXcelDownload",emiDetailXcelDownload)
router.post("/uploadEmiDetails",upload.single('sheet'), uploadEmiDetails)


 module.exports = router;
 