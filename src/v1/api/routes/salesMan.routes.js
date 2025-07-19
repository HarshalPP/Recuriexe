const express = require("express");
const router = express.Router();
const {
  salesManLogin,
  salesManSignup,
} = require("../controller/salesMan.controller");

// sales signup by admin/manegare/supManegare
router.post("/Signup", salesManSignup);

router.post("/Login", salesManLogin);

module.exports = router;
