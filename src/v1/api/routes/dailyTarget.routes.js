
const express = require("express");
const router = express.Router();

const {dailyTargetAdd,dailyTargetByTokenId} = require("../controller/dailyTarget.controller")

router.post("/add",dailyTargetAdd)
router.get("/get",dailyTargetByTokenId)

 module.exports = router;
 

    
