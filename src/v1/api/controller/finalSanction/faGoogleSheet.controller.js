const {
  success,
  unknownError,
  serverValidation,
  unauthorized,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper.js");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const credentials = require("../../../../../liveSheet.json");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const moment = require('moment');

const processModel = require('../../model/process.model.js')
const pdModel = require('../../model/credit.Pd.model.js')
const newBranchModel = require('../../model/adminMaster/newBranch.model.js')
const customerModel = require("../../model/customer.model");
const applicantModel = require("../../model/applicant.model.js");
const vendorModel = require('../../model/adminMaster/vendor.model.js')
const employeeModel = require('../../model/adminMaster/employe.model.js')
const productModel = require("../../model/adminMaster/product.model");
const cibilModel = require("../../model/cibilDetail.model.js");
const externalVendorModel = require("../../model/externalManager/externalVendorDynamic.model.js");
// const creditPdSchema = require('../../model/credit.Pd.model.js');
const {getAllFormattedDates} = require("../../../../../Middelware/timeZone.js")
const customerDocumentModel = require("../../model/customerPropertyDetail.model.js")
const coApplicantModel = require("../../model/co-Applicant.model");
const finalModel = require("../../model/finalSanction/finalSnction.model.js")
const lenderModel = require("../../model/lender.model.js")


// ----------------FILE PROCESS SHEET------------------------
async function fileProcessSheet(customerId) {
    try {
        const finalSanctionDetail = await finalModel.findOne({customerId:customerId})
        // FILE PROCESS STATUS UPDATE IN GOOGLE SHEET
        let fileProcessStatus = "N/A";
        if (finalSanctionDetail.fileProcessFinalDisbursementStatus === "complete") {
            fileProcessStatus = "Final Disbursement";
        } else if (finalSanctionDetail.fileProcessSanctionStatus === "complete" && finalSanctionDetail.fileProcessDisbursementStatus === "complete") {
            fileProcessStatus = "Send For Disbursement";
        } else if (finalSanctionDetail.fileProcessSanctionStatus === "complete") {
            fileProcessStatus = "Send For Sanction";
        }

        //  HO STATUS UPDATE IN GOOGLE SHEET 
        let hoStatus = "N/A";
        if (finalSanctionDetail.incomeSanctionStatus === "complete" && finalSanctionDetail.sendToPartnerSanctionStatus === "complete" && finalSanctionDetail.sendToPartnerPreDisbursedStatus === "complete" && finalSanctionDetail.finalSanctionStatus === "complete" && finalSanctionDetail.finalSanctionDetail.incomeSanctionStatus === "complete" === "complete") {
                    hoStatus = "Send To Partner Post Disbursement";
                }
         else if (finalSanctionDetail.incomeSanctionStatus === "complete" && finalSanctionDetail.sendToPartnerSanctionStatus === "complete" && finalSanctionDetail.sendToPartnerPreDisbursedStatus === "complete" && finalSanctionDetail.finalSanctionStatus === "complete") {
                    hoStatus = "Send To Final Sanction";
                }
                 else if (finalSanctionDetail.incomeSanctionStatus === "complete" && finalSanctionDetail.sendToPartnerSanctionStatus === "complete" && finalSanctionDetail.sendToPartnerPreDisbursedStatus === "complete") {
                    hoStatus = "Send To Partner Pre Disbursement";
                } else if (finalSanctionDetail.incomeSanctionStatus === "complete" && finalSanctionDetail.sendToPartnerSanctionStatus === "complete") {
                    hoStatus = "Send To Partner Sanction";
                } else if (finalSanctionDetail.incomeSanctionStatus === "complete") {
                    hoStatus = "Income Sanction";
                }
   
        const partnerDetail = await lenderModel.findById({_id:new ObjectId(finalSanctionDetail.partnerId)})
        const partnerName = partnerDetail?.fullName 
        const externalVendorDetail = await externalVendorModel.findOne({customerId:customerId})
        const pdDoneDate = externalVendorDetail.creditPdCompleteDate
        const customerData = await customerModel.findById(customerId).select("customerFinId nearestBranchId mobileNo employeId");
        if (!customerData || !customerData.customerFinId) {
            console.error("Customer data or customerFinId not found.");
            throw new Error("Customer data or customerFinId not found.");
        }
          // Fetch applicant data
    const applicantData = await applicantModel.findOne({ customerId: customerId }).select("fullName fatherName mobileNo");
  
    // Fetch branch data
    const branchdata = await newBranchModel.findById(customerData.nearestBranchId).select("name");
  
  
    // Fetch employee data
    const employData = await employeeModel.findById(customerData.employeId).select("employeName userName reportingManagerId");
//    console.log("data",employData)
    const reportingManagerData = await employeeModel.findById(employData.reportingManagerId).select("employeName");
    // console.log("data",reportingManagerData)

        // Google Sheets authentication
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: authClient });

        const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
        const sheetName = process.env.FILE_PROCESS_SHEET_NAME;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        let rows = response.data.values || [];

        if (rows.length === 0) {
            console.log("Sheet is empty, adding headers.");
            rows.push([
                "FILE NO", "BRANCH", "CUSTOMER NAME", "FATHER NAME", "MOBILE NO", 
                "SALES PERSON NAME", "MANAGER NAME", "PD DONE DATE", "TAT", 
                "FILE PROCESS STATUS", "HO STATUS", "PARTNER", "REJECT REASON"
            ]);
        }

        const headers = rows[0];
        const fileNoIndex = headers.indexOf("FILE NO");
        if (fileNoIndex === -1) throw new Error("FILE NO field not found in the sheet.");

        const sheetData = {
            "FILE NO": customerData.customerFinId.trim(),
            "CUSTOMER NAME": applicantData.fullName || "",
            "FATHER NAME": applicantData.fatherName || "",
            "MOBILE NO": customerData.mobileNo,
            "BRANCH": branchdata.name || "",
            "SALES PERSON NAME": employData.employeName || "",
            "MANAGER NAME": reportingManagerData.employeName || "",
            "PARTNER": partnerName || "",
            "PD DONE DATE": pdDoneDate || "",
            "TAT": "",
            "FILE PROCESS STATUS":fileProcessStatus,
            "HO STATUS": hoStatus,
            "REJECT REASON": finalSanctionDetail.fileProcessRejectRemark
        };

        // Check if FILE NO already exists
        const existingRowIndex = rows.findIndex((row, index) => 
            index > 0 && row[fileNoIndex]?.trim() === sheetData["FILE NO"]
        );

        if (existingRowIndex === -1) {
            console.log("Adding new row to the sheet.");
            rows.push(headers.map(header => sheetData[header] || ""));
        } else {
            console.log(`Updating existing row at index ${existingRowIndex}`);
            Object.keys(sheetData).forEach(key => {
                const colIndex = headers.indexOf(key);
                if (colIndex !== -1 && sheetData[key] !== "") {
                    rows[existingRowIndex][colIndex] = sheetData[key];
                }
            });
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: "RAW",
            resource: { values: rows },
        });

        console.log("Data saved to Google Sheets successfully.");
    } catch (error) {
        console.error("Error in fileProcessSheet:", error);
        throw error;
    }
}



