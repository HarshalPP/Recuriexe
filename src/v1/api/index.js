import { Router } from 'express';
import User from "./routes/authRoutes/auth.routes.js"
import Upload from "./routes/uploadRoutes/upload.routes.js"
import formLibraryRoute from "./routes/formLibraryRoutes/formLibrary.route.js"

// Super Admin Routes //
import Allocated from "./routes/AllocatedModule/Allocatedmodule.routes.js"


// Employee setup routes //
import branch from "./routes/branchRoutes/branch.routes.js"
import worklocation from "./routes/worklocationRoutes/worklocation.routes.js"
import department from "./routes/departmentRoutes/deparment.routes.js"
import designation from "./routes/designationRoutes/designation.routes.js"
import employmentType from "./routes/employeeTypeRoutes/employeeType.routes.js"
import employmentTypes from "./routes/employeementTypeRoutes/employeementtype.routes.js"
import costcenter from "./routes/costRoutes/costcenter.routes.js"
import Role from "./routes/roleRoutes/role.routes.js"
import company from "./routes/companyRoutes/compnay.routes.js"
import organization from "./routes/orgainzationRoutes/orgainzation.routes.js"
import AIsetUp from "./routes/aiRoutes/ai.routes.js"
import shift from "./routes/ShiftRoutes/shift.routes.js"
import Qualification from "./routes/QualificationRoutes/qualification.routes.js"
import PortalsetUp from "./routes/portalsetUpRoutes/portalsetUp.routes.js"
import formStagesetUP from "./routes/formStageRoutes/formstage.routes.js"
import templete from "./routes/templeteRoutes/templete.routes.js"
import userConfig from "./routes/userConfigRoutes/userConfig.routes.js"
import Bookdemo from "./routes/bookRoutes/book.routes.js"
import varibleRouter from "./routes/variableRoutes/varible.route.js"
import pdfRouter from "./routes/pdfRoutes/pdf.route.js"
import initRouter from "./routes/initRoutes/init.route.js"
import initFieldRouter from "./routes/initFieldsRoutes/initFields.route.js"
import jobRouter from "./routes/jobRoutes/job.route.js"
import emailtemplateRouter from "./routes/emailroutes/pdfTemplate.route.js"
// Budged //
import Budged from "./routes/budgedRoutes/budged.routes.js"


// Job description Routes //
import jobdescription from "./routes/jobdescriptionRoutes/jobdescription.routes.js"

// vacency Request //

import vacancyRequest from "./routes/vacencyrequestRoutes/vacencyrequest.routes.js"

// Job Post Request //

import JobRequest from "./routes/jobpostRoutes/jobpost.routes.js"
import jobSaveRouter from "./routes/jobpostRoutes/jobSave.routes.js"
// JOB APPLY Requst //

import jobApplyRequest from "./routes/jobApplyRoutes/jobapply.routes.js"

// Setting //

import setting from "./routes/settingRoutes/setting.routes.js"


// candidate Request //
import candidateRequest from "./routes/candidateRoutes/candidate.routes.js"


// Leave Request //
import leavetypeRequest from "./routes/leaveRoutes/leave.routes.js"

// calender Request //
import calenderRequest from "./routes/calenderRoutes/calender.routes.js"

// Subscription Plan //
import Subscription from "./routes/subscriptionRoutes/subscription.routes.js"

// Verification Suit Route //
import verifyDocs from "./routes/verificationsuitRoutes/verificationsuit.routes.js"

// TASK MANAGEMENT 
import taskDetail from './routes/taskManagementRoute/task.routes.js'

// NOTES
import notesDetail from './routes/notesRoutes/notes.routes.js'

//  FILE SHARE STORE
// import fileShareDetail from './routes/fileShareRoutes/fileShare.routes.js'
import fileShareDetail from './routes/fileShareRoutes/finalFileShareRoutes.js'


import tracking from "./routes/trackingRoutes/tracking.routes.js"

import mailSwitchRouter from "./routes/mailRoutes/mail.router.js"

import pinCodeRouter from "./routes/pinCodeRoutes/pinCode.routes.js"

import favoriteRouter from "./routes/dashboardFavoritRoutes/favorite.router.js"

import Agency from "./routes/AgencyRoutes/agency.routes.js"



const router = Router();

