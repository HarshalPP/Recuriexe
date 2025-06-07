import { validationResult } from "express-validator";
import vacancyRequestModel from "../../models/vacencyModel/vacancyRequest.model.js"
// import jobApplyFormModel from "../models/jobApplyForm.model.js";
import jobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"
import employmentTypeModel from "../../models/employeementTypemodel/employeementtype.model.js"
import departmentModel from "../../models/deparmentModel/deparment.model.js"
import branchModel from "../../models/branchModel/branch.model.js"
import employeModel from "../../models/employeemodel/employee.model.js"
import mongoose from "mongoose";

import { badRequest, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"


export const vacancyRequestAdd = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { roleName, id, organizationId } = req.employee

    // if (roleName.some(role => ['admin', 'hr'].includes(role))) {
    // req.body.vacancyApproval = "approved"
    // }


    if (req.body.vacancyType === "recommended" && !req.body.resume) {
      return badRequest(res, "Resume is required.");
    }

    req.body.createdByManagerId = id;
    req.body.organizationId = organizationId;
    let msg = "Vacancy Request added successfully";
    let jobApplyForm;

    const vacancyRequest = await vacancyRequestModel.create(req.body);

    //   if (vacancyRequest.vacancyType === "recommended") {
    //     req.body.vacancyApproval = "approved";
    //     req.body.vacancyRequestId = vacancyRequest._id;
    //     req.body.branchId = req.body.selectedBranchId;

    //     if (req.body.jobFormType === "recommended") {
    //       req.body.status = "hold";
    //       req.body.resumeShortlisted = "hold";
    //       req.body.recommendedByID = req.Id;
    //     }

    //     jobApplyForm = await jobApplyFormModel.create(req.body);
    //     await jobFormGoogleSheet(jobApplyForm);
    //     msg = "Vacancy Request and candidate recommendation added successfully";
    //   }



    success(res, msg);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
};


