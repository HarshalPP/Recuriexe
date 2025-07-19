const express = require("express");
const router = express.Router();

const { pdfTemplateAdd , updatepdfTemplate , getAllpdfTemplate , pdfTemplateActiveOrInactive , detailpdfTemplate  } = require('../../controller/adminMaster/pdfTemplate.controller')

router.post("/add" ,  pdfTemplateAdd)
router.post("/update" , updatepdfTemplate)
router.get("/list",getAllpdfTemplate)
router.get("/detail/:id",detailpdfTemplate)
router.post("/activeOrInactive",pdfTemplateActiveOrInactive)

 module.exports = router;
    