//-----------------FINAL Approval SHEET-----------------------
//   async function finalApprovalSheet(customerId) {
//     try {
//         const finalSanctionDetail = await finalModel.findOne({ customerId: customerId });
//         const externalVendorDetail = await externalVendorModel.findOne({customerId:customerId})
//         const pdDoneBy = externalVendorDetail.creditPdId

//        const sanctionStatus =  finalSanctionDetail.sendToPartnerSanctionStatus 
//        const postDisbStatus =  finalSanctionDetail.sendToPartnerPostDisbursedStatus 
//        const preDisbStatus =  finalSanctionDetail.sendToPartnerPreDisbursedStatus 
     
//         const customerData = await customerModel.findById(customerId).select("customerFinId nearestBranchId mobileNo employeId loanAmount roi tenure");
//         if (!customerData) {
//             throw new Error("Customer data not found.");
//         }
        
//         const applicantData = await applicantModel.findOne({ customerId: customerId }).select("fullName fatherName mobileNo");
//         const branchdata = await newBranchModel.findById(customerData.nearestBranchId).select("name");
//         const employData = await employeeModel.findById(customerData.employeId).select("employeName userName reportingManagerId");
//         const reportingManagerData = await employeeModel.findById(employData.reportingManagerId).select("employeName");

//         const pdDoneName = await employeeModel.findById(pdDoneBy).select("employeName userName reportingManagerId");
//         const assign = await employeeModel.findById(finalSanctionDetail.employeeId).select("employeName userName reportingManagerId");
       

