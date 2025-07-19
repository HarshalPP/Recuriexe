
const express = require("express")
const router = express.Router()
const {ParentFunction , PrepareConsentList , fetchDataBasedOnType , getAccStatement , AggregatorList , Productdata, uploadFile} = require("../../services/moneyOne.services")
// const {uploadFileToS3 , deleteFileFromS3 }=require("../../../../../Middelware/AwsConfig")
const multer = require('multer');

// Multer storage settings (Memory Storage for direct buffer access)
// Multer storage settings (Memory Storage for direct buffer access)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Define the upload route
// router.post('/upload', upload.single('file'), uploadFileToS3);
// router.post("/delete", deleteFileFromS3);
router.post("/consentRequest" , ParentFunction)
router.post("/consentList" , PrepareConsentList)
router.post("/getdata" , fetchDataBasedOnType)
router.post("/getAccStatement" , getAccStatement)
router.post("/getAggregatorList" , AggregatorList)
router.post("/productList" , Productdata)
// Define route for file upload
router.post("/upload", upload.single("file"), uploadFile);

module.exports=router;