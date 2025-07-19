// const credentials = require('../../../../../credential.json');
const credentials = require("../../../../../liveSheet.json");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

function handleAxiosError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code that falls out of the range of 2xx
    if (error.response.status === 400) {
      console.error("Bad Request (400): ", error.response.data);
    } else {
      console.error(
        `Error Response (${error.response.status}): `,
        error.response.data
      );
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error("No Response received: ", error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Error: ", error.message);
  }
}

const companyHeaders = [
  "COMPANY NAME",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];
const branchHeaders = [
  "_id",
  "BRANCH",
  "ADDRESS",
  "AREA",
  "CITY",
  "STATE",
  "COUNTRY",
  "PINCODE",
  "LATITUDE",
  "LONGITUDE",
  "COMPANYID",
];

const newBranchHeaders = [
  "_id",
  "NAME",
  "ADDRESS",
  "CITY",
  "STATE",
  "PINCODE",
  "TYPE",
  "REGIONAL",
  "REGIONALBRANCHID",
  "LATITUDE",
  "LONGITUDE",
  "STATUS",
  "CREATED AT",
  "UPDATED AT",
  "BUDGET"
];

const costCenterHeaders = [
  "TITLE",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];

const workLocationHeaders = [
  "TITLE",
  "ADDRESS",
  "AREA",
  "CITY",
  "STATE",
  "COUNTRY",
  "PINCODE",
  "CREATED AT",
  "UPDATED AT",
  "COMPANYID",
  "BRANCHID",
  "_id",
  "STATUS",
];

const newWorkLocationHeaders = [
  "_id",
  "NAME",
  "BRANCH ID",
  "LATITUDE",
  "LONGITUDE",
  "STATUS",
  "CREATED AT",
  "UPDATED AT",
];

const roleHeaders = ["ROLENAME", "CREATED AT", "UPDATED AT", "_id", "STATUS"];

const departmentHeaders = ["DEPARTMENTNAME", "_id"];
const newDepartmentHeaders = [
  "_id",
  "NAME",
  "STATUS",
  "CREATED AT",
  "UPDATED AT",
];

const designationHeaders = [
  "DESIGNATIONNAME",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "COMPANYID",
  "BRANCHID",
  "WORKLOCATIONID",
  "DEPARTMENTID",
  "STATUS",
];

const newDesignationHeaders = [
  "_id",
  "NAME",
  "STATUS",
  "CREATED AT",
  "UPDATED AT",
];

const employmentTypeHeaders = [
  "TITLE",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];

const employeeTypeHeaders = [
  "TITLE",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];

const employeeHeaders = [
  "EMPLOYEEUNIQUID",
  "EMPLOYEE NAME",
  "USER NAME",
  "EMAIL",
  "WORK EMAIL",
  "MOBILE NO",
  "JOINING DATE",
  "DATE OF BIRTH",
  "FATHER NAME",
  "CURRENT ADDRESS",
  "PERMANENT ADDRESS",
  "BRANCHID",
  "COMPANYID",
  "ROLEID",
  "REPORTINGMANAGERID",
  "DEPARTMENTID",
  "DESIGNATIONID",
  "WORKLOCATIONID",
  "COSTCENTERID",
  "EMPLOYMENTTYPEID",
  "EMPLOYEETYPEID",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
  "LATITUDE",
  "LONGITUDE",
  "GENDER",
  "SALUTATIONS",
  "MARITAL STATUS",
  // "PACKAGE",
  "BANK NAME",
  "BANK ACCOUNT NUMBER",
  "IFSC CODE",
  "NAME AS PER BANK ACCOUNT",
  "EMERGENCY NUMBER",
  "MOTHER'S NAME",
  "FATHER'S OCCUPATION",
  "FATHER'S MOBILE NUMBER",
  "MOTHER'S MOBILE NUMBER",
  "FAMILY INCOME",
  "HIGHEST QUALIFICATION",
  "UNIVERSITY",
  "LAST ORGANIZATION",
  "DESIGNATION",
  "CTC",
  "WORKED FROM",
  "WORKED TO",
  "TOTAL EXPERIENCE",
  "CURRENT ADDRESS CITY",
  "CURRENT ADDRESS STATE",
  "CURRENT ADDRESS PINCODE",
  "PERMANENT ADDRESS CITY",
  "PERMANENT ADDRESS STATE",
  "PERMANENT ADDRESS PINCODE",
  "REFERED BY",
  "SUB DEPARTMENTID",
  "UAN NUMBER",
  "ESIC NUMBER",
  "ONBOARDING STATUS",
  "REASON",
  "DATE OF CHANGE",
  "ACTION TAKEN BY",
  "EMPLOYEE_TARGET"
];
const customerResponseHeaders = [
  "TITLE",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];

