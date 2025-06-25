import express from 'express';
import {
  saveDraft,
  getDraftPosts,
  editDraftPost,
  postMultipleContentWithFilesUGC,
  deleteDraft,
  getScheduledPostsByOrganization
} from '../../controllers/LinkedIn/social.media.controller.js';
import {verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"


const router = express.Router();

// 📝 Draft Posts
router.post('/save-draft', verifyEmployeeToken , saveDraft); // Save a draft post
router.get('/drafts',verifyEmployeeToken, getDraftPosts); // Get all drafts
router.put('/edit-draft/:draftId', editDraftPost); // Edit a specific draft
// delete the draft
router.delete("/draft/delete/:draftId", deleteDraft);

// 🚀 Post to LinkedIn (UGC)
router.post('/post-multiple-content', postMultipleContentWithFilesUGC);

// 🕒 Scheduled Posts
router.get('/scheduled-posts/:organizationId', getScheduledPostsByOrganization);

export default router;