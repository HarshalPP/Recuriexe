import express from 'express'
const router = express.Router();


import {getUserTableConfig , updateUserTableConfig} from "../../controllers/userConfigController/userTableConfigController.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"


router.get("/user-table-config" , verifyEmployeeToken , getUserTableConfig)
router.post("/user-table-config" , verifyEmployeeToken , updateUserTableConfig)


export default router;