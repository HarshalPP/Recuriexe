import vacancyRequestModel from "../../models/vacencyModel/vacancyRequest.model.js"
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import jobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"
import employmentTypeModel from "../../models/employeementTypemodel/employeementtype.model.js"
import departmentModel from "../../models/deparmentModel/deparment.model.js"
import branchModel from "../../models/branchModel/branch.model.js"
import employeModel from "../../models/employeemodel/employee.model.js"
import jobApply from "../../models/jobformModel/jobform.model.js"
import designationModel from "../../models/designationModel/designation.model.js"
import DepartmentBudget from "../../models/budgedModel/budged.model.js"
import BudgetModel from "../../models/budgedModel/budged.model.js"
import jobPostingsetting from "../../models/settingModel/jobPostsetting.model.js"
import mongoose from "mongoose"
const ObjectId = mongoose.Types.ObjectId;
import { badRequest, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"
import PlanModel from "../../models/PlanModel/Plan.model.js"

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
    const organizationId = req.employee.organizationId;
    req.body.organizationId = organizationId
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
      organizationId: organizationId,
      desingationId: finddesingnation._id
    });

    if (!findBudget || findBudget.allocatedBudget === 0 || findBudget.numberOfEmployees === 0) {
      return badRequest(res, "Please set budget first");
    }

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

   const NewOrg=req.employee.organizationId;
    // ✅ Check active plan for organization
    const activePlan = await PlanModel.findOne({ organizationId:NewOrg, isActive: true });
    if (!activePlan) {
      return badRequest(res, "No active plan found for this organization");
    }
    
       // ✅ Check number of job posts against plan limit
    const currentJobPostCount = await jobPostModel.countDocuments({ organizationId: NewOrg});
    if (currentJobPostCount >= activePlan.NumberOfJobPosts) {
      return badRequest(
        res,
        `Job post limit reached. Allowed: ${activePlan.NumberOfJobPosts}, Current: ${currentJobPostCount}. Please upgrade your plan.`
      );
    }


    // Fetch designation name if not passed explicitly as position
    const findDesignation = await designationModel.findById(req.body.designationId);
    if (!findDesignation) {
      return badRequest(res, "Designation not found");
    }
    req.body.position = findDesignation.name;

    const findBudget = await BudgetModel.findOne({
      departmentId: findDesignation.subDepartmentId,
      desingationId: findDesignation._id,
      organizationId: req.body.organizationId,
    });

    if (!findBudget || findBudget.allocatedBudget === 0 || findBudget.numberOfEmployees === 0) {
      return badRequest(res, "Please set budget first");
    }

    const userBudget = Number(req.body.budget);

    if (isNaN(userBudget) || userBudget <= 0) {
      return badRequest(res, "Invalid budget amount");
    }

    // Update usedBudget
    findBudget.usedBudget = (findBudget.usedBudget || 0) + userBudget;

    // Optional: check if usedBudget exceeds allocatedBudget
    if (findBudget.usedBudget > findBudget.allocatedBudget) {
      return badRequest(res, "Used budget exceeds allocated budget");
    }

    await findBudget.save();
    req.body.budgetId = findBudget._id || null;
    const jobPost = new jobPostModel(req.body);
    await jobPost.save();

    return success(res, "Job Post Added Successfully", jobPost);
  } catch (error) {
    console.error("Error adding direct job post:", error);
    return unknownError(res, error);
  }
};




// export const getAllJobPost = async (req, res) => {
//   try {

//     const {
//       jobTitle,
//       departmentId,
//       branchIds,
//       employmentTypeId,
//       experienceFrom,
//       experienceTo,
//       status,
//       jobPostExpired
//     } = req.query;

//     const matchStage = {};

//     if (!jobPostExpired || jobPostExpired === "false") {
//       matchStage.jobPostExpired = false
//     } else if (jobPostExpired === "true") {
//       matchStage.jobPostExpired = true
//     }
//     // Job Title - partial match, tolerant of spacing
//     if (jobTitle) {
//       matchStage.position = { $regex: jobTitle, $options: "i" };
//     }

//     if (departmentId) {
//       matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
//     }

//     let branchObjectIds = [];
//     if (branchIds) {
//       branchObjectIds = branchIds
//         .split(",")
//         .map(id => id.trim())
//         .filter(id => mongoose.Types.ObjectId.isValid(id))
//         .map(id => new mongoose.Types.ObjectId(id));
//     }


//     if (branchObjectIds.length > 0) {
//       matchStage.branchId = { $in: branchObjectIds };
//     }

