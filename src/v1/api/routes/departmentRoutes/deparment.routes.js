import express from 'express';
import {
  addNewDepartment,
  updateDepartmentData,
  getDepartmentByIdData,
  getDepartmentList,
  deactivateDepartmentById,
  getSubDepartmentList,
  getMainDepartmentList,
  getactivelist,
  DeparmentGemini,
  addDepartmentsBulk,
  getDepartmentCandidantSide,
  getDepartmentListForCandidate,
  getDepartmentDropDown,
} from "../../controllers/departmentController/department.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"
const departmentRouter = express.Router();

// Department routes
departmentRouter.post("/add", verifyEmployeeToken ,addNewDepartment);
departmentRouter.get("/",verifyEmployeeToken, getDepartmentList);
departmentRouter.get("/dropDown",verifyEmployeeToken, getDepartmentDropDown);
departmentRouter.get("/newdeparment" , getDepartmentListForCandidate);
departmentRouter.get("/main", getMainDepartmentList);
departmentRouter.get("/single/:departmentId", getDepartmentByIdData);
departmentRouter.post("/update/:departmentId", updateDepartmentData);
departmentRouter.post("/delete/:departmentId", deactivateDepartmentById);
departmentRouter.get("/sub/:departmentId", getSubDepartmentList);
departmentRouter.get("/Activedeparment" , getactivelist)
departmentRouter.post("/deparmentGemini" , DeparmentGemini)
departmentRouter.post("/addDepartmentsBulk" , verifyEmployeeToken , addDepartmentsBulk)

// candidate protal
departmentRouter.get("/department-candidate", getDepartmentCandidantSide);
export default departmentRouter;
