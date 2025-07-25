import { returnFormatter } from "../../formatters/common.formatter.js";
import inputFieldModel from "../../models/inputFieldModel/inputfied.model.js";



//----------------------------   add field ------------------------------

export async function addField(requestsObject) {
  try {
    // Validate the required input
    if (!requestsObject.body ) {
      return returnFormatter(false, "Invalid request data");
    }

    // Merge the body with the serviceId
    const fieldData = {
      ...requestsObject.body,
      organizationId: requestsObject.employee.organizationId
    };

    // Create the new document
    const newField = await inputFieldModel.create(fieldData);

    return returnFormatter(true, "Created successfully", newField);
  } catch (error) {
    console.error("Error in addField:", error); // Optional logging
    return returnFormatter(false, error.message);
  }
}


// --------------------- update field -----------------------

export async function updateFieldById(id,updateData) {
    try {
      
        const updatedCompanyData = await inputFieldModel.findByIdAndUpdate(id,{...updateData},{new:true})
        return returnFormatter(true, "Updated succesfully", updatedCompanyData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// --------------------- delete field -----------------------

export async function deleteFieldById(id) {
    try {
        await inputFieldModel.findByIdAndDelete(id);
        return returnFormatter(true, "Field deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// --------------------- get field -----------------------

export async function getFieldById(id) {
    try {
        const companyData = await inputFieldModel.findById(id)  
              
        return returnFormatter(true, "Field data",companyData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}




// --------------------- get all field -----------------------

export async function getAllFields(requestsObject) {
    try {
        const companyData = await inputFieldModel.find({organizationId:requestsObject.employee.organizationId}).sort({createdAt:1})
        return returnFormatter(true, "Data fetched",companyData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get all company -----------------------

export async function getAllByReportType(requestsObject) {
    try {
        const companyData = await inputFieldModel.find({reportId:requestsObject.params.reportId});
        return returnFormatter(true, "data fetched succesfully",companyData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}