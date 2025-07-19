// const credentials = require('../../../../../credential.json');
const credentials = require('../../../../../liveSheet.json');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

function handleAxiosError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code that falls out of the range of 2xx
    if (error.response.status === 400) {
      console.error('Bad Request (400): ', error.response.data);
    } else {
      console.error(`Error Response (${error.response.status}): `, error.response.data);
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No Response received: ', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error: ', error.message);
  }
}

const loanCreateHeaders = [
  'AADHAR NO', 'ACCOUNT MODE', 'ANNUAL INCOME', 'AREA NAME', 'BIRTH DATE','_id'
  // 'CASTE', 'CITY CODE', 'CITY NAME', 'COUNTRY NAME', 'CUSTOMER ID', 'CUSTOMER TYPE',
  // 'DISTRICT NAME', 'DRIVILNG LICNO', 'EDUCATION', 'ELECTION ID NO', 'EMAIL ID',
  // 'EMPLOYMENT', 'EXTERNAL REF NO', 'FATHER FIRST NAME', 'FATHER LAST NAME', 'FATHER MIDDLE NAME',
  // 'FATHER OR SPOUSE', 'FATHER PREFIX', 'FIRST NAME', 'GENDER', 'INCEPTION DATE',

  // 'LAST NAME', 'LOAN APPLICATION DATE', 'LOAN APPLIED AMOUNT',
  // 'LOAN INSTALLMENT TYPE', 'LOAN PURPOSE', 'MAKER USER', 'MARITAL STATUS', 'MIDDLE NAME',
  // 'MOBILE NO', 'MOTHER FIRST NAME', 'MOTHER LAST NAME', 'MOTHER MIDDLE NAME', 'MOTHER PREFIX',
  // 'NUMBER OF INSTALLMENT', 'OCCUPATION', 'PAN', 'PERMANENT ADDRESS 1', 'PERMANENT ADDRESS 2',
  // 'PERMANENT ADDRESS 3', 'PINCODE', 'PLACE OF INCORPORATION', 'PREFIX', 'PROOF OF ADDRESS',
  // 'REFERENCE NUMBER', 'RELIGION', 'REQ BRANCH CD', 'REQ CALLER NM', 'REQ PRODUCT CODE',
  // 'RESIDENCE STATUS', 'ROI', 'STATE NAME', 'TYPE OF ACCOUNT', 'RISK CATEGORY', 'RELATED PERSON TYPE',
  // '_id', 'CREATED AT', 'UPDATED AT'
];


let loanCreateHeadersWritten = false;
 
async function appendHeadersIfNeeded(sheets, spreadsheetId, sheetName, headers, headersWritten) {
  if (!headersWritten) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:A1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: { values: [headers] },
      });
    }

    headersWritten = true;
  }
  return headersWritten;
}

const headersMap = {
  'LOAN-CREATE':loanCreateHeaders,
}

