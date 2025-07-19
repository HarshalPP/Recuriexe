const express = require("express");
const router = express.Router();

const { partnerAdd , partnerActiveOrInactive , updatepartner , getAllpartner , deletepartner  } = require('../../controller/adminMaster/partner.controller')

// router.post("/add" ,  partnerAdd)
// router.post("/update" , updatepartner)
// router.post("/activeOrInactive",partnerActiveOrInactive)
// router.get("/list",getAllpartner)



// router.get("/detail/:id",partnerDetail)

 module.exports = router;
     

 partnerAdd,
 partnerActiveOrInactive,
 updatepartner,
 getAllpartner,
 deletepartner
