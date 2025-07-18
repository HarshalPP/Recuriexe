import DocumentFormValue from "../../models/Document/documentFormValue.model.js";
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import DocumentFormTemplate from "../../models/Document/documentFormTemplate.Model.js";
import JobPostModel from "../../models/jobPostModel/jobPost.model.js";
import JobApplyModel from "../../models/jobformModel/jobform.model.js";
import { badRequest, success, unknownError, notFound } from "../../formatters/globalResponse.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const createDocumentFormValue = async (req, res) => {
    try {
        const { templateId, candidateId, values ,organizationId } = req.body;

        if (!organizationId || !templateId || !organizationId  || !Array.isArray(values)) {
            return badRequest(res, "All fields are required: organizationId   templateId, candidateId, values");
        }

        const candidate = await JobApplyModel.findById(candidateId)
        // Check if referenced records exist
        const [organization, template, jobPost] = await Promise.all([
            OrganizationModel.findById(organizationId),
            DocumentFormTemplate.findById(templateId),
            JobPostModel.findById(candidate?.jobPostId),
        ]);

        if (!organization) return notFound(res, "Organization not found");
        if (!template) return notFound(res, "Document Template not found");
        if (!candidate) return notFound(res, "Candidate not found");
        if (!jobPost) return notFound(res, "Job Post not found");

        if (candidate?.documentRequest === "submitted") {
            return badRequest(res, "Document has already been submitted.");
        }
        // Optional: Check if each `fieldId` in `values` exists in the selected template
        const templateFieldIds = template.fields.map(f => f._id.toString());
        const invalidFields = values.filter(val => !templateFieldIds.includes(val.fieldId));

        if (invalidFields.length > 0) {
            return badRequest(res, "One or more fieldId(s) do not exist in the selected template");
        }

        const newDoc = await DocumentFormValue.create({
            organizationId,
            templateId,
            jobPostId :jobPost._id,
            candidateId,
            values,
        });
        const documentRequest = await JobApplyModel.findByIdAndUpdate(
            candidateId,
            { documentRequest: "submitted" },
            { new: true }
        );

        return success(res, "Document form value saved successfully", newDoc);
    } catch (error) {
        console.error("Create DocumentFormValue Error:", error);
        return unknownError(res, "Failed to save document form value", error);
    }
};



