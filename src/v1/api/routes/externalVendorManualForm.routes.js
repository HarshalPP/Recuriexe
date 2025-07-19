const express = require("express");
const router = express.Router();
const { addExternalVendor , getDetailExternalVendor , getListExternalVendor , extrenalVendorManualViewReport} = require("../controller/externalVendorManual.controller");
const { upload } = require("../../../../Middelware/multer");

router.post("/add",addExternalVendor);
router.get("/detail",getDetailExternalVendor);
router.post("/list",getListExternalVendor);
router.get('/vendor/view/detail',extrenalVendorManualViewReport)

module.exports = router;
