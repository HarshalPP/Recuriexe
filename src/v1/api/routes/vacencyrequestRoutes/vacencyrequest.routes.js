import express from "express";
const router = express.Router();
import {vacancyRequestAdd , getVacancyRequestForManager , vacancyRequestUpdate , vacancyRequestDetail , approveVacancy } from "../../controllers/vacancyController/vacancy.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"

router.post("/vacancyRequestAdd" , verifyEmployeeToken , vacancyRequestAdd)
router.get("/getvacancy" , verifyEmployeeToken , getVacancyRequestForManager)
router.post("/vacancyRequestUpdate" , verifyEmployeeToken , vacancyRequestUpdate)
router.get("/detail",verifyEmployeeToken , vacancyRequestDetail)
router.post("/approveReject" , verifyEmployeeToken , approveVacancy)

export default router;