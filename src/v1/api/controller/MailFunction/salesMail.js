const customerModel = require('../../model/customer.model')
const applicantModel = require('../../model/applicant.model')
const employeModel = require('../../model/adminMaster/employe.model')
const vendorModel = require("../../model/adminMaster/vendor.model")
const externalManagerModel = require("../../model/externalManager/externalVendorDynamic.model")
const { PdEmail, sendEmailByVendor, sendEmail, leadMailFunction } = require("../../controller/functions.Controller")
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const cron = require("node-cron");
const moment = require("moment-timezone");
const processModel = require('../../model/process.model')
const cibilModel = require('../../model/cibilDetail.model')
const leadGenerateModel = require('../../model/leadGenerate.model')
const roleModel = require('../../model/adminMaster/role.model')
const mailSwitchesModel = require("../../model/adminMaster/mailSwitches.model")
const newBranchModel = require("../../model/adminMaster/newBranch.model")
const attendanceModel = require("../../model/adminMaster/attendance.model")
const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
} = require("../../../../../globalHelper/response.globalHelper");


const mailSendCustomerPdDone = async (customerId, req, status, remarkByPd) => {
  try {
    // Fetch branch name
    const branchData = await customerModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(customerId) },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeId", // Field in customerModel
          foreignField: "_id", // Field in employees collection
          as: "employeeDetails",
        },
      },
      { $unwind: "$employeeDetails" },
      {
        $lookup: {
          from: "newbranches",
          localField: "employeeDetails.branchId", // Field in employees
          foreignField: "_id", // Field in newbranches collection
          as: "branchDetails",
        },
      },
      { $unwind: "$branchDetails" },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "_id", // Field in customerModel
          foreignField: "customerId", // Field in employees collection
          as: "applicantData",
        },
      },
      { $unwind: "$applicantData" },
      {
        $project: {
          _id: 0,
          branchName: "$branchDetails.name",
          fullName: "$applicantData.fullName",
          fatherName: "$applicantData.fatherName",
          mobileNo: "$applicantData.mobileNo",
          customerAddress: "$applicantData.permanentAddress?.addressLine1",
        },
      },
    ]);

    // console.log('branchData', branchData)
    const branchName = branchData.length > 0 ? branchData[0].branchName : "";
    const fullName = branchData.length > 0 ? branchData[0].fullName : "";
    const fatherName = branchData.length > 0 ? branchData[0].fatherName : "";
    const mobileNo = branchData.length > 0 ? branchData[0].mobileNo : "";
    const customerAddress = branchData.length > 0 ? branchData[0].customerAddress : "";

    let ccmails = [];
    const customerData = await customerModel.findById(customerId);
    if (customerData) {
      const employeeData = await employeModel
        .findById(customerData.employeId)
        .select("workEmail reportingManagerId");

      if (employeeData) {
        if (employeeData.workEmail) {
          ccmails.push(employeeData.workEmail);
        }

        if (employeeData.reportingManagerId) {
          const reportingManager = await employeModel
            .findById(employeeData.reportingManagerId)
            .select("workEmail");
          if (reportingManager?.workEmail) {
            ccmails.push(reportingManager.workEmail);
          }
        }
      }
    }

    let toEmails;
    if (req.hostname === "stageapi.fincooper.in" || req.hostname === "localhost") {
      // toEmails = ""
      toEmails = ""
    } else if (req.hostname === "prod.fincooper.in") {
      toEmails = "shubhamdhakad@fincoopers.in"
    }

    let title;
    if (status === "complete" || status === "approve") {
      title = "This Caption PD is approve ... Please check It..."
    } else {
      title = "This Caption PD is rejected ... Please find Reject Reason ...."
    }
    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h2 { color: #4CAF50; }
          p { font-size: 14px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table, th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; text-align: left; }
          .footer { margin-top: 20px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <p>Dear Team,</p>
        <p>${title}</p>
        <table>
          <tr><td>FILE NO</td><td>${customerData?.customerFinId}</td></tr>
          <tr><td>BRANCH</td><td>${branchName}</td></tr>
          <tr><td>CUSTOMER NAME</td><td>${fullName}</td></tr>
          <tr><td>CUSTOMER FATHER NAME</td><td>${fatherName}</td></tr>
          <tr><td>CUSTOMER NUMBER</td><td>${mobileNo}</td></tr>
          <tr><td>CUSTOMER ADDRESS</td><td>${customerAddress}</td></tr>
        </table>
        ${status === "reject" ? `<p>Reject Reason: - ${remarkByPd}</p>` : ""}
        <div class="footer">
          <p>Best Regards</p>
          <p>Team Fin coopers</p>
        </div>
      </body>
      </html>`;

    // Send Email
    await PdEmail(
      toEmails,
      ccmails,
      `${customerData?.customerFinId} ${fullName?.toUpperCase() || ""} S/O ${fatherName?.toUpperCase() || ""
      } - PD ${status === "approve" ? "Approve" : (status === "complete" ? "Complete" : "Reject")}`,

      html
    );

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in EmailsendPd:", error);
  }
};


const fileCreateMailSend = async (fileDetail, value, codeLevel) => {
  try {
    const totalCount = fileDetail.inactiveCount
    const fileInfo = fileDetail.fileCreateEmployeeDetails
    let toEmails;
    if (codeLevel === 'production') {
      toEmails = "anilmalviya@fincoopers.in"
    } else if (codeLevel === 'stage') {
      toEmails = ''
    }
    let title;
    let subject;
    let footerText;
    if (value) {
      title = "These Files Deleted From Finexe"
      footerText = "Note : - That Files Liested About Will Be Deleted"
      subject = "⚠️ ATTENTION: Unprocessed File Delete Notification"
    } else {
      title = "These Files Were Created But Not Processed as Applicant, Co-Applicant, or Guarantor"
      footerText = "Note :- That Files Listed Above Will Be Permanently Deleted After 48 Hours Of Inactivity"
      subject = "⚠️ ATTENTION: Unprocessed File Notification"

    }

    const casesInfo = fileInfo.map(
      (caseData) => `
        <tr>
          <td>${caseData.customerFinId ? caseData.customerFinId.toUpperCase() : " "}</td>
          <td>${caseData.mobileNo ? caseData.mobileNo : " "}</td>
          <td>${caseData.userName ? caseData.userName.toUpperCase() : " "}</td>
          <td>${caseData.employeeName ? caseData.employeeName.toUpperCase() : " "}</td>
          <td>${caseData.employeeUniqueId ? caseData.employeeUniqueId.toUpperCase() : " "}</td>
          <td>${caseData.branchName ? caseData.branchName.toUpperCase() : " "}</td>
           <td>${new Date(caseData.createdAt).toLocaleString() || " "}</td>
        </tr>`
    ).join("");

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h2 { color: #4CAF50; }
          p { font-size: 14px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table, th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; text-align: left; }
          .footer { margin-top: 20px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <p>Dear Team,</p>

      <p>${title}</p>
      <p>Total Cases: ${totalCount}</p>
      <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>FILE NO</th>
            <th>CUSTOMER NUMBER</th>
            <th>EMPLOYEE USERNAME</th>
            <th>EMPLOYEE NAME</th>
            <th>EMPLOYEE UNIQUE ID</th>
            <th>BRANCH NAME</th>
            <th>Create Date</th>
          </tr>
        </thead>
        <tbody>
          ${casesInfo}
        </tbody>
      </table>
          <p>${footerText}</p>
        <div class="footer">
          <p>Best Regards</p>
          <p>Team Fin coopers</p>
        </div>
      </body>
      </html>`;

    const ccmails = []
    // Send Email
    await PdEmail(
      toEmails,
      ccmails,
      subject,
      html
    );

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in EmailsendPd:", error);
  }
};


