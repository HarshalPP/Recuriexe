import { returnFormatter } from "../formatters/common.formatter.js";
import formModel from "../models/formLibraryModel/formLibrary.model.js";
import initFieldModel from "../models/initFiledsModel/initFields.model.js";


// ----------------------------   Add initFileds ------------------------------


export async function addinitFileds(requestObject) {
  try {
    const inputFields = requestObject.body.initFields || [];
    const organizationId = requestObject.employee?.organizationId;

    if (!organizationId) {
      throw new Error("Missing serviceId from request.");
    }

    // Process input fields to get only ObjectIds
    const fieldIds = await Promise.all(
      inputFields.map(async (field) => {
        let fieldId;

        if (field?.fieldName && field?.dataType) {
          // Find or create the form field
          let existingField = await formModel.findOne({
            fieldName: field.fieldName,
            dataType: field.dataType,
          }).lean();

          if (!existingField) {
            const created = await formModel.create({
              fieldName: field.fieldName,
              dataType: field.dataType,
              isRequired: field.isRequired !== undefined ? field.isRequired : true
            });
            existingField = created.toObject();
          } else {
            // Update isRequired if provided
            if (field.isRequired !== undefined) {
              await formModel.updateOne(
                { _id: existingField._id },
                { $set: { isRequired: field.isRequired } }
              );
              existingField.isRequired = field.isRequired;
            }
          }

          fieldId = existingField._id;
        } else if (field?.fieldId) {
          const existing = await formModel.findById(field.fieldId).lean();
          fieldId = existing?._id || field.fieldId;
        } else {
          throw new Error(
            "Invalid field object. Must contain either 'fieldName' and 'dataType' or 'fieldId'."
          );
        }

        return fieldId;
      })
    );

    // Check for existing initFields entry
    const existingEntry = await initFieldModel.findOne({ organizationId });

    if (existingEntry) {
      // Update the existing document
      existingEntry.fields = fieldIds;
      await existingEntry.save();

      return returnFormatter(
        true,
        "initFields updated successfully",
        existingEntry
      );
    }

    // Create new entry
    const initFieldsData = await initFieldModel.create({
      organizationId,
      fields: fieldIds,
    });

    return returnFormatter(true, "initFields created successfully", initFieldsData);
  } catch (error) {
    return returnFormatter(false, error.message || "An error occurred");
  }
}


// --------------------- Update initFields -----------------------
export async function updateinitFiledsById(requestObject) {
  try {
    const inputFields = requestObject.body.initFields || [];

    // Process each input field to get { fieldId, isRequired }
    const processedFields = await Promise.all(
      inputFields.map(async (field) => {
        let fieldId;

        if (field.fieldName) {
          // Find or create the form field
          let existingField = await formModel.findOne({
            fieldName: field.fieldName,
            dataType: field.dataType,
          }).lean();

          if (!existingField) {
            const created = await formModel.create({
              fieldName: field.fieldName,
              dataType: field.dataType,
            });
            existingField = created.toObject();
          }

          fieldId = existingField._id;
        } else if (field?.fieldId) {
          const existing = await formModel.findById(field.fieldId).lean();
          fieldId = existing?._id || field.fieldId;
        } else {
          throw new Error(
            "Invalid field object. Must contain either 'fieldName' or 'fieldId'."
          );
        }

        // Use isRequired from input or default true
        const isRequired =
          typeof field.isRequired === "boolean" ? field.isRequired : true;

        return { fieldId, isRequired };
      })
    );

    // Update the initFields document by id
    const updatedinitFields = await initFieldModel.findByIdAndUpdate(
      requestObject.body.id,
      {
        serviceId: requestObject.user.serviceId,
        fields: processedFields,
      },
      { new: true }
    );

    return returnFormatter(true, "initFields updated successfully", updatedinitFields);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


// --------------------- Delete initFields -----------------------
export async function deleteInitFieldsById(initFieldsId) {
    try {
        await initFieldModel.findByIdAndDelete(initFieldsId);
        return returnFormatter(true, "initFields deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- Get initFields by ID -----------------------
export async function getInitFieldsById(initFieldsId) {
    try {
        const initFieldsData = await initFieldModel.findById(initFieldsId).lean();
        return returnFormatter(true, "initFields data retrieved", initFieldsData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- Get All initFields -----------------------
export async function getAllInitFields(requestObject) {
    try {
     const initFieldsList = await initFieldModel.find({
  organizationId: requestObject.employee.organizationId
}).sort({ createdAt: -1 });

if (!initFieldsList.length) {
  return returnFormatter(false, "Please create init fields first");
}


        // Use Promise.all to handle async mapping
        const enrichedFields = await Promise.all(
            initFieldsList[0].fields.map(async (data) => {
                
                const formField = await formModel.findById(data); // assuming `data` has a reference to the formModel via `formId`
             
                return {
                    fieldName: formField?.fieldName,
                    dataType: formField?.dataType,
                    isRequired: formField?.isRequired
                };
            })
        );

        return returnFormatter(true, "initFields list retrieved", enrichedFields);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