export const getAllDocumentFormValues = async (req, res) => {
    try {
        const { jobPostId, candidateId,organizationId } = req.query;

        if(organizationId && !mongoose.Types.ObjectId.isValid(organizationId)){
            return badRequest(res, "OrganizationId is required");
        }
        if (jobPostId && !mongoose.Types.ObjectId.isValid(jobPostId)) {
            return badRequest(res, "Invalid Job Post ID");
        }
        if (candidateId && !mongoose.Types.ObjectId.isValid(candidateId)) {
            return badRequest(res, "Invalid Candidate ID")
        }

        const documentFormValues = await DocumentFormValue.aggregate([
            // Match filters
            {
                $match: {
                    ...(organizationId && { organizationId: new ObjectId(organizationId) }),
                    ...(jobPostId && { jobPostId: new ObjectId(jobPostId) }),
                    ...(candidateId && { candidateId: new ObjectId(candidateId) }),
                },
            },
            // Lookup organization
            {
                $lookup: {
                    from: "organizations",
                    localField: "organizationId",
                    foreignField: "_id",
                    as: "organization",
                },
            },
            { $unwind: "$organization" },

            // Lookup job post
            {
                $lookup: {
                    from: "jobposts",
                    localField: "jobPostId",
                    foreignField: "_id",
                    as: "jobPost",
                },
            },
            { $unwind: "$jobPost" },

            // Lookup candidate
            {
                $lookup: {
                    from: "jobapplyforms",
                    localField: "candidateId",
                    foreignField: "_id",
                    as: "candidate",
                },
            },
            { $unwind: "$candidate" },

            // Lookup DocumentFormTemplate
            {
                $lookup: {
                    from: "documentformtemplates",
                    localField: "templateId",
                    foreignField: "_id",
                    as: "template",
                },
            },
            { $unwind: "$template" },

            // Re-map each value to include fieldName
            {
                $addFields: {
                    values: {
                        $map: {
                            input: "$values",
                            as: "val",
                            in: {
                                $mergeObjects: [
                                    "$$val",
                                    {
                                        fieldName: {
                                            $let: {
                                                vars: {
                                                    matchedField: {
                                                        $first: {
                                                            $filter: {
                                                                input: "$template.fields",
                                                                as: "f",
                                                                cond: {
                                                                    $eq: ["$$f._id", "$$val.fieldId"],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                in: "$$matchedField.fieldName",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },

            // Optional: project only required fields
            {
                $project: {
                    organization: { name: 1,_id:1 },
                    jobPost: { position: 1, experience: 1, noOfPosition: 1, jobPostId: 1 ,_id:1},
                    candidate: {
                        _id:1,
                        name: 1,
                        emailId: 1,
                        mobileNumber: 1,
                        candidateId: 1,
                        candidateUniqueId: 1,
                        graduationYear: 1,
                        highestQualification: 1,
                    },
                    values: 1,
                    createdAt: 1,
                },
            },
        ]);

        return success(res, "Document Form Values fetched successfully", documentFormValues);
    } catch (error) {
        console.error("Get All DocumentFormValues Error:", error);
        return unknownError(res, "Failed to fetch document form values", error);
    }
}



export const getDocumentFormValueById = async (req, res) => {
    try {
        const { candidateId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(candidateId)) {
            return badRequest(res, "Invalid Candidate ID");
        }

        const result = await DocumentFormValue.aggregate([
            { $match: { candidateId: new mongoose.Types.ObjectId(candidateId) } },
            {
                $lookup: {
                    from: "organizations",
                    localField: "organizationId",
                    foreignField: "_id",
                    as: "organization",
                },
            },
            { $unwind: "$organization" },

            // Lookup job post
            {
                $lookup: {
                    from: "jobposts",
                    localField: "jobPostId",
                    foreignField: "_id",
                    as: "jobPost",
                },
            },
            { $unwind: "$jobPost" },

            // Lookup candidate
            {
                $lookup: {
                    from: "jobapplyforms",
                    localField: "candidateId",
                    foreignField: "_id",
                    as: "candidate",
                },
            },
            { $unwind: "$candidate" },

            // Lookup DocumentFormTemplate
            {
                $lookup: {
                    from: "documentformtemplates",
                    localField: "templateId",
                    foreignField: "_id",
                    as: "template",
                },
            },
            { $unwind: "$template" },

            // Re-map each value to include fieldName
            {
                $addFields: {
                    values: {
                        $map: {
                            input: "$values",
                            as: "val",
                            in: {
                                $mergeObjects: [
                                    "$$val",
                                    {
                                        fieldName: {
                                            $let: {
                                                vars: {
                                                    matchedField: {
                                                        $first: {
                                                            $filter: {
                                                                input: "$template.fields",
                                                                as: "f",
                                                                cond: {
                                                                    $eq: ["$$f._id", "$$val.fieldId"],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                in: "$$matchedField.fieldName",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },

            // Optional: project only required fields
            {
                $project: {
                    organization: { name: 1 ,_id:1},
                    jobPost: { position: 1, experience: 1, noOfPosition: 1, jobPostId: 1,_id:1 },
                    candidate: {
                        _id:1,
                        name: 1,
                        emailId: 1,
                        mobileNumber: 1,
                        candidateId: 1,
                        candidateUniqueId: 1,
                        graduationYear: 1,
                        highestQualification: 1,
                    },
                    values: 1,
                    createdAt: 1,
                },
            },
        ]);

        if (!result || result.length === 0) {
            return notFound(res, "Document form value not found");
        }

        return success(res, "Fetched document form value", result[0]);
    } catch (err) {
        console.error("Get DocumentFormValueById Error:", err);
        return unknownError(res, "Failed to get document form value", err);
    }
};


export const updateDocumentFormValue = async (req, res) => {
    try {
        const { id } = req.params;
        const { values } = req.body;

        if (!id) return badRequest(res, "ID is required");
        if (!Array.isArray(values)) return badRequest(res, "Values must be an array");

        const updatedDoc = await DocumentFormValue.findByIdAndUpdate(
            id,
            { values },
            { new: true }
        )

        if (!updatedDoc) return notFound(res, "Document Form Value not found");

        return success(res, "Document form value updated successfully");
    } catch (error) {
        console.error("Update DocumentFormValue Error:", error);
        return unknownError(res, "Failed to update document form value", error);
    }
}


