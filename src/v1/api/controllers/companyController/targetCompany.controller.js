import { badRequest, success, unknownError } from "../../formatters/globalResponse.js"
import targetCompanyModel from "../../models/companyModel/targetCompany.model.js"
import organizationModel from "../../models/organizationModel/organization.model.js"

export const addOrUpdateTargetCompany = async(req, res) => {
    try {
        const { prioritizedCompanies, deprioritizedCompanies } = req.body;
        const userId = req.employee?.id || null; // Assuming auth middleware sets req.employee
        const organizationId = req.employee?.organizationId

        
        if (!organizationId) {
            return badRequest(res, "organizationId is required");
        }

        const organization = await organizationModel.findById(organizationId);
        if (!organization) {
            return badRequest(res, "Organization not found");
        }

        const existingDoc = await targetCompanyModel.findOne({ organizationId });
        if (existingDoc) {
            // Update existing
            existingDoc.prioritizedCompanies = prioritizedCompanies || existingDoc.prioritizedCompanies;
            existingDoc.deprioritizedCompanies = deprioritizedCompanies || existingDoc.deprioritizedCompanies;
            existingDoc.updatedBy = userId;
            await existingDoc.save();

            
            return success(res, "Target company updated successfully", { data: existingDoc });
        } else {
            // Create new
            const newDoc = await targetCompanyModel.create({
                organizationId,
                prioritizedCompanies,
                deprioritizedCompanies,
                createdBy: userId,
            });

            return success(res, "Target company created successfully", { data: newDoc });
        }
        
    } catch (error) {
        console.error("Error in addOrUpdateTargetCompany:", error);
        return unknownError(res, "Internal Server Error", error);
    }
};


export const getTargetCompany = async(req, res)=>{
    try {
        const {targetCompanyId} = req.query
        const organizationId = req.employee?.organizationId

        if (!targetCompanyId) {
            return badRequest(res, "target Company is required");
        }

        if (!organizationId) {
            return badRequest(res, "organizationId is required");
        }

        const organization = await organizationModel.findById(organizationId);
        if (!organization) {
            return badRequest(res, "Organization not found");
        }

        const doc = await targetCompanyModel.findOne({ _id :targetCompanyId ,organizationId });

        if (!doc) {
            return badRequest(res, "No target company data found");
        }

        return success(res, "target company detail", { data: doc });
        
    } catch (error) {
        console.error("Error in getTargetCompany:", error);
        return unknownError(res, "Internal Server Error", error);
    }
};
