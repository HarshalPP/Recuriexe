
const express = require("express");
const router = express.Router();

const { customerResponseAdd,customerResponseActiveOrInactive, updateCustomerResponse, getAllCustomerResponse , deleteCustomerResponse } = require("../../controller/adminMaster/customerResponse.controller")

router.post("/add",customerResponseAdd)
router.post("/activeOrInactive",customerResponseActiveOrInactive)
router.post("/update",updateCustomerResponse)
router.get("/getAll",getAllCustomerResponse)
// router.post("/delete",deleteCustomerResponse)

module.exports = router;