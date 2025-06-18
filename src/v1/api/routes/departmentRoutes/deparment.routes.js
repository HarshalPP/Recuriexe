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
  getDepartmentListByToken,
  getDepartmentDropDown,
  toggleSubDepartmentStatus,
  deleteDepartment,
  getDepartmentJobApply,
  deleteSubdepartment,
  deleteDepartmentOrSubdepartment,
  updateDepartmentOrSubdepartment
} from "../../controllers/departmentController/department.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"
const departmentRouter = express.Router();

// Department routes
departmentRouter.post("/add", verifyEmployeeToken ,addNewDepartment);
departmentRouter.get("/",verifyEmployeeToken, getDepartmentList);
departmentRouter.get("/dropDown",verifyEmployeeToken, getDepartmentDropDown);
departmentRouter.get("/newdeparment" ,verifyEmployeeToken ,  getDepartmentListForCandidate);
departmentRouter.get("/deparmentFromJobApply" ,verifyEmployeeToken ,  getDepartmentJobApply);
departmentRouter.get("/newdeparmentList"  , getDepartmentListByToken);
departmentRouter.get("/main", getMainDepartmentList);
departmentRouter.get("/single/:departmentId", getDepartmentByIdData);
departmentRouter.post("/update/:departmentId", updateDepartmentData);
departmentRouter.post("/delete/:departmentId", deactivateDepartmentById);
departmentRouter.get("/sub/:departmentId", getSubDepartmentList);
departmentRouter.get("/Activedeparment" , getactivelist)
departmentRouter.post("/deparmentGemini" , verifyEmployeeToken ,  DeparmentGemini)
departmentRouter.post("/addDepartmentsBulk" , verifyEmployeeToken , addDepartmentsBulk)
departmentRouter.post("/toggleSubDepartmentStatus", verifyEmployeeToken, toggleSubDepartmentStatus);
departmentRouter.post("/deleteDepartment", verifyEmployeeToken, deleteDepartment);
departmentRouter.post("/deleteSubdeparment" , verifyEmployeeToken , deleteSubdepartment)
departmentRouter.post("/deleteDepartmentOrSubdepartment" ,verifyEmployeeToken , deleteDepartmentOrSubdepartment )

// candidate protal
departmentRouter.get("/department-candidate", getDepartmentCandidantSide);
departmentRouter.post("/updateDepartmentOrSubdepartment" ,verifyEmployeeToken, updateDepartmentOrSubdepartment)
export default departmentRouter;
