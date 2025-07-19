const express = require("express");
const router = express.Router();

//  please check as it is breaking server

const {
  jobPostAdd,
  jobPostUpdate,
  getAllJobPost,
  getDepartmentByCompany,
  jobPostActiveOrInactive,
  getBranch,
  getWorkLocation,
  getJobPostData,
  getJobPostDetail,
  getJobPostWebsite,
  getJobPostBranchWebsite,
  getJobPostById,
  addJobDescription,
  getJobDescription,
  updateJobDescription,
  sendMailToManager,
} = require("../../controller/hrms/postJob.controller");

const {
  vacancyRequestAdd,
  vacancyRequestUpdate,
  getAllVacancyRequest,
  vacancyRequestDetail,
  getVacancyRequestByDepartment,
  getVacancyRequestById,
  changeVacancyApproval,
  getVacancyApprovalData,
  getRecommendApprovalData,
  getVacancyRequestForManager,
  getRecommendCandidate,
  recommendedCandidateApproval,
  getManagerRecommendCandidate,
  getIfReportingManager,
  getIfReportingManagerById,
  getRecommendCandidateForHr,
  vacancyApprovalAdd,
  getAllvacancyApproval
} = require("../../controller/hrms/vacancyRequest.controller");

router.post("/jobPostAdd", jobPostAdd);
router.post("/jobPostUpdate", jobPostUpdate);
router.get("/jobPostGet", getAllJobPost);
router.get("/jobPostDetail", getJobPostDetail);
router.get("/getJobPostWebsite", getJobPostWebsite);
router.get("/getDepartment", getDepartmentByCompany);
router.post("/jobPostActiveOrInactive", jobPostActiveOrInactive);
router.get("/getBranch", getBranch);
router.get("/getWorkLocation", getWorkLocation);
router.get("/getJobPostData", getJobPostData);
router.post("/getJobPostBranchWebsite", getJobPostBranchWebsite);
router.get("/getJobPostById", getJobPostById);
router.post("/sendMailToManager", sendMailToManager);

// vacancy request route
router.post("/vacancyRequestAdd", vacancyRequestAdd);
router.post("/vacancyRequestUpdate", vacancyRequestUpdate);
router.get("/getAllVacancy", getAllVacancyRequest);
router.get("/vacancyRequestDetail", vacancyRequestDetail);
router.get("/getVacancyByDepartment", getVacancyRequestByDepartment);
router.get("/getVacancyRequestById", getVacancyRequestById);
router.get("/getVacancyApprovalData", getVacancyApprovalData);
router.post("/changeVacancyApproval", changeVacancyApproval);
router.get("/getRecommendApprovalData", getRecommendApprovalData);
router.get("/getVacancyRequestForManager", getVacancyRequestForManager);
router.get("/getRecommendCandidate", getRecommendCandidate);
router.post("/recommendedCandidateApproval", recommendedCandidateApproval);
router.get("/getManagerRecommendCandidate", getManagerRecommendCandidate);
router.get("/getIfReportingManager", getIfReportingManager);
router.get("/getIfReportingManagerById", getIfReportingManagerById);
router.get("/getRecommendCandidateForHr", getRecommendCandidateForHr);
router.post("/vacancyApprovalAdd", vacancyApprovalAdd);
router.get("/getAllvacancyApproval", getAllvacancyApproval);

//job description

router.post("/addJobDescription", addJobDescription);
router.get("/getJobDescription", getJobDescription);
router.post("/updateJobDescription", updateJobDescription);

module.exports = router;