export const getVacancyRequestForManager = async (req, res) => {
  try {
    const { id, organizationId, roleName } = req.employee
    const { vacancyStatus } = req.query
    const {
      page = 1,
      limit = 100,
      search = "",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let matchStage = {
      status: "active",
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };

    if (roleName.some(role => ['admin', 'hr'].includes(role))) {
      matchStage.vacancyApproval = vacancyStatus ? vacancyStatus : "active";
    } else {
      matchStage.createdByManagerId = new mongoose.Types.ObjectId(id);
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      matchStage.$or = [
        { position: regex },
        { eligibility: regex },
        { experience: regex },
        { priority: regex },
      ];
    }

    const aggregatePipeline = [
      { $match: matchStage },
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
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
      // workLocation //

      {
        $lookup: {
          from: "newdepartments",
          localField: "subDepartmentId",
          foreignField: "_id",
          as: "subDepartment",
        }
      },
      { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },


      {
        $lookup: {
          from: "newdepartments",
          let: { subDeptId: "$subDepartmentId" },
          pipeline: [
            { $unwind: "$subDepartments" },
            {
              $match: {
                $expr: {
                  $eq: ["$subDepartments._id", "$$subDeptId"]
                }
              }
            },
            {
              $project: {
                _id: "$subDepartments._id",
                name: "$subDepartments.name"
              }
            }
          ],
          as: "subDepartment"
        }
      },
      { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },


      {
        $lookup: {
          from: "employeetypes",
          localField: "employeeTypeId",
          foreignField: "_id",
          as: "employeeType",
        },
      },
      { $unwind: { path: "$employeeType", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      { $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "createdByManagerId",
          foreignField: "_id",
          as: "createdByManager",
        },
      },
      { $unwind: { path: "$createdByManager", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },


      {
        $lookup: {
          from: "newworklocations",
          localField: "Worklocation",
          foreignField: "_id",
          as: "Worklocations",
        }
      },

      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "desingnation",
        },
      },
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescription",
        },
      },
      { $unwind: { path: "$jobDescription", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organizationDetail",
        },
      },
      { $unwind: { path: "$organizationDetail", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "qualifications",
          localField: "qualificationId",
          foreignField: "_id",
          as: "qualificationDetail",
        },
      },
      { $unwind: { path: "$qualificationDetail", preserveNullAndEmptyArrays: true } },

      { $sort: { createdAt: -1 } }, // ✅ Sort by createdAt descending
      {
        $project: {
          _id: 1,
          position: 1,
          // eligibility: 1,
          experience: 1,
          priority: 1,
          package: 1,
          Budget: 1,
          packageType: 1,
          noOfPosition: 1,
          InterviewType: 1,
          status: 1,
          jobPost: 1,
          jobPostCreated: 1,
          vacancyApproval: 1,
          vacancyType: 1,
          recommendMail: 1,
          department: { _id: 1, name: 1 },
          subDepartment: { _id: 1, name: 1 },
          desingnation: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          employeeType: { _id: 1, title: 1 },
          branch: { _id: 1, name: 1 },
          Worklocations: { _id: 1, name: 1 },
          createdByManager: { _id: 1, employeName: 1, employeUniqueId: 1 },
          jobDescription: { _id: 1, jobDescription: 1, position: 1 },
          organizationDetail: { _id: 1, name: 1, website: 1 },
          qualificationDetail: { _id: 1, name: 1 },
          createdAt: 1,
          // company: 1,
          AI_Screening: 1,
          MaxAI_Score: 1,
          MinAI_Score: 1,
          AI_Percentage: 1
        },
      },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ];

    const [vacancyList, totalCountAgg] = await Promise.all([
      vacancyRequestModel.aggregate(aggregatePipeline),
      vacancyRequestModel.aggregate([
        { $match: matchStage },
        { $count: "total" },
      ]),
    ]);

    const total = totalCountAgg[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return success(res, "All vacancy request list", {
      data: vacancyList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
};

export const vacancyRequestDetail = async (req, res) => {
  try {
    const { vacancyId } = req.query

    if (!vacancyId) {
      return badRequest(res, "Vacancy Id Required")
    }

    const vacanyDetail = await vacancyRequestModel.findById(vacancyId).populate('organizationId', 'name')
      .populate('vacancyApprovalById', 'userName employeName').populate('jobDescriptionId', 'jobDescription').populate('createdByManagerId', 'userName employeName')
      .populate('qualificationId', 'name').populate('branchId', 'name').populate('jobPostId', '')
      .populate('employeeTypeId', 'title name').populate('employmentTypeId', 'title').populate('designationId', 'name')
      .populate('departmentId', 'name')

    if (!vacanyDetail) {
      return badRequest(res, "vacancy Not Found")
    }
    return success(res, "vacancy Detail", vacanyDetail)
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}


export const approveVacancy = async (req, res) => {
  try {
    const { status, vacancyId } = req.query

    if (!status) {
      return badRequest(res, "Status Required")
    }
    if (!['approved', "notApproved"].includes(status)) {
      return badRequest(res, "Status To Be approved and notApproved")
    }

    if (!vacancyId) {
      return badRequest(res, "Vacancy Id Required")
    }
    const vacanyExist = await vacancyRequestModel.findById(vacancyId)
    if (!vacanyExist) {
      return badRequest(res, "Vacancy Not Found")
    }

    const vacanyApprove = await vacancyRequestModel.findByIdAndUpdate(vacancyId, { vacancyApproval: status }, { new: true })

    return success(res, `vacancy ${status}`, vacanyApprove)
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}

export const vacancyRequestUpdate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { vacancyRequestId, positions, ...updateData } = req.body;
    const vacancyRequest = await vacancyRequestModel.findById(vacancyRequestId);

    if (!vacancyRequest) {
      return badRequest(res, "Vacancy Request not found");
    }

    if (vacancyRequest.jobPostId !== null) {
      return badRequest(res, "Cannot Update As Job Post Is Created");
    }

    updateData.createdByManagerId = req.Id;

    const updatedVacancyRequest = await vacancyRequestModel.findByIdAndUpdate(
      vacancyRequestId,
      updateData,
      { new: true }
    );

    // const branchIds = updatedVacancyRequest.branchId;
    // const branches = await branchModel.find({ _id: { $in: branchIds } });
    // const branchNames = branches.map(branch => branch.name);

    // const employementTypeById = await employmentTypeModel.findById(
    //   updatedVacancyRequest.employmentTypeId
    // );
    // const employementTypeName = employementTypeById?.title || "Not Available";

    // const departmentById = await departmentModel.findById(
    //   updatedVacancyRequest.departmentId
    // );
    // const departmentName = departmentById?.name || "Not Available";

    // const jobDescriptionId = await jobDescriptionModel.findById(
    //   updatedVacancyRequest.jobDescriptionId
    // );
    // const jobDescriptionName = jobDescriptionId?.jobDescription || "Not Available";
    // const position = jobDescriptionId?.position || "Not Available";

    // const createdByManagerId = await employeModel.findById(
    //   updatedVacancyRequest.createdByManagerId
    // );
    // const createdByManager = createdByManagerId?.employeName || "Not Available";

    // const vacancyApprovalById = await employeModel.findById(
    //   updatedVacancyRequest.vacancyApprovalById
    // );
    // const vacancyApprovalBy = vacancyApprovalById?.employeName || "Not Available";

    //   if (positions) {
    //     await jobApplyFormModel.findOneAndUpdate(
    //       { vacancyRequestId },
    //       { $set: { position: positions } }
    //     );
    //   }

    //   await vacancyRequestGoogleSheet(
    //     position,
    //     vacancyRequest,
    //     branchNames.join(", "),
    //     employementTypeName,
    //     departmentName,
    //     jobDescriptionName,
    //     createdByManager,
    //     vacancyApprovalBy
    //   );

    success(res, "Vacancy Request Updated Successfully", updatedVacancyRequest);
  } catch (error) {
    unknownError(res, error);
  }
};