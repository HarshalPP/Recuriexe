const express = require("express");
const router = express.Router();
const {customerDetailsList,dealSummaryType,customerApplicantDetail,customerCoApplicantDetail, customerCoApplicantDetailold , customerGuarantorDetail,customerReferenceDetail,customerCibilDetail,
    customerbankDetail,customerDetails,customercollateralDetail,customerloanAgreementDetail,customercreditAndPdReportDetail,customerdueDiligenceReportDetail,
    partnerNameDetails,branchPendencyDetails,customerLoanType,sanctionDetails,disbursementDetails,inventoryManagement,sendToPartner,addCibilDetails,growMonetSendToPartner,excelSheetData
    ,ratnaFinSendToPartner,ratnaFinGenerateEsign,growMoneySendToPartner,growMoneyGenerateEsign,allDocuments,getAllDocumentDashboard,uploadDocuments,addLoanDocuments,partnerDocumentRequest,uploadRequestDocument,requestDocumentList,
    addDocumetsList,uploadkycDocument,ratnaFinSendEmail,sanctionPendency,sanctionPendencyDetails,disbursementFormAdd,getAllEstampReq,eStampUploadApi, updateDocument,downloadSanctionDocument,sendToPartnernew,
    sendEmailToPartner,sendEmailToPartnerForEsign,sendEmailToCustomerForEsign, eSignGenerate,getCustomerEsignUrl,testecustomerDetailsList,
    addOrUpdateGoogleSheetData, selectPartner , getPartnerDetails ,addQuery,getQuery,addCoAppCibilDetails,downloadCamReport,SelectSelection,IncomeSanctionsendToPartner,IncomeSanctionSendEmail,allLegalPdfs,dobsignnew,addSelfAssign ,slefAssignList
   ,getPartnerDetailByCustomerId, getCustomerEsignDocument, updateCibilDetails,updatePropertyDetails , RejectByHo,dashbordCountUser, updateStatusByHo, customerListFileProcess,getDissionBox,getEstampReq,signEsignDocument,signEsignDocumentDetails,deedpdfs,
   updateStatus,statusList,newUploadDocuments,generateLegalityDocument,webhookMethod,finalApprovalDashbord,secondWebhookMethod,documentLeegilatyDetails,getDashboardTableByEmployee,getDashboardDataByProduct,
   disbursementEstampDelete , finalApprovalDashboardUpdate, finalApprovalFilterApi,testDigioApi,sendToBranch,sendToPartnerSanction,addDistanceOfMap,testDigioApi_done,uploadDocument,documentList,docGenerate,
   fileStageStatusUpdate , getFileStageForAllCustomers, addMortgageDetails, getMortgageDetails , reUploadDocument, customerAllData,updateLenderProduct,customerPolicyCheck, customerDocumentCheck,generateDocumentZip,
   finalMainDashboard , overAllDashboard ,updateStatusApi,getCamDetails,updateCamDetails,camDropDown,newfinalMainDashboard,PartnerValidation,uploadDocumentList,addRatnaEsignLink,finalMainDashboardMonthlyCount, newFileManagementDashbord
  } = require("../controller/finalApproval.controller")
  const { getRatnaEmDeedpdfs, generateSignzy, generateContract,initiateContract, initiateContractDetails } = require("../controller/newFileManagement/preDisbursement.controller")
  const { createNewCamReport,createCamReport } = require("../controller/generateCamReport.controller")
  const {pdDownloadPhotos} = require("../controller/downloadImages")
  const {InternalCampdf} = require("../controller/allFinalAprrovaldataPdf/allData.controller")
  const {CashRecomendationPdf} = require("../controller/allFinalAprrovaldataPdf/cashRecomendation.controller")

  const {newSendToPartner , newAllLegalPdfs} = require('../controller/newManagmentPartnerPdf')


const { upload,upload2 } = require("../../../../Middelware/multer");
router.get("/InternalCampdf",InternalCampdf)
router.get("/CashRecomendation",CashRecomendationPdf)

router.get("/imageConvertZip",pdDownloadPhotos)
router.get("/loanType",customerLoanType)

router.get("/testcustomerList",testecustomerDetailsList)