const bracnhPendencyFormsMailSend = async (req, formName, customerId) => {

  const [customerDetail, applicantDetail] = await promise.all([
    customerModel.findById(customerId),
    applicantModel.findOne({ customerId, customerId })
  ])

  let toEmails;
  if (req.hostname === 'prod.fincooper.in') {
    //  toEmails = "anilmalviya@fincoopers.in"
  } else if (req.hostname === 'stageapi.fincooper.in' || req.hostname === 'localhost') {
    toEmails = ''
  }
  let title;
  let subject;
  let footerText;
  if (formName === 'sanction') {
    title = "These Files Deleted From Finexe"
    footerText = "Note : - That Files Liested About Will Be Deleted"
    subject = "⚠️ ATTENTION: Unprocessed File Delete Notification"
  } else if (formName === 'disbursement') {
    title = "These Files Were Created But Not Processed as Applicant, Co-Applicant, or Guarantor"
    footerText = "Note :- That Files Listed Above Will Be Permanently Deleted After 48 Hours Of Inactivity"
    subject = "File Notification"
  }

  const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        h2 { color: #4CAF50; }
        p { font-size: 14px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table, th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; text-align: left; }
        .footer { margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <p>Dear Team,</p>

    <p>${title}</p>
    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>FILE NO</th>
          <th>CUSTOMER Name</th>
        </tr>
      </thead>
      <tbody>
        ${casesInfo}
      </tbody>
    </table>
        <p>${customerDetail.customerFinId}</p>
        <p>${applicantDetail.fullName}</p>
      <div class="footer">
        <p>Best Regards</p>
        <p>Team Fin coopers</p>
      </div>
    </body>
    </html>`;
}



// Schedule for 9:00 AM IST (2:30 PM UTC)
cron.schedule("30 03 * * *", async () => {
  const pdNotComplete = await mailSwitchesModel.findOne();
  if (pdNotComplete?.masterMailStatus && pdNotComplete?.pdMail && pdNotComplete?.pdNotCompleteFilesMailFunctionMorning) {
    await pdNotCompleteFilesMailFunction(true);
  }
});

// Schedule for 8:00 PM IST (2:30 PM UTC)
cron.schedule("30 14 * * *", async () => {
  const pdNotComplete = await mailSwitchesModel.findOne();
  if (pdNotComplete?.masterMailStatus && pdNotComplete?.pdMail && pdNotComplete?.pdNotCompleteFilesMailFunctionEvening) {
    await pdNotCompleteFilesMailFunction(true);
  }
});


//  Schedule for 6:00 PM IST (12:30 PM UTC)
cron.schedule("30 12  * * *", async () => {
  const pdNotComplete = await mailSwitchesModel.findOne();
  if (pdNotComplete?.masterMailStatus && pdNotComplete?.pdMail && pdNotComplete?.pdNotCompleteFilesMailFunctionAfternoon) {
    await pdNotCompleteFilesMailFunction(true);
  }
});

// reject files for change pd mail formate


const pdNotCompleteFilesMailFunction = async () => {
  try {
    // pd product id match files not show in pending mail 
    const productIdToExclude = new ObjectId("6734821148d4dbfbe0c69c7e");

    const resultEmployee = await externalManagerModel.aggregate([
      {
        $match: {
          creditPdId: { $ne: null },
          statusByCreditPd: { $in: ["incomplete", "WIP", "accept"] },
          fileStatus: "active"
        },
      },

      // Lookup to get employee details
      {
        $lookup: {
          from: "employees",  // Employees collection
          localField: "creditPdId",  // Matching with creditPdId
          foreignField: "_id",  // Employee's _id
          as: "employeeDetails",
        },
      },

      // Unwind to access employee details
      {
        $unwind: "$employeeDetails",
      },

      // Group by employeeId and employeeName, and count the files with the relevant status
      {
        $group: {
          _id: "$employeeDetails._id",  // Group by employee ID
          employeeName: { $first: "$employeeDetails.employeName" },  // Get employee name
          notComplete: { $sum: 1 },  // Count files where status matches
        },
      },
      {
        $sort: { notComplete: -1 }
      },
      // Final projection for employee details and the notComplete count
      {
        $project: {
          _id: 0,  // Exclude the _id field
          employeeName: 1,
          notComplete: 1,  // Show the count of not complete files
        },
      },
    ])



    const resultBranch = await externalManagerModel.aggregate([
      // Match active fileStatus
      { $match: { fileStatus: "active" } },

      // Lookup PD Form Data
      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "latestPdForm",
        },
      },
      { $unwind: { path: "$latestPdForm", preserveNullAndEmptyArrays: true } },

      // Get latest PD form entry
      { $sort: { "latestPdForm._id": -1 } },

      // Set creditPdCompleteDate based on latestPdForm.bdCompleteDate
      {
        $addFields: {
          creditPdCompleteDate: {
            $cond: {
              if: { $or: [{ $eq: ["$creditPdCompleteDate", ""] }, { $eq: ["$creditPdCompleteDate", null] }] },
              then: "$latestPdForm.bdCompleteDate",
              else: "$creditPdCompleteDate",
            },
          },
        },
      },

      // Lookup Customer Details
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetailData",
        },
      },
      { $unwind: { path: "$customerdetailData", preserveNullAndEmptyArrays: true } },

      {
        $match: {
          "customerdetailData.productId": { $ne: productIdToExclude },
        },
      },
      // Lookup Employee Details
      {
        $lookup: {
          from: "employees",
          localField: "customerdetailData.employeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },

      // Lookup Branch Details
      {
        $lookup: {
          from: "newbranches",
          localField: "employeeDetails.branchId",
          foreignField: "_id",
          as: "newbrancheDetails",
        },
      },
      { $unwind: { path: "$newbrancheDetails", preserveNullAndEmptyArrays: true } },

      // Preserve all documents even if statusByCreditPd is missing
      { $unwind: { path: "$statusByCreditPd", preserveNullAndEmptyArrays: true } },

      // Group by Branch
      {
        $group: {
          _id: "$newbrancheDetails._id", // Group by branch ID
          branchName: { $first: "$newbrancheDetails.name" },
          totalNotAssignFiles: {
            $sum: {
              $cond: [{ $eq: ["$creditPdId", null] }, 1, 0],
            },
          },
        },
      },

      // **Exclude branches where totalNotAssignFiles is 0**
      {
        $match: {
          totalNotAssignFiles: { $gt: 0 },
          branchName: { $ne: null },
        },
      },

      {
        $project: {
          _id: 0,
          branchName: 1,
          totalNotAssignFiles: 1,
        },
      },

      { $sort: { totalNotAssignFiles: -1 } },
    ]);


    const dateFormat = "YYYY-MM-DDTHH:mm:ss A";

    const todayStart = moment().startOf("day").format(dateFormat);
    const todayEnd = moment().endOf("day").format(dateFormat);

    const matchQuery = {
      statusByCreditPd: "reject",
      fileStatus: "active",
      creditPdCompleteDate: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    };


    const rejectFileToday = await externalManagerModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "pdformdatas",
          localField: "customerId",
          foreignField: "customerId",
          as: "pdModelDetails",
        },
      },
      { $unwind: { path: "$pdModelDetails", preserveNullAndEmptyArrays: true } },

      { $sort: { "pdModelDetails._id": -1 } },

      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerdetailData",
        },
      },
      { $unwind: { path: "$customerdetailData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantdetailsData",
        },
      },
      { $unwind: { path: "$applicantdetailsData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "customerdetailData.employeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "customerdetailData.branch",
          foreignField: "_id",
          as: "newbrancheDetails",
        },
      },
      { $unwind: { path: "$newbrancheDetails", preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: "$customerdetailData._id",
          branchName: { $first: "$newbrancheDetails.name" },
          customerName: { $first: "$applicantdetailsData.fullName" },
          customerFinId: { $first: "$customerdetailData.customerFinId" },
          pdrejectRemark: { $first: "$reasonForReject" },
          creditPdCompleteDate: { $first: "$creditPdCompleteDate" },
        },
      },

      {
        $project: {
          _id: 0,
          branchName: 1,
          customerFinId: 1,
          customerName: 1,
          pdrejectRemark: 1,
          creditPdCompleteDate: 1,
        },
      },

      { $sort: { branchName: -1 } },
    ]);

    const totalNotAssignFiles = resultBranch.reduce((sum, branch) => sum + (branch.totalNotAssignFiles || 0), 0);
    const totalNotCompleteFiles = resultEmployee.reduce((sum, employee) => sum + (employee.notComplete || 0), 0);


    let toEmails;
    let ccmails = []
    toEmails = "pd@fincoopers.in"
    ccmails = ['finexe@fincoopers.com']

    let title;
    let subject;
    let footerText;

    title = "Please find below the details of PD files that are currently pending and notAssign require your attention. These files have not been completed yet."
    footerText = "Note : - The files listed above are currently pending and need to be addressed promptly to ensure smooth operations."
    subject = "Not Complete PD Files - Action Required"

    const bracnhInfo = resultBranch.map(
      (branchData) => `
        <tr>
          <td>${branchData.branchName ? branchData.branchName.toUpperCase() : " "}</td>
          <td>${branchData.totalNotAssignFiles ? branchData.totalNotAssignFiles : " "}</td>
        </tr>`
    ).join("") + `
    <tr style="font-weight: bold;">
      <td>TOTAL PD FILES NOT ASSIGN</td>
      <td>${totalNotAssignFiles}</td>
    </tr>
  `;;


    const employeeInfo = resultEmployee.map(
      (employeeData) => `
        <tr>
          <td>${employeeData.employeeName ? employeeData.employeeName.toUpperCase() : " "}</td>
          <td>${employeeData.notComplete ? employeeData.notComplete : " "}</td>
        </tr>`
    ).join("") + `
    <tr style="font-weight: bold;">
      <td>TOTAL PD FILES NOT COMPLETE</td>
      <td>${totalNotCompleteFiles}</td>
    </tr>
  `;;

    // console.log('rejectFileInfo---',rejectFileInfo)

    const rejectFileInfo = rejectFileToday.map(
      (rejectFileToday) => `
        <tr>
          <td>${rejectFileToday.customerFinId ? rejectFileToday.customerFinId : " "}</td>
          <td>${rejectFileToday.branchName ? rejectFileToday.branchName : " "}</td>
          <td>${rejectFileToday.customerName ? rejectFileToday.customerName.toUpperCase() : " "}</td>
          <td>${rejectFileToday.pdrejectRemark ? rejectFileToday.pdrejectRemark : " "}</td>
        </tr>`
    ).join("");


    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h2 { color: #4CAF50; }
          p { font-size: 14px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table, th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; text-align: left; }
          .footer { margin-top: 20px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <p>Dear Team,</p>

      <p>${title}</p>
      <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>BRANCH NAME</th>
            <th>PD FILES NOT ASSIGN</th>
          </tr>
        </thead>
        <tbody>
          ${bracnhInfo}
        </tbody>
      </table>
         <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>EMPLOYEE NAME</th>
            <th>PD FILES NOT COMPLETE</th>
          </tr>
        </thead>
        <tbody>
          ${employeeInfo}
        </tbody>
      </table>
           </table>
         <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>FIN NO</th>
            <th>BRANCH NAME</th>
            <th>CUSTOMER NAME</th>
            <th>REJECT REASON</th>
          </tr>
        </thead>
        <tbody>
          ${rejectFileInfo}
        </tbody>
      </table>
          <p>${footerText}</p>
        <div class="footer">
          <p>Best Regards</p>
          <p>Team Fin coopers</p>
        </div>
      </body>
      </html>`


    await sendEmailByVendor('pendingMailSend',
      toEmails,
      ccmails,
      subject,
      html
    );
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in EmailsendPd:", error);
  }
}

// Schedule for 6:00 PM IST (12:30 PM UTC)
cron.schedule("30 12 * * *", async () => {
  const sendPendingMail = await mailSwitchesModel.findOne();
  if (sendPendingMail?.masterMailStatus && sendPendingMail?.vendorMail && sendPendingMail?.sendPendingVendorEmailsAfternoon) {
    await sendPendingVendorEmails();
  }
});

//  Schedule for 9:00 AM IST (03:30 AM UTC)
cron.schedule("30 03 * * *", async () => {
  const sendPendingMail = await mailSwitchesModel.findOne();
  if (sendPendingMail?.masterMailStatus && sendPendingMail?.vendorMail && sendPendingMail?.sendPendingVendorEmailsEvening) {
    await sendPendingVendorEmails();
  }
});



const sendPendingVendorEmails = async () => {
  try {
    console.log("Running vendor pending mail cron job...");

    const vendors = await vendorModel.find({ status: "active" }).populate("vendorType").select("vendorType vendorRole communicationToMailId _id").lean();

    for (const vendor of vendors) {
      const vendorId = vendor._id;
      const vendorRole = vendor.vendorRole
      const vendorType = vendor.vendorType ? vendor.vendorType[0]?.vendorType : "";

      const matchQuery = {
        "vendors.vendorId": vendorId,
        "vendors.statusByVendor": "WIP",
        "vendors.vendorType": vendorType
      };

      let pendingFiles = await externalManagerModel.aggregate([
        { $match: matchQuery },
        {
          $project: {
            customerId: 1,
            customerFinId: 1,
            vendors: {
              $filter: {
                input: "$vendors",
                as: "vendor",
                cond: {
                  $and: [
                    { $eq: ["$$vendor.vendorId", vendorId] },
                    { $eq: ["$$vendor.statusByVendor", "WIP"] },
                    { $eq: ["$$vendor.vendorType", vendorType] }
                  ]
                }
              }
            }
          }
        },
        { $unwind: "$vendors" },
        {
          $addFields: {
            "vendors.TAT": {
              $let: {
                vars: {
                  startDate: {
                    $dateFromString: {
                      dateString: {
                        $replaceAll: {
                          input: {
                            $replaceAll: {
                              input: "$vendors.assignDate",
                              find: " AM",
                              replacement: ""
                            }
                          },
                          find: " PM",
                          replacement: ""
                        }
                      },
                      format: "%Y-%m-%dT%H:%M:%S",
                      onError: "$$NOW"
                    }
                  }
                },
                in: {
                  $cond: {
                    if: { $eq: ["$vendors.assignDate", ""] },
                    then: 0,
                    else: {
                      $abs: {
                        $ceil: {
                          $divide: [
                            { $subtract: ["$$NOW", "$$startDate"] },
                            86400000
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "customerId",
            foreignField: "customerId",
            as: "applicantDetailData"
          }
        },
        { $unwind: { path: "$applicantDetailData", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "customerdetails",
            localField: "customerId",
            foreignField: "_id",
            as: "customerdetailsData"
          }
        },
        { $unwind: { path: "$customerdetailsData", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$_id",
            customerFinId: { $first: "$customerdetailsData.customerFinId" },
            productId: { $first: "$customerdetailsData.productId" },
            customerFullName: { $first: "$applicantDetailData.fullName" },
            mobileNo: { $first: "$applicantDetailData.mobileNo" },
            vendors: { $push: "$vendors" },
            maxTAT: { $max: "$vendors.TAT" }  // Store the max TAT for sorting
          }
        },
        {
          $sort: {
            "maxTAT": -1  // Sort by max TAT in descending order
          }
        },
        {
          $project: {
            _id: 1,
            customerFinId: 1,
            productId: 1,
            customerFullName: 1,
            mobileNo: 1,
            vendors: 1
          }
        }
      ]);

      if (vendorRole == "internal") {
        pendingFiles = pendingFiles.filter(file => String(file.productId) !== "6734821148d4dbfbe0c69c7e"
        );
      }

      if (pendingFiles.length > 0) {
        let toEmails = '';
        let ccEmails = [];
        toEmails = vendor.communicationToMailId ? [vendor.communicationToMailId] : [];
        ccEmails = ['finexe@fincoopers.com'];


        if (toEmails.length > 0) {
          const getEmailTemplate = (title, footerText, subject, pendingFiles) => {
            const casesInfo = pendingFiles.map(
              (caseData) => `
                <tr>
                  <td>${caseData.customerFinId || " "}</td>
                  <td>${caseData.customerFullName ? caseData.customerFullName.toUpperCase() : " "}</td>
                  <td>${caseData.vendors[0].TAT} days</td>
                </tr>`
            ).join("");

            return {
              subject,
              html: `
                <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    h2 { color: #4CAF50; }
                    p { font-size: 14px; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    table, th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background-color: #f2f2f2; text-align: left; }
                    .footer { margin-top: 20px; font-size: 12px; color: #888; }
                    .tat-warning { color: #ff4444; }
                  </style>
                </head>
                <body>
                  <p>Dear Team,</p>
                  <p>${title}</p>
                  <p>Total Cases: ${pendingFiles.length}</p>
                  <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr>
                        <th>FILE NO</th>
                        <th>CUSTOMER NAME</th>
                        <th>PENDING TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${casesInfo}
                    </tbody>
                  </table>
                  <p>${footerText}</p>
                  <div class="footer">
                    <p>Best Regards</p>
                    <p>Team Fin coopers</p>
                  </div>
                </body>
                </html>`
            };
          };

          const emailConfigs = {
            rcu: {
              title: "Please find below the details of RCU files that are currently pending and require your attention. These files have not been completed yet.",
              footerText: "Note: - The files listed above are currently pending and need to be addressed promptly to ensure smooth operations.",
              subject: "Not Complete RCU Files - Action Required"
            },
            rm: {
              title: "Please find below the details of RM files that are currently pending and require your attention. These files have not been completed yet.",
              footerText: "Note: - The files listed above are currently pending and need to be addressed promptly to ensure smooth operations.",
              subject: "Not Complete RM Files - Action Required"
            },
            legal: {
              title: "Please find below the details of Legal files that are currently pending and require your attention. These files have not been completed yet.",
              footerText: "Note: - The files listed above are currently pending and need to be addressed promptly to ensure smooth operations.",
              subject: "Not Complete Legal Files - Action Required"
            },
            technical: {
              title: "Please find below the details of Technical files that are currently pending and require your attention. These files have not been completed yet.",
              footerText: "Note: - The files listed above are currently pending and need to be addressed promptly to ensure smooth operations.",
              subject: "Not Complete Technical Files - Action Required"
            },
            tagging: {
              title: "Please find below the details of Tagging files that are currently pending and require your attention. These files have not been completed yet.",
              footerText: "Note: - The files listed above are currently pending and need to be addressed promptly to ensure smooth operations.",
              subject: "Not Complete Tagging Files - Action Required"
            }
          };

          if (emailConfigs[vendorType]) {
            const { title, footerText, subject } = emailConfigs[vendorType];
            const { html } = getEmailTemplate(title, footerText, subject, pendingFiles);
            await sendEmailByVendor('pendingMailSend', toEmails, ccEmails, subject, html);
            // console.log(`${vendorType.toUpperCase()} MAIL sent successfully.`);
          }
        }
      }
    }
    console.log("Vendor pending mail cron job completed.");
  } catch (error) {
    console.error("Error in :", error);
  }
};



async function getApprovedCibilReports(req, res) {
  try {

    const approvedProcesses = await processModel.find({}).select("customerId");

    if (!approvedProcesses.length) {
      return success(res, "No approved CIBIL reports found", []);
    }
    const customerIds = approvedProcesses.map((process) => process.customerId);
    const cibilReports = await cibilModel.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerData",
        },
      },
      { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantdetailsData",
        },
      },
      { $unwind: { path: "$applicantdetailsData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          customerId: 1,
          customerFinId: "$customerData.customerFinId",
          customerName: "$applicantdetailsData.fullName",
          applicantReports: { $arrayElemAt: ["$applicantFetchHistory.cibilReport", 0] },
          guarantorReports: { $arrayElemAt: ["$guarantorFetchHistory.cibilReport", 0] },
          coApplicantReports: {
            $reduce: {
              input: "$coApplicantData",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.coApplicantFetchHistory.cibilReport"] },
            },
          },
        },
      },
    ]);

    return success(res, "CIBIL reports retrieved successfully", cibilReports);
  } catch (error) {
    console.error("❌ Error fetching CIBIL reports:", error);
    return unknownError(res, error);
  }
}


//  Schedule for 9:00 AM IST (03:30 AM UTC)
cron.schedule("30 12 * * *", async () => {
  const todayCibil = await mailSwitchesModel.findOne();
  if (todayCibil?.masterMailStatus && todayCibil?.cibilMail && todayCibil?.todayCibilQueryMail) {
    await todayCibilQueryMail(true);
  }
});


const todayCibilQueryMail = async (value) => {
  try {
    const cibilFetchDateStart = moment().tz("Asia/Kolkata").startOf("day").format("YYYY-MM-DDT00:00:00 A");
    const cibilFetchDateEnd = moment().tz("Asia/Kolkata").endOf("day").format("YYYY-MM-DDT11:59:59 PM");

    const cibilQueryMail = await processModel.aggregate([
      {
        $match: { statusByCibil: "query" },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: "$customerInfo" },
      {
        $lookup: {
          from: "cibildetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "cibilInfo",
        },
      },
      { $unwind: "$cibilInfo" },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantInfo",
        },
      },
      { $unwind: "$applicantInfo" },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerInfo.branch",
          foreignField: "_id",
          as: "newbranchesInfo",
        },
      },
      { $unwind: "$newbranchesInfo" },

      {
        $match: {
          "cibilInfo.cibilFetchDate": {
            $gte: cibilFetchDateStart,
            $lte: cibilFetchDateEnd,
          },
        },
      },
      {
        $group: {
          _id: "$newbranchesInfo.name",
          queriesCount: { $sum: 1 },
          records: {
            $push: {
              finNo: "$customerInfo.customerFinId",
              fullName: "$applicantInfo.fullName",
              fatherName: "$applicantInfo.fatherName",
              remarkByCibil: "$remarkByCibil",
              cibilFetchDate: "$cibilInfo.cibilFetchDate"
            },
          },
        },
      },

      {
        $sort: { queriesCount: -1 },
      },
      {
        $project: {
          branchName: "$_id",
          queriesCount: 1,
          records: 1,
        },
      },
    ]);

    if (cibilQueryMail.length === 0) {
      console.log("No data found for today's query.");
      return;
    }

    let tableRows = '';
    cibilQueryMail.forEach((branch) => {
      branch.records.forEach((record) => {
        tableRows += ` 
          <tr>
            <td>${record.finNo}</td>
            <td>${branch.branchName}</td>
            <td>${record.fullName}</td>
            <td>${record.fatherName}</td>
            <td>${record.remarkByCibil}</td>
          </tr>
        `;
      });
    });

    const title = "This Caption PD is rejected ... Please find Reject Reason ....";

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h2 { color: #4CAF50; }
          p { font-size: 14px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table, th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; text-align: left; }
          .footer { margin-top: 20px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <p>Dear Team,</p>
        <p>${title}</p>
        <table>
          <tr><th>FILE NO</th><th>BRANCH</th><th>CUSTOMER NAME</th><th>FATHER NAME</th><th>QUERY</th></tr>
          ${tableRows}
        </table>
        <div class="footer">
          <p>Best Regards</p>
          <p>Team Fin coopers</p>
        </div>
      </body>
      </html>
    `;

    let toEmails = "";
    let ccmails = [];

    // Send Email
    await PdEmail(
      toEmails,
      ccmails,
      "Today CIBIL Query Files",
      html
    );

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in Email send:", error);
  }
};



//  Schedule for 9:00 AM IST (03:30 AM UTC)
cron.schedule("30 12 * * *", async () => {
  const todayLogin = await mailSwitchesModel.findOne();
  if (todayLogin?.masterMailStatus && todayLogin?.loginMail && todayLogin?.todayLoginCompleteMail) {
    await todayLoginCompleteMail(true);
  }
});


const todayLoginCompleteMail = async (value) => {
  try {
    const cibilFetchDateStart = moment().tz("Asia/Kolkata").startOf("day").format("YYYY-MM-DDT00:00:00 A");
    const cibilFetchDateEnd = moment().tz("Asia/Kolkata").endOf("day").format("YYYY-MM-DDT11:59:59 PM");

    const cibilQueryMail = await processModel.aggregate([
      {
        $match: {
          // Match salesCompleteDate to today's date
          "salesCompleteDate": {
            $gte: cibilFetchDateStart,
            $lte: cibilFetchDateEnd,
          },
          "statusByCibil": { $in: ["incomplete", "notAssign", "query"] },
          // Match all form-related Boolean fields to true
          "customerFormStart": true,
          "customerFormComplete": true,
          "applicantFormStart": true,
          "applicantFormComplete": true,
          "coApplicantFormStart": true,
          "coApplicantFormComplete": true,
          "guarantorFormStart": true,
          "guarantorFormComplete": true,
        },
      },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: "$customerInfo" },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantInfo",
        },
      },
      { $unwind: "$applicantInfo" },
      {
        $lookup: {
          from: "newbranches",
          localField: "customerInfo.branch",
          foreignField: "_id",
          as: "newbranchesInfo",
        },
      },
      { $unwind: "$newbranchesInfo" },
      {
        $group: {
          _id: "$newbranchesInfo.name",
          queriesCount: { $sum: 1 },
          records: {
            $push: {
              finNo: "$customerInfo.customerFinId",
              fullName: "$applicantInfo.fullName",
              fatherName: "$applicantInfo.fatherName",
            },
          },
        },
      },

      {
        $sort: { queriesCount: -1 },
      },
      {
        $project: {
          branchName: "$_id",
          queriesCount: 1,
          records: 1,
        },
      },
    ]);

    if (cibilQueryMail.length === 0) {
      console.log("No data found for today's query.");
      return;
    }

    let tableRows = '';
    cibilQueryMail.forEach((branch) => {
      branch.records.forEach((record) => {
        tableRows += ` 
          <tr>
            <td>${record.finNo}</td>
            <td>${branch.branchName}</td>
            <td>${record.fullName}</td>
            <td>${record.fatherName}</td>
          </tr>
        `;
      });
    });

    const title = "This Caption PD is rejected ... Please find Reject Reason ....";

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h2 { color: #4CAF50; }
          p { font-size: 14px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table, th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; text-align: left; }
          .footer { margin-top: 20px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <p>Dear Team,</p>
        <p>${title}</p>
        <table>
          <tr><th>FILE NO</th><th>BRANCH</th><th>CUSTOMER NAME</th><th>FATHER NAME</th></tr>
          ${tableRows}
        </table>
        <div class="footer">
          <p>Best Regards</p>
          <p>Team Fin coopers</p>
        </div>
      </body>
      </html>
    `;

    let toEmails = "";
    let ccmails = [];

    // Check if it's production or staging, and adjust email addresses accordingly

    // Send Email
    await PdEmail(
      toEmails,
      ccmails,
      "Today log in complete Files",
      html
    );

    console.log("login complete today mail sent successfully.");
  } catch (error) {
    console.error("Error in Email send:", error);
  }
};



// The main function to check for employees with 0 logins
const todayEmployeeLoginCheckMail = async (value) => {
  try {
    // Get the start and end of the current day in the desired timezone
    const cibilFetchDateStart = moment().tz("Asia/Kolkata").startOf("day").format("YYYY-MM-DDT00:00:00 A");
    const cibilFetchDateEnd = moment().tz("Asia/Kolkata").endOf("day").format("YYYY-MM-DDT11:59:59 PM");

    // Aggregation query to fetch the employees with 0 logins for today
    const loginCheckMail = await processModel.aggregate([
      {
        $match: {
          salesCompleteDate: {
            $gte: cibilFetchDateStart,
            $lte: cibilFetchDateEnd,
          }
        }
      },
      {
        $group: {
          _id: "$employeeId", // Group by employee ID
          MTDLogins: { $sum: { $cond: [{ $gte: ["$salesCompleteDate", cibilFetchDateStart] }, 1, 0] } },
          YTDLogins: { $sum: { $cond: [{ $gte: ["$salesCompleteDate", moment().startOf("year").toISOString()] }, 1, 0] } }
        }
      },
      {
        $match: {
          MTDLogins: { $eq: 0 } // Filter only those with 0 MTD logins
        }
      },
      {
        $project: {
          employeeId: "$_id",
          MTDLogins: 1,
          YTDLogins: 1
        }
      }
    ]);

    // If no employees found with 0 logins
    if (loginCheckMail.length === 0) {
      console.log("No employees with 0 logins found for today.");
      return;
    }

    let tableRows = '';
    loginCheckMail.forEach((employee) => {
      tableRows += ` 
        <tr>
          <td>${employee.employeeId}</td>
          <td>${employee.MTDLogins}</td>
          <td>${employee.YTDLogins}</td>
        </tr>
      `;
    });

    const title = "Employees with 0 Logins Today - Immediate Attention Required";

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h2 { color: #4CAF50; }
          p { font-size: 14px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table, th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; text-align: left; }
          .footer { margin-top: 20px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <p>Dear [State Head's Name],</p>
        <p>${title}</p>
        <table>
          <tr><th>Employee ID</th><th>MTD Logins</th><th>YTD Logins</th></tr>
          ${tableRows}
        </table>
        <div class="footer">
          <p>Best Regards</p>
          <p>Team Fin Coopers</p>
        </div>
      </body>
      </html>
    `;

    let toEmails = "";
    let ccmails = [];

    // Adjust email recipients based on the environment
    if (value) {
      // toEmails = ""; // Specify production email addresses
    } else {
      toEmails = "darshanrajput@fincoopers.in"; // Staging email
    }

    // Send Email with the generated HTML content
    await PdEmail(
      toEmails,
      ccmails,
      "Today: Employees with 0 Logins",
      html
    );

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in sending email:", error);
  }
};



const salespersonWithZeroLogin = async (value) => {
  try {
    const loginCompleteDateStart = moment().tz("Asia/Kolkata").startOf("day").toISOString();
    const loginCompleteDateEnd = moment().tz("Asia/Kolkata").endOf("day").toISOString();
    const monthStart = moment().startOf('month').toISOString();
    const yearStart = moment().startOf('year').toISOString();

    const salesData = await customerModel.aggregate([
      {
        $lookup: {
          from: "processes",
          localField: "_id",
          foreignField: "customerId",
          as: "processData"
        }
      },
      { $unwind: { path: "$processData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "employeId",
          foreignField: "_id",
          as: "employeeInfo"
        }
      },
      { $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true } },


      {
        $lookup: {
          from: "roles",
          localField: "employeeInfo.roleId",
          foreignField: "_id",
          as: "roleInfo"
        }
      },
      { $unwind: { path: "$roleInfo", preserveNullAndEmptyArrays: true } },

      {
        $match: {
          "roleInfo.roleName": "sales",
          "roleInfo.status": "active",
          "employeeInfo.status": "active"
        }
      },

      {
        $lookup: {
          from: "newbranches",
          localField: "branch",
          foreignField: "_id",
          as: "branchInfo"
        }
      },
      { $unwind: { path: "$branchInfo", preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: "$employeeInfo._id",
          branchName: { $first: "$branchInfo.name" },
          salesPersonName: { $first: "$employeeInfo.employeName" },
          salesPersonCode: { $first: "$employeeInfo.employeUniqueId" },
          todayLogins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$processData.salesCompleteDate", loginCompleteDateStart] },
                    { $lte: ["$processData.salesCompleteDate", loginCompleteDateEnd] }
                  ]
                }, 1, 0
              ]
            }
          },
          MTDLogins: {
            $sum: {
              $cond: [{ $gte: ["$processData.salesCompleteDate", monthStart] }, 1, 0]
            }
          },
          YTDLogins: {
            $sum: {
              $cond: [{ $gte: ["$processData.salesCompleteDate", yearStart] }, 1, 0]
            }
          }
        }
      },

      {
        $match: {
          todayLogins: 0,
        }
      },

      {
        $project: {
          branchName: 1,
          salesPersonName: 1,
          salesPersonCode: 1,
          todayLogins: 1,
          MTDLogins: 1,
          YTDLogins: 1
        }
      },

      {
        $sort: {
          MTDLogins: -1,
          YTDLogins: -1,
        }
      }
    ]);



    let toEmails;
    let ccmails = [];

    if (value) {
      toEmails = "";
      ccmails = [];
    } else {
      toEmails = 'darshanrajput@fincoopers.in';
    }

    let title = "Urgent: Action Required for Active Salespersons with 0 Logins by Branch";
    let subject = "Urgent: Action Required for Active Salespersons with 0 Logins by Branch";
    let footerText = "Note: It is vital that we address this issue promptly to ensure that our team is engaged and equipped with the necessary tools and resources.";

    // Create the dynamic table rows for salesData
    const branchInfo = salesData.map((data) => {
      return `
            <tr>
              <td>${data.branchName}</td>
              <td>${data.salesPersonName}</td>
              <td>${data.MTDLogins}</td>
              <td>${data.YTDLogins}</td>
            </tr>
          `;
    }).join('');

    // Compose the HTML email body
    const html = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                h2 { color: #4CAF50; }
                p { font-size: 14px; color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                table, th, td { border: 1px solid #ddd; padding: 8px; }
                th { background-color: #f2f2f2; text-align: left; }
                .footer { margin-top: 20px; font-size: 12px; color: #888; }
              </style>
            </head>
            <body>
              <p>Dear [State Head's Name],</p>
              <p>${title}</p>
              
              <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
                <thead>
                  <tr>
                    <th>Branch Name</th>
                    <th>Sales Person Name</th>
                    <th>MTD Logins</th>
                    <th>YTD Logins</th>
                  </tr>
                </thead>
                <tbody>
                  ${branchInfo}
                </tbody>
              </table>
      
              <p>${footerText}</p>
      
              <div class="footer">
                <p>Best regards,</p>
                <p>Team Fin Coopers</p>
              </div>
            </body>
          </html>
        `;

    // Send the email using your email sending function
    await sendEmailByVendor('salesLoginNotification', toEmails, ccmails, subject, html);

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error in EmailsendPd:", error);
  }
}


// async function sendZeroLeadEmails(req, res) {
//   try {
//     const salesRole = await roleModel.findOne({ roleName: "sales" }).lean();

//     // Get all sales employees
//     const salesEmployees = await employeModel.find({
//       roleId: salesRole._id
//     }).lean();

//     // Create a map of managers and the employees who report to them
//     const managerTeamMap = {};

//     // First, gather all employees under each manager
//     for (const employee of salesEmployees) {
//       if (employee.reportingManagerId) {
//         const managerId = employee.reportingManagerId.toString();
//         if (!managerTeamMap[managerId]) {
//           managerTeamMap[managerId] = [];
//         }
//         managerTeamMap[managerId].push({
//           _id: employee._id,
//           employeName: employee.employeName || "",
//           userName: employee.userName || "",
//           employeUniqueId: employee.employeUniqueId || "",
//           email: employee.email || "" // Adding email field
//         });
//       }
//     }

//     const result = [];
//     const secondManagerMap = {}; // Track second managers and their counts
//     const emailResults = []; // For tracking email status

//     // Process each manager who has team members
//     for (const managerId in managerTeamMap) {
//       const firstManager = await employeModel.findById(managerId).lean();
//       if (!firstManager) {
//         continue;
//       }

//       let secondManager = null;
//       if (firstManager.reportingManagerId) {
//         secondManager = await employeModel.findById(firstManager.reportingManagerId).lean();
//       }

//       // Get team members for this manager
//       const teamMembers = managerTeamMap[managerId];

//       // Check which team members have 0 leads
//       const zeroLeadEmployees = [];
//       for (const member of teamMembers) {
//         // Check if employee has generated any leads
//         const leadsCount = await leadGenerateModel.countDocuments({
//           employeeGenerateId: member._id
//         });

//         if (leadsCount === 0) {
//           zeroLeadEmployees.push({
//             ...member,
//             leadsCount: 0
//           });
//         }
//       }

//       // Second Manager Count Map update
//       if (secondManager) {
//         const secondManagerId = secondManager._id.toString();
//         if (secondManagerMap[secondManagerId]) {
//           secondManagerMap[secondManagerId].count += 1;
//         } else {
//           secondManagerMap[secondManagerId] = {
//             name: secondManager.employeName,
//             count: 1
//           };
//         }
//       }

//       // Add to result for API response
//       result.push({
//         secondManagerName: secondManager ? secondManager.employeName : "",
//         secondManagerId: secondManager ? secondManager._id : null,
//         secondManagerCount: 0, // Will be updated later
//         firstManagerName: firstManager.employeName || "",
//         firstManagerId: firstManager._id || null,
//         firstManagerTeamCount: teamMembers.length, 
//         managerTeam: teamMembers,
//         zeroLeadEmployeesCount: zeroLeadEmployees.length
//       });

//       // Only send email if there are employees with 0 leads
//       if (zeroLeadEmployees.length > 0) {
//         // Send email to first manager about team's zero leads
//         const emailStatus = await sendManagerEmail(
//           firstManager,
//           secondManager,
//           zeroLeadEmployees
//         );

//         emailResults.push({
//           managerName: firstManager.employeName,
//           // emailSent: emailStatus.success,
//           // emailDetails: emailStatus.details
//         });

//         // Send individual emails to each employee with 0 leads
//         for (const employee of zeroLeadEmployees) {
//           const employeeEmailStatus = await sendEmployeeEmail(
//             employee,
//             firstManager,
//             secondManager
//           );

//           emailResults.push({
//             employeeName: employee.employeName,
//             // emailSent: employeeEmailStatus.success,
//             // emailDetails: employeeEmailStatus.details
//           });
//         }
//       }
//     }

//     // Update secondManagerCount
//     const updatedResult = result.map(item => {
//       if (item.secondManagerId && secondManagerMap[item.secondManagerId.toString()]) {
//         item.secondManagerCount = secondManagerMap[item.secondManagerId.toString()].count;
//       }
//       return item;
//     });

//     // return res.status(200).json({ 
//     //   data: updatedResult,
//     //   emailsSent: emailResults
//     // });

//     console.log("Email Results:", emailResults);
//   } catch (error) {
//     console.error("Error:", error);
//     // return res.status(500).json({ message: "Internal server error" });
//   }
// }

// // Function to send email to managers about their team members with 0 leads
// async function sendManagerEmail(firstManager, secondManager, zeroLeadEmployees) {
//   try {
//     // Get email addresses
//     // const toEmail = firstManager.email || "";
//     const toEmail ="darshanrajput@fincoopers.in"
//     // const ccEmail = secondManager ? secondManager.email || "" : "";
//     const ccEmail = [];

//     if (!toEmail) {
//       return 
//     }

//     // Create email subject
//     const subject = `Zero Lead Generation Report - ${firstManager.employeName}'s Team`;

//     // Create email body
//     let emailBody = `
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; }
//         table { border-collapse: collapse; width: 100%; }
//         th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//         th { background-color: #f2f2f2; }
//         .header { background-color: #4CAF50; color: white; padding: 10px; }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <h2>Zero Lead Generation Report</h2>
//       </div>
//       <p>Dear ${firstManager.employeName},</p>
//       <p>The following team members have not generated any leads:</p>

//       <table>
//         <tr>
//           <th>Employee ID</th>
//           <th>Name</th>
//           <th>Username</th>
//           <th>Lead Count</th>
//         </tr>
//     `;

//     // Add each employee to the table
//     for (const employee of zeroLeadEmployees) {
//       emailBody += `
//         <tr>
//           <td>${employee.employeUniqueId || ""}</td>
//           <td>${employee.employeName || ""}</td>
//           <td>${employee.userName || ""}</td>
//           <td>0</td>
//         </tr>
//       `;
//     }

//     // Close the table and email
//     emailBody += `
//       </table>

//       <p>Please follow up with these team members to improve lead generation.</p>

//       <p>Best regards,<br>Management Team</p>
//     </body>
//     </html>
//     `;

//     const emailSent = await leadMailFunction({
//       to: toEmail,
//       cc: ccEmail,
//       subject: subject,
//       html: emailBody,
//     });


//     console.log( "Email sent successfully" );
//   } catch (error) {
//     console.error("Error sending manager email:", error);
//   }
// }

// async function sendEmployeeEmail(employee, firstManager, secondManager) {
//   try {
//     const toEmail = employee.email || "";
//     // const toEmail = "darshanrajput@fincoopers.in"
//     const ccEmails = [];

//     // if (firstManager && firstManager.email) {
//     //   ccEmails.push(firstManager.email);
//     // }

//     // if (secondManager && secondManager.email) {
//     //   ccEmails.push(secondManager.email);
//     // }

//     if (!toEmail) {
//       return 
//     }

//     // Create email subject
//     const subject = `Action Required: Zero Lead Generation Alert`;

//     // Create email body
//     const emailBody = `
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; }
//         .header { background-color: #e74c3c; color: white; padding: 10px; }
//         .content { padding: 15px; }
//         .footer { padding: 15px; font-size: 12px; color: #777; }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <h2>Zero Lead Generation Alert</h2>
//       </div>

//       <div class="content">
//         <p>Dear ${employee.employeName},</p>

//         <p>Our records indicate that you have not generated any leads recently.</p>

//         <p>Lead generation is a critical aspect of our sales process and is monitored regularly. 
//         Please prioritize this activity to meet your targets.</p>

//         <p>If you are facing any challenges or need support, please reach out to your manager 
//         ${firstManager.employeName} for guidance.</p>

//         <p><strong>Action Required:</strong> Please start generating leads immediately and update the system accordingly.</p>

//         <p>Best regards,<br>Management Team</p>
//       </div>

//       <div class="footer">
//         <p>This is an automated email. Please do not reply directly to this message.</p>
//       </div>
//     </body>
//     </html>
//     `;

//     // console.log("Sending email to:---", toEmail , ccEmails);
//     const emailSent = await leadMailFunction({
//       to: toEmail,
//       cc: ccEmails.join(','),
//       subject: subject,
//       html: emailBody,
//       undefined,
//     });

//     console.log("Email sent successfully");
//   } catch (error) {
//     console.error("Error sending employee email:", error);
//   }
// }






// console.log("Cibil Pending Mail Send  at 9:30 AM.");
cron.schedule("00 4 * * *", async () => {
  const cibilPending = await mailSwitchesModel.findOne();
  if (cibilPending?.masterMailStatus && cibilPending?.cibilMail && cibilPending?.checkCibilPendingFileMailSendMorning) {
    await checkCibilPendingFileMailSend();
  }
});


// console.log("Cibil Pending Mail Send at 6:00 PM.");
cron.schedule("30 12 * * *", async () => {
  const cibilPending = await mailSwitchesModel.findOne();
  if (cibilPending?.masterMailStatus && cibilPending?.cibilMail && cibilPending?.checkCibilPendingFileMailSendAfternoon) {
    await checkCibilPendingFileMailSend();
  }
});



async function checkCibilPendingFileMailSend() {
  try {
    // const employee = await employeeModel.findOne({ userName: userName });

    // if (!employee) {
    //   return
    //   // return badRequest(res, "Employee not found with the provided userName");
    // }
    // const cibilId = employee._id;

    const matchConditions = {
      // cibilId: { $in: [new ObjectId(cibilId), null] },
      statusByCibil: { $in: ["incomplete", "pending", "notAssign"] },
      customerFormComplete: true,
      applicantFormStart: true,
      applicantFormComplete: true,
      coApplicantFormStart: true,
      coApplicantFormComplete: true,
      guarantorFormStart: true,
      guarantorFormComplete: true,
    };

    // Aggregate to match process data and join with customer and applicant data
    const processData = await processModel.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetail",
        },
      },
      { $unwind: "$customerDetail" },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerId",
          foreignField: "customerId",
          as: "applicantDetail",
        },
      },
      { $unwind: "$applicantDetail" },
      {
        $project: {
          customerId: 1,
          statusByCibil: 1,
          applicantFormStart: 1,
          coApplicantFormStart: 1,
          salesCaseDetailFormStart: 1,
          customerFinId: "$customerDetail.customerFinId",
          applicantName: "$applicantDetail.fullName",
        },
      },
    ]);

    // Count total cases and gather details
    const totalCases = processData.length;
    const casesInfo = processData.map(
      (caseData) => `
        <tr>
          <td>${caseData.customerFinId ? caseData.customerFinId.toUpperCase() : " "}</td>
          <td>${caseData.applicantName ? caseData.applicantName.toUpperCase() : ""}</td>
        </tr>`
    ).join(""); // Join to create a single string of all rows

    // Prepare the email content with a single table containing all cases
    const subject = "Login Done Cases Cibil Pending";
    const htmlContent = `
      <p>Dear Team,</p>
      <p>Login Done :Please find below list of cibil pending cases request you to clear this as soon as possible.</p>
      <p>Total Cases: ${totalCases}</p>
      <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>FILE NO</th>
            <th>CUSTOMER NAME</th>
          </tr>
        </thead>
        <tbody>
          ${casesInfo}
        </tbody>
      </table>
    `;
    // Send email
    const userEmail = "minalkushwah@fincoopers.in";
    const ccEmails = ["ketavpipaliya@fincoopers.in", "arjunsinghthakur@fincoopers.in", "anilmalviya@fincoopers.in", "rishikakhande@fincoopers.in"];
    const emailSent = await sendEmailByVendor("cibilPendingFile", ccEmails, userEmail, subject, htmlContent);

    if (emailSent) {
      console.log("Email sent successfully!");
      // return success(res, "mail send")
    } else {
      console.log("Failed to send email.");
    }
  } catch (error) {
    console.error("Error fetching or sending data:", error);
  }
}





