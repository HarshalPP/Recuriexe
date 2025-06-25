// controllers/postController.js
import mongoose from 'mongoose';
import {asyncHandler} from "../../Utils/LinkedIn/asyncHandler.js";
import {ApiError} from "../../Utils/LinkedIn/ApiError.js";
import { ApiResponse} from "../../Utils/LinkedIn/ApiResponse.js";
import ScheduledPost from '../../models/LinkedIn/ScheduledPost.js';
import PostedContent from '../../models/LinkedIn/PostedContent.js';
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import { success, unknownError, serverValidation, badRequest } from "../../formatters/globalResponse.js"


// export const getAllPosts = asyncHandler(async (req, res) => {
// // Build base pipeline with customizable $match

// const buildAggregationPipeline = (customMatch) => [
//   {
//     $match: customMatch
//   },
//   {
//     $lookup: {
//       from: 'organizations',
//       localField: 'organizationId',
//       foreignField: '_id',
//       as: 'organization'
//     }
//   },
//   {
//     $lookup: {
//       from: 'linkedinorganizations',
//       localField: 'orgIds.orgId',
//       foreignField: '_id',
//       as: 'linkedinOrganizations'
//     }
//   },
//   {
//     $unwind: { path: '$organization', preserveNullAndEmptyArrays: true }
//   },
//   {
//     $unwind: { path: '$linkedinOrganizations', preserveNullAndEmptyArrays: true }
//   },
//   {
//     $project: {
//       message: 1,
//       scheduleTime: 1,
//       postedAt: 1,
//       status: 1,
//       orgIds: 1,
//       linkedinPostId: 1,
//       jobId: 1,
//       imageUrls: 1,
//       mediaFiles: 1,
//       position: 1,
//       "organization.name": 1,
//       "linkedinOrganizations.name": 1
//     }
//   }
// ];

// // Your organizationId from request or context
// const organizationId = new mongoose.Types.ObjectId(req.employee.organizationId);

// // Define match conditions
// const scheduledPostMatch = {
//   organizationId: new mongoose.Types.ObjectId(organizationId),
//   status: { $in: ["posted", "scheduled", "cancelled"] }
// };

// const postedContentMatch = {
//   organizationId: new mongoose.Types.ObjectId(organizationId),
//   status: { $in: ['posted', 'draft'] }
// };

// // Run both aggregations in parallel
// const [scheduledPosts, postedContents] = await Promise.all([
//   ScheduledPost.aggregate(buildAggregationPipeline(scheduledPostMatch)),
//   PostedContent.aggregate(buildAggregationPipeline(postedContentMatch))
// ]);

  
//   return success(res ," Posts fetched successfully" , { scheduledPosts , postedContents } )

//   // return res.status(200).json(
//   //   new ApiResponse(200, {
//   //     scheduledPosts,
//   //     postedContents
//   //   }, " Posts fetched successfully")
//   // );
// });

// export const getAllPosts = asyncHandler(async (req, res) => {
//   const { postStatus } = req.query || {};
//   const validStatuses = ['all', 'posted', 'scheduled', 'cancelled', 'draft'];
//   const selectedStatus = (postStatus || 'all').toLowerCase();

//   if (!validStatuses.includes(selectedStatus)) {
//     return badRequest(res, `Invalid postStatus. Must be one of: ${validStatuses.join(', ')}`);
//   }

//   const buildAggregationPipeline = (customMatch) => [
//     {
//       $match: customMatch
//     },
//     {
//       $lookup: {
//         from: 'organizations',
//         localField: 'organizationId',
//         foreignField: '_id',
//         as: 'organization'
//       }
//     },
//     {
//       $lookup: {
//         from: 'linkedinorganizations',
//         localField: 'orgIds.orgId',
//         foreignField: '_id',
//         as: 'linkedinOrganizations'
//       }
//     },
//     {
//       $unwind: { path: '$organization', preserveNullAndEmptyArrays: true }
//     },
//     {
//       $unwind: { path: '$linkedinOrganizations', preserveNullAndEmptyArrays: true }
//     },
//     {
//       $project: {
//         message: 1,
//         scheduleTime: 1,
//         postedAt: 1,
//         status: 1,
//         orgIds: 1,
//         linkedinPostId: 1,
//         jobId: 1,
//         imageUrls: 1,
//         mediaFiles: 1,
//         position: 1,
//         "organization.name": 1,
//         "linkedinOrganizations.linkedinName": 1
//       }
//     }
//   ];

//   const organizationId = new mongoose.Types.ObjectId(req.employee.organizationId);

//   let scheduledPostMatch = { organizationId };
//   let postedContentMatch = { organizationId };

//   if (selectedStatus === 'all') {
//     scheduledPostMatch.status = { $in: ["posted", "scheduled", "cancelled"] };
//     postedContentMatch.status = { $in: ["posted", "draft"] };
//   } else if (selectedStatus === 'posted') {
//     scheduledPostMatch.status = 'posted';
//     postedContentMatch.status = 'posted';
//   } else if (selectedStatus === 'scheduled' || selectedStatus === 'cancelled') {
//     scheduledPostMatch.status = selectedStatus;
//     postedContentMatch.status = { $in: [] }; // empty array = no match
//   } else if (selectedStatus === 'draft') {
//     scheduledPostMatch.status = { $in: [] };
//     postedContentMatch.status = 'draft';
//   }

