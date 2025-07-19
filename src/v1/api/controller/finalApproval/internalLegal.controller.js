const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
} = require("../../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const moment = require('moment-timezone');
const lenderModel = require("../../model/lender.model.js")
const vendorModel = require("../../model/adminMaster/vendor.model.js")
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const employeModel = require("../..//model/adminMaster/employe.model.js");
const coApplicantModel = require("../../model/co-Applicant.model");
const applicantModel = require("../../model/applicant.model.js");
const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js");
const creditPdModel = require("../../model/credit.Pd.model.js")
const finalModel = require("../../model/finalSanction/finalSnction.model");
const InsuranceModel = require("../../model/finalApproval/Insurance.model.js");
const processModel = require("../../model/process.model.js");
const customerModel = require("../../model/customer.model.js")
const externalVendorFormModel = require("../../model/externalManager/externalVendorDynamic.model.js")

// const addInternalLegalDetails = async (req, res) => {
//   try {
//     // Validate incoming request
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     // Destructure request body
//     const {
//       customerId,
//       buyerName,
//       sellerName,
//       propertyPaperType,
//       pramanPatra,
//       taxReceipt,
//     } = req.body;

//     // Check required fields
//     if (
//       !customerId ||
//       !buyerName ||
//       !sellerName ||
//       !propertyPaperType ||
//       !pramanPatra?.no ||
//       !pramanPatra?.date ||
//       !taxReceipt?.no ||
//       !taxReceipt?.date
//     ) {
//       return res.status(400).json({
//         status: false,
//         subCode: 400,
//         message: "All fields are required.",
//       });
//     }

//     // Validate date fields in pramanPatra and taxReceipt
//     const parsedPramanPatraDate = new Date(pramanPatra.date);
//     const parsedTaxReceiptDate = new Date(taxReceipt.date);

//     if (
//       isNaN(parsedPramanPatraDate.getTime()) ||
//       isNaN(parsedTaxReceiptDate.getTime())
//     ) {
//       return res.status(400).json({
//         status: false,
//         subCode: 400,
//         message: "Invalid date format in pramanPatra or taxReceipt. Use YYYY-MM-DD.",
//       });
//     }

//     // Upsert document in the database
//     const data = await internalLegalModel.findOneAndUpdate(
//       { customerId }, // Query by customerId
//       {
//         customerId,
//         buyerName,
//         sellerName,
//         propertyPaperType,
//         pramanPatra: {
//           no: pramanPatra.no,
//           date: pramanPatra.date,
//         },
//         taxReceipt: {
//           no: taxReceipt.no,
//           date: taxReceipt.date,
//         },
//       },
//       { new: true, upsert: true } // Return the updated document; create if not exists
//     );

//     return success(
//       res,
//       "Internal legal details added or updated successfully.",
//       data
//     );
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// };



//old
// const addInternalLegalDetails = async (req, res) => {
//   try {
//     // Validate incoming request
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     // Destructure request body
//     const {
//       customerId,
//       buyerName,
//       sellerName,
//       propertyPaperType,
//       pramanPatra,
//       taxReceipt,
//       co_ownership_deed,
//       EM_DEED,
//       RM_DEED,
//       PropertyOwnerName,
//       PropertyOwnerFatherName,
//       gramPanchayat,
//       Noc_certificate,
//       Buliding_Permission_Certificate,
//       Mutation_Certificate,
//       Owner_Certificate,
//       Property_Tax_Reciept,
//       BT_BANK_NAME,
//       LoanType,
//       LegalType,
//       Generate_new_legal_link,
//       Generate_final_legal_link,
//       Generate_vetting_Report_link,
//       sellerFatherName,
//       SealandSignedBy,
//       customDocument,
//       otherDocuments
//     } = req.body;

//     const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");
//     const customerDetails = await customerModel.findById(customerId)
//     if(!customerDetails){
//      return notFound(res , "customer not found")
//     }
//     const existingData = await internalLegalModel.findOne({ customerId });

//     const defaultPramanPatra = pramanPatra || (existingData ? existingData.pramanPatra : { no: null, date: null });
//     const defaultTaxReceipt = taxReceipt || (existingData ? existingData.taxReceipt : { no: null, date: null });
//     const defaultCoOwnershipDeed = co_ownership_deed || (existingData ? existingData.co_ownership_deed : { no: null, date: null });
//     const defaultEM_DEED = EM_DEED || (existingData ? existingData.EM_DEED : { no: null, date: null });
//     const defaultRM_DEED = RM_DEED || (existingData ? existingData.RM_DEED : { no: null, date: null });
//     const defaultGramPanchayat = gramPanchayat || (existingData ? existingData.gramPanchayat : { no: null, date: null });
//     const defaultNocCertificate = Noc_certificate || (existingData ? existingData.Noc_certificate : { no: null, date: null });
//     const defaultBuildingPermission = Buliding_Permission_Certificate || (existingData ? existingData.Buliding_Permission_Certificate : { no: null, date: null });
//     const defaultMutationCertificate = Mutation_Certificate || (existingData ? existingData.Mutation_Certificate : { no: null, date: null });
//     const defaultOwnerCertificate = Owner_Certificate || (existingData ? existingData.Owner_Certificate : { no: null, date: null });
//     const defaultPropertyTaxReceipt = Property_Tax_Reciept || (existingData ? existingData.Property_Tax_Reciept : { no: null, date: null });
   

//     // If no data exists, initialize the fields with default values
//      const updateData = {
//       LoanType,
//       LegalType,
//       customerId,
//       buyerName,
//       sellerName,
//       propertyPaperType,
//       BT_BANK_NAME,
//       pramanPatra: defaultPramanPatra,
//       taxReceipt: defaultTaxReceipt,
//       co_ownership_deed: defaultCoOwnershipDeed,
//       EM_DEED: defaultEM_DEED,
//       RM_DEED:defaultRM_DEED,
//       PropertyOwnerName,
//       PropertyOwnerFatherName,
//       gramPanchayat: defaultGramPanchayat,
//       Noc_certificate: defaultNocCertificate,
//       Buliding_Permission_Certificate: defaultBuildingPermission,
//       Mutation_Certificate: defaultMutationCertificate,
//       Owner_Certificate: defaultOwnerCertificate,
//       Property_Tax_Reciept: defaultPropertyTaxReceipt,
//       Generate_new_legal: "false",
//       Generate_final_legal: "false",
//       Generate_vetting_Report: "false",
//       Generate_new_legal_link: Generate_new_legal_link,
//       Generate_final_legal_link: Generate_final_legal_link,
//       Generate_vetting_Report_link: Generate_vetting_Report_link,
//       sellerFatherName,
//       SealandSignedBy,
//       customDocument,
//       otherDocuments
//     };


//     if (existingData) {
//       // If data exists, update the fields with existing values
//       updateData.Generate_new_legal = existingData.Generate_new_legal || "false";
//       updateData.Generate_final_legal = existingData.Generate_final_legal || "false";
//       updateData.Generate_vetting_Report = existingData.Generate_vetting_Report || "false";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link || existingData.Generate_new_legal_link ;
//       updateData.Generate_final_legal_link = Generate_final_legal_link || existingData.Generate_final_legal_link;
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link || existingData.Generate_vetting_Report_link;
//       // updateData.Generate_new_legal_link = existingData.Generate_new_legal_link || null;
//       // updateData.Generate_final_legal_link = existingData.Generate_final_legal_link || null;
//       // updateData.Generate_vetting_Report_link = existingData.Generate_vetting_Report_link || null;
//     }

//     // Handle conditions based on LoanType, propertyPaperType, and LegalType
//     if (LoanType == "NEW" && propertyPaperType == "newCoownership" && LegalType == "NewLegal" && updateData.Generate_new_legal == "false") {
//       console.log("New Legal");
//       updateData.Generate_new_legal = "true";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link;
//       updateData.co_ownership_deed = { no: null, date: null };
//       updateData.EM_DEED = { no: null, date: null };
//     }

//     if (LoanType == "NEW" && propertyPaperType == "newCoownership" && LegalType == "FinalLegal" && updateData.Generate_new_legal == "true" && updateData.Generate_final_legal == "false") {
//       console.log("Final Legal");
//       updateData.Generate_final_legal = "true";
//       updateData.Generate_final_legal_link = Generate_final_legal_link;
//       updateData.co_ownership_deed = {
//         no: co_ownership_deed.no,
//         date: co_ownership_deed.date,
//       };
//       updateData.EM_DEED = {
//         no: EM_DEED.no,
//         date: EM_DEED.date,
//       };
//     }

//     if (LoanType == "NEW" && propertyPaperType == "newCoownership" && LegalType == "Vetting" && updateData.Generate_final_legal == "true" && updateData.Generate_new_legal == "true"  && existingData.Generate_vetting_Report == "false") {
//       console.log("Vetting Report");
//       updateData.Generate_vetting_Report = "true";
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link;
//     }


//     // change here the Property Paper Type //

//     if( LoanType == "NEW" && propertyPaperType === "executedCoownership" && LegalType === "FinalLegal"  && updateData.Generate_new_legal == "false" ){
//       updateData.Generate_new_legal = "true";
//       updateData.Generate_final_legal = "true";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link;
//       updateData.EM_DEED = { no: null, date: null };
//     }


//     if( LoanType == "NEW" && propertyPaperType == "executedCoownership" && LegalType == "Vetting"  && updateData.Generate_new_legal == "true"  && updateData.Generate_vetting_Report == "false" ){
//       updateData.Generate_vetting_Report = "true";
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link;
//       updateData.EM_DEED = {
//         no: EM_DEED.no,
//         date: EM_DEED.date,
//       }
//     }


//     // ---- 7PagerPatta ---- //  

//     if( LoanType == "NEW" && propertyPaperType == "7PagerPatta" && LegalType == "FinalLegal"  && updateData.Generate_new_legal == "false" ){
//       updateData.Generate_new_legal = "true";
//       updateData.Generate_final_legal = "true";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link;
//       updateData.RM_DEED = { no: null, date: null };
//     }

//     if( LoanType == "NEW" && propertyPaperType == "7PagerPatta" && LegalType == "Vetting"  && updateData.Generate_new_legal == "true"  && updateData.Generate_vetting_Report == "false" ){
//       updateData.Generate_vetting_Report = "true";
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link;
//       updateData.EM_DEED = {
//         no: RM_DEED.no,
//         date: RM_DEED.date,
//       }
//     }

//     //------------- NEW WITH CONSTRUCTION ------------------//

//       // Handle conditions based on LoanType, propertyPaperType, and LegalType
//     if (LoanType == "CONSTRUCTION" && propertyPaperType == "newCoownership" && LegalType == "NewLegal" && updateData.Generate_new_legal == "false") {
//       console.log("New Legal");
//       updateData.Generate_new_legal = "true";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link;
//       updateData.co_ownership_deed = { no: null, date: null };
//       updateData.EM_DEED = { no: null, date: null };
//     }

//     if (LoanType == "CONSTRUCTION" && propertyPaperType == "newCoownership" && LegalType == "FinalLegal" && updateData.Generate_new_legal == "true" && updateData.Generate_final_legal == "false") {
//       console.log("Final Legal");
//       updateData.Generate_final_legal = "true";
//       updateData.Generate_final_legal_link = Generate_final_legal_link;
//       updateData.co_ownership_deed = {
//         no: co_ownership_deed.no,
//         date: co_ownership_deed.date,
//       };
//       updateData.EM_DEED = {
//         no: EM_DEED.no,
//         date: EM_DEED.date,
//       };
//     }

//     if (LoanType == "CONSTRUCTION" && propertyPaperType == "newCoownership" && LegalType == "Vetting" && updateData.Generate_final_legal == "true" && updateData.Generate_new_legal == "true"  && existingData.Generate_vetting_Report == "false") {
//       console.log("Vetting Report");
//       updateData.Generate_vetting_Report = "true";
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link;
//     }


//     // change here the Property Paper Type //

//     if( LoanType == "CONSTRUCTION" && propertyPaperType === "executedCoownership" && LegalType === "FinalLegal"  && updateData.Generate_new_legal == "false" ){
//       updateData.Generate_new_legal = "true";
//       updateData.Generate_final_legal = "true";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link;
//       updateData.EM_DEED = { no: null, date: null };
//     }


//     if( LoanType == "CONSTRUCTION" && propertyPaperType == "executedCoownership" && LegalType == "Vetting"  && updateData.Generate_new_legal == "true"  && updateData.Generate_vetting_Report == "false" ){
//       updateData.Generate_vetting_Report = "true";
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link;
//       updateData.EM_DEED = {
//         no: EM_DEED.no,
//         date: EM_DEED.date,
//       }
//     }


//     // ---- 7PagerPatta ---- //  

//     if( LoanType == "CONSTRUCTION" && propertyPaperType == "7PagerPatta" && LegalType == "FinalLegal"  && updateData.Generate_new_legal == "false" ){
//       updateData.Generate_new_legal = "true";
//       updateData.Generate_final_legal = "true";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link;
//       updateData.RM_DEED = { no: null, date: null };
//     }

//     if( LoanType == "CONSTRUCTION" && propertyPaperType == "7PagerPatta" && LegalType == "Vetting"  && updateData.Generate_new_legal == "true"  && updateData.Generate_vetting_Report == "false" ){
//       updateData.Generate_vetting_Report = "true";
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link;
//       updateData.EM_DEED = {
//         no: RM_DEED.no,
//         date: RM_DEED.date,
//       }
//     }


//     // ----------------BT ------------------ with ---------- executedCoownership  ///
//     if(LoanType == "BT"   && propertyPaperType == "executedCoownership" &&  LegalType == "FinalLegal" && updateData.Generate_new_legal == "false" ){
//       updateData.Generate_new_legal = "true";
//       updateData.Generate_final_legal = "true";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link;
//       updateData.EM_DEED = { no: null, date: null };
//     }


//     if(LoanType == "BT"   && propertyPaperType == "executedCoownership" &&  LegalType == "Vetting" && updateData.Generate_new_legal == "true" && updateData.Generate_vetting_Report == "false" ){
//       updateData.Generate_vetting_Report = "true";
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link;
//       updateData.EM_DEED = {
//         no: EM_DEED.no,
//         date: EM_DEED.date,
//       }
//     }


//     // ----------------BT ------------------ with ---------- 7PagerPatta  ///


//     if(LoanType == "BT"   && propertyPaperType == "7PagerPatta" &&  LegalType == "FinalLegal" && updateData.Generate_new_legal == "false" ){
//       updateData.Generate_new_legal = "true";
//       updateData.Generate_final_legal = "true";
//       updateData.Generate_new_legal_link =  Generate_new_legal_link;
//       updateData.RM_DEED = { no: null, date: null };
//     } 
    

//     if(LoanType == "BT"   && propertyPaperType == "7PagerPatta" &&  LegalType == "Vetting" && updateData.Generate_new_legal == "true" && updateData.Generate_vetting_Report == "false" ){
//       updateData.Generate_vetting_Report = "true";
//       updateData.Generate_vetting_Report_link = Generate_vetting_Report_link;
//       updateData.RM_DEED = {
//         no: RM_DEED.no,
//         date: RM_DEED.date,
//       }
//     }
    
//     // Update the document with the new data
//     const updatedData = await internalLegalModel.findOneAndUpdate(
//       { customerId }, 
//       { 
//           $set: { ...req.body } // Spreading req.body properly inside $set
//       }, 
//       { new: true, upsert: true }
//   );
  

//     await processModel.findOneAndUpdate(
//       { customerId },
//       { $set: {
//         legalGenerateDetails:true
//       } },
//       { new: true }
//   );


  
//   let messages = [];
//   messages.push("Internal Legal Update Successfully");

// // const getPartner = await finalModel.findOne({ customerId }).select('partnerId');
// // // if (!getPartner) {
// // //   messages.push("No Partner Found");
// // // }

// // const lender = await lenderModel.findOne({
// //   _id: getPartner.partnerId,
// //   "venders.branch": new ObjectId(customerDetails.branch),
// //   "venders.reportType": "legal",
// // });

// // // if (!lender) {
// // //   messages.push("Legal Vendor Not Found");
// // // }

// // // Find an active legal vendor
// // let assignedVendor = null;
// // let vendorHaveActive = false
// // if (lender) {
// //   for (let vender of lender.venders) {
// //     if (String(vender.branch) === String(customerDetails.branch) && vender.reportType === "legal") {
// //       const vendorDetail = await vendorModel.findById(vender?.vender).populate('vendorType'); // Populate vendorType
// // if (vendorDetail && vendorDetail?.status === "active") {
// //   vendorHaveActive = vendorDetail?.vendorType.some(vt => vt.vendorType === "technical");
// //   assignedVendor = vender?.vender
// //         break;
// //       }
// //     }
// //   }
// // }

// // // if (!assignedVendor) {
// // //   messages.push("No active legal vendor found");
// // // }

// // // Fetch existing legal vendor details
// // const externalVendor = await externalVendorFormModel.findOne({
// //   customerId: customerId,
// //   "vendors.vendorType": "legal",
// // });

// // if (!externalVendor) {
// //   console.log('when legal not found')
// //   if(Generate_new_legal_link){
// //     // If externalVendor does not exist, create and assign firstLegal
// //     await externalVendorFormModel.updateOne(
// //     { customerId: customerDetails._id },
// //     {
// //       $push: {
// //         vendors: {
// //           vendorType: "legal",
// //           vendorId: assignedVendor,
// //           fileStageStatus: "firstLegal",
// //           assignDate: todayDate,
// //           statusByVendor: "WIP",
// //           assignDocuments: Generate_new_legal_link,
// //         },
// //       },
// //     },
// //     { upsert: true }
// //   );
// //   messages.push("First Legal Assigned");
// // }else if(Generate_final_legal_link  && (propertyPaperType !== "newCoownership")){
// //   await externalVendorFormModel.updateOne(
// //     { customerId: customerDetails._id },
// //     {
// //       $push: {
// //         vendors: {
// //           vendorType: "legal",
// //           vendorId: assignedVendor,
// //           fileStageStatus: "finalLegal",
// //           assignDate: todayDate,
// //           statusByVendor: "WIP",
// //           assignDocuments: Generate_final_legal_link,
// //         },
// //       },
// //     },
// //     { upsert: true }
// //   );
// //   messages.push("Final Legal Assigned");
// // }
// // } else {
// //   let vendorIndex = externalVendor.vendors.findIndex(v => v.vendorType === "legal");
// //   let statusByVendor = vendorIndex !== -1 ? externalVendor.vendors[vendorIndex].statusByVendor : "notAssign";
// //   let fileStageStatus = vendorIndex !== -1 ? externalVendor.vendors[vendorIndex].fileStageStatus : "";
// //   let uploadProperty = vendorIndex !== -1 ? externalVendor.vendors[vendorIndex].uploadProperty : "";
// //   let finalLegalUpload = vendorIndex !== -1 ? externalVendor.vendors[vendorIndex].finalLegalUpload : "";

// //   // Step 1: Assign New Legal Vendor if Needed
// //   if (Generate_new_legal_link && ["firstLegal", ""].includes(fileStageStatus) && statusByVendor === "notAssign") {
// //     await externalVendorFormModel.updateOne(
// //       { customerId: customerDetails._id, "vendors.vendorType": "legal" },
// //       {
// //         $set: {
// //           [`vendors.${vendorIndex}.vendorId`]: assignedVendor,
// //           [`vendors.${vendorIndex}.fileStageStatus`]: "firstLegal",
// //           [`vendors.${vendorIndex}.assignDate`]: todayDate,
// //           [`vendors.${vendorIndex}.vendorUploadDate`]: "",
// //           [`vendors.${vendorIndex}.reason`]: "",
// //           [`vendors.${vendorIndex}.vendorStatus`]: "",
// //           [`vendors.${vendorIndex}.statusByVendor`]: "WIP",
// //           [`vendors.${vendorIndex}.assignDocuments`]: Generate_new_legal_link,
// //         },
// //       }
// //     );
// //     messages.push("First Legal Assigned");
// //   }

// //   // Step 2: Final Legal Assignment
// //   if (Generate_final_legal_link && ( statusByVendor === "approve" || statusByVendor === "notAssign" ) && (fileStageStatus === "firstLegal" || fileStageStatus === "") ) {
// //     await externalVendorFormModel.updateOne(
// //       { customerId: customerDetails._id, "vendors.vendorType": "legal" },
// //       {
// //         $set: {
// //           [`vendors.${vendorIndex}.statusByVendor`]: "WIP",
// //           [`vendors.${vendorIndex}.vendorId`]: assignedVendor,
// //           [`vendors.${vendorIndex}.fileStageStatus`]: "finalLegal",
// //           [`vendors.${vendorIndex}.assignDate`]: todayDate,
// //           [`vendors.${vendorIndex}.vendorUploadDate`]: "",
// //           [`vendors.${vendorIndex}.reason`]: "",
// //           [`vendors.${vendorIndex}.vendorStatus`]: "",
// //           [`vendors.${vendorIndex}.assignDocuments`]: Generate_final_legal_link,
// //         },
// //       }
// //     );
// //     messages.push("Final Legal Assigned");
// //   }

// //   // Step 3: Vetting Legal Assignment
// //   if (Generate_vetting_Report_link && finalLegalUpload && statusByVendor === "approve" && fileStageStatus === "finalLegal") {
// //     await externalVendorFormModel.updateOne(
// //       { customerId: customerDetails._id, "vendors.vendorType": "legal" },
// //       {
// //         $set: {
// //           [`vendors.${vendorIndex}.statusByVendor`]: "WIP",
// //           [`vendors.${vendorIndex}.assignDocuments`]: Generate_vetting_Report_link,
// //           [`vendors.${vendorIndex}.fileStageStatus`]: "vettingLegal",
// //           [`vendors.${vendorIndex}.vendorUploadDate`]: "",
// //           [`vendors.${vendorIndex}.reason`]: "",
// //           [`vendors.${vendorIndex}.vendorStatus`]: "",
// //         },
// //       }
// //     );
// //     messages.push("Vetting Legal Assigned");
// //   }
// // }

  
//   // Send response after checking all conditions
//   success(res, messages.join(" , "));
  
//   // await finalApprovalSheet(customerId)
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// };


//new
const addInternalLegalDetails = async (req, res) => {
  try {
    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const customerId = req.body.customerId;
    if (!customerId) {
      return badRequest(res,"customerId is required")
    }

    // Fetch existing document
    let existingData = await internalLegalModel.findOne({ customerId });

    let updatedFields = {};
    
    if (existingData) {
      // Set all existing fields to null
      updatedFields = Object.keys(existingData.toObject()).reduce((acc, field) => {
        if (field !== "_id" && field !== "__v" && field !== "createdAt" && field !== "updatedAt") {
          acc[field] = null;
        }
        return acc;
      }, {});
    }

    // Update only the fields present in req.body
    Object.keys(req.body).forEach((key) => {
      updatedFields[key] = req.body[key];
    });

    // Update document in database
    const updatedData = await internalLegalModel.findOneAndUpdate(
      { customerId },
      { $set: updatedFields },
      { new: true, upsert: true }
    );

    success(res, "Internal Legal add/Updated Successfully", updatedData);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};



const internalLegalDetails = async (req, res) => {
  try {
    const { customerId } = req.query;
    const data = await internalLegalModel.findOne({ customerId })
    if(!data){
      return notFound(res, "Internal legal details not found.");
    }
    console.log(data);
    return success(
      res,
      "Internal legal details added or updated successfully.",
      data
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};


// const internalLegalDetails = async (req, res) => {
//   try {
//     const { customerId } = req.query;

//     let data;

//     if (customerId) {
//       data = await internalLegalModel.findOne({ customerId });
//     }

//     // If customerId is not provided or no match is found, retrieve all data
//     if (!data) {
//       data={
//         Allow_Permission:'false'
//       }
//     }

//     console.log(data);
//     return success(
//       res,
//       "Internal legal details retrieved successfully.",
//       data
//     );
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// };



const nameDropDown = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    // Fetch applicant data
    const appData = await applicantModel.findOne(
      { customerId },
      { fullName: 1, fatherName: 1, _id: 0 } // Select fullName and fatherName fields
    );

    // Fetch co-applicant data
    const coAppData = await coApplicantModel.find(
      { customerId },
      { fullName: 1, fatherName: 1, _id: 0 } // Select fullName and fatherName fields
    );

    // Combine names into one array for the existing response
    const names = [
      appData?.fullName, // Applicant name
      ...coAppData.map((coApp) => coApp.fullName), // Co-applicant names
    ].filter(Boolean); // Filter out null or undefined names

    // Create a new array with fullName and fatherName
    const detailedNames = [];

    if (appData) {
      detailedNames.push({
        fullName: appData.fullName,
        fatherName: appData.fatherName,
      });
    }

    coAppData.forEach((coApp) => {
      detailedNames.push({
        fullName: coApp.fullName,
        fatherName: coApp.fatherName,
      });
    });


    return success(res, "Dropdown names fetched successfully.", {
      data: names, // Existing format
      detailedData: detailedNames, // New format with fullName and fatherName
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};

// const nameDropDownDetailed = async (req, res) => {
//   try {
//     const { customerId } = req.query;

//     if (!customerId) {
//       return res.status(400).json({ message: "Customer ID is required" });
//     }

//     // Fetch applicant data
//     const applicant = await applicantModel.findOne({ customerId });

//     // Fetch co-applicant data
//     const coApplicants = await coApplicantModel.find({ customerId });

//     // Fetch applicant details from PD form
//     const pdformdatasDetail = await creditPdModel.findOne(
//       { customerId }
//     );

//     // Fetch co-applicant details from PD form
//     const pdformdata = await creditPdModel.findOne({ customerId });

//     console.log("pdformdata" , pdformdata);

//     // Construct applicant data
//     const applicantData = [];
//     if (applicant) {
//       applicantData.push({
//         fullName: applicant.fullName || "",
//         fatherName: applicant.fatherName || "",
//         age: applicant.age || "",
//         gender: applicant.gender || "",
//         state: applicant?.localAddress?.state || "",
//         nationality: pdformdatasDetail?.applicant?.nationality || "Indian",
//         occupation: pdformdatasDetail?.applicant?.occupation || "",
//         RelationshipWithMember: "Self",
//       });
//     }

//     // Construct co-applicant data
//     const coApplicantsData = coApplicants.map((coApp, index) => ({
//       fullName: coApp.fullName,
//       fatherName: coApp.fatherName,
//       age:coApp.age || "",
//       gender: coApp.gender || "",
//       state: coApp?.localAddress?.state || "",
//       nationality: pdformdata?.co_Applicant?.[index]?.nationality || "Indian",
//       occupation: pdformdata?.co_Applicant?.[index]?.occupation || "",
//       RelationshipWithMember: coApp.relationWithApplicant || "",
//     }));

//     // Merge co-applicants into applicantData for full response
//     coApplicantsData.forEach((coAppData) => applicantData.push(coAppData));

//     return success(res, "Detailed dropdown names fetched successfully.", {
//       applicant: applicantData, // Applicant + co-applicants
//       coApplicants: coApplicantsData, // Only co-applicants
//     });
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// };

const nameDropDownDetailed = async (req, res) => {
  try {
    const { customerId, ID, applicantType = "applicant" } = req.query; // Added `applicantType`

    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    const applicant = await applicantModel.findOne({ customerId });
    const coApplicants = await coApplicantModel.find({ customerId });
    const pdformdatasDetail = await creditPdModel.findOne({ customerId });
    const pdformdata = await creditPdModel.findOne({ customerId });
    const insuranceDetails = await InsuranceModel.findOne({ customerId:customerId})
    console.log(insuranceDetails,"insuranceDetailsinsuranceDetails")
    // Construct applicant data
    let applicantData = [];
    if (applicant) {
      applicantData.push({
        fullName: applicant.fullName || "",
        fatherName: applicant.fatherName || "",
        age: applicant.age || "",
        gender: insuranceDetails?.member?.gender || "",
        state: applicant?.localAddress?.state || "",
        nationality: pdformdatasDetail?.applicant?.nationality || "Indian",
        occupation: pdformdatasDetail?.applicant?.occupation || "",
        RelationshipWithMember: "Self",
        _id: applicant._id,
        salutation:insuranceDetails?.member?.salutation || "",
        shareOfNominee: insuranceDetails?.member?.shareOfNominee || ""
      });
    }

    // Construct co-applicant data
    const coApplicantsData = coApplicants.map((coApp, index) => ({
      fullName: coApp.fullName,
      fatherName: coApp.fatherName,
      age: coApp.age || "",
      gender: coApp.gender || "",
      state: coApp?.localAddress?.state || "",
      nationality: pdformdata?.co_Applicant?.[index]?.nationality || "Indian",
      occupation: pdformdata?.co_Applicant?.[index]?.occupation || "",
      RelationshipWithMember: coApp.relationWithApplicant || "",
      _id: coApp._id,
      shareOfNominee: insuranceDetails?.nominees[index]?.shareOfNominee || "",
      salutation:insuranceDetails?.nominees[index]?.salutation || "",
    }));

    const finalModelData = await finalModel.findOne({ customerId });

    const Calculation = {
      Amount: finalModelData?.finalLoanAmount || "",
      Tenure: finalModelData?.tenureInMonth
        ? (Math.round((finalModelData.tenureInMonth / 12) * 10) / 10).toFixed(1)
        : ""
    };

    // If applicantType is passed, filter data accordingly
    let responseData = [];
    if (applicantType == "applicant") {
      responseData = applicantData; // Only applicant data
    } else if (applicantType == "coapplicant") {
      responseData = coApplicantsData; // Only co-applicant data
    } else {
      responseData = [...applicantData, ...coApplicantsData]; // Both if no filter applied
    }

    // If ID is passed, filter specific applicant or co-applicant
    if (ID) {
      const filteredPerson = responseData.find(person => person._id == ID);
      if (!filteredPerson) {
        return notFound(res, "Person details not found.");
      }
      return success(res, "Person details fetched successfully.", {
        data: [filteredPerson],
        cal: Calculation
      });
    }

    return success(res, "Detailed dropdown names fetched successfully.", {
      data: responseData, // Filtered data based on applicantType
      cal: Calculation
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};


// create and Update Insurance Details //
// const createOrUpdateInsurance = async (req, res) => {
//   try {
//     const { customerId, member, nominees, benefits, isApplicable } = req.body;

//     if (!customerId) {
//       return badRequest(res, "Customer ID is required");
//     }

//     if(isApplicable == false){
//       return success(res, "Insurance details saved successfully",isApplicable); // Unified response message
//       }

//     let insuranceRecord = await InsuranceModel.findOne({ customerId });
//     if (insuranceRecord) {
//       // Update existing record
//       insuranceRecord.member = member || insuranceRecord.member;
//       insuranceRecord.nominees = nominees || insuranceRecord.nominees;
//       insuranceRecord.benefits = benefits || insuranceRecord.benefits;
//     } else {
//       // Create new record
//       insuranceRecord = new InsuranceModel({
//         customerId,
//         member,
//         nominees,
//         benefits,
//       });
//     }

//     await insuranceRecord.save();
//     return success(res, "Insurance details saved successfully", insuranceRecord); // Unified response message

//   } catch (error) {
//     console.error("Error in createOrUpdateInsurance:", error);
//     return unknownError(res, error);
//   }
// };

const createOrUpdateInsurance = async (req, res) => {
  try {
    const { customerId, member, nominees, benefits, isApplicable } = req.body;

    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    let insuranceRecord = await InsuranceModel.findOne({ customerId });

    if (isApplicable === false) {
      // If isApplicable is false, update or create record with only isApplicable field
      if (insuranceRecord) {
        insuranceRecord.isApplicable = false;
        insuranceRecord.member = undefined;
        insuranceRecord.nominees = undefined;
        insuranceRecord.benefits = undefined;
      } else {
        insuranceRecord = new InsuranceModel({
          customerId,
          isApplicable: false,
        });
      }

      await insuranceRecord.save();

      return success(res, "Insurance details saved successfully", { isApplicable: false });
    }

    const finalData = await finalModel.findOne({ customerId })
    
    // If isApplicable is true, update all fields
    if (insuranceRecord) {
      // Update existing record
      insuranceRecord.isApplicable = true;
      insuranceRecord.member = member || insuranceRecord.member;
      insuranceRecord.nominees = nominees || insuranceRecord.nominees;
      insuranceRecord.benefits = {
        amountSumAssured: finalData?.finalLoanAmount,  
        termOfCoverYears: finalData?.tenureInMonth,   
        premiumAmount: benefits?.premiumAmount || insuranceRecord?.benefits?.premiumAmount, 
      };
    } else {
      // Create new record
      insuranceRecord = new InsuranceModel({
        customerId,
        member,
        nominees,
        benefits:{
          amountSumAssured : finalData?.finalLoanAmount,
          termOfCoverYears: finalData?.tenureInMonth,
          premiumAmount: benefits?.premiumAmount || insuranceRecord?.benefits?.premiumAmount
        },
        isApplicable: true,
      });
    }

    // console.log(insuranceRecord,"insuranceRecord<><><><><>")
    await insuranceRecord.save();

    success(res, "Insurance details saved successfully", insuranceRecord);
    await processModel.findOneAndUpdate(
      { customerId },
      { $set: {
        insuranceDetail:true
      } },
      { new: true }
  );
  // await finalApprovalSheet(customerId)

  } catch (error) {
    console.error("Error in createOrUpdateInsurance:", error);
    return unknownError(res, error);
  }
};


// get Insurance Details by Customer ID // 

const getInsuranceDetails = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return badRequest(res, "Customer ID is required");
    }

    const insuranceRecord = await InsuranceModel.findOne({ customerId });

    if (!insuranceRecord) {
      return success(res, "Insurance details not found", {});
    }

    return success(res, "Insurance details fetched successfully", insuranceRecord);
  } catch (error) {
    console.error("Error in getInsuranceDetails:", error);
    return unknownError(res, error);
  }
};


// get All Insurance Details // 

const getAllInsuranceDetails = async (req, res) => {
  try {
    const insuranceRecords = await InsuranceModel.find();

    return success(res, "All insurance details fetched successfully", insuranceRecords);
  } catch (error) {
    console.error("Error in getAllInsuranceDetails:", error);
    return unknownError(res, error);
  }
}











module.exports = {
  addInternalLegalDetails,
  internalLegalDetails,
  nameDropDown,
  nameDropDownDetailed,
  createOrUpdateInsurance,
  getInsuranceDetails,
  getAllInsuranceDetails
};
