const express = require("express");
const router = express.Router();

const { getUdyamVerification} = require("../../services/udyamVerification.services")

router.post("/getUdyamVerification",getUdyamVerification)


 module.exports = router;



