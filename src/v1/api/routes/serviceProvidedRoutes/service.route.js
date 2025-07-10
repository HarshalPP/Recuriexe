import { Router } from "express";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";
import * as serviceController from "../../controllers/serviceProviderController/service.controller.js";


const serviceproviderRoute = Router();

serviceproviderRoute.post("/add",verifyEmployeeToken,serviceController.createService);
serviceproviderRoute.post("/update",verifyEmployeeToken,serviceController.updateService);
serviceproviderRoute.get("/all",verifyEmployeeToken,serviceController.getAllServices);
serviceproviderRoute.get("/get/:id",verifyEmployeeToken,serviceController.getServicesById);

export default serviceproviderRoute;
