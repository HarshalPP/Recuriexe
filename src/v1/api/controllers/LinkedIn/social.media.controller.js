// linkedin.controller.js - Update imports at the top
import LinkedInOrganization from '../../models/LinkedIn/Organization.js';
import * as linkedinService from '../../services/Linkedinservice/linkedin.service.js';
import { ApiError } from '../../Utils/LinkedIn/ApiError.js';
import { ApiResponse } from '../../Utils/LinkedIn/ApiResponse.js';
import { asyncHandler } from '../../Utils/LinkedIn/asyncHandler.js';
import schedule from 'node-schedule';
import { format } from 'date-fns-tz';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { scheduledJobs } from '../../Utils/LinkedIn/scheduler.js';;
import {PostContent} from '../../models/LinkedIn/social.media.js';
import { success, unknownError, serverValidation, badRequest, notFound } from "../../formatters/globalResponse.js"


// saveDraft
export const saveDraft = asyncHandler(async (req, res) => {
  const { message, imageUrls = [] } =  req.body;
  const imageFiles = req.files || [];
  console.log("req.body:", req.body);
console.log("req.message:", req.body);

  // Ensure imageUrls is always an array
  const imageUrlsArray = Array.isArray(imageUrls) ? imageUrls : (imageUrls ? [imageUrls] : []);

  if (!message && imageUrlsArray.length === 0) {
    // throw new ApiError(400, 'Message or image files are required');
    return badRequest(res, "Message or image files are required")
  }

  const organizationId = req.employee.organizationId;

  const draftPost = await PostContent.create({
    message,
    imageUrls: imageUrlsArray,
    imageFiles: imageFiles.map(file => file.filename),
    organizationId,
    status: 'draft',
  });

  // res.status(201).json(new ApiResponse(201, draftPost, 'Draft post saved successfully'));
  return success(res , "Draft post saved successfully", draftPost)
});

//getDraftPosts
export const getDraftPosts = asyncHandler(async (req, res) => {
  const draftPosts = await PostContent.find({ status: 'draft' }).sort({ createdAt: -1 });

  // return res.status(200).json(
  //   new ApiResponse(200, draftPosts, " Draft posts fetched successfully")
  
  return success(res, "Draft posts fetched successfully",draftPosts)
});

// Edit the draft 
export const editDraftPost = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const { message, imageUrls } = req.body;
  const imageFiles = req.files || [];

  // Fetch the draft
  const draft = await PostContent.findOne({ _id: draftId, status: 'draft' });

  if (!draft) {
    // throw new ApiError(404, "Draft post not found or already published");
    notFound(res, "Draft post not found or already published")
  }

  // Update fields
  if (message !== undefined) draft.message = message;
  if (imageUrls !== undefined) draft.imageUrls = imageUrls;

  // Handle file uploads if any
  if (imageFiles.length > 0) {
    draft.mediaFiles = imageFiles.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    }));
  }

  await draft.save();

  // return res.status(200).json(
  //   new ApiResponse(200, draft, " Draft post updated successfully") );

    return success(res , "Draft post updated successfully" , draft)
  
});

