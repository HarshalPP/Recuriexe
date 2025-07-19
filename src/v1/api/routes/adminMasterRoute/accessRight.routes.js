const express = require("express");
const router = express.Router();

const { addAccessRights,updateAccessRights,getAllAccessRights,
    getAccessRightsDetailById,toggleAccessRightsStatus} = require("../../controller/adminMaster/accessRight.controller")

    router.post("/add", addAccessRights);           
    router.post("/update", updateAccessRights);     
    router.get("/getAll", getAllAccessRights);      
    router.get("/detailBy", getAccessRightsDetailById); 
    router.post("/delete", toggleAccessRightsStatus);

 module.exports = router;
 