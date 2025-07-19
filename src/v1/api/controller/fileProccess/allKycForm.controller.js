
const {
    serverValidation,
    success,
    notFound,
    badRequest,
    unknownError } = require('../../../../../globalHelper/response.globalHelper.js');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const credentials = require('../../../../../liveSheet.json');
const baseUrl = process.env.BASE_URL;
const axios = require('axios')
const xlsx = require('xlsx');
const moment = require('moment');
const { callbackify } = require('util');
const employeModel = require('../../model/adminMaster/employe.model.js')
const cibilModel = require("../../model/cibilDetail.model.js")
const customerModel = require("../../model/customer.model.js")
const processModel = require("../../model/process.model.js")
const applicantModel = require("../../model/applicant.model.js")
const coApplicantModel = require("../../model/co-Applicant.model.js")
const guarantorModel = require("../../model/guarantorDetail.model.js")

const applicantKycModel = require("../../model/fileProcess/applicantKyc.model.js")
const coApplicantKycModel = require("../../model/fileProcess/coApplicantKyc.model.js")
const gtrKycModel = require("../../model/fileProcess/gtrKyc.model.js")
const samagraIdKycModel = require("../../model/branchPendency/samagraIdKyc.model.js")
const electricityBillKycModel = require("../../model/branchPendency/electricityKyc.model.js")
const bankStatementModel = require("../../model/branchPendency/bankStatementKyc.model.js")
const udhyamKycModel = require("../../model/branchPendency/udhyamKyc.model.js")
const appPdcModel = require("../../model/branchPendency/appPdc.model.js")
const gtrPdcModel = require("../../model/branchPendency/gtrPdc.model.js")
const propertyPapersKycModel = require("../../model/branchPendency/propertyPaper.model.js")
const nachRegistrationModel = require("../../model/branchPendency/nachRegistration.model.js")
const physicalFileCourierModel = require("../../model/physicalFileCourier.model.js")
const cibilReportKycModel = require("../../model/fileProcess/cibilScoreKyc.model.js");
const {applicantKycSheet, coApplicantKycSheet , gtrKycSheet , electricityBillSheet ,
    samagraIdKycSheet ,udhyamKycSheet, bankStatementKycSheet ,propertyPaperKycSheet ,
    appPdcSheet, technicalReportKycSheet, taggingKycSheet ,rcuKycSheet ,cibilReportKycSheet,
    jainamKycSheet , sentForSanctionKycSheet ,postDisbursementKycSheet ,sentForDisbursementKycSheet} = require("../../controller/fileProccess/kycFormGoogleSheet.controller.js")
const {cibilReportKycForm,technicalReportKycForm, taggingKycForm, rcuKycForm, jainamKycForm, pdReportKycForm,  employeeData ,
    sentForSanctionKycForm , postDisbursementKycForm , sentForDisbursementKycForm } = require("../../helper/allKycForm.helper.js");

