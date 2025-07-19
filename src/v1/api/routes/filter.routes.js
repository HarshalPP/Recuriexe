
const express = require("express");
const router = express.Router();

const {filterFromGoogleSheet} = require("../controller/filter.controller")

router.get("/googleSheet",filterFromGoogleSheet)


 module.exports = router;
 

    
