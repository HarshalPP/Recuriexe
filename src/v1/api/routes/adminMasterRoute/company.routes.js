const express = require("express");
const router = express.Router();

const {companyAdd,updateCompany,getAllCompany , deleteCompany , companyActiveOrInactive} = require("../../controller/adminMaster/company.controller")

router.post("/companyAdd",companyAdd)
router.post("/updateCompany",updateCompany)
router.get("/getAllCompany",getAllCompany)
router.post("/activeOrInactive",companyActiveOrInactive)
// router.post("/delete",deleteCompany)

 module.exports = router;
 