const express = require("express");
const router = express.Router();

const { collectionNews} = require("../../controller/adminMaster/news.controller")

router.post("/topCollectionNews",collectionNews)


 module.exports = router;
 

    