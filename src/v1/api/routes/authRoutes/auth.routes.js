import express from "express"
import {register , login , updateProfile , userProfile , verifyUser , verifyMail , sendVerificationMail , forgotPassword , resetPassword} from "../../controllers/authController/auth.controller.js"

import { IsAuthenticated , verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

import {newEmployeeLogin , updateEmployee , updateEmployeeById , getAllJoiningEmployee , getAllEmploye  , 
        getEmployeeById , getAllEmployeeInfo , getEmployeeCount , employeeTreeHierarchy ,allEmployeDetail, 
         SuperAdminRegister ,  SuperAdminUpdate , createNewEmployee , getAllEmployeeInfodata , 
         employeeActiveInactive , addNewEmployee , updateEmployeePassword,forgotPasswordForEmployee,resetEmployeePassword , adminByUpdateEmployeeId } from "../../controllers/authController/newEmployeeLogin.js"

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
router.post("/addNewEmployee" ,verifyEmployeeToken ,addNewEmployee)
router.get("/getAllEmployee" , verifyEmployeeToken , getAllEmploye)
router.get("/getAllEmployeeInfodata", verifyEmployeeToken, getAllEmployeeInfodata) // GET all employee info
router.post('/employee/adminByUpdate',verifyEmployeeToken ,  adminByUpdateEmployeeId)
router.get('/getEmployeeById/:id', getEmployeeById); // GET by ID
router.get("/employee/all",getAllEmployeeInfo)
router.get("/getEmployeeCount",verifyEmployeeToken , getEmployeeCount)
router.get("/employeeTreeHierarchy",verifyEmployeeToken , employeeTreeHierarchy)
router.get("/allEmployeDetail",verifyEmployeeToken ,allEmployeDetail)
router.post("/updateEmployeePassword", verifyEmployeeToken, updateEmployeePassword);
router.post("/employee/forgotPassword", forgotPasswordForEmployee);
router.post("/employee/resetPassword/:token", resetEmployeePassword);
// Super Admin //
router.post("/adminReg" , registerSuperAdmin)
router.post("/adminlogin"  , loginSuperAdmin)


// Super Admin Register //
router.post("/superAdminRegister" , SuperAdminRegister)
router.post("/superAdminUpdate/:id" , SuperAdminUpdate)

//add user
router.post("/user/register" , registerUser)




// import express from "express"
// const router = express.Router()

// import {register , login , logout , verifyUser , updatePassword ,getAllUsers , updateUserAIConfig , getUserAIConfig , getCurrentUserWithLogs} from "../../controllers/authcontrollers/auth.controller.js"

import {  createApiRegistry,
    getAllApis,
    getApiById,
    updateApiRegistry,
    deleteApiRegistry,
getAllApisByCategory,
} from "../../controllers/verificationController/apiRegistry.controller.js"



// router.post("/register" , register)
// router.post("/login" , login)
// router.post("/logout" , logout)
// router.post("/verifyUser/:token" , verifyUser)
// router.post("/updatePassword" , IsAuthenticated , updatePassword)
// router.post("/getAll" , getAllUsers)
// router.get("/checklimit" ,  IsAuthenticated , getCurrentUserWithLogs)

// // Update config and get config //

// router.post("/updateUserAIConfig" , IsAuthenticated , updateUserAIConfig)
// router.get("/getUserAIConfig" , IsAuthenticated , getUserAIConfig)



// API Register //

router.post("/create", createApiRegistry);
router.get("/get", getAllApis);
router.get("/getApisByCategory"  , getAllApisByCategory)
router.get("/get/:apiId", getApiById);
router.post("/update/:apiId", updateApiRegistry);
router.post("/delete/:apiId", deleteApiRegistry);




export default router; 