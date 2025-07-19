const express = require("express");
const router = express.Router();
const { createLead, getAllLeads , getLeadById } = require("../../controller/website/websitelead.controller");


// Make a Router //

router.post("/create", createLead);
router.get("/all", getAllLeads);
router.get("/getbyId/:id" , getLeadById)

module.exports = router;



