import express from 'express';
const router = express.Router();

import { senderMailAdd, detailById , dropDownList  , senderMailUpdate } from "../../controllers/mailController/mailSender.controller.js"

router.post("/detailAdd", senderMailAdd)
router.get("/detail", detailById)
router.get("/list", dropDownList)
router.post("/update", senderMailUpdate)

export default router;
