const express = require("express");
const router = express.Router();




const {addTvrFormQuestion ,
    getAllTvrFormQuestion,
    updateTvrFormQuestion , 
    activeOrInactiveTvrFormQuestion } = require("../../controller/adminMaster/tvrFormQuestion.controller")
    
    
router.post("/add",addTvrFormQuestion)
router.get("/getAll",getAllTvrFormQuestion)
router.post("/update",updateTvrFormQuestion)
router.post("/activeAndInactive",activeOrInactiveTvrFormQuestion)
    
    
    
module.exports = router;