
const express = require("express");
const router = express.Router();

const {addLMS } = require("../controller/ratnaaFin.contoller")

router.post("/add", addLMS)

 module.exports = router;
 


