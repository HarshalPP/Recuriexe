// linkedin.controller.js - Update imports at the top
import LinkedInOrganization from '../../models/LinkedIn/Organization.js';
import ScheduledPost from '../../models/LinkedIn/ScheduledPost.js';
import * as linkedinService from '../../services/Linkedinservice/linkedin.service.js';
import { ApiError } from '../../Utils/LinkedIn/ApiError.js';
import { ApiResponse } from '../../Utils/LinkedIn/ApiResponse.js';
import { asyncHandler } from '../../Utils/LinkedIn/asyncHandler.js';
import schedule from 'node-schedule';
import { format } from 'date-fns-tz';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
// Import scheduledJobs from scheduler utility
import { scheduledJobs } from '../../Utils/LinkedIn/scheduler.js';;
import { PostgetAnalytics } from '../../services/Linkedinservice/linkedin.service.js';
import PostedContent from '../../models/LinkedIn/PostedContent.js';
import  {generateLinkedInPost}  from '../../services/Linkedinservice/linkedin.service.js';
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"

// Redirect to LinkedIn auth
export const redirectToLinkedIn = asyncHandler(async (req, res) => {
  const { orgId } = req.query;

  const org = await LinkedInOrganization.findById(orgId);
  if (!org) throw new ApiError(404, "Organization not found");

  const state = orgId;
  const scope = 'openid profile email w_member_social';

  const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${org.linkedinClientId}&redirect_uri=${encodeURIComponent(org.linkedinRedirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  res.redirect(authURL);
});

// Handle LinkedIn OAuth callback
export const handleCallback = asyncHandler(async (req, res) => {
  const { code, state: orgId } = req.query;
  // console.log(code);
  
  const org = await LinkedInOrganization.findById(orgId);
  // console.log(org);
  
  if (!org) throw new ApiError(400, "Invalid organization or state parameter");

  const { accessToken, memberId } = await linkedinService.exchangeCodeForToken(org, code);

  org.accessToken = accessToken;
  org.memberId = memberId;
  await org.save();

  // res.status(200).json(new ApiResponse(200, null, "✅ LinkedIn connected successfully"));
  res.redirect(`https://recruitexe.com/employeeSetup/Linkedin`);
});

// Post content to LinkedIn with multiple images support

export const postContent = asyncHandler(async (req, res) => {
  const { orgId, message, imageUrls, postAsOrganization, useUGCApi, scheduleTime } = req.body;

  if (!orgId || !message) {
    throw new ApiError(400, "orgId and message are required");
  }

  const org = await LinkedInOrganization.findById(orgId);
  if (!org?.accessToken) {
    throw new ApiError(403, "LinkedIn not connected for this organization");
  }


  const postJob = async () => {
    let result;

    try {
      // if (useUGCApi) {
      //   result = await linkedinService.postToLinkedInUGC(org, message, imageUrls);
      // } 
       if (postAsOrganization && org.organizationId) {
        result = await linkedinService.postToLinkedInAsOrganization(org, message, imageUrls);
      } 
      else {
        try {
            console.log("org;--//" ,org);

          result = await linkedinService.postToLinkedInUGC(org, message, imageUrls);
        } catch (error) {``
          console.log('New API failed, trying UGC API...');
          result = await linkedinService.postToLinkedInUGC(org, message, imageUrls);
        }
      }

      console.log('✅ Content posted to LinkedIn:', result);
    } catch (error) {
      console.error('❌ Failed to post content to LinkedIn:', error.message);
    }
  };

  // If a scheduleTime is provided, schedule the job
  if (scheduleTime) {
    const scheduleDate = new Date(scheduleTime);

    if (isNaN(scheduleDate.getTime())) {
      throw new ApiError(400, "Invalid scheduleTime format. Please provide a valid date string.");
    }

    schedule.scheduleJob(scheduleDate, postJob);

    console.log(`✅ Post scheduled for ${scheduleDate}`);
    res.status(200).json(new ApiResponse(200, null, `✅ Post scheduled for ${scheduleDate}`));
  } else {
    await postJob();
    res.status(200).json(new ApiResponse(200, null, "✅ Content posted to LinkedIn"));
  }
});

// export const postContentWithFilesUGC = asyncHandler(async (req, res) => {
//   const { orgId, message, imageUrls, scheduleTime } = req.body;
//   const imageFiles = req.files || [];

//   if (!orgId || !message) {
//     throw new ApiError(400, "orgId and message are required");
//   }

//   const org = await Organization.findById(orgId);
//   if (!org?.accessToken) {
//     throw new ApiError(403, "LinkedIn not connected for this organization");
//   }

//   console.log("org;--///" ,org);
//   // Save uploaded files info for scheduled posts
//   const savedFileInfo = [];
//   if (imageFiles.length > 0 && scheduleTime) {
//     for (const file of imageFiles) {
//       const filename = `${uuidv4()}-${file.originalname}`;
//       const filepath = path.join('uploads', 'scheduled', filename);
      
//       // Ensure directory exists
//       await fs.mkdir(path.dirname(filepath), { recursive: true });
      
//       // Save file
//       await fs.writeFile(filepath, file.buffer);
      
//       savedFileInfo.push({
//         filename: filename,
//         path: filepath,
//         mimetype: file.mimetype,
//         size: file.size
//       });
//     }
//   }

//   const postJob = async (scheduledPostId = null) => {
//     try {
//       // Load files if this is a scheduled post
//       let filesToPost = imageFiles;
//       if (scheduledPostId) {
//         const scheduledPost = await ScheduledPost.findById(scheduledPostId);
//         if (scheduledPost.imageFiles && scheduledPost.imageFiles.length > 0) {
//           filesToPost = [];
//           for (const fileInfo of scheduledPost.imageFiles) {
//             const buffer = await fs.readFile(fileInfo.path);
//             filesToPost.push({
//               buffer,
//               mimetype: fileInfo.mimetype,
//               originalname: fileInfo.filename
//             });
//           }
//         }
//       }

//       const result = await linkedinService.postToLinkedInWithFilesUGC(
//         org, 
//         message, 
//         imageUrls, 
//         filesToPost
//       );
      
//       console.log("✅ Content posted to LinkedIn", result);
      
//       // Save to PostedContent collection for immediate posts
//       if (!scheduledPostId) {
//         await PostedContent.create({
//           orgId: org._id,
//           message,
//           imageUrls,
//           mediaFiles: filesToPost.map(file => ({
//             filename: file.originalname,
//             mimetype: file.mimetype
//           })),
//           linkedinPostId: result.id,
//           postedAt: new Date()
//         });
//       }
      
//       // Update scheduled post status if applicable
//       if (scheduledPostId) {
//         await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
//           status: 'posted',
//           linkedinPostId: result.id,
//           postedAt: new Date()
//         });
        
//         // Clean up saved files
//         const scheduledPost = await ScheduledPost.findById(scheduledPostId);
//         if (scheduledPost.imageFiles) {
//           for (const fileInfo of scheduledPost.imageFiles) {
//             try {
//               await fs.unlink(fileInfo.path);
//             } catch (err) {
//               console.error('Error deleting file:', err);
//             }
//           }
//         }
//       }
      
//       return result;
//     } catch (error) {
//       console.error("❌ Error in scheduled post:", error);
      
//       // Update scheduled post status if applicable
//       if (scheduledPostId) {
//         await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
//           status: 'failed',
//           error: error.message
//         });
//       }
      
//       throw error;
//     }
//   };

//   if (scheduleTime) {
//     const scheduleDate = new Date(scheduleTime);

//     if (isNaN(scheduleDate.getTime())) {
//       throw new ApiError(400, "Invalid scheduleTime format. Please provide a valid date string.");
//     }

//     if (scheduleDate <= new Date()) {
//       throw new ApiError(400, "Schedule time must be in the future");
//     }

//     // Create scheduled post record
//     const jobName = `linkedin-post-${uuidv4()}`;
//     const scheduledPost = await ScheduledPost.create({
//       orgId,
//       message,
//       imageUrls,
//       imageFiles: savedFileInfo,
//       scheduleTime: scheduleDate,
//       jobName
//     });

//     // Schedule the job
//     const job = schedule.scheduleJob(jobName, scheduleDate, async () => {
//       await postJob(scheduledPost._id);
//       scheduledJobs.delete(jobName);
//     });

//     // Store job reference
//     scheduledJobs.set(jobName, job);

//     const displayTime = format(scheduleDate, "yyyy-MM-dd'T'HH:mm:ss'Z'", { 
//       timeZone: 'UTC' 
//     });
    
//     console.log(`✅ Post scheduled for ${displayTime}`);
    
//     return res.status(200).json(
//       new ApiResponse(200, { 
//         scheduledPostId: scheduledPost._id,
//         jobName: scheduledPost.jobName,
//         scheduledTime: displayTime,
//         scheduledTimeISO: scheduleDate.toISOString()
//       }, `✅ Post scheduled for ${displayTime}`)
//     );
//   } else {
//     const result = await postJob();
//     return res.status(200).json(
//       new ApiResponse(200, result, "✅ Content posted to LinkedIn")
//     );
//   }
// });

// Cancel scheduled post



// cancel Schedule Post


export const postMultipleContentWithFilesUGC = asyncHandler(async (req, res) => {
  const { postIds, orgId, scheduleTimes } = req.body;
  const imageFiles = req.files || [];
    // Input validation
  if (!Array.isArray(postIds) || postIds.length === 0) {
    throw new ApiError(400, "At least one post ID must be provided");
  }

  if (!orgId) {
    
    throw new ApiError(400, "orgId is required");
  }
  
const OrganisationId = await LinkedInOrganization.findById(orgId)
  .populate({
    path: 'organizationId',
    select: '_id'
  })
  .exec();

if (!OrganisationId) throw new ApiError(404, "Organization not found");

const orgIdFromRef = OrganisationId.organizationId?._id;

console.log(" organisationId123:-", orgIdFromRef);
  

  // Optional: validate scheduleTimes
  let validScheduleTimes = [];
  if (scheduleTimes && Array.isArray(scheduleTimes)) {
    validScheduleTimes = scheduleTimes.map(t => new Date(t)).filter(date => !isNaN(date.getTime()));
  }

  // Fetch drafts
  const drafts = await PostedContent.find({
    _id: { $in: postIds },
    status: 'draft'
  });

  if (!drafts.length) {
    throw new ApiError(404, "No drafts found for the given ID");
  }

  const results = [];

  for (const draft of drafts) {
    const { _id: postId, message, imageUrls, jobId, mediaFiles } = draft;

    // Check if org exists and has access token
    const org = await LinkedInOrganization.findById(orgId);
    if (!org?.accessToken) {
      results.push({
        status: 'failed',
        error: "LinkedIn not connected for this organization"
      });
      continue;
    }

    // Match any uploaded files for this draft
    const draftImageFiles = imageFiles.filter(file =>
      file.fieldname === `draft-${postId.toString()}` // Frontend should name fields as draft-<postId>
    );

    // Combine existing mediaFiles from draft + newly uploaded ones
    let combinedMediaFiles = [...(mediaFiles || []), ...draftImageFiles];

    // Save uploaded files locally if needed (e.g., for scheduling)
    let savedFileInfo = combinedMediaFiles.map(file => ({
      filename: file.filename || `${uuidv4()}-${file.originalname}`,
      path: file.path || path.join('uploads', 'scheduled', `${uuidv4()}-${file.originalname}`),
      mimetype: file.mimetype,
      size: file.size
    }));

    // If there are uploads and we're scheduling, save them to disk
    if (draftImageFiles.length > 0 && validScheduleTimes.length > 0) {
      for (const file of draftImageFiles) {
        const fileInfo = savedFileInfo.find(f => f.originalname === file.originalname);
        await fs.mkdir(path.dirname(fileInfo.path), { recursive: true });
        await fs.writeFile(fileInfo.path, file.buffer);
      }
    }

    // Function to actually post content
    const postJob = async (scheduledPostId = null) => {
      try {
        let filesToPost = [];

        if (scheduledPostId) {
          const scheduledPost = await ScheduledPost.findById(scheduledPostId);
          if (scheduledPost.imageFiles?.length > 0) {
            for (const fileInfo of scheduledPost.imageFiles) {
              const buffer = await fs.readFile(fileInfo.path);
              filesToPost.push({
                buffer,
                mimetype: fileInfo.mimetype,
                originalname: fileInfo.filename
              });
            }
          }
        } else {
          filesToPost = [...draftImageFiles];
        }

        const result = await linkedinService.postToLinkedInWithFilesUGC(
          org,
          message,
          imageUrls || [],
          filesToPost
        );

        console.log("✅ Content posted to LinkedIn", result);

        // Mark draft as posted
        await PostedContent.findByIdAndUpdate(postId, {
          $set: {
            status: 'posted',
            linkedinPostId: result.id,
            organizationId : orgIdFromRef,
            postedAt: new Date()
          }
        });

        if (scheduledPostId) {
          await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
          $set: {
            status: 'posted',
            linkedinPostId: result.id,
            organizationId : orgIdFromRef,
            postedAt: new Date()
          }
          });

          const scheduledPost = await ScheduledPost.findById(scheduledPostId);
          if (scheduledPost.imageFiles?.length > 0) {
            for (const fileInfo of scheduledPost.imageFiles) {
              try {
                await fs.unlink(fileInfo.path);
              } catch (err) {
                console.error('Error deleting file:', err);
              }
            }
          }
        }

        return {
          status: 'success',
          postId,
          result
        };
      } catch (error) {
        console.error("❌ Error in post:", error);

        await PostedContent.findByIdAndUpdate(postId, {
          $set:{
            status: 'failed',
            organizationId : orgIdFromRef,
            error: error.message
          }
        });

        if (scheduledPostId) {
          await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
          $set:{
            status: 'failed',
            organizationId : orgIdFromRef,
            error: error.message
          }
          });
        }

        return {
          status: 'failed',
          error: error.message
        };
      }
    };

    // If no schedule times, post immediately once
    if (validScheduleTimes.length === 0) {
      const result = await postJob();
      results.push(result);
    } else {
      // Schedule multiple posts for the same draft
      for (const scheduleDate of validScheduleTimes) {
        const jobName = `linkedin-post-${uuidv4()}`;
        const scheduledPost = await ScheduledPost.create({
          orgId,
          jobId,
          message,
          imageUrls,
          imageFiles: savedFileInfo,
          scheduleTime: scheduleDate,
          organizationId : orgIdFromRef,
          jobName
        });

        const job = schedule.scheduleJob(jobName, scheduleDate, async () => {
          await postJob(scheduledPost._id);
          scheduledJobs.delete(jobName);
        });

        scheduledJobs.set(jobName, job);

        results.push({
          status: 'scheduled',
          organizationId : orgIdFromRef,
          scheduledPostId: scheduledPost._id,
          jobName,
          scheduledTime: scheduleDate.toISOString()
        });
      }
    }
  }

  return res.status(200).json(new ApiResponse(200, results, "✅ Posts processed successfully"));
});

