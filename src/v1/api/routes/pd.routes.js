const express = require("express");
const router = express.Router();
const {addCreditPdReport , getAllPdEmploye , creditPdGet , creditPdGetForApp, creditPdFormImagesGet , deletePdForm , PdFormsAssignList , 
    getAllCreditPpAssignFiles , addCreditPdReportJsonForm  , addCreditPdReportJsonFormCheck , fileRevertByPd  ,
     hoByRePdAndGeneratePdReport , getAllPdFileAdminDashboard , allFilesPdDashBoard , pdDashBoardEmployeeTable , pdDashBoardBranchTable , pdDashBoardProductTable , 
       topPdCompleteEmployees , fileInctiveBYProductId , familyDetailUpdate, getFamilyDetail ,electricityBillSaveOrUpdate, getElectricityDetail, withAllDataGeneratePdReport , 
       generatePdfWithoutImageReport  , getCustomerDatesDetail, getAllPdDetails , employeePdFileCounts, pdFilesDashBoardMonthlyCount } = require("../controller/pd.Controller");
const { upload } = require("../../../../Middelware/multer");


// const pdFormImages = upload.fields([
//   { name: 'agriculturePhotos', maxCount: 20 },
//       { name: 'otherDocUpload', maxCount:1 },
//       { name: 'milkPhotos', maxCount: 30 },
//       { name: 'animalPhotos', maxCount: 20 },
//       { name: 'last3MonthSalarySlipPhotos', maxCount: 3 },
//       { name: 'bankStatementPhoto', maxCount: 1 },
//       { name: 'salaryPhotos', maxCount: 5 },
//       { name: 'propertyOtherPhotos', maxCount:15 },
//       { name: "selfiWithCustomer", maxCount: 1 },
//       { name: "photoWithLatLong", maxCount: 1 },
//       { name: "front", maxCount: 1 },
//       { name: "leftSide", maxCount: 1 },
//       { name: "rightSide", maxCount: 1 },
//       { name: "approachRoad", maxCount: 1 },
//       { name: "mainRoad", maxCount: 1 },
//       { name: "interiorRoad", maxCount: 1 },
//       { name: "selfieWithProperty", maxCount: 1 },
//       { name: "propertyPhoto", maxCount: 1 },
//       // { name: 'electricityBillUpload', maxCount:1 },
//       { name: 'meterPhoto', maxCount:1 },
//       // { name: 'udyamAadharUpload', maxCount:1 },
//       { name: 'incomeOtherImages', maxCount:20 },
//       { name: 'SSSMPhoto', maxCount:1 },
//       { name: 'gasDiaryPhoto', maxCount:1 },
//       { name: 'latLongPhoto', maxCount:1 },
//       { name: 'landmarkPhoto', maxCount:1 },
//       { name: 'familyMemberPhotos', maxCount:10 },
//       { name: 'workPhotos', maxCount:30 },
//       { name: 'fourBoundaryPhotos', maxCount:4 },
//       { name: 'applicantImage', maxCount:1 },
//       { name: 'coApplicantImage', maxCount:4 },
//       { name: 'guarantorImage', maxCount:1 },
//     ])

// // router.post("/add/creditPdReport" ,pdFormImages , addCreditPdReport);


router.get("/getAllPdEmploye",getAllPdEmploye)                      
router.get("/creditPdGet/:customerId",creditPdGet)
router.get("/creditPdGetForApp/:customerId",creditPdGetForApp)
router.get("/pdFormImagesGet",creditPdFormImagesGet)
router.post('/deletePd',deletePdForm)   
router.get('/formAssign/list',PdFormsAssignList)   
    
router.get('/allPDAssignFiles',getAllCreditPpAssignFiles) 

router.get('/pdDetailWithDates',getCustomerDatesDetail) 
  
router.post('/addPdReport',addCreditPdReportJsonForm)

router.post('/fileRevertByPd',fileRevertByPd)

// router.get('/setdateINPdModel', setdateINPdModel)
router.get('/hoByRePdAndGeneratePdReport', hoByRePdAndGeneratePdReport)
router.get('/withAllDataGeneratePdReport', withAllDataGeneratePdReport)
router.get("/generatePdfWithoutImageReport",generatePdfWithoutImageReport)
router.get('/admin/pd-files' , getAllPdFileAdminDashboard)

router.get('/admin/pdFilesDashBoard' , allFilesPdDashBoard)

// monthly count
router.get('/admin/pdFilesDashBoardMonthlyCount' , pdFilesDashBoardMonthlyCount)

router.get('/admin/dashBoardBranchTable' , pdDashBoardBranchTable)
router.get('/admin/dashBoardProductTable' , pdDashBoardProductTable)
router.get('/admin/dashBoardEmployeeTable' , pdDashBoardEmployeeTable)
router.get('/admin/topPdComplete' ,   topPdCompleteEmployees)
router.post('/familyDetailUpdate',familyDetailUpdate)
router.get('/getFamilyDetail',getFamilyDetail)
router.post('/electricityBillSaveOrUpdate',electricityBillSaveOrUpdate)
router.get('/getElectricityDetail',getElectricityDetail)

router.get('/getAllPdDetails',getAllPdDetails)
router.get('/employeePd/fileCounts' , employeePdFileCounts)

module.exports = router;
