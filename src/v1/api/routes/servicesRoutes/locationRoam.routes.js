const express = require("express");
const router = express.Router();

const { roamIdCreate ,getRoamUsers} = require("../../services/locationRoam.services");
const locationController = require('../../controller/locationController.js');

// Example REST API Route (Optional)
router.post('/update', locationController.updateLocation);


router.get("/history/:userId",locationController.getTodayLocationHistoryByUserId)

router.get("/roam/users",getRoamUsers);


 module.exports = router;
