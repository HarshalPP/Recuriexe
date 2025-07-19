const express = require("express");
const router = express.Router();
const { upload } = require("../../../../Middelware/multer");

const { cropSOF,
    getAllCropSOF,
    getFilterCropSOF,getNewFilterCropSOF } = require("../controller/cropSOF.controller")

router.post("/add",upload.single('sheet'),cropSOF)
router.get("/getAllCropSOF",getAllCropSOF)
router.get("/getFilterCropSOF",getFilterCropSOF)
router.get("/getNewFilterCropSOF",getNewFilterCropSOF)

 module.exports = router;
 