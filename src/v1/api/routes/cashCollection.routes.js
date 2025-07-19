
const express = require("express");
const router = express.Router();
const { transferToBankValidate } = require("../validation/cashCollectionValidation")


const {cashTransferToBank ,getCashTransferDetail,getAllCashTransfer,getCashTransferToPersonList, getCashCollectionDetail ,
    getcashEmiCollection, getCashEmidashboard , cashTransferApprovalApi,cashApprovalByCashPerson, getLedgerDetailByToken,
    getAllCashPersonBalanceFilter,getAllLedgerDetail} = require("../controller/collection/cashCollection.controller")


router.post("/transferToBank", transferToBankValidate('transferToBank') , cashTransferToBank)
router.get("/getCashTransferDetail", getCashTransferDetail)
router.get("/getAllCashTransfer", getAllCashTransfer)
router.get("/cashTransferToPerson", getCashTransferToPersonList)
router.get("/getAmount", getCashCollectionDetail)
router.get("/cashEmi", getcashEmiCollection)
router.get("/dashBoardCasehEmi", getCashEmidashboard)
router.post("/cashTransferApproval", cashTransferApprovalApi)
router.post("/cashApprovalByCashPerson", cashApprovalByCashPerson)
router.get("/cashBalanceSheet", getLedgerDetailByToken)
router.get("/cashPersonBalanceFilter",getAllCashPersonBalanceFilter)
router.get("/getAllCashPersonBalanceSheet",getAllLedgerDetail)

 module.exports = router;
 

    