async function getCibilReportFileProcess(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { LD } = req.query; 
      const customer = await customerModel.findOne({ customerFinId: LD });
      if (!customer) {
        return badRequest(res, "Customer not found");
      }
  
      const customerId = customer._id;
  
      const process = await processModel.findOne({ customerId });
      if (!process) {
        return badRequest(res,"Process not found");
      }
  
      let cibilData = null;
      if (process.statusByCibil === "complete") {
        cibilData = await cibilModel.findOne({ customerId });
      }
  
      const [applicant, coApplicant, guarantor] = await Promise.all([
        applicantModel.findOne({ customerId }),
        coApplicantModel.find({ customerId }),
        guarantorModel.findOne({ customerId }),
      ]);

      const fileDetail = {
        cibilData,
        applicant,
        coApplicant,
        guarantor,
      };

      success(res, "Get App , coApp , gtr , Cibil Report  Detail", fileDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

// -------------------File Process Form Add Api--------------------------------------
async function applicantKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName, fullNameAadhaar, aadharNo, fatherNameAadhaar, 
            dateOfBirthAadhar, gender, age, addressAsPerAadhar, 
            panCardNo, fullNamePanCard , dateOfBirthPan, fatherNamePanCard, appFullNameAsPerVoterId, voterIdNo
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await applicantKycModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "KYC Form Added Successfully", kycFormDetail);
        await applicantKycSheet(kycFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function coApplicantKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName,coApplicantNo , fullNameAadhaar, aadharNo, fatherNameAadhaar, 
            dateOfBirthAadhar, gender, age, addressAsPerAadhar, 
            panCardNo, fullNamePanCard , dateOfBirthPan, fatherNamePanCard, coAppFullNameAsPerVoterId, voterIdNo
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await coApplicantKycModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Co-Applicant Kyc Form Submitted Successfully", kycFormDetail);
        await coApplicantKycSheet(kycFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function gtrKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName , fullNameAadhaar, aadharNo, fatherNameAadhaar, 
            dateOfBirthAadhar, gender, age, addressAsPerAadhar, 
            panCardNo, fullNamePanCard , dateOfBirthPan, fatherNamePanCard, gtrFullNameAsPerVoterId, voterIdNo
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await gtrKycModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "GTR Kyc Form Submitted Successfully", kycFormDetail);
          await gtrKycSheet(kycFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}


async function electricityBillKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName , ivrsNo , cusumerName , billDate
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await electricityBillKycModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Electricity Bill Form Submitted Successfully", kycFormDetail);
          await electricityBillSheet(kycFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function samagraIdForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName ,  samagraFamilyId ,                
            samagraFamilyNameHead,
            samagraMemberId1 , samagraMemberName1 , samagraMemberAge1 , samagraMemberGender1 , memberRelationWithApplicant1,
            samagraMemberId2 , samagraMemberName2 , samagraMemberAge2 , samagraMemberGender2 , memberRelationWithApplicant2 ,
            samagraMemberId3 , samagraMemberName3 , samagraMemberAge3 , samagraMemberGender3 , memberRelationWithApplicant3,
            samagraMemberId4 , samagraMemberName4 , samagraMemberAge4 , samagraMemberGender4 , memberRelationWithApplicant4,
            samagraMemberId5 , samagraMemberName5 , samagraMemberAge5 , samagraMemberGender5 , memberRelationWithApplicant5,
            samagraMemberId6 , samagraMemberName6 , samagraMemberAge6 , samagraMemberGender6 , memberRelationWithApplicant6,
            samagraMemberId7 , samagraMemberName7 , samagraMemberAge7 ,samagraMemberGender7 , memberRelationWithApplicant7,
            samagraMemberId8 , samagraMemberName8 , samagraMemberAge8 , samagraMemberGender8 , memberRelationWithApplicant8,
            samagraMemberId9 , samagraMemberName9 , samagraMemberAge9 , samagraMemberGender9 , memberRelationWithApplicant9,
            samagraMemberId10 , samagraMemberName10 , samagraMemberAge10 , samagraMemberGender10, memberRelationWithApplicant10,
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const samagraIdFormDetail = await samagraIdKycModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "SamagraId Form Submitted Successfully", samagraIdFormDetail);
        await samagraIdKycSheet(samagraIdFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}


async function bankStatementKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName , bankName,acHolderName,accountNumber,ifscCode,branchName,accountType, statementFromDate, statementToDate, 
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await bankStatementModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Bank Statement Form Submitted Successfully", kycFormDetail);
          await bankStatementKycSheet(kycFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function udhyamKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName , udhyamRegistrationNo , dateOfUdhyamRegistration , nameOfUnit, 
            typeOfEnterprises , typeOfOrganisation , ownerName , dateOfIncorporation , addressOfEnterprises ,
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await udhyamKycModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Udhyam Kyc Form Submitted Successfully", kycFormDetail);
        await udhyamKycSheet(kycFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function applicantPdcForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName , 
            bankName , acHolderName , accountNumber ,  ifscCode , branchName , accountType , totalChequeCount , chequeNo1 , chequeNo2 ,
            chequeNo3 , chequeNo4 , chequeNo5 , chequeNo6 , chequeNo7 , chequeNo8 , chequeNo9 , chequeNo10 ,
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await appPdcModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Applicant PDC Form Submitted Successfully", kycFormDetail);
        await appPdcSheet(kycFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function gtrPdcForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName , gtrName ,
            bankName , acHolderName , accountNumber ,  ifscCode , branchName , accountType , totalChequeCount , chequeNo1 , chequeNo2 ,
            chequeNo3 , chequeNo4 , chequeNo5 , chequeNo6 , chequeNo7 , chequeNo8 , chequeNo9 , chequeNo10 ,
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await gtrPdcModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Gtr PDC Form Submitted Successfully", kycFormDetail);
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}


async function propertyPapersKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName ,
           propertyOwnerName, relationWithCustomer, houseNo, surveyNo, patwariHalkaNo, wardNo, villageName, grampanchayatName,
           tehsilName, districtName, pincode, stateName, eastBoundary, westBoundary, northBoundary, southBoundary, plotLength,
           plotBridth, totalPlotArea, totalAreaOfConstruction, typeOfConstruction, ageOfProperty, pattaNo, pattaDate,
           buildingPermissionNo, buildingPermissionDate, mutationCertificateNo, mutationCertificateDate, ownerCertificateNo,
           ownerCertificateDate, taxReceiptNo, taxReceiptDate, nocCertificateNo, nocCertificateDate, coOwnershipDeedNo, coOwnershipDeedDate,

        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await propertyPapersKycModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Property Papers Form Submitted Successfully", kycFormDetail);
           await propertyPaperKycSheet(kycFormDetail)
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function nachRegistrationKycForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName  ,
            nachRegistrationNoUMRN, nachDoneDate,
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await nachRegistrationModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Nach Registration Form Submitted Successfully", kycFormDetail);
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}

async function physicalFileCourierForm(req, res) {
    try {
        // Validate request body for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Check if the employee exists and is active
        const tokenId = new ObjectId(req.Id);
        const employeeData = await employeModel.findOne({ _id: tokenId, status: "active" });
        if (!employeeData) {
            return notFound(res, "Employee not found", []);
        }
        const {
            LD, customerName  ,
            branchName , courierBy , courierTo , podNo , courierDate
        } = req.body;

        // Create a new KYC form record in the applicantKycModel
        const kycFormDetail = await physicalFileCourierModel.create({
          ...req.body, 
          employeeId: employeeData._id  
      });
        // Send a success response with the newly created KYC form data
        success(res, "Nach Registration Form Submitted Successfully", kycFormDetail);
        
    } catch (error) {
        console.error(error);
        unknownError(res, error); 
    }
}


async function addCibilReportKycController(req, res) {
    try {
        const tokenId = new ObjectId(req.Id);
        const employeeDetail = await employeeData(tokenId)
        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found")
        }
        const { status, message, data } = await cibilReportKycForm(req.body,employeeDetail);
        await cibilReportKycSheet(data)
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function addTechnicalReportKycController(req, res) {
    try {
        const tokenId = new ObjectId(req.Id);
        const employeeDetail = await employeeData(tokenId)
        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found")
        }
        const { status, message, data } = await technicalReportKycForm(req.body,employeeDetail);
        await technicalReportKycSheet(data)
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function addTaggingKycFormController(req, res) {
    try {
        const tokenId = new ObjectId(req.Id);
        const employeeDetail = await employeeData(tokenId)
        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found")
        }
        const { status, message, data } = await taggingKycForm(req.body,employeeDetail);
        await taggingKycSheet(data)
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function addRcuKycFormController(req, res) {
    try {
        const tokenId = new ObjectId(req.Id);
        const employeeDetail = await employeeData(tokenId)
        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found")
        }
        const { status, message, data } = await rcuKycForm(req.body,employeeDetail);
        await rcuKycSheet(data)
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function addJainamKycFormController(req, res) {
    try {
        const tokenId = new ObjectId(req.Id)
        const employeeDetail = await employeeData(tokenId)
        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found")
        }
        const { status, message, data } = await jainamKycForm(req.body,employeeDetail);
        await jainamKycSheet(data)
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function addPdReportKycFormController(req, res) {
    try {
        const employeeDetail = await employeeData(req.Id)
        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found")
        }
        const { status, message, data } = await pdReportKycForm(req.body,employeeDetail);
        // await jainamKycSheet(data)
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function addSentForSanctionController(req, res) {
    try {
        const tokenId = new ObjectId(req.Id);
        const employeeDetail = await employeeData(tokenId); // Fetch employee details

        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found");
        }

        const { status, message, data } = await sentForSanctionKycForm(req.body, employeeDetail);

        if (status) {
             await sentForSanctionKycSheet(data); // Send data to Google Sheets
            return success(res, message, data);
        } else {
            return badRequest(res, message);
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function addPostDisbursementController(req, res) {
    try {
        const tokenId = new ObjectId(req.Id);
        const employeeDetail = await employeeData(tokenId); // Fetch employee details

        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found");
        }

        const { status, message, data } = await postDisbursementKycForm(req.body, employeeDetail);

        if (status) {
             await postDisbursementKycSheet(data); // Send data to Google Sheets
            return success(res, message, data);
        } else {
            return badRequest(res, message);
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}

async function addSentForDisbursementController(req, res) {
    try {
        const tokenId = new ObjectId(req.Id);
        const employeeDetail = await employeeData(tokenId); // Fetch employee details

        if (!employeeDetail) {
            return badRequest(res, "Employee Not Found");
        }

        const { status, message, data } = await sentForDisbursementKycForm(req.body, employeeDetail);

        if (status) {
             await sentForDisbursementKycSheet(data);
            return success(res, message, data);
        } else {
            return badRequest(res, message);
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}

  module.exports = {
    applicantKycForm,
    coApplicantKycForm,
    gtrKycForm,
    electricityBillKycForm,
    samagraIdForm,
    bankStatementKycForm,
    udhyamKycForm,
    applicantPdcForm,
    gtrPdcForm,
    propertyPapersKycForm,
    nachRegistrationKycForm,
    physicalFileCourierForm,
    addCibilReportKycController,
    addTechnicalReportKycController,
    addTaggingKycFormController,
    addRcuKycFormController,
    addJainamKycFormController,
    addPdReportKycFormController,
    getCibilReportFileProcess,
    addSentForSanctionController,
    addPostDisbursementController,
    addSentForDisbursementController
  }