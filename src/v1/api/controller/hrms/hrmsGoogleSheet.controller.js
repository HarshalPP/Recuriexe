const credentials = require("../../../../../credential.json");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const moment = require("moment");

// sheet headers
const JobCandidateHeaders = [
  "Name",
  "Mobile Number",
  "Email ID",
  "Highest Qualification",
  "University",
  "Graduation Year",
  "CGPA",
  "Address",
  "State",
  "City",
  "Pincode",
  "Skills",
  "Prefered InterviewMode",
  "Position",
  "Knew About JobPost From",
  "Current Designation",
  "Last Organization",
  "Start Date",
  "End Date",
  "Current CTC",
  "Reason for Leaving",
  "Total Experience",
  "Current Location",
  "Prefered Location",
  "Gap If Any",
  "Employe UniqueId",
  "_id",
  "Apply Type",
  "Assigned_Date",
];

const JobPostHeaders = [
  "Position",
  "Eligibility",
  "Experience ",
  "No of position",
  "Budget",
  "Employment Type",
  "Department",
  "Branch ",
  "Job Description ",
  "Status",
  "_id",
];

const vacancyRequestHeaders = [
  "Position",
  "Vacancy Type",
  "Eligibility",
  "Experience ",
  "No of position",
  "Package",
  "Priority",
  "Employment Type",
  "Department",
  "Branch ",
  "Job Description ",
  "Status",
  "Created By Manager",
  "Vacancy Approval",
  "Approved By",
  "_id",
  "Created By",
  "Updated By",
];

const JoiningFormHeaders = [
  "Name",
  "Gender",
  "Marital Status",
  "Mobile Number",
  "Email ID",
  "Date of Birth",
  "Identity Mark",
  "Current Address",
  "Current Address City",
  "Current Address State",
  "Current Address Pincode",
  "Permanent Address",
  "Permanent Address City",
  "Permanent Address State",
  "Permanent Address Pincode",
  "Name as per Bank",
  "Bank Name",
  "Bank Account",
  "IFSC Code",
  "UAN No",
  "ESIC Number",
  "Height",
  "Caste",
  "Category",
  "Religion",
  "Blood Group",
  "Home District",
  "Home State",
  "Nearest Railway Station",
  "Nominee Name",
  "Relation with Employee",
  "Nomination Type",
  "Nomination Age",
  "Nominee Address",
  "Nominee State",
  "Nominee District",
  "Nominee Block",
  "Nominee Panchayat",
  "Nominee Pincode",
  "Nominee Phone Number",
  "Aadhaar No",
  "PAN No",
  "Job Apply Form ID",
  "Family Details Name",
  "Family Details Relation",
  "Family Details Date Of Birth",
  "Family Details Dependent",
  "Family Details Whether Employed",
  "Family Details Occupation",
  "Family Details Department",
  "Family Details Company Name",
  "Education Details Education",
  "Education Details Name Of Board",
  "Education Details Marks Obtained",
  "Education Details Passing Year",
  "Education Details Stream",
  "Education Details Grade",
  "Employment History Work Experience",
  "Employment History Address",
  "Employment History Period From",
  "Employment History Period To",
  "Employment History Designation",
  "Employment History Industry",
  "Employment History Salary CTC",
  "Employment History Gross Salary",
  "Status",
  "Created At",
  "Updated At",
  "Status",
  "_id",
];

let JoiningFormHeadersWritten = false;
let JobPostHeadersWritten = false;
let vacancyRequestHeadersWritten = false;
let JobFormHeadersWritten = false;
let JobCandidateHeadersWritten =false;

function handleAxiosError(error) {
  if (error.response) {
    if (error.response.status === 400) {
      console.error('Bad Request (400): ', error.response.data);
    } else {
      console.error(`Error Response (${error.response.status}): `, error.response.data);
    }
  } else if (error.request) {
    console.error('No Response received: ', error.request);
  } else {
    console.error('Error: ', error.message);
  }
}

