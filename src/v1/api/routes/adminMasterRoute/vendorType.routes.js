
const express = require("express");
const router = express.Router();

const {vendorTypeAdd , updateVendorType , vendorTypeById , getAllVendorType , vendorTypeActiveOrInactive } = require("../../controller/adminMaster/vendorType.controller")

router.post("/vendorTypeAdd",vendorTypeAdd)
router.post("/updateVendorType",updateVendorType)
router.get("/byId/:vendorTypeId",vendorTypeById)
router.get("/getAllVendorType",getAllVendorType)
router.post("/activeOrInactive",vendorTypeActiveOrInactive)
// router.get("/getAllProduct",getAllProduct)

 module.exports = router;
 


