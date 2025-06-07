import { badRequest, success, unknownError } from "../../formatters/globalResponse.js"
import CompanyModel from "../../models/companyModel/company.model.js"
import {companySetUpAdd  , companySetUpGet , companySetUpList } from "../../helper/companySetUp.helper.js"


// create comapmny 

export const createCompany = async (req, res) => {
    try {
      const company = new CompanyModel(req.body);
      const savedCompany = await company.save();
      return success(res, "Company created successfully", savedCompany);
    } catch (error) {
      console.error("Error creating company:", error);
      return unknownError(res, error);
    }
  };

  

  // get all compnay 

  export const getAllCompanies = async (req, res) => {
    try {
      const companies = await CompanyModel.find()
      .populate({
        path:"organizationId",
        select: "name",
      })
      return success(res, "Companies fetched successfully", companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      return unknownError(res, error);
    }
  };

  
  // get by Id
  export const getCompanyById = async (req, res) => {
    try {
      const { id } = req.params;
      const company = await CompanyModel.findById(id);
      if (!company) return notFound(res, "Company not found");
      return success(res, "Company fetched successfully", company);
    } catch (error) {
      console.error("Error fetching company:", error);
      return unknownError(res, error);
    }
  };

  
// Update Company //
  export const updateCompany = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCompany = await CompanyModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedCompany) return notFound(res, "Company not found");
      return success(res, "Company updated successfully", updatedCompany);
    } catch (error) {
      console.error("Error updating company:", error);
      return unknownError(res, error);
    }
  };

  

  // delete Company //
  export const deleteCompany = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCompany = await CompanyModel.findByIdAndDelete(id);
      if (!deletedCompany) return notFound(res, "Company not found");
      return success(res, "Company deleted successfully", deletedCompany);
    } catch (error) {
      console.error("Error deleting company:", error);
      return unknownError(res, error);
    }
  };
  
  // ---------------------- Company Set Up ----------------------------------- //

  
  export async function companySetUp(req, res) {
      try {
          const { status, message, data } = await companySetUpAdd(req);
          return status ? success(res, message, data) : badRequest(res, message);
      } catch (error) {
          return unknownError(res, error.message);
      }
  }

  //------------------------------ company set up get ----------------------------//

    
  export async function companySetUpDetail(req, res) {
      try {
          const { status, message, data } = await companySetUpGet(req);
          return status ? success(res, message, data) : badRequest(res, message);
      } catch (error) {
          return unknownError(res, error.message);
      }
  }

  //------------------------------ company set up get List ----------------------------//

    
  export async function companySetUpAllList(req, res) {
      try {
          const { status, message, data } = await companySetUpList(req);
          return status ? success(res, message, data) : badRequest(res, message);
      } catch (error) {
          return unknownError(res, error.message);
      }
  }