// post on linkedin without jobID dependency
export const postMultipleContentWithFilesUGC = asyncHandler(async (req, res) => {
  const { postIds, orgs, scheduleTimes, message: directMessage, imageUrls: directImageUrls } = req.body;
  const imageFiles = req.files || [];

  console.log("orgs",orgs);
  

  // Validate input
  if (!Array.isArray(orgs) || !orgs.length) {
    // throw new ApiError(400, "At least one organization must be provided");
    badRequest(res, "At least one organization must be provided")
  }

  let drafts = [];
  let combinedMessage = directMessage;
  let combinedImages = [...(directImageUrls || [])];

  // If postIds exist, use draft data
  if (Array.isArray(postIds) && postIds.length > 0) {
    drafts = await PostContent.find({
      _id: { $in: postIds },
      status: 'draft'
    });

    if (!drafts.length) {
      // throw new ApiError(404, "No drafts found for the given IDs");
      badRequest(res, "No drafts found for the given IDs")

    }

    // Use first draft's message and imageUrls if not provided directly
    combinedMessage = directMessage || drafts[0].message;
    combinedImages = directImageUrls || [...drafts[0].imageUrls];
  } else if (!directMessage || !Array.isArray(directImageUrls)) {
    // throw new ApiError(400, "Either valid postIds or message + imageUrls must be provided");
    badRequest(res, "Either valid postIds or message + imageUrls must be provided")
   
  }

  const results = [];

  // Process each organization
  await Promise.all(
    orgs.map(async ({ orgId, scheduleTimes }) => {
      const linkedInOrg = await LinkedInOrganization.findById(orgId);
      if (!linkedInOrg || !linkedInOrg.accessToken) {
        results.push({
          status: 'failed',
          orgId,
          error: "LinkedIn not connected for this organization"
        });
        return;
      }

      const OrganisationId = linkedInOrg.organizationId?._id;

      let validScheduleTimes = [];
      if (scheduleTimes && Array.isArray(scheduleTimes)) {
        validScheduleTimes = scheduleTimes
          .map(t => new Date(t))
          .filter(date => !isNaN(date.getTime()));
      }

      // Prepare media files from request
      const savedFileInfo = imageFiles.map(file => ({
        filename: `${uuidv4()}-${file.originalname}`,
        path: file.path || path.join('uploads', 'scheduled', `${uuidv4()}-${file.originalname}`),
        mimetype: file.mimetype,
        buffer: file.buffer
      }));

      // Save files to disk if scheduled
      if (savedFileInfo.length && validScheduleTimes.length > 0) {
        await Promise.all(
          savedFileInfo.map(async (file) => {
            await fs.mkdir(path.dirname(file.path), { recursive: true });
            await fs.writeFile(file.path, file.buffer);
          })
        );
      }

      // Post function
      const postJob = async (postId = null) => {
        try {
          let filesToPost = [];

          if (postId) {
            const post = await PostContent.findById(postId);
            if (post?.mediaFiles?.length) {
              filesToPost = await Promise.all(
                post.mediaFiles.map(async (fileInfo) => ({
                  buffer: await fs.readFile(fileInfo.path),
                  mimetype: fileInfo.mimetype,
                  originalname: fileInfo.filename
                }))
              );
            }
          } else {
            filesToPost = [...imageFiles];
          }

          const result = await linkedinService.postToLinkedInWithFilesUGC(
            linkedInOrg,
            combinedMessage,
            combinedImages,
            filesToPost
          );

          console.log(" Content posted to LinkedIn", result);

          // Update draft status if it exists
          if (drafts.length) {
            await PostContent.updateMany(
              { _id: { $in: postIds } },
              {
                $set: {
                  orgId: linkedInOrg._id,
                  status: 'posted',
                  linkedinPostId: result.id,
                  organizationId: OrganisationId,
                  postedAt: new Date()
                }
              }
            );
          }

          // Handle scheduled post updates if needed
          if (postId) {
            await PostContent.findByIdAndUpdate(postId, {
              $set: {
                orgId: linkedInOrg._id,
                status: 'posted',
                linkedinPostId: result.id,
                organizationId: OrganisationId,
                postedAt: new Date(),
                scheduleTime: undefined
              }
            });

            const post = await PostContent.findById(postId);
            if (post?.mediaFiles?.length) {
              await Promise.all(
                post.mediaFiles.map(async (fileInfo) => {
                  try {
                    await fs.unlink(fileInfo.path);
                  } catch (err) {
                    console.error('Error deleting file:', err);
                  }
                })
              );
            }
          }

          return {
            status: 'success',
            orgId,
            result
          };
        } catch (error) {
          console.error("❌ Error in post:", error);

          // Update statuses to failed
          if (drafts.length) {
            await PostContent.updateMany(
              { _id: { $in: postIds } },
              {
                $set: {
                  orgId: linkedInOrg._id,
                  status: 'failed',
                  organizationId: OrganisationId,
                  error: error.message
                }
              }
            );
          }

          if (postId) {
            await PostContent.findByIdAndUpdate(postId, {
              $set: {
                orgId: linkedInOrg._id,
                status: 'failed',
                organizationId: OrganisationId,
                error: error.message
              }
            });
          }

          return {
            status: 'failed',
            orgId,
            error: error.message
          };
        }
      };

      // Immediate post
      if (validScheduleTimes.length === 0) {
        const result = await postJob();
        results.push(result);
      } 
      
      // Schedule posts
      else {
        for (const scheduleDate of validScheduleTimes) {
          const jobName = `linkedin-post-${uuidv4()}`;
          const scheduledPost = await PostContent.create({
            message: combinedMessage,
            imageUrls: combinedImages,
            mediaFiles: savedFileInfo,
            scheduleTime: scheduleDate,
            status: 'scheduled',
            orgId,
            organizationId: OrganisationId,
            jobName
          });

          const job = schedule.scheduleJob(jobName, scheduleDate, async () => {
            await postJob(scheduledPost._id);
            scheduledJobs.delete(jobName);
          });

          scheduledJobs.set(jobName, job);

          results.push({
            status: 'scheduled',
            orgId,
            organizationId: OrganisationId,
            postId: scheduledPost._id,
            jobName,
            scheduledTime: scheduleDate.toISOString()
          });
        }
      }
    })
  );

  // return res.status(200).json(new ApiResponse(200, results, " Posts processed successfully"));

  return success(res, "Posts processed successfully" ,results )
});

// get all schedule post by Organisation id
export const getScheduledPostsByOrganization = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;

  if (!organizationId) {
    // throw new ApiError(400, "Organization ID is required");
    return badRequest(res , "Organization ID is required");
  }

  const scheduledPosts = await PostContent.find({
    organizationId,
    status: 'scheduled'
  }).sort({ scheduleTime: 1 });

  if (!scheduledPosts || scheduledPosts.length === 0) {
    // return res.status(200).json(
    //   new ApiResponse(200, [], "No scheduled posts found for this organization")
    // );
    return success(res, "No scheduled posts found for this organization" ,[])
  }

  // return res.status(200).json(
  //   new ApiResponse(200, scheduledPosts, " Scheduled posts fetched successfully")
  // );

  return success(res, "Scheduled posts fetched successfully" ,scheduledPosts)
});

