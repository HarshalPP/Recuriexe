const express = require("express");
const router = express.Router();

const {
  addCandidateDocument,
  sendPreOfferCandidate,
  sendPostOfferCandidate,
  getCandidateDetails,
  updateCandidateDocument,
  sendupadteFormMailCandidate,
  createOfferLetterPDF,
  sendOfferLetterCandidate,
  sendZohoCredentialsCandidate,
  sendJoiningMailCandidate,
  addAsset,
  addEmployeeToAsset,
  getEmployeeAsset,
  getCandidateById,
  getOfferLetterPayRoll,
  addReviewOfferLetterPayRoll,
  hrInterviewSchedule,
  rescheduleHrInterview,
  addHRFeedback,
  getRecommendedHrRejected,
  addDirectJoining,
  getDirectJoining,
  getJoiningById,
  calculateCTCFromLpa,
  resendOfferLetterCandidate,
  createOfferlettertwo,
  createOfferletter3,
  createOfferletterthree
} = require("../../controller/hrms/candidate.controller");

router.post("/addCandidateDocument", addCandidateDocument);
router.post("/sendPreOfferCandidate", sendPreOfferCandidate);
router.post("/sendPostOfferCandidate", sendPostOfferCandidate);
router.get("/getCandidateDetails", getCandidateDetails);
router.post("/updateCandidateDocument", updateCandidateDocument);
router.post("/sendupadteFormMailCandidate", sendupadteFormMailCandidate);
router.post("/createOfferLetterPDF", createOfferLetterPDF);
router.post("/generateOfferLetterPDF", createOfferlettertwo);
router.post("/generateofferletter3" , createOfferletterthree)
router.post("/sendOfferLetterCandidate", sendOfferLetterCandidate);
router.post("/sendZohoCredentialsCandidate", sendZohoCredentialsCandidate);
router.post("/sendJoiningMailCandidate", sendJoiningMailCandidate);
router.post("/addAsset", addAsset);
router.post("/addEmployeeToAsset", addEmployeeToAsset);
router.get("/getEmployeeAsset", getEmployeeAsset);
router.get("/getCandidateById/:candidateId", getCandidateById);
router.get("/getOfferLetterPayRoll", getOfferLetterPayRoll);
router.post("/addReviewOfferLetter", addReviewOfferLetterPayRoll);
router.post("/hrInterviewSchedule", hrInterviewSchedule);
router.post("/rescheduleHrInterview", rescheduleHrInterview);
router.post("/addHRFeedback", addHRFeedback);
router.get("/getRecommendedHrRejected", getRecommendedHrRejected);
router.post("/addDirectJoining", addDirectJoining);
router.get("/getDirectJoining", getDirectJoining);
router.get("/getJoiningById/:joiningId", getJoiningById);
router.post("/calculateCTC",calculateCTCFromLpa);
router.post("/resendOfferLetterCandidate", resendOfferLetterCandidate);
router.post("/newgenerateOfferLetterPDF", createOfferletter3);


module.exports = router;