//expense
import expenseCategoryRouter from './routes/expense/expenseCategory.router.js';
// import expenseTypeRouter from './routes/expense/expenseType.router.js'
import fieldRouter from './routes/expense/field.route.js'
import tripRouter from './routes/expense/trip.route.js'
import expenseRouter from './routes/expense/expense.route.js'
import reportRouter from './routes/expense/report.route.js'
import advanceRoute from './routes/expense/advance.route.js'
import purchaseRoute from './routes/expense/purchaseRequest.route.js'
import tripValueRoute from './routes/expense/tripValue.route.js'
import merchantRoute from './routes/expense/merchant.route.js'
import policyRoute from './routes/expense/policy.route.js'
import expenseRoleRoute from './routes/expense/expenseRole.route.js'
import userExpenseRoute from './routes/expense/userExpense.route.js'
import masterDropDownRouter from "./routes/masterDropDown/dropDown.routes.js"
import PlanRouter from "./routes/PlanRutes/plan.routes.js"
import targetCompany from "./routes/companyRoutes/targetCompany.routes.js"

// Linkedin Routes
import postRoutes from "./routes/Linkedin/post.routes.js"
import linkedinRoutes from "./routes/Linkedin/linkedin.routes.js"
import organizationRoutes from "./routes/Linkedin/organization.routes.js"
import socialMedia from "./routes/Linkedin/social.media.routes.js"
import serviceCommonRouter from "./routes/serviceRoutes/common.router.js"


// Social Media Routes
import socialMediaRoutes from "./routes/SocialMediaRoutes/socialAuth.routes.js"

// gmail send Routes 

import emailRoutes from "./routes/GmailRoute/mail.router.js"

// verification suit router
import apiRouter from "./routes/verificationsuitRoutes/apiReport.routes.js"
import { bulkJobApplyToGoogleSheet } from "./controllers/googleSheet/jobApplyGoogleSheet.js"

// Dynamic Career Form Routes //
import valueRouter from "./routes/dynamicCarrer/value.router.js";
import formRouter from "./routes/dynamicCarrer/form.route.js";
import inputRouter from "./routes/dynamicCarrer/input.route.js";
import templateRouter from "./routes/pdfTemplateRoutes/template.router.js"
import variableRouter from "./routes/pdfTemplateRoutes/variableSetUp.router.js"
import interviewRouter from "./routes/interviewRoutes/interview.routes.js"
//expense
//airphone
import airphoneRouter from "./routes/airPhoneRoutes/airphone.routes.js"
import serviceproviderRoute from './routes/serviceProvidedRoutes/service.route.js';
import userProductRouter from './routes/userProduct/userProduct.route.js';
import requestRouter from './routes/partnerRequestRoute/request.route.js';
import templateRoute from "./routes/templateRoutes/template.route.js"
import uploadRouter from './routes/uploadCommandRoutes/fileupload.route.js';
import dashboardRouter from './routes/dashRoutes/dashboard.route.js';
import docRoute from "./routes/docRoutes/doc.route.js"
import systemCategoryRoute from './routes/expenseRoutes/systemCategory.route.js';
import subcategoryRoutes from './routes/expenseRoutes/subcategory.route.js';
import dynamicFormRouter from './routes/expenseRoutes/dynamicForm.route.js';
import expenseType from './routes/expenseRoutes/expenseType.route.js'
import workflowRouter from './routes/expenseRoutes/workflow.route.js';
import vendorRouter from './routes/expenseRoutes/vendor.routes.js';
import expenseSubmissionRouter from './routes/expenseRoutes/expenseSubmission.route.js';

import documentValueTemplateRouter from "./routes/documentRoutes/documentFormValueRoutes.js";
import documentFormTemplateRouter from "./routes/documentRoutes/documentFormTemplateRoutes.js";
import reportServiceRoute from './routes/reportServiceRoutes/reportService.route.js';
import reportTypeRouter from './routes/reportTypeRoutes/reportType.routes.js';
import inputFieldRouter from './routes/inputFieldRoutes/inputField.routes.js';
import reportFormRouter from './routes/reportFormRoutes/reportForm.routes.js';
import reportTemplateRouter from './routes/reportTemplateRoutes/reportTemplate.routes.js';
import reportvariableRouter from './routes/reportvariableroutes/reportvarible.routes.js';
import casesRoutes from './routes/casesRoutes/cases.routes.js';
import reportPdfRouter from './routes/reportPdfGenerateroutes/reportPdfGeneareate.route.js';

router.use("/expenseCategory", expenseCategoryRouter)
// router.use("/expenseType",expenseTypeRouter)
router.use("/field", fieldRouter)
router.use("/trip", tripRouter)
router.use("/expense", expenseRouter)
router.use("/report", reportRouter)
router.use("/advance", advanceRoute)
router.use("/purchase", purchaseRoute)
router.use("/tripValue", tripValueRoute)
router.use("/merchant", merchantRoute)
router.use("/policy", policyRoute)
router.use("/expenseRole", expenseRoleRoute)
router.use("/userExpense", userExpenseRoute)
router.use('/favorite', favoriteRouter)
router.use("/templete", templete)
router.use("/demo", Bookdemo)
router.use("/Agency", Agency)




