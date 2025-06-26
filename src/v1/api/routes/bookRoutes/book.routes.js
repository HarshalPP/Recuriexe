import express from 'express'
const router = express.Router();


import {createBookDemo , getAllBookDemos , getBookDemoById , updateBookDemo , deleteBookDemo} from "../../controllers/bookDemoController/bookdemo.controller.js"
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

router.post("/createBookDemo" , verifyEmployeeToken , createBookDemo)
router.get("/getAllBookDemos" ,verifyEmployeeToken , getAllBookDemos)
router.get("/getBookDemoById/:id" , verifyEmployeeToken , getBookDemoById)
router.post("/updateBookDemo/:id" , verifyEmployeeToken , updateBookDemo)
router.post("/deleteBookDemo/:id" , verifyEmployeeToken , deleteBookDemo)


export default router;