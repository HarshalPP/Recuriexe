const express = require("express");
const router = express.Router();
const { addQuestion , detailQuestion , updateQuestion , questionsAllList , userQuestionsList } = require("../controller/question.controller");


router.post("/question/add", addQuestion);
router.post("/question/update/:id",updateQuestion)
router.get("/question/detail/:id",detailQuestion)
router.get("/question/all/list",questionsAllList)
router.get("/question/byUser/list",userQuestionsList)

module.exports = router;

