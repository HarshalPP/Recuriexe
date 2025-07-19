
const express = require("express");
const router = express.Router();

const { employeeDetailByUserName, vendorAdd , allFiledUpdateVendor, vendorprofileDetails, getAllVendorByRoleAndBranch, vendorActiveOrInactive , externalManualFormByVendor, 
     getManualFormList, getManualFormDetail, getAllVendorByType , multiplVendorTypeShowList , vendorCreateCredential , vendorSubmitVendorForm , multipleStatusReportList ,
     vendorInvoiceDashboard , vendorInvoicePaymentsUpdate ,  vendorApproveForLogin , vendorByCompleteFilesDetails, } = require("../../controller/adminMaster/vendor.controller")

const { perticulerVendorsDashBoard , allVendorsDashBoard , vendorTableByBranch , vendorTableByvendor , perticulerVendorsPriceCalculate ,   newVendorCreateFoModel, monthlyDashbordCount
} = require('../../controller/externalManager/externalVendorDynamic.controller')

router.get("/employeeDetail", employeeDetailByUserName)
router.post("/vendorAdd", vendorAdd)
router.post("/update", allFiledUpdateVendor)
router.get("/profileDetails", vendorprofileDetails)
router.get("/getAllVendor", getAllVendorByRoleAndBranch) 
router.get("/vendorType", getAllVendorByType) 
router.post("/activeOrInactive", vendorActiveOrInactive)

router.get("/fileDetails", vendorByCompleteFilesDetails)

router.get("/dashBoard",perticulerVendorsDashBoard)
router.get("/priceCalculate",perticulerVendorsPriceCalculate),
router.get("/admin/allDashBoard",allVendorsDashBoard)

//get api base on the month
router.get("/admin/monthlyDashbordCount",monthlyDashbordCount)

router.get("/admin/branchTable", vendorTableByBranch)
router.get("/admin/vendorTable", vendorTableByvendor)
router.get("/multiplVendorTypeShowList", multiplVendorTypeShowList)
router.get("/newVendorCreateForFilesHandle",  newVendorCreateFoModel)

router.post("/createCredential", vendorCreateCredential)
router.post("/submitVendorForm", vendorSubmitVendorForm)
router.get("/statusReportList", multipleStatusReportList)
router.post("/approveForLogin", vendorApproveForLogin)

router.post("/manual/form/add", externalManualFormByVendor)
router.get('/manual/all', getManualFormList)
router.get('/manual/detail', getManualFormDetail)

router.get('/invoice/dashboard', vendorInvoiceDashboard)
router.post('/invoice/paymentsUpdate',vendorInvoicePaymentsUpdate)


module.exports = router;



