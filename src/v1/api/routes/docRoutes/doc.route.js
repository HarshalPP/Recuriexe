import { Router } from 'express';
import * as docConntroller from "../../controllers/docController/doc.controller.js";
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';
const docRouter = Router();

docRouter.post("/add",verifyEmployeeToken,docConntroller.addDocInfo)

docRouter.get("/remove",verifyEmployeeToken,docConntroller.removeInfo)

docRouter.get("/all",verifyEmployeeToken,docConntroller.getDocInfo)

export default docRouter;