
const express = require("express");
const router = express.Router();
const {
    addQueryForm ,
    getQueryFormByCustomerId,
    updateQueryForm , 
    deleteQueryForm,
    queryFormStatus 
} = require("../controller/queryForm.controller");


router.post("/add", addQueryForm);
router.get("/getAll", getQueryFormByCustomerId);
router.post("/update", updateQueryForm);
router.post("/delete",deleteQueryForm)
router.post("/activeOrInactive", queryFormStatus);


module.exports = router;