router.get("/dealSummaryType",dealSummaryType)
//dashbord api
router.get("/customerList",customerDetailsList)
// dashbord counting api
router.get("/dashbordCount",dashbordCountUser)

//dashbord api for file process
router.get("/customerListFileProcess",customerListFileProcess)

router.get("/customerDetails/:customerId",customerDetails)
router.get("/applicantDetail",customerApplicantDetail)
router.get("/newcoApplicantDetail",customerCoApplicantDetail)
router.get("/coApplicantDetail",customerCoApplicantDetailold)
router.get("/guarantorDetail",customerGuarantorDetail)
router.get("/referencesDetail",customerReferenceDetail)
router.get("/bankDetail",customerbankDetail)
router.get("/collateralDetail",customercollateralDetail)
router.get("/loanAgreementDetails",customerloanAgreementDetail)
router.get("/cibilDetail",customerCibilDetail)
router.get("/creditAndPdReport",customercreditAndPdReportDetail)
router.get("/dueDiligenceReport",customerdueDiligenceReportDetail)//
router.get("/partner",partnerNameDetails)
router.get("/branchPendency",branchPendencyDetails)
router.get("/sanction",sanctionDetails)
router.get("/disbursement", disbursementDetails)
router.get("/inventoryManagement", inventoryManagement)
//add cibil details for applicant
router.post("/addCibilDetails",addCibilDetails)
//update cibil details for applicant
router.post("/updateCibilDetails",updateCibilDetails)
// add cibil details for co-applicant
router.post("/addCoAppCibilDetails",addCoAppCibilDetails)
router.post("/sendToPatner",sendToPartner)
router.post("/growMoneySendToPatner",growMoneySendToPartner)
router.get("/excelSheetData",excelSheetData)

// generate pdf
router.get('/ratnaFin',ratnaFinSendToPartner)
//send pdf
router.get('/ratnaFinSendEmail',ratnaFinSendEmail)
router.get('/incomeSanctionLetter',IncomeSanctionsendToPartner)
router.get('/incomeSanctionSendEmail',IncomeSanctionSendEmail)
//ratnasigndob  dobsignnew
router.post('/legalpdfs',allLegalPdfs)
router.get('/dobsignnew',dobsignnew)


//genrrate esign
router.get('/ratnaFinGenerateEsign',ratnaFinGenerateEsign)

router.get('/growMoneyGenerateEsign',growMoneyGenerateEsign)

router.get('/allDocuments',allDocuments)
router.get('/getAllDocumentDashboard',getAllDocumentDashboard)

router.post('/newAllDocuments',newUploadDocuments)

