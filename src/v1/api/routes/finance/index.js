const express = require("express");
const router = express.Router();

const assetDetail = require("./asset.routes.js");
const rmPaymentDetail = require("./rmPayment.routes.js");
const configDetail = require("./config.route.js");
const branchDetail = require("./branchRequest.route.js");
const stampDetail = require("./stamp.route.js");
const pdExpenceDetail = require("./pdExpence.routes.js");
const travelDetail = require("./travel.routes.js");
const branchExpenceDetail = require("./branchExpence.routes.js");
// const {processHierarchy} = require("./helper/automation.helper.js");


router.use('/asset',assetDetail)
router.use('/rm',rmPaymentDetail)
router.use('/config',configDetail)
router.use('/branch-request',branchDetail)
router.use('/stamp-request',stampDetail)
router.use('/pd-expence',pdExpenceDetail)
router.use('/travel',travelDetail)
router.use('/branch-expence',branchExpenceDetail)


module.exports = router;
