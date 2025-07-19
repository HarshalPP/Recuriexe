
const express = require("express");
const router = express.Router();


const {customerDetailsList} = require("../../controller/lenderCustomer/customer.controller")

//customerList
router.get("/customerList", customerDetailsList)


 module.exports = router;
 


