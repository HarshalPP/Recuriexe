const express = require("express");
const router = express.Router();

const { salesDashboard } = require("../../controller/dashboard.controller.js");

router.get("/sales", salesDashboard);

module.exports = router;
