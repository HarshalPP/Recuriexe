import * as userProductController from "../../controllers/reportTypeController/reportTyp.controller.js";

import {Router} from "express";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";



const reportTypeRouter = Router();


reportTypeRouter.post("/add",verifyEmployeeToken,userProductController.saveReportType);

reportTypeRouter.post("/update",verifyEmployeeToken,userProductController.updateReportTypeInfo);

reportTypeRouter.post("/remove",verifyEmployeeToken,userProductController.deleteRepotType);

reportTypeRouter.get("/get/:id",verifyEmployeeToken,userProductController.getReportTypeInfo);

reportTypeRouter.get("/all",verifyEmployeeToken,userProductController.getAllReportTypeInfo);


export default reportTypeRouter; 