//cancel schedule Post
export const cancelScheduledPost = asyncHandler(async (req, res) => {
  const { scheduledPostId } = req.params;

  const scheduledPost = await ScheduledPost.findById(scheduledPostId);
  if (!scheduledPost) {
    throw new ApiError(404, "Scheduled post not found");
  }

  if (scheduledPost.status !== 'scheduled') {
    throw new ApiError(400, `Cannot cancel post with status: ${scheduledPost.status}`);
  }

  // Cancel the job
  const job = scheduledJobs.get(scheduledPost.jobName);
  if (job) {
    job.cancel();
    scheduledJobs.delete(scheduledPost.jobName);
  }

  // Update status
  scheduledPost.status = 'cancelled';
  await scheduledPost.save();

  // Clean up saved files
  if (scheduledPost.imageFiles) {
    for (const fileInfo of scheduledPost.imageFiles) {
      try {
        await fs.unlink(fileInfo.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
  }

  return res.status(200).json(
    new ApiResponse(200, scheduledPost, "✅ Scheduled post cancelled successfully")
  );
});

// Reschedule post
export const reschedulePost = asyncHandler(async (req, res) => {
  const { scheduledPostId } = req.params;
  const { newScheduleTime } = req.body;

  if (!newScheduleTime) {
    throw new ApiError(400, "newScheduleTime is required");
  }

  const scheduledPost = await ScheduledPost.findById(scheduledPostId);
  if (!scheduledPost) {
    throw new ApiError(404, "Scheduled post not found");
  }

  if (scheduledPost.status !== 'scheduled') {
    throw new ApiError(400, `Cannot reschedule post with status: ${scheduledPost.status}`);
  }

  const newScheduleDate = new Date(newScheduleTime);
  if (isNaN(newScheduleDate.getTime())) {
    throw new ApiError(400, "Invalid newScheduleTime format");
  }

  if (newScheduleDate <= new Date()) {
    throw new ApiError(400, "New schedule time must be in the future");
  }

  // Cancel existing job
  const existingJob = scheduledJobs.get(scheduledPost.jobName);
  if (existingJob) {
    existingJob.cancel();
  }

  // Schedule new job
  const job = schedule.scheduleJob(scheduledPost.jobName, newScheduleDate, async () => {
    const org = await LinkedInOrganization.findById(scheduledPost.orgId);
    
    // Load files
    let filesToPost = [];
    if (scheduledPost.imageFiles && scheduledPost.imageFiles.length > 0) {
      for (const fileInfo of scheduledPost.imageFiles) {
        const buffer = await fs.readFile(fileInfo.path);
        filesToPost.push({
          buffer,
          mimetype: fileInfo.mimetype,
          originalname: fileInfo.filename
        });
      }
    }

    await postJob(scheduledPost._id);
    scheduledJobs.delete(scheduledPost.jobName);
  });

  scheduledJobs.set(scheduledPost.jobName, job);

  // Update scheduled post
  scheduledPost.scheduleTime = newScheduleDate;
  await scheduledPost.save();

  const displayTime = format(newScheduleDate, "yyyy-MM-dd'T'HH:mm:ss'Z'", { 
    timeZone: 'UTC' 
  });

  return res.status(200).json(
    new ApiResponse(200, {
      scheduledPost,
      newScheduledTime: displayTime,
      newScheduledTimeISO: newScheduleDate.toISOString()
    }, `✅ Post rescheduled for ${displayTime}`)
  );
});

// Get all scheduled posts
export const getAllPostByorgId = asyncHandler(async (req, res) => {
  const { orgId } = req.query;
  const { status } = req.query;

  const query = {};
  if (orgId) query.orgId = orgId;
  if (status) query.status = status;

  // Fetch and populate scheduled posts
  const scheduledPosts = await ScheduledPost.find(query)
    .populate('orgId', 'name')
    .sort({ scheduleTime: 1 });

  // Fetch and populate posted contents
  const postedContents = await PostedContent.find(query)
    .populate('orgId', 'name')
    .sort({ postedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, {
      scheduledPosts,
      postedContents
    }, "✅ Posts retrieved successfully")
  );
});

// Delete posted content from LinkedIn
export const deleteLinkedInPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { orgId } = req.body;

  if (!orgId || !postId) {
    throw new ApiError(400, "orgId and postId are required");
  }

  const org = await LinkedInOrganization.findById(orgId);
  if (!org?.accessToken) {
    throw new ApiError(403, "LinkedIn not connected for this organization");
  }

  try {
    console.log('🗑️ Attempting to delete post:', postId);
    console.log('🏢 Organization:', org.name);

    // Try to delete from LinkedIn
    const deleteResult = await linkedinService.deleteLinkedInPost(org.accessToken, postId);

    // Use the full URN in queries
    const urnPostId = `urn:li:share:${postId}`;

    console.log("🔍 Searching for linkedinPostId:", urnPostId);

    // Query using the full URN
    const scheduledPost = await ScheduledPost.findOne({ linkedinPostId: urnPostId });
    console.log("Found ScheduledPost:", scheduledPost);

    const postedContent = await PostedContent.findOne({ linkedinPostId: urnPostId });
    console.log("Found PostedContent:", postedContent);

    if (!scheduledPost && !postedContent) {
      throw new ApiError(404, "No matching posts found to delete in database");
    }

    let updatedScheduledPost = null;
    if (scheduledPost) {
      updatedScheduledPost = await ScheduledPost.findByIdAndUpdate(
        scheduledPost._id,
        {
          $set: {
            status: 'deleted',
            deletedAt: new Date(),
            linkedinPostId :"",
            deleteMethod: deleteResult.method
          }
        },
        { new: false }
      );
    }

    let updatedPostedContent = null;
    if (postedContent) {
      updatedPostedContent = await PostedContent.findByIdAndUpdate(
        postedContent._id,
        {
          $set: {
            status: 'deleted',
            deletedAt: new Date(),
            linkedinPostId :"",
            deleteMethod: deleteResult.method
          }
        },
        { new: false }
      );
    }

    return res.status(200).json(
      new ApiResponse(200, {
        deletedPostId: postId,
        method: deleteResult.method,
        alreadyDeleted: deleteResult.alreadyDeleted || false,
        updatedRecord: Boolean(updatedScheduledPost || updatedPostedContent)
      }, deleteResult.alreadyDeleted ?
        "✅ Post was already deleted from LinkedIn" :
        "✅ Post deleted from LinkedIn successfully")
    );

  } catch (error) {
    console.error('❌ Failed to delete LinkedIn post:', error);

    // Handle soft-delete locally if LinkedIn says it's already gone
    if (error.statusCode === 404 || error.message.includes('already been deleted')) {
      await ScheduledPost.updateMany(
        { linkedinPostId: `urn:li:share:${postId}` },
        {
          $set: {
            status: 'deleted',
            deletedAt: new Date(),
            error: 'Post already deleted from LinkedIn'
          }
        }
      );

      await PostedContent.updateMany(
        { linkedinPostId: `urn:li:share:${postId}` },
        {
          $set: {
            status: 'deleted',
            deletedAt: new Date(),
            error: 'Post already deleted from LinkedIn'
          }
        }
      );

      return res.status(200).json(
        new ApiResponse(200, { deletedPostId: postId }, "✅ Post was already deleted from LinkedIn")
      );
    }

    throw error;
  }
});

/** 
 * GET /linkedin/analytics/:orgId
 * Fetches analytics for an organization's LinkedIn activity
 */
export const getLinkedInAnalytics = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  // console.log("organizationId:-  " , organizationId);
  

  if (!organizationId || typeof organizationId !== 'string') {
    throw new ApiError(400, "Valid Organization ID is required");
  }

  let analytics;
  try {
    analytics = await PostgetAnalytics(organizationId);
  } catch (error) {
    console.error("❌ Error fetching LinkedIn analytics:", error.message);
    throw new ApiError(500, "Failed to fetch LinkedIn analytics");
  }

  return res.status(200).json(
    new ApiResponse(200, analytics, "✅ LinkedIn analytics fetched successfully")
  );
});

