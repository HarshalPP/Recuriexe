import formStageModel from "../../models/FormStageConfig/formStage.model.js";
import { success, badRequest, unknownError } from "../../formatters/globalResponse.js";


// Add Form Stage
// export const addOrUpdateFormStage = async (req, res) => {
//   try {
//     const { stageName, stageKey, order, isActive = true, fields  , Required , OrganizatioId} = req.body;

//     if (!stageName || !stageKey || !order || !Array.isArray(fields)) {
//       return badRequest(res, "Missing required fields: stageName, stageKey, order, or fields");
//     }

//     const updatedOrCreatedStage = await formStageModel.findOneAndUpdate(
//       { stageKey },
//       {
//         stageName,
//         order,
//         isActive,
//         fields,
//         Required,
//         OrganizatioId:req.employee.organizationId || null
//       },
//       {
//         new: true,         // return the updated document
//         upsert: true,      // create if not exists
//         setDefaultsOnInsert: true
//       }
//     );

//     const message = updatedOrCreatedStage.isNew
//       ? "Form stage created successfully"
//       : "Form stage updated successfully";

//     return success(res, message, updatedOrCreatedStage);
//   } catch (error) {
//     console.error("Error in addOrUpdateFormStage:", error);
//     return unknownError(res, "Failed to process form stage");
//   }
// };


export const addOrUpdateFormStage = async (req, res) => {
  try {
    const { stageName, stageKey, order, isActive = true, fields, Required } = req.body;

    if (!stageName || !stageKey || !order || !Array.isArray(fields)) {
      return badRequest(res, "Missing required fields: stageName, stageKey, order, or fields");
    }

    const OrganizatioId = req.employee?.organizationId;

    // Check if a form stage with the same stageKey, stageName, and organizationId exists
    const existingStage = await formStageModel.findOne({
      stageKey,
      stageName,
      OrganizatioId
    });

    let result;
    let message;

    if (existingStage) {
      // Update existing stage
      result = await formStageModel.findOneAndUpdate(
        { stageKey, stageName, OrganizatioId },
        {
          stageName,
          stageKey,
          order,
          isActive,
          fields,
          Required
        },
        { new: true }
      );
      message = "Form stage updated successfully";
    } else {
      // Create new stage
      result = await formStageModel.create({
        stageName,
        stageKey,
        order,
        isActive,
        fields,
        Required,
        OrganizatioId
      });
      message = "Form stage created successfully";
    }

    return success(res, message, result);
  } catch (error) {
    console.error("Error in addOrUpdateFormStage:", error);
    return unknownError(res, "Failed to process form stage");
  }
};



export const toggleFieldAttributes = async (req, res) => {
  try {
    const { stageKey } = req.query;
    const { fields = [], stageName, isActive } = req.body;

    if (!stageKey) {
      return badRequest(res, "Missing stageKey.");
    }

    if (!Array.isArray(fields)) {
      return badRequest(res, "Fields must be an array.");
    }

    const OrganizatioId = req.employee?.organizationId || null;


    // Build dynamic query
    const stageQuery = {
      stageKey,
      OrganizatioId,
    };

    if (stageName) {
      stageQuery.stageName = stageName;
    }


    const stage = await formStageModel.findOne(stageQuery);

    if (!stage) {
      return badRequest(res, "Stage not found for this organization.");
    }

    let updatedFieldPaths = new Set();

    // Update specified fields
    fields.forEach(({ fieldPath, enabled, required }) => {
      const field = stage.fields.find(f => f.fieldPath === fieldPath);
      if (field) {
        if (enabled !== undefined && typeof enabled === "boolean") field.enabled = enabled;
        if (required !== undefined && typeof required === "boolean") field.required = required;
        updatedFieldPaths.add(fieldPath);
      }
    });

    if (updatedFieldPaths.size === 0) {
      return badRequest(res, "No matching fields found to update.");
    }

    if (stageName !== undefined && stageName !== stage.stageName) {
      stage.stageName = stageName;
    }

    if (isActive !== undefined && typeof isActive === "boolean") {
      stage.isActive = isActive;
    }

    await stage.save();

    return success(res, "Field and stage attributes updated successfully.", stage);
  } catch (error) {
    console.error("Error in toggleFieldAttributes:", error);
    return unknownError(res, "Failed to update field or stage attributes.");
  }
};




// export const getAllFormStages = async (req, res) => {
//   try {
//     const organizationId = req.employee?.organizationId || null;
//     const { stageName } = req.query;

//     if (!organizationId) {
//       return badRequest(res, "Missing organization ID.");
//     }

//     const query = { OrganizatioId: organizationId };
//     if (stageName) {
//       query.stageName = { $regex: new RegExp(stageName, "i") }; // case-insensitive partial match
//     }

//     const stages = await formStageModel.find(query);

//     return success(res, "Form stages fetched successfully.", stages);
//   } catch (error) {
//     console.error("Error in getAllFormStages:", error);
//     return unknownError(res, "Failed to fetch form stages.");
//   }
// };


export const getAllFormStages = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId ;
    const { stageName } = req.query;

    if (!organizationId) {
      return badRequest(res, "Missing organization ID.");
    }

    const query = { OrganizatioId: organizationId };
    if (stageName) {
      query.stageName = { $regex: new RegExp(stageName, "i") };
    }

    const stages = await formStageModel.find(query).lean();

    // Group by stageName
    const groupedStages = {};

    stages.forEach((stage) => {
      const { stageName, stageKey, fields, OrganizatioId } = stage;

      if (!groupedStages[stageName]) {
        groupedStages[stageName] = {
          stageName,
          OrganizatioId: OrganizatioId.toString(),
          stages: [],
        };
      }

      groupedStages[stageName].stages.push({
        stageKey,
        isActive: stage.isActive,
        fields,
      });
    });

    // Convert grouped object to array
    const responseData = Object.values(groupedStages);

    return success(res, "Form stages fetched successfully.", responseData);
  } catch (error) {
    console.error("Error in getAllFormStages:", error);
    return unknownError(res, "Failed to fetch form stages.");
  }
};