//     // console.log("matchStage.branch.$elemMatch._id:", JSON.stringify(matchStage.branch.$elemMatch._id));



//     if (employmentTypeId) {
//       matchStage.employmentTypeId = new mongoose.Types.ObjectId(employmentTypeId);
//     }

//     // Experience filter (parse "5 Yrs" → 5)
//     // if (experienceFrom || experienceTo) {
//     //   matchStage.$expr = matchStage.$expr || {};
//     //   const extractYears = {
//     //     $toDouble: {
//     //       $arrayElemAt: [
//     //         { $split: [{ $ifNull: ["$experience", "0"] }, " "] },
//     //         0
//     //       ]
//     //     }
//     //   };

//     //   const rangeFilter = [];
//     //   if (experienceFrom) {
//     //     rangeFilter.push({ $gte: [extractYears, parseFloat(experienceFrom)] });
//     //   }
//     //   if (experienceTo) {
//     //     rangeFilter.push({ $lte: [extractYears, parseFloat(experienceTo)] });
//     //   }

//     //   if (rangeFilter.length === 1) {
//     //     matchStage.$expr = rangeFilter[0];
//     //   } else if (rangeFilter.length === 2) {
//     //     matchStage.$expr = { $and: rangeFilter };
//     //   }
//     // }


//     const jobPostList = await jobPostModel.aggregate([
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: "newdepartments",
//           localField: "departmentId",
//           foreignField: "_id",
//           as: "department",
//         },
//       },
//       {
//         $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
//       },

//       {
//         $lookup: {
//           from: "newdepartments",
//           let: { subDeptId: "$subDepartmentId" },
//           pipeline: [
//             { $unwind: "$subDepartments" },
//             {
//               $match: {
//                 $expr: {
//                   $eq: ["$subDepartments._id", "$$subDeptId"]
//                 }
//               }
//             },
//             {
//               $project: {
//                 _id: "$subDepartments._id",
//                 name: "$subDepartments.name"
//               }
//             }
//           ],
//           as: "subDepartment"
//         }
//       },
//       { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },


//       {
//         $lookup: {
//           from: "newdesignations",
//           localField: "designationId",
//           foreignField: "_id",
//           as: "desingnation",
//         },
//       },


//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "branchId",
//           foreignField: "_id",
//           as: "branch",
//         },
//       },
//       {
//         $lookup: {
//           from: "employmenttypes",
//           localField: "employmentTypeId",
//           foreignField: "_id",
//           as: "employmentType",
//         },
//       },
//       {
//         $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: "newworklocations",
//           localField: "Worklocation",
//           foreignField: "_id",
//           as: "Worklocation",
//         }
//       },

//       {
//         $lookup: {
//           from: "employeetypes",
//           localField: "employeeTypeId",
//           foreignField: "_id",
//           as: "employeeType",
//         },
//       },
//       { $unwind: { path: "$employeeType", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "employees",
//           localField: "createdByHrId",
//           foreignField: "_id",
//           as: "createdByHr",
//         },
//       },
//       {
//         $unwind: { path: "$createdByHr", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: "vacancyrequests",
//           localField: "_id",
//           foreignField: "jobPostId",
//           as: "jobId",
//         },
//       },
//       {
//         $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true },
//       },

//       // Lookup for vacancyRequest by vacancyRequestId
//       {
//         $lookup: {
//           from: "vacancyrequests",
//           localField: "vacancyRequestId",
//           foreignField: "_id",
//           as: "vacancyRequest",
//         },
//       },
//       {
//         $unwind: { path: "$vacancyRequest", preserveNullAndEmptyArrays: true },
//       },


