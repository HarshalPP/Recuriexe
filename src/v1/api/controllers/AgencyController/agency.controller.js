import AgencyModel from "../../models/ClientModel/Client.model.js"
import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import ClientCandidateAssignment from "../../models/ClientModel/ClientCandidate.model.js"
import jobApply from "../../models/jobformModel/jobform.model.js"
import mongoose from "mongoose"
import ExcelJS from "exceljs";
import uploadToSpaces from "../../services/spaceservices/space.service.js"
import path from "path";
import fs from "fs";

// Create
export const createAgencyClient = async (req, res) => {
  try {
    const { organizationId } = req.employee; // Assuming admin user
    const { companyName, Email, MobileNumber, designationId, location } = req.body;

    if (!companyName || !Email || !MobileNumber) {
      return badRequest(res, "companyName, Email, and MobileNumber are required.");
    }

    const client = await AgencyModel.create({
      organizationId,
      companyName,
      Email,
      MobileNumber,
      designationId,
      location
    });

    return success(res, "Client created successfully", client);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};

// Get All (for organization)
export const getAllAgencyClients = async (req, res) => {
  try {
    const { organizationId } = req.employee;

    const clients = await AgencyModel.find({ organizationId })
       .sort({createdAt:-1})
      .populate({
        path:"designationId",
        select:'name'
      })
      .populate({
        path:"location",
        select:'name'
      });

    return success(res, "Client list fetched", clients);
  } catch (error) {
    return unknownError(res, error);
  }
};

// Get One
export const getAgencyClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await AgencyModel.findById(id)
      .populate({
        path:"designationId",
        select:'name'
      })
      .populate({
        path:"location",
        select:'name'
      });

    if (!client) return badRequest(res, "Client not found");

    return success(res, "Client fetched", client);
  } catch (error) {
    return unknownError(res, error);
  }
};

// Update
export const updateAgencyClient = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await AgencyModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return badRequest(res, "Client not found");

    return success(res, "Client updated", updated);
  } catch (error) {
    return unknownError(res, error);
  }
};

// Delete
export const deleteAgencyClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AgencyModel.findByIdAndDelete(id);

    if (!deleted) return badRequest(res, "Client not found");

    return success(res, "Client deleted", deleted);
  } catch (error) {
    return unknownError(res, error);
  }
};

