const express = require("express");
const router = express.Router();

const { addFinalDropdown ,getAllFinalDropdown,updateFinalDropdown ,
         activeOrInactiveFinalDropdown} = require("../../controller/adminMaster/titleDropdown.controller")
    
    
router.post("/add",addFinalDropdown)
router.get("/getAll",getAllFinalDropdown)
router.post("/update",updateFinalDropdown)
router.post("/activeAndInactive",activeOrInactiveFinalDropdown)
    
    
    
module.exports = router;