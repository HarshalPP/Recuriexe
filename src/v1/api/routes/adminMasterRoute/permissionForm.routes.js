const express = require("express");
const router = express.Router();

const {permissionFormAdd,getAllPermissionForm} = require("../../controller/adminMaster/permissionForm.controller")

router.post("/add",permissionFormAdd)
router.get("/getAll",getAllPermissionForm)


 module.exports = router;
 