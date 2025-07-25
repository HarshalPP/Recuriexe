import { Router } from "express";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";
import * as casesController from "../../controllers/reportInitController/reportInit.controller.js"

const casesRoutes = Router();


casesRoutes.post("/add",verifyEmployeeToken,casesController.savecase)
casesRoutes.post("/update",verifyEmployeeToken,casesController.updatecaseData)
casesRoutes.get("/get/:id",verifyEmployeeToken,casesController.getCaseDataById)
casesRoutes.get("/all",verifyEmployeeToken,casesController.getAllCasesData)
casesRoutes.get("/count",verifyEmployeeToken,casesController.casesCount)


export default casesRoutes;