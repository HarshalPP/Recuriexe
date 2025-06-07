import express from "express";
import * as policyController from "../../controllers/expense/policy.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const policyRoute = express.Router();

policyRoute.post("/add",verifyEmployeeToken,policyController.addPolicyValue)

policyRoute.post("/update",verifyEmployeeToken,policyController.updatePolicy)

policyRoute.get("/get/:id",verifyEmployeeToken,policyController.getPolicy)

policyRoute.get("/all",verifyEmployeeToken,policyController.getAllPolicy)

policyRoute.get("/employee",verifyEmployeeToken,policyController.employeeDetails)

export default policyRoute;