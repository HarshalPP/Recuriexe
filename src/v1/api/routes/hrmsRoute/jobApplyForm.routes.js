const express = require("express");
const router = express.Router();

const {
  getJobFormsByStatus,
  getRejectedJobForms,
  jobApplyFormAdd,
  getAllJobApplied,
  getJobFormForRecruitment,
  jobApplyFormStatusChange,
  jobApplyBulkStatusChange,
  jobApplySendToManager,
  getjobApplyManagerReview,
  getJobFormFilter,
  getJobFormSendManagerReview,
  sendMailToInterviewer,
  sendDirectMailInterviewer,
  addInterviewer,
  getInterviewer,
  resumeUpload,
  getInterviewById,
  addInterviewerAvailability,
  updateInterviewerAvailability,
  getInterviewerData,
  getAllInterviewerData,
  getInterviewerAvailability,
  changeAvailabilityStatus,
  interviewerFeedback,
  getInterviewerFeedback,
  getInterviewDataById,
  changeInterviewStatus,
  changeHrInterviewStatus,
  canceledInterview,
  getCanceledInterviewDataById,
  getAllCancelledInterview,
  sendApplicationViewedMail,
  getRecommendedJobApplied,
  sendMailToRecommendedBy,
  jobApplyFormUpdate,
  getJobFormById,
  getJobAppliedDates,
  deactivateJobApplications,
  reassingtoanothermanager,
  getJobFormFilterStatus,
  checkAvailabilityStatus,
  getJobFormFilterMangerReview,
  candidatetracking
  
} = require("../../controller/hrms/jobApplyForm.controller");

// For New candidate //

const { RegisterProfile,
    loginCandidate,
    updatePassword,
    verifyCandidateToken,
    getCandidateProfile
  
  
  } = require("../../controller/hrms/applicante.controller")

const { upload } = require("../../../../../Middelware/multer");

router.get("/getJobFormsByStatus", getJobFormsByStatus);
router.get("/getRejectedJobForms", getRejectedJobForms);
router.post("/addJobForm", jobApplyFormAdd);
router.get("/getJobForms", getAllJobApplied);
router.get("/getRecruitmentPipeline", getJobFormForRecruitment);
router.post("/updateFormStatus", jobApplyFormStatusChange);
router.post("/updateBulkFormStatus", jobApplyBulkStatusChange);
router.post("/sendToManager", jobApplySendToManager);
router.get("/managerReview", getjobApplyManagerReview);
router.get("/getFilteredForm", getJobFormFilter);
router.get("/getManagerReview", getJobFormSendManagerReview);
router.post("/sendMail", sendMailToInterviewer);
router.post("/sendMailRecommended", sendMailToRecommendedBy);
router.post("/sendDirectMail", sendDirectMailInterviewer);
router.post("/addInterviewer", addInterviewer);
router.get("/getInterviewer", getInterviewer);
router.post("/resumeUpload", upload.single("pdf"), resumeUpload);
router.post("/addInterviewerAvailability", addInterviewerAvailability);
router.post("/updateInterviewerAvailability", updateInterviewerAvailability);
router.get("/getInterviewerAvailability", getInterviewerAvailability);
router.get("/getInterviewById", getInterviewById);
router.get("/getInterviewDataById", getInterviewDataById);
router.get("/getInterviewerData", getInterviewerData);
router.get("/getAllInterviewerData", getAllInterviewerData);
router.get("/getCanceledInterview", getCanceledInterviewDataById);
router.get("/getAllCancelledInterview", getAllCancelledInterview);
router.get("/getInterviewerFeedback", getInterviewerFeedback);
router.post("/changeAvailabilityStatus", changeAvailabilityStatus);
router.post("/interviewerFeedback", interviewerFeedback);
router.post("/changeInterviewStatus",changeInterviewStatus);
router.post("/changeHrInterviewStatus",changeHrInterviewStatus);
router.post("/canceledInterview",canceledInterview);   
router.post("/sendApplicationViewedMail",sendApplicationViewedMail);  
router.get("/getRecommendedJobApplied", getRecommendedJobApplied);
router.post("/jobApplyFormUpdate", jobApplyFormUpdate);
router.get("/getJobFormById", getJobFormById);
router.get("/getJobAppliedDates", getJobAppliedDates);
router.post("/deactivateJobApplications", deactivateJobApplications);
router.post("/reassingtoanothermanager", reassingtoanothermanager);
router.get("/getJobFormFilterStatus", getJobFormFilterStatus);
router.post("/checkAvailabilityStatus", checkAvailabilityStatus);
router.get("/getJobFormFilterMangerReview" , getJobFormFilterMangerReview)

// candidate Tracking //
router.get("/candidatetracking" , candidatetracking)



// New candidate Routes //


router.post("/RegisterProfile" , RegisterProfile),
router.post("/loginCandidate" , loginCandidate),
router.post("/updatePassword" , updatePassword),
router.post("/verifyCandidateToken" , verifyCandidateToken)
router.post("/getCandidateProfile" , getCandidateProfile)

 
module.exports = router;
