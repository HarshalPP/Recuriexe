
import { Router } from 'express';
import {   saveLocation,
    // removeLocation,
    fetchLocationList
} from "../../controllers/trackingController/tracking.controller.js";
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"
const trackingRouter = Router();

trackingRouter.post("/add",verifyEmployeeToken,saveLocation)
trackingRouter.get("/list",verifyEmployeeToken, fetchLocationList);  

export default trackingRouter;

