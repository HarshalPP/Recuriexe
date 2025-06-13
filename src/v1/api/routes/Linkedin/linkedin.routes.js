// routes/linkedin.routes.js
import express from 'express';
import {
  redirectToLinkedIn,
  handleCallback,
  postContent,
  // postContentWithFilesUGC,
  cancelScheduledPost,
  reschedulePost,
  getAllPostByorgId,
  deleteLinkedInPost,
  getLinkedInAnalytics,
  postMultipleContentWithFilesUGC,
  saveDraftPost,
  getDraftPosts,
  generatePostText,
} from '../../controllers/LinkedIn/linkedin.controller.js';

const router = express.Router();

// Auth routes
router.get("/auth/linkedin", redirectToLinkedIn);
router.get("/auth/linkedin/callback", handleCallback);

// Post routes
router.post("/post", postContent);

router.post("/posts/publish",  postMultipleContentWithFilesUGC);
// Scheduled posts management
router.get("/scheduled-posts", getAllPostByorgId);
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

//
router.get('/generate-post/:jobId', generatePostText);


export default router;