const modeOfCollectionHeaders = [
  "TITLE",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];

const productHeaders = [
  "PRODUCT NAME",
  "LOAN AMOUNT MIN",
  "LOAN AMOUNT MAX",
  "ROI MIN",
  "ROI MAX",
  "TENURE MAN",
  "TENURE MAX",
  "LOGIN FEES",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];

const vendorTypeHeaders = [
  "VENDOR TYPE",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];

const vendorHeaders = [
  "BRANCH NAME",
  "EMPLOYEE UQNIQUE ID",
  "VENDOR ROLE",
  "FULL NAME",
  "CONTACT",
  "EMAIL",
  "ADDRESS",
  "VENDOR TYPE",
  "UPLOAD DOC",
  "COMPANY NAME",
  "RATE",
  "COMMUNICATION MAIL ID",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];
const partnerNameHeaders = [
  "NAME",
  "CREATED AT",
  "UPDATED AT",
  "_id",
  "STATUS",
];

let companyHeadersWritten = false;
let branchHeadersWritten = false;
let newBranchHeadersWritten = false;
let costCenterHeadersWritten = false;
let workLocationHeadersWritten = false;
let newWorkLocationHeadersWritten = false;
let roleHeadersWritten = false;
let departmentHeadersWritten = false;
let newDepartmentHeadersWritten = false;
let designationHeadersWritten = false;
let newDesignationHeadersWritten = false;
let employeeTypeHeadersWritten = false;
let employmentTypeHeadersWritten = false;
let employeeHeadersWritten = false;
let customerResponseHeadersWritten = false;
let modeOfCollectionHeadersWritten = false;
let productHeadersWritten = false;
let vendorHeadersWritten = false;
let vendorTypeHeadersWritten = false;
let partnerNameHeadersWritten = false;

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

async function appendHeadersIfNeededNew(
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
  "COMPANY DETAILS": companyHeaders,
  "BRANCH DETAILS": branchHeaders,
  "NEW BRANCH DETAILS": newBranchHeaders,
  "COST CENTER DETAILS": costCenterHeaders,
  "WORK LOCATION DETAILS": workLocationHeaders,
  "NEW WORK LOCATION DETAILS": newWorkLocationHeaders,
  "ROLE DETAILS": roleHeaders,
  "DEPARTMENT DETAILS": departmentHeaders,
  "NEW DEPARTMENT DETAILS": newDepartmentHeaders,
  "DESIGNATION DETAILS": designationHeaders,
  "NEW DESIGNATION DETAILS": newDesignationHeaders,
  "EMPLOYMENTTYPE DETAILS": employmentTypeHeaders,
  "EMPLOYEETYPE DETAILS": employeeTypeHeaders,
  "EMPLOYEE DETAILS": employeeHeaders,
  "CUSTOMER RESPONSE DETAILS": customerResponseHeaders,
  "MODE OF COLLECTION DETAILS": modeOfCollectionHeaders,
  "PRODUCT DETAILS": productHeaders,
  "VENDOR DETAILS": vendorHeaders,
  "VENDOR TYPE DETAILS": vendorTypeHeaders,
  "PARTNER NAME": partnerNameHeaders,
  BRANCHES: branchHeaders,
  DEPARTMENT: departmentHeaders,
  DESIGNATION: departmentHeaders,
  EMPLOYEE: employeeHeaders,
  "TEST_CHECK": employeeHeaders, // ✅ FIXED: Added "TEST_CHECK" headers
};

// const data ={
//   "one":one
// }