//       {
//         $lookup: {
//           from: "qualifications",
//           localField: "qualificationId",
//           foreignField: "_id",
//           as: "qualification",
//         },
//       },
//       // Lookup jobDescription inside vacancyRequest
//       {
//         $lookup: {
//           from: "jobdescriptions",
//           localField: "vacancyRequest.jobDescriptionId",
//           foreignField: "_id",
//           as: "vacancyJobDescription",
//         },
//       },
//       {
//         $unwind: {
//           path: "$vacancyJobDescription",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       {
//         $lookup: {
//           from: "jobdescriptions",
//           localField: "jobDescriptionId",
//           foreignField: "_id",
//           as: "jobDescription",
//         },
//       },
//       {
//         $unwind: {
//           path: "$jobDescription",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "organizations",
//           localField: "organizationId",
//           foreignField: "_id",
//           as: "organization",
//         },
//       },
//       {
//         $unwind: { path: "$organization", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $addFields: {
//           daysOld: {
//             $round: [{
//               $divide: [
//                 { $subtract: [new Date(), "$createdAt"] },
//                 1000 * 60 * 60 * 24
//               ]
//             }]
//           }
//         }
//       },
//       { $sort: { createdAt: -1 } },
//       {
//         $project: {
//           _id: 1,
//           position: 1,
//           // eligibility: 1,
//           daysOld: 1,
//           numberOfApplicant: 1,
//           totalApplicants: 1,
//           experience: 1,
//           noOfPosition: 1,
//           Worklocation: 1,
//           InterviewType: 1,
//           package: 1,
//           budget: 1,
//           budgetType: 1,
//           status: 1,
//           AgeLimit: 1,
//           gender: 1,
//           jobDescription: { _id: 1, jobDescription: 1 },
//           createdByHr: { _id: 1, employeName: 1 },
//           department: { _id: 1, name: 1 },
//           subDepartment: { _id: 1, name: 1 },
//           desingnation: { _id: 1, name: 1 },
//           organization: { _id: 1, name: 1 },
//           branch: { _id: 1, name: 1, address: 1 },
//           Worklocation: { _id: 1, name: 1 },
//           employmentType: { _id: 1, title: 1 },
//           qualification: 1,
//           employeeType: { _id: 1, title: 1 },
//           jobId: { _id: 1, company: 1 },
//           vacancyRequest: {
//             _id: 1,
//             vacancyType: 1,
//             vacancyApproval: 1,
//           },
//           vacancyJobDescription: {
//             _id: 1,
//             position: 1,
//             jobDescription: 1,
//           },
//           AI_Percentage: 1,
//           MaxAI_Score: 1,
//           MinAI_Score: 1,
//           AI_Screening: 1,
//           createdAt: 1,
//         },
//       },
//     ]);

//     success(res, "All job post List", jobPostList);
//   } catch (error) {
//     console.error("Error:", error);
//     unknownError(res, error);
//   }
// };

 
export const getAllJobPost = async (req, res) => {
  try {

    const {
      jobTitle,
      departmentId,
      branchIds,
      employmentTypeId,
      experienceFrom,
      experienceTo,
      status,
      jobPostExpired,
      JobType,
       page = 1,
      limit = 50
    } = req.query;

    const matchStage = {};

    if (!jobPostExpired || jobPostExpired === "false") {
      matchStage.jobPostExpired = false
    } else if (jobPostExpired === "true") {
      matchStage.jobPostExpired = true
    }
    // Job Title - partial match, tolerant of spacing
    if (jobTitle) {
      matchStage.position = { $regex: jobTitle, $options: "i" };
    }

    if (status) {
      matchStage.status = status;
    }


    if(JobType){
      matchStage.JobType = { $regex: JobType, $options: "i" };
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


      const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);



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
          jobPostId:1,
          JobType: 1,
          position: 1,
          // eligibility: 1,
          experience: 1,
          numberOfApplicant: 1,
          expiredDate:1,
          totalApplicants: 1,
          noOfPosition: 1,
          Worklocation: 1,
          InterviewType: 1,
          package: 1,
          budget: 1,
          budgetType: 1,
          status: 1,
          AgeLimit: 1,
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
          qualification: 1,
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

        {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageLimit }],
          totalCount: [{ $count: "count" }]
        }
      }
    ]);

    const data = jobPostList[0]?.data || [];
    const totalCount = jobPostList[0]?.totalCount[0]?.count || 0;

     success(res, "All job post List", {
      data,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / pageLimit)
    });
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
};