router.post('/loanDocument',
        upload.fields([
            { name: "dualNameDeclaration", maxCount: 10 },
            { name: "dualSignDeclaration", maxCount: 10 },
            { name: "dualDoBDeclaration", maxCount: 10 },
            { name: "bankDetails", maxCount: 10 },
            { name: "applicantBSV", maxCount: 10 },
            { name: "guarantorBSV", maxCount: 10 },
            { name: "insuranceForm", maxCount: 10 },
            { name: "emOrRmDeed", maxCount: 10 },
            { name: "vettingReport", maxCount: 10 },
            { name: "camReport", maxCount: 10 },
            { name: "applicantPhoto", maxCount: 1 },
            { name: "coApplicantPhoto", maxCount: 1 },
            { name: "coApplicantPhotoTwo", maxCount: 1 },
            { name: "guarantorPhoto", maxCount: 1 },
            { name: "applicantCibilReport", maxCount: 10 },
            { name: "coApplicantCibilReport", maxCount: 10 },
            { name: "coApplicantTwoCibilReport", maxCount: 10 },
            { name: "guarantorCibilReport", maxCount: 10 },
            { name: "electricityBill", maxCount: 10 },
            { name: "SamagraId", maxCount: 10 },
            { name: "utilityBillDocument", maxCount: 10 },//1
            { name: "familyCardDocument", maxCount: 10 },
            { name: "udyamCertificate", maxCount: 10 },
            { name: "bankStatement", maxCount: 10 },
            { name: "incomeDocument", maxCount: 10 },
          //  { name: "propertyDocument", maxCount: 10 },//1
            { name: "pdReport", maxCount: 10 },
            { name: "housePhotos", maxCount: 10 },
            { name: "workPhotos", maxCount: 10 },
            { name: "nachDocument", maxCount: 10 },
            { name: "applicantPDC", maxCount: 10 },
            { name: "guarantorPDC", maxCount: 10 },
            { name: "applicantAadharFrontImage", maxCount: 1 },
            { name: "applicantAadharBackImage", maxCount: 1 },
            { name: "applicantPanFrontImage", maxCount: 1 },
            { name: "applicantDrivingLicenceImage", maxCount: 1 },
            { name: "applicantVoterIdImage", maxCount: 1 },
            { name: "gurantorAadharFrontImage", maxCount: 1 },
            { name: "gurantorAadharBackImage", maxCount: 1 },
            { name: "gurantorDocImage", maxCount: 1 },
            { name: "rcuReport", maxCount: 10 },
            { name: "legalReport", maxCount: 10 },
            { name: "technicalReport", maxCount: 10 },
            { name: "coApplicantKycAadharFrontImage", maxCount: 1 },
            { name: "coApplicantKycAadharBackImage", maxCount: 10 },
            { name: "coApplicantKycDocImage", maxCount: 1 },
            { name: "coApplicantKycTwoAadharFrontImage", maxCount: 1 },
            { name: "coApplicantKycTwoAadharBackImage", maxCount: 1 },
            { name: "coApplicantKycTwoDocImage", maxCount: 1 },
            { name: "signApplicantKyc", maxCount: 1 },//
            { name: "signCoApplicantKyc", maxCount: 1 },
            { name: "signCoTwoApplicantKyc", maxCount: 1 },
            { name: "signGurantorKyc", maxCount: 1 },
            { name: "coOwnershipDeed", maxCount: 10 },
            { name: "eNachLinkSignUpload", maxCount: 1 },
        ]),
        uploadDocuments)

// add aditional document
router.post('/addDocument',
        // upload.single('file'),
        addLoanDocuments)  

// get aditional document
router.get('/documentList', addDocumetsList)    

//update aditioonal document
router.post('/updateDocument',upload.single('file'), updateDocument)    
   
// document request for partner        
router.post('/documentRequest',partnerDocumentRequest) 

router.post('/uploadRequestDocument', upload.single('file'),uploadRequestDocument)  


router.get('/requestDocument', requestDocumentList)  

//upload and update loan document
router.post('/kycDocument',
    upload.fields([
        { name: "appKycDocument", maxCount: 1 },
        { name: "coAppKycDocument", maxCount: 1 },
      ]),
    uploadkycDocument)

router.post('/sanctionPendency', sanctionPendency)  
router.post('/disbursementFormAdd', disbursementFormAdd)  
router.post('/disbursementEstampDelete', disbursementEstampDelete)  
router.get('/getAllEstampReq', getAllEstampReq)  
router.get('/getEstampReq', getEstampReq)  
router.post('/eStampUploadApi', eStampUploadApi) 
router.get('/sanctionPendency', sanctionPendencyDetails)    

// router.get('/allDocuments',allDocuments)

router.get('/downloadSanctionDocument',downloadSanctionDocument)

//Generate pdf document for all the partner
router.get('/sendtopartnernew',sendToPartnernew)


//-----------------newFileManagement send to partner ----------------------------------
router.get("/newFileManagementPartnerDocGenrate",newSendToPartner)
router.post("/newFileManagementlegalpdfs",newAllLegalPdfs)
// router.get('/sendtopartnernew1',sendToPartnernew1)

//sendEmailToPartner
router.get('/sendEmailToPartner',sendEmailToPartner)

router.get('/sendEmailToPartnerForEsign',sendEmailToPartnerForEsign)
router.get('/sendEmailToCustomerForEsign',sendEmailToCustomerForEsign)
router.get('/eSignGenerate',eSignGenerate)
//add data in google sheet
router.post('/addGoogleSheetData',addOrUpdateGoogleSheetData)

//change partner api
router.post('/changePartner',selectPartner)
router.get("/getPartnerDetails",getPartnerDetails)


//add query for documents
router.post('/addQuery',addQuery)

//get query for documents
router.get('/getQuery',getQuery)

//create cam report
router.get('/camReport',createCamReport)

//create new cam report
router.get('/newCamReport',createNewCamReport)

router.get('/download',downloadCamReport)

//select selection for the ac, acg,acc,accg,acccg
router.post('/SelectSelection',SelectSelection)

// final self assign  api
router.get('/selfAssign',addSelfAssign)

// self assign list api
router.get('/selfAssignList',slefAssignList)
router.get('/getPartnerDetailBy',getPartnerDetailByCustomerId)
router.get('/getCustomerEsignDocument',getCustomerEsignDocument)
router.get('/getCustomerEsignUrl',getCustomerEsignUrl)

//property details
router.post('/propertyDetails',updatePropertyDetails)
router.post('/RejectbyHo' , RejectByHo)

// update status by HO
router.post('/updateStatus' , updateStatusByHo)


// decision box //
router.get('/getDecisionBox',getDissionBox)

// sign esign document box //
router.post('/signEsignDocument',signEsignDocument)

// get esign document box //
router.get('/signEsignDocument',signEsignDocumentDetails)

router.get('/getdeedpdfs',deedpdfs)

// final approval update status
router.get('/updateStatus',updateStatus)

router.get('/statusList',statusList)

// generate pdf url for esign link
router.post('/generateLegalityDocument',generateLegalityDocument)

// webhook
router.post('/webhook',webhookMethod)  

// webhook
router.post('/secondWebhook',secondWebhookMethod) 

// get legality document for all sign user
router.get('/documentLeegalityDetails',documentLeegilatyDetails) 

// getDashboardData getDashboardDataByProduct getDashboardTableByEmployee getDashboardDataByProduct

router.get('/finalApprovalDashbordUpdate',finalApprovalDashboardUpdate)  

// router.get('/finalApprovalDashboard',finalApprovalDashboard)  

router.get('/finalApprovalFilterApi',finalApprovalFilterApi)  


router.get('/getDashboardTableByEmployee',getDashboardTableByEmployee)  

router.get('/getDashboardDataByProduct',getDashboardDataByProduct)  


router.post('/testDigioApi',testDigioApi_done) 

router.get('/testDigioApi',testDigioApi) 

router.post('/addDistanceOfMap',addDistanceOfMap) 

router.get('/sendToBranch',sendToBranch) 

router.get('/sendToPartnerSanction',sendToPartnerSanction) 


//upload document for the generate esign document
router.post('/uploadDocument',uploadDocument) 
router.get('/uploadDocumentList',uploadDocumentList) 

router.post('/addMortgageDetails',addMortgageDetails) 
router.get('/getMortgageDetails',getMortgageDetails) 

//conditional render esign and nach
router.get('/documentDetail',documentList) 

router.post('/reUploadDocument',reUploadDocument) 

//generate document automatic
router.get('/doc',docGenerate) 

router.post('/fileStageStatusUpdate',fileStageStatusUpdate) 
router.get('/getFileStageForAllCustomers',getFileStageForAllCustomers)

// customer all Data
router.get('/customerAllData',customerAllData)

// customer all Data
router.get('/policyCheck',customerPolicyCheck)

// customer document check list
router.get('/documentCheck',customerDocumentCheck)

//generate zip
router.get('/generateDocumentZip',generateDocumentZip)

//update lender product
router.post('/updateLenderProduct',updateLenderProduct)

router.get('/finalMainDashboard',finalMainDashboard)

router.get('/newFileManagementDashbord',newFileManagementDashbord)

router.get('/finalMainDashboardMonthlyCount',finalMainDashboardMonthlyCount)

router.get('/overAllDashboard',overAllDashboard)

router.post('/updateStatusApi',updateStatusApi)

router.get('/getCamDetails',getCamDetails)

router.post('/updateCamDetails',updateCamDetails)

//camDropDown
router.get('/camDropDown',camDropDown)

router.get('/newfinalMainDashboard',newfinalMainDashboard)

router.post('/addRatnaEsignLink',addRatnaEsignLink)

//PartnerValidation
router.get('/PartnerValidation',PartnerValidation)

router.get('/getRatnaEmDeedpdfs',getRatnaEmDeedpdfs)

//create template
router.get('/generateSignzy',generateSignzy)

router.get('/generateContract',generateContract)

//initiate contract
router.post('/initiateContract',initiateContract)

router.get('/initiateContractDetails',initiateContractDetails)

module.exports = router;







 

    
