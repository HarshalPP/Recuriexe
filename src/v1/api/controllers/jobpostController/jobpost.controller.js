import vacancyRequestModel from "../../models/vacencyModel/vacancyRequest.model.js"
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import jobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"
import employmentTypeModel from "../../models/employeementTypemodel/employeementtype.model.js"
import departmentModel from "../../models/deparmentModel/deparment.model.js"
import branchModel from "../../models/branchModel/branch.model.js"
import employeModel from "../../models/employeemodel/employee.model.js"
import designationModel from "../../models/designationModel/designation.model.js"
import BudgetModel from "../../models/budgedModel/budged.model.js"
import mongoose from "mongoose"
import { badRequest, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"


// Helper function to convert package string to budget amount
const convertPackageToBudget = (packageString) => {
  if (!packageString) return 0;
  const cleanPackage = packageString.toString().replace(/[^\d.]/g, '');

  let amount = parseFloat(cleanPackage) || 0;
  amount = amount * 100000;
  return amount;
};


// Add Job post //

export const jobPostAdd = async (req, res) => {
  try {
    req.body.organizationId = req.employee.organizationId;
    req.body.createdByHrId = req.employee.id;
    const vacancyId = req.body.vacencyRequestId;
    if (!vacancyId) {
      return badRequest(res, "Vacancy Request Id Is Required");
    }

    const vacancy = await vacancyRequestModel.findById(vacancyId);


    const finddesingnation = await designationModel.findById(vacancy.designationId)

    if (!finddesingnation) {
      return badRequest(res, "desingation not found")
    }

    const findsubDepartment = await departmentModel.findOne({
      'subDepartments._id': vacancy.subDepartmentId
    });
    // if (!findsubDepartment) {
    //   return badRequest(res, "sub Department not found")
    // }

    req.body.position = finddesingnation.name || "null";


    if (!vacancy) {
      return badRequest(res, "Vacancy Request Not Found");
    }

    if (vacancy.vacancyType == "recommended") {
      return badRequest(res, "Vacancy Type Recommended cannot have job post");
    }

    if (vacancy.jobPostId) {
      return badRequest(res, "Job Post already created for this Vacancy Request");
    }

    const findBudget = await BudgetModel.findOne({
      departmentId: finddesingnation.subDepartmentId,
      organizationId : organizationId,
      desingationId: finddesingnation._id
    });

    // if (!findBudget || findBudget.allocatedBudget === 0 || findBudget.numberOfEmployees === 0) {
    //   return badRequest(res, "Please set budget first");
    // }

    // Budget validation logic //
    // const packageAmount = req.body.package || req.body.budget || req.body.salary;
    
    // if (!packageAmount) {
      //   return badRequest(res, "Package/Budget amount is required");
      // }

    //   const requiredBudget = convertPackageToBudget(packageAmount);
    //   console.log("Required Budget:", requiredBudget);
    

    //   const numberOfPositions = req.body.noOfPosition || 1;
    //   const totalRequiredBudget = requiredBudget * numberOfPositions;


    // // Find budget allocation for this designation and department
    // const budgetAllocation = await BudgetModel.findOne({
    //   organizationId: new mongoose.Types.ObjectId(req.employee.organizationId),
    //   departmentId: vacancy.departmentId,
    //   desingationId: vacancy.designationId,
    //   status: "active"
    // });

    // if (!budgetAllocation) {
      //   return badRequest(res, "No budget allocation found for this department and designation combination");
    // }

    //   // Calculate available budget
    // const allocatedBudget = budgetAllocation.allocatedBudget || 0;
    // const holdingBudget = budgetAllocation.HoldingBudget || 0;
    // const availableBudget = allocatedBudget - holdingBudget;

    
    // if( totalRequiredBudget > availableBudget) {
    //   return badRequest(res, `Insufficient budget. Required: ${totalRequiredBudget}, Available: ${availableBudget}`);
    // }
    
    // req.body.Holdingbuged = availableBudget;
    
    
    req.body.budgetId = findBudget._id || null; 
    const jobPost = new jobPostModel(req.body);
    await jobPost.save();


    // Budget validation logic end //
    //  const UpdateBudged = await BudgetModel.findByIdAndUpdate(
    //   budgetAllocation._id,
    //   {
    //     HoldingBudget: availableBudget
    //   },
    //   { new: true }
    // )

    // ENd of the budget validation logic //


    await vacancyRequestModel.findByIdAndUpdate(
      vacancyId,
      { jobPostId: jobPost.id, jobPostCreated: "yes" },
      { new: true }
    );


    //   console.log(ccEmails);
    return success(res, "Job Post Added Successfully", jobPost);
  } catch (error) {
    console.error("Error adding job post:", error);
    return unknownError(res, error);
  }
};




// Add Job post Directly //

export const jobPostAddDirect = async (req, res) => {
  try {
    req.body.organizationId = req.employee.organizationId;
    req.body.createdByHrId = req.employee.id;

    // Optional: validate required fields
    const requiredFields = ['designationId', 'departmentId', 'subDepartmentId'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return badRequest(res, `${field} is required`);
      }
    }

    // Fetch designation name if not passed explicitly as position
    const findDesignation = await designationModel.findById(req.body.designationId);
    if (!findDesignation) {
      return badRequest(res, "Designation not found");
    }
    req.body.position = findDesignation.name;

    const findBudget = await BudgetModel.findOne({
      departmentId: findDesignation.subDepartmentId,
      desingationId: findDesignation._id
    });

    // if (!findBudget || findBudget.allocatedBudget === 0 || findBudget.numberOfEmployees === 0) {
    //   return badRequest(res, "Please set budget first");
    // }

//  req.body.budgetId = findBudget._id || null;
    const jobPost = new jobPostModel(req.body);
    await jobPost.save();

    return success(res, "Job Post Added Successfully", jobPost);
  } catch (error) {
    console.error("Error adding direct job post:", error);
    return unknownError(res, error);
  }
};



