// controllers/postController.js
import {asyncHandler} from "../../Utils/LinkedIn/asyncHandler.js";
import {ApiError} from "../../Utils/LinkedIn/ApiError.js";
import { ApiResponse} from "../../Utils/LinkedIn/ApiResponse.js";
import ScheduledPost from '../../models/LinkedIn/ScheduledPost.js';
import PostedContent from '../../models/LinkedIn/PostedContent.js';


export const getAllPosts = asyncHandler(async (req, res) => {
  const { OrganisationId } = req.params;

  // Fetch scheduled posts
  const scheduledPosts = await ScheduledPost.find({ OrganisationId }).sort({ scheduleTime: -1 });

  // Fetch posted content (immediate + scheduled)
  const postedContents = await PostedContent.find({ OrganisationId }).sort({ postedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, {
      scheduledPosts,
      postedContents
    }, "✅ Posts fetched successfully")
  );
});