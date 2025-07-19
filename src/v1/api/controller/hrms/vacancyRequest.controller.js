const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  parseJwt,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const cron = require("node-cron");
const employeModel = require("../../model/adminMaster/employe.model");
const employmentTypeModel = require("../../model/adminMaster/employmentType.model");
const jobDescriptionModel = require("../../model/hrms/jobDescription.model");
const branchModel = require("../../model/adminMaster/newBranch.model");
const departmentModel = require("../../model/adminMaster/newDepartment.model");
const vacancyRequestModel = require("../../model/hrms/vacancyRequest.model");
const jobApplyFormModel = require("../../model/hrms/jobApplyForm.model");
const vacancyApprovalModel=require("../../model/hrms/vacancyApproval.model");
const {
  vacancyRequestGoogleSheet,
  jobFormGoogleSheet,
} = require("../hrms/hrmsGoogleSheet.controller");
//----------------------------------------------------------------------------------


const moment = require("moment"); // For date manipulation and comparison
const { sendEmail, hrmsSendEmail } = require("../functions.Controller");


cron.schedule("00 09 * * *", async () => { // Adjusted to 9:00 PM
  try {
    const notTakenAction = await vacancyRequestModel.find({
      status: "active",
      vacancyType: "request",
      vacancyApproval: "active",
    }).populate({
      path: "jobDescriptionId",
      select: "_id position status",
    }).populate({
      path: "departmentId",
      select: "_id name status",
    });
// console.log(notTakenAction)
    const now = moment();
    
    notTakenAction.forEach(async (vacancy) => {
      const createdAt = moment(vacancy.createdAt);
      const diffInHours = now.diff(createdAt, "hours");

      if (diffInHours > 24) {
    
        const createdBy = await employeModel.findById(vacancy.createdByManagerId); // Assuming `createdByManager` has `email`
        const managerEmail = await employeModel.findById(createdBy.reportingManagerId); // Assuming `createdByManager` has `email`
        
        if (managerEmail) {
          const toEmails = managerEmail.workEmail;
          const ccEmails = process.env.HR3_EMAIL;
          
          const msg = `<div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
    
    <p style="font-size: 16px; color: #000;">Dear ${managerEmail.employeName},</p>
    <p style="font-size: 16px; color: #000;">The following vacancy request requires your approval:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Position</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${vacancy.jobDescriptionId.position}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Department</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${vacancy.departmentId.name}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Requested By</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${createdBy.employeName}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Requested Date</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(vacancy.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
    </table>
    
    <p style="font-size: 16px; color: #000; margin-top: 20px;">
      Please <a href="https://finexe.fincooper.in/hrms/talantAquisition/vacancyTable/approveVacancy/" style="color: #000; text-decoration: underline;">review and approve</a> this request at your earliest convenience.
    </p>
    
    <p style="font-size: 16px; color: #000;">Thank you.</p>
    <p style="font-size: 16px; color: #000;">Regards,<br>Your HR Team</p>
    
    <p style="font-size: 14px; color: #555; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;">
      This is a system-generated message. Please do not reply to this email.
    </p>
  </div>
</div>
`;

              
  
        hrmsSendEmail(
          toEmails,
          ccEmails,
          "Vacancy Approval Request",
          msg,
          ""
        );
          // console.log(`Email sent to manager: ${managerEmail.employeName} for vacancy ID: ${vacancy._id}`);
        } 
        // else {
        //   // console.warn(`No email found for manager of vacancy ID: ${vacancy._id}`);
        // }
      }
    });
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// ------------------HRMS  Add vacancyRequest ---------------------------------------
async function vacancyRequestAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (req.body.vacancyType === "recommended" && !req.body.resume) {
      return badRequest(res, "Resume is required.");
    }

    let msg = "Vacancy Request added successfully";
    // Add createdByManagerId to req.body  approved
    req.body.createdByManagerId = req.Id;
    let jobApplyForm;
    const vacancyRequest = await vacancyRequestModel.create(req.body);

    if (vacancyRequest.vacancyType === "recommended" && vacancyRequest) {
      req.body.vacancyApproval = "approved";
      req.body.vacancyRequestId = vacancyRequest._id;
      req.body.branchId = req.body.selectedBranchId;
      if (req.body.jobFormType === "recommended") {
        req.body.status = "hold";
        req.body.resumeShortlisted = "hold";
        req.body.recommendedByID = req.Id;
      }
      jobApplyForm = await jobApplyFormModel.create(req.body);
      await jobFormGoogleSheet(jobApplyForm);
      msg = "Vacancy Request and candidate recommendation added successfully";
    }
    // console.log(jobApplyForm);
    //google sheet data
    const branchIds = vacancyRequest.branchId; // This is an array of ObjectIds
    const branches = await branchModel.find({
      _id: { $in: branchIds },
    });
    const branchNames = branches.map((branch) => branch.name);
    const employementTypeById = await employmentTypeModel.findById(
      vacancyRequest.employmentTypeId
    );
    const employementTypeName = employementTypeById?.title
      ? employementTypeById.title
      : "Not Available";

    const departmentById = await departmentModel.findById(
      vacancyRequest.departmentId
    );
    const departmentName = departmentById?.name
      ? departmentById.name
      : "Not Available";

    const jobDescriptionId = await jobDescriptionModel.findById(
      vacancyRequest.jobDescriptionId
    );
    const jobDescriptionName = jobDescriptionId?.jobDescription
      ? jobDescriptionId.jobDescription
      : "Not Available";
    const position = jobDescriptionId?.position
      ? jobDescriptionId.position
      : "Not Available";

    const createdByManagerId = await employeModel.findById(
      vacancyRequest.createdByManagerId
    );
    const createdByManager = createdByManagerId?.employeName
      ? createdByManagerId.employeName
      : "Not Available";

    const vacancyApprovalById = await employeModel.findById(
      vacancyRequest.vacancyApprovalById
    );
    const vacancyApprovalBy = vacancyApprovalById?.employeName
      ? vacancyApprovalById.employeName
      : "Not Available";
    await vacancyRequestGoogleSheet(
      position,
      vacancyRequest,
      branchNames.join(", "),
      employementTypeName,
      departmentName,
      jobDescriptionName,
      createdByManager,
      vacancyApprovalBy
    );
    success(res, msg);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS Update vacancyRequest ---------------------------------------
// async function vacancyRequestUpdate(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const { vacancyRequestId, ...updateData } = req.body;
//     const vacancyRequest = await vacancyRequestModel.findById(vacancyRequestId);

//     if (!vacancyRequest) {
//       return badRequest(res, "Vacancy Request not found");
//     }

//     if (vacancyRequest.jobPostId !== null) {
//       return badRequest(res, "Cannot Update As Job Post Is Created");
//     }

//     updateData.createdByManagerId = req.Id;

//     const updatedVacancyRequest = await vacancyRequestModel.findByIdAndUpdate(
//       vacancyRequestId,
//       updateData,
//       { new: true }
//     );
//     const branchIds = updatedVacancyRequest.branchId; // This is an array of ObjectIds
//     const branches = await branchModel.find({
//       _id: { $in: branchIds },
//     });
//     const branchNames = branches.map((branch) => branch.name);
//     const employementTypeById = await employmentTypeModel.findById(
//       updatedVacancyRequest.employmentTypeId
//     );
//     const employementTypeName = employementTypeById?.title
//       ? employementTypeById.title
//       : "Not Available";

//     const departmentById = await departmentModel.findById(
//       updatedVacancyRequest.departmentId
//     );
//     const departmentName = departmentById?.name
//       ? departmentById.name
//       : "Not Available";

//     const jobDescriptionId = await jobDescriptionModel.findById(
//       updatedVacancyRequest.jobDescriptionId
//     );
//     const jobDescriptionName = jobDescriptionId?.jobDescription
//       ? jobDescriptionId.jobDescription
//       : "Not Available";
//     const position = jobDescriptionId?.position
//       ? jobDescriptionId.position
//       : "Not Available";

//     const createdByManagerId = await employeModel.findById(
//       updatedVacancyRequest.createdByManagerId
//     );
//     const createdByManager = createdByManagerId?.employeName
//       ? createdByManagerId.employeName
//       : "Not Available";

//     const vacancyApprovalById = await employeModel.findById(
//       updatedVacancyRequest.vacancyApprovalById
//     );
//     const vacancyApprovalBy = vacancyApprovalById?.employeName
//       ? vacancyApprovalById.employeName
//       : "Not Available";
//     await vacancyRequestGoogleSheet(
//       position,
//       vacancyRequest,
//       branchNames.join(", "),
//       employementTypeName,
//       departmentName,
//       jobDescriptionName,
//       createdByManager,
//       vacancyApprovalBy
//     );
//     success(res, "Vacancy Request Updated Successfully", updatedVacancyRequest);
//   } catch (error) {
//     unknownError(res, error);
//   }
// }

// ------------------HRMS  get vacancyRequest ---------------------------------------


async function vacancyRequestUpdate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { vacancyRequestId, positions , ...updateData } = req.body;
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
    const branchIds = updatedVacancyRequest.branchId; // This is an array of ObjectIds
    const branches = await branchModel.find({
      _id: { $in: branchIds },
    });
    const branchNames = branches.map((branch) => branch.name);
    const employementTypeById = await employmentTypeModel.findById(
      updatedVacancyRequest.employmentTypeId
    );
    const employementTypeName = employementTypeById?.title
      ? employementTypeById.title
      : "Not Available";

    const departmentById = await departmentModel.findById(
      updatedVacancyRequest.departmentId
    );
    const departmentName = departmentById?.name
      ? departmentById.name
      : "Not Available";

    const jobDescriptionId = await jobDescriptionModel.findById(
      updatedVacancyRequest.jobDescriptionId
    );
    const jobDescriptionName = jobDescriptionId?.jobDescription
      ? jobDescriptionId.jobDescription
      : "Not Available";
    const position = jobDescriptionId?.position
      ? jobDescriptionId.position
      : "Not Available";

    const createdByManagerId = await employeModel.findById(
      updatedVacancyRequest.createdByManagerId
    );
    const createdByManager = createdByManagerId?.employeName
      ? createdByManagerId.employeName
      : "Not Available";

    const vacancyApprovalById = await employeModel.findById(
      updatedVacancyRequest.vacancyApprovalById
    );
    const vacancyApprovalBy = vacancyApprovalById?.employeName
      ? vacancyApprovalById.employeName
      : "Not Available";

      if (positions) {
        await jobApplyFormModel.findOneAndUpdate(
          { vacancyRequestId: vacancyRequestId },
          { $set: { position: positions } } // Assuming positions is a string or single value
        );
      }


    await vacancyRequestGoogleSheet(
      position,
      vacancyRequest,
      branchNames.join(", "),
      employementTypeName,
      departmentName,
      jobDescriptionName,
      createdByManager,
      vacancyApprovalBy
    );
    success(res, "Vacancy Request Updated Successfully", updatedVacancyRequest);
  } catch (error) {
    unknownError(res, error);
  }
}


async function getAllVacancyRequest(req, res) {
  try {
    let vacancyList = await vacancyRequestModel.aggregate([
      {
        $lookup: {
          from: "jobposts", // Ensure the collection name is correct and pluralized if necessary
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPost",
        },
      },
      {
        $unwind: {
          path: "$jobPost",
          preserveNullAndEmptyArrays: true, // Keeps null if no match is found
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
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true,
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
        $unwind: {
          path: "$employmentType",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "createdByManagerId",
          foreignField: "_id",
          as: "createdByManager",
        },
      },
      {
        $unwind: {
          path: "$createdByManager",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId", // Assumes branchId is an array in vacancyRequestModel
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $lookup: {
          from: "jobdescriptions", // Ensure the collection name is correct and pluralized if necessary
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescription",
        },
      },
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true, // Keeps null if no match is found
        },
      },
      {
        $match: {
          vacancyType: "request", // Filters for documents where vacancyType is "request"
        },
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },
      
      {
        $project: {
          _id: 1,
          position: 1,
          eligibility: 1,
          experience: 1,
          priority: 1,
          package: 1,
          packageType:1,
          noOfPosition: 1,
          status: 1,
          jobPost: 1,
          vacancyApproval: 1,
          jobPostCreated: 1,
          vacancyType: 1,
          recommendMail: 1,
          department: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          branch: { _id: 1, name: 1 }, // Shows branch info as an array
          createdByManager: { _id: 1, employeName: 1, employeUniqueId: 1 },
          jobDescription: { _id: 1, jobDescription: 1, position: 1 },
        },
      },
    ]);
// console.log(vacancyList.length);
    success(res, "All vacancy request List", vacancyList);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}
//-------------------------manager get vacancy request----------------------------------------------------
async function getVacancyRequestForManager(req, res) {
  try {
    console.log(req.Id);
    let vacancyList = await vacancyRequestModel.aggregate([
      {
        $match: {
          createdByManagerId: new ObjectId(req.Id), // Filter by manager's ID from the request
        },
      },
      {
        $lookup: {
          from: "jobposts", // Ensure the collection name is correct and pluralized if necessary
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPost",
        },
      },
      {
        $unwind: {
          path: "$jobPost",
          preserveNullAndEmptyArrays: true, // Keeps null if no match is found
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
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true,
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
        $unwind: {
          path: "$employmentType",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "createdByManagerId",
          foreignField: "_id",
          as: "createdByManager",
        },
      },
      {
        $unwind: {
          path: "$createdByManager",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId", // Assumes branchId is an array in vacancyRequestModel
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $lookup: {
          from: "jobdescriptions", // Ensure the collection name is correct and pluralized if necessary
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescription",
        },
      },
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true, // Keeps null if no match is found
        },
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },
      {
        $project: {
          _id: 1,
          position: 1,
          eligibility: 1,
          experience: 1,
          priority: 1,
          package: 1,
          packageType:1,
          noOfPosition: 1,
          status: 1,
          jobPost: 1,
          vacancyApproval: 1,
          vacancyType: 1,
          recommendMail: 1,
          department: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          branch: { _id: 1, name: 1 }, // Shows branch info as an array
          createdByManager: { _id: 1, employeName: 1, employeUniqueId: 1 },
          jobDescription: { _id: 1, jobDescription: 1, position: 1 },
          company: 1, // Assuming company is an array in vacancyRequestModel
        },
      },
    ]);

    console.log(vacancyList.length);
    success(res, "All vacancy request List", vacancyList);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}

// ------------------HRMS  get vacancyRequestDetail ---------------------------------------

async function vacancyRequestDetail(req, res) {
  try {
    const { vecancyId } = req.query;
    let vacancyDetail = await vacancyRequestModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(vecancyId) },
      },
      {
        $lookup: {
          from: "newdepartments", // Collection name
          localField: "departmentId", // Field in jobPostModel
          foreignField: "_id", // Field in departments collection
          as: "department", // Alias for the joined data
        },
      },
      {
        $unwind: "$department", // Unwind the department array to object
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
        $unwind: "$employmentType", // Unwind employmentType to get an object
      },

      {
        $project: {
          _id: 1,
          position: 1,
          eligibility: 1,
          experience: 1,
          priority: 1,
          package: 1,
          packageType:1,
          noOfPosition: 1,
          jobDescription: 1,
          status: 1,
          department: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
        },
      },
    ]);

    success(res, "vacancy request Details", vacancyDetail);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}
