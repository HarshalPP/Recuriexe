

///-----------------------------------------------------------------------///////////-----------------------------------------------------------

// import { google } from "googleapis";
// import jobApplyModel from "../../models/jobformModel/jobform.model.js";
// import mongoose from "mongoose";
// import credentials from "../../../../../liveSheet.json" assert { type: "json" };

// export const jobApplyToGoogleSheet = async (req, res) => {
//   try {
//     // const jobApplyId = req.body.jobApplyId;
//     const jobApplyId = "6844558db19b5c1b3b597ffc";

//     if (!jobApplyId || !mongoose.Types.ObjectId.isValid(jobApplyId)) {
//       console.log("Valid jobApplyId is required");
//     }

//     // 1. Fetch job application with enriched data
//     const jobAppliedDetails = await jobApplyModel.aggregate([
//       { $match: { _id: new mongoose.Types.ObjectId(jobApplyId) } },
//       {
//         $lookup: {
//           from: "jobposts",
//           localField: "jobPostId",
//           foreignField: "_id",
//           as: "jobPostDetail",
//         },
//       },
//       { $unwind: { path: "$jobPostDetail", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "newdesignations",
//           localField: "jobPostDetail.designationId",
//           foreignField: "_id",
//           as: "designationDetail",
//         },
//       },
//       { $unwind: { path: "$designationDetail", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "newdepartments",
//           localField: "jobPostDetail.departmentId",
//           foreignField: "_id",
//           as: "departmentDetail",
//         },
//       },
//       { $unwind: { path: "$departmentDetail", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "organizations",
//           localField: "jobPostDetail.organizationId",
//           foreignField: "_id",
//           as: "organizationDetail",
//         },
//       },
//       { $unwind: { path: "$organizationDetail", preserveNullAndEmptyArrays: true } },
//       {
//         $project: {
//           _id: 1,
//           candidateUniqueId:1,
//           name: 1,
//           mobileNumber: 1,
//           emailId: 1,
//           position: 1,
//           currentCTC: 1,
//           expectedCTC: 1,
//           resume: 1,
//           AI_Score: 1,
//           AI_Confidence: 1,
//           AI_Screeing_Status: 1,
//           AI_Screeing_Result: 1,
//           matchPercentage: 1,
//           Remark: 1,
//           organizationName: "$organizationDetail.name",
//           designationName: "$designationDetail.name",
//           departmentName: "$departmentDetail.name",
//         },
//       },
//     ]);

//     if (!jobAppliedDetails[0])
//       console.log("Job application not found.");

//     const data = jobAppliedDetails[0];
//     const spreadsheetId = process.env.HRMS_JOB_APPLY_SHEET_ID;
//     const sheetTitle = data.organizationName?.trim().toUpperCase();

//     if (!sheetTitle) {
//       console.log("Organization name is missing in job post");
//     }

//     // 2. Google Sheets Auth
//     const auth = new google.auth.GoogleAuth({
//       credentials,
//       scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//     });

//     const authClient = await auth.getClient();
//     const sheets = google.sheets({ version: "v4", auth: authClient });

//     // 3. Get existing sheets
//     const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
//     const sheetExists = sheetMeta.data.sheets.some(
//       (s) => s.properties.title === sheetTitle
//     );

//     // 4. If sheet doesn't exist, create and set headers
//     if (!sheetExists) {
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId,
//         requestBody: {
//           requests: [{ addSheet: { properties: { title: sheetTitle } } }],
//         },
//       });

//       const headers = [
//         [
//           "ID",
//           "Name",
//           "Mobile Number",
//           "Email ID",
//           "Position",
//           "Department",
//           "Current CTC",
//           "Expected CTC",
//           "AI Score",
//           "AI Confidence",
//           "Screening Status",
//           "Screening Result",
//           "Match %", 
//           "Remark",
//           "MongoDB ID"
//         ],
//       ];

//       await sheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: `${sheetTitle}!A1`,
//         valueInputOption: "RAW",
//         resource: { values: headers },
//       });
//     }

//     // 5. Get current data from the sheet
//     const sheetData = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: `${sheetTitle}!A2:Z`,
//     });

//     const rows = sheetData.data.values || [];
//     const mongoIdStr = data._id.toString();
//     let rowIndex = -1;

//     // Find row by _id in last column
//     for (let i = 0; i < rows.length; i++) {
//       if (rows[i][13] === mongoIdStr) {
//         rowIndex = i + 2; // because A2 is row 2
//         break;
//       }
//     }

