const express = require("express");
const router = express.Router();
const { upload } = require("../../../../../Middelware/multer");

const {
  employeAdd,
  employeActiveOrInactive,
  updateEmployee,
  updateEmployeePhoto,
  getAllEmploye,
  getEmployeeHierarchalDropDown,
  getAllEmployeeSheet,
  getAllEmployeForWebsite,
  getFilteredEmployeForWebsite,
  deleteEmployee,
  getAllInactiveEmployee,
  getEmployeeById,
  getEmployeeByToken,
  getAllEmployeByRole,
  getHoDashboardinGrid,
  getHoDashboard,
  employeeAllDetails,
  getEmployeeListByBranchAndRole,
  getEmployeByBranch,
  employeeVerify,
  punchInVerify,
  getCrmCallingEmploye,
  getCollectionManagerList,
  getAllJoiningEmployee,
  employeeApproval,
  updateRoleData,
  updateEmployeeSheet,
  getNewJoineeEmployee,
  addEmployeeResignation,
  getApprovedEmployeeResignations,
  employeeApprovalandReject,
  getEmployeeWorkingUnder,
  getAllEmployeeResignation,
  getEmployeeResignationForRM,
  employeeResignationAction,
  createRelivingPdf,
  createExperienceLetterPdf,
  getEmployeeHierarchy,
  getEmployeeTrackingConfig,
changeEmployeeTrackingConfig,
employeeTreeHierarchy,
createMailSwitches,
getMailSwitches,

} = require("../../controller/adminMaster/employe.controller");
const {
  employeeAttendanceActiveByTrueFalse,
  employeeAttendance,
  employeePunch,
  employeePunchList,
  punchDetail,
  getEmployeeMonthlyAttendance,
  getAllEmployeesMonthlyAttendance,
  employeePunchOutSideBranch,
  employeePunchApproval,
  getemployeePunchApproval,
  getemployeePunchApprovalHR,
  policyAdd,
  MonthlyAttendance,
  lastWeekAttendence,
  attandaceAcccToDate,
  deleteDuplicatesByDate,
  newMonthlyAttendance,
  sendPunchOutReminder,
  sendNoPunchInEmail,
  sendNoPunchOutEmail,
  getEmployeeByJoiningDate,
  sendAppointmentLetter,
  generateAppointmentLetterPdf,
  addRegulation,
  getregulation,
  getRegulationByReportingManager,
  updateRegulationStatus,
  getRegulationByUser,
  getUserToMail,
  sendNoPunchOutEmailTest,
  sendNoPunchInEmailTest,
  getAllEmployeesMonthlyAttendanceTwo,
  deleteAttendance,
  changeToOutside,
  approveChangeAttendace,
  getChangeAttendanceList
} = require("../../controller/adminMaster/attendance.controller");

