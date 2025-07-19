const express = require("express");
const router = express.Router();

const {modeOfCollectionAdd , updateModeOfCollection ,
     getAllModeOfCollection , ModeOfCollectionActiveOrInactive,
     getModeById } = require("../../controller/adminMaster/modeOfCollectiom.controller")

router.post("/modeOfCollectionAdd",modeOfCollectionAdd)
router.post("/updateModeOfCollection",updateModeOfCollection)
router.get("/getAllModeOfCollection",getAllModeOfCollection)
router.post("/activeOrInactive",ModeOfCollectionActiveOrInactive)
router.get("/getModeById",getModeById)

 module.exports = router;
 