import { returnFormatter } from "../../formatters/common.formatter.js";
import reportFormModel from "../../models/reportFormModel/reportForm.model.js";

//---------------------------------------- crete ---------------------------------

export async function addForm(requestsObject) {
  try {
    if (!requestsObject.body ) {
      return returnFormatter(false, "Invalid request data");
    }

    const formData = {
      ...requestsObject.body,
       organizationId: requestsObject.employee.organizationId,
    };

    const newForm = await reportFormModel.create(formData);
    return returnFormatter(true, "Form created successfully", newForm);
  } catch (error) {
    console.error("Error in addForm:", error);
    return returnFormatter(false, error.message);
  }
}


///----------------------------------------- update ----------------------------

export async function updateFormById(updateData) {
  try {
  
    const { body } = updateData;

    let updatedForm = await reportFormModel.findByIdAndUpdate(
       body.id,
      { ...body },
      { new: true }
    );

    // If not found, create a new one
    if (!updatedForm) {
      updatedForm = await reportFormModel.create({
        organizationId: requestsObject.employee.organizationId,
        ...body,
      });

      return returnFormatter(true, "Form created successfully", updatedForm);
    }

    return returnFormatter(true, "Form updated successfully", updatedForm);
  } catch (error) {
    console.error("Error in updateFormById:", error);
    return returnFormatter(false, error.message);
  }
}




//--------------------------------------- remove ------------------------------------

export async function deleteFormById(id) {
  try {
    await reportFormModel.findByIdAndDelete(id);
    return returnFormatter(true, "Form deleted successfully");
  } catch (error) {
    console.error("Error in deleteFormById:", error);
    return returnFormatter(false, error.message);
  }
}


//---------------------------------------------- get by id -----------------------------------

export async function getFormById(id) {
  try {
    const formData = await reportFormModel.findById(id).populate([
      
        { path: "fields", model: "inputField" }
      ]);;

    return returnFormatter(true, "Form data fetched successfully", formData);
  } catch (error) {
    console.error("Error in getFormById:", error);
    return returnFormatter(false, error.message);
  }
}


//------------------------------- get all -----------------------

export async function getAllForms(requestsObject) {
  try {
    const forms = await reportFormModel
      .find({ organizationId: requestsObject.employee.organizationId }).populate([
      
        { path: "fields", model: "inputField" }
      ]);;;

    return returnFormatter(true, "Forms fetched successfully", forms);
  } catch (error) {
    console.error("Error in getAllForms:", error);
    return returnFormatter(false, error.message);
  }
}


//------------------------------- get all by reportId-----------------------

export async function getAllFormsByReportType(requestsObject) {
  try {
    const forms = await reportFormModel
      .findOne({ reportId: requestsObject.query.reportId }).populate([
      
        { path: "fields", model: "inputField" }
      ]);;

    return returnFormatter(true, "Forms fetched successfully", forms);
  } catch (error) {
    console.error("Error in getAllForms:", error);
    return returnFormatter(false, error.message);
  }
}