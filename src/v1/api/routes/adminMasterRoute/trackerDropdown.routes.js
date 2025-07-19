const express = require("express");
const router = express.Router();




const { addTrackerDropdown ,
    getAllTrackerDropdown,
    updateTrackerDropdown , 
    activeOrInactiveTrackerDropdown } = require("../../controller/adminMaster/trackerDropdown.controller")
    
    
router.post("/add",addTrackerDropdown)
router.get("/getAll",getAllTrackerDropdown)
router.post("/update",updateTrackerDropdown)
router.post("/activeAndInactive",activeOrInactiveTrackerDropdown)
    
    
    
module.exports = router;