async function updateOrAppendToSheet(sheets, spreadsheetId, sheetName, values) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:BZ`,
    });
    const rows = response.data.values || [];

    const headers = headersMap[sheetName];
    if (!headers) {
      throw new Error(`Headers not defined for sheet : ${sheetName}`);
    }

    const _idIndex = headers.indexOf("_id");
    if (_idIndex === -1) {
      throw new Error("'_id' header not found in the provided headers.");
    }

    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][_idIndex] == values[0][_idIndex]) {
        rowIndex = i + 2;
        break;
      }
    }

    const resource = { values };

    if (rowIndex > -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:BZ${rowIndex}`,
        valueInputOption: "RAW",
        resource,
      });
    } else {
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

async function updateOrAppendToSheetNew(
  sheets,
  spreadsheetId,
  sheetName,
  values
) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:BZ`,
    });
    const rows = response.data.values || [];

    const headers = headersMap[sheetName];
    if (!headers) {
      throw new Error(`Headers not defined for sheet : ${sheetName}`);
    }

    const _idIndex = headers.indexOf("_id");
    if (_idIndex === -1) {
      throw new Error("'_id' header not found in the provided headers.");
    }

    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][_idIndex] == values[0][_idIndex]) {
        rowIndex = i + 2;
        break;
      }
    }

    const resource = { values };

    if (rowIndex > -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:BZ${rowIndex}`,
        valueInputOption: "RAW",
        resource,
      });
    } else {
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

async function companyGoogleSheet(companyDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    companyHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "COMPANY DETAILS",
      companyHeaders,
      companyHeadersWritten
    );

    const values = [
      [
        companyDetail.companyName,
        companyDetail.createdAt,
        companyDetail.updatedAt,
        companyDetail._id,
        companyDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "COMPANY DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function branchGoogleSheet(branchDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    branchHeadersWritten = await appendHeadersIfNeededNew(
      sheets,
      process.env.COMPANYSETUP_GOOGLE_SHEET_KEY_LIVE,
      process.env.BRANCHES_SHEET,
      branchHeaders,
      branchHeadersWritten
    );

    const values = [
      [
        branchDetail.branch,
        branchDetail.address,
        branchDetail.area,
        branchDetail.city,
        branchDetail.State,
        branchDetail.country,
        branchDetail.pincode,
        branchDetail.location.coordinates[0],
        branchDetail.location.coordinates[1],
      ],
    ];

    await updateOrAppendToSheetNew(
      sheets,
      process.env.COMPANYSETUP_GOOGLE_SHEET_KEY_LIVE,
      process.env.BRANCHES_SHEET,
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function newBranchGoogleSheet(branchDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    newBranchHeadersWritten = await appendHeadersIfNeededNew(
      sheets,
      process.env.NEW_ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "NEW BRANCH DETAILS",
      newBranchHeaders,
      newBranchHeadersWritten
    );

    const values = [
      [
        branchDetail._id,
        branchDetail.name,
        branchDetail.address,
        branchDetail.city,
        branchDetail.state,
        branchDetail.pincode,
        branchDetail.type,
        branchDetail.regional,
        branchDetail.regionalBranch,
        branchDetail.location.coordinates[0],
        branchDetail.location.coordinates[1],
        branchDetail.status,
        branchDetail.createdAt,
        branchDetail.updatedAt,
        branchDetail.budget,
      ],
    ];
    await updateOrAppendToSheetNew(
      sheets,
      process.env.NEW_ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "NEW BRANCH DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}
async function costCenterGoogleSheet(costCenterDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    costCenterHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "COST CENTER DETAILS",
      costCenterHeaders,
      costCenterHeadersWritten
    );

    const values = [
      [
        costCenterDetail.title,
        costCenterDetail.createdAt,
        costCenterDetail.updatedAt,
        costCenterDetail._id,
        costCenterDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "COST CENTER DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function workLocationGoogleSheet(workLocationDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    workLocationHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "WORK LOCATION DETAILS",
      workLocationHeaders,
      workLocationHeadersWritten
    );

    const values = [
      [
        workLocationDetail.title,
        workLocationDetail.address,
        workLocationDetail.area,
        workLocationDetail.city,
        workLocationDetail.State,
        workLocationDetail.country,
        workLocationDetail.pincode,
        workLocationDetail.createdAt,
        workLocationDetail.updatedAt,
        workLocationDetail.companyId,
        workLocationDetail.branchId,
        workLocationDetail._id,
        workLocationDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "WORK LOCATION DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function newWorkLocationGoogleSheet(workLocationDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    newWorkLocationHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.NEW_ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "NEW WORK LOCATION DETAILS",
      newWorkLocationHeaders,
      newWorkLocationHeadersWritten
    );

    const values = [
      [
        workLocationDetail._id,
        workLocationDetail.name,
        workLocationDetail.branch,
        workLocationDetail.location.coordinates[0],
        workLocationDetail.location.coordinates[1],
        workLocationDetail.status,
        workLocationDetail.createdAt,
        workLocationDetail.updatedAt,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.NEW_ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "NEW WORK LOCATION DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function roleGoogleSheet(roleDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    roleHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "ROLE DETAILS",
      roleHeaders,
      roleHeadersWritten
    );

    const values = [
      [
        roleDetail.roleName,
        roleDetail.createdAt,
        roleDetail.updatedAt,
        roleDetail._id,
        roleDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "ROLE DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function departmentGoogleSheet(departmentDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    departmentHeadersWritten = await appendHeadersIfNeededNew(
      sheets,
      process.env.COMPANYSETUP_GOOGLE_SHEET_KEY_LIVE,
      process.env.DEPARTMENT_SHEET,
      departmentHeaders,
      departmentHeadersWritten
    );

    const values = [[departmentDetail.departmentName]];

    await updateOrAppendToSheetNew(
      sheets,
      process.env.COMPANYSETUP_GOOGLE_SHEET_KEY_LIVE,
      process.env.DEPARTMENT_SHEET,
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function newDepartmentGoogleSheet(departmentDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    newDepartmentHeadersWritten = await appendHeadersIfNeededNew(
      sheets,
      process.env.NEW_ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "NEW DEPARTMENT DETAILS",
      newDepartmentHeaders,
      newDepartmentHeadersWritten
    );

    const values = [
      [
        departmentDetail._id,
        departmentDetail.name,
        departmentDetail.isActive,
        departmentDetail.createdAt,
        departmentDetail.updatedAt,
      ],
    ];

    await updateOrAppendToSheetNew(
      sheets,
      process.env.NEW_ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "NEW DEPARTMENT DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function designationGoogleSheet(designationDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    designationHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "DESIGNATION DETAILS",
      designationHeaders,
      designationHeadersWritten
    );

    const values = [
      [
        designationDetail.designationName,
        designationDetail.createdAt,
        designationDetail.updatedAt,
        designationDetail._id,
        designationDetail.companyId,
        designationDetail.branchId,
        designationDetail.workLocationId,
        designationDetail.departmentId,
        designationDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "DESIGNATION DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function newDesignationGoogleSheet(designationDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    newDesignationHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.NEW_ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "NEW DESIGNATION DETAILS",
      newDesignationHeaders,
      newDesignationHeadersWritten
    );

    const values = [
      [
        designationDetail._id,
        designationDetail.name,
        designationDetail.status,
        designationDetail.createdAt,
        designationDetail.updatedAt,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.NEW_ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "NEW DESIGNATION DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function employmentTypeGoogleSheet(employmentTypeDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    employmentTypeHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "EMPLOYMENTTYPE DETAILS",
      employmentTypeHeaders,
      employmentTypeHeadersWritten
    );

    const values = [
      [
        employmentTypeDetail.title,
        employmentTypeDetail.createdAt,
        employmentTypeDetail.updatedAt,
        employmentTypeDetail._id,
        employmentTypeDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "EMPLOYMENTTYPE DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function employeeTypeGoogleSheet(employeeTypeDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    employeeTypeHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "EMPLOYEETYPE DETAILS",
      employeeTypeHeaders,
      employeeTypeHeadersWritten
    );

    const values = [
      [
        employeeTypeDetail.title,
        employeeTypeDetail.createdAt,
        employeeTypeDetail.updatedAt,
        employeeTypeDetail._id,
        employeeTypeDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "EMPLOYEETYPE DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function employeeGoogleSheet(
  employeeDetail,
  branchName,
  companyName,
  roleName,
  reportingManagerName,
  departmentName,
  designationName,
  workLocationName,
  constCenterName,
  employementTypeName,
  employeeTypeName,
  referedBYName,
  subDepartmentName,
  secondaryDepartmenName,
  seconSubDepartmentName,
  actionTakenBy,
  lastEntry
) {
  try {
  
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    employeeHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "EMPLOYEE DETAILS",
      employeeHeaders,
      employeeHeadersWritten
    );

    const values = [
      [
        employeeDetail.employeUniqueId,
        employeeDetail.employeName,
        employeeDetail.userName,
        employeeDetail.email,
        employeeDetail.workEmail,
        employeeDetail.mobileNo,
        employeeDetail.joiningDate,
        employeeDetail.dateOfBirth,
        employeeDetail.fatherName,
        employeeDetail.currentAddress,
        employeeDetail.permanentAddress,
        branchName,
        companyName,
        roleName,
        reportingManagerName,
        departmentName,
        designationName,
        workLocationName,
        constCenterName,
        employementTypeName,
        employeeTypeName,
        employeeDetail.createdAt,
        employeeDetail.updatedAt,
        employeeDetail._id,
        employeeDetail.status,
        employeeDetail.location.coordinates[0],
        employeeDetail.location.coordinates[1],
        employeeDetail.gender,
        employeeDetail.salutation,
        employeeDetail.maritalStatus,
        // employeeDetail.package,
        employeeDetail.bankName,
        employeeDetail.bankAccount,
        employeeDetail.ifscCode,
        employeeDetail.nameAsPerBank,
        employeeDetail.emergencyNumber,
        employeeDetail.motherName,
        employeeDetail.fathersOccupation,
        employeeDetail.fathersMobileNo,
        employeeDetail.mothersMobileNo,
        employeeDetail.familyIncome,
        employeeDetail.highestQualification,
        employeeDetail.university,
        employeeDetail.lastOrganization,
        employeeDetail.currentDesignation,
        employeeDetail.currentCTC,
        employeeDetail.startDate,
        employeeDetail.endDate,
        employeeDetail.totalExperience,
        employeeDetail.currentAddressCity,
        employeeDetail.currentAddressState,
        employeeDetail.currentAddressPincode,
        employeeDetail.permanentAddressCity,
        employeeDetail.permanentAddressState,
        employeeDetail.permanentAddressPincode,
        referedBYName,
        subDepartmentName,
        employeeDetail.uanNumber,
        employeeDetail.esicNumber,
        secondaryDepartmenName,
        seconSubDepartmentName,
        employeeDetail.onboardingStatus,
        lastEntry.reason,
        lastEntry.date,
        actionTakenBy
      ],
    ];
    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "EMPLOYEE DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}



async function updateOrAppendEmployeeTargetToSheet(employeeId, employeeTarget) {
  console.log("employeeId", employeeId);
  console.log("employeeTarget", employeeTarget);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const sheetName = "EMPLOYEE DETAILS";
    const spreadsheetId = process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE;

    // Fetch headers
    const headers = headersMap[sheetName];
    if (!headers) throw new Error(`Headers not defined for sheet: ${sheetName}`);

    // Fetch existing sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:BZ`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) throw new Error(`Sheet is empty: ${sheetName}`);

    const sheetHeaders = rows[0] || [];
    const _idIndex = sheetHeaders.indexOf("_id");
    const targetIndex = sheetHeaders.indexOf("EMPLOYEE_TARGET");

    if (_idIndex === -1) throw new Error(`"_id" column not found in sheet: ${sheetName}`);
    if (targetIndex === -1) throw new Error(`"EMPLOYEE TARGET" column not found in sheet: ${sheetName}`);

    // Find employee row index
    let rowIndex = -1;
    let existingTargetData = "";

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][_idIndex] === employeeId) {
        rowIndex = i + 1; // Convert to 1-based index
        existingTargetData = rows[i][targetIndex] || "";
        break;
      }
    }

    // Convert existing target data from text format to an object map
    let existingTargets = {};
    if (existingTargetData) {
      existingTargetData.split("\n").forEach((line) => {
        const parts = line.split(": ");
        if (parts.length === 2) {
          existingTargets[parts[0]] = parts[1];
        }
      });
    }

    // Update existing titles or add new ones
    employeeTarget.forEach(({ title, value }) => {
      existingTargets[title] = value; // Update or add
    });

    // Convert back to plain text format
    const formattedData = Object.entries(existingTargets)
      .map(([title, value]) => `${title}: ${value}`)
      .join("\n");

    // Update or append to the sheet
    const updateRange = `${sheetName}!${getColumnLetter(targetIndex + 1)}${rowIndex}`;
    const updateValues = [[formattedData]];

    if (rowIndex > 0) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: "RAW",
        resource: { values: updateValues },
      });
      console.log(`✅ Updated employee target for Employee ID: ${employeeId}`);
    } else {
      // Append new row
      const newRow = new Array(sheetHeaders.length).fill("");
      newRow[_idIndex] = employeeId;
      newRow[targetIndex] = formattedData;

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: { values: [newRow] },
      });

      console.log(`✅ Added new employee entry for Employee ID: ${employeeId}`);
    }
  } catch (error) {
    console.error("❌ Error updating employee target in Google Sheet:", error);
  }
}

// Helper function to get column letter
function getColumnLetter(colNum) {
  let letter = "";
  while (colNum > 0) {
    let remainder = (colNum - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    colNum = Math.floor((colNum - 1) / 26);
  }
  return letter;
}




// // Utility function to get column letter
// function getColumnLetter(colNum) {
//   let letter = "";
//   while (colNum > 0) {
//     let remainder = (colNum - 1) % 26;
//     letter = String.fromCharCode(65 + remainder) + letter;
//     colNum = Math.floor((colNum - 1) / 26);
//   }
//   return letter;
// }


// async function employeeGoogleSheet(
//   employeeDetail,
//   branchName,
//   companyName,
//   roleName,
//   reportingManagerName,
//   departmentName,
//   designationName,
//   workLocationName,
//   constCenterName,
//   employementTypeName,
//   employeeTypeName,
//   referedBYName
// ) {
//   try {
//     const auth = new google.auth.GoogleAuth({
//       credentials,
//       scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//     });
//     const authClient = await auth.getClient();
//     const sheets = google.sheets({ version: "v4", auth: authClient });

//     employeeHeadersWritten = await appendHeadersIfNeeded(
//       sheets,
//       process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
//       process.env.EMPLOYEE_SHEET,
//       employeeHeaders,
//       employeeHeadersWritten
//     );

//     const values = [
//       [
//         employeeDetail.employeUniqueId,
//         employeeDetail.employeName,
//         employeeDetail.userName,
//         employeeDetail.email,
//         employeeDetail.workEmail,
//         employeeDetail.mobileNo,
//         employeeDetail.joiningDate,
//         employeeDetail.dateOfBirth,
//         employeeDetail.fatherName,
//         employeeDetail.currentAddress,
//         employeeDetail.permanentAddress,
//         branchName,
//         companyName,
//         roleName,
//         reportingManagerName,
//         departmentName,
//         designationName,
//         workLocationName,
//         constCenterName,
//         employementTypeName,
//         employeeTypeName,
//         employeeDetail.createdAt,
//         employeeDetail.updatedAt,
//         employeeDetail._id,
//         employeeDetail.status,
//         employeeDetail.location.coordinates[0],
//         employeeDetail.location.coordinates[1],
//         employeeDetail.gender,
//         employeeDetail.salutation,
//         employeeDetail.maritalStatus,
//         // employeeDetail.package,
//         employeeDetail.bankName,
//         employeeDetail.bankAccount,
//         employeeDetail.ifscCode,
//         employeeDetail.nameAsPerBank,
//         employeeDetail.emergencyNumber,
//         employeeDetail.motherName,
//         employeeDetail.fathersOccupation,
//         employeeDetail.fathersMobileNo,
//         employeeDetail.mothersMobileNo,
//         employeeDetail.familyIncome,
//         employeeDetail.highestQualification,
//         employeeDetail.university,
//         employeeDetail.lastOrganization,
//         employeeDetail.currentDesignation,
//         employeeDetail.currentCTC,
//         employeeDetail.startDate,
//         employeeDetail.endDate,
//         employeeDetail.totalExperience,
//         employeeDetail.currentAddressCity,
//         employeeDetail.currentAddressState,
//         employeeDetail.currentAddressPincode,
//         employeeDetail.permanentAddressCity,
//         employeeDetail.permanentAddressState,
//         employeeDetail.permanentAddressPincode,
//         referedBYName,
//       ],
//     ];
//     await updateOrAppendToSheet(
//       sheets,
//       process.env.COMPANYSETUP_GOOGLE_SHEET_KEY_LIVE,
//       process.env.EMPLOYEE_SHEET,
//       values
//     );
//   } catch (error) {
//     console.log(error);
//     handleAxiosError(error);
//   }
// }

async function customerResponseGoogleSheet(customerResponseDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    customerResponseHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "CUSTOMER RESPONSE DETAILS",
      customerResponseHeaders,
      customerResponseHeadersWritten
    );

    const values = [
      [
        customerResponseDetail.title,
        customerResponseDetail.createdAt,
        customerResponseDetail.updatedAt,
        customerResponseDetail._id,
        customerResponseDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "CUSTOMER RESPONSE DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function modeOfCollectionGoogleSheet(modeOfCollectionDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    modeOfCollectionHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "MODE OF COLLECTION DETAILS",
      modeOfCollectionHeaders,
      modeOfCollectionHeadersWritten
    );

    const values = [
      [
        modeOfCollectionDetail.title,
        modeOfCollectionDetail.createdAt,
        modeOfCollectionDetail.updatedAt,
        modeOfCollectionDetail._id,
        modeOfCollectionDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "MODE OF COLLECTION DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function productGoogleSheet(productDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    productHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "PRODUCT DETAILS",
      productHeaders,
      productHeadersWritten
    );

    const values = [
      [
        productDetail.productName,
        productDetail.loanAmount.min,
        productDetail.loanAmount.max,
        productDetail.roi.min,
        productDetail.roi.max,
        productDetail.tenure.min,
        productDetail.tenure.max,
        productDetail.loginFees,
        productDetail.createdAt,
        productDetail.updatedAt,
        productDetail._id,
        productDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "PRODUCT DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function vendorGoogleSheet(vendorDetail) {
  try {

    console.log('employeUniqueId,', vendorDetail.branchNameStr, vendorDetail.employeUniqueId,)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    vendorHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "VENDOR DETAILS",
      vendorHeaders,
      vendorHeadersWritten
    );

    const baseUrl = process.env.BASE_URL;
    const values = [
      [
        vendorDetail?.branchNameStr?vendorDetail?.branchNameStr:'',
        vendorDetail?.employeUniqueId?vendorDetail?.employeUniqueId:'',
        vendorDetail.vendorRoleStr,
        vendorDetail.fullName,
        vendorDetail.contact,
        vendorDetail.email,
        vendorDetail.address,
        vendorDetail.vendorTypeStr,
        vendorDetail.userName,
        vendorDetail.uploaDoc
          .map((vendorDoc) => baseUrl + vendorDoc)
          .join(", "),
        vendorDetail.companyName,
        vendorDetail.rate,
        vendorDetail.communicationMailId,
        vendorDetail.createdAt,
        vendorDetail.updatedAt,
        vendorDetail._id,
        vendorDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "VENDOR DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function vendorTypeGoogleSheet(vendorTypeDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    vendorTypeHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "VENDOR TYPE DETAILS",
      vendorTypeHeaders,
      vendorTypeHeadersWritten
    );

    const values = [
      [
        vendorTypeDetail.vendorType,
        vendorTypeDetail.createdAt,
        vendorTypeDetail.updatedAt,
        vendorTypeDetail._id,
        vendorTypeDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "VENDOR TYPE DETAILS",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

async function partnerNameGoogleSheet(partnerDetail) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    partnerNameHeadersWritten = await appendHeadersIfNeeded(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "PARTNER NAME",
      partnerNameHeaders,
      partnerNameHeadersWritten
    );

    const values = [
      [
        partnerDetail.name,
        partnerDetail.createdAt,
        partnerDetail.updatedAt,
        partnerDetail._id,
        partnerDetail.status,
      ],
    ];

    await updateOrAppendToSheet(
      sheets,
      process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE,
      "PARTNER NAME",
      values
    );
  } catch (error) {
    handleAxiosError(error);
  }
}

module.exports = {
  companyGoogleSheet,
  branchGoogleSheet,
  newBranchGoogleSheet,
  costCenterGoogleSheet,
  workLocationGoogleSheet,
  newWorkLocationGoogleSheet,
  roleGoogleSheet,
  departmentGoogleSheet,
  newDepartmentGoogleSheet,
  designationGoogleSheet,
  newDesignationGoogleSheet,
  employeeTypeGoogleSheet,
  employmentTypeGoogleSheet,
  employeeGoogleSheet,
  customerResponseGoogleSheet,
  modeOfCollectionGoogleSheet,
  productGoogleSheet,
  vendorGoogleSheet,
  vendorTypeGoogleSheet,
  partnerNameGoogleSheet,
  updateOrAppendEmployeeTargetToSheet
};