export const getAllJobPostBypermission = async (req, res) => {
  try {

    const {
      jobTitle,
      departmentId,
      branchIds,
      employmentTypeId,
      experienceFrom,
      experienceTo,
      status,
      jobPostExpired,
      JobType,
      showAllDashbBoardData,
       page = 1,
      limit = 50
    } = req.query;

    const matchStage = {};

    const createdByHrId = req.employee.id
    const organizationId = req.employee.organizationId
    if (!jobPostExpired || jobPostExpired === "false") {
      matchStage.jobPostExpired = false
    } else if (jobPostExpired === "true") {
      matchStage.jobPostExpired = true
    }
    // Job Title - partial match, tolerant of spacing
    if (jobTitle) {
      matchStage.position = { $regex: jobTitle, $options: "i" };
    }


    if(JobType){
      matchStage.JobType = { $regex: JobType, $options: "i" };
    }

    if (departmentId) {
      matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

        if (organizationId) {
      matchStage.organizationId = new mongoose.Types.ObjectId(organizationId);
    }

    
    if (departmentId) {
      matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

    if (showAllDashbBoardData !== "all") {
  matchStage.createdByHrId = new ObjectId(createdByHrId);
}

console.log('matchStage',matchStage)
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


      const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);



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
          jobPostId:1,
          JobType: 1,
          position: 1,
          // eligibility: 1,
          experience: 1,
          numberOfApplicant: 1,
          expiredDate:1,
          totalApplicants: 1,
          noOfPosition: 1,
          Worklocation: 1,
          InterviewType: 1,
          package: 1,
          budget: 1,
          budgetType: 1,
          status: 1,
          AgeLimit: 1,
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
          qualification: 1,
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

        {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageLimit }],
          totalCount: [{ $count: "count" }]
        }
      }
    ]);

    const data = jobPostList[0]?.data || [];
    const totalCount = jobPostList[0]?.totalCount[0]?.count || 0;

     success(res, "All job post List", {
      data,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / pageLimit)
    });
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


export const getPostManDashBoard = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), period = 7 , showAllDashbBoardData } = req.query;

    const organizationId = req.employee.organizationId
    const createdByHrId = req.employee.id
    if(!organizationId){
      return badRequest(res , "invalid token organizationId not found")
    }

    
const commonMatchFilter = {
  organizationId: new ObjectId(organizationId),
};


if (showAllDashbBoardData !== "all") {
  commonMatchFilter.createdByHrId = new ObjectId(createdByHrId);
}

// console.log('commonMatchFilter',commonMatchFilter)
    const periodInDays = parseInt(period);
    if (isNaN(periodInDays) || periodInDays <= 0) {
      return badRequest(res, "Invalid period value. Must be a positive number.");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodInDays);

    // Previous period for comparison
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodInDays);

    const totalJobs = await jobPostModel.countDocuments({
       ...commonMatchFilter,
      // organizationId : new ObjectId(organizationId),
      // jobPostExpired: false
    });

