const express = require("express");
const router = express.Router();
const { upload } = require("../../../../../Middelware/multer");
const {getCashLoginListByToken, loginCashApprovalApi, getAllLedgerDetail,
    cashLoginTransferAmount,
} = require('../../controller/cashLogin/cashLogin.controller')

router.get('/getCashLoginListByToken',getCashLoginListByToken)
router.post('/loginCashApprovalApi',loginCashApprovalApi)
router.get('/getAllLedgerDetail',getAllLedgerDetail)
router.post('/transferAmount',cashLoginTransferAmount)

module.exports = router;