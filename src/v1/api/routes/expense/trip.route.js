import express from "express";
import * as tripController from "../../controllers/expense/trip.controller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const tripRoute = express.Router();

tripRoute.post("/add",verifyEmployeeToken,tripController.saveTrip)

tripRoute.post("/update",verifyEmployeeToken,tripController.updateTrip)

tripRoute.get("/get/:id",verifyEmployeeToken,tripController.getTrip)

tripRoute.get("/all",verifyEmployeeToken,tripController.getAllTrip)

export default tripRoute;