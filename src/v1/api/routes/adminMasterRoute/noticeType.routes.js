const express = require("express");
const router = express.Router();

const {
    noticeTypeAdd,
    getAllNoticeType,
    inactiveNoticeType,
    updateNoticeTpye
                     } = require("../../controller/adminMaster/noticeType.controller")

router.post("/add",noticeTypeAdd)
router.get("/getAll",getAllNoticeType)
router.post("/delete",inactiveNoticeType)
router.post("/update",updateNoticeTpye)

 module.exports = router;
 