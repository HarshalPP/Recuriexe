const express = require("express");
const router = express.Router();

const { PropertyTypeAdd , getPropertyTypeByProductId , getAllPropertyType , PropertyTypeUpdate , whichDocumentRequiredGetBycutomerId} = require("../../controller/adminMaster/propertyType.controller")

router.post("/add", PropertyTypeAdd)
router.get("/getByProductId", getPropertyTypeByProductId)
router.get("/getAll", getAllPropertyType)
router.post("/update" , PropertyTypeUpdate)
router.get("/getPropertyDocumentRequired" , whichDocumentRequiredGetBycutomerId)

module.exports = router;
