import express from "express";

import {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    companySetUp,
    companySetUpDetail,
    companySetUpAllList,
  } from "../../controllers/companyController/company.controller.js"

  import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";
  const router = express.Router();



  // Create a new company
router.post("/create", verifyEmployeeToken , createCompany);

// Get all companies
router.get("/get", verifyEmployeeToken ,  getAllCompanies);

// Get a company by ID
router.get("/getbyId/:id", verifyEmployeeToken ,  getCompanyById);

// Update a company
router.post("/update/:id",  verifyEmployeeToken , updateCompany);

// Delete a company
router.post("/delete/:id", verifyEmployeeToken ,  deleteCompany);

router.post("/setUp/add" , verifyEmployeeToken, companySetUp)
router.get("/setUp/detail",verifyEmployeeToken,  companySetUpDetail)
router.get("/setUp/list", verifyEmployeeToken ,companySetUpAllList)

export default router;