// Add API routes here for REGISTER //

router.use("/Auth", User);


// Super Admin setUp //
router.use("/allocated", Allocated);


// Employee setUp //

router.use("/branch", branch)
router.use("/workLocation", worklocation)
router.use("/newdepartment", department)
router.use("/designation", designation)
router.use("/employeType", employmentType)
router.use("/employmentType", employmentTypes)
router.use("/costcenter", costcenter)
router.use("/role", Role)
router.use("/company", company)
router.use("/targetCompany", targetCompany)
router.use("/org", organization)
router.use("/AISetUp", AIsetUp)
router.use("/shift", shift)
router.use("/qualification", Qualification)
router.use("/PortalsetUp", PortalsetUp)
router.use("/pinCode", pinCodeRouter)
router.use("/formStageset", formStagesetUP)
router.use("/masterPlan", PlanRouter)
router.use("/userConfig", userConfig)

// --------- Tracking Routes ----------- //
router.use("/tracking", tracking)
router.use("/mail", mailSwitchRouter)
router.use("/masterDropDown", masterDropDownRouter)
router.use('/template', templateRouter)
router.use('/variable', variableRouter)
router.use('/service', serviceCommonRouter)
router.use('/interview', interviewRouter)

// Job description setUp //

router.use("/jobdescription", jobdescription)


// vacency request setUp //

router.use("/vacencyRequest", vacancyRequest)


// Job Post Request //

router.use("/jobPost", JobRequest)


// job save router //
router.use("/jobSave", jobSaveRouter)


// Job Apply Request //

router.use("/job", jobApplyRequest)


// Candidate Request //

router.use("/candidate", candidateRequest)


// Upload image //

router.use("/upload", Upload)


// setting Routes //

router.use("/setting", setting)


// Leave Routes //

router.use("/leavetype", leavetypeRequest)


// Calender Request //

router.use("/calender", calenderRequest)

// Task Request //
router.use("/task", taskDetail)

router.use("/notes", notesDetail)

router.use('/fileShare', fileShareDetail)

// Budged Request //

router.use("/Budged", Budged)


// Subscription Plan //
router.use("/subscription", Subscription)


// verify Docs

router.use("/verifyDocs", verifyDocs)

// LinkedIn Posting
router.use('/post', postRoutes);
router.use('/linkedin', linkedinRoutes);
router.use("/organizations", organizationRoutes);
router.use("/socialmedia", socialMedia);

//Social Media

router.use("/socialMedia", socialMediaRoutes);

router.get("/googlesheet", bulkJobApplyToGoogleSheet)


// verification suit router 
router.use("/apis", apiRouter)

router.use("/input", inputRouter);
router.use("/form", formRouter);
router.use("/value", valueRouter);
router.use("/finalFileShare", fileShareDetail);

// gmail routes 
router.use("/mail", emailRoutes)

//airphone routes
router.use("/airphone", airphoneRouter);


// commandexe routes

router.use("/user-service", serviceproviderRoute)
router.use("/userproduct", userProductRouter)
router.use("/request", requestRouter)
router.use("/form-library", formLibraryRoute)
router.use("/varibale", varibleRouter)
router.use("/pdf", pdfRouter)
router.use("/init", initRouter)
router.use("/initFields", initFieldRouter)
router.use("/vendor-template", templateRoute)
router.use("/job", jobRouter)
router.use("/email", emailtemplateRouter)
router.use("/file", uploadRouter)
router.use("/dashboard", dashboardRouter)
router.use("/doc", docRoute)

// report generator
router.use("/report-service", reportServiceRoute)
router.use("/report-product", reportTypeRouter)
router.use("/report-input", inputFieldRouter)
router.use("/report-form", reportFormRouter)
router.use("/report-template", reportTemplateRouter)
router.use("/report-variable", reportvariableRouter)
router.use("/report-case", casesRoutes)
router.use("/report-pdf", reportPdfRouter)


// document routes 
router.use("/documentFormTemplate", documentFormTemplateRouter);
router.use("/documentValueTemplate", documentValueTemplateRouter);
//expenseRoutes
router.use("/systemCategory", systemCategoryRoute)
router.use("/subCategory", subcategoryRoutes)
router.use("/dynamicForm", dynamicFormRouter)
router.use("/expenseType", expenseType)
router.use("/workFlow", workflowRouter)
router.use("/vendor", vendorRouter);
router.use("/expenseSubmission", expenseSubmissionRouter);

export default router;