// async function getAllVacancyRequest(req, res) {
//   try {
//     let vacancyRequestDetails = await vacancyRequestModel.find({
//       status: "active",
//     });
//     let count = vacancyRequestDetails.length;

//     success(res, "All vacancy request details", {
//       count: count, // Add count
//       data: vacancyRequestDetails,
//     });
//   } catch (error) {
//     // console.log("error", error);
//     unknownError(res, error);
//   }
// }

// ------------------HRMS  get vacancyRequest by department vise---------------------------------------

async function getVacancyRequestByDepartment(req, res) {
  try {
    const { departmentId } = req.query; // Get departmentId from query parameters

    // Check if departmentId is provided
    if (!departmentId) {
      return badRequest(res, "departmentId query parameter is required.");
    }

    // Find all active vacancy requests that match the departmentId
    let vacancyRequestDetails = await vacancyRequestModel.find({
      status: "active",
      departmentId: departmentId, // Filter by departmentId
    });

    // If no vacancy requests found for the department
    if (!vacancyRequestDetails.length) {
      return badRequest(
        res,
        `No vacancy requests found for departmentId: ${departmentId}`
      );
    }

    // Respond with the vacancy request details
    success(
      res,
      "Vacancy requests fetched successfully.",
      vacancyRequestDetails
    );
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}
//------------------------------------------------------------------------------
async function getVacancyRequestById(req, res) {
  try {
    const vacancyRequestId = req.query.vacancyRequestId;
    // { path: "jobApplyFormId", select: "name position resume " }
    let vacancyRequest = await vacancyRequestModel
      .findById(vacancyRequestId)
      .populate({ path: "branchId", select: "_id name status" })
      .populate({ path: "departmentId", select: "_id name status" })
      .populate({
        path: "createdByManagerId",
        select: "_id employeName status",
      })
      .populate({
        path: "jobDescriptionId",
        select: "_id  jobDescription position",
      })
      .populate({ path: "employmentTypeId", select: "_id title status" });

    success(res, "Vacancy Request data", vacancyRequest);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//----------------------------approve vacancy by reporting manager-------------------------------------
async function changeVacancyApproval(req, res) {
  try {
    const vacancyRequestId = req.body.vacancyRequestId;
    const vacancyApproval = req.body.vacancyApproval;

    if (vacancyApproval !== "approved" && vacancyApproval !== "notApproved") {
      return badRequest(
        res,
        `vacancyApproval must be either "approved" or "notApproved".`
      );
    }
    const updatedVacancy = await vacancyRequestModel.findByIdAndUpdate(
      { _id: vacancyRequestId },
      { vacancyApproval: vacancyApproval, vacancyApprovalById: req.Id },
      { new: true }
    );

    success(res, "Vacancy Request Approval", updatedVacancy);
  } catch (error) {
    unknownError(res, error);
  }
}
//------------------------------------------------------------------------------
async function getVacancyApprovalData(req, res) {
  try {
    const reportingManager = req.Id;
    console.log(reportingManager);

    const vacancyRequest = await vacancyRequestModel.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "createdByManagerId",
          foreignField: "_id",
          as: "createdByManagerDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByManagerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "createdByManagerDetails.reportingManagerId":
            new mongoose.Types.ObjectId(reportingManager),
          vacancyApproval: "active",
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentDetails",
        },
      },
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescriptionDetails",
        },
      },
      {
        $lookup: {
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentTypeDetails",
        },
      },
      {
        $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: {
          path: "$departmentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$jobDescriptionDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$employmentTypeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Group to remove duplicates based on unique _id field
      {
        $group: {
          _id: "$_id",
          branchId: { $first: "$branchId" },
          departmentId: { $first: "$departmentId" },
          position: { $first: "$position" },
          eligibility: { $first: "$eligibility" },
          experience: { $first: "$experience" },
          priority: { $first: "$priority" },
          package: { $first: "$package" },
          packageType:{$first: "$packageType"},
          createdByManagerId: { $first: "$createdByManagerId" },
          jobDescriptionId: { $first: "$jobDescriptionId" },
          employmentTypeId: { $first: "$employmentTypeId" },
          createdByManagerDetails: {
            $first: {
              _id: "$createdByManagerDetails._id", // Include only employeName
              employeName: "$createdByManagerDetails.employeName", // Include only employeName
            },
          },
          branchDetails: { $first: { name: "$branchDetails.name" } },
          departmentDetails: { $first: { name: "$departmentDetails.name" } },
          jobDescriptionDetails: { $first: "$jobDescriptionDetails" },
          employmentTypeDetails: { $first: "$employmentTypeDetails" },
          vacancyApproval: { $first: "$vacancyApproval" },
          vacancyType: { $first: "$vacancyType" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },
    ]);

    if (!vacancyRequest || vacancyRequest.length === 0) {
      return badRequest(res, `Vacancy Request not found`);
    }

    const count = vacancyRequest.length;
    console.log(count);
    success(res, "Vacancy Request data for approval", vacancyRequest);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//------------------------------------------------------------------
async function getRecommendApprovalData(req, res) {
  try {
    const vacancyRequest = await vacancyRequestModel
      .find({
        status: "active",
        vacancyType: "recommended",
        vacancyApproval: "approved",
      })
      .populate("branchId")
      .populate("createdByManagerId")
      .populate("jobDescriptionId")
      .populate("vacancyApprovalById")
      .populate("departmentId")
      .populate("employmentTypeId")
      .sort({ createdAt: -1 });
    success(res, "Vacancy Request data", vacancyRequest);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//-----------------------------------get Recommend Candidate data for approval----------------------

async function getRecommendCandidate(req, res) {
  try {
    const reportingManager = req.Id;
    console.log(reportingManager);

    const jobApplyForm = await jobApplyFormModel.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "recommendedByID",
          foreignField: "_id",
          as: "recommendedBy",
        },
      },
      {
        $unwind: {
          path: "$recommendedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "recommendedBy.reportingManagerId": new mongoose.Types.ObjectId(
            reportingManager
          ),
          status: "hold",
          resumeShortlisted:"hold",
          hrInterviewSchedule:"active",
          jobFormType: "recommended",
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentDetails",
        },
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacancyRequestId",
          foreignField: "_id",
          as: "vacancyRequest",
        },
      },
      {
        $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: {
          path: "$departmentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$vacancyRequest",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Group to remove duplicates based on unique _id field
      {
        $group: {
          _id: "$_id",
          candidateUniqueId: { $first: "$candidateUniqueId" },
          name: { $first: "$name" },
          mobileNumber: { $first: "$mobileNumber" },
          emailId: { $first: "$emailId" },
          highestQualification: { $first: "$highestQualification" },
          university: { $first: "$university" },
          graduationYear: { $first: "$graduationYear" },
          cgpa: { $first: "$cgpa" },
          address: { $first: "$address" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pincode: { $first: "$pincode" },
          skills: { $first: "$skills" },
          resume: { $first: "$resume" },
          salarySlip: { $first: "$salarySlip" },
          finCooperOfferLetter: { $first: "$finCooperOfferLetter" },
          pathofferLetterFinCooper: { $first: "$pathofferLetterFinCooper" },
          approvalPayrollfinOfferLetter: {
            $first: "$approvalPayrollfinOfferLetter",
          },
          remarkFinCooperOfferLetter: { $first: "$remarkFinCooperOfferLetter" },
          preferedInterviewMode: { $first: "$preferedInterviewMode" },
          position: { $first: "$position" },
          departmentId: { $first: "$departmentId" },
          knewaboutJobPostFrom: { $first: "$knewaboutJobPostFrom" },
          currentDesignation: { $first: "$currentDesignation" },
          lastOrganization: { $first: "$lastOrganization" },
          startDate: { $first: "$startDate" },
          endDate: { $first: "$endDate" },
          reasonLeaving: { $first: "$reasonLeaving" },
          totalExperience: { $first: "$totalExperience" },
          currentCTC: { $first: "$currentCTC" },
          currentLocation: { $first: "$currentLocation" },
          preferredLocation: { $first: "$preferredLocation" },
          gapIfAny: { $first: "$gapIfAny" },
          employeUniqueId: { $first: "$employeUniqueId" },
          managerID: { $first: "$managerID" },
          workLocationId: { $first: "$workLocationId" },
          jobPostId: { $first: "$jobPostId" },
          // vacancyRequestId: { $first: "$vacancyRequestId" },
          // hrInterviewDetailsId: { $first: "$hrInterviewDetailsId" },
          recommendedBy: { $first: { name: "$recommendedBy.employeName" } },
          // recommendedByID: { $first: "$recommendedByID" },
          jobFormType: { $first: "$jobFormType" },
          branchDetails: { $first: "$branchDetails" },
          positionWebsite: { $first: "$positionWebsite" },
          departmentWebsite: { $first: "$departmentWebsite" },
          salary: { $first: "$salary" },
          joiningDate: { $first: "$joiningDate" },
          managerRevertReason: { $first: "$managerRevertReason" },
          rejectedById: { $first: "$rejectedById" },
          resumeShortlisted: { $first: "$resumeShortlisted" },
          // hrInterviewSchedule: { $first: "$hrInterviewSchedule" },
          // feedbackByHR: { $first: "$feedbackByHR" },
          // interviewSchedule: { $first: "$interviewSchedule" },
          // feedbackByInterviewer: { $first: "$feedbackByInterviewer" },
          // preOffer: { $first: "$preOffer" },
          // docVerification: { $first: "$docVerification" },
          // postOffer: { $first: "$postOffer" },
          // sendOfferLetterToCandidate: { $first: "$sendOfferLetterToCandidate" },
          status: { $first: "$status" },
          branchDetails: { $first: { name: "$branchDetails.name" } },
          departmentDetails: { $first: { name: "$departmentDetails.name" } },
          vacancyRequest: { $first: "$vacancyRequest" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },
    ]);

    if (!jobApplyForm || jobApplyForm.length === 0) {
      return badRequest(res, ` jobApplyForm not found`);
    }

    const count = jobApplyForm.length;
    console.log(count);
    success(res, "jobApplyForm data", jobApplyForm);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//---------------------------------------------------------------------------
async function recommendedCandidateApproval(req, res) {
  try {
    const jobFormId = req.body.jobFormId;
    const jobFormApproval = req.body.jobFormApproval;

    if (jobFormApproval !== "approved" && jobFormApproval !== "notApproved") {
      return badRequest(
        res,
        `jobForm Approval must be either "approved" or "notApproved".`
      );
    }
    let status;
    let resumeShortlisted;
    let vacancyApproval;
    if (jobFormApproval === "approved") {
      status = "inProgress";
      resumeShortlisted = "shortlisted";
      vacancyApproval="approved"
    } else {
      status = "reject";
      resumeShortlisted = "notshortlisted";
      vacancyApproval="notApproved"
    }
    const updatedjobApplyForm = await jobApplyFormModel.findByIdAndUpdate(
      { _id: jobFormId },
      { status: status, resumeShortlisted: resumeShortlisted },
      { new: true }
    );
    const updatedVacancy = await vacancyRequestModel.findByIdAndUpdate(
      { _id: updatedjobApplyForm.vacancyRequestId },
      { vacancyApproval: vacancyApproval},
      { new: true }
    );
    await jobFormGoogleSheet(updatedjobApplyForm);

    success(res, "Job Apply Form Approval", updatedjobApplyForm);
  } catch (error) {
    unknownError(res, error);
  }
}
//------------------------------------------recommended by manager------------------------------------------
async function getManagerRecommendCandidate(req, res) {
  try {
    const reportingManager = req.Id; // Extract the reporting manager's ID
    console.log(reportingManager);

    const jobApplyForm = await jobApplyFormModel.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "recommendedByID",
          foreignField: "_id",
          as: "recommendedBy",
        },
      },
      {
        $unwind: {
          path: "$recommendedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "recommendedBy._id": new mongoose.Types.ObjectId(reportingManager),
          jobFormType: "recommended",
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentDetails",
        },
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacancyRequestId",
          foreignField: "_id",
          as: "vacancyRequest",
        },
      },
      {
        $lookup: {
          from: "feedbackinterviewers", // Include feedbackinterviewers data
          localField: "_id", // Match by jobApplyFormId
          foreignField: "jobApplyFormId",
          as: "hrFeedbackinterviewers", // Alias for the feedback data
        },
      },
      {
        $unwind: {
          path: "$hrFeedbackinterviewers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees", // Join to get interviewer details
          localField: "hrFeedbackinterviewers.interviewerId",
          foreignField: "_id",
          as: "interviewerDetails",
        },
      },
      {
        $unwind: {
          path: "$interviewerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: {
          path: "$departmentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$vacancyRequest",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          candidateUniqueId: { $first: "$candidateUniqueId" },
          name: { $first: "$name" },
          mobileNumber: { $first: "$mobileNumber" },
          emailId: { $first: "$emailId" },
          highestQualification: { $first: "$highestQualification" },
          university: { $first: "$university" },
          graduationYear: { $first: "$graduationYear" },
          cgpa: { $first: "$cgpa" },
          address: { $first: "$address" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pincode: { $first: "$pincode" },
          skills: { $first: "$skills" },
          resume: { $first: "$resume" },
          salarySlip: { $first: "$salarySlip" },
          finCooperOfferLetter: { $first: "$finCooperOfferLetter" },
          pathofferLetterFinCooper: { $first: "$pathofferLetterFinCooper" },
          approvalPayrollfinOfferLetter: {
            $first: "$approvalPayrollfinOfferLetter",
          },
          remarkFinCooperOfferLetter: { $first: "$remarkFinCooperOfferLetter" },
          preferedInterviewMode: { $first: "$preferedInterviewMode" },
          position: { $first: "$position" },
          departmentId: { $first: "$departmentId" },
          knewaboutJobPostFrom: { $first: "$knewaboutJobPostFrom" },
          currentDesignation: { $first: "$currentDesignation" },
          lastOrganization: { $first: "$lastOrganization" },
          startDate: { $first: "$startDate" },
          endDate: { $first: "$endDate" },
          reasonLeaving: { $first: "$reasonLeaving" },
          totalExperience: { $first: "$totalExperience" },
          currentCTC: { $first: "$currentCTC" },
          currentLocation: { $first: "$currentLocation" },
          preferredLocation: { $first: "$preferredLocation" },
          gapIfAny: { $first: "$gapIfAny" },
          employeUniqueId: { $first: "$employeUniqueId" },
          managerID: { $first: "$managerID" },
          workLocationId: { $first: "$workLocationId" },
          jobPostId: { $first: "$jobPostId" },
          recommendedBy: { $first: { name: "$recommendedBy.employeName" } },
          jobFormType: { $first: "$jobFormType" },
          branchDetails: { $first: "$branchDetails" },
          departmentDetails: { $first: "$departmentDetails" },
          positionWebsite: { $first: "$positionWebsite" },
          departmentWebsite: { $first: "$departmentWebsite" },
          salary: { $first: "$salary" },
          joiningDate: { $first: "$joiningDate" },
          managerRevertReason: { $first: "$managerRevertReason" },
          bankAccountProof:{ $first: "$bankAccountProof" },
          rejectedById: { $first: "$rejectedById" },
          resumeShortlisted: { $first: "$resumeShortlisted" },
          hrFeedbackinterviewers: { $first: "$hrFeedbackinterviewers" },
          interviewerDetails: { $first: "$interviewerDetails" },
          vacancyRequest: { $first: "$vacancyRequest" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },
    ]);

    if (!jobApplyForm || jobApplyForm.length === 0) {
      return badRequest(res, `jobApplyForm not found`);
    }

    const count = jobApplyForm.length;
    console.log(count);
    success(res, "jobApplyForm data", jobApplyForm);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//----------------------------------recommended by manager waiting for approval------------------------------------------
async function getRecommendCandidateForHr(req, res) {
  try {

    const jobApplyForm = await jobApplyFormModel.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "recommendedByID",
          foreignField: "_id",
          as: "recommendedBy",
        },
      },
      {
        $unwind: {
          path: "$recommendedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          jobFormType: "recommended",
        },
      },
      {
        $lookup: {
          from: "employees", // Join the employees collection
          localField: "recommendedBy.reportingManagerId", // Match by interviewerId
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0, // Exclude the _id field
                employeName: 1, // Include only employeName
              },
            },
          ],
          as: "approvedBy", // Alias for the interviewer data
        },
      },
      {
        $unwind: {
          path: "$approvedBy", // Unwind the interviewer details
          preserveNullAndEmptyArrays: true, // Allow null if no match is found
        },
      },  
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0, // Exclude the _id field
                name: 1, // Include only the employeName field
              },
            },
          ],
          as: "branchDetails",
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0, // Exclude the _id field
                name: 1, // Include only the employeName field
              },
            },
          ],
          as: "departmentDetails",
        },
      },
      // {
      //   $lookup: {
      //     from: "vacancyrequests",
      //     localField: "vacancyRequestId",
      //     foreignField: "_id",
      //     as: "vacancyRequest",
      //   },
      // },
      {
        $lookup: {
          from: "feedbackinterviewers", // Include feedbackinterviewers data
          localField: "_id", // Match by jobApplyFormId
          foreignField: "jobApplyFormId",
          as: "hrFeedbackinterviewers", // Alias for the feedback data
        },
      },
      {
        $unwind: {
          path: "$hrFeedbackinterviewers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees", // Join to get interviewer details
          localField: "hrFeedbackinterviewers.interviewerId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0, // Exclude the _id field
                employeName: 1, // Include only the employeName field
              },
            },
          ],
          as: "interviewerDetails",
        },
      },
      {
        $unwind: {
          path: "$interviewerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: {
          path: "$departmentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $unwind: {
      //     path: "$vacancyRequest",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $group: {
          _id: "$_id",
          candidateUniqueId: { $first: "$candidateUniqueId" },
          name: { $first: "$name" },
          mobileNumber: { $first: "$mobileNumber" },
          emailId: { $first: "$emailId" },
          highestQualification: { $first: "$highestQualification" },
          university: { $first: "$university" },
          graduationYear: { $first: "$graduationYear" },
          cgpa: { $first: "$cgpa" },
          address: { $first: "$address" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pincode: { $first: "$pincode" },
          skills: { $first: "$skills" },
          resume: { $first: "$resume" },
          salarySlip: { $first: "$salarySlip" },
          finCooperOfferLetter: { $first: "$finCooperOfferLetter" },
          pathofferLetterFinCooper: { $first: "$pathofferLetterFinCooper" },
          approvalPayrollfinOfferLetter: {
            $first: "$approvalPayrollfinOfferLetter",
          },
          remarkFinCooperOfferLetter: { $first: "$remarkFinCooperOfferLetter" },
          preferedInterviewMode: { $first: "$preferedInterviewMode" },
          position: { $first: "$position" },
          departmentId: { $first: "$departmentId" },
          knewaboutJobPostFrom: { $first: "$knewaboutJobPostFrom" },
          currentDesignation: { $first: "$currentDesignation" },
          lastOrganization: { $first: "$lastOrganization" },
          startDate: { $first: "$startDate" },
          endDate: { $first: "$endDate" },
          reasonLeaving: { $first: "$reasonLeaving" },
          totalExperience: { $first: "$totalExperience" },
          currentCTC: { $first: "$currentCTC" },
          currentLocation: { $first: "$currentLocation" },
          preferredLocation: { $first: "$preferredLocation" },
          gapIfAny: { $first: "$gapIfAny" },
          employeUniqueId: { $first: "$employeUniqueId" },
          managerID: { $first: "$managerID" },
          workLocationId: { $first: "$workLocationId" },
          jobPostId: { $first: "$jobPostId" },
          // vacancyRequest:{$first:"$vacancyRequest"},
          recommendedBy: { $first: { name: "$recommendedBy.employeName" } },
          approvedBy: { $first: { name: "$approvedBy.employeName" } },
          jobFormType: { $first: "$jobFormType" },
          branchDetails: { $first: "$branchDetails" },
          positionWebsite: { $first: "$positionWebsite" },
          departmentWebsite: { $first: "$departmentWebsite" },
          salary: { $first: "$salary" },
          joiningDate: { $first: "$joiningDate" },
          managerRevertReason: { $first: "$managerRevertReason" },
          rejectedById: { $first: "$rejectedById" },
          resumeShortlisted: { $first: "$resumeShortlisted" },
          hrFeedbackinterviewers: { $first: "$hrFeedbackinterviewers" },
          interviewerDetails: { $first: "$interviewerDetails" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          
        },
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },
    ]);

    if (!jobApplyForm || jobApplyForm.length === 0) {
      return badRequest(res, `jobApplyForm not found`);
    }

    const count = jobApplyForm.length;
    console.log(count);
    success(res, "jobApplyForm data", jobApplyForm);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//-----------------------------------------------------------------------------
