import { returnFormatter } from "../formatters/common.formatter.js";
import formModel from "../models/dynamicCareerModel/form.model.js";

//---------------------------------------- crete ---------------------------------

export async function addForm(requestsObject) {
  try {
    //  console.log("Received request object:", requestsObject);
    // console.log("Request body:", requestsObject.body);
    // console.log("User organizationId:", requestsObject.employee.organizationId);
    if (!requestsObject.body || !requestsObject.employee?.organizationId) {
          return returnFormatter(false, "Invalid request data");
        }

    const formData = {
      ...requestsObject.body,
      organizationId: requestsObject.employee.organizationId,
    };

    const newForm = await formModel.create(formData);
    return returnFormatter(true, "Form created successfully", newForm);
  } catch (error) {
    console.error("Error in addForm:", error);
    return returnFormatter(false, error.message);
  }
}


///----------------------------------------- update ----------------------------

// export async function updateFormById(id,updateData) {
//   try {
//     const { organizationId } = updateData.employee;
//     const { body } = updateData;

//     console.log("Received request object:", updateData);
//     console.log("Request body:", body);
//     console.log("User organizationId:", organizationId);

//     if (!id || !organizationId) {
//       return returnFormatter(false, "Form ID and organization ID are required");
//     }

//     // Check if the form exists




//     let updatedForm = await formModel.findOneAndUpdate(id,
//       { organizationId },
//       { ...body, organizationId },
//       { new: true }
//     );

//     // If not found, create a new one
//     if (!updatedForm) {
//       updatedForm = await formModel.create({
//         organizationId,
//         ...body,
//       });

//       return returnFormatter(true, "Form created successfully", updatedForm);
//     }

//     return returnFormatter(true, "Form updated successfully", updatedForm);
//   } catch (error) {
//     console.error("Error in updateFormById:", error);
//     return returnFormatter(false, error.message);
//   }
// }

export async function updateFormById( updateData) {
  try {
    const organizationId = updateData.employee?.organizationId;
    const { body } = updateData;

    console.log("Received request object:", updateData);
    console.log("Request body:", body);
    console.log("User organizationId:", organizationId);

    console.log("Form ID:", body.id);
    if ( !body.id) {
      return returnFormatter(false, "form id is required");
    }
    if ( !organizationId) {
      return returnFormatter(false, " organization ID is required");
    }

    // Check if the form exists
    const formExists = await formModel
      .findOne({ _id: body.id, organizationId });
    if (!formExists) {
      return returnFormatter(false, "Form not found");
    }

    let updatedForm = await formModel.findOneAndUpdate(
      { _id: body.id, organizationId },
      { ...body, organizationId },
      { new: true }
    );

    // if (!updatedForm) {
    //   updatedForm = await formModel.create({
    //     organizationId,
    //     ...body,
    //   });

    //   return returnFormatter(true, "Form created successfully", updatedForm);
    // }

    return returnFormatter(true, "Form updated successfully", updatedForm);
  } catch (error) {
    console.error("Error in updateFormById:", error);
    return returnFormatter(false, error.message);
  }
}


//--------------------------------------- remove ------------------------------------

export async function deleteFormById(id) {
  try {
    if (!id) {
      return returnFormatter(false, "Form ID is required");
    }
    const formExists = await formModel.findById(id);
    if (!formExists) {
      return returnFormatter(false, "Form not found");
    }
    await formModel.findByIdAndDelete(id);
    return returnFormatter(true, "Form deleted successfully");
  } catch (error) {
    console.error("Error in deleteFormById:", error);
    return returnFormatter(false, error.message);
  }
}


//---------------------------------------------- get by id -----------------------------------

export async function getFormById(id) {
  try {
    if (!id) {
      return returnFormatter(false, "Form ID is required");
    }
    const formExists = await formModel.findById(id);
    if (!formExists) {
      return returnFormatter(false, "Form not found");
    }
    const formData = await formModel.findById(id).populate({
      path: "fields", // assuming 'fields' are referenced
      model: "input", // if you have inputModel as 'inputs' in Mongoose
    });

    return returnFormatter(true, "Form data fetched successfully", formData);
  } catch (error) {
    console.error("Error in getFormById:", error);
    return returnFormatter(false, error.message);
  }
}


//------------------------------- get all -----------------------

export async function getAllForms(requestsObject) {
  try {
    const forms = await formModel
      .find({ organizationId: requestsObject.employee.organizationId })
      .populate({
        path: "fields",
        model: "input",
      })
      .sort({ createdAt: -1 });

    return returnFormatter(true, "Forms fetched successfully", forms);
  } catch (error) {
    console.error("Error in getAllForms:", error);
    return returnFormatter(false, error.message);
  }
}
