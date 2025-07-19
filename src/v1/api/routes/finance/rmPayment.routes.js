const express = require("express");
const router = express.Router();

const {
    addrmPaymentController,
    getrmPaymentByIdController,
    getrmPaymentsByVendorController,
    updatermPaymentController,
    deactivatermPaymentController,
    getAllActivermPaymentsController,
    getAllActivermPaymentsByCreatorController,
    getrmPaymentsStatController,
    getrmPaymentsReportController
} = require("../../controller/finance/rmPayment.controller");

router.post("/add", addrmPaymentController);
router.get("/getById/:rmPaymentId", getrmPaymentByIdController);
router.get("/assigned", getAllActivermPaymentsByCreatorController);
router.get("/getByVendor/:vendor", getrmPaymentsByVendorController);
router.post("/update/:rmPaymentId", updatermPaymentController);
router.post("/deactivate/:rmPaymentId", deactivatermPaymentController);
router.get("/getAllActive", getAllActivermPaymentsController);
router.get("/stat", getrmPaymentsStatController);
router.post("/report", getrmPaymentsReportController);


module.exports = router;
