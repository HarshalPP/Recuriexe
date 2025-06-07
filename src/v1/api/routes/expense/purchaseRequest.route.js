import express from "express";
import * as purchaseController from "../../controllers/expense/purchaseRequest.contorller.js";
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


const purchaseRoute = express.Router();

// tripRoute.post("/add",verifyJWT,expenseController.saveExpense)

purchaseRoute.post("/update",verifyEmployeeToken, purchaseController.updatePurchase)

// tripRoute.get("/get/:id",tripController.getTrip)

purchaseRoute.get("/all",purchaseController.getAllPurchase)

export default purchaseRoute;