async function appendHeadersIfNeeded(
  sheets,
  spreadsheetId,
  sheetName,
  headers,
  headersWritten
) {
  if (!headersWritten) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:A1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        resource: { values: [headers] },
      });
    }

    headersWritten = true;
  }
  return headersWritten;
}

const headersMap = {
  "JOB FORM CANDIDATE": JobCandidateHeaders,
  "JOB POST": JobPostHeaders,
  "VACANCY REQUEST":vacancyRequestHeaders,
  "JOINING FORM":JoiningFormHeaders,
};

async function updateOrAppendToSheet(sheets, spreadsheetId, sheetName, values) {
  try {
    // Get current data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:AAX`,
    });

    const rows = response.data.values || [];

    // Get the appropriate headers based on sheetName
    const headers = headersMap[sheetName];
    if (!headers) {
      throw new Error(`Headers not defined for sheet: ${sheetName}`);
    }

    // Find the index of '_id' in the headers
    const _idIndex = headers.indexOf("_id");
    if (_idIndex === -1) {
      throw new Error("'_id' header not found in the provided headers.");
    }

    // Find the row index with the matching '_id'
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][_idIndex] == values[0][_idIndex]) {
        rowIndex = i + 2; // +2 to account for header row and 0-based index
        break;
      }
    }

    const resource = { values };

    if (rowIndex > -1) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:AAX${rowIndex}`,
        valueInputOption: "RAW",
        resource,
      });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource,
      });
    }
  } catch (error) {
    handleAxiosError(error);
  }
}

// HRMS job apply form sheet
async function jobFormGoogleSheet(jobApplyForm) {
  // console.log(jobApplyForm);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
// console.log(process.env.HRMS_GOOGLE_SHEET_KEY_LIVE);
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  JobCandidateHeadersWritten = await appendHeadersIfNeeded(
    sheets,
    process.env.HRMS_GOOGLE_SHEET_KEY_LIVE,
    // process.env.JOB_APPLY_FORM_STATE,
    "JOB FORM CANDIDATE",
    JobCandidateHeaders,
    JobCandidateHeadersWritten
  );

  // item.bankStatement.map(statement => baseUrl + statement).join(', '),

  const values = [
    [
      jobApplyForm.name,
      jobApplyForm.mobileNumber,
      jobApplyForm.emailId,
      jobApplyForm.highestQualification,
      jobApplyForm.university,
      jobApplyForm.graduationYear,
      jobApplyForm.cgpa,
      jobApplyForm.address,
      jobApplyForm.state,
      jobApplyForm.city,
      jobApplyForm.pincode,
      jobApplyForm.skills,
      jobApplyForm.preferedInterviewMode,
      jobApplyForm.position,
      jobApplyForm.knewaboutJobPostFrom,
      jobApplyForm.currentDesignation,
      jobApplyForm.lastOrganization,
      jobApplyForm.startDate,
      jobApplyForm.endDate,
      jobApplyForm.currentCTC,
      jobApplyForm.reasonLeaving,
      jobApplyForm.totalExperience,
      jobApplyForm.currentLocation,
      jobApplyForm.preferredLocation,
      jobApplyForm.gapIfAny,
      jobApplyForm.employeUniqueId,
      jobApplyForm.id,
      jobApplyForm.jobFormType,
      moment(jobApplyForm.createdAt).format("DD-MM-YYYY"),
    ],
  ];
  await updateOrAppendToSheet(
    sheets,
    process.env.HRMS_GOOGLE_SHEET_KEY_LIVE,
    // process.env.JOB_APPLY_FORM_STATE,
    "JOB FORM CANDIDATE",
    values
  );
}

// update only spefic date //

async function jobFormDate(jobApplyForm) {

  // console.log(jobApplyForm);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  const spreadsheetId = process.env.JOB_APPLY_FORM_STATE;
  const sheetName = "JOB FORM CANDIDATE";

  // Fetch existing data from Google Sheets
  const getSheetData = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:AC`, // Now includes column AC
  });
  

  const rows = getSheetData.data.values;
  if (!rows || rows.length === 0) return console.log("No data found in sheet");

  // console.log(`Updating Google Sheets rows: ${rows}`);

  // Find the correct row index using _id
