const express = require("express");
const router = express.Router();
const { upload } = require('../../../../Middelware/multer.js')

const {imageUpload ,downloadSingleImage} = require("../controller/imageUpload.controller.js");
const {uploadImage , uploadImageCompress} = require("../controller/adminMaster/server.controller.js")
// const {updateApplicantStorage}= require("../services/spaces.service.js")

router.post("/ImageUpload",upload.single("image"), uploadImageCompress)
// router.post("/ImageUpload",upload.single("image"), uploadImage)
router.post("/ImageUploadss",upload.single("image"), imageUpload)
router.post("/downloadSingleImage", downloadSingleImage)
// router.get("/updateApplicantStorage",updateApplicantStorage)

 module.exports = router;
 


    