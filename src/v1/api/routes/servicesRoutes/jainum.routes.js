const express = require('express');
const router = express.Router();

const {Attachments  , setLoan , getLoanSummary , getLoanRepaymentSchedule , sendLedgerData , decryptfunc , verifyChecksum , setLoanSubscriptionPlan , getsendLedgerData , getLedger , ProductSchema , featchBranch , fetchCustomerData , setLoanCollateral } = require('../../services/jainum.service');
const{validateLedgerData} = require('../../validation/jainumValidation');

router.post('/lenderInfo'  ,  Attachments);
router.post('/setLoan', setLoan);
router.post('/decryptfunc', decryptfunc);
router.post('/getLoanSummary', getLoanSummary);
router.post('/getLoanRepaymentSchedule', getLoanRepaymentSchedule);
router.post("/send-ledger", sendLedgerData);
router.post("/verify-checksum", verifyChecksum);
router.post("/sendLedgerData", sendLedgerData);
router.post("/set-loan-subscription-plan", setLoanSubscriptionPlan);
router.post("/get-send-ledger-data", getsendLedgerData);
router.get("/cid" , getLedger)
router.post("/ProductSchema" , ProductSchema)
router.post("/featchBranch" , featchBranch)
router.post("/fetchCustomerData" , fetchCustomerData)

router.post("/setLoanCollateral", setLoanCollateral);
module.exports = router;
