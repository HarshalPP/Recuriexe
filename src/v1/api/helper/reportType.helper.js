import mongoose from "mongoose";
import { returnFormatter } from "../formatters/common.formatter.js";
import { userProductFormatter } from "../formatters/userProduct/userProduct.formatter.js";
import reportTypeModel from "../models/reportProduct/reportProduct.model.js";

//----------------------------   add User Product ------------------------------
export async function addReportType(requestsObject) {
    try {
     
    
       let  newData = await reportTypeModel.create({
            ...requestsObject.body,
            organizationId: requestsObject.employee.organizationId
        });

        return returnFormatter(true, "Report created successfully", newData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// --------------------- update User Product -----------------------

export async function updateReportType(productId,updateData) {
    try {
        

        const updatedProData = await reportTypeModel.findByIdAndUpdate(new mongoose.Types.ObjectId(productId),{...updateData.body},{new:true})

        return returnFormatter(true, "report updated succefully", updatedProData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- delete Product -----------------------
export async function removeReportType(productId) {
    try {
   
        const updatedCompanyData = await reportTypeModel.findByIdAndUpdate(
            productId,
            { isActive: false },
            { new: true }
        );

        return returnFormatter(true, "report removed successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// --------------------- get Product -----------------------

export async function getReporttypeById(productId) {
    try {
        const desigantionData = await reportTypeModel.findById(new mongoose.Types.ObjectId(productId));
        return returnFormatter(true, "Report data",desigantionData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get all Product -----------------------

export async function getAllReportType(requestsObject) {
    try {
        let query = {
            organizationId: requestsObject.employee.organizationId,
            isActive: true
        };

        // Add serviceId filter if present
        if (requestsObject.query.serviceId) {
            query.serviceId = new mongoose.Types.ObjectId(requestsObject.query.serviceId);
        }

        const productData = await reportTypeModel
            .find(query)
            .sort({ createdAt: -1 });

        return returnFormatter(true, "Report data", productData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}





