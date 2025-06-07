import express from 'express';
const router = express.Router();
import { saveMailSwitch, getMailSwitch  } from '../../controllers/mailController/mailSwitch.controller.js';

import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"

router.post('/addUpdate', verifyEmployeeToken ,saveMailSwitch);
router.get('/get',verifyEmployeeToken ,  getMailSwitch);

export default router;
