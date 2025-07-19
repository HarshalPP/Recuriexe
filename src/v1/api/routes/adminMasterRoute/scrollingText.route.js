const express = require("express");
const router = express.Router();

const {scrollingTextAdd,getAllScrollingText,scrollingTextDelete,getAllScrollingNotification} = require("../../controller/adminMaster/scrollingText.controller")

router.post("/Add",scrollingTextAdd)
router.get("/getAll",getAllScrollingText)
router.post("/delete",scrollingTextDelete)
router.get("/getAllScrollingNotification",getAllScrollingNotification)

 module.exports = router;
 