const express = require("express");
const router = express.Router();
const { addByVendor , addExternalVendor , allCustomersByStatus , vendorFormGet , getDetailExternalVendor , extrenalVendorViewReport} = require("../controller/vendor.Controller");
const { upload } = require("../../../../Middelware/multer");
const externalVenderManual = require('./externalVendorManualForm.routes')
// const dynamiVendorRouter = require('./externalVendorManualDynamicroutes')

router.post("/add",          addExternalVendor);
router.post("/addByVendor" , addByVendor);
router.get("/get/customers", allCustomersByStatus)
router.get("/getFormVendor", vendorFormGet)
router.get("/formDetail",    getDetailExternalVendor)
router.get('/vendor/detail',extrenalVendorViewReport)

// manual all  externalVender api routing
router.use('/manual', externalVenderManual)

// this is used important 
// router.use('/', dynamiVendorRouter)

module.exports = router;