const {addEnvConfig} = require("../../controller/adminMaster/env.controller")
// router.post("/employeAdd",upload.single("employeePhoto"), employeAdd)
router.post(
  "/employeAdd",
  upload.fields([
    { name: "employeePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "offerLetter", maxCount: 1 },
    { name: "bankDetails", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "educationCertification", maxCount: 1 },
    { name: "experienceLetter", maxCount: 1 },
    { name: "employmentProof", maxCount: 1 },
  ]),
  employeAdd
);
router.get("/getlastWeekAttendence", lastWeekAttendence);
router.get("/getattandaceAcccToDate", attandaceAcccToDate);
router.get("/tracking/:id", getEmployeeTrackingConfig);
router.post("/tracking/:id", changeEmployeeTrackingConfig);
router.get("/changeAttendance", changeToOutside);
router.post("/approveChangeAttendance", approveChangeAttendace);
router.get("/changeAttendanceList", getChangeAttendanceList);

router.get("/deleteAttendance", deleteAttendance);
// router.get("/test", getTest);


router.get("/getEmployeeById", getEmployeeById);
router.get("/getEmployeeByToken", getEmployeeByToken);
router.get("/getAllEmploye", getAllEmploye);
router.get("/getEmployeHierarchalDropDown", getEmployeeHierarchalDropDown);
router.get("/getNewJoineeEmployee", getNewJoineeEmployee);
router.get("/getAllInactiveEmployee", getAllInactiveEmployee);
router.get("/getAllEmployeeSheet", getAllEmployeeSheet);
router.get("/getAllEmployeForWebsite", getAllEmployeForWebsite);
router.get("/getFilteredEmployeForWebsite", getFilteredEmployeForWebsite);
router.get("/getAllJoiningEmployee", getAllJoiningEmployee);
router.post("/employeeApproval", employeeApproval);
router.post("/updateEmployeeSheet", updateEmployeeSheet);
router.get("/updateRoleData", updateRoleData);
router.post("/updateEmployeePhoto", updateEmployeePhoto);
router.post("/addEmployeeResignation", addEmployeeResignation);
router.get("/getEmployeeWorkingUnder", getEmployeeWorkingUnder);
router.get("/getAllEmployeeResignation", getAllEmployeeResignation);
router.get("/getEmployeeResignationForRM", getEmployeeResignationForRM);
router.post("/employeeResignationAction", employeeResignationAction);
router.get("/createRelivingPdf", createRelivingPdf);
router.get("/createExperienceLetterPdf", createExperienceLetterPdf);
router.post("/employeeApprovalandReject", employeeApprovalandReject);
router.get("/getApprovedEmployeeResignations", getApprovedEmployeeResignations);
router.get("/employeeTreeHierarchy",employeeTreeHierarchy)
// router.post("/update", upload.single("employeePhoto"), updateEmployee);
router.post(
  "/update",
  upload.fields([
    { name: "employeePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "offerLetter", maxCount: 1 },
    { name: "bankDetails", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "educationCertification", maxCount: 1 },
    { name: "experienceLetter", maxCount: 1 },
    { name: "employmentProof", maxCount: 1 },
  ]),
  updateEmployee
);
// router.post("/delete",deleteEmployee)
router.post("/activeOrInactive", employeActiveOrInactive);
router.get("/list/role", getAllEmployeByRole);
router.get("/byBranch", getEmployeByBranch);

//  Dashboard
router.get("/getHoDashboard", getHoDashboard);
router.get("/getHoDashboardGrid", getHoDashboardinGrid);
router.get("/allDetails", employeeAllDetails);

router.get("/attendance", employeeAttendance);

router.get("/attendanceCheck", employeeAttendanceActiveByTrueFalse);//mobile

router.get('/monthlyAttendance' , getEmployeeMonthlyAttendance)//mobile
router.get('/allMonthlyAttendance' , getAllEmployeesMonthlyAttendance)
router.get('/allMonthlyAttendanceTwo' , getAllEmployeesMonthlyAttendanceTwo)

router.get("/punch", employeePunch);//mobile
router.get("/punch/list", employeePunchList);
router.get("/punch/detail", punchDetail);
router.post("/punchOutSideBranch", employeePunchOutSideBranch);
router.post("/employeePunchApproval", employeePunchApproval);
router.get("/getemployeePunchApproval",getemployeePunchApproval);
router.get("/hrApproval" , getemployeePunchApprovalHR)

router.get('/branch-role' , getEmployeeListByBranchAndRole)
router.get('/employeeVerify' , employeeVerify)
router.get('/punchInVerify' , punchInVerify)
router.get('/getCrmCallingEmploye' , getCrmCallingEmploye)
router.post('/policyAdd' , policyAdd)
router.get("/getCollectionManagerList",getCollectionManagerList)


// monthly attendance 

router.get('/monthlyAttend' , MonthlyAttendance)

// delete duplicates by date
router.get('/deleteDuplicatesByDate' , deleteDuplicatesByDate)
// router.post('/scheduleUnpunchedAPI' , scheduleUnpunchedAPI)
router.get('/newMonthlyAttendance' , newMonthlyAttendance)
router.get('/getEmployeeHierarchy' , getEmployeeHierarchy)
router.post('/sendPunchOutReminder' , sendPunchOutReminder)

router.post('/sendNoPunchInEmail' , sendNoPunchInEmail)
router.post('/sendNoPunchOutEmail' , sendNoPunchOutEmail)


// Test //

router.post("/sendNoPunchOutEmailTest" , sendNoPunchOutEmailTest)
router.post("/sendNoPunchInEmailTest" , sendNoPunchInEmailTest)
// Appointment letter //sendNoPunchInEmail
router.get('/getEmployeeByJoiningDate' , getEmployeeByJoiningDate)
router.post('/sendAppointmentLetter' , sendAppointmentLetter)
router.post('/generateAppointmentLetterPdf' , generateAppointmentLetterPdf)

router.post("/addEnvConfig",addEnvConfig)



// add Regulation //

router.post("/addRegulation", addRegulation)
router.get("/getRegulation", getregulation)
router.get("/getRegulationByReportingManager", getRegulationByReportingManager)
router.post("/updateRegulationStatus", updateRegulationStatus)
router.get("/getRegulationByUser", getRegulationByUser)
router.post("/mailSwitches/add", createMailSwitches)
router.get("/mailSwitches/get", getMailSwitches)

module.exports = router;