// 1. Function to send emails to employees with 0 leads today
async function sendEmployeeZeroLeadEmails() {
  try {
    console.log("Starting employee zero lead email job at:", new Date().toISOString());

    const salesRole = await roleModel.findOne({ roleName: "sales" }).lean();
    if (!salesRole) {
      console.log("Sales role not found");
      return { success: false, message: "Sales role not found" };
    }

    // Get all sales employees
    const salesEmployees = await employeModel.find({
      roleId: salesRole._id
    }).lean();

    if (salesEmployees.length === 0) {
      console.log("No sales employees found");
      return { success: false, message: "No sales employees found" };
    }

    const emailResults = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check each employee individually
    for (const employee of salesEmployees) {
      // Skip if no reporting manager
      if (!employee.reportingManagerId) {
        continue;
      }

      // Get employee's first manager
      const firstManager = await employeModel.findById(employee.reportingManagerId).lean();
      if (!firstManager) {
        continue;
      }

      // Get second manager if exists
      let secondManager = null;
      if (firstManager.reportingManagerId) {
        secondManager = await employeModel.findById(firstManager.reportingManagerId).lean();
      }

      // Check if employee has generated any leads TODAY
      const leadsCount = await leadGenerateModel.countDocuments({
        employeeGenerateId: employee._id,
        createdAt: { $gte: today }
      });

      // If no leads generated today, send an email
      if (leadsCount === 0) {
        const emailStatus = await sendEmployeeEmail(
          employee,
          firstManager,
          secondManager
        );

        emailResults.push({
          employeeName: employee.employeName,
          emailSent: emailStatus.success,
          emailDetails: emailStatus.details
        });
      }
    }

    console.log("Employee zero lead email job completed at:", new Date().toISOString());
    console.log("Email Results:", emailResults);
    return { success: true, emailResults };
  } catch (error) {
    console.error("Error in employee zero lead email job:", error);
    return { success: false, message: error.message };
  }
}

