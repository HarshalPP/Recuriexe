import express from "express";

import {
    addOrUpdateTargetCompany,
    getTargetCompany,
  } from "../../controllers/companyController/targetCompany.controller.js"

  import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";
  const router = express.Router();


router.post("/add", verifyEmployeeToken ,addOrUpdateTargetCompany)
router.get("/get", verifyEmployeeToken ,getTargetCompany)

export default router;
