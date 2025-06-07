import express from "express";
import * as merchantController from "../../controllers/expense/merchant.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const merchantRoute = express.Router();

merchantRoute.post("/add",verifyEmployeeToken, merchantController.saveMerchant)

merchantRoute.post("/update",verifyEmployeeToken,merchantController.updateMerchant)

merchantRoute.get("/get/:id",verifyEmployeeToken,merchantController.getMerchant)

merchantRoute.get("/all",verifyEmployeeToken,merchantController.getAllMerchant)

export default merchantRoute;