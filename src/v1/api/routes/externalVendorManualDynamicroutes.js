const express = require("express");
const router = express.Router();
const { addExternalVendor , getCustomerList , getCustoemrDetail , addByAllVendors ,  externalVendorList , externalVendorDetail , vendorShowList } = require("../controller/externalVendorManualDynamic.controller");
const { upload } = require("../../../../Middelware/multer");

// extrnal vendor 
router.post("/create",addExternalVendor);
router.get("/customer/detail", getCustoemrDetail)
router.get('/customer/list', getCustomerList)

// vendor 
router.post('/vendor',addByAllVendors)


router.get('/customerdetail' , externalVendorDetail)
router.get("/form/list" , externalVendorList )
router.get('/list', vendorShowList)

module.exports = router;