// Find row index where _id matches
let rowIndex = -1;
for (let i = 1; i < rows.length; i++) { // Skip header row
  if (String(rows[i][26]).trim() == String(jobApplyForm._id).trim()) { // Column "AA" (index 26)
    rowIndex = i + 1; // Google Sheets is 1-based index
    break;
  }
}

  if (rowIndex === -1) {
    console.log(`No matching record found in Google Sheets for Employee ID: ${jobApplyForm._id}`);
    return;
  }

  // Format the createdAt date for Assigned_Date
  const Assigned_Date = moment(jobApplyForm.createdAt).format("DD-MM-YYYY");

  // Update only the Assigned_Date column (Adjust column "X" to actual index)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!AC${rowIndex}`, // Update Assigned_Date column
    valueInputOption: "RAW",
    requestBody: {
      values: [[Assigned_Date]],
    },
  });
  
}


// HRMS job post  sheet
async function joiningFormGoogleSheet(updatedCandidateDetails) {
  // console.log(jobPost)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  JoiningFormHeadersWritten = await appendHeadersIfNeeded(
    sheets,
    process.env.HRMS_GOOGLE_SHEET_KEY_LIVE,
    "JOINING FORM",
    JoiningFormHeaders,
    JoiningFormHeadersWritten
  );

  // item.bankStatement.map(statement => baseUrl + statement).join(', '),

  const values = [
    [
      updatedCandidateDetails.name,
      updatedCandidateDetails.gender,
      updatedCandidateDetails.maritalStatus,
      updatedCandidateDetails.mobileNumber,
      updatedCandidateDetails.emailId,
      updatedCandidateDetails.dateOfBirth,
      updatedCandidateDetails.identityMark,
      updatedCandidateDetails.currentAddress,
      updatedCandidateDetails.currentAddressCity,
      updatedCandidateDetails.currentAddressState,
      updatedCandidateDetails.currentAddressPincode,
      updatedCandidateDetails.permanentAddress,
      updatedCandidateDetails.permanentAddressCity,
      updatedCandidateDetails.permanentAddressState,
      updatedCandidateDetails.permanentAddressPincode,
      updatedCandidateDetails.nameAsPerBank,
      updatedCandidateDetails.bankName,
      updatedCandidateDetails.bankAccount,
      updatedCandidateDetails.ifscCode,
      updatedCandidateDetails.uanNo,
      updatedCandidateDetails.esicNumber,
      updatedCandidateDetails.height,
      updatedCandidateDetails.caste,
      updatedCandidateDetails.category,
      updatedCandidateDetails.religion,
      updatedCandidateDetails.bloodGroup,
      updatedCandidateDetails.homeDistrict,
      updatedCandidateDetails.homeState,
      updatedCandidateDetails.nearestRailwaySt,
      updatedCandidateDetails.nomineeName,
      updatedCandidateDetails.relationWithEmployee,
      updatedCandidateDetails.nominationType,
      updatedCandidateDetails.nominationAge,
      updatedCandidateDetails.nomineeAddress,
      updatedCandidateDetails.nomineeState,
      updatedCandidateDetails.nomineeDistrict,
      updatedCandidateDetails.nomineeblock,
      updatedCandidateDetails.nomineePanchayat,
      updatedCandidateDetails.nomineePincode,
      updatedCandidateDetails.nomineePhoneNumber,
      updatedCandidateDetails.aadhaarNo,
      updatedCandidateDetails.panNo,
      updatedCandidateDetails.jobApplyFormId,
      updatedCandidateDetails.familyDetails[0].name,
      updatedCandidateDetails.familyDetails[0].relation,
      updatedCandidateDetails.familyDetails[0].dateOfBirth,
      updatedCandidateDetails.familyDetails[0].dependent,
      updatedCandidateDetails.familyDetails[0].whetherEmployeed,
      updatedCandidateDetails.familyDetails[0].occupation,
      updatedCandidateDetails.familyDetails[0].department,
      updatedCandidateDetails.familyDetails[0].companyName,
      updatedCandidateDetails.educationDetails[0].education,
      updatedCandidateDetails.educationDetails[0].nameOfBoard,
      updatedCandidateDetails.educationDetails[0].marksObtained,
      updatedCandidateDetails.educationDetails[0].passingYear,
      updatedCandidateDetails.educationDetails[0].stream,
      updatedCandidateDetails.educationDetails[0].grade,
      updatedCandidateDetails.employeementHistory[0].workExperience,
      updatedCandidateDetails.employeementHistory[0].address,
      updatedCandidateDetails.employeementHistory[0].periodFrom,
      updatedCandidateDetails.employeementHistory[0].periodTo,
      updatedCandidateDetails.employeementHistory[0].designation,
      updatedCandidateDetails.employeementHistory[0].industry,
      updatedCandidateDetails.employeementHistory[0].salaryCtc,
      updatedCandidateDetails.employeementHistory[0].grossSalary,
      updatedCandidateDetails.status,
      updatedCandidateDetails.createdAt,
      updatedCandidateDetails.updatedAt,
      updatedCandidateDetails.status,
      updatedCandidateDetails._id,
    ],
  ];
  await updateOrAppendToSheet(
    sheets,
    process.env.HRMS_GOOGLE_SHEET_KEY_LIVE,
    "JOINING FORM",
    values
  );
}

