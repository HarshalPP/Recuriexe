import express from "express";
import * as tripValueController from "../../controllers/expense/tripValue.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const tripValueRoute = express.Router();

tripValueRoute.post("/add",verifyEmployeeToken,tripValueController.saveTripValue)

tripValueRoute.post("/update",verifyEmployeeToken,tripValueController.updateTripValue)

tripValueRoute.get("/get/:id",verifyEmployeeToken,tripValueController.getTripValue)

tripValueRoute.get("/all",verifyEmployeeToken,tripValueController.getAllTripValue)

export default tripValueRoute;