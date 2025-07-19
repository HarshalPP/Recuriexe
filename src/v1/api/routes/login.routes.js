const express = require("express");
const router = express.Router();
// const protected = require("../../../../Middelware/passwordchange")

const { employeLogin  , updatePasswordByUserName ,newEmployeeLogin} = require("../controller/login.controller");

// old employee router for employee  
// router.post("/employe" , employeLogin);
router.post("/updatePassword", updatePasswordByUserName);
router.post("/newEmployeeLogin",  newEmployeeLogin);

module.exports = router;
 