//     let rcuStatus = "";
//     let technicalStatus = "";
//     let legalStatus = "";
//     let rmStatus = "";
//     let taggingStatus = "";
//     const externalVendorData = await externalVendorModel
//       .findOne({ customerId: customerId })
//       .populate({ path: "creditPdId" })
//       .populate({ path: "externalVendorId" })
//       .populate({ path: "pdApproverEmployeeId" })
//       .lean();
  
    
//     if (externalVendorData && externalVendorData.vendors) {
//       externalVendorData.vendors.forEach((vendor) => {
//         if (vendor.vendorType == "rcu") {
//           rcuStatus = vendor.statusByVendor || "";
//         } 
//         else if (vendor.vendorType == "technical") {
//           technicalStatus = vendor.statusByVendor || "";
//         } 
//         else if (vendor.vendorType == "legal") {
//           legalStatus = vendor.statusByVendor || "";
//         } 
//         else if (vendor.vendorType == "rm") {
//             rmStatus = vendor.statusByVendor || "";
//           } 
//           else if (vendor.vendorType == "tagging") {
//             taggingStatus = vendor.statusByVendor || "";
//           } 
//       });
//     }


//         const auth = new google.auth.GoogleAuth({
//             credentials,
//             scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//         });
//         const authClient = await auth.getClient();
//         const sheets = google.sheets({ version: "v4", auth: authClient });

//         const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
//         const sheetName = "TEST_FINAL_APPROVAL";
//         // const sheetName = process.env.FILE_PROCESS_SHEET_NAME;

//         const response = await sheets.spreadsheets.values.get({
//             spreadsheetId,
//             range: `${sheetName}!A:Z`,
//         });

//         let rows = response.data.values || [];
//         if (rows.length === 0) {
//             rows.push(["FILE NO", "BRANCH", "CUSTOMER NAME", "FATHER NAME",
//           "MOBILE NO", "SALES PERSON NAME", "MANAGER NAME", "ASSIGNED TO", "QUERY", "SANCTION STATUS",
//           "PRE DISBURSEMENT", "DISBURSED", "RCU", "TECHNICAL", "LEGAL", "RM", "TAGGING", "PD DONE BY",
//           "AMOUNT", "ROI", "TENURE", "ESIGN", "NACH LINK"]);
//         }

//         const headers = rows[0];
//         const fileNoIndex = headers.indexOf("FILE NO");
//         if (fileNoIndex === -1) throw new Error("FILE NO field not found in the sheet.");

//         const sheetData = {
//             "FILE NO": customerData.customerFinId.trim(),
//             "CUSTOMER NAME": applicantData.fullName || "",
//             "FATHER NAME": applicantData.fatherName || "",
//             "MOBILE NO": customerData.mobileNo,
//             "BRANCH": branchdata.name || "",
//             "SALES PERSON NAME": employData.employeName || "",
//             "MANAGER NAME": reportingManagerData.employeName || "",
//             "ASSIGNED TO": assign.employeName || "", 
//             "QUERY": "", 
//             "SANCTION STATUS": sanctionStatus || "", 
//             "PRE DISBURSEMENT": preDisbStatus || "", 
//             "DISBURSED": postDisbStatus || "", 
//             "RCU": rcuStatus || "", 
//             "TECHNICAL": technicalStatus || "",
//             "LEGAL": legalStatus || "", 
//             "RM": rmStatus || "",
//             "TAGGING": taggingStatus || "",
//             "PD DONE BY": pdDoneName.employeName || "",
//             "AMOUNT": finalSanctionDetail.loanAmount || "",
//             "ROI": finalSanctionDetail.roi || "",
//             "TENURE": finalSanctionDetail.tenure || "",
//             "ESIGN": "", 
//             "NACH LINK": "",
//         };

//         const existingRowIndex = rows.findIndex((row, index) => index > 0 && row[fileNoIndex]?.trim() === sheetData["FILE NO"]);

//         if (existingRowIndex === -1) {
//             rows.push(headers.map(header => sheetData[header] || ""));
//         } else {
//             Object.keys(sheetData).forEach(key => {
//                 const colIndex = headers.indexOf(key);
//                 if (colIndex !== -1 && sheetData[key] !== "") {
//                     rows[existingRowIndex][colIndex] = sheetData[key];
//                 }
//             });
//         }