export const getAllJobPost = async (req, res) => {
  try {

    const {
      jobTitle,
      departmentId,
      branchIds,
      employmentTypeId,
      experienceFrom,
      experienceTo,
      status
    } = req.query;

    const matchStage = { status: status ? status : 'active' };

    // Job Title - partial match, tolerant of spacing
    if (jobTitle) {
      matchStage.position = { $regex: jobTitle, $options: "i" };
    }

    if (departmentId) {
      matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

    let branchObjectIds = [];
    if (branchIds) {
      branchObjectIds = branchIds
        .split(",")
        .map(id => id.trim())
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
    }


    if (branchObjectIds.length > 0) {
      matchStage.branchId = { $in: branchObjectIds };
    }

    // console.log("matchStage.branch.$elemMatch._id:", JSON.stringify(matchStage.branch.$elemMatch._id));



    if (employmentTypeId) {
      matchStage.employmentTypeId = new mongoose.Types.ObjectId(employmentTypeId);
    }

    // Experience filter (parse "5 Yrs" → 5)
    // if (experienceFrom || experienceTo) {
    //   matchStage.$expr = matchStage.$expr || {};
    //   const extractYears = {
    //     $toDouble: {
    //       $arrayElemAt: [
    //         { $split: [{ $ifNull: ["$experience", "0"] }, " "] },
    //         0
    //       ]
    //     }
    //   };

    //   const rangeFilter = [];
    //   if (experienceFrom) {
    //     rangeFilter.push({ $gte: [extractYears, parseFloat(experienceFrom)] });
    //   }
    //   if (experienceTo) {
    //     rangeFilter.push({ $lte: [extractYears, parseFloat(experienceTo)] });
    //   }

    //   if (rangeFilter.length === 1) {
    //     matchStage.$expr = rangeFilter[0];
    //   } else if (rangeFilter.length === 2) {
    //     matchStage.$expr = { $and: rangeFilter };
    //   }
    // }


    const jobPostList = await jobPostModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
      },

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
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "desingnation",
        },
      },


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
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "newworklocations",
          localField: "Worklocation",
          foreignField: "_id",
          as: "Worklocation",
        }
      },

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
          from: "employees",
          localField: "createdByHrId",
          foreignField: "_id",
          as: "createdByHr",
        },
      },
      {
        $unwind: { path: "$createdByHr", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "_id",
          foreignField: "jobPostId",
          as: "jobId",
        },
      },
      {
        $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true },
      },

      // Lookup for vacancyRequest by vacancyRequestId
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacancyRequestId",
          foreignField: "_id",
          as: "vacancyRequest",
        },
      },
      {
        $unwind: { path: "$vacancyRequest", preserveNullAndEmptyArrays: true },
      },


      {
        $lookup: {
          from: "qualifications",
          localField: "qualificationId",
          foreignField: "_id",
          as: "qualification",
        },
      },
      // Lookup jobDescription inside vacancyRequest
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "vacancyRequest.jobDescriptionId",
          foreignField: "_id",
          as: "vacancyJobDescription",
        },
      },
      {
        $unwind: {
          path: "$vacancyJobDescription",
          preserveNullAndEmptyArrays: true,
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
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      {
        $unwind: { path: "$organization", preserveNullAndEmptyArrays: true },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          position: 1,
          // eligibility: 1,
          experience: 1,
          noOfPosition: 1,
          Worklocation: 1,
          InterviewType: 1,
          package: 1,
          budget: 1,
          budgetType: 1,
          status: 1,
          AgeLimit:1,
          gender: 1,
          jobDescription: { _id: 1, jobDescription: 1 },
          createdByHr: { _id: 1, employeName: 1 },
          department: { _id: 1, name: 1 },
          subDepartment: { _id: 1, name: 1 },
          desingnation: { _id: 1, name: 1 },
          organization: { _id: 1, name: 1 },
          branch: { _id: 1, name: 1, address: 1 },
          Worklocation: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          qualification:1,
          employeeType: { _id: 1, title: 1 },
          jobId: { _id: 1, company: 1 },
          vacancyRequest: {
            _id: 1,
            vacancyType: 1,
            vacancyApproval: 1,
          },
          vacancyJobDescription: {
            _id: 1,
            position: 1,
            jobDescription: 1,
          },
          AI_Percentage: 1,
          MaxAI_Score: 1,
          MinAI_Score: 1,
          AI_Screening: 1,
          createdAt: 1,
        },
      },
    ]);

    success(res, "All job post List", jobPostList);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
};


