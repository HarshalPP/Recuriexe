const express = require("express");
const router = express.Router();

const { permissionPageAdd,
    permissionPageActiveOrInactive,
    updatePermissionPage,
    getAllPermissionPage,getPermissionPageById} = require("../../controller/adminMaster/permission.controller")

router.post("/add",permissionPageAdd)
router.post("/update",updatePermissionPage)
router.get("/getAll",getAllPermissionPage)
router.get("/detailBy",getPermissionPageById)
router.post("/delete",permissionPageActiveOrInactive)

 module.exports = router;
 