import { returnFormatter } from "../formatters/common.formatter.js";
import inputModel from "../models/dynamicCareerModel/inputField.model.js";



//----------------------------   add field ------------------------------

export async function addField(requestsObject) {
  try {
    // Validate the required input
    console.log("Received request object:", requestsObject);
    console.log("Request body:", requestsObject.body);
    console.log("User organizationId:", requestsObject.employee.organizationId);
     // Optional logging for debugging
    if (!requestsObject.body || !requestsObject.employee?.organizationId) {
      return returnFormatter(false, "Invalid request data");
    }

    // Merge the body with the organizationId
    const fieldData = {
      ...requestsObject.body,
      organizationId: requestsObject.employee.organizationId
    };

    // Create the new document
    const newField = await inputModel.create(fieldData);

    return returnFormatter(true, "Created successfully", newField);
  } catch (error) {
    console.error("Error in addField:", error); // Optional logging
    return returnFormatter(false, error.message);
  }
}


// --------------------- update field -----------------------

export async function updateFieldById(id,updateData) {
    try {
      
        const updatedCompanyData = await inputModel.findByIdAndUpdate(id,{...updateData},{new:true})
        return returnFormatter(true, "Updated succesfully", updatedCompanyData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// --------------------- delete field -----------------------

export async function deleteFieldById(id) {
    try {
        await inputModel.findByIdAndDelete(id);

        return returnFormatter(true, "Field deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// --------------------- get field -----------------------

export async function getFieldById(id) {
    try {
        const companyData = await inputModel.findById(id)  
              
        return returnFormatter(true, "Field data",companyData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}




// --------------------- get all field -----------------------

export async function getAllFields(requestsObject) {
    try {
        const companyData = await inputModel.find({organizationId:requestsObject.employee.organizationId}).sort({createdAt:-1})
        return returnFormatter(true, "Data fetched",companyData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get all company -----------------------

export async function getAll(requestsObject) {
    try {
        const companyData = await companyModel.find().populate({
            path: "serviceId", 
            model: "user", // 
            options: { strictPopulate: false }
        }).sort({createdAt:-1})
        return returnFormatter(true, companySuccessMessage,companyData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}