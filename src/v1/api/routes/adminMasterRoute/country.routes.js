const express = require("express");
const router = express.Router();

const {countryAdd, stateAdd , getAllCountryState , getAllcountry } = require("../../controller/adminMaster/country.controller")

router.get("/add",countryAdd)
router.get("/state/add",stateAdd)
router.get("/getAllcountryState",getAllCountryState)
router.get("/getAllcountry",getAllcountry)

 module.exports = router;
 