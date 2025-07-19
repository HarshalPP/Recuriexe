const express = require("express");
const router = express.Router();

require("../../../config/db");

const imageUpload = require("./routes/imageDetail.routes");
const loanCalculator = require("./routes/loanCal.routes");
const customerDetail = require("./routes/customer.routes");
const loginDetail = require("./routes/login.routes");
const adminMainRouter = require("./routes/adminMasterRoute/commanRouter");
const cibilRouter = require("./routes/cibil.routes");
const pdRouter = require("./routes/pd.routes");
const externalCustomer = require("./routes/externalCustomer.routes");
const emiCollectDetail = require("./routes/emiCollect.routes");
const sheetRouter = require("./routes/sheet.route.js");
const lenderDetail = require("./routes/lender.router.js");
const questionDetail = require("./routes/question.router.js");
const jobPostDetails = require("./routes/hrmsRoute/jobPost.routes.js");
const jobApplyForm = require("./routes/hrmsRoute/jobApplyForm.routes.js");
const candidateDetails = require("./routes/hrmsRoute/candidateDetails.routes.js");
const testimonial = require("./routes/testimonial.routes.js");
const website = require("./routes/website/website.routes.js");
const dashboard = require("./routes/hrmsRoute/dashboard.routes.js");
const ratnaaFinDetails = require("./routes/ratnaaFin/ratnaaFin.routes.js");
const externalVendorDetail = require("./routes/externalVendorForm.routes");
const dynamiVendorRouter = require("./routes/externalVendorDynamicRoutes.js");
const collectionDashboad = require("./routes/collectionDashboard.routes.js");
const cashCollectionDetail = require("./routes/cashCollection.routes.js");
const bodEodDetail = require("./routes/taskManagementRoute/task.routes.js");
const fileProcess = require("./routes/fileProcess.routes.js");
const AllKycForm = require("./routes/fileProcessRoute/kycForm.routes.js");
const branchPendency = require("./routes/branchPendency/branchPendency.router.js");
const sanctionLetter = require("./routes/sanctionLetter.routes.js");
const branch = require("./routes/adminMasterRoute/newBranch.routes.js");
const workLocation = require("./routes/adminMasterRoute/newWorkLocation.routes.js");
const designation = require("./routes/adminMasterRoute/newDesignation.routes.js");
const finalApproval = require("./routes/finalApproval.routes.js")
const finalApprovalupdate = require("./routes/finalApproval.update.routes.js")
const lenderRouter  = require("./routes/lenderCustomer/customer.router.js")
const insanc = require("./routes/incomeSanction.routes.js")

const approverFile = require("./routes/branchPendency/approverRouter.js")
const Camtvr = require("./routes/fileProcessRoute/camAndTvr.routes.js")
const disbursement = require("./routes/fileProcessRoute/disbursement.routes.js")
const jinamEntry = require("./routes/fileProcessRoute/jinamEntry.routes.js")
const fileEnventory = require("./routes/fileProcessRoute/fileEnventory.routes.js")
const employeeLeave = require("./routes/hrmsRoute/employeeLeave.routes.js")
const growMoney = require("./routes/growMoney/growMoney.router.js")
const finalsanction = require("./routes/finalSaction/finalSanction.routes.js")
const categoryvideoRouter = require("./routes/website/categoryvideo.routes.js")
const contactInfiRouter = require("./routes/hrmsRoute/contactInfo.routes.js")
const finalEligibility = require("./routes/finalApproval/finalEligibility.routes.js")
const websiteLead = require("./routes/website/weblead.routes.js")
const mobileRouter = require('./routes/mobileRouter/mobileApkRouter.js')
const moneyOne = require("./routes/servicesRoutes/moneyOne.routes.js")
const fetchBill = require("./routes/servicesRoutes/Axis.routes.js")
const jainum = require("./routes/servicesRoutes/jainum.routes.js")
const internalLegal = require("./routes/finalApproval/internalLegal.routes.js")
const cashLoginDetail = require('./routes/cashLoginRoute/cashLogin.routes.js')
const collectionDetail = require('./routes/newCollectionRoute/newCollection.routes.js')
const projectRoute = require('./routes/projectManagment/project.routes.js')
const projectTaskRoute = require('./routes/projectManagment/projectTask.routes.js')
const fileShareRoute = require('./routes/fileShare/fileShareRoute.routes.js')
const iciciRouter = require("./routes/servicesRoutes/icici.router.js")
const leaveTypeRouter = require("./routes/hrmsRoute/leaveType.routes.js");
const chatApp = require("./routes/chatRoute/chat.routes.js")


router.use("/leaveType", leaveTypeRouter);