// HRMS job post  sheet
async function jobPostGoogleSheet(
  jobPost,
  branchNames,
  employementTypeName,
  departmentName,
  jobDescriptionName
) {
  // console.log(jobPost)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  JobPostHeadersWritten = await appendHeadersIfNeeded(
    sheets,
    process.env.HRMS_GOOGLE_SHEET_KEY_LIVE,
    "JOB POST",
    JobPostHeaders,
    JobPostHeadersWritten
  );

  // item.bankStatement.map(statement => baseUrl + statement).join(', '),

  const values = [
    [
      jobPost.position,
      jobPost.eligibility,
      jobPost.experience,
      jobPost.noOfPosition,
      jobPost.budget,
      employementTypeName,
      departmentName,
      branchNames,
      jobDescriptionName,
      jobPost.status,
      jobPost._id,
      jobPost.createdAt,
      jobPost.updatedAt,
    ],
  ];
  await updateOrAppendToSheet(
    sheets,
    process.env.HRMS_GOOGLE_SHEET_KEY_LIVE,
    "JOB POST",
    values
  );
}

// HRMS vacancy request sheet
async function vacancyRequestGoogleSheet(
  position,
  vacancyRequest,
  branchNames,
  employementTypeName,
  departmentName,
  jobDescriptionName,
  createdByManager,
  vacancyApprovalBy
) {
  // console.log(jobPost)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  vacancyRequestHeadersWritten = await appendHeadersIfNeeded(
    sheets,
    process.env.HRMS_GOOGLE_SHEET_KEY_LIVE,
    "VACANCY REQUEST",
    vacancyRequestHeaders,
    vacancyRequestHeadersWritten
  );

  // item.bankStatement.map(statement => baseUrl + statement).join(', '),

  const values = [
    [
      position,
      vacancyRequest.vacancyType,
      vacancyRequest.eligibility,
      vacancyRequest.experience,
      vacancyRequest.noOfPosition,
      vacancyRequest.package,
      vacancyRequest.priority,
      employementTypeName,
      departmentName,
      branchNames,
      jobDescriptionName,
      vacancyRequest.status,
      createdByManager,
      vacancyRequest.vacancyApproval,
      vacancyApprovalBy,
      vacancyRequest._id,
      vacancyRequest.createdAt,
      vacancyRequest.updatedAt,
    ],
  ];
  await updateOrAppendToSheet(
    sheets,
    process.env.HRMS_GOOGLE_SHEET_KEY_LIVE,
    "VACANCY REQUEST",
    values
  );
}

module.exports = {
  jobFormGoogleSheet,
  jobPostGoogleSheet,
  joiningFormGoogleSheet,
  vacancyRequestGoogleSheet,
  jobFormDate
};