async function updateOrAppendToSheet(sheets, spreadsheetId, sheetName, values) {
  try {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:AX`,
  });
  const rows = response.data.values || [];

  const headers = headersMap[sheetName];
  if(!headers){
    throw new Error(`Headers not defined for sheet : ${sheetName}`);
  }

  const _idIndex = headers.indexOf('_id');
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
      range: `${sheetName}!A${rowIndex}:AX${rowIndex}`,
      valueInputOption: 'RAW',
      resource,
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource,
    });
  }

} catch (error) {
  handleAxiosError(error);
}
}


async function loanCreateGoogleSheet(loanCreateDetail) {
  try {  
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    loanCreateHeadersWritten = await appendHeadersIfNeeded(sheets, process.env.RATNAA_FIN_GOOGLE_SHEET_KEY_LIVE, 'LOAN-CREATE', loanCreateHeaders, loanCreateHeadersWritten);
    const values = [
        loanCreateDetail.aadharNo,
        loanCreateDetail.accountMode,
        loanCreateDetail.annualIncome,
        loanCreateDetail.areaName,
        loanCreateDetail.birthDate,
        loanCreateDetail._id,
    ]
        // loanCreateDetail.caste,
        // loanCreateDetail.cityCode,
        // loanCreateDetail.cityName,
        // loanCreateDetail.countryName,
        // loanCreateDetail.customerId,
        // loanCreateDetail.customerType,
        // loanCreateDetail.districtName,
        // loanCreateDetail.drivingLicNo,
        // loanCreateDetail.education,
        // loanCreateDetail.electionIdNo,
        // loanCreateDetail.emailId,
        // loanCreateDetail.employment,
        // loanCreateDetail.externalRefNo,
        // loanCreateDetail.fatherFirstName,
        // loanCreateDetail.fatherLastName,
        // loanCreateDetail.fatherMiddleName,
        // loanCreateDetail.fatherOrSpouse,
        // loanCreateDetail.fatherPrefix,
        // loanCreateDetail.firstName,
        // loanCreateDetail.gender,
        // loanCreateDetail.inceptionDate,


        // // Assuming we want to list joint holder data as part of the same row, otherwise can be handled separately.
        // loanCreateDetail.jointHolder[0]?.aadharNo,
        // loanCreateDetail.jointHolder[0]?.annualIncome,
        // loanCreateDetail.jointHolder[0]?.areaName,
        // loanCreateDetail.jointHolder[0]?.birthDate,
        // loanCreateDetail.jointHolder[0]?.caste,
        // loanCreateDetail.jointHolder[0]?.cbsCategCode,
        // loanCreateDetail.jointHolder[0]?.cityCode,
        // loanCreateDetail.jointHolder[0]?.cityName,
        // loanCreateDetail.jointHolder[0]?.countryName,
        // loanCreateDetail.jointHolder[0]?.customerId,
        // loanCreateDetail.jointHolder[0]?.districtName,
        // loanCreateDetail.jointHolder[0]?.drivingLicNo,
        // loanCreateDetail.jointHolder[0]?.education,
        // loanCreateDetail.jointHolder[0]?.electionIdNo,
        // loanCreateDetail.jointHolder[0]?.emailId,
        // loanCreateDetail.jointHolder[0]?.employment,
        // loanCreateDetail.jointHolder[0]?.fatherFirstName,
        // loanCreateDetail.jointHolder[0]?.fatherLastName,
        // loanCreateDetail.jointHolder[0]?.fatherMiddleName,
        // loanCreateDetail.jointHolder[0]?.fatherOrSpouse,
        // loanCreateDetail.jointHolder[0]?.fatherPrefix,
        // loanCreateDetail.jointHolder[0]?.firstName,
        // loanCreateDetail.jointHolder[0]?.gender,
        // loanCreateDetail.jointHolder[0]?.inceptionDate,
        // loanCreateDetail.jointHolder[0]?.lastName,
        // loanCreateDetail.jointHolder[0]?.maritalStatus,
        // loanCreateDetail.jointHolder[0]?.middleName,
        // loanCreateDetail.jointHolder[0]?.mobileNo,
        // loanCreateDetail.jointHolder[0]?.motherFirstName,
        // loanCreateDetail.jointHolder[0]?.motherLastName,
        // loanCreateDetail.jointHolder[0]?.motherMiddleName,
        // loanCreateDetail.jointHolder[0]?.motherPrefix,
        // loanCreateDetail.jointHolder[0]?.occupation,
        // loanCreateDetail.jointHolder[0]?.pan,
        // loanCreateDetail.jointHolder[0]?.permanentAddress1,
        // loanCreateDetail.jointHolder[0]?.permanentAddress2,
        // loanCreateDetail.jointHolder[0]?.permanentAddress3,
        // loanCreateDetail.jointHolder[0]?.pincode,
        // loanCreateDetail.jointHolder[0]?.placeOfIncorporation,
        // loanCreateDetail.jointHolder[0]?.prefix,
        // loanCreateDetail.jointHolder[0]?.proofOfAddress,
        // loanCreateDetail.jointHolder[0]?.referenceNumber,
        // loanCreateDetail.jointHolder[0]?.relatedPersonType,
        // loanCreateDetail.jointHolder[0]?.religion,
        // loanCreateDetail.jointHolder[0]?.residenceStatus,
        // loanCreateDetail.jointHolder[0]?.stateName,
        // loanCreateDetail.jointHolder[0]?.type,
        // loanCreateDetail.jointHolder[0]?._id,


        // loanCreateDetail.lastName,
        // loanCreateDetail.loanApplicationDate,
        // loanCreateDetail.loanAppliedAmount,
        // loanCreateDetail.loanInstallmentType,
        // loanCreateDetail.loanPurpose,
        // loanCreateDetail.makerUser,
        // loanCreateDetail.maritalStatus,
        // loanCreateDetail.middleName,
        // loanCreateDetail.mobileNo,
        // loanCreateDetail.motherFirstName,
        // loanCreateDetail.motherLastName,
        // loanCreateDetail.motherMiddleName,
        // loanCreateDetail.motherPrefix,
        // loanCreateDetail.noofInstallment,
        // loanCreateDetail.occupation,
        // loanCreateDetail.pan,
        // loanCreateDetail.permanentAddress1,
        // loanCreateDetail.permanentAddress2,
        // loanCreateDetail.permanentAddress3,
        // loanCreateDetail.pincode,
        // loanCreateDetail.placeOfIncorporation,
        // loanCreateDetail.prefix,
        // loanCreateDetail.proofOfAddress,
        // loanCreateDetail.referenceNumber,
        // loanCreateDetail.religion,
        // loanCreateDetail.reqBranchCd,
        // loanCreateDetail.reqCallerNm,
        // loanCreateDetail.reqProductCode,
        // loanCreateDetail.residenceStatus,
        // loanCreateDetail.roi,
        // loanCreateDetail.stateName,
        // loanCreateDetail.typeOfAccount,
        // loanCreateDetail.riskCateg,
        // loanCreateDetail.relatedPersonType,
        // loanCreateDetail._id,
        // loanCreateDetail.createdAt,
        // loanCreateDetail.updatedAt,
    // ];

    await updateOrAppendToSheet(sheets, process.env.RATNAA_FIN_GOOGLE_SHEET_KEY_LIVE, 'LOAN-CREATE', values);
  } catch (error) {
    handleAxiosError(error);
  }
}


module.exports = { loanCreateGoogleSheet };
