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
  postSingleDraftToAllOrgs
} from '../../controllers/LinkedIn/linkedin.controller.js';

const router = express.Router();

// Auth routes
router.get("/auth/linkedin", redirectToLinkedIn);
router.get("/auth/linkedin/callback", handleCallback);

// Post routes
router.post("/posts/publish",  postMultipleContentWithFilesUGC);
router.post("/post/publish",  postSingleContentWithFilesUGC);
router.post("/post/draft",  postSingleDraftToAllOrgs);


// Scheduled posts management
router.get("/scheduled-posts", getAllScheduledPosts);

//all post by linkedinAccount
router.get("/post-linkedinAccount", getAllPostByorgId);

router.delete("/scheduled-posts/:scheduledPostId", cancelScheduledPost);
router.put("/scheduled-posts/:scheduledPostId/reschedule", reschedulePost);

// Delete posts
router.delete("/posts/:postId", deleteLinkedInPost);

// Analytics route
router.get("/analytics/:organizationId", getLinkedInAnalytics);

// Save a draft post
router.post("/save-posts", saveDraftPost);

// Get all draft posts
router.get("/posts/drafts", getDraftPosts);

// Edit the drafts
router.patch("/posts/draft/:draftId",editDraftPost);


//
router.get('/generate-post/:jobIds', generatePostText);


router.get('/status/:id', getPostGenStatus);




export default router;
