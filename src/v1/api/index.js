import { Router } from 'express';
import User from "./routes/authRoutes/auth.routes.js"
import Upload from "./routes/uploadRoutes/upload.routes.js"


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

import mailSwitchRouter from "./routes/mailRoutes/mail.routes.js"

import pinCodeRouter from "./routes/pinCodeRoutes/pinCode.routes.js"

import favoriteRouter from "./routes/dashboardFavoritRoutes/favorite.router.js"



const router = Router();

//expense
import expenseCategoryRouter from './routes/expense/expenseCategory.router.js';
import expenseTypeRouter from './routes/expense/expenseType.router.js'
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



// verification suit router
import apiRouter from "./routes/verificationsuitRoutes/apiReport.routes.js"
import {bulkJobApplyToGoogleSheet} from "./controllers/googleSheet/jobApplyGoogleSheet.js"

// Dynamic Career Form Routes //
import valueRouter from "./routes/dynamicCarrer/value.router.js";
import formRouter from "./routes/dynamicCarrer/form.route.js";
import inputRouter from "./routes/dynamicCarrer/input.route.js";
//expense
router.use("/expenseCategory",expenseCategoryRouter)
router.use("/expenseType",expenseTypeRouter)
router.use("/field",fieldRouter)
router.use("/trip",tripRouter)
router.use("/expense",expenseRouter)
router.use("/report", reportRouter)
router.use("/advance",advanceRoute)
router.use("/purchase",purchaseRoute)
router.use("/tripValue",tripValueRoute)
router.use("/merchant",merchantRoute)
router.use("/policy",policyRoute)
router.use("/expenseRole",expenseRoleRoute)
router.use("/userExpense",userExpenseRoute)
router.use('/favorite',favoriteRouter)
router.use("/templete" , templete)


// Add API routes here for REGISTER //

router.use("/Auth", User);


// Super Admin setUp //
router.use("/allocated", Allocated);


// Employee setUp //

router.use("/branch" , branch)
router.use("/workLocation" , worklocation)
router.use("/newdepartment" , department)
router.use("/designation" , designation)
router.use("/employeType" , employmentType)
router.use("/employmentType" , employmentTypes)
router.use("/costcenter" , costcenter)
router.use("/role" , Role)
router.use("/company" , company)
router.use("/targetCompany",targetCompany)
router.use("/org" , organization)
router.use("/AISetUp" , AIsetUp)
router.use("/shift" , shift)
router.use("/qualification" , Qualification)
router.use("/PortalsetUp" , PortalsetUp)
router.use("/pinCode" , pinCodeRouter)
router.use("/formStageset" , formStagesetUP)
router.use("/masterPlan", PlanRouter)

// --------- Tracking Routes ----------- //
router.use("/tracking" ,tracking)
router.use("/mail" ,  mailSwitchRouter)
router.use("/masterDropDown",masterDropDownRouter)
// Job description setUp //

router.use("/jobdescription" , jobdescription)


// vacency request setUp //

router.use("/vacencyRequest" , vacancyRequest)


// Job Post Request //

router.use("/jobPost" , JobRequest)


// job save router //
router.use("/jobSave",jobSaveRouter)


// Job Apply Request //

router.use("/job" , jobApplyRequest)


// Candidate Request //

router.use("/candidate" , candidateRequest)


// Upload image //

router.use("/upload" , Upload)


// setting Routes //

router.use("/setting" , setting)


// Leave Routes //

router.use("/leavetype" , leavetypeRequest)


// Calender Request //

router.use("/calender" , calenderRequest)

// Task Request //
router.use("/task",taskDetail)

router.use("/notes", notesDetail)

router.use('/fileShare',fileShareDetail)

// Budged Request //

router.use("/Budged" , Budged)


// Subscription Plan //
router.use("/subscription" , Subscription)


// verify Docs

router.use("/verifyDocs" ,  verifyDocs)

// LinkedIn Posting
router.use('/post', postRoutes);
router.use('/linkedin', linkedinRoutes);
router.use("/organizations", organizationRoutes);
router.use("/socialmedia", socialMedia );




router.get("/googlesheet",bulkJobApplyToGoogleSheet)


// verification suit router 
router.use("/apis", apiRouter)

router.use("/input",inputRouter);
router.use("/form",formRouter);
router.use("/value",valueRouter);
router.use("/finalFileShare", fileShareDetail);


export default router;