// dont remove this line after total count check active jobs    
  commonMatchFilter.status = 'active'
    // 1. Total Active Jobs (Live Positions)
    const totalActiveJobs = await jobPostModel.countDocuments({
       ...commonMatchFilter,
      // organizationId : new ObjectId(organizationId),
      // jobPostExpired: false
    });


    // 2. Total Open Positions (Vacancies - sum of all noOfPosition)
    const totalOpenPositionsResult = await jobPostModel.aggregate([
      {
        $match: {
          // organizationId : new ObjectId(organizationId),
           ...commonMatchFilter,
          jobPostExpired: false
        }
      },
      {
        $group: {
          _id: null,
          totalVacancies: { $sum: "$noOfPosition" }
        }
      }
    ]);

    const totalOpenPositions = totalOpenPositionsResult[0]?.totalVacancies || 0;

    // 3. New Jobs in Current Period (7 Days)
    const newJobsCurrentPeriod = await jobPostModel.countDocuments({
      jobPostExpired: false,
       ...commonMatchFilter,
      // organizationId : new ObjectId(organizationId),
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // 4. New Jobs in Previous Period for percentage calculation
    const newJobsPreviousPeriod = await jobPostModel.countDocuments({
       ...commonMatchFilter,
      // organizationId : new ObjectId(organizationId),
      jobPostExpired: false,
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    });

    // 5. Expired Jobs in Current Period (Closed)
    const expiredJobsCurrentPeriod = await jobPostModel.countDocuments({
      jobPostExpired: true,
       ...commonMatchFilter,
      // organizationId : new ObjectId(organizationId),
      expiredDate: { $gte: startDate, $lte: endDate }
    });

    // 6. Average Time Open (Days) - Calculate average days from creation to current date for active jobs
    const avgTimeOpenResult = await jobPostModel.aggregate([
      {
        $match: {
           ...commonMatchFilter,
          // organizationId : new ObjectId(organizationId),
          // jobPostExpired: false
        }
      },
      {
        $addFields: {
          daysOpen: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert milliseconds to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDaysOpen: { $avg: "$daysOpen" }
        }
      }
    ]);
    const avgTimeOpen = Math.round(avgTimeOpenResult[0]?.avgDaysOpen || 0);

    // 7. Nearing Expiry (Jobs expiring in next 7 days)
    const nearingExpiryDate = new Date();
    nearingExpiryDate.setDate(nearingExpiryDate.getDate() + 7);

    const nearingExpiringJobs = await jobPostModel.countDocuments({
      // status: "active",
      // organizationId : new ObjectId(organizationId),
       ...commonMatchFilter,
      jobPostExpired: false,
      expiredDate: {
        $gte: endDate,
        $lte: nearingExpiryDate
      }
    });

    // 8. Net Activity (Growth/Decline)
    const netActivity = newJobsCurrentPeriod - expiredJobsCurrentPeriod;

    // 9. Active Departments Count
    const activeDepartmentsResult = await jobPostModel.aggregate([
      {
        $match: {
           ...commonMatchFilter,
          // status: "active",
          // organizationId : new ObjectId(organizationId),
          jobPostExpired: false
        }
      },
      {
        $group: {
          _id: "$departmentId"
        }
      },
      {
        $count: "activeDepartments"
      }
    ]);
    const activeDepartments = activeDepartmentsResult[0]?.activeDepartments || 0;

    // 10. Department Breakdown with Positions
    const departmentBreakdown = await jobPostModel.aggregate([
      {
        $match: {
           ...commonMatchFilter,
          // status: "active",
          // organizationId : new ObjectId(organizationId),
          // jobPostExpired: false
        }
      },
      {
        $group: {
          _id: "$departmentId",
          jobCount: { $sum: 1 },
          totalPositions: { $sum: "$noOfPosition" }
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "_id",
          foreignField: "_id",
          as: "department"
        }
      },
      {
        $project: {
          departmentId: "$_id",
          departmentName: { $arrayElemAt: ["$department.name", 0] },
          jobCount: 1,
          totalPositions: 1
        }
      },
      {
        $sort: { totalPositions: -1 }
      }
    ]);
    // 11. Hot Vacancies (Top 5 with Highest Number of Applicants)
    const hotVacancies = await jobPostModel.aggregate([
      {
        $match: {
           ...commonMatchFilter,
          // status: "active",
          // organizationId : new ObjectId(organizationId),
          jobPostExpired: false
        }
      },
      {
        $addFields: {
          daysOld: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      {
        $project: {
          position: 1,
          departmentName: { $arrayElemAt: ["$department.name", 0] },
          designationName: { $arrayElemAt: ["$designation.name", 0] },
          numberOfApplicant: 1,
          totalApplicants: 1,
          daysOld: { $round: "$daysOld" },
          noOfPosition: 1
        }
      },
      {
        $sort: { totalApplicants: -1 } // Sort by highest applicants first
      },
      {
        $limit: 5 // Top 5 only
      }
    ]);

    // 12. Cold Vacancies (Top 5 with Lowest Number of Applicants - Below 5)
    const coldVacancies = await jobPostModel.aggregate([
      {
        $match: {
           ...commonMatchFilter,
          // status: "active",
          // organizationId : new ObjectId(organizationId),
          jobPostExpired: false
        }
      },
      {
        $addFields: {
          daysOld: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      {
        $project: {
          position: 1,
          departmentName: { $arrayElemAt: ["$department.name", 0] },
          designationName: { $arrayElemAt: ["$designation.name", 0] },
          numberOfApplicant: 1,
          totalApplicants: 1,
          daysOld: { $round: "$daysOld" },
          noOfPosition: 1
        }
      },
      {
        $match: {
          totalApplicants: { $lt: 5 } // Only jobs with less than 5 applicants
        }
      },
      {
        $sort: { totalApplicants: 1, daysOld: -1 } // Sort by lowest applicants first, then by oldest
      },
      {
        $limit: 5 // Top 5 only
      }
    ]);

    // 13. Calculate percentage changes
    const newJobsPercentage = newJobsPreviousPeriod > 0
      ? Math.round(((newJobsCurrentPeriod - newJobsPreviousPeriod) / newJobsPreviousPeriod) * 100)
      : newJobsCurrentPeriod > 0 ? 100 : 0;

    // 14. Employment Type Distribution
    const employmentTypeDistribution = await jobPostModel.aggregate([
      {
        $match: {
           ...commonMatchFilter,
          // status: "active",
          // organizationId : new ObjectId(organizationId),
          jobPostExpired: false
        }
      },
      {
        $group: {
          _id: "$employmentTypeId",
          jobCount: { $sum: 1 },
          totalPositions: { $sum: "$noOfPosition" }
        }
      },
      {
        $lookup: {
          from: "employmenttypes",
          localField: "_id",
          foreignField: "_id",
          as: "employmentType"
        }
      },
      {
        $project: {
          employmentTypeName: { $arrayElemAt: ["$employmentType.name", 0] },
          jobCount: 1,
          totalPositions: 1
        }
      }
    ]);

    // Response Structure matching your dashboard
    const dashboardData = {
      totalActiveJobs: {
        count: totalActiveJobs,
        label: "total Active Jobs"
      },
      totalJobs: {
        count: totalJobs,
        label: "total Jobs"
      },
      totalOpenPositions: {
        count: totalOpenPositions,
        label: "Vacancies"
      },
      newJobs: {
        count: newJobsCurrentPeriod,
        label: `New (${periodInDays} Days)`,
        percentage: newJobsPercentage,
        trend: newJobsPercentage >= 0 ? "up" : "down"
      },
      expiredJobs: {
        count: expiredJobsCurrentPeriod,
        label: `Expired (${periodInDays} Days)`,
        status: "Closed"
      },
      avgTimeOpen: {
        count: avgTimeOpen,
        label: "Avg Time Open",
        unit: "Days"
      },
      nearingExpiry: {
        count: nearingExpiringJobs,
        label: "Nearing Expiry",
        status: "Urgent"
      },
      netActivity: {
        count: netActivity,
        label: "Net Activity",
        trend: netActivity >= 0 ? "Growth" : "Decline"
      },
      activeDepartments: {
        count: activeDepartments,
        label: "Departments",
        status: "Active",
      },

      // Department Breakdown
      departmentBreakdown: departmentBreakdown.map(dept => ({
        departmentName: dept.departmentName || '',
        positions: dept.totalPositions,
        jobCount: dept.jobCount
      })),

      // Hot & Cold Vacancies
      hotVacancies: hotVacancies.map(job => ({
        position: job.position,
        department: job.departmentName || '',
        designation: job.designationName || '',
        applicants: job.totalApplicants,
        daysOld: job.daysOld,
        openPositions: job.noOfPosition
      })),

      coldVacancies: coldVacancies.map(job => ({
        position: job.position,
        department: job.departmentName || '',
        designation: job.designationName || '',
        applicants: job.totalApplicants,
        daysOld: job.daysOld,
        openPositions: job.noOfPosition
      })),

      // Additional Analytics
      // employmentTypeDistribution/,

      // Period Information
      // periodInfo: {
      //   currentPeriod: {
      //     startDate: startDate.toISOString().split('T')[0],
      //     endDate: endDate.toISOString().split('T')[0],
      //     days: periodInDays
      //   },
      //   previousPeriod: {
      //     startDate: previousStartDate.toISOString().split('T')[0],
      //     endDate: previousEndDate.toISOString().split('T')[0],
      //     days: periodInDays
      //   }
      // }
    };

    return success(res, "Job Post Dashboard", {
      data: dashboardData,
      generatedAt: new Date().toISOString(),
      year: parseInt(year),
      periodDays: periodInDays
    }
    );

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return unknownError(res, error)
  }
}

//----------------------------------------------------------////---------------------------------------------------------------------------


export const getDashboardAnalytics = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), period = 7 ,showAllDashbBoardData } = req.query;
    const createdByHrId = req.employee.id

    const organizationId = req.employee.organizationId
    if(!organizationId){
      return badRequest(res , "invalid token organizationId not found")
    }

    const commonMatchFilter = {
  organizationId: new ObjectId(organizationId),
        status: "active",
};

if (showAllDashbBoardData !== "all") {
  commonMatchFilter.createdByHrId = new ObjectId(createdByHrId);
}

    const periodInDays = parseInt(period);
    if (isNaN(periodInDays) || periodInDays <= 0) {
      return badRequest(res, "Invalid period value. Must be a positive number.");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodInDays);

    // Previous period for comparison
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodInDays);

    // Run all analytics queries in parallel for better performance
    const [
      totalApplicants,
      activeDepartmentsCount,
      applicationsByMonth,
      applicationsByDepartment,
      topPositions,
    ] = await Promise.all([

      // 1. Total Applicants (existing)
      jobPostModel.aggregate([
        {
          $match: {
            ...commonMatchFilter,
            // status: "active",
            // organizationId : new ObjectId(organizationId),

            // jobPostExpired: false
          }
        },
        {
          $group: {
            _id: null,
            numberOfApplicant: { $sum: "$numberOfApplicant" },
            totalApplicants: { $sum: "$totalApplicants" }
          }
        }
      ]),

      // 2. Active Departments Count (existing)
      jobPostModel.aggregate([
        {
          $match: {
                        ...commonMatchFilter,
            // status: "active",
            // organizationId : new ObjectId(organizationId),
            jobPostExpired: false
          }
        },
        {
          $group: {
            _id: "$departmentId"
          }
        },
        {
          $count: "activeDepartments"
        }
      ]),

      // 3. Applications by Month (for the line chart)
      jobPostModel.aggregate([
        {
          $match: {
                        ...commonMatchFilter,
            // status: "active",
            // organizationId : new ObjectId(organizationId),
            jobPostExpired: false,
            createdAt: {
              $gte: new Date(year, 0, 1),
              $lte: new Date(year, 11, 31)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            totalApplicants: { $sum: "$totalApplicants" },
            numberOfApplicant: { $sum: "$numberOfApplicant" },
            totalJobs: { $sum: 1 }
          }
        },
        {
          $addFields: {
            monthName: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id.month", 5] }, then: "May" },
                  { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id.month", 12] }, then: "Dec" }
                ],
                default: "Unknown"
              }
            }
          }
        },
        {
          $sort: { "_id.month": 1 }
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            monthName: 1,
            totalApplicants: 1,
            totalJobs: 1
          }
        }
      ]),

      // // 4. Applications by Department (for the bar chart)
      jobPostModel.aggregate([
        {
          $match: {
                        ...commonMatchFilter,
            // status: "active",
            // organizationId : new ObjectId(organizationId),
            jobPostExpired: false,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: "newdepartments",
            localField: "departmentId",
            foreignField: "_id",
            as: "department"
          }
        },
        {
          $unwind: "$department"
        },
        {
          $group: {
            _id: "$departmentId",
            departmentName: { $first: "$department.name" },
            totalApplicants: { $sum: "$totalApplicants" },
            numberOfApplicant: { $sum: "$numberOfApplicant" },
            totalJobs: { $sum: 1 },
            totalPositions: { $sum: "$noOfPosition" }
          }
        },
        {
          $sort: { totalApplicants: -1 }
        },
        {
          $project: {
            _id: 0,
            departmentName: 1,
            totalApplicants: 1,
            numberOfApplicant: 1,
            totalJobs: 1,
            totalPositions: 1,
            avgApplicantsPerJob: {
              $round: [{ $divide: ["$totalApplicants", "$totalJobs"] }, 1]
            }
          }
        }
      ]),


      // 5. Top Positions (for the bar chart)
      jobPostModel.aggregate([
        {
          $match: {
                        ...commonMatchFilter,
            // status: "active",
            jobPostExpired: false,
            // organizationId : new ObjectId(organizationId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $addFields: {
            daysOld: {
              $round: [{
                $divide: [
                  { $subtract: [new Date(), "$createdAt"] },
                  1000 * 60 * 60 * 24
                ]
              }]
            }
          }
        },
        {
          $lookup: {
            from: "newdepartments",
            localField: "departmentId",
            foreignField: "_id",
            as: "department"
          }
        },
        {
          $lookup: {
            from: "newdesignations",
            localField: "designationId",
            foreignField: "_id",
            as: "designation"
          }
        },
        {
          $project: {
            position: 1,
            departmentName: { $arrayElemAt: ["$department.name", 0] },
            designationName: { $arrayElemAt: ["$designation.name", 0] },
            numberOfApplicant: 1,
            totalApplicants: 1,
            noOfPosition: 1,
            daysOld: 1,
            applicantsPerPosition: {
              $round: [{
                $cond: [
                  { $gt: ["$noOfPosition", 0] },
                  { $divide: ["$numberOfApplicant", "$noOfPosition"] },
                  0
                ]
              }, 1]
            }
          }
        },
        {
          $sort: { numberOfApplicant: -1 }
        },
        {
          $limit: 6 // Top 6 positions for the chart
        }
      ]),
    ]);



    // const [jobApplys, shortlistedApplyStats] = await Promise.all([
    //   jobApply.find({
    //     // organizationId : new ObjectId(organizationId),
    //     createdAt: { $gte: startDate, $lte: endDate }
    //   }).select("_id"),

    //   jobApply.aggregate([
    //     {
    //       $match: {
    //         createdAt: { $gte: startDate, $lte: endDate },
    //         // organizationId : new ObjectId(organizationId),
    //         resumeShortlisted: "shortlisted"
    //       }
    //     },
    //   ])
    // ]);

    const [jobApplys, shortlistedApplyStats] = await Promise.all([
  // All job applies matching the createdByHrId in jobPost
  jobApply.aggregate([
    {
      $match: {
        // organizationId: new ObjectId(organizationId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: "jobposts", // collection name (ensure it's correct)
        localField: "jobPostId",
        foreignField: "_id",
        as: "jobPost"
      }
    },
    { $unwind: "$jobPost" },
    {
      $match: showAllDashbBoardData === "all"
        ? {}
        : { "jobPost.createdByHrId": new ObjectId(createdByHrId) }
    },
    {
      $project: {
        _id: 1
      }
    }
  ]),

  // Only shortlisted applications created by specific employee
  jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        // organizationId: new ObjectId(organizationId),
        resumeShortlisted: "shortlisted"
      }
    },
    {
      $lookup: {
        from: "jobposts",
        localField: "jobPostId",
        foreignField: "_id",
        as: "jobPost"
      }
    },
    { $unwind: "$jobPost" },
    {
      $match: showAllDashbBoardData === "all"
        ? {}
        : { "jobPost.createdByHrId": new ObjectId(createdByHrId) }
    }
  ])
]);

    // Process results
    const numberOfApplicant = totalApplicants[0]?.numberOfApplicant || 0;
    const totalApplicantsApply = totalApplicants[0]?.totalApplicants || 0;
    const activeDepartments = activeDepartmentsCount[0]?.activeDepartments || 0;

    // Fill missing months with 0 values for Applications by Month
    const allMonths = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = applicationsByMonth.find(item => item.month === month);
      allMonths.push({
        month,
        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
        totalApplicants: monthData?.totalApplicants || 0,
        numberOfApplicant: monthData?.numberOfApplicant || 0,
        totalJobs: monthData?.totalJobs || 0
      });
    }

    // Response Structure matching your dashboard
    const dashboardData = {
      // Summary Stats (existing)
      totalApplicants: {
        count: totalApplicantsApply,
        total: totalApplicantsApply,
        label: "total Applicants"
      },
      activeDepartment: {
        count: activeDepartments,
        label: "active Departments"
      },

      // Chart Data for Applications by Month
      applicationsByMonth: {
        // labels: allMonths.map(item => item.monthName),
        // data: allMonths.map(item => item.totalApplicants),
        chartData: allMonths
      },

      // Chart Data for Applications by Department
      applicationsByDepartment: {
        // labels: applicationsByDepartment.map(dept => dept.departmentName),
        // data: applicationsByDepartment.map(dept => dept.totalApplicants),
        chartData: applicationsByDepartment,
        // colors: ['#2196F3', '#9C27B0', '#4CAF50', '#FF9800', '#F44336', '#00BCD4']
      },

      // Chart Data for Top Positions
      topPositions: {
        // labels: topPositions.map(pos => pos.position),
        // data: topPositions.map(pos => pos.numberOfApplicant),
        chartData: topPositions,
        // colors: ['#2196F3', '#9C27B0', '#4CAF50', '#FF9800', '#F44336', '#00BCD4']
      },

      workflowStatistics: {
        chartData: [
          {
            stage: "Applications",
            count: jobApplys.length,
            color: "#2196F3"
          },
          {
            stage: "Shortlisted",
            count: shortlistedApplyStats.length,
            color: "#4CAF50"
          }
        ]
      },

    };

    return success(res, "Dashboard Analytics", {
      data: dashboardData,
      generatedAt: new Date().toISOString(),
      year: parseInt(year),
      periodDays: periodInDays
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return unknownError(res, error);
  }
};