//   try {
//     const [scheduledPosts, postedContents] = await Promise.all([
//       ScheduledPost.aggregate(buildAggregationPipeline(scheduledPostMatch)),
//       PostedContent.aggregate(buildAggregationPipeline(postedContentMatch))
//     ]);

//     return success(res, "Posts fetched successfully", {
//       scheduledPosts,
//       postedContents
//     });
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     return internalServerError(res, "Failed to fetch posts");
//   }
// });   

// // Posttype
// export const getPostTypeCounts = async (req, res) => {
//   try {
//     const aggregateCounts = (Model) =>
//       Model.aggregate([
//         {
//           $project: {
//             typeCategory: {
//               $cond: [{ $eq: ['$postType', 'job'] }, 'job', 'other'],
//             },
//           },
//         },
//         {
//           $group: {
//             _id: '$typeCategory',
//             count: { $sum: 1 },
//           },
//         },
//       ]);

//     const [postedResults, scheduledResults] = await Promise.all([
//       aggregateCounts(PostedContent),
//       aggregateCounts(ScheduledPost),
//     ]);

//     const asObject = (results) =>
//       results.reduce(
//         (acc, { _id, count }) => {
//           acc[_id] = count;
//           return acc;
//         },
//         { job: 0, other: 0 }
//       );

//     const posted = asObject(postedResults);
//     const scheduled = asObject(scheduledResults);

//     const totals = {
//       job: posted.job + scheduled.job,
//       other: posted.other + scheduled.other,
//     };

//     return success(res, 'Post type counts retrieved successfully', {
//       posted,
//       scheduled,
//       totals,
//     });
//   } catch (error) {
//     console.error('Error fetching post type counts:', error);
//     return unknownError(res, 'Failed to retrieve post type counts');
//   }
// };


export const getAllPosts = asyncHandler(async (req, res) => {
  const { postStatus } = req.query || {};
  const validStatuses = ['all', 'posted', 'scheduled', 'cancelled', 'draft'];
  const selectedStatus = (postStatus || 'all').toLowerCase();

  if (!validStatuses.includes(selectedStatus)) {
    return badRequest(res, `Invalid postStatus. Must be one of: ${validStatuses.join(', ')}`);
  }

  const buildAggregationPipeline = (customMatch) => [
    { $match: customMatch },
    {
      $lookup: {
        from: 'organizations',
        localField: 'organizationId',
        foreignField: '_id',
        as: 'organization',
      },
    },
    {
      $lookup: {
        from: 'linkedinorganizations',
        localField: 'orgIds.orgId',
        foreignField: '_id',
        as: 'linkedinOrganizations',
      },
    },
    { $unwind: { path: '$organization', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$linkedinOrganizations', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        message: 1,
        scheduleTime: 1,
        postedAt: 1,
        status: 1,
        orgIds: 1,
        linkedinPostId: 1,
        jobId: 1,
        imageUrls: 1,
        mediaFiles: 1,
        position: 1,
        'organization.name': 1,
        'linkedinOrganizations.linkedinName': 1,
      },
    },
  ];

  const organizationId = new mongoose.Types.ObjectId(req.employee.organizationId);

  let scheduledPostMatch = { organizationId };
  let postedContentMatch = { organizationId };

  switch (selectedStatus) {
    case 'all':
      scheduledPostMatch.status = { $in: ['posted', 'scheduled', 'cancelled'] };
      postedContentMatch.status = { $in: ['posted', 'draft'] };
      break;
    case 'posted':
      scheduledPostMatch.status = 'posted';
      postedContentMatch.status = 'posted';
      break;
    case 'scheduled':
    case 'cancelled':
      scheduledPostMatch.status = selectedStatus;
      postedContentMatch.status = { $in: [] };
      break;
    case 'draft':
      scheduledPostMatch.status = { $in: [] };
      postedContentMatch.status = 'draft';
      break;
  }

  // Helper to calculate "job" vs "other" postType counts
  const aggregateCounts = (Model, statusMatch) =>
    Model.aggregate([
      {
        $match: {
          organizationId,
          ...statusMatch,
          postType: { $nin: [null, ''] }, // Exclude null and blank postTypes
        },
      },
      {
        $project: {
          typeCategory: {
            $switch: {
              branches: [
                { case: { $eq: ['$postType', 'job'] }, then: 'job' },
                { case: { $eq: ['$postType', 'other'] }, then: 'other' },
              ],
              default: null,
            },
          },
        },
      },
      {
        $match: {
          typeCategory: { $ne: null }, // Only include job/other
        },
      },
      {
        $group: {
          _id: '$typeCategory',
          count: { $sum: 1 },
        },
      },
    ]);

  try {
    const [
      scheduledPosts,
      postedContents,
      scheduledResults,
      postedResults,
    ] = await Promise.all([
      ScheduledPost.aggregate(buildAggregationPipeline(scheduledPostMatch)),
      PostedContent.aggregate(buildAggregationPipeline(postedContentMatch)),
      aggregateCounts(ScheduledPost, scheduledPostMatch),
      aggregateCounts(PostedContent, postedContentMatch),
    ]);

    const toObj = (arr) =>
      arr.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, { job: 0, other: 0 });

    const posted = toObj(postedResults);
    const scheduled = toObj(scheduledResults);
    const totals = {
      job: posted.job + scheduled.job,
      other: posted.other + scheduled.other,
    };

    return success(res, 'Posts fetched successfully', {
      scheduledPosts,
      postedContents,
      counts: { posted, scheduled, totals },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return unknownError(res, 'Failed to fetch posts');
  }
});
