const express=require("express");
const router=express.Router();
const {addContactInfo , getAllContactInfo}=require("../../controller/hrms/contactinfo.controller")


router.post("/addContactInfo",addContactInfo);
router.get("/getAllContactInfo",getAllContactInfo);

module.exports=router;
