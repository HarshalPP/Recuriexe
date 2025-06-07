import express from 'express';
const router = express.Router();

import { addMailContent , getMailContent  }  from "../../controllers/mailController/mailContent.controller.js"

router.post("/add", addMailContent)
router.get("/get" , getMailContent)

export default router;
