import express from "express";
const initFieldsouter = express.Router();

import * as filedController from "../../controllers/initFieldController/initFileds.controller.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

// CREATE initFields
initFieldsouter.post("/add",verifyEmployeeToken, filedController.saveInitFields);

// UPDATE initFields by ID
initFieldsouter.post("/update",verifyEmployeeToken, filedController.updateInitFields);

// DELETE initFields by ID
initFieldsouter.get("/remove/:id",verifyEmployeeToken, filedController.deleteInitFields);

// GET initFields by ID
initFieldsouter.get("/get/:id",verifyEmployeeToken, filedController.getInitFields);

// GET ALL initFields
initFieldsouter.get("/all",verifyEmployeeToken, filedController.getAllInitFieldsController);

export default initFieldsouter;
