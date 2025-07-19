const express = require("express");
const router = express.Router();

const {
    stageLogStream,
    getEnv,
    updateEnv,
    uploadImage
  } = require("../../controller/adminMaster/server.controller");
const { upload } = require("../../../../../Middelware/multer");



  router.get("/stage/log",stageLogStream)
  router.get("/env/:envName",getEnv)
  router.post("/env/:envName",updateEnv)
  router.post('/upload', upload.single('file'),uploadImage );



module.exports = router;
