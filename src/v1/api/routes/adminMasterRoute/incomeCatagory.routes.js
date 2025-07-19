const express = require("express");
const router = express.Router();

const { incomeCatagoryAdd , getIncomeCategoriesByProduct , incomeCatagoryUpdate , getAllincomeCatagorys} = require("../../controller/adminMaster/incomeCatagory.controller")

router.post("/add", incomeCatagoryAdd)
router.get("/getByProductId" , getIncomeCategoriesByProduct)
router.post("/update",incomeCatagoryUpdate)
router.get("/getAll",getAllincomeCatagorys)


module.exports = router;