export const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;

    const updateFields = req.body;

    const updatedJobPost = await jobPostModel.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedJobPost) {
      return badRequest(res, "Job post not found")
    }

    success(res, "Job post updated successfully", updatedJobPost);
  } catch (error) {
    console.error("Update Job Post Error:", error);
    unknownError(res, error);
  }
};


export const getAllJobPostwithoutToken = async (req, res) => {
  try {
    const jobPostList = await jobPostModel.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
      },
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
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "employees",
          localField: "createdByHrId",
          foreignField: "_id",
          as: "createdByHr",
        },
      },
      {
        $unwind: { path: "$createdByHr", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "_id",
          foreignField: "jobPostId",
          as: "jobId",
        },
      },
      {
        $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true },
      },

      // Lookup for vacancyRequest by vacancyRequestId
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacancyRequestId",
          foreignField: "_id",
          as: "vacancyRequest",
        },
      },
      {
        $unwind: { path: "$vacancyRequest", preserveNullAndEmptyArrays: true },
      },

      // Lookup jobDescription inside vacancyRequest
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "vacancyRequest.jobDescriptionId",
          foreignField: "_id",
          as: "vacancyJobDescription",
        },
      },
      {
        $unwind: {
          path: "$vacancyJobDescription",
          preserveNullAndEmptyArrays: true,
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
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      {
        $unwind: { path: "$organization", preserveNullAndEmptyArrays: true },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          position: 1,
          eligibility: 1,
          experience: 1,
          noOfPosition: 1,
          budget: 1,
          budgetType: 1,
          status: 1,
          jobDescription: { _id: 1, jobDescription: 1 },
          createdByHr: { _id: 1, employeName: 1 },
          department: { _id: 1, name: 1 },
          organization: { _id: 1, name: 1 },
          branch: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          jobId: { _id: 1, company: 1 },
          vacancyRequest: {
            _id: 1,
            vacancyType: 1,
            vacancyApproval: 1,
          },
          vacancyJobDescription: {
            _id: 1,
            position: 1,
            jobDescription: 1,
          },
        },
      },
    ]);

    success(res, "All job post List", jobPostList);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
};

