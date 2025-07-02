// routes/linkedin.routes.js
import express from 'express';
import {
  redirectToLinkedIn,
  handleCallback,
  // postContentWithFilesUGC,
  cancelScheduledPost,
  reschedulePost,
  getAllPostByorgId,
  getAllScheduledPosts,
  deleteLinkedInPost,
  getLinkedInAnalytics,
  postMultipleContentWithFilesUGC,
  saveDraftPost,
  getDraftPosts,
  generatePostText,
  getPostGenStatus,
  postSingleContentWithFilesUGC,
  editDraftPost,
  postSingleDraftToAllOrgs,
  generateLinkedotherInPost,
  deleteDraft
} from '../../controllers/LinkedIn/linkedin.controller.js';
import {verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"

const router = express.Router();

// Auth routes
router.get("/auth/linkedin", redirectToLinkedIn);
router.get("/auth/linkedin/callback", handleCallback);

// Post routes
router.post("/posts/publish",  postMultipleContentWithFilesUGC);
router.post("/post/publish",  postSingleContentWithFilesUGC);
router.post("/post/draft",  postSingleDraftToAllOrgs);


// Scheduled posts management
router.get("/scheduled-posts", verifyEmployeeToken,getAllScheduledPosts);

//all post by linkedinAccount
router.get("/post-linkedinAccount", getAllPostByorgId);

router.delete("/scheduled-posts/:scheduledPostId", cancelScheduledPost);
router.put("/reschedule/:scheduledPostId", reschedulePost);

// Delete posts
router.delete("/posts/:postId", deleteLinkedInPost);

// Analytics route
router.get("/analytics/:organizationId", getLinkedInAnalytics);

// Save a draft post
router.post("/save-posts",verifyEmployeeToken, saveDraftPost);

// Get all draft posts
router.get("/posts/drafts",verifyEmployeeToken, getDraftPosts);

// Edit the drafts
router.patch("/posts/draft/:draftId",editDraftPost);

// delete the draft
router.delete("/draft/delete/:draftId", deleteDraft);



//
router.get('/generate-post/:jobIds', verifyEmployeeToken,generatePostText);

router.get("/other/post",verifyEmployeeToken, generateLinkedotherInPost);


router.get('/status/:id',verifyEmployeeToken, getPostGenStatus);




export default router;
