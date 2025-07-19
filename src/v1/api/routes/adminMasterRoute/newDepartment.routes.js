const express = require('express');
const {
  addNewDepartment,
  updateDepartmentData,
  getDepartmentByIdData,
  getDepartmentList,
  deactivateDepartmentById,
  getSubDepartmentList,
  getMainDepartmentList
} = require('../../controller/adminMaster/newDepartment.controller');

const departmentRouter = express.Router();

// Department routes
departmentRouter.post("/add", addNewDepartment);
departmentRouter.get("/", getDepartmentList);
departmentRouter.get("/main", getMainDepartmentList);
departmentRouter.get("/single/:departmentId", getDepartmentByIdData);
departmentRouter.post("/update/:departmentId", updateDepartmentData);
departmentRouter.post("/delete/:departmentId", deactivateDepartmentById);
departmentRouter.get("/sub/:departmentId", getSubDepartmentList);

module.exports = departmentRouter;
