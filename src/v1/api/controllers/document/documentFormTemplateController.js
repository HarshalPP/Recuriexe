import { badRequest, success, notFound, unknownError } from "../../formatters/globalResponse.js";
import DocumentFormTemplate from '../../models/Document/documentFormTemplate.Model.js';
import designationModel from "../../models/designationModel/designation.model.js";
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import jobApply from "../../models/jobformModel/jobform.model.js"
import jobPostModel from "../../models/jobPostModel/jobPost.model.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// // 1️⃣ Create New Template
// export const createDocumentFormTemplate = async (req, res) => {
//   try {
//     const { organizationId, designationId, fields } = req.body;

//     if (!organizationId || !designationId || !Array.isArray(fields)) {
//       return badRequest(res, "Missing required fields");
//     }

//     const newTemplate = await DocumentFormTemplate.create({ organizationId, designationId, fields });
//     return success(res, "Template created successfully", newTemplate);
//   } catch (error) {
//     console.error("Create Template Error:", error);
//     return unknownError(res, "Failed to create template", error);
//   }
// };

// // 2️⃣ Get All Templates (Optional Filter)
// export const getAllTemplates = async (req, res) => {
//   try {
//     const { isActive } = req.query;

//     const filter = {};
//     if (isActive === 'true' || isActive === 'false') {
//       filter.isActive = isActive === 'true';
//     }

//     const templates = await DocumentFormTemplate.find(filter)
//       .populate('organizationId')
//       .populate('designationId');

//     return success(res, "Templates fetched successfully", templates);
//   } catch (error) {
//     console.error("Get All Templates Error:", error);
//     return unknownError(res, "Failed to fetch templates", error);
//   }
// };

// // 3️⃣ Get Template by ID
// export const getTemplateById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const template = await DocumentFormTemplate.findById(id)
//       .populate('organizationId')
//       .populate('designationId');

//     if (!template) {
//       return notFound(res, "Template not found");
//     }

//     return success(res, "Template fetched successfully", template);
//   } catch (error) {
//     console.error("Get Template By ID Error:", error);
//     return unknownError(res, "Failed to fetch template", error);
//   }
// };

// // 4️⃣ Update Template by ID
// export const updateTemplate = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedData = req.body;

//     const updatedTemplate = await DocumentFormTemplate.findByIdAndUpdate(id, updatedData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedTemplate) {
//       return notFound(res, "Template not found");
//     }

//     return success(res, "Template updated successfully", updatedTemplate);
//   } catch (error) {
//     console.error("Update Template Error:", error);
//     return unknownError(res, "Failed to update template", error);
//   }
// };

// 5️⃣ Toggle Template Active/Inactive
export const toggleTemplateActive = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await DocumentFormTemplate.findById(id);
    if (!template) return notFound(res, "Template not found");

    template.isActive = !template.isActive;
    await template.save();

    return success(res, `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`, template);
  } catch (error) {
    console.error("Toggle Template Active Error:", error);
    return unknownError(res, "Failed to toggle template status", error);
  }
};

// 6️⃣ Toggle Field Active/Inactive
export const toggleFieldActive = async (req, res) => {
  try {
    const { templateId, fieldId } = req.params;

    const template = await DocumentFormTemplate.findById(templateId);
    if (!template) return notFound(res, "Template not found");

    const field = template.fields.id(fieldId);
    if (!field) return notFound(res, "Field not found");

    field.isActive = !field.isActive;
    await template.save();

    return success(res, `Field ${field.isActive ? 'activated' : 'deactivated'} successfully`, field);
  } catch (error) {
    console.error("Toggle Field Active Error:", error);
    return unknownError(res, "Failed to toggle field status", error);
  }
};




export const createDocumentFormTemplate = async (req, res) => {
  try {
    const { designationId, isActive = true, fields = [] } = req.body;

    const { organizationId } = req.employee;
    if (!organizationId || !designationId) {
      return badRequest(res, "organizationId and designationId are required");
    }

    // Validate organization and designation
    const [organization, designation] = await Promise.all([
      OrganizationModel.findById(organizationId),
      designationModel.findById(designationId),
    ]);

    if (!organization) return notFound(res, "Organization not found");
    if (!designation) return notFound(res, "Designation not found");

    const existingTemplate = await DocumentFormTemplate.findOne({
      organizationId,
      designationId,
    });

    if (existingTemplate) {
      return badRequest(
        res,
        `${designation.name} Already Has A Document Form Template Set`
      );
    }

    const template = await DocumentFormTemplate.create({
      organizationId,
      designationId,
      isActive,
      fields,
    });

    return success(res, "Document form template created successfully", template);
  } catch (error) {
    console.error("Create DocumentFormTemplate Error:", error);
    return unknownError(res, "Failed to create document form template", error);
  }
};

