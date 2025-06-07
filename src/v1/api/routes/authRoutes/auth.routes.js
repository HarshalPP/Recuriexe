import express from "express"
import {register , login , updateProfile , userProfile , verifyUser , verifyMail , sendVerificationMail , forgotPassword , resetPassword} from "../../controllers/authController/auth.controller.js"

import { IsAuthenticated , verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

import {newEmployeeLogin , updateEmployee , updateEmployeeById , getAllJoiningEmployee , getAllEmploye  , getEmployeeById , getAllEmployeeInfo,
        getEmployeeCount , employeeTreeHierarchy ,allEmployeDetail,  SuperAdminRegister ,  SuperAdminUpdate , createNewEmployee , getAllEmployeeInfodata , employeeActiveInactive } from "../../controllers/authController/newEmployeeLogin.js"

import {registerSuperAdmin , loginSuperAdmin} from "../../controllers/authController/superAdmin.controller.js"
import { registerUser } from "../../controllers/authController/user.controller.js"
const router = express.Router();

// Candiate Routes //
router.post("/register" , register)
router.post("/login" , login)
router.post("/updateProfile" ,  IsAuthenticated , updateProfile)
router.get("/viewprofile" , IsAuthenticated , userProfile)
router.post("/verify/:token" , verifyUser)
router.get('/verifyemail/:token', verifyMail); // GET route with token in URL
router.post("/sendVerificationemail" , sendVerificationMail)
router.post("/forgotpassword" , forgotPassword)
router.post("/resetPassword/:resetToken" , resetPassword)
router.post("/createNewEmployee", verifyEmployeeToken, createNewEmployee);
router.post("/employeeActiveInactive" , verifyEmployeeToken, employeeActiveInactive)

// Employee Routes //
router.post("/employeelogin" , newEmployeeLogin)
router.post("/employee/update" ,  verifyEmployeeToken ,updateEmployee)
router.post("/emplyee/updateEmployeeById/:id" , verifyEmployeeToken , updateEmployeeById)
router.get("/newjoinee" ,  verifyEmployeeToken , getAllJoiningEmployee)
router.get("/getAllEmployee" , verifyEmployeeToken , getAllEmploye)
router.get("/getAllEmployeeInfodata", verifyEmployeeToken, getAllEmployeeInfodata) // GET all employee info
router.get('/getEmployeeById/:id', getEmployeeById); // GET by ID
router.get("/employee/all",getAllEmployeeInfo)
router.get("/getEmployeeCount",verifyEmployeeToken , getEmployeeCount)
router.get("/employeeTreeHierarchy",verifyEmployeeToken , employeeTreeHierarchy)
router.get("/allEmployeDetail",verifyEmployeeToken ,allEmployeDetail)

// Super Admin //
router.post("/adminReg" , registerSuperAdmin)
router.post("/adminlogin"  , loginSuperAdmin)


// Super Admin Register //
router.post("/superAdminRegister" , SuperAdminRegister)
router.post("/superAdminUpdate/:id" , SuperAdminUpdate)

//add user
router.post("/user/register" , registerUser)







export default router; 