// Assing 
export const assignMultipleCandidatesToClient = async (req, res) => {
  try {
    const { clientId, candidateIds } = req.body;
    const organizationId = req.employee.organizationId;
    const assignedBy = req.employee.id;

    if (!clientId || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return badRequest(res, "clientId and at least one candidateId are required.");
    }

    const existingAssignment = await ClientCandidateAssignment.findOne({
      clientId,
      organizationId,
    });

    let alreadyAssigned = [];
    let newCandidateIds = candidateIds;

    if (existingAssignment) {
      alreadyAssigned = candidateIds.filter(id =>
        existingAssignment.candidateIds.includes(id.toString())
      );
      newCandidateIds = candidateIds.filter(id => !alreadyAssigned.includes(id));
    }

    if (newCandidateIds.length > 0) {
      if (existingAssignment) {
        await ClientCandidateAssignment.updateOne(
          { _id: existingAssignment._id },
          { $addToSet: { candidateIds: { $each: newCandidateIds } } }
        );
      } else {
        await ClientCandidateAssignment.create({
          clientId,
          organizationId,
          assignedBy,
          candidateIds: newCandidateIds,
        });
      }

      await jobApply.updateMany(
        {
          _id: { $in: newCandidateIds.map(id => new mongoose.Types.ObjectId(id)) },
          orgainizationId: organizationId,
        },
        { $set: { clientId } }
      );
    }

    // ✅ Fetch the final assigned list (old + new)
    const updatedAssignment = await ClientCandidateAssignment.findOne({
      clientId,
      organizationId,
    });

    const allAssignedCandidateIds = updatedAssignment?.candidateIds || [];

    if (!allAssignedCandidateIds.length) {
      return success(res, "No assigned candidates found.", {
        assignedCount: 0,
        skippedCount: 0,
        url: null,
      });
    }

    // 📦 Fetch complete candidate data for Excel
    const candidates = await jobApply.aggregate([
      {
        $match: {
          _id: { $in: allAssignedCandidateIds.map(id => new mongoose.Types.ObjectId(id)) },
          orgainizationId: new mongoose.Types.ObjectId(organizationId),
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          let: { branchIds: "$branchId" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$branchIds"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "branches",
        },
      },

      {
        $lookup: {
          from: "jobposts",
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPost",
        },
      },
      { $unwind: { path: "$jobPost", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPost.designationId",
          foreignField: "_id",
          as: "designation",
        },
      },
      { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPost.subDepartmentId",
          foreignField: "subDepartments._id",
          as: "subDeptContainer",
        },
      },
      {
        $addFields: {
          subDepartment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $arrayElemAt: ["$subDeptContainer.subDepartments", 0] },
                  as: "sub",
                  cond: { $eq: ["$$sub._id", "$jobPost.subDepartmentId"] },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          candidateUniqueId: 1,
          name: 1,
          emailId: 1,
          mobileNumber: 1,
          resume: 1,
          currentCTC: 1,
          expectedCTC: 1,
          matchPercentage: 1,
          summary: 1,
          AI_Score: 1,
          AI_Confidence: 1,
          AI_Screeing_Result: 1,
          resumeShortlisted: 1,
          lastOrganization: 1,
          position: 1,
          createdAt: 1,
          departmentName: "$department.name",
          designationName: "$designation.name",
          subDepartmentName: "$subDepartment.name",
          branches: "$branches",
        },
      },
    ]);

    const formattedData = candidates.map((c) => ({
      candidateUniqueId: c.candidateUniqueId,
      name: c.name,
      emailId: c.emailId,
      mobileNumber: c.mobileNumber,
      position: c.position,
      department: c.departmentName || "",
      designation: c.designationName || "",
      subDepartment: c.subDepartmentName || "",
      currentCTC: c.currentCTC || "",
      expectedCTC: c.expectedCTC || "",
      AI_Score: c.AI_Score ?? "",
      AI_Confidence: c.AI_Confidence ?? "",
      AI_Screeing_Result: c.AI_Screeing_Result || "",
      resumeShortlisted: c.resumeShortlisted || "",
      lastOrganization: Array.isArray(c.lastOrganization)
        ? c.lastOrganization.join(", ")
        : c.lastOrganization || "",
      branches: c.branches?.map((b) => b.name).join(", ") || "",
      createdAt: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
    }));

    // 📄 Create Excel in-memory
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Candidates");

    worksheet.columns = Object.keys(formattedData[0]).map(key => ({
      header: key,
      key,
      width: 25
    }));

    worksheet.addRows(formattedData);

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `HRMS/exports/assigned-candidates-${Date.now()}.xlsx`;

    const url = await uploadToSpaces(
      "finexe",
      fileName,
      buffer,
      "public-read",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  // ✅ Update the assignment with the Excel URL
await ClientCandidateAssignment.updateOne(
  { clientId, organizationId },
  { $set: { excelUrl: url } }
);



    return success(res, "Candidate assignment updated and Excel uploaded.", {
      assignedCount: newCandidateIds.length,
      skippedCount: alreadyAssigned.length,
      totalCandidates: formattedData.length,
      url,
    });

  } catch (err) {
    console.error("Error assigning candidates to client:", err);
    return unknownError(res, err);
  }
};