// Individual employee email function
async function sendEmployeeEmail(employee, firstManager, secondManager) {
  try {
    const toEmail = employee.email || "";
    // const toEmail = "darshanrajput@fincoopers.in"
    const ccEmails = [];

    if (!toEmail) {
      return { success: false, details: "No recipient email provided" };
    }

    // Create email subject
    const subject = `Action Required: Zero Lead Generation Alert`;

    // Create email body
    const emailBody = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #e74c3c; color: white; padding: 1px; }
        .content { padding: 15px; }
        .footer { padding: 15px; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Zero Lead Generation Alert</h2>
      </div>
      
      <div class="content">
        <p>Dear <b>${employee.employeName}</b>,</p>
        
        <p>Our records indicate that you have not generated any leads today.</p>
        
        <p>Lead generation is a critical aspect of our sales process and is monitored daily. 
        Please prioritize this activity to meet your targets.</p>
        
        <p>If you are facing any challenges or need support, please reach out to your manager 
        <b>${firstManager ? firstManager.employeName : ""}</b> for guidance.</p>
        
        <p><strong>Action Required:</strong> Please start generating leads immediately and update the system accordingly.</p>
        
        <p>Best regards,<br>Management Team</p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply directly to this message.</p>
      </div>
    </body>
    </html>
    `;

    const emailSent = await leadMailFunction({
      to: toEmail,
      cc: ccEmails,
      subject: subject,
      html: emailBody
    });

    return { success: emailSent, details: "Email sent to employee" };
  } catch (error) {
    console.error("Error sending employee email:", error);
    return { success: false, details: error.message };
  }
}

// 2. Function to send manager summary emails
// async function sendManagerZeroLeadSummary() {
//   try {
//     console.log("Starting manager zero lead summary email job at:", new Date().toISOString());

//     const salesRole = await roleModel.findOne({ roleName: "sales" }).lean();
//     if (!salesRole) {
//       console.log("Sales role not found");
//       return { success: false, message: "Sales role not found" };
//     }

//     // Get all sales employees
//     const salesEmployees = await employeModel.find({
//       roleId: salesRole._id
//     }).lean();

//     if (salesEmployees.length === 0) {
//       console.log("No sales employees found");
//       return { success: false, message: "No sales employees found" };
//     }

//     // Create a map of managers and the employees who report to them
//     const managerTeamMap = {};

//     // First, gather all employees under each manager
//     for (const employee of salesEmployees) {
//       if (employee.reportingManagerId) {
//         const managerId = employee.reportingManagerId.toString();
//         if (!managerTeamMap[managerId]) {
//           managerTeamMap[managerId] = [];
//         }
//         managerTeamMap[managerId].push({
//           _id: employee._id,
//           employeName: employee.employeName || "",
//           userName: employee.userName || "",
//           employeUniqueId: employee.employeUniqueId || "",
//           email: employee.email || "",
//           branchId: employee.branchId || null
//         });
//       }
//     }

//     const emailResults = [];
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Process each manager who has team members
//     for (const managerId in managerTeamMap) {
//       const firstManager = await employeModel.findById(managerId).lean();
//       if (!firstManager) {
//         continue;
//       }

//       let secondManager = null;
//       if (firstManager.reportingManagerId) {
//         secondManager = await employeModel.findById(firstManager.reportingManagerId).lean();
//       }

//       // Get team members for this manager
//       const teamMembers = managerTeamMap[managerId];

//       // Check which team members have 0 leads TODAY and group by branch
//       const zeroLeadEmployees = [];
//       const branchMap = {};

//       for (const member of teamMembers) {
//         // Check if employee has generated any leads TODAY
//         const leadsCount = await leadGenerateModel.countDocuments({
//           employeeGenerateId: member._id,
//           createdAt: { $gte: today }
//         });

//         if (leadsCount === 0) {
//           zeroLeadEmployees.push({
//             ...member,
//             leadsCount: 0
//           });

//           // Group by branch
//           if (member.branchId) {
//             const branchId = member.branchId.toString();
//             if (!branchMap[branchId]) {
//               // Fetch branch name
//               const branch = await newBranchModel.findById(branchId).lean();
//               branchMap[branchId] = {
//                 branchName: branch ? branch.name : "",
//                 employees: []
//               };
//             }
//             branchMap[branchId].employees.push(member);
//           }
//         }
//       }

//       // Only send email if there are employees with 0 leads
//       if (zeroLeadEmployees.length > 0) {
//         // Send email to first manager with branch-wise breakdown

//         const emailStatus = await sendManagerSummaryEmail(
//           firstManager,
//           secondManager,
//           zeroLeadEmployees,
//           branchMap
//         );

//         emailResults.push({
//           managerName: firstManager.employeName,
//           emailSent: emailStatus.success,
//           emailDetails: emailStatus.details
//         });
//       }
//     }

//     console.log("Manager zero lead summary email job completed at:", new Date().toISOString());
//     console.log("Email Results:", emailResults);
//     return { success: true, emailResults };
//   } catch (error) {
//     console.error("Error in manager zero lead summary email job:", error);
//     return { success: false, message: error.message };
//   }
// }

// // Manager summary email function
// async function sendManagerSummaryEmail(firstManager, secondManager, zeroLeadEmployees, branchMap) {
//   try {
//     const toEmail = firstManager.email || "";
//     const ccEmail = secondManager ? secondManager.email || "" : "";

//     if (!toEmail) {
//       return { success: false, details: "No recipient email provided" };
//     }

//     // Create email subject
//     const subject = `Zero Lead Generation Report - ${firstManager.employeName}'s Team`;

//     // Create email body
//     let emailBody = `
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; }
//         table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
//         th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//         th { background-color: #f2f2f2; }
//         .header { background-color:rgb(251, 141, 135); color: white; padding: 1px; }
//         .branch-header { background-color:rgb(220, 185, 129); color: white; padding: 1px; margin-top: 10px; }
//         </style>
//         </head>
//         <body>
//         <div class="header">
//         <h2>Zero Lead Generation Report</h2>
//         </div>
//         <p>Dear ${firstManager.employeName},</p>
//         <p>The following team members have not generated any leads today:</p>
//         <h3>Branch-wise Breakdown:</h3>
//     `;

//     for (const branchId in branchMap) {
//       const branch = branchMap[branchId];

//       emailBody += `
//         <div class="branch-header">
//           <h4>${branch.branchName} (${branch.employees.length} employees with 0 leads)</h4>
//         </div>

//         <table>
//           <tr>
//             <th>Employee ID</th>
//             <th>Name</th>
//             <th>Username</th>
//           </tr>
//       `;

//       for (const employee of branch.employees) {
//         emailBody += `
//           <tr>
//             <td>${employee.employeUniqueId || ""}</td>
//             <td>${employee.employeName || ""}</td>
//             <td>${employee.userName || ""}</td>
//           </tr>
//         `;
//       }

//       emailBody += `
//         </table>
//       `;
//     }

//     // Close the email
//     emailBody += `
//       <p>Please follow up with these team members to improve lead generation.</p>
//       <p>Best regards,<br>Management Team</p>
//     </body>
//     </html>
//     `;

//     const emailSent = await leadMailFunction({
//       to: toEmail,
//       cc: ccEmail,
//       subject: subject,
//       html: emailBody,
//     });

//     return { success: emailSent, details: "Email sent to manager" };
//   } catch (error) {
//     console.error("Error sending manager summary email:", error);
//     return { success: false, details: error.message };
//   }
// }



async function sendManagerZeroLeadSummary() {
  try {
    console.log("Starting manager lead summary email job at:", new Date().toISOString());

    const salesRole = await roleModel.findOne({ roleName: "sales" }).lean();
    if (!salesRole) {
      console.log("Sales role not found");
      return { success: false, message: "Sales role not found" };
    }

    // Get all sales employees
    const salesEmployees = await employeModel.find({
      roleId: salesRole._id
    }).lean();

    if (salesEmployees.length === 0) {
      console.log("No sales employees found");
      return { success: false, message: "No sales employees found" };
    }

    // Create a map of managers and the employees who report to them
    const managerTeamMap = {};

    // First, gather all employees under each manager
    for (const employee of salesEmployees) {
      if (employee.reportingManagerId) {
        const managerId = employee.reportingManagerId.toString();
        if (!managerTeamMap[managerId]) {
          managerTeamMap[managerId] = [];
        }
        managerTeamMap[managerId].push({
          _id: employee._id,
          employeName: employee.employeName || "",
          userName: employee.userName || "",
          employeUniqueId: employee.employeUniqueId || "",
          email: employee.email || "",
          branchId: employee.branchId || null
        });
      }
    }

    const emailResults = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process each manager who has team members
    for (const managerId in managerTeamMap) {
      const firstManager = await employeModel.findById(managerId).lean();
      if (!firstManager) {
        continue;
      }

      let secondManager = null;
      if (firstManager.reportingManagerId) {
        secondManager = await employeModel.findById(firstManager.reportingManagerId).lean();
      }

      // Get team members for this manager
      const teamMembers = managerTeamMap[managerId];

      // Get lead counts for all team members and group by branch
      const employeeLeadData = [];
      const branchMap = {};
      let totalZeroLeadCount = 0;

      for (const member of teamMembers) {
        // Check how many leads employee has generated TODAY
        const leadsCount = await leadGenerateModel.countDocuments({
          employeeGenerateId: member._id,
          createdAt: { $gte: today }
        });

        // Add to employee lead data
        employeeLeadData.push({
          ...member,
          leadsCount: leadsCount
        });

        // Count zero lead employees
        if (leadsCount === 0) {
          totalZeroLeadCount++;
        }

        // Group by branch
        if (member.branchId) {
          const branchId = member.branchId.toString();
          if (!branchMap[branchId]) {
            // Fetch branch name
            const branch = await newBranchModel.findById(branchId).lean();
            branchMap[branchId] = {
              branchName: branch ? branch.name : "",
              employees: [],
              zeroLeadCount: 0,
              totalLeadsGenerated: 0
            };
          }
          branchMap[branchId].employees.push({
            ...member,
            leadsCount: leadsCount
          });

          // Update branch statistics
          if (leadsCount === 0) {
            branchMap[branchId].zeroLeadCount++;
          }
          branchMap[branchId].totalLeadsGenerated += leadsCount;
        }
      }

      // Always send email with team lead generation summary
      const emailStatus = await sendManagerSummaryEmail(
        firstManager,
        secondManager,
        employeeLeadData,
        branchMap,
        totalZeroLeadCount
      );

      emailResults.push({
        managerName: firstManager.employeName,
        emailSent: emailStatus.success,
        emailDetails: emailStatus.details
      });
    }

    console.log("Manager lead summary email job completed at:", new Date().toISOString());
    console.log("Email Results:", emailResults);
    return { success: true, emailResults };
  } catch (error) {
    console.error("Error in manager lead summary email job:", error);
    return { success: false, message: error.message };
  }
}

// Updated Manager summary email function
async function sendManagerSummaryEmail(firstManager, secondManager, employeeLeadData, branchMap, totalZeroLeadCount) {
  try {
    const toEmail = firstManager.email || "";
    const ccEmail = secondManager ? secondManager.email || "" : "";


    if (!toEmail) {
      return { success: false, details: "No recipient email provided" };
    }

    // Calculate total team statistics
    const totalEmployees = employeeLeadData.length;
    const totalLeadsGenerated = employeeLeadData.reduce((sum, emp) => sum + emp.leadsCount, 0);

    // Create email subject
    const subject = `Lead Generation Report - ${firstManager.employeName}'s Team`;

    // Create email body
    // let emailBody = `
    // <html>
    // <head>
    //   <style>
    //     body { font-family: Arial, sans-serif; }
    //     table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    //     th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    //     th { background-color: #f2f2f2; }
    //     .header { background-color:rgb(251, 141, 135); color: white; padding: 1px; }
    //     .branch-header { background-color:rgb(220, 185, 129); color: white; padding: 1px; margin-top: 10px; }
    //     .summary-table { width: 50%; margin-bottom: 20px; }
    //     .zero-leads { color: red; font-weight: bold; }
    //     .good-leads { color: green; font-weight: bold; }
    //   </style>
    // </head>
    // <body>
    //   <div class="header">
    //     <h2>Lead Generation Report</h2>
    //   </div>
    //   <p>Dear ${firstManager.employeName},</p>

    //   <h3>Team Summary:</h3>
    //   <table class="summary-table">
    //     <tr>
    //       <th>Total Team Members</th>
    //       <td>${totalEmployees}</td>
    //     </tr>
    //     <tr>
    //       <th>Team Members with 0 Leads</th>
    //       <td class="zero-leads">${totalZeroLeadCount}</td>
    //     </tr>
    //     <tr>
    //       <th>Total Leads Generated Today</th>
    //       <td class="good-leads">${totalLeadsGenerated}</td>
    //     </tr>
    //   </table>

    //   <h3>Branch-wise Breakdown:</h3>
    // `;


    let emailBody = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { background-color:rgb(251, 141, 135); color: white; padding: 1px; }
            .branch-header { background-color:rgb(220, 185, 129); color: white; padding: 1px; margin-top: 10px; }
            </style>
            </head>
            <body>
            <div class="header">
            <h2>Zero Lead Generation Report</h2>
            </div>
            <p>Dear ${firstManager.employeName},</p>
            <p>The following team members have not generated any leads today:</p>
            <p>Total lead generate ${totalLeadsGenerated}</P>
            <h3>Branch-wise Breakdown:</h3>
        `;

    for (const branchId in branchMap) {
      const branch = branchMap[branchId];

      emailBody += `
            <div class="branch-header">
              <h4>${branch.branchName} (${branch.employees.length} employees with 0 leads)</h4>
            </div>
            
            <table>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Username</th>
              </tr>
          `;

      for (const employee of branch.employees) {
        emailBody += `
              <tr>
                <td>${employee.employeUniqueId || ""}</td>
                <td>${employee.employeName || ""}</td>
                <td>${employee.userName || ""}</td>
              </tr>
            `;
      }

      emailBody += `
            </table>
          `;
    }

    // Close the email
    emailBody += `
          <p>Please follow up with these team members to improve lead generation.</p>
          <p>Best regards,<br>Management Team</p>
        </body>
        </html>
    `;

    const emailSent = await leadMailFunction({
      to: toEmail,
      cc: ccEmail,
      subject: subject,
      html: emailBody,
    });

    return { success: emailSent, details: "Email sent to manager" };
  } catch (error) {
    console.error("Error sending manager summary email:", error);
    return { success: false, details: error.message };
  }
}


cron.schedule('30 05 * * *', async () => {
  console.log('Running Employee Zero Lead Email Task at 10:00 AM');
  const zeroLeadEmployeeMail = await mailSwitchesModel.findOne();
  if (zeroLeadEmployeeMail?.masterMailStatus && zeroLeadEmployeeMail?.leadMail && zeroLeadEmployeeMail?.zeroleadEmployeeMailMorning) {
    await sendEmployeeZeroLeadEmails();
  }
});

cron.schedule('30 11 * * *', async () => {
  console.log('Running Employee Zero Lead Email Task at 10:00 AM');
  const zeroLeadEmployeeMail = await mailSwitchesModel.findOne();
  if (zeroLeadEmployeeMail?.masterMailStatus && zeroLeadEmployeeMail?.leadMail && zeroLeadEmployeeMail?.zeroleadEmployeeMailAfternoon) {
    await sendEmployeeZeroLeadEmails();
  }
});

cron.schedule('30 05 * * *', async () => {
  console.log('Running Manager Zero Lead Summary Email Task at 10:15 AM');
  const zeroLeadmanager = await mailSwitchesModel.findOne();
  if (zeroLeadmanager?.masterMailStatus && zeroLeadmanager?.leadMail && zeroLeadmanager?.zeroleadmanagerMailMorning) {
    const result = await sendManagerZeroLeadSummary();
    console.log('Employee Zero Lead Email Task Result:', result);
  }
});

cron.schedule('30 11 * * *', async () => {
  console.log('Running Manager Zero Lead Summary Email Task at 10:15 AM');
  const zeroLeadmanager = await mailSwitchesModel.findOne();
  if (zeroLeadmanager?.masterMailStatus && zeroLeadmanager?.leadMail && zeroLeadmanager?.zeroleadmanagerMailAfternoon) {
    const result = await sendManagerZeroLeadSummary();
    console.log('Employee Zero Lead Email Task Result:', result);
  }
});


//-/-/-----------------------------------------------------------------------------------------------------------------------------------/-/-/-

// Function to send warning emails to employees who haven't generated leads or logged in for 3 days
async function sendEmployeeWarningEmails() {
  try {
    console.log("Starting employee warning email job at:", new Date().toISOString());

    const salesRole = await roleModel.findOne({ roleName: "sales" }).lean();
    if (!salesRole) {
      console.log("Sales role not found");
      return { success: false, message: "Sales role not found" };
    }

    // Get all sales employees
    const salesEmployees = await employeModel.find({
      roleId: salesRole._id
    }).lean();

    if (salesEmployees.length === 0) {
      console.log("No sales employees found");
      return { success: false, message: "No sales employees found" };
    }

    const emailResults = [];

    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    // Check each employee individually
    for (const employee of salesEmployees) {
      // Skip if no reporting manager
      if (!employee.reportingManagerId) {
        continue;
      }

      // Get employee's first manager
      const firstManager = await employeModel.findById(employee.reportingManagerId).lean();
      if (!firstManager) {
        continue;
      }

      // Get second manager if exists
      let secondManager = null;
      if (firstManager.reportingManagerId) {
        secondManager = await employeModel.findById(firstManager.reportingManagerId).lean();
      }

      // Check if employee has generated any leads in the past 3 days
      const leadsCount = await leadGenerateModel.countDocuments({
        employeeGenerateId: employee._id,
        createdAt: { $gte: threeDaysAgo }
      });

      // Check employee's last login time
      const lastLogin = employee.lastLoginTime || null;
      const hasRecentLogin = lastLogin && new Date(lastLogin) >= threeDaysAgo;

      // If no leads generated AND no login in past 3 days, send a warning email
      if (leadsCount === 0 && !hasRecentLogin) {
        // Get the exact number of days since last login for the email
        let daysSinceLastLogin = "more than 3 days";
        if (lastLogin) {
          const diffTime = Math.abs(new Date() - new Date(lastLogin));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysSinceLastLogin = `${diffDays} days`;
        }

        const emailStatus = await sendEmployeeWarningEmail(
          employee,
          firstManager,
          secondManager,
          daysSinceLastLogin
        );

        emailResults.push({
          employeeName: employee.employeName,
          emailSent: emailStatus.success,
          emailDetails: emailStatus.details,
          reason: "No leads and no login in past 3 days"
        });
      }
    }

    console.log("Employee warning email job completed at:", new Date().toISOString());
    console.log("Email Results:", emailResults);
    return { success: true, emailResults };
  } catch (error) {
    console.error("Error in employee warning email job:", error);
    return { success: false, message: error.message };
  }
}

// Individual employee warning email function
async function sendEmployeeWarningEmail(employee, firstManager, secondManager, daysSinceLastLogin) {
  try {
    // const toEmail = employee.email || "";
    const toEmail = "darshanrajput@fincoopers.in"
    const ccEmails = [];

    // Add managers to CC
    if (firstManager && firstManager.email) {
      ccEmails.push(firstManager.email);
    }

    if (secondManager && secondManager.email) {
      ccEmails.push(secondManager.email);
    }

    if (!toEmail) {
      return { success: false, details: "No recipient email provided" };
    }

    // Create email subject
    const subject = `URGENT: Inactivity Warning - Action Required`;

    // Create email body
    const emailBody = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #e74c3c; color: white; padding: 10px; }
        .warning-box { border: 2px solid #e74c3c; padding: 15px; margin: 15px 0; background-color: #fadbd8; }
        .content { padding: 15px; }
        .footer { padding: 15px; font-size: 12px; color: #777; border-top: 1px solid #eee; }
        .action-steps { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>⚠️ URGENT: Employee Inactivity Warning ⚠️</h2>
      </div>
      
      <div class="content">
        <p>Dear <b>${employee.employeName}</b>,</p>
        
        <div class="warning-box">
          <p><strong>This is an urgent notice regarding your inactivity.</strong></p>
          <p>Our records indicate that you have not:</p>
          <ul>
            <li><strong>Generated any leads in the past 3 days</strong></li>
            <li><strong>Logged into the system for ${daysSinceLastLogin}</strong></li>
          </ul>
        </div>
        
        <p>This level of inactivity is concerning and requires your immediate attention. 
        Regular lead generation and system logins are essential parts of your role and responsibilities.</p>
        
        <p>Your manager, <b>${firstManager ? firstManager.employeName : ""}</b>, has been notified of this extended inactivity.</p>
        
        <div class="action-steps">
          <h3>Required Actions:</h3>
          <ol>
            <li>Log into the system <strong>immediately</strong> upon receiving this email</li>
            <li>Contact your manager to explain your absence</li>
            <li>Begin generating leads today</li>
            <li>Schedule a meeting with your manager to discuss your work plan</li>
          </ol>
        </div>
        
        <p>Please note that continued inactivity without proper explanation may result in further administrative action.</p>
        
        <p>If you are experiencing technical difficulties or other issues preventing you from performing your duties, 
        please reach out to your manager or IT support immediately.</p>
        
        <p>Best regards,<br>Management Team</p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please contact your manager directly with any questions or concerns.</p>
      </div>
    </body>
    </html>
    `;

    const emailSent = await leadMailFunction({
      to: toEmail,
      cc: ccEmails,
      subject: subject,
      html: emailBody
    });

    return { success: emailSent, details: "Warning email sent to employee and managers" };
  } catch (error) {
    console.error("Error sending employee warning email:", error);
    return { success: false, details: error.message };
  }
}

cron.schedule('30 05 * * *', async () => {
  console.log('Running Manager Zero Lead Summary Email Task at 10:15 AM');
  const threeDaysZeroLead = await mailSwitchesModel.findOne();
  if (threeDaysZeroLead?.masterMailStatus && threeDaysZeroLead?.leadMail && threeDaysZeroLead?.threeDaysZeroLeadMailMorning) {
    await sendEmployeeWarningEmails();
  }
});



async function loginPaymentstatueMorning(days = 1) {
  const startDate = dayjs().subtract(days, "day").startOf("day").toDate();
  const endDate = dayjs().endOf("day").toDate();

  const allCustomers = await customerModel.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .populate("employeId", "employeName")
    .populate("branch", "name")
    .lean();

  const paymentDone = [];
  const paymentNotDone = [];

  for (const customer of allCustomers) {
    let isPaid = false;

    if (
      customer.paymentStatus === "success" &&
      customer.PaymentGateway === "noLoginFees"
    ) {
      const process = await processModel.findOne({
        customerId: customer._id,
        "customerFormStart": true,
        "customerFormComplete": true
      });

      if (process) {
        isPaid = true;
      }
    }

    const entry = {
      customerFinId: customer.customerFinId || "",
      fullName: customer.fullName || "",
      employeName: customer.employeId?.employeName || "",
      branchName: customer.branch?.name || ""
    };

    if (isPaid) {
      paymentDone.push(entry);
    } else {
      paymentNotDone.push(entry);
    }
  }

  return {
    totalFiles: allCustomers.length,
    paymentDoneCount: paymentDone.length,
    paymentNotDoneCount: paymentNotDone.length,
    paymentDoneList: paymentDone,
    paymentNotDoneList: paymentNotDone
  };
}

cron.schedule('30 05 * * *', async () => {
  const sendDailyLoginPayment = await mailSwitchesModel.findOne();
  if (sendDailyLoginPayment?.masterMailStatus && sendDailyLoginPayment?.leadMail && sendDailyLoginPayment?.loginPaymentstatueMorning) {
    await loginPaymentstatueMorning();
  }
});






async function checkEmployeeLoginCreationStatus() {
  try {
    console.log("Starting employee login creation check at:", new Date().toISOString());

    const salesRole = await roleModel.findOne({ roleName: "sales" }).lean();
    if (!salesRole) {
      console.log("Sales role not found");
      return { success: false, message: "Sales role not found" };
    }

    // Get all sales employees
    const salesEmployees = await employeModel.find({
      roleId: salesRole._id
    }).lean();

    if (salesEmployees.length === 0) {
      console.log("No sales employees found");
      return { success: false, message: "No sales employees found" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = [];
    const employeesWithNoLogin = [];
    let totalLoginsCreated = 0;
    let totalSuccessfulPayments = 0;
    let totalNoLoginFees = 0;

    // Check each employee
    for (const employee of salesEmployees) {
      // Check if employee punched in today
      const punchedToday = await attendanceModel.findOne({
        employeId: employee._id,
        createdAt: { $gte: today }
      }).lean();

      if (punchedToday) {
        // Employee punched in, now check their login creations
        const loginCreations = await customerModel.find({
          employeId: employee._id,
          createdAt: { $gte: today }
        }).lean();

        // Count payment statuses
        let successCount = 0;
        let noLoginFeesCount = 0;
        let otherStatusCount = 0;

        loginCreations.forEach(login => {
          if (login.paymentStatus === "success") {
            successCount++;
            totalSuccessfulPayments++;
          } else if (login.paymentStatus === "noLogInFees") {
            noLoginFeesCount++;
            totalNoLoginFees++;
          } else {
            otherStatusCount++;
          }
        });

        totalLoginsCreated += loginCreations.length;

        // Get branch name if available
        let branchName = "";
        if (employee.branchId) {
          const branch = await newBranchModel.findById(employee.branchId).lean();
          branchName = branch ? branch.name : "";
        }

        const employeeResult = {
          employeeName: employee.employeName,
          employeeId: employee.employeUniqueId,
          branchName: branchName,
          punchedIn: true,
          totalLoginsCreated: loginCreations.length,
          successfulPayments: successCount,
          noLoginFees: noLoginFeesCount,
          otherStatus: otherStatusCount
        };

        results.push(employeeResult);

        // If employee punched in but created no logins, add to the list
        if (loginCreations.length === 0) {
          employeesWithNoLogin.push({
            employeeName: employee.employeName,
            employeeId: employee.employeUniqueId,
            branchName: branchName,
            firstManager: employee.reportingManagerId ?
              (await employeModel.findById(employee.reportingManagerId).lean())?.employeName : ""
          });
        }
      }
    }

    console.log("Employee login creation check completed at:", new Date().toISOString());

    return {
      success: true,
      summary: {
        totalEmployeesChecked: salesEmployees.length,
        totalEmployeesPunchedIn: results.length,
        totalLoginsCreated: totalLoginsCreated,
        totalSuccessfulPayments: totalSuccessfulPayments,
        totalNoLoginFees: totalNoLoginFees
      },
      employeeResults: results,
      employeesWithNoLogin: employeesWithNoLogin
    };
  } catch (error) {
    console.error("Error in employee login creation check:", error);
    return { success: false, message: error.message };
  }
}

// Function to send summary email of login creation status
async function sendLoginCreationSummaryEmail() {
  try {
    const loginStatus = await checkEmployeeLoginCreationStatus();

    if (!loginStatus.success) {
      console.error("Failed to get login creation status");
      return { success: false, message: "Failed to get login creation status" };
    }

    // Get admin emails or specific managers
    const adminEmails = ["darshanrajput@fincoopers.in"]; // Replace with actual admin emails

    // Create email subject
    const subject = `Login Creation Summary Report - ${new Date().toLocaleDateString()}`;

    // Create email body
    let emailBody = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #3498db; color: white; padding: 10px; }
        .summary-box { background-color: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .content { padding: 15px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #3498db; color: white; }
        .no-login { background-color: #ffebee; }
        .footer { padding: 15px; font-size: 12px; color: #777; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Login Creation Summary Report</h2>
      </div>
      
      <div class="content">
        <div class="summary-box">
          <h3>Overall Summary</h3>
          <ul>
            <li>Total Employees Checked: ${loginStatus.summary.totalEmployeesChecked}</li>
            <li>Employees Punched In: ${loginStatus.summary.totalEmployeesPunchedIn}</li>
            <li>Total Logins Created: ${loginStatus.summary.totalLoginsCreated}</li>
            <li>Successful Payments: ${loginStatus.summary.totalSuccessfulPayments}</li>
            <li>No Login Fees: ${loginStatus.summary.totalNoLoginFees}</li>
          </ul>
        </div>
        
        <h3>Employee Login Creation Details</h3>
        <table>
          <tr>
            <th>Employee Name</th>
            <th>Employee ID</th>
            <th>Branch</th>
            <th>Total Logins</th>
            <th>Successful</th>
            <th>No Fees</th>
            <th>Other</th>
          </tr>
    `;

    // Add employee results
    loginStatus.employeeResults.forEach(emp => {
      const rowClass = emp.totalLoginsCreated === 0 ? 'class="no-login"' : '';
      emailBody += `
        <tr ${rowClass}>
          <td>${emp.employeeName}</td>
          <td>${emp.employeeId}</td>
          <td>${emp.branchName}</td>
          <td>${emp.totalLoginsCreated}</td>
          <td>${emp.successfulPayments}</td>
          <td>${emp.noLoginFees}</td>
          <td>${emp.otherStatus}</td>
        </tr>
      `;
    });

    emailBody += `
        </table>
    `;

    // Add employees with no login section
    if (loginStatus.employeesWithNoLogin.length > 0) {
      emailBody += `
        <h3>Employees Who Punched In But Created No Logins</h3>
        <table>
          <tr>
            <th>Employee Name</th>
            <th>Employee ID</th>
            <th>Branch</th>
            <th>Reporting Manager</th>
          </tr>
      `;

      loginStatus.employeesWithNoLogin.forEach(emp => {
        emailBody += `
          <tr>
            <td>${emp.employeeName}</td>
            <td>${emp.employeeId}</td>
            <td>${emp.branchName}</td>
            <td>${emp.firstManager}</td>
          </tr>
        `;
      });

      emailBody += `
        </table>
      `;
    }

    emailBody += `
      </div>
      
      <div class="footer">
        <p>This is an automated report generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
    `;

    // Send the email
    const emailSent = await leadMailFunction({
      to: adminEmails[0],
      cc: "",
      subject: subject,
      html: emailBody
    });

    return { success: emailSent, message: "Login creation summary email sent" };
  } catch (error) {
    console.error("Error sending login creation summary email:", error);
    return { success: false, message: error.message };
  }
}

// Function to send individual notifications to employees with no logins
async function sendNoLoginNotifications() {
  try {
    const loginStatus = await checkEmployeeLoginCreationStatus();

    if (!loginStatus.success) {
      console.error("Failed to get login creation status");
      return { success: false, message: "Failed to get login creation status" };
    }

    const emailResults = [];

    for (const employee of loginStatus.employeesWithNoLogin) {
      // Get full employee details
      const fullEmployee = await employeModel.findOne({
        employeUniqueId: employee.employeeId
      }).lean();

      if (!fullEmployee || !fullEmployee.email) {
        continue;
      }

      // Send individual notification
      const emailBody = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { background-color: #e67e22; color: white; padding: 10px; }
            .content { padding: 15px; }
            .footer { padding: 15px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>No Login Creation Alert</h2>
          </div>
          
          <div class="content">
            <p>Dear <b>${employee.employeeName}</b>,</p>
            
            <p>You have successfully punched in today, but our records show that you have not created any customer logins yet.</p>
            
            <p>Creating customer logins is an important part of your daily responsibilities. Please ensure you:</p>
            <ul>
              <li>Create customer logins as per your target</li>
              <li>Verify payment status for each login</li>
              <li>Update the system promptly</li>
            </ul>
            
            <p>If you need assistance, please contact your manager <b>${employee.firstManager}</b>.</p>
            
            <p>Best regards,<br>Management Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification. Please do not reply directly to this message.</p>
          </div>
        </body>
        </html>
      `;

      const emailSent = await leadMailFunction({
        to: fullEmployee.email,
        subject: "Action Required: No Customer Logins Created Today",
        html: emailBody
      });

      emailResults.push({
        employeeName: employee.employeeName,
        emailSent: emailSent,
        email: fullEmployee.email
      });
    }

    return { success: true, emailResults };
  } catch (error) {
    console.error("Error sending no login notifications:", error);
    return { success: false, message: error.message };
  }
}

// Cron job for daily login creation check and reporting
cron.schedule('30 18 * * *', async () => {
  console.log('Running Login Creation Check at 6:30 PM');
  const mailSettings = await mailSwitchesModel.findOne();

  if (mailSettings?.masterMailStatus && mailSettings?.loginCreationMail) {
    // Send summary report
    await sendLoginCreationSummaryEmail();

    // Send individual notifications to employees with no logins
    await sendNoLoginNotifications();
  }
});








//---------------------------------------------------------------------------------------------------------------------
// in this function first role, punch in check , date witch date you want to check 
async function getSalesNonManagersWithPunchCheck(role, punchInCheck = false, date = new Date()) {
  try {
    const salesRole = await roleModel.findOne({ roleName: role }).lean();
    if (!salesRole) {
      console.log("Sales role not found");
      return { success: false, message: "Sales role not found", data: [] };
    }

    const salesEmployees = await employeModel.find({
      roleId: salesRole._id
      , status: "active"
    }).select('employeUniqueId employeName userName email workEmail _id reportingManagerId').lean();

    if (salesEmployees.length === 0) {
      console.log("No sales employees found");
      return { success: false, message: "No sales employees found", data: [] };
    }

    const managerIds = await employeModel.distinct('reportingManagerId', {
      reportingManagerId: { $exists: true, $ne: null }
    });

    let nonManagerSalesEmployees = salesEmployees.filter(employee =>
      !managerIds.some(managerId =>
        managerId.toString() === employee._id.toString()
      )
    );

    if (punchInCheck) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const employeeIds = nonManagerSalesEmployees.map(emp => emp._id);

      const attendanceRecords = await attendanceModel.find({
        employeeId: { $in: employeeIds },
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).lean();

      const punchedInEmployeeIds = new Set(
        attendanceRecords.map(record => record.employeeId.toString())
      );

      nonManagerSalesEmployees = nonManagerSalesEmployees.filter(employee =>
        punchedInEmployeeIds.has(employee._id.toString())
      );
    }

    return {
      success: true,
      employeeCount: `${nonManagerSalesEmployees.length}`,
      employeeList: nonManagerSalesEmployees,
    };

  } catch (error) {
    console.error("Error in :", error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}






async function dailyZeroLoginSalesPersonMail() {
  try {
    // Get sales employees who have punched in today
    const employeeListResult = await getSalesNonManagersWithPunchCheck("sales", true);

    if (!employeeListResult.success || !employeeListResult.employeeList.length) {
      return { success: false, message: 'No sales employees found who punched in today' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emailResults = [];
    const employeesWithNoLogins = [];

    // Check each employee for customer login creation
    for (const employee of employeeListResult.employeeList) {
      // Check if employee has created any customer logins today with valid payment status
      const loginCount = await customerModel.countDocuments({
        employeId: employee._id,
        createdAt: { $gte: today },
        paymentStatus: "success"
      });

      console.log(`Employee ${employee.employeName} has created ${loginCount} logins today`);

      // If no logins created, add to list and send warning email
      if (loginCount === 0) {
        employeesWithNoLogins.push(employee);

        // Get reporting manager details if exists
        let reportingManager = null;
        if (employee.reportingManagerId) {
          reportingManager = await employeModel.findById(employee.reportingManagerId).lean();
        }

        // Send warning email
        const emailStatus = await sendZeroLoginWarningEmail(employee, reportingManager);

        emailResults.push({
          employeeName: employee.employeName,
          employeeId: employee.employeUniqueId,
          emailSent: emailStatus.success,
          details: emailStatus.details
        });
      }
    }

    console.log(`Found ${employeesWithNoLogins.length} employees with zero logins`);
    console.log('Email results:', emailResults);

    return {
      success: true,
      totalEmployeesChecked: employeeListResult.employeeList.length,
      employeesWithNoLogins: employeesWithNoLogins.length,
      emailResults: emailResults
    };

  } catch (error) {
    console.log('Error in :', error);
    return { success: false, message: error.message };
  }
}



// Function to send zero login warning email
async function sendZeroLoginWarningEmail(employee, reportingManager) {
  try {
    // const toEmail = employee.workEmail || employee.email;
    const toEmail = "darshanrajput@fincoopers.in";

    if (!toEmail) {
      return { success: false, details: "No email address found for employee" };
    }

    // CC to reporting manager if available
    const ccEmails = [];
    // if (reportingManager && (reportingManager.workEmail || reportingManager.email)) {
    //   ccEmails.push(reportingManager.workEmail || reportingManager.email);
    // }

    const subject = `URGENT: Zero Customer Login Warning - ${employee.employeName}`;

    const emailBody = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #e74c3c; color: white; padding: 1px; text-align: center; }
        .content { padding: 15px; }
        .action-required { background-color: #fff5e6; border-left: 4px solid #ff9900; padding: 10px; margin: 15px 0; }
        .footer { padding: 15px; font-size: 12px; color: #777; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>URGENT: Zero Customer Login Alert</h2>
      </div>
      
      <div class="content">
        <p>Dear <b>${employee.employeName}</b>,</p>

        
        <p>Creating customer logins is a critical KPI for sales team members and is monitored daily by management.</p>
        
        <div class="action-required">
          <h3>Action Required:</h3>
          <ol>
            <li>Start creating customer logins immediately</li>
            <li>Ensure payment status "SUCCESS"</li>
            <li>Update the system with all completed logins</li>
            <li>Contact your manager if you face any technical issues</li>
          </ol>
        </div>
        
        ${reportingManager ? `
        <p>Your reporting manager <b>${reportingManager.employeName}</b> has been notified of this situation.</p>
        ` : ''}
        
        <p><strong>Please treat this as a priority task and take immediate action.</strong></p>
        
        <p>Best regards,<br>Sales Management Team</p>
      </div>
      
    </body>
    </html>
    `;

    const emailSent = await leadMailFunction({
      to: toEmail,
      cc: ccEmails,
      subject: subject,
      html: emailBody
    });

    return {
      success: emailSent,
      details: emailSent ? "Warning email sent successfully" : "Failed to send email"
    };

  } catch (error) {
    console.error("Error sending zero login warning email:", error);
    return { success: false, details: error.message };
  }
}


//------------------------------------------------------------------howManyPdFileCompleteToday--------------------------------------------

//6 pm mail schedule
cron.schedule("30 12 * * *", async () => {
  const PdCompleteAndReject = await mailSwitchesModel.findOne();
  if (PdCompleteAndReject?.masterMailStatus && PdCompleteAndReject?.pdMail && PdCompleteAndReject?.howManyPdFileCompleteTodayMorning) {
    await howManyPdFileCompleteTodayMorning();
  }
});


async function howManyPdFileCompleteTodayMorning() {
  try {
    const now = new Date();


    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const startStr = todayStart.toISOString();
    const endStr = todayEnd.toISOString();

    const approvedCount = await externalManagerModel.countDocuments({
      statusByCreditPd: 'approve',
      creditPdCompleteDate: {
        $gte: startStr,
        $lte: endStr
      }
    });

    if ((approvedCount) > 0) {
      await sendPdCompleteEmail(approvedCount);
    }

    return {
      success: true,
      approvedCount,
    };

  } catch (error) {
    console.error('Error in dailyPdCountSummary:', error);
    return { success: false, message: error.message };
  }
}

async function sendPdCompleteEmail(approvedCount) {
  try {
    const toEmail = "darshanrajput@fincoopers.in";
    const subject = `PD Daily Complete`;

    const emailBody = `
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header { 
          background-color: #2c3e50; 
          color: white; 
          padding: 20px; 
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content { 
          padding: 30px; 
          text-align: center;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 20px 0; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 15px; 
          text-align: center; 
          font-size: 18px;
        }
        th { 
          background-color: #34495e; 
          color: white; 
          font-weight: bold;
        }
        .approved { 
          color: #27ae60; 
          font-weight: bold; 
          font-size: 24px;
        }
        .rejected { 
          color: #e74c3c; 
          font-weight: bold; 
          font-size: 24px;
        }
        .total { 
          color: #3498db; 
          font-weight: bold; 
          font-size: 24px;
        }
        .footer { 
          text-align: center;
          padding: 20px;
          font-size: 12px; 
          color: #7f8c8d;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>PD Daily Complete </h2>
          <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="content">
          <h3>Today's PD Complete Count</h3>
          
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Approved</td>
                <td class="approved">${approvedCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>`;

    const emailSent = await leadMailFunction({
      to: toEmail,
      subject: subject,
      html: emailBody
    });

    console.log(`PD Count Email sent - Approved: ${approvedCount},`);
    return { success: emailSent };

  } catch (error) {
    console.error('Error sending PD count email:', error);
    return { success: false, message: error.message };
  }
}



//-----------------------------------------------------------------------------zeroPdCompleteEmployeeMail--------------------------------------------------------------------------
// 7 pm mail send
cron.schedule("30 13 * * *", async () => {
  const zeroPdMailEvening = await mailSwitchesModel.findOne();
  if (zeroPdMailEvening?.masterMailStatus && zeroPdMailEvening?.pdMail && zeroPdMailEvening?.dailyZeroPdMailEvening) {
    await dailyZeroPdPerformanceEmailsEvening();
  }
});


async function dailyZeroPdPerformanceEmailsEvening() {
  try {
    // Get all creditPd employees (non-managers)
    const salesEmployees = await getSalesNonManagersWithPunchCheck("creditPd", false);
    console.log('salesEmployees----', salesEmployees);

    if (!salesEmployees.success || !salesEmployees.employeeList.length) {
      console.log('No creditPd employees found');
      return { success: false, message: 'No creditPd employees found' };
    }

    const today = new Date();
    // Set time to beginning of day for date comparison
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const emailResults = [];
    const employeesWithNoApprovals = [];
    const employeesWithApprovals = [];

    // Process each employee
    for (const employee of salesEmployees.employeeList) {
      try {
        // Get approved records for this PD employee today
        const approvedRecords = await externalManagerModel.find({
          pdId: employee._id,
          statusByCreditPd: 'approve',
          creditPdCompleteDate: {
            $gte: todayStart,
            $lte: todayEnd
          }
        }).lean();

        // If no approvals found today, add to no approvals list
        if (approvedRecords.length === 0) {
          employeesWithNoApprovals.push({
            ...employee,
            approvalCount: 0
          });
        } else {
          employeesWithApprovals.push({
            ...employee,
            approvalCount: approvedRecords.length
          });
        }

      } catch (error) {
        console.error(`Error processing employee ${employee.employeUniqueId}:`, error);
      }
    }

    // Send individual emails to employees with no approvals
    for (const employee of employeesWithNoApprovals) {
      const emailSent = await sendPdPerformanceEmail(employee);
      emailResults.push({
        employeeName: employee.employeName,
        employeeId: employee.employeUniqueId,
        emailSent: emailSent.success,
      });
    }


    // console.log('PD performance emails completed');
    return {
      success: true,
      totalEmployees: salesEmployees.employeeList.length,
      employeesWithNoApprovals: employeesWithNoApprovals.length,
      employeesWithApprovals: employeesWithApprovals.length,
      emailResults: emailResults
    };

  } catch (error) {
    console.error('Error in dailyZeroPdPerformanceEmailsEvening:', error);
    return { success: false, message: error.message };
  }
}

// Function to send email to individual PD employees with no approvals
async function sendPdPerformanceEmail(employee) {
  try {
    const toEmail = employee.workEmail || employee.email;

    if (!toEmail || toEmail === 'null' || toEmail === '') {
      return { success: false, message: 'No valid email address for employee' };
    }

    const subject = `Action Required: Zero PD complete Today`;

    const emailBody = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { background-color: #e74c3c; color: white; padding: 15px; text-align: center; }
        .content { padding: 20px; }
        .warning-box { 
          border: 2px solid #e74c3c; 
          padding: 15px; 
          margin: 15px 0; 
          background-color: #fadbd8; 
        }
        .action-required { 
          background-color: #fff5e6; 
          border-left: 4px solid #ff9900; 
          padding: 10px; 
          margin: 15px 0; 
        }
        .footer { 
          padding: 15px; 
          font-size: 12px; 
          color: #666; 
          border-top: 1px solid #eee; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>PD Performance Alert</h2>
      </div>
      <div class="content">
        <p>Dear <b>${employee.employeName}</b>,</p>
        <div class="warning-box">
          <h3>⚠️ No PD complete Today</h3>
          <p>Our records indicate that you have not completed any PD today.</p>
        </div>
        <p>As a Credit PD team member, processing verifications and approvals is a critical part of your daily responsibilities.</p>
        <p>Please treat this as a priority and take immediate action.</p>
        <p>Best regards,<br>Credit Management Team</p>
      </div>
    </body>
    </html>`;

    const emailSent = await leadMailFunction({
      to: toEmail,
      subject: subject,
      html: emailBody
    });

    return { success: emailSent, message: emailSent ? 'Email sent successfully' : 'Failed to send email' };

  } catch (error) {
    console.error('Error sending PD performance email:', error);
    return { success: false, message: error.message };
  }
}

//-------------------------------------------------------------------------------dailySalesTeamPerformanceEmailsEvening -----------------------------------------------------------------
// 8 pm 
cron.schedule("30 14 * * *", async () => {
  const dailySalesTeamLogin = await mailSwitchesModel.findOne();
  if (dailySalesTeamLogin?.masterMailStatus && dailySalesTeamLogin?.loginMail && dailySalesTeamLogin?.dailySalesTeamPerformanceEmailsEvening) {
    await dailySalesTeamPerformanceEmailsEvening();
  }
});




async function dailySalesTeamPerformanceEmailsEvening() {
  try {
    // Get all sales employees (non-managers)
    const salesEmployees = await getSalesNonManagersWithPunchCheck("sales", true);

    if (!salesEmployees.success || !salesEmployees.employeeList.length) {
      console.log('No sales employees found');
      return { success: false, message: 'No sales employees found' };
    }

    // Group employees by manager
    const managerGroups = {};

    for (const employee of salesEmployees.employeeList) {
      if (employee.reportingManagerId) {
        const managerId = employee.reportingManagerId.toString();
        if (!managerGroups[managerId]) {
          managerGroups[managerId] = [];
        }
        managerGroups[managerId].push(employee);
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emailResults = [];

    // Process each manager and their team
    for (const managerId in managerGroups) {
      const manager = await employeModel.findById(managerId).lean();
      if (!manager || !manager.workEmail) {
        console.log(`Manager not found or no email for manager ID: ${managerId}`);
        continue;
      }

      const teamMembers = managerGroups[managerId];
      const teamPerformanceData = [];

      // Get performance data for each team member
      for (const employee of teamMembers) {
        try {
          // Fetch complete employee data with createdAt field
          const fullEmployeeData = await employeModel.findById(employee._id).lean();

          // Get branch name
          let branchName = '';
          if (fullEmployeeData?.branchId) {
            const branch = await newBranchModel.findById(fullEmployeeData.branchId).lean();
            branchName = branch ? branch.name : '';
          }

          // Calculate days in system with error handling
          let daysInSystem = 0;
          if (fullEmployeeData?.createdAt) {
            const employeeCreatedAt = new Date(fullEmployeeData.createdAt);
            if (!isNaN(employeeCreatedAt.getTime())) {
              daysInSystem = Math.floor((today - employeeCreatedAt) / (1000 * 60 * 60 * 24));
            } else {
              console.log(`Invalid createdAt date for employee ${employee.employeUniqueId}`);
              daysInSystem = 'N/A';
            }
          } else {
            console.log(`No createdAt date found for employee ${employee.employeUniqueId}`);
            daysInSystem = 'N/A';
          }

          // Get today's login count
          const todayLoginCount = await customerModel.countDocuments({
            employeId: employee._id,
            createdAt: { $gte: today },
            paymentStatus: { $in: ["success", "noLogInFees"] }
          });

          // Get all logins created by employee where process is complete
          let completedProcesses = 0;

          // First, get all customer IDs for this employee
          const customerQuery = {
            employeId: employee._id
          };

          // Only add date filter if employee has valid createdAt
          if (fullEmployeeData?.createdAt && !isNaN(new Date(fullEmployeeData.createdAt).getTime())) {
            customerQuery.createdAt = {
              $gte: new Date(fullEmployeeData.createdAt),
              $lte: today
            };
          }

          const allCustomerIds = await customerModel.find(customerQuery).distinct('_id');

          // Check which customers have complete process
          if (allCustomerIds.length > 0) {
            // Create date range query for salesCompleteDate
            let dateQuery = { $exists: true, $ne: null };

            // If employee has valid createdAt, add date range filter
            if (fullEmployeeData?.createdAt && !isNaN(new Date(fullEmployeeData.createdAt).getTime())) {
              const employeeStartDate = new Date(fullEmployeeData.createdAt);
              const currentDate = new Date();

              dateQuery = {
                $exists: true,
                $ne: null,
                $gte: employeeStartDate,
                $lte: currentDate
              };
            }

            completedProcesses = await processModel.countDocuments({
              customerId: { $in: allCustomerIds },
              guarantorFormComplete: true,
              guarantorFormStart: true,
              coApplicantFormComplete: true,
              coApplicantFormStart: true,
              applicantFormComplete: true,
              applicantFormStart: true,
              customerFormComplete: true,
              customerFormStart: true,
              salesCompleteDate: dateQuery
            });
          }

          teamPerformanceData.push({
            branchName: branchName,
            employeeCode: employee.employeUniqueId || '',
            salesPersonName: employee.employeName || '',
            daysInSystem: daysInSystem,
            todayLoginCount: todayLoginCount,
            tillDateLoginCount: completedProcesses
          });

        } catch (employeeError) {
          console.error(`Error processing employee ${employee.employeUniqueId}:`, employeeError);
          // Add employee with error data
          teamPerformanceData.push({
            branchName: 'Error',
            employeeCode: employee.employeUniqueId || '',
            salesPersonName: employee.employeName || '',
            daysInSystem: 'Error',
            todayLoginCount: 0,
            tillDateLoginCount: 0
          });
        }
      }

      // Sort by branch name for better organization
      teamPerformanceData.sort((a, b) => {
        if (a.branchName === 'Error') return 1;
        if (b.branchName === 'Error') return -1;
        return a.branchName.localeCompare(b.branchName);
      });

      // Send email to manager
      const emailSent = await sendManagerPerformanceEmail(manager, teamPerformanceData);

      emailResults.push({
        managerName: manager.employeName,
        managerEmail: manager.workEmail,
        teamSize: teamMembers.length,
        emailSent: emailSent.success
      });
    }

    return {
      success: true,
      emailsSent: emailResults.filter(r => r.emailSent).length,
      totalManagers: emailResults.length,
      results: emailResults
    };

  } catch (error) {
    console.error('Error in :', error);
    return { success: false, message: error.message };
  }
}


async function sendManagerPerformanceEmail(manager, teamPerformanceData) {
  try {
    // const toEmail = manager.workEmail || manager.email;
    const toEmail = "darshanrajput@fincoopers.in"

    if (!toEmail) {
      return { success: false, message: 'No email address for manager' };
    }

    const subject = `Login Summary – Sales Team Performance`;

    // Separate employees into two groups
    const employeesWithLogins = teamPerformanceData.filter(emp => emp.todayLoginCount > 0);
    const employeesWithZeroLogins = teamPerformanceData.filter(emp => emp.todayLoginCount === 0);

    let emailBody = `
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .content { 
          max-width: 900px; 
          margin: 0 auto; 
        }
        .greeting { 
          font-size: 14px; 
          margin-bottom: 20px; 
        }
        .section-header { 
          font-size: 14px; 
          font-weight: bold; 
          margin-bottom: 10px; 
          color: #000000;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin-bottom: 30px; 
          font-size: 14px;
        }
        th, td { 
          border: 1px solid #ccc; 
          padding: 8px; 
          text-align: left; 
        }
        .blue-table th { 
          background-color: #4FC3F7; 
          color: white; 
          font-weight: bold; 
          text-transform: uppercase;
        }
        .green-table th { 
          background-color:rgba(92, 160, 95, 0.86); 
          color: white; 
          font-weight: bold; 
          text-transform: uppercase;
        }
        .footer-text { 
          font-size: 14px; 
          margin-top: 20px; 
          line-height: 1.5;
        }
        .signature { 
          font-size: 14px; 
          margin-top: 20px; 
          color:rgb(10, 121, 233);
        }
      </style>
    </head>
    <body>
      <div class="content">
        <div class="greeting">
        Dear Managers,</br>
          <p>Please find below the login count for your respective teams as of today.</p>
        </div>
        
        <div class="section-header">Payment Confirmed Login Counts:-</div>
        
        <table class="blue-table">
          <thead>
            <tr>
              <th>BRANCH NAME</th>
              <th>EMPLOYEE CODE</th>
              <th>SALES PERSON NAME</th>
              <th>TILL DATE LOGIN COUNT</th>
              <th>TODAY LOGIN COUNT</th>
              <th>DAYS IN SYSTEM</th>
            </tr>
          </thead>
          <tbody>`;

    // Add data rows for employees with logins
    for (const employee of employeesWithLogins) {
      emailBody += `
            <tr>
              <td>${employee.branchName}</td>
              <td>${employee.employeeCode}</td>
              <td>${employee.salesPersonName}</td>
              <td>${employee.tillDateLoginCount}</td>
              <td>${employee.todayLoginCount}</td>
              <td>${employee.daysInSystem}</td>
            </tr>`;
    }

    // If no employees with logins, add empty row
    if (employeesWithLogins.length === 0) {
      emailBody += `
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>`;
    }

    emailBody += `
          </tbody>
        </table>`;

    // Add zero logins table
    emailBody += `
        <div class="section-header">Sales Persons with Zero Logins:-</div>
        
        <table class="green-table">
          <thead>
            <tr>
              <th>BRANCH NAME</th>
              <th>EMPLOYEE CODE</th>
              <th>SALES PERSON NAME</th>
              <th>TILL DATE LOGIN COUNT</th>
              <th>TODAY LOGIN COUNT</th>
              <th>DAYS IN SYSTEM</th>
            </tr>
          </thead>
          <tbody>`;

    // Add data rows for employees with zero logins
    for (const employee of employeesWithZeroLogins) {
      emailBody += `
            <tr>
              <td>${employee.branchName}</td>
              <td>${employee.employeeCode}</td>
              <td>${employee.salesPersonName}</td>
              <td>${employee.tillDateLoginCount}</td>
              <td>0</td>
              <td>${employee.daysInSystem}</td>
            </tr>`;
    }

    // If no employees with zero logins, add empty row
    if (employeesWithZeroLogins.length === 0) {
      emailBody += `
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>`;
    }

    emailBody += `
          </tbody>
        </table>
        
        <div class="footer-text">
          <p>Kindly review this data and follow up with team members who haven't logged in yet. Your prompt attention will help ensure everyone is on track for the day's activities.</p>
          <p>Thank you for your continued cooperation.</p>
        </div>
        
        <div class="signature">
          <p>Best regards</p>
        </div>
      </div>
    </body>
    </html>`;

    const emailSent = await leadMailFunction({
      to: toEmail,
      subject: subject,
      html: emailBody
    });

    return { success: emailSent, message: emailSent ? 'Email sent successfully' : 'Failed to send email' };

  } catch (error) {
    console.error('Error sending manager performance email:', error);
    return { success: false, message: error.message };
  }
}


//------------------------------------------------------------------------------ check how many files payment success and not success------------


// async function dailyCustomerPaymentStatusEmail() {
//   try {
//     const today = new Date();
//     const todayStart = new Date(today);
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date(today);
//     todayEnd.setHours(23, 59, 59, 999);

//     // Get all customer records created today
//     const todayCustomers = await customerModel.find({
//       createdAt: {
//         $gte: todayStart,
//         $lte: todayEnd
//       }
//     })
//     .populate('branch', 'name')
//     .populate('employeId', 'employeName')
//     .lean();

//     // Separate successful and pending payments
//     const successfulPayments = todayCustomers.filter(customer => customer.paymentStatus === 'success');
//     const pendingPayments = todayCustomers.filter(customer => customer.paymentStatus !== 'success');

//     // Send the email
//     await sendPaymentStatusEmail(successfulPayments, pendingPayments);

//     return {
//       success: true,
//       totalCustomers: todayCustomers.length,
//       successfulCount: successfulPayments.length,
//       pendingCount: pendingPayments.length
//     };

//   } catch (error) {
//     console.error('Error in:', error);
//     return { success: false, message: error.message };
//   }
// }

// async function sendPaymentStatusEmail(successfulPayments, pendingPayments) {
//   try {
//     const toEmail = "darshanrajput@fincoopers.in"; 
//     const subject = `Daily Customer Payment Status Report - ${new Date().toLocaleDateString()}`;

//     const emailBody = `
//     <html>
//     <head>
//       <style>
//         body { 
//           font-family: Arial, sans-serif; 
//           margin: 0; 
//           padding: 20px; 
//         }
//         .header {
//           background-color: #2c3e50;
//           color: white;
//           padding: 20px;
//           text-align: center;
//           margin-bottom: 30px;
//         }
//         .content {
//           max-width: 1200px;
//           margin: 0 auto;
//         }
//         .section {
//           margin-bottom: 40px;
//         }
//         .section-title {
//           font-size: 18px;
//           font-weight: bold;
//           margin-bottom: 15px;
//           padding-bottom: 10px;
//           border-bottom: 1px solid #ddd;
//         }
//         .success-title {
//           color: #27ae60;
//         }
//         .pending-title {
//           color: #e67e22;
//         }
//         table {
//           width: 100%;
//           border-collapse: collapse;
//           margin-bottom: 20px;
//         }
//         th, td {
//           padding: 12px 15px;
//           border: 1px solid #ddd;
//           text-align: left;
//         }
//         th {
//           background-color: #f5f5f5;
//           font-weight: bold;
//         }
//         .success-table th {
//           background-color: #d5f5e3;
//         }
//         .pending-table th {
//           background-color: #fef5e7;
//         }
//         tr:nth-child(even) {
//           background-color: #f9f9f9;
//         }
//         .footer {
//           margin-top: 30px;
//           padding-top: 20px;
//           border-top: 1px solid #ddd;
//           text-align: center;
//           color: #7f8c8d;
//           font-size: 14px;
//         }
//         .summary {
//           background-color: #f8f9fa;
//           padding: 15px;
//           border-radius: 5px;
//           margin-bottom: 30px;
//         }
//         .count {
//           font-weight: bold;
//           font-size: 16px;
//         }
//         .success-count {
//           color: #27ae60;
//         }
//         .pending-count {
//           color: #e67e22;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <h2>Daily Customer Payment Status Report</h2>
//         <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//       </div>

//       <div class="content">
//         <div class="summary">
//           <p><strong>Today's Summary:</strong></p>
//           <p>Total Customers: <span class="count">${successfulPayments.length + pendingPayments.length}</span></p>
//           <p>Successful Payments: <span class="count success-count">${successfulPayments.length}</span></p>
//           <p>Pending Payments: <span class="count pending-count">${pendingPayments.length}</span></p>
//         </div>

//         <div class="section">
//           <h3 class="section-title success-title">Successful Payments</h3>

//           ${successfulPayments.length > 0 ? `
//           <table class="success-table">
//             <thead>
//               <tr>
//                 <th>Customer ID</th>
//                 <th>Full Name</th>
//                 <th>Branch</th>
//                 <th>Executive</th>
//                 <th>Loan Amount</th>
//                 <th>Payment Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${successfulPayments.map(customer => `
//                 <tr>
//                   <td>${customer.customerFinId || 'N/A'}</td>
//                   <td>${customer.fullName || 'N/A'}</td>
//                   <td>${customer.branch?.name || 'N/A'}</td>
//                   <td>${customer.employeId?.employeName || 'N/A'}</td>
//                   <td>₹${customer.loanAmount?.toLocaleString() || '0'}</td>
//                   <td>${customer.paymentDate ? new Date(customer.paymentDate).toLocaleString() : 'N/A'}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>
//           ` : '<p>No successful payments recorded today.</p>'}
//         </div>

//         <div class="section">
//           <h3 class="section-title pending-title">Pending Payments</h3>

//           ${pendingPayments.length > 0 ? `
//           <table class="pending-table">
//             <thead>
//               <tr>
//                 <th>Customer ID</th>
//                 <th>Full Name</th>
//                 <th>Branch</th>
//                 <th>Executive</th>
//                 <th>Loan Amount</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${pendingPayments.map(customer => `
//                 <tr>
//                   <td>${customer.customerFinId || 'N/A'}</td>
//                   <td>${customer.fullName || 'N/A'}</td>
//                   <td>${customer.branch?.name || 'N/A'}</td>
//                   <td>${customer.employeId?.employeName || 'N/A'}</td>
//                   <td>₹${customer.loanAmount?.toLocaleString() || '0'}</td>
//                   <td>${customer.paymentStatus || 'Pending'}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>
//           ` : '<p>No pending payments recorded today.</p>'}
//         </div>
//       </div>

//       <div class="footer">
//         <p>This is an automated report generated at ${new Date().toLocaleTimeString()}</p>
//         <p>For any questions, please contact the system administrator.</p>
//       </div>
//     </body>
//     </html>`;

//     const emailSent = await leadMailFunction({
//       to: toEmail,
//       subject: subject,
//       html: emailBody
//     });

//     console.log(`Payment Status Email sent - Success: ${successfulPayments.length}, Pending: ${pendingPayments.length}`);
//     return { success: emailSent };

//   } catch (error) {
//     console.error('Error sending payment status email:', error);
//     return { success: false, message: error.message };
//   }
// }

// // Schedule to run daily at 8:00 PM
// cron.schedule('0 20 * * *', async () => {
//   console.log('Running daily customer payment status email at 8:00 PM');
//   const mailSettings = await mailSwitchesModel.findOne();

//   if (mailSettings?.masterMailStatus && mailSettings?.customerPaymentStatusMail) {
//     await dailyCustomerPaymentStatusEmail();
//   }
// });

// // Manual trigger for testing
// async function testCustomerPaymentStatusEmail() {
//   const result = await dailyCustomerPaymentStatusEmail();
//   console.log('Test result:', result);
//   return result;
// }
//----------------------------------------------------------------------------------------------------------------------------------------------------

const dayjs = require("dayjs");

/**
 * Function to check each employee's activity on their last 3 attendance days
 */
async function checkEmployeeLastThreeAttendanceDays() {
  try {
    console.log("Starting last three attendance days check at:", new Date().toISOString());

    // Step 1: Get all active sales employees
    const salesRole = await roleModel.findOne({ roleName: "sales" }).lean();
    if (!salesRole) {
      console.log("Sales role not found");
      return { success: false, message: "Sales role not found" };
    }

    const salesEmployees = await employeModel.find({
      roleId: salesRole._id,
      status: "active"
    }).lean();

    if (salesEmployees.length === 0) {
      console.log("No active sales employees found");
      return { success: false, message: "No active sales employees found" };
    }

    // Store results
    const employeeResults = [];
    const inactiveEmployees = [];

    // Step 2: Process each employee
    for (const employee of salesEmployees) {
      const employeeId = employee._id;

      // Get all punch-ins for this employee (limit to reasonably recent ones, like last 10 days)
      const tanDaysAgo = dayjs().subtract(10, "days").startOf("day").toDate();
      const allPunchIns = await attendanceModel.find({
        employeeId: employeeId,
        createdAt: { $gte: tanDaysAgo }
      }).sort({ createdAt: -1 }).lean(); // Sort by most recent first

      // Skip if no punch-ins found
      if (allPunchIns.length === 0) {
        continue;
      }

      // Get only the last 3 attendance days
      const lastThreePunchIns = [];
      const uniqueDates = new Set();

      // Group by date (we want the last 3 different days)
      for (const punchIn of allPunchIns) {
        const dateKey = dayjs(punchIn.createdAt).format('YYYY-MM-DD');

        if (!uniqueDates.has(dateKey)) {
          uniqueDates.add(dateKey);
          lastThreePunchIns.push(punchIn);

          // Stop after finding 3 different days
          if (lastThreePunchIns.length === 3) {
            break;
          }
        }
      }

      // Check activity for each of the last 3 attendance days
      const attendanceDays = [];
      let hasInactiveDay = false;

      for (const punchIn of lastThreePunchIns) {
        const punchDate = dayjs(punchIn.createdAt);
        const dayStart = punchDate.startOf("day").toDate();
        const dayEnd = punchDate.endOf("day").toDate();

        console.log('dayStart', dayStart, "dayEnd", dayEnd)
        // Check lead generation for this specific day
        const leadsGenerated = await leadGenerateModel.countDocuments({
          employeeGenerateId: employeeId,
          createdAt: { $gte: dayStart, $lte: dayEnd }
        });

        // Check process completion for this specific day
        const processesCompleted = await processModel.countDocuments({
          employeId: employeeId,
          guarantorFormComplete: true,
          guarantorFormStart: true,
          coApplicantFormComplete: true,
          coApplicantFormStart: true,
          applicantFormComplete: true,
          applicantFormStart: true,
          customerFormComplete: true,
          customerFormStart: true,
          salesCompleteDate: { $gte: dayStart, $lte: dayEnd }
        });

        // Store this day's activity
        const dayActivity = {
          date: punchIn.createdAt,
          punchInTime: dayjs(punchIn.createdAt).format("HH:mm"),
          formattedDate: dayjs(punchIn.createdAt).format("DD-MM-YYYY"),
          leadsGenerated: leadsGenerated,
          processesCompleted: processesCompleted,
          isActive: leadsGenerated > 0 || processesCompleted > 0
        };

        attendanceDays.push(dayActivity);

        if (!dayActivity.isActive) {
          hasInactiveDay = true;
        }
      }

      // Store employee data
      const employeeData = {
        employee: employee,
        attendanceDays: attendanceDays,
        hasInactiveDay: hasInactiveDay
      };

      employeeResults.push(employeeData);

      // Add to inactive list if any attendance day had no activity
      if (hasInactiveDay) {
        inactiveEmployees.push(employeeData);
      }
    }

    console.log(`Found ${inactiveEmployees.length} employees with inactive attendance days`);

    // Step 3: Send warning emails
    const emailResults = [];

    for (const employeeData of inactiveEmployees) {
      const emailStatus = await sendAttendanceDaysWarningEmail(employeeData);

      emailResults.push({
        employeeName: employeeData.employee.employeName,
        employeeId: employeeData.employee.employeUniqueId,
        emailSent: emailStatus.success,
        details: emailStatus.message
      });
    }

    // Step 4: Send summary to management
    if (inactiveEmployees.length > 0) {
      // await sendAttendanceSummaryToManagement(inactiveEmployees, employeeResults.length);
    }

    return {
      success: true,
      totalEmployees: employeeResults.length,
      inactiveEmployees: inactiveEmployees.length,
      emailResults: emailResults
    };

  } catch (error) {
    console.error("Error in :", error);
    return { success: false, message: error.message };
  }
}

/**
 * Send warning email to employee with inactive attendance days
 */
async function sendAttendanceDaysWarningEmail(employeeData) {
  try {
    const employee = employeeData.employee;
    const toEmail = employee.workEmail || employee.email;

    if (!toEmail || toEmail === '') {
      return { success: false, message: "No email address available for employee" };
    }

    // Get manager information
    let managerInfo = '';
    if (employee.reportingManagerId) {
      const manager = await employeModel.findById(employee.reportingManagerId).lean();
      if (manager) {
        managerInfo = `
        <p>Your reporting manager, <strong>${manager.employeName}</strong>, has also been notified of this inactivity.</p>
        `;
      }
    }

    // Get inactive days
    const inactiveDays = employeeData.attendanceDays.filter(day => !day.isActive);

    // Create inactive days table
    let inactiveDaysTable = '';
    inactiveDays.forEach(day => {
      inactiveDaysTable += `
      <tr>
        <td>${day.formattedDate}</td>
        <td>${day.punchInTime}</td>
        <td>0</td>
        <td>0</td>
      </tr>
      `;
    });

    const subject = `IMPORTANT: Attendance Day Activity Warning`;

    const emailBody = `
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333;
        }
        .header { 
          background-color: #f44336; 
          color: white; 
          padding: 15px; 
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content { 
          background-color: #fff;
          padding: 20px;
          border-radius: 0 0 5px 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .warning-box { 
          background-color: #fff3e0; 
          border-left: 4px solid #ff9800; 
          padding: 15px;
          margin: 15px 0;
        }
        .action-box { 
          background-color: #e8f5e9; 
          border-left: 4px solid #4caf50; 
          padding: 15px;
          margin: 15px 0;
        }
        .footer { 
          margin-top: 20px;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 15px 0; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f5f5f5; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>⚠️ Attendance Day Activity Warning ⚠️</h2>
      </div>
      
      <div class="content">
        <p>Dear <strong>${employee.employeName}</strong> (${employee.employeUniqueId}),</p>
        
        <div class="warning-box">
          <h3>Inactive Attendance Days Detected</h3>
          <p>Our system shows that you had no activity on the following attendance days:</p>
          
          <table>
            <tr>
              <th>Date</th>
              <th>Punch-In Time</th>
              <th>Leads Generated</th>
              <th>Processes Completed</th>
            </tr>
            ${inactiveDaysTable}
          </table>
          
          <p>On the days listed above, you punched in but did not:</p>
          <ul>
            <li>Generate any leads</li>
            <li>Complete any customer processes</li>
          </ul>
        </div>
        
        <p>Every day you attend work, you are expected to be productive and contribute to the team's goals.</p>
        
        ${managerInfo}
        
        <div class="action-box">
          <h3>Required Actions:</h3>
          <ol>
            <li>Begin generating leads on every work day</li>
            <li>Complete customer processes on every attendance day</li>
            <li>Provide an explanation for your inactivity to your manager</li>
            <li>If you're facing any challenges, please discuss them with your manager</li>
          </ol>
        </div>
        
        <p>We expect to see improvement in your productivity immediately.</p>
        
        <p>Best regards,<br>Management Team</p>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Add manager to CC
    const ccEmails = [];
    // if (employee.reportingManagerId) {
    //   const manager = await employeModel.findById(employee.reportingManagerId).lean();
    //   if (manager && (manager.workEmail || manager.email)) {
    //     ccEmails.push(manager.workEmail || manager.email);
    //   }
    // }

    const emailSent = await leadMailFunction({
      to: toEmail,
      cc: ccEmails,
      subject: subject,
      html: emailBody
    });

    return {
      success: emailSent,
      message: emailSent ? "Warning email sent successfully" : "Failed to send warning email"
    };

  } catch (error) {
    console.error("Error sending attendance days warning email:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Send summary email to management
 */
async function sendAttendanceSummaryToManagement(inactiveEmployees, totalEmployees) {
  try {
    // You can configure management email here or fetch from settings
    const managementEmail = "management@fincoopers.in"; // Update with actual email

    const subject = `Attendance Day Activity Summary - ${inactiveEmployees.length} Inactive Employees`;

    let emailBody = `
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
        }
        .header { 
          background-color: #2c3e50; 
          color: white; 
          padding: 20px; 
          text-align: center; 
        }
        .content { 
          padding: 20px; 
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 20px 0; 
        }
        th, td { 
          padding: 10px; 
          border: 1px solid #ddd; 
        }
        th { 
          background-color: #f5f5f5; 
        }
        tr:nth-child(even) { 
          background-color: #f9f9f9; 
        }
        .summary { 
          background-color: #ecf0f1; 
          padding: 15px; 
          margin: 20px 0; 
          border-radius: 5px; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Attendance Day Activity Summary</h2>
        <p>${dayjs().format('DD-MM-YYYY')}</p>
      </div>
      
      <div class="content">
        <div class="summary">
          <h3>Summary</h3>
          <p>Total employees with recent attendance: <strong>${totalEmployees}</strong></p>
          <p>Employees with inactive attendance days: <strong>${inactiveEmployees.length}</strong></p>
          <p>Percentage: <strong>${((inactiveEmployees.length / totalEmployees) * 100).toFixed(1)}%</strong></p>
        </div>
        
        <h3>Employees with Inactive Attendance Days</h3>
        <p>The following employees had no activity on one or more of their last three attendance days:</p>
        
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Inactive Days</th>
              <th>Manager</th>
              <th>Inactive Dates</th>
            </tr>
          </thead>
          <tbody>`;

    // Add each inactive employee to the table
    for (const employeeData of inactiveEmployees) {
      const employee = employeeData.employee;

      // Get manager name
      let managerName = 'No Manager';
      if (employee.reportingManagerId) {
        const manager = await employeModel.findById(employee.reportingManagerId).lean();
        if (manager) {
          managerName = manager.employeName;
        }
      }

      // Get inactive days
      const inactiveDays = employeeData.attendanceDays.filter(day => !day.isActive);
      const inactiveDatesText = inactiveDays.map(day => day.formattedDate).join(', ');

      emailBody += `
            <tr>
              <td>${employee.employeUniqueId || '-'}</td>
              <td>${employee.employeName}</td>
              <td>${inactiveDays.length}</td>
              <td>${managerName}</td>
              <td>${inactiveDatesText}</td>
            </tr>`;
    }

    emailBody += `
          </tbody>
        </table>
        
        <p>Each of these employees has been sent an individual warning email, with their respective manager in CC.</p>
        <p>Please follow up as necessary to ensure productivity on all attendance days.</p>
      </div>
    </body>
    </html>`;

    await leadMailFunction({
      to: managementEmail,
      subject: subject,
      html: emailBody
    });

    return { success: true };

  } catch (error) {
    console.error("Error sending attendance summary to management:", error);
    return { success: false, message: error.message };
  }
}


//-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/------------------------------------------/-/-/-/-/-/-/-/-/-/-/-//-/-/-/-/-/-/-/-/--------------------

// ----------------------------------------------------------------daily pd pending mail send -----------------------------------------------------------

cron.schedule("30 05 * * *", async () => {
  const totalPdPending = await mailSwitchesModel.findOne();
  if (totalPdPending?.masterMailStatus && totalPdPending?.pdMail && totalPdPending?.totalPdPendingMailMorning) {
    await totalPdPendingMailMorning(totalPdPending.finexeVersion);
  }
});

async function totalPdPendingMailMorning(finexeVersion) {
  try {
    const pendingPdDetail = await externalManagerModel.find({
      statusByCreditPd: "notAssign",
      creditPdId: null
    });

    const branchCounts = {};

    for (const pd of pendingPdDetail) {
      try {
        const customerDetail = await customerModel.findOne({
          _id: pd.customerId
        });

        if (customerDetail && customerDetail.branch) {
          const branchDetail = await newBranchModel.findOne({
            _id: customerDetail.branch
          });

          if (branchDetail && branchDetail.name) {
            const branchName = branchDetail.name;

            if (branchCounts[branchName]) {
              branchCounts[branchName]++;
            } else {
              branchCounts[branchName] = 1;
            }
          } else {
            if (branchCounts[""]) {
              branchCounts[""]++;
            } else {
              branchCounts[""] = 1;
            }
          }
        } else {
          if (branchCounts[""]) {
            branchCounts[""]++;
          } else {
            branchCounts[""] = 1;
          }
        }
      } catch (err) {
        console.log(`Error processing customer ${pd.customerId}: ${err.message}`);
      }
    }

    const branchCountArray = Object.entries(branchCounts).map(([branch, count]) => {
      return { branch, count };
    });

    branchCountArray.sort((a, b) => b.count - a.count);
    const emailContent = generatePendingPdEmailFormat(pendingPdDetail.length, branchCountArray);
    let toEmail = ""
    console.log('finexeVersion--',finexeVersion)
    if (finexeVersion === "PROD") {
      toEmail = "pd@fincoopers.in"
    } else {
      toEmail = "darshanrajput@fincoopers.in"
    }

    try {
      const mailSend = await leadMailFunction({
        to: toEmail,
        cc: "",
        subject: emailContent.subject,
        html: emailContent.body,
      });

      console.log('PD Pending Report email sent successfully');
    } catch (mailError) {
      console.error('Error sending PD Pending Report email:', mailError);
    }

  } catch (error) {
    console.log('Error in totalPdPendingMailMorning:', error);
    throw error;
  }
}

function generatePendingPdEmailFormat(totalCount, branchCounts) {
  // Get current date and time
  const now = new Date();
  const date = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Create email subject
  const subject = `PD Pending Status Report - ${date}`;

  // Create email body
  let body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background-color:rgb(224, 131, 131);
      color: white;
      padding: 10px;
      text-align: center;
    }
    .summary {
      background-color: #f9f9f9;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }
    .summary h2 {
      margin-top: 0;
      color: #0056b3;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 7px 10px;
      border-bottom: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color:rgb(91, 92, 94);
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .footer {
      margin-top: 20px;
      padding: 10px 0;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PD Pending Status Report</h1>
    </div>
    
    <div class="summary">
      <h2>Summary</h2>
      <p>Total Pending PD Count: <strong>${totalCount}</strong></p>
    </div>
    
    <h2>Branch By Pending PD Count</h2>
    <table>
      <tr>
        <th>Sr No.</th>
        <th>Branch Name</th>
        <th>Count</th>
      </tr>`;

  // Add rows for each branch
  branchCounts.forEach((item, index) => {
    body += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.branch}</td>
        <td>${item.count}</td>
      </tr>`;
  });
  body += `
    </table>
  </div>
</body>
</html>`;

  // Return both subject and body
  return {
    subject,
    body
  };
}


//--------------------------------------------------------------------------howManyPdCompleteAndReject--------------------------------------
//6 pm mail schedule
cron.schedule("30 12 * * *", async () => {
  const PdCompleteAndReject = await mailSwitchesModel.findOne();
  if (PdCompleteAndReject?.masterMailStatus && PdCompleteAndReject?.pdMail && PdCompleteAndReject?.todaypdCompleteAndRejectEvening) {
    await todaypdCompleteAndRejectEvening(PdCompleteAndReject.finexeVersion);
  }
});


async function todaypdCompleteAndRejectEvening(finexeVersion) {
  try {
    const now = new Date();

console.log('api test')
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const startStr = todayStart.toISOString();
    const endStr = todayEnd.toISOString();

    const approvedCount = await externalManagerModel.countDocuments({
      statusByCreditPd: 'approve',
      creditPdCompleteDate: {
        $gte: startStr,
        $lte: endStr
      }
    });

    // Get count of rejected PDs today
    const rejectedCount = await externalManagerModel.countDocuments({
      statusByCreditPd: 'reject',
      creditPdCompleteDate: {
        $gte: startStr,
        $lte: endStr
      }
    });
    // Send summary email
    if ((approvedCount + rejectedCount) > 0) {
      console.log('ee')
      await sendPdCompleteEmail(approvedCount, rejectedCount , finexeVersion);
    }

    return {
      success: true,
      approvedCount,
      rejectedCount,
      totalCount: approvedCount + rejectedCount
    };

  } catch (error) {
    console.error('Error in dailyPdCountSummary:', error);
    return { success: false, message: error.message };
  }
}

async function sendPdCompleteEmail(approvedCount, rejectedCount , finexeVersion) {
  try {
    let toEmail = ""
if(finexeVersion === "PROD"){
 toEmail = "pd@fincoopers.in"
}else{
 toEmail = "darshanrajput@fincoopers.in";
}
    const subject = `PD Daily Count Summary - ${new Date().toLocaleDateString()}`;

    const emailBody = `
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header { 
          background-color: #2c3e50; 
          color: white; 
          padding: 20px; 
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content { 
          padding: 30px; 
          text-align: center;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 20px 0; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 15px; 
          text-align: center; 
          font-size: 18px;
        }
        th { 
          background-color: #34495e; 
          color: white; 
          font-weight: bold;
        }
        .approved { 
          color: #27ae60; 
          font-weight: bold; 
          font-size: 24px;
        }
        .rejected { 
          color: #e74c3c; 
          font-weight: bold; 
          font-size: 24px;
        }
        .total { 
          color: #3498db; 
          font-weight: bold; 
          font-size: 24px;
        }
        .footer { 
          text-align: center;
          padding: 20px;
          font-size: 12px; 
          color: #7f8c8d;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>PD Daily Count Summary</h2>
          <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="content">
          <h3>Today's PD Status Count</h3>
          
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Approved</td>
                <td class="approved">${approvedCount}</td>
              </tr>
              <tr>
                <td>Rejected</td>
                <td class="rejected">${rejectedCount}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td class="total">${approvedCount + rejectedCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>`;

    const emailSent = await leadMailFunction({
      to: toEmail,
      subject: subject,
      html: emailBody
    });

    console.log(`PD Count Email sent - Approved: ${approvedCount}, Rejected: ${rejectedCount}`);
    return { success: emailSent };

  } catch (error) {
    console.error('Error sending PD count email:', error);
    return { success: false, message: error.message };
  }
}


async function mailFunctionTestMail(req, res) {
  try {
    const totalPdPending = await mailSwitchesModel.findOne();
    // if (totalPdPending?.masterMailStatus && totalPdPending?.pdMail && totalPdPending?.totalPdPendingMailMorning) {
      await todaypdCompleteAndRejectEvening(totalPdPending.finexeVersion);
    // }
  } catch (error) {
    console.log('error', error)
  }
}


module.exports = { mailSendCustomerPdDone, fileCreateMailSend, bracnhPendencyFormsMailSend, getApprovedCibilReports, mailFunctionTestMail }
