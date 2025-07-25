import { Router } from "express";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";
import * as serviceController from "../../controllers/reportServiceController/service.controller.js";


const reportServiceRoute = Router();

reportServiceRoute.post("/add",verifyEmployeeToken,serviceController.createService);
reportServiceRoute.post("/update",verifyEmployeeToken,serviceController.updateService);
reportServiceRoute.get("/all",verifyEmployeeToken,serviceController.getAllServices);
reportServiceRoute.get("/get/:id",verifyEmployeeToken,serviceController.getServicesById);

export default reportServiceRoute;