export const getAssignedCandidatesToClients = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const { clientId, designationId, search, page = 1, limit = 100 } = req.query;

    const matchConditions = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };

    if (clientId) {
      matchConditions.clientId = new mongoose.Types.ObjectId(clientId);
    }

    const pipeline = [
      { $match: matchConditions },

      // Lookup client details
      {
        $lookup: {
          from: "agencies",
          localField: "clientId",
          foreignField: "_id",
          as: "clientDetails"
        }
      },
      { $unwind: "$clientDetails" },

      // Unwind candidateIds array
      { $unwind: "$candidateIds" },

      // Lookup candidate details from jobApplyForm
      {
        $lookup: {
          from: "jobapplyforms",
          localField: "candidateIds",
          foreignField: "_id",
          as: "candidateDetails"
        }
      },
      { $unwind: "$candidateDetails" },

      // Lookup job post for designation & subDepartment
      {
        $lookup: {
          from: "jobposts",
          localField: "candidateDetails.jobPostId",
          foreignField: "_id",
          as: "jobPostDetail"
        }
      },
      {
        $unwind: {
          path: "$jobPostDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup department
      {
        $lookup: {
          from: "newdepartments",
          localField: "candidateDetails.departmentId",
          foreignField: "_id",
          as: "departmentDetail"
        }
      },
      {
        $unwind: {
          path: "$departmentDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup branches
      {
        $lookup: {
          from: "newbranches",
          let: { branchIds: "$candidateDetails.branchId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$branchIds"]
                }
              }
            },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "branchDetails"
        }
      },

      // Lookup designation
      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPostDetail.designationId",
          foreignField: "_id",
          as: "designationDetail"
        }
      },
      {
        $unwind: {
          path: "$designationDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup sub-department
      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPostDetail.subDepartmentId",
          foreignField: "subDepartments._id",
          as: "subDepartmentDetail"
        }
      },
      {
        $unwind: {
          path: "$subDepartmentDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          subDepartment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$subDepartmentDetail.subDepartments",
                  as: "sub",
                  cond: {
                    $eq: ["$$sub._id", "$jobPostDetail.subDepartmentId"]
                  }
                }
              },
              0
            ]
          }
        }
      },

      // Optional filtering
      ...(designationId
        ? [{
            $match: {
              "jobPostDetail.designationId": new mongoose.Types.ObjectId(designationId)
            }
          }]
        : []),

      ...(search
        ? [{
            $match: {
              $or: [
                { "candidateDetails.name": { $regex: search, $options: "i" } },
                { "candidateDetails.emailId": { $regex: search, $options: "i" } },
                { "candidateDetails.mobileNumber": { $regex: search, $options: "i" } },
                { "clientDetails.companyName": { $regex: search, $options: "i" } }
              ]
            }
          }]
        : []),

      // Final projection
      {
        $project: {
          _id: 0,
          clientId: "$clientId",
          clientName: "$clientDetails.companyName",
          excelUrl: "$excelUrl", // <-- Include excel URL
          candidate: {
            _id: "$candidateDetails._id",
            candidateUniqueId: "$candidateDetails.candidateUniqueId",
            name: "$candidateDetails.name",
            emailId: "$candidateDetails.emailId",
            mobileNumber: "$candidateDetails.mobileNumber",
            resume: "$candidateDetails.resume",
            currentCTC: "$candidateDetails.currentCTC",
            expectedCTC: "$candidateDetails.expectedCTC",
            matchPercentage: "$candidateDetails.matchPercentage",
            summary: "$candidateDetails.summary",
            AI_Score: "$candidateDetails.AI_Score",
            AI_Confidence: "$candidateDetails.AI_Confidence",
            AI_Screeing_Result: "$candidateDetails.AI_Screeing_Result",
            resumeShortlisted: "$candidateDetails.resumeShortlisted",
            lastOrganization: "$candidateDetails.lastOrganization",
            position: "$candidateDetails.position",
            createdAt: "$candidateDetails.createdAt",
            department: "$departmentDetail.name",
            branches: "$branchDetails",
            designation: "$designationDetail.name",
            subDepartment: "$subDepartment.name"
          }
        }
      },

      // Group by client
   {
  $group: {
    _id: "$clientId",
    clientName: { $first: "$clientName" },
    excelUrl: { $first: "$excelUrl" }, // 👈 Add this
    candidates: { $push: "$candidate" }
  }
},

      { $sort: { clientName: 1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ];

    const results = await ClientCandidateAssignment.aggregate(pipeline);

    return success(res, "Assigned candidates fetched successfully.", {
      page: parseInt(page),
      limit: parseInt(limit),
      data: results
    });

  } catch (err) {
    console.error("Error in getAssignedCandidatesToClients:", err);
    return unknownError(res, err);
  }
};