async function getIfReportingManager(req, res) {
  try {
    const reportingManager = await employeModel.find({
      reportingManagerId: req.Id,
    });
    const isReportingManager = reportingManager.length > 0 ? "yes" : "no";

    // Return the response
    success(res, "Reporting Manager Status", {isReportingManager:isReportingManager});
  
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//-----------------------------------------------------------
async function getIfReportingManagerById(req, res) {
  try {
    // console.log(req.query.id)
    const reportingManager = await employeModel.find({
      reportingManagerId: req.query.id,
    });
    // console.log(reportingManager.length)
    const isReportingManager = reportingManager.length > 0 ? "yes" : "no";

    // Return the response
    success(res, "Reporting Manager Status", {isReportingManager:isReportingManager});
  
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS  Add vacancyRequest ---------------------------------------
async function vacancyApprovalAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { branchId, departmentId, budget, approverId } = req.body;

    // Validate required fields
    if (!branchId) {
      return badRequest(res, "Branch ID is required.");
    }

    if (!departmentId) {
      return badRequest(res, "Department ID is required.");
    }

    if (!budget) {
      return badRequest(res, "Budget is required.");
    }

    if (!approverId) {
      return badRequest(res, "Approver ID is required.");
    }

    // Add createdByManagerId to req.body  approved
    req.body.createdById = req.Id;
     // Check for unique combination of branchId, departmentId, budget, and approverId
     const existingRecord = await vacancyApprovalModel.findOne({
      branchId: branchId,
      departmentId: departmentId,
      budget: budget,
      approverId: approverId,
    });

    if (existingRecord) {
      return badRequest(
        res,
        "A record with the same Branch, Department, Budget, and Approver already exists."
      );
    }
    const vacancyRequest = await vacancyApprovalModel.create(req.body);

    success(res, "Vacancy approver added successfully",vacancyRequest);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS  View All JobPost ---------------------------------------
async function getAllvacancyApproval(req, res) {
  try {
    let vacancyApproval = await vacancyApprovalModel.find({
      status: "active",
    })
    .populate({
      path: "branchId",
      select: "_id name status",
    }).populate({
      path: "departmentId",
      select: "_id name status",
    }).populate({
      path: "createdById",
      select: "_id employeName status",
    })
    .populate({
      path: "approverId",
      select: "_id employeName status",
    });
    
    success(res, "All Vacancy Approval", vacancyApproval);
  } catch (error) {
    // console.log("error", error);
    unknownError(res, error);
  }
}

module.exports = {
  vacancyRequestAdd,
  vacancyRequestUpdate,
  getAllVacancyRequest,
  getVacancyRequestForManager,
  vacancyRequestDetail,
  getVacancyRequestByDepartment,
  getVacancyRequestById,
  changeVacancyApproval,
  getVacancyApprovalData,
  getRecommendApprovalData,
  getRecommendCandidate,
  recommendedCandidateApproval,
  getManagerRecommendCandidate,
  getIfReportingManager,
  getIfReportingManagerById,
  getRecommendCandidateForHr,
  vacancyApprovalAdd,
  getAllvacancyApproval
};
