// controllers/postController.js
import mongoose from 'mongoose';
import {asyncHandler} from "../../Utils/LinkedIn/asyncHandler.js";
import {ApiError} from "../../Utils/LinkedIn/ApiError.js";
import { ApiResponse} from "../../Utils/LinkedIn/ApiResponse.js";
import ScheduledPost from '../../models/LinkedIn/ScheduledPost.js';
import PostedContent from '../../models/LinkedIn/PostedContent.js';
import OrganizationModel from "../../models/organizationModel/organization.model.js";

export const getAllPosts = asyncHandler(async (req, res) => {
  const organizationId = new mongoose.Types.ObjectId(req.employee.organizationId);

  // Common aggregation pipeline for enriching documents
  const buildAggregationPipeline = () =>
    [
      {
        $match: {
          organizationId
        }
      },
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization'
        }
      },
      {
        $lookup: {
          from: 'linkedinorganizations',
          localField: 'orgId',
          foreignField: '_id',
          as: 'linkedinOrganization'
        }
      },
      {
        $unwind: {
          path: '$organization',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$linkedinOrganization',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          message: 1,
          scheduleTime: 1,
          postedAt: 1,
          status: 1,
          orgId: 1,
          linkedinPostId: 1,
          jobId: 1,
          imageUrls: 1,
          mediaFiles: 1,
          position: 1,
          "organization.name": 1,
          "linkedinOrganization.name": 1
        }
      }
    ];

  // Run both aggregations in parallel
  const [scheduledPosts, postedContents] = await Promise.all([
    ScheduledPost.aggregate(buildAggregationPipeline()),
    PostedContent.aggregate(buildAggregationPipeline())
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      scheduledPosts,
      postedContents
    }, "✅ Posts fetched successfully")
  );
});