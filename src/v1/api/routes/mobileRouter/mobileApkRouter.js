
const express = require("express");
const router = express.Router();


const {mobileApkVersion , mobileApkVersionCreate} = require("../../controller/mobileApp/mobileApk.controller")

router.get("/versionGet", mobileApkVersion)
router.post("/versionCreate", mobileApkVersionCreate)

 module.exports = router;
 


