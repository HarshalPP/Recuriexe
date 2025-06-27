import express from 'express'
const router = express.Router();


import {createBookDemo , getAllBookDemos , getBookDemoById , updateBookDemo , deleteBookDemo} from "../../controllers/bookDemoController/bookdemo.controller.js"
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

router.post("/createBookDemo" , createBookDemo)
router.get("/getAllBookDemos"  , getAllBookDemos)
router.get("/getBookDemoById/:id"  , getBookDemoById)
router.post("/updateBookDemo/:id" , updateBookDemo)
router.post("/deleteBookDemo/:id"  , deleteBookDemo)


export default router;