export const getPostDashBoard = async (req, res) => {
  try {
    const totalJobs = await jobPostModel.countDocuments();
    const activeJobs = await jobPostModel.countDocuments({ status: "active" });
    const inactiveJobs = await jobPostModel.countDocuments({ status: "inactive" });

    const aiScreeningEnabled = await jobPostModel.countDocuments({ AI_Screening: "true" });
    const aiScreeningDisabled = await jobPostModel.countDocuments({ AI_Screening: "false" });

    const totalPositions = await jobPostModel.aggregate([
      { $group: { _id: null, total: { $sum: "$noOfPosition" } } }
    ]);

    const departmentDesignationStats = await jobPostModel.aggregate([
      {
        $match: {
          status: "active" // Only include active job posts
        }
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacencyRequestId",
          foreignField: "_id",
          as: "vacancy"
        }
      },
      { $unwind: "$vacancy" },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      { $unwind: "$department" },
      {
        $lookup: {
          from: "newdesignations",
          localField: "vacancy.designationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$department._id",
          departmentName: { $first: "$department.name" },
          totalPositions: { $sum: 1 }, // Count of active job posts
          designations: { $addToSet: "$designation.name" }
        }
      }
    ]);


    // const branchStats = await jobPostModel.aggregate([
    //   { $unwind: "$branchId" },
    //   {
    //     $lookup: {
    //       from: "newbranches",
    //       localField: "branchId",
    //       foreignField: "_id",
    //       as: "branch"
    //     }
    //   },
    //   { $unwind: "$branch" },
    //   {
    //     $group: {
    //       _id: "$branch._id",
    //       branchName: { $first: "$branch.name" },
    //       jobCount: { $sum: 1 }
    //     }
    //   }
    // ]);
    const branchStats = await jobPostModel.aggregate([
      {
        $unwind: "$branchId"
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch"
        }
      },
      {
        $unwind: "$branch"
      },
      {
        $group: {
          _id: {
            branchId: "$branch._id",
            jobId: "$_id"
          },
          branchName: { $first: "$branch.name" }
        }
      },
      {
        $group: {
          _id: "$_id.branchId",
          branchName: { $first: "$branchName" },
          jobCount: { $sum: 1 }
        }
      }
    ]);

    const employmentTypeStats = await jobPostModel.aggregate([
      {
        $match: {
          status: "active"
        }
      },
      {
        $lookup: {
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType"
        }
      },
      { $unwind: "$employmentType" },
      {
        $group: {
          _id: "$employmentType._id",
          employmentType: { $first: "$employmentType.title" },
          jobCount: { $sum: 1 }
        }
      }
    ]);



    // AI Screening Percentage
    const aiScreeningPercentage = totalJobs > 0
      ? Math.round((aiScreeningEnabled / totalJobs) * 100)
      : 0;

    return success(res, "Job Post Dashboard", {
      totals: {
        totalJobs,
        activeJobs,
        inactiveJobs,
        totalPositions: totalPositions.length > 0 ? totalPositions[0].total : 0
      },
      aiScreening: {
        enabled: aiScreeningEnabled,
        disabled: aiScreeningDisabled,
        percentage: aiScreeningPercentage
      },
      departmentStats: departmentDesignationStats,
      branchStats,
      employmentTypeStats
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