//         await sheets.spreadsheets.values.update({
//             spreadsheetId,
//             range: `${sheetName}!A1`,
//             valueInputOption: "RAW",
//             resource: { values: rows },
//         });

//         console.log("Data saved to Google Sheets successfully.");
//     } catch (error) {
//         console.error("Error in finalApprovalSheet:", error);
//         throw error;
//     }
// }

//-----------------NEW FINAL Approval SHEET-----------------------
async function finalApprovalSheet(customerId) {
    try {
        const finalSanctionDetail = await finalModel.findOne({ customerId: customerId });
        const externalVendorDetail = await externalVendorModel.findOne({customerId:customerId})
        const pdDoneBy = externalVendorDetail?.creditPdId

       const sanctionStatus =  finalSanctionDetail?.sendToPartnerSanctionStatus 
       const postDisbStatus =  finalSanctionDetail?.sendToPartnerPostDisbursedStatus 
       const preDisbStatus =  finalSanctionDetail?.sendToPartnerPreDisbursedStatus 
     
        const customerData = await customerModel.findById(customerId).select("customerFinId nearestBranchId mobileNo employeId loanAmount roi tenure");
        if (!customerData) {
            throw new Error("Customer data not found.");
        }
        
        const applicantData = await applicantModel.findOne({ customerId: customerId }).select("fullName fatherName mobileNo");
        const branchdata = await newBranchModel.findById(customerData.nearestBranchId).select("name");
        const employData = await employeeModel.findById(customerData.employeId).select("employeName userName reportingManagerId");
        const reportingManagerData = await employeeModel.findById(employData.reportingManagerId).select("employeName");

        const pdDoneName = await employeeModel.findById(pdDoneBy).select("employeName userName reportingManagerId");
        const assign = await employeeModel.findById(finalSanctionDetail.employeeId).select("employeName userName reportingManagerId");
       const processDetail = await processModel.findOne({customerId:customerId})
    //    const pdDetail = await pdModel.findOne({customerId:customerId})
    let rcuStatus = "";
    let technicalStatus = "";
    let legalStatus = "";
    // let rmStatus = "";
    // let taggingStatus = "";
    const externalVendorData = await externalVendorModel
      .findOne({ customerId: customerId })
      .populate({ path: "creditPdId" })
      .populate({ path: "externalVendorId" })
      .populate({ path: "pdApproverEmployeeId" })
      .lean();
  
    
    if (externalVendorData && externalVendorData.vendors) {
      externalVendorData.vendors.forEach((vendor) => {
        if (vendor.vendorType == "rcu") {
          rcuStatus = vendor.statusByVendor || "";
        } 
        else if (vendor.vendorType == "technical") {
          technicalStatus = vendor.statusByVendor || "";
        } 
        else if (vendor.vendorType == "legal") {
          legalStatus = vendor.statusByVendor || "";
        } 
        // else if (vendor.vendorType == "rm") {
        //     rmStatus = vendor.statusByVendor || "";
        //   } 
        //   else if (vendor.vendorType == "tagging") {
        //     taggingStatus = vendor.statusByVendor || "";
        //   } 
      });
    }


        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: authClient });

        const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
        // const sheetName = "NEW FILE MANAGEMENT";
         const sheetName = process.env.FILE_PROCESS_SHEET_NAME;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        let rows = response.data.values || [];
        if (rows.length === 0) {
            rows.push(["FILE NO", "BRANCH", "CUSTOMER NAME", "FATHER NAME","MOBILE NO", "SALES PERSON NAME",
                 "MANAGER NAME","PD DONE BY","AMOUNT", "ROI", "TENURE", "SANCTION STATUS", "RCU", "TECHNICAL", 
                 "LEGAL" , "LOAN DETAIL", "APPLICANT",	"APP DOC",	"COAPPLICANT-1" ,	"COAPPLICANT DOC-1",	
                 "COAPPLICANT-2", "COAPPLICANT DOC-2", "COAPPLICANT-3", "COAPPLICANT DOC-3", "GTR",	"GTR DOC",
            	"CIBIL APPLICANT", "CIBIL COAPPLICANT-1", "CIBIL COAPPLICANT-2", "CIBIL COAPPLICANT-3",	"CIBIL GTR",
            	"CREDIT PD", "FAMILY DETAIL", "FAMILY DETAIL DOC", "UDYAM DETAIL", "UDYAM DETAIL DOC", "BANK DETAIL APPLICANT",
            	"BANK DETAIL APPLICANT DOC", "BANK DETAIL COAPPLICANT-1", "BANK DETAIL COAPPLICANT DOC-2", "BANK DETAIL COAPPLICANT-2",
            	"BANK DETAIL COAPPLICANT DOC-2"	, "BANK DETAIL COAPPLICANT-3", "BANK DETAIL COAPPLICANT DOC-3",	"BANK DETAIL GTR",	
                "BANK DETAIL GTR DOC", "PROPERTY PAPER", "PROPERTY PAPER DOC", "CAM DETAIL", "INSURANCE DETAIL"	,"PARTNER SELECTION", 
                "CAM REPORT",	"INCOME SANCTION", "GENERATION	SANACTION DETAIL FROM PARTNER",	"DISTBURSEMENT CHARGE",	"E-NACH LINK",	
                "DISTBURSEMENT DETAIL",	"INVENTORY DETAIL", "PHYSICAL FILE SEND TO LENDOR", "E-SIGN	MORTGAGE DETAIL"]);
        }

        const headers = rows[0];
        const fileNoIndex = headers.indexOf("FILE NO");
        if (fileNoIndex === -1) throw new Error("FILE NO field not found in the sheet.");

        const sheetData = {
            "FILE NO":         customerData.customerFinId.trim(),
            "CUSTOMER NAME":   applicantData.fullName || "",
            "FATHER NAME":     applicantData.fatherName || "",
            "MOBILE NO":       customerData.mobileNo,
            "BRANCH":          branchdata.name || "",
            "SALES PERSON NAME": employData.employeName || "",
            "MANAGER NAME":      reportingManagerData.employeName || "",
            "PD DONE BY":        pdDoneName.employeName || "",
            "AMOUNT":            finalSanctionDetail.finalLoanAmount || "",
            "ROI":               finalSanctionDetail.roi || "",
            "TENURE":            finalSanctionDetail.tenureInMonth || "",
            "RCU":               rcuStatus || "", 
            "TECHNICAL":         technicalStatus || "",
            "LEGAL":             legalStatus || "", 
            "LOAN DETAIL":"",
            "APPLICANT":           processDetail.fileStageForms.dealSummaryApplicant || "",
            "APPLICANT DOC":       processDetail.fileStageForms.dealSignApplicantKyc || "",
            "COAPPLICANT-1":       processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 0 ? 
                                   processDetail.fileStageForms.coApplicant[0].dealSummaryStatus : "",
            "COAPPLICANT DOC-1":   processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 0 ? 
                                   processDetail.fileStageForms.coApplicant[0].dealSummaryStatus : "",
            "COAPPLICANT-2":       processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 1 ? 
                                   processDetail.fileStageForms.coApplicant[1].dealSummaryStatus : "",
            "COAPPLICANT DOC-2":   processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 1 ? 
                                   processDetail.fileStageForms.coApplicant[1].dealSummaryStatus : "",
            "COAPPLICANT-3":       processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 2 ? 
                                   processDetail.fileStageForms.coApplicant[2].dealSummaryStatus : "",
            "COAPPLICANT DOC-3":   processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 2 ? 
                                   processDetail.fileStageForms.coApplicant[2].dealSummaryStatus : "",
            "GTR":                 processDetail.fileStageForms.dealSummaryGuarantor || "",
            "GTR DOC" :            processDetail.fileStageForms.dealSignGuarantorKyc || "",
            "CIBIL APPLICANT":     processDetail.fileStageForms.cibilApplicant || "",
            "CIBIL COAPPLICANT-1": processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 0 ? 
                                   processDetail.fileStageForms.coApplicant[0].cibilStatus : "",
            "CIBIL COAPPLICANT-2": processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 1 ? 
                                   processDetail.fileStageForms.coApplicant[1].cibilStatus : "",
            "CIBIL COAPPLICANT-3": processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 2 ? 
                                   processDetail.fileStageForms.coApplicant[2].cibilStatus : "",
            "CREDIT PD":           processDetail.fileStageForms.creditPd || "",
            "FAMILY DETAIL":       processDetail.fileStageForms.familyDetail || "",
            "FAMIL DETAIL DOC":    processDetail.fileStageForms.familyDetailDoc || "",
            "UDYAM DETAIL":        processDetail.fileStageForms.udyamDetail || "",
            "UDYAM DETAIL DOC":    processDetail.fileStageForms.udyamDetailDoc || "",
            "BANK DETAIL APPLICANT": processDetail.fileStageForms.bankDetailApplicant  || "", 
            "BANK DETAIL APPLICANT DOC": processDetail.fileStageForms.bankDetailApplicantDoc  || "", 

            "BANK DETAIL COAPPLICANT-1":       processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 0 ? 
            processDetail.fileStageForms.coApplicant[0].bankStatus : "",
            "BANK DETAIL COAPPLICANT DOC-1":   processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 0 ? 
            processDetail.fileStageForms.coApplicant[0].bankDocStatus : "",
            "BANK DETAIL COAPPLICANT-2":       processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 1 ? 
            processDetail.fileStageForms.coApplicant[1].bankStatus : "",
            "BANK DETAIL COAPPLICANT DOC-2":   processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 1 ? 
            processDetail.fileStageForms.coApplicant[1].bankDocStatus : "",
            "BANK DETAIL COAPPLICANT-3":       processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 2 ? 
            processDetail.fileStageForms.coApplicant[2].bankStatus : "",
            "BANK DETAIL COAPPLICANT DOC-3":   processDetail.fileStageForms.coApplicant && processDetail.fileStageForms.coApplicant.length > 2 ? 
            processDetail.fileStageForms.coApplicant[2].bankDocStatus : "",

            "BANK DETAIL GTR":           processDetail.fileStageForms.bankDetailGtr || "",
            "BANK DETAIL GTR DOC":       processDetail.fileStageForms.bankDetailGtrDoc || "",
            "PROPERTY PAPER":            processDetail.fileStageForms.propertyPaper || "", 
            "PROPERTY PAPER DOC":        processDetail.fileStageForms.propertyPaperDoc || "", 
            "CAM DETAIL" :               processDetail.fileStageForms.camDetail || "", 
            "INSURANCE DETAIL" :         processDetail.fileStageForms.insuranceDetail || "", 
            "PARTNER SELECTION" :        processDetail.fileStageForms.partnerSelection || "", 
            "CAM REPORT":                processDetail.fileStageForms.camReport || "", 
            "INCOME SANCTION GENERATION":processDetail.fileStageForms.incomeSanctionGeneration || "", 
            "SANACTION DETAIL FROM PARTNER":processDetail.fileStageForms.sanctionDetailFromPartner || "", 
            "DISTBURSEMENT CHARGE":         processDetail.fileStageForms.disbursementCharge || "", 
            "E-NACH LINK" :                 processDetail.fileStageForms.enachLink || "", 
            "E-SIGN":                       processDetail.fileStageForms.esign || "", 
            "MORTGAGE DETAIL":              processDetail.fileStageForms.mortgageDetail || "", 
            "DISTBURSEMENT DETAIL":         processDetail.fileStageForms.disbursementDetail || "", 
            "INVENTORY DETAIL" :            processDetail.fileStageForms.inventoryDetail || "", 
            "PHYSICAL FILE SEND TO LENDOR" :processDetail.fileStageForms.physicalFileSendToLendor || "",  
        };

        const existingRowIndex = rows.findIndex((row, index) => index > 0 && row[fileNoIndex]?.trim() === sheetData["FILE NO"]);

        if (existingRowIndex === -1) {
            rows.push(headers.map(header => sheetData[header] || ""));
        } else {
            Object.keys(sheetData).forEach(key => {
                const colIndex = headers.indexOf(key);
                if (colIndex !== -1 && sheetData[key] !== "") {
                    rows[existingRowIndex][colIndex] = sheetData[key];
                }
            });
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: "RAW",
            resource: { values: rows },
        });

        console.log("Data saved to Google Sheets successfully.");
    } catch (error) {
        console.error("Error in finalApprovalSheet:", error);
        throw error;
    }
}



  module.exports = {
    fileProcessSheet,
    finalApprovalSheet,
    // newFinalApprovalSheet
  };




    