router.use("/project",projectRoute);
router.use("/projectTask",projectTaskRoute);
router.use("/fileShare",fileShareRoute);
router.use("/income",insanc);
router.use("/icici",iciciRouter);
router.use("/camtvr", Camtvr);
router.use("/formData", imageUpload);
router.use("/calculator", loanCalculator);
router.use("/salesMan", customerDetail);
router.use("/login", loginDetail);
router.use("/adminMaster", adminMainRouter);
router.use("/cibil", cibilRouter);
router.use("/pd", pdRouter);
router.use("/allCustomerSheet", externalCustomer);
router.use("/googleSheet", emiCollectDetail);
router.use("/lender", lenderDetail);
router.use("/tvr", questionDetail);
router.use("/hrms", jobPostDetails);
router.use("/dashboard", dashboard);
router.use("/hrms/job", jobApplyForm);
router.use("/hrms/candidate", candidateDetails);
router.use("/testimonial", testimonial);
router.use("/websitdisbursemente", website);
router.use("/ratnaaFin", ratnaaFinDetails);
router.use("/externalvendor", externalVendorDetail);
router.use("/externalvendor", dynamiVendorRouter);
router.use("/collectionDashboad", collectionDashboad);
router.use("/cashCollection", cashCollectionDetail);
router.use("/bodEod", bodEodDetail);
router.use("/fileProcess", fileProcess);
router.use("/kycForm", AllKycForm);
router.use("/sanctionLetter", sanctionLetter);
router.use("/branch", branch);
router.use("/workLocation", workLocation);
router.use("/designation", designation);
router.use("/finalApproval",finalApproval)
router.use("/finalApprovalupdate",finalApprovalupdate)
router.use("/branchPendency", branchPendency);
router.use("/approver", approverFile);
router.use("/disbursement", disbursement)
router.use("/jinamEntry",jinamEntry)
router.use("/fileEnventory",fileEnventory)
router.use("/website",website)
router.use('/hrms/leave',employeeLeave)
router.use("/growMoney",growMoney)
router.use("/final",finalsanction)
router.use("/categoryvideo",categoryvideoRouter)
router.use("/contactInfo",contactInfiRouter)
router.use("/finalEligibility",finalEligibility)
router.use("/websiteLead",websiteLead)
router.use("/mobile",mobileRouter)
router.use("/moneyOne", moneyOne)
router.use("/jainum", jainum)
router.use("/Bill", fetchBill)
router.use("/lenderCustomer",lenderRouter)
router.use("/internalLegal",internalLegal)
router.use("/cashLogin",cashLoginDetail)
router.use("/collection",collectionDetail)
router.use("/chat",chatApp)

// ----------------3rd Party Api Services Routes-----------------
const razorPayDetail = require("./routes/servicesRoutes/razorpay.routes.js")
const aadharDetail = require("./routes/servicesRoutes/aadhar.routes");
const panDetail = require("./routes/servicesRoutes/pan.routes");
const bankAccountDetail = require("./routes/servicesRoutes/bankAccount.routes");
const electricityBill = require("./routes/servicesRoutes/electricity.routes");
const udyogAadharDetail = require("./routes/servicesRoutes/udyamVerification.routes");
const filterDetail = require("./routes/filter.routes.js");
const kycDetail = require("./routes/servicesRoutes/kyc.routes.js");
const financeDetail = require("./routes/finance/index.js");
const locationRoamDetail = require("./routes/servicesRoutes/locationRoam.routes.js")
const dashboardDetails = require("./routes/servicesRoutes/dashboard.routes.js")
const serverDetails = require("./routes/adminMasterRoute/server.route.js");
const sheetDetails = require("./routes/sheetShareRoute/sheetShare.routes.js");
const { getRoamUsers } = require("./services/locationRoam.services.js");
const { success } = require("../../../globalHelper/response.globalHelper.js");
const eNachDetail = require("./routes/servicesRoutes/eNach.routes.js");
const queryForm = require("./routes/queryForm.routes.js")
const cropSOFDetail = require("./routes/cropSOF.routes.js")
const prefileCibil = require("./routes/servicesRoutes/prefileCibil.routes.js");
const dailtTargetDetail = require("./routes/dailyTarget.routes.js")
const geminiRoute = require("./routes/geminiRoute/gemini.routes.js")
const endUseOfLoanRoute = require("./routes/endUseOfLoan.routes.js")
// const {processHierarchy} = require("./helper/automation.helper.js");

router.use("/razorPay", razorPayDetail);
router.use("/aadharDetail", aadharDetail);
router.use("/panDetail", panDetail);
router.use("/bankAccount", bankAccountDetail);
router.use("/electricity", electricityBill);
router.use("/udyam", udyogAadharDetail);
router.use("/sheet", sheetRouter);
router.use("/filter", filterDetail);
router.use("/cibilScore", kycDetail);
router.use("/finance", financeDetail);
router.use("/dashboard", dashboardDetails);
router.use("/eNach", eNachDetail);
router.use('/queryForm',queryForm)
router.use('/cropSOF',cropSOFDetail)
router.use("/locationRoam", locationRoamDetail);
router.use("/prefile", prefileCibil);
router.use("/server", serverDetails);
router.use("/sheet", sheetDetails);
router.use("/dailyTarget",dailtTargetDetail)
router.use("/geminiAI",geminiRoute)
router.use("/endUseOfLoan",endUseOfLoanRoute)


module.exports = router;


