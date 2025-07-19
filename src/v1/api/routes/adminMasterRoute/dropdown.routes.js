const express = require("express");
const router = express.Router();

const { dropDownAdd,
        dropdownActiveOrInactive,
        updateDropdown,
        getAllDropdown,getAllModelName} = require("../../controller/adminMaster/dropdown.controller")

router.post("/add",dropDownAdd)
router.post("/activeOrInactive",dropdownActiveOrInactive)
router.get("/getAll",getAllDropdown)
router.post("/update",updateDropdown)
router.get("/getAllModelName",getAllModelName)

 module.exports = router;
 