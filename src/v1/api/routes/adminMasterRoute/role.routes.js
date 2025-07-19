const express = require("express");
const router = express.Router();

const {roleAdd , getAllRole , updateRole , roleActiveOrInactive , getAllRoleByType, getCollectionRoleEmploye} = require("../../controller/adminMaster/role.controller")

router.post("/roleAdd",roleAdd)
router.get("/getAllRole",getAllRole)
router.post("/roleUpdate", updateRole)
router.post("/activeOrInactive",roleActiveOrInactive)
router.get("/getAllRoleByType",getAllRoleByType)
router.get("/collectionRoleEmploye",getCollectionRoleEmploye)

 module.exports = router;
 