export const assignJobPostIdsToOldPosts = async (req, res) => {
  try {
    const  organizationId  = req.employee.organizationId;

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    let setting = await jobPostingsetting.findOne({ organizationId });

    if (!setting) {
      // If setting not found, create a default one
      setting = new jobPostingsetting({
        organizationId,
        PostIdCounter: 100,
        PostIdPrefix: "JOB",
        PostIdSuffix: "FINTECH",
        PostIdPadLength: 3,
      });
      await setting.save();
    }

    // Find all job posts without jobPostId
    const jobPosts = await jobPostModel.find({
      organizationId,
      $or: [{ jobPostId: { $exists: false } }, { jobPostId: null }, { jobPostId: "" }]
    });

    const updates = [];

    for (const post of jobPosts) {
      setting.PostIdCounter += 1;

      const prefix = setting.PostIdPrefix || "JOB";
      const suffix = setting.PostIdSuffix || "FINTECH";
      const counter = setting.PostIdCounter.toString().padStart(setting.PostIdPadLength || 3, "0");

      post.jobPostId = `${prefix}${counter}${suffix}`;
      updates.push(post.save());
    }

    await Promise.all(updates);
    await setting.save();

    return res.status(200).json({
      message: `${jobPosts.length} jobPostId(s) assigned successfully`,
      updatedCount: jobPosts.length,
    });

  } catch (error) {
    console.error("Error assigning jobPostId:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};