//     // Prepare row data
//     const row = [
//       data.candidateUniqueId || "",
//       data.name || "",
//       data.mobileNumber || "",
//       data.emailId || "",
//       data.position || "",
//       data.departmentName || "",
//       data.currentCTC || "",
//       data.expectedCTC || "",
//       data.AI_Score || "",
//       data.AI_Confidence || "",
//       data.AI_Screeing_Status || "",
//       data.AI_Screeing_Result || "",
//       data.matchPercentage || "",
//       data.Remark || "",
//       mongoIdStr,
//     ];

//     if (rowIndex > 0) {
//       // Update existing row
//       await sheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: `${sheetTitle}!A${rowIndex}:N${rowIndex}`,
//         valueInputOption: "RAW",
//         resource: { values: [row] },
//       });
//     } else {
//       // Append new row
//       await sheets.spreadsheets.values.append({
//         spreadsheetId,
//         range: `${sheetTitle}!A2:N`,
//         valueInputOption: "RAW",
//         insertDataOption: "INSERT_ROWS",
//         resource: { values: [row] },
//       });
//     }
// console.log("Job application successfully pushed to Google Sheets")
//   } catch (error) {
//     console.error("Error pushing to Google Sheet:", error);
//   }
// };



///--------------------------------------------------------------------====-------------------------------------------------------------

import { google } from "googleapis";
import mongoose from "mongoose";
import jobApplyModel from "../../models/jobformModel/jobform.model.js";
import credentials from "../../../../../liveSheet.json" with { type: "json" };

export const jobApplyToGoogleSheet = async (jobApplyId) => {
  try {

    if (!jobApplyId || !mongoose.Types.ObjectId.isValid(jobApplyId)) {
      console.log("Invalid or missing jobApplyId");
    }

    // 1. Fetch job application data
    const jobAppliedDetails = await jobApplyModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(jobApplyId) } },
      {
        $lookup: {
          from: "jobposts",
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPostDetail",
        },
      },
      { $unwind: { path: "$jobPostDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPostDetail.designationId",
          foreignField: "_id",
          as: "designationDetail",
        },
      },
      { $unwind: { path: "$designationDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPostDetail.departmentId",
          foreignField: "_id",
          as: "departmentDetail",
        },
      },
      { $unwind: { path: "$departmentDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "organizations",
          localField: "jobPostDetail.organizationId",
          foreignField: "_id",
          as: "organizationDetail",
        },
      },
      { $unwind: { path: "$organizationDetail", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          candidateUniqueId: 1,
          name: 1,
          mobileNumber: 1,
          emailId: 1,
          position: 1,
          currentCTC: 1,
          expectedCTC: 1,
          createdAt: 1,
          AI_Score: 1,
          AI_Confidence: 1,
          AI_Screeing_Status: 1,
          AI_Screeing_Result: 1,
          matchPercentage: 1,
          Remark: 1,
          organizationName: "$organizationDetail.name",
          designationName: "$designationDetail.name",
          departmentName: "$departmentDetail.name",
        },
      },
    ]);

    const data = jobAppliedDetails[0];
    if (!data) {
      console.log("Job application not found.");
    }

    const spreadsheetId = process.env.HRMS_JOB_APPLY_SHEET_ID;
    const sheetTitle = data.organizationName?.trim().toUpperCase();

    if (!sheetTitle) {
      console.log("Organization name is missing");
    }

    // 2. Google Sheets Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // 3. Check existing sheets
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = sheetMeta.data.sheets.some(
      (s) => s.properties.title === sheetTitle
    );

    // 4. Create sheet and headers if not exist
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetTitle } } }],
        },
      });

      const headers = [
        [
          "ID",
          "Name",
          "Mobile Number",
          "Email ID",
          "Position",
          "Department",
          "Applied Date",
          "Current CTC",
          "Expected CTC",
          "AI Score",
          "AI Confidence",
          "Screening Status",
          "Screening Result",
          "Match %",
          "Remark",
          "MongoDB ID",
        ],
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetTitle}!A1`,
        valueInputOption: "RAW",
        resource: { values: headers },
      });
    }

    // 5. Read existing rows to check if MongoDB _id exists
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetTitle}!A2:Z`,
    });

    const rows = sheetData.data.values || [];
    const mongoIdStr = data._id.toString();
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][14] === mongoIdStr) {
        rowIndex = i + 2;
        break;
      }
    }
    const formattedDate = new Date(data.createdAt).toLocaleDateString("en-GB");
    // Output: "13/06/2025"

    // 6. Prepare row data
    const row = [
      data.candidateUniqueId || "",
      data.name || "",
      // data.mobileNumber || "",
      `${data.mobileNumber}`,
      data.emailId || "",
      data.position || "",
      data.departmentName || "",
      formattedDate,
      data.currentCTC || "",
      data.expectedCTC || "",
      data.AI_Score || "",
      data.AI_Confidence || "",
      data.AI_Screeing_Status || "",
      data.AI_Screeing_Result || "",
      data.matchPercentage || "",
      data.Remark || "",
      mongoIdStr,
    ];

    if (rowIndex > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetTitle}!A${rowIndex}:O${rowIndex}`,
        valueInputOption: "RAW",
        resource: { values: [row] },
      });
      console.log(`Updated row ${rowIndex} for ID: ${mongoIdStr}`);
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetTitle}!A2:O`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: { values: [row] },
      });
      console.log(`Inserted new row for ID: ${mongoIdStr}`);
    }

    console.log("Job application data pushed to Google Sheet.")
  } catch (error) {
    console.error("Error pushing to Google Sheet:", error);

  }
};


export const bulkJobApplyToGoogleSheet = async () => {
  try {
    const allJobApplications = await jobApplyModel.aggregate([
      {
        $lookup: {
          from: "jobposts",
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPostDetail",
        },
      },
      { $unwind: { path: "$jobPostDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPostDetail.designationId",
          foreignField: "_id",
          as: "designationDetail",
        },
      },
      { $unwind: { path: "$designationDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPostDetail.departmentId",
          foreignField: "_id",
          as: "departmentDetail",
        },
      },
      { $unwind: { path: "$departmentDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "organizations",
          localField: "jobPostDetail.organizationId",
          foreignField: "_id",
          as: "organizationDetail",
        },
      },
      { $unwind: { path: "$organizationDetail", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          candidateUniqueId: 1,
          name: 1,
          mobileNumber: 1,
          emailId: 1,
          position: 1,
          currentCTC: 1,
          expectedCTC: 1,
          createdAt: 1,
          AI_Score: 1,
          AI_Confidence: 1,
          AI_Screeing_Status: 1,
          AI_Screeing_Result: 1,
          matchPercentage: 1,
          Remark: 1,
          organizationName: "$organizationDetail.name",
          designationName: "$designationDetail.name",
          departmentName: "$departmentDetail.name",
        },
      },
    ]);

    console.log(`allJobApplications`,allJobApplications.length);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const spreadsheetId = process.env.HRMS_JOB_APPLY_SHEET_ID;

    // Group data by organization name
    const orgMap = {};
    for (const data of allJobApplications) {
      const sheetTitle = data.organizationName?.trim().toUpperCase();
      if (!sheetTitle) continue;
      if (!orgMap[sheetTitle]) orgMap[sheetTitle] = [];

      const formattedDate = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString("en-GB")
        : "";

      orgMap[sheetTitle].push([
        data.candidateUniqueId || "",
        data.name || "",
        `${data.mobileNumber}`.replace(/[^0-9]/g, ""),
        data.emailId || "",
        data.position || "",
        data.departmentName || "",
        formattedDate,
        data.currentCTC || "",
        data.expectedCTC || "",
        data.AI_Score || "",
        data.AI_Confidence || "",
        data.AI_Screeing_Status || "",
        data.AI_Screeing_Result || "",
        data.matchPercentage || "",
        data.Remark || "",
        data._id.toString(),
      ]);
    }

    const headers = [
      [
        "ID",
        "Name",
        "Mobile Number",
        "Email ID",
        "Position",
        "Department",
        "Applied Date",
        "Current CTC",
        "Expected CTC",
        "AI Score",
        "AI Confidence",
        "Screening Status",
        "Screening Result",
        "Match %",
        "Remark",
        "MongoDB ID",
      ],
    ];

    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = sheetMeta.data.sheets.map(
      (s) => s.properties.title
    );

    for (const [sheetTitle, rows] of Object.entries(orgMap)) {
      if (!existingSheets.includes(sheetTitle)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: sheetTitle } } }],
          },
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetTitle}!A1`,
          valueInputOption: "RAW",
          resource: { values: headers },
        });
      }

      // Append all rows at once
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetTitle}!A2`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: { values: rows },
      });
    }

    console.log("All job applications pushed to Google Sheets by organization");
  } catch (error) {
    console.error("Error in bulkJobApplyToGoogleSheet:", error);
  }
};