export const getAllDocumentFormTemplates = async (req, res) => {
  try {
    const { designationId, status, subStatus } = req.query;
    const { organizationId } = req.employee;
    const match = {};
    if (organizationId) match.organizationId = new ObjectId(organizationId);
    if (designationId) match.designationId = new ObjectId(designationId);

    const aggregation = [
      { $match: match },

      // Lookup Organization
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },

      // Lookup Designation
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation",
        },
      },
      { $unwind: "$designation" },

      // Calculate status/subStatus
      {
        $addFields: {
          status: { $cond: [{ $eq: ["$isActive", true] }, "active", "inactive"] },
          subStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $allElementsTrue: [
                      { $map: { input: "$fields", as: "f", in: "$$f.isActive" } },
                    ],
                  },
                  then: "active",
                },
                {
                  case: {
                    $allElementsTrue: [
                      { $map: { input: "$fields", as: "f", in: { $not: "$$f.isActive" } } },
                    ],
                  },
                  then: "inactive",
                },
              ],
              default: "mixed",
            },
          },
        },
      },

      // Optional filter on status and subStatus
      ...(status || subStatus
        ? [
          {
            $match: {
              ...(status && { status }),
              ...(subStatus && { subStatus }),
            },
          },
        ]
        : []),

      {
        $project: {
          organization: { name: 1, _id: 1 },
          designation: { name: 1, _id: 1 },
          // status: 1,
          // subStatus: 1,
          fields: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const templates = await DocumentFormTemplate.aggregate(aggregation);
    return success(res, "Templates fetched successfully", templates);
  } catch (err) {
    console.error("Get All DocumentFormTemplates Error:", err);
    return unknownError(res, "Failed to fetch templates", err);
  }
};


export const getDocumentFormTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return badRequest(res, "Invalid ID");

    const result = await DocumentFormTemplate.aggregate([
      { $match: { _id: new ObjectId(id) } },

      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },

      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation",
        },
      },
      { $unwind: "$designation" },

      {
        $addFields: {
          status: { $cond: [{ $eq: ["$isActive", true] }, "active", "inactive"] },
          subStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $allElementsTrue: [
                      { $map: { input: "$fields", as: "f", in: "$$f.isActive" } },
                    ],
                  },
                  then: "active",
                },
                {
                  case: {
                    $allElementsTrue: [
                      { $map: { input: "$fields", as: "f", in: { $not: "$$f.isActive" } } },
                    ],
                  },
                  then: "inactive",
                },
              ],
              default: "mixed",
            },
          },
        },
      },
      {
        $project: {
          organization: { name: 1, _id: 1 },
          designation: { name: 1, _id: 1 },
          status: 1,
          subStatus: 1,
          fields: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!result || result.length === 0) return notFound(res, "Template not found");

    return success(res, "Template detail fetched", result[0]);
  } catch (err) {
    console.error("Get Template Detail Error:", err);
    return unknownError(res, "Failed to fetch template detail", err);
  }
};


export const updateDocumentFormTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, fields } = req.body;

    if (!ObjectId.isValid(id)) {
      return badRequest(res, "Invalid template ID");
    }

    const template = await DocumentFormTemplate.findById(id);
    if (!template) return notFound(res, "Template not found");

    if (typeof isActive === "boolean") template.isActive = isActive;
    if (Array.isArray(fields)) template.fields = fields;

    await template.save();

    return success(res, "Template updated successfully");
  } catch (err) {
    console.error("Update DocumentFormTemplate Error:", err);
    return unknownError(res, "Failed to update template", err);
  }
};



export const getCandidatDocumentFormById = async (req, res) => {
  try {
    const { candidateId } = req.query;

    if (!ObjectId.isValid(candidateId)) return badRequest(res, "Invalid Candidate Id");

    const candidateDetails = await jobApply.findById(candidateId).select('jobPostId')

    const designationDetail = await jobPostModel.findById(candidateDetails.jobPostId).select('designationId')

    if (!designationDetail.designationId) {
      return notFound(res, "Designation not found for this candidate");
    }
    const result = await DocumentFormTemplate.aggregate([
      { $match: { designationId: new ObjectId(designationDetail.designationId) } },

      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },

      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation",
        },
      },
      { $unwind: "$designation" },

      {
        $addFields: {
          status: { $cond: [{ $eq: ["$isActive", true] }, "active", "inactive"] },
          subStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $allElementsTrue: [
                      { $map: { input: "$fields", as: "f", in: "$$f.isActive" } },
                    ],
                  },
                  then: "active",
                },
                {
                  case: {
                    $allElementsTrue: [
                      { $map: { input: "$fields", as: "f", in: { $not: "$$f.isActive" } } },
                    ],
                  },
                  then: "inactive",
                },
              ],
              default: "mixed",
            },
          },
        },
      },
      {
        $project: {
          organization: { name: 1 },
          designation: { name: 1 },
          status: 1,
          subStatus: 1,
          fields: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!result || result.length === 0) return notFound(res, "Template not found");

    return success(res, "Template detail fetched", result[0]);
  } catch (err) {
    console.error("Get Template Detail Error:", err);
    return unknownError(res, "Failed to fetch template detail", err);
  }
};
