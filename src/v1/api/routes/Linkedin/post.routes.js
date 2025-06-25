// routes/post.routes.js
import express from 'express';
import  {getAllPosts }  from '../../controllers/LinkedIn/postController.js';
import {verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"



const router = express.Router();

router.get('/AllPost',verifyEmployeeToken, getAllPosts); // GET /api/v1/posts/:orgId
// Get post type counts (Job / Other)
// router.get('/post-type-counts',verifyEmployeeToken, getPostTypeCounts);

export default router;