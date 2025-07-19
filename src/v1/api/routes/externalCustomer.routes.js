const express = require("express");
const router = express.Router();
const { upload } = require('../../../../Middelware/multer')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload1 = multer({ storage: storage });

// const {allCustomerGoogleSheetUpdload,getAllExternalCustomer } = require("../controller/externalCustomer.controller")


// router.post("/sheetUpload",upload1.single('sheet'),allCustomerGoogleSheetUpdload)

// router.get("/getAll",getAllExternalCustomer)

// router.get("/getAllCollectionSheet/:status",getAllCollectionSheet)

 module.exports = router;
 

    