const express = require("express");
const router = express.Router();
const { fileStatusRevertByVendor  , assignFilesAllVendors , getDetailsByCustomerId , externalManagerFormDetail , getCustomerList , getCustoemrDetail  , addByAllVendors , AllVendorsFormShowList , intenalVendorDashboard , 
    externalManagerDashboard , getCustomreFileDetail ,  allVendorCasesList ,AllFileApproveRejectList ,fileApprovedReject, externalVendorList ,getBranchEmployeeAssignData , updateBranchEmployeeData ,getHOEmployeeAssignData,updateHOVendorData,
    getVendorDataByCustomerId,fileHoldList , fileHoldByCustomerId , 
    //  externalVendorList , externalVendorDetail , vendorShowList
    vendorAssignFormDetails,
    externalManagerHistory} = require("../controller/externalManager/externalVendorDynamic.controller");
const { upload } = require("../../../../Middelware/multer");
const { addBranch , getAllBranch } = require('../controller/externalManager/createBranch.controller')
const { addPartner , getAllPartner } = require('../controller/externalManager/createPartner.controller')

// extrnal vendor 

const {updateAllPdDataToSheetTest , RcuGoogleSheetBulk} = require('../controller/googleSheet.controller')

// router.post("/create",addExternalVendor);
router.post("/fileAssign",assignFilesAllVendors);
router.get("/externalFilesDetails",getDetailsByCustomerId);
router.get("/form/detail", externalManagerFormDetail)
// router.get('/customer/list', getCustomerList)


// dynamic partner And branch add and List ----------------
router.post('/partner/add' , addPartner)
router.get('/partner/list' , getAllPartner)

// router.post('/branch/add' , addBranch)
// router.get('/branch/list' , getAllBranch)
router.get('/externalVendorList' , externalVendorList)

router.get('/branch/assign/list', getBranchEmployeeAssignData)
router.post('/upload/bybranchpendency', updateBranchEmployeeData)

router.get('/ho/assign/list', getHOEmployeeAssignData)
router.post('/upload/byhoProcess', updateHOVendorData)

router.post('/revertByVendor', fileStatusRevertByVendor)


// vendor 
router.post('/add/byVendor',addByAllVendors)
router.get('/vendorAssignFormDetails',vendorAssignFormDetails)
router.get('/assignFormVendor/List', AllVendorsFormShowList)
router.get('/completeFile/List', AllFileApproveRejectList)
router.post('/fileApprovedReject', fileApprovedReject)

//dashboard
router.get('/dashboardData', externalManagerDashboard)
router.get('/history', externalManagerHistory)
router.get('/customerFileDetail', getCustomreFileDetail)
router.get('/vendorCases', allVendorCasesList)

router.get('/intenalVendorDashboard',intenalVendorDashboard)

router.get('/getVendorDataByCustomerId',getVendorDataByCustomerId)

router.get('/fileHoldList',fileHoldList)

router.post('/fileHoldByCustomerId',fileHoldByCustomerId)

router.get('/updateAllPdDataToSheet' , updateAllPdDataToSheetTest)
router.get("/RcuGoogleSheetBulk",RcuGoogleSheetBulk)


module.exports = router;