//  saveDraftPost
export const saveDraftPost = asyncHandler(async (req, res) => {
 
    
  const { jobId, message, imageUrls } = req.body;
  const imageFiles = req.files || [];

  const Position = await jobPostModel.findById(jobId)
  .select('position');
  
  const JobPostion = Position.position ;

  const draftData = {
    jobId,
    message,
    imageUrls: imageUrls || [],
    position :JobPostion,
    status: 'draft'
  };

  if (imageFiles.length > 0) {
    draftData.mediaFiles = imageFiles.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    }));
  }

  const savedPost = await PostedContent.create(draftData);

  return res.status(201).json(
    new ApiResponse(201, savedPost, "✅ Draft post saved successfully")
  );
});

//getDraftPosts
export const getDraftPosts = asyncHandler(async (req, res) => {
  const draftPosts = await PostedContent.find({ status: 'draft' }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, draftPosts, "✅ Draft posts fetched successfully")
  );
});

// Generate a LinkedIn job post using Gemini AI

export const generatePostText = async (req, res) => {
  try {
    const { jobId } = req.params;

   
    

    // Fetch job from DB
    const jobData = await jobPostModel.findById(jobId)
      .populate('departmentId')
      .populate('subDepartmentId')
      .populate('employmentTypeId')
      .populate('Worklocation')
      .populate('qualificationId')
      .populate('package')
      .populate('jobDescriptionId')
      .populate('organizationId');

    if (!jobData) {
      return res.status(404).json({ error: "Job not found." });
    }    

    
    

    // Generate post
    const post = await generateLinkedInPost(jobData);

    res.json({ post });
  } catch (error) {
    console.error("Error generating post:", error);
    res.status(500).json({ error: "Failed to generate LinkedIn post." });
  }
};
