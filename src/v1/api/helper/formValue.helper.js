import { returnFormatter } from "../formatters/common.formatter.js";
import valueModel from "../models/dynamicCareerModel/formValue.model.js";
import formModel from "../models/dynamicCareerModel/form.model.js";


// ---------------------------- Add Value ------------------------------

// export async function addValue(requestsObject) {
//   try {
//     if (!requestsObject.body || !requestsObject.user?.serviceId) {
//       return returnFormatter(false, "Invalid request data");
//     }

//     const valueData = {
//       ...requestsObject.body,
//       serviceId: requestsObject.user.serviceId,
//       doneBy : requestsObject.user.empId
//     };

//     const newValue = await valueModel.create(valueData);

//     return returnFormatter(true, "Value created successfully", newValue);
//   } catch (error) {
//     console.error("Error in addValue:", error);
//     return returnFormatter(false, error.message);
//   }
// }


const formatResponse = (formValueDoc) => {
  const { formId, formValues } = formValueDoc;

  // Map formValues by fieldId for quick lookup
  const valueMap = {};
  formValues.forEach(val => {
    if (val.fieldId) {
      valueMap[val.fieldId.toString()] = val.value;
    }
  });

  const result = {
    _id: formValueDoc._id,
    organizationId: formValueDoc.organizationId,
    formId: formId._id,
    formTitle: formId.title,
    fields: formId.fields.map(field => ({
      fieldId: field._id,
      label: field.label,
      type: field.type,
      value: valueMap[field._id.toString()] || null
    }))
  };

  return result;
};


export async function addValue(requestsObject) {
  try {
    const { body, employee } = requestsObject;

    if (!body || !employee?.organizationId || !body.formId) {
      return returnFormatter(false, "Invalid request data");
    }

    const valueData = {
      ...body,
      organizationId: employee.organizationId,
      doneBy: employee.empId
    };

    const newValue = await valueModel.create(valueData);

    // Populate form fields
//     const populatedValue = await valueModel.findById(newValue._id)
//       .populate([
//         // { path: "formId", populate: { path: "fields", model: "form" } }, // 👈 populate fields of form
//         // { path: "doneBy", model: "employee" },
//         // { path: "formValues.fieldId", model: "input" }
//         // .populate([
//   { path: "formId", model: "form" },         // ✅ fields already included
//   { path: "doneBy", model: "employee" },
//   { path: "formValues.fieldId" },            // ❌ no need to populate this if not referencing another model
// ])

const savedDoc = await valueModel
  .findById(newValue._id)
  .populate("formId");

const response = formatResponse(savedDoc);
      // ]);

    return returnFormatter(true, "Value created successfully", response);
  } catch (error) {
    console.error("Error in addValue:", error);
    return returnFormatter(false, error.message);
  }
}


// ---------------------------- Update Value ------------------------------

// export async function updateValueById(id, updateData) {
//   try {
//     const updatedValue = await valueModel.findByIdAndUpdate(
//       id,
//       { ...updateData.body },
//       { new: true }
//     );

//     const savedDoc = await valueModel
//   .findById(updatedValue._id)
//   .populate("formId");

// const response = formatResponse(savedDoc);

//     return returnFormatter(true, "Value updated successfully", response);
//   } catch (error) {
//     console.error("Error in updateValueById:", error);
//     return returnFormatter(false, error.message);
//   }
// }



export async function updateValueById(id, updateData) {
  try {
    const { formId, formValues = [], latitude, longitude, isApproved } = updateData;

    // 🔍 Step 1: Fetch the form
    const form = await formModel.findById(formId);
    if (!form) {
      return returnFormatter(false, "Form not found");
    }

    // 🛠️ Step 2: Match fieldIds with input values
    const updatedFormValues = form.fields.map((field) => {
      const matched = formValues.find((fv) => fv.fieldId === String(field._id));
      return {
        fieldId: field._id,
        value: matched?.value || []
      };
    });

    // ✏️ Step 3: Update value document
    const updatedValue = await valueModel.findByIdAndUpdate(
      id,
      {
        formId,
        formValues: updatedFormValues,
        latitude,
        longitude,
        isApproved,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedValue) {
      return returnFormatter(false, "Value record not found");
    }

    // 📦 Step 4: Populate form and prepare final response
    const savedDoc = await valueModel
      .findById(updatedValue._id)
      .populate("formId");

    const response = formatResponse(savedDoc);

    return returnFormatter(true, "Value updated successfully", response);
  } catch (error) {
    console.error("Error in updateValueById:", error);
    return returnFormatter(false, error.message);
  }
}



// ---------------------------- Update Value Status------------------------------

export async function updateValueStatusById(id, updateData) {
  try {
    const updatedValue = await valueModel.findByIdAndUpdate(
      id,
      { isApproved:true,approvedBy:updateData.user.empId},
      { new: true }
    );

    return returnFormatter(true, "Value status updated successfully", updatedValue);
  } catch (error) {
    console.error("Error in updateValueById:", error);
    return returnFormatter(false, error.message);
  }
}



// ---------------------------- Delete Value ------------------------------

export async function deleteValueById(id) {
  try {
    await valueModel.findByIdAndDelete(id);
    return returnFormatter(true, "Value deleted successfully");
  } catch (error) {
    console.error("Error in deleteValueById:", error);
    return returnFormatter(false, error.message);
  }
}

// ---------------------------- Get Value by ID ------------------------------

export async function getValueById(id) {
  try {
    const valueData = await valueModel
      .findById(id)
      .populate([
        // { path: "serviceId", model: "user" },
        { path: "doneBy", model: "employee" },
        { path: "formValues.fieldId", model: "forms" },
      ]);

    return returnFormatter(true, "Value data fetched successfully", valueData);
  } catch (error) {
    console.error("Error in getValueById:", error);
    return returnFormatter(false, error.message);
  }
}

// ---------------------------- Get All Values for Service ------------------------------

export async function getAllValues(requestsObject) {
  try {
    const { status } = requestsObject.query;

    const query = { serviceId: requestsObject.user.serviceId };
    if (status) {
      query.isApproved = status;
    }

    const values = await valueModel
      .find(query)
      .populate([
        // { path: "serviceId", model: "user" },
        // { path: "productId", model: "product" },
        { path: "doneBy", model: "employee" },
        { path: "formValues.fieldId", model: "forms" },
      ])
      .sort({ createdAt: -1 });

    return returnFormatter(true, "Values fetched successfully", values);
  } catch (error) {
    console.error("Error in getAllValues:", error);
    return returnFormatter(false, error.message);
  }
}


// ---------------------------- Get All Values dashboard ------------------------------
export async function getAllDashboard(requestsObject) {
  try {
    const query = { serviceId: requestsObject.user.serviceId };

    const [unapproved, approved] = await Promise.all([
      valueModel.find({ ...query, isApproved: false })
        .populate([
          // { path: "serviceId", model: "user" },
          // { path: "productId", model: "product" },
          { path: "doneBy", model: "employee" },
          { path: "formValues.fieldId", model: "forms" },
        ])
        .sort({ createdAt: -1 }),

      valueModel.find({ ...query, isApproved: true })
        .populate([
          // { path: "serviceId", model: "user" },
          // { path: "productId", model: "product" },
          { path: "doneBy", model: "employee" },
          { path: "formValues.fieldId", model: "forms" },
        ])
        .sort({ createdAt: -1 }),
    ]);

    const data = {
      total: (approved?.length || 0) + (unapproved?.length || 0),
      approved: approved?.length || 0,
      unapproved: unapproved?.length || 0,
    };

    return returnFormatter(true, "Values fetched successfully", data);
  } catch (error) {
    console.error("Error in getAllDashboard:", error);
    return returnFormatter(false, error.message);
  }
}

