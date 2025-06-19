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

  const { accessToken, memberId , name, email, picture } = await linkedinService.exchangeCodeForToken(org, code);

  org.accessToken = accessToken;
  org.memberId = memberId;
  org.linkedinName = name;
  org.linkedinEmail = email;
  org.linkedinProfilePic = picture;
  await org.save();

  // res.status(200).json(new ApiResponse(200, null, "✅ LinkedIn connected successfully"));
  res.redirect(`https://recruitexe.com/employeeSetup/Linkedin`);
});

// Post content to LinkedIn with multiple images support

// export const postMultipleContentWithFilesUGC = asyncHandler(async (req, res) => {
//   const { postIds, orgId, scheduleTimes } = req.body;
//   const imageFiles = req.files || [];
//     // Input validation
//   if (!Array.isArray(postIds) || postIds.length === 0) {
//     throw new ApiError(400, "At least one post ID must be provided");
//   }

//   if (!orgId) {
    
//     throw new ApiError(400, "orgId is required");
//   }
  
// const OrganisationId = await LinkedInOrganization.findById(orgId)
//   .populate({
//     path: 'organizationId',
//     select: '_id'
//   })
//   .exec();

// if (!OrganisationId) throw new ApiError(404, "Organization not found");

// const orgIdFromRef = OrganisationId.organizationId?._id;

// console.log(" organisationId123:-", orgIdFromRef);
  

//   // Optional: validate scheduleTimes
//   let validScheduleTimes = [];
//   if (scheduleTimes && Array.isArray(scheduleTimes)) {
//     validScheduleTimes = scheduleTimes.map(t => new Date(t)).filter(date => !isNaN(date.getTime()));
//   }

//   // Fetch drafts
//   const drafts = await PostedContent.find({
//     _id: { $in: postIds },
//     status: 'draft'
//   });

//   if (!drafts.length) {
//     throw new ApiError(404, "No drafts found for the given ID");
//   }

//   const results = [];

//   for (const draft of drafts) {
//     const { _id: postId, message, imageUrls, jobId, mediaFiles } = draft;

//     // Check if org exists and has access token
//     const org = await LinkedInOrganization.findById(orgId);
//     if (!org?.accessToken) {
//       results.push({
//         status: 'failed',
//         error: "LinkedIn not connected for this organization"
//       });
//       continue;
//     }

//     // Match any uploaded files for this draft
//     const draftImageFiles = imageFiles.filter(file =>
//       file.fieldname === `draft-${postId.toString()}` // Frontend should name fields as draft-<postId>
//     );

//     // Combine existing mediaFiles from draft + newly uploaded ones
//     let combinedMediaFiles = [...(mediaFiles || []), ...draftImageFiles];

//     // Save uploaded files locally if needed (e.g., for scheduling)
//     let savedFileInfo = combinedMediaFiles.map(file => ({
//       filename: file.filename || `${uuidv4()}-${file.originalname}`,
//       path: file.path || path.join('uploads', 'scheduled', `${uuidv4()}-${file.originalname}`),
//       mimetype: file.mimetype,
//       size: file.size
//     }));

//     // If there are uploads and we're scheduling, save them to disk
//     if (draftImageFiles.length > 0 && validScheduleTimes.length > 0) {
//       for (const file of draftImageFiles) {
//         const fileInfo = savedFileInfo.find(f => f.originalname === file.originalname);
//         await fs.mkdir(path.dirname(fileInfo.path), { recursive: true });
//         await fs.writeFile(fileInfo.path, file.buffer);
//       }
//     }

//     // Function to actually post content
//     const postJob = async (scheduledPostId = null) => {
//       try {
//         let filesToPost = [];

//         if (scheduledPostId) {
//           const scheduledPost = await ScheduledPost.findById(scheduledPostId);
//           if (scheduledPost.imageFiles?.length > 0) {
//             for (const fileInfo of scheduledPost.imageFiles) {
//               const buffer = await fs.readFile(fileInfo.path);
//               filesToPost.push({
//                 buffer,
//                 mimetype: fileInfo.mimetype,
//                 originalname: fileInfo.filename
//               });
//             }
//           }
//         } else {
//           filesToPost = [...draftImageFiles];
//         }

//         const result = await linkedinService.postToLinkedInWithFilesUGC(
//           org,
//           message,
//           imageUrls || [],
//           filesToPost
//         );

//         console.log("✅ Content posted to LinkedIn", result);

//         // Mark draft as posted
//         await PostedContent.findByIdAndUpdate(postId, {
//           $set: {
//             orgId: org._id,
//             status: 'posted',
//             linkedinPostId: result.id,
//             organizationId : orgIdFromRef,
//             postedAt: new Date()
//           }
//         });

//         if (scheduledPostId) {
//           await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
//           $set: {
//             orgId: org._id,
//             status: 'posted',
//             linkedinPostId: result.id,
//             organizationId : orgIdFromRef,
//             postedAt: new Date()
//           }
//           });

//           const scheduledPost = await ScheduledPost.findById(scheduledPostId);
//           if (scheduledPost.imageFiles?.length > 0) {
//             for (const fileInfo of scheduledPost.imageFiles) {
//               try {
//                 await fs.unlink(fileInfo.path);
//               } catch (err) {
//                 console.error('Error deleting file:', err);
//               }
//             }
//           }
//         }

//         return {
//           status: 'success',
//           postId,
//           result
//         };
//       } catch (error) {
//         console.error("❌ Error in post:", error);

//         await PostedContent.findByIdAndUpdate(postId, {
//           $set:{
//             orgId: org._id,
//             status: 'failed',
//             organizationId : orgIdFromRef,
//             error: error.message
//           }
//         });

//         if (scheduledPostId) {
//           await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
//           $set:{
//             orgId: org._id,
//             status: 'failed',
//             organizationId : orgIdFromRef,
//             error: error.message
//           }
//           });
//         }

//         return {
//           status: 'failed',
//           error: error.message
//         };
//       }
//     };

//     // If no schedule times, post immediately once
//     if (validScheduleTimes.length === 0) {
//       const result = await postJob();
//       results.push(result);
//     } else {
//       // Schedule multiple posts for the same draft
//       for (const scheduleDate of validScheduleTimes) {
//         const jobName = `linkedin-post-${uuidv4()}`;
//         const scheduledPost = await ScheduledPost.create({
//           orgId,
//           jobId,
//           message,
//           imageUrls,
//           imageFiles: savedFileInfo,
//           scheduleTime: scheduleDate,
//           organizationId : orgIdFromRef,
//           jobName
//         });

//         const job = schedule.scheduleJob(jobName, scheduleDate, async () => {
//           await postJob(scheduledPost._id);
//           scheduledJobs.delete(jobName);
//         });

//         scheduledJobs.set(jobName, job);

//         results.push({
//           status: 'scheduled',
//           organizationId : orgIdFromRef,
//           scheduledPostId: scheduledPost._id,
//           jobName,
//           scheduledTime: scheduleDate.toISOString()
//         });
//       }
//     }
//   }

//   return res.status(200).json(new ApiResponse(200, results, "✅ Posts processed successfully"));
// });



export const postMultipleContentWithFilesUGC = asyncHandler(async (req, res) => {
  const { postIds, orgs, scheduleTimes } = req.body; // "orgs" is now an array of { orgId, scheduleTimes }
  const imageFiles = req.files || [];

  // Input validation
  if (!Array.isArray(postIds) || postIds.length === 0) {
    throw new ApiError(400, "At least one post ID must be provided");
  }

  if (!Array.isArray(orgs) || orgs.length === 0) {
    throw new ApiError(400, "At least one organization must be provided");
  }

  // Fetch drafts
  const drafts = await PostedContent.find({
    _id: { $in: postIds },
    status: 'draft'
  });

  if (!drafts.length) {
    throw new ApiError(404, "No drafts found for the given IDs");
  }

  const results = [];

  // Process each organization separately
  await Promise.all(
    orgs.map(async ({ orgId, scheduleTimes }) => {
      const OrganisationId = await LinkedInOrganization.findById(orgId).populate({
        path: 'organizationId',
        select: '_id'
      });

      if (!OrganisationId) throw new ApiError(404, `Organization not found: ${orgId}`);

      const orgIdFromRef = OrganisationId.organizationId?._id;
      const linkedInOrg = await LinkedInOrganization.findById(orgId);

      if (!linkedInOrg?.accessToken) {
        results.push({
          status: 'failed',
          orgId,
          error: "LinkedIn not connected for this organization"
        });
        return;
      }

      let validScheduleTimes = [];
      if (scheduleTimes && Array.isArray(scheduleTimes)) {
        validScheduleTimes = scheduleTimes
          .map(t => new Date(t))
          .filter(date => !isNaN(date.getTime()));
      }

      // Process each draft for this org
      await Promise.all(
        drafts.map(async (draft) => {
          const { _id: postId, message, imageUrls, jobId, mediaFiles } = draft;

          const draftImageFiles = imageFiles.filter(file =>
            file.fieldname === `draft-${postId.toString()}`
          );

          let combinedMediaFiles = [...(mediaFiles || []), ...draftImageFiles];

          let savedFileInfo = combinedMediaFiles.map(file => ({
            filename: file.filename || `${uuidv4()}-${file.originalname}`,
            path: file.path || path.join('uploads', 'scheduled', `${uuidv4()}-${file.originalname}`),
            mimetype: file.mimetype,
            size: file.size
          }));

          // Save files concurrently if scheduling
          if (draftImageFiles.length > 0 && validScheduleTimes.length > 0) {
            await Promise.all(
              draftImageFiles.map(async (file) => {
                const fileInfo = savedFileInfo.find(f => f.originalname === file.originalname);
                await fs.mkdir(path.dirname(fileInfo.path), { recursive: true });
                await fs.writeFile(fileInfo.path, file.buffer);
              })
            );
          }

          const postJob = async (scheduledPostId = null) => {
            try {
              let filesToPost = [];

              if (scheduledPostId) {
                const scheduledPost = await ScheduledPost.findById(scheduledPostId);
                if (scheduledPost.imageFiles?.length > 0) {
                  filesToPost = await Promise.all(
                    scheduledPost.imageFiles.map(async (fileInfo) => ({
                      buffer: await fs.readFile(fileInfo.path),
                      mimetype: fileInfo.mimetype,
                      originalname: fileInfo.filename
                    }))
                  );
                }
              } else {
                filesToPost = [...draftImageFiles];
              }

              const result = await linkedinService.postToLinkedInWithFilesUGC(
                linkedInOrg,
                message,
                imageUrls || [],
                filesToPost
              );

              console.log("✅ Content posted to LinkedIn", result);

              await PostedContent.findByIdAndUpdate(postId, {
                $set: {
                  orgId: linkedInOrg._id,
                  status: 'posted',
                  linkedinPostId: result.id,
                  organizationId: orgIdFromRef,
                  postedAt: new Date()
                }
              });

              if (scheduledPostId) {
                await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
                  $set: {
                    orgId: linkedInOrg._id,
                    status: 'posted',
                    linkedinPostId: result.id,
                    organizationId: orgIdFromRef,
                    postedAt: new Date()
                  }
                });

                const scheduledPost = await ScheduledPost.findById(scheduledPostId);
                if (scheduledPost.imageFiles?.length > 0) {
                  await Promise.all(
                    scheduledPost.imageFiles.map(async (fileInfo) => {
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
                postId,
                result
              };
            } catch (error) {
              console.error("❌ Error in post:", error);

              await PostedContent.findByIdAndUpdate(postId, {
                $set: {
                  orgId: linkedInOrg._id,
                  status: 'failed',
                  organizationId: orgIdFromRef,
                  error: error.message
                }
              });

              if (scheduledPostId) {
                await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
                  $set: {
                    orgId: linkedInOrg._id,
                    status: 'failed',
                    organizationId: orgIdFromRef,
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

          if (validScheduleTimes.length === 0) {
            const result = await postJob();
            results.push(result);
          } else {
            for (const scheduleDate of validScheduleTimes) {
              const jobName = `linkedin-post-${uuidv4()}`;
              const scheduledPost = await ScheduledPost.create({
                orgId,
                jobId,
                message,
                imageUrls,
                imageFiles: savedFileInfo,
                scheduleTime: scheduleDate,
                organizationId: orgIdFromRef,
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
                organizationId: orgIdFromRef,
                scheduledPostId: scheduledPost._id,
                jobName,
                scheduledTime: scheduleDate.toISOString()
              });
            }
          }
        })
      );
    })
  );

  return res.status(200).json(new ApiResponse(200, results, "✅ Posts processed successfully"));
});

// export const postMultipleContentWithFilesUGC = asyncHandler(async (req, res) => {
//   const { postIds, orgId, scheduleTimes } = req.body;
//   const imageFiles = req.files || [];

//   // Input validation
//   if (!Array.isArray(postIds) || postIds.length === 0) {
//     throw new ApiError(400, "At least one post ID must be provided");
//   }

//   if (!orgId) {
//     throw new ApiError(400, "orgId is required");
//   }

//   const OrganisationId = await LinkedInOrganization.findById(orgId)
//     .populate({
//       path: 'organizationId',
//       select: '_id'
//     })
//     .exec();

//   if (!OrganisationId) throw new ApiError(404, "Organization not found");

//   const orgIdFromRef = OrganisationId.organizationId?._id;

//   console.log(" organisationId123:-", orgIdFromRef);

//   // Optional: validate scheduleTimes
//   let validScheduleTimes = [];
//   if (scheduleTimes && Array.isArray(scheduleTimes)) {
//     validScheduleTimes = scheduleTimes.map(t => new Date(t)).filter(date => !isNaN(date.getTime()));
//   }

//   // Fetch drafts
//   const drafts = await PostedContent.find({
//     _id: { $in: postIds },
//     status: 'draft'
//   });

//   if (!drafts.length) {
//     throw new ApiError(404, "No drafts found for the given ID");
//   }

//   const results = [];

//   // Process drafts in parallel
//   await Promise.all(
//     drafts.map(async (draft) => {
//       const { _id: postId, message, imageUrls, jobId, mediaFiles } = draft;

//       const org = await LinkedInOrganization.findById(orgId);
//       if (!org?.accessToken) {
//         results.push({
//           status: 'failed',
//           error: "LinkedIn not connected for this organization"
//         });
//         return;
//       }

//       const draftImageFiles = imageFiles.filter(file =>
//         file.fieldname === `draft-${postId.toString()}`
//       );

//       let combinedMediaFiles = [...(mediaFiles || []), ...draftImageFiles];

//       let savedFileInfo = combinedMediaFiles.map(file => ({
//         filename: file.filename || `${uuidv4()}-${file.originalname}`,
//         path: file.path || path.join('uploads', 'scheduled', `${uuidv4()}-${file.originalname}`),
//         mimetype: file.mimetype,
//         size: file.size
//       }));

//       // Save files concurrently if scheduling
//       if (draftImageFiles.length > 0 && validScheduleTimes.length > 0) {
//         await Promise.all(
//           draftImageFiles.map(async (file) => {
//             const fileInfo = savedFileInfo.find(f => f.originalname === file.originalname);
//             await fs.mkdir(path.dirname(fileInfo.path), { recursive: true });
//             await fs.writeFile(fileInfo.path, file.buffer);
//           })
//         );
//       }

//       const postJob = async (scheduledPostId = null) => {
//         try {
//           let filesToPost = [];

//           if (scheduledPostId) {
//             const scheduledPost = await ScheduledPost.findById(scheduledPostId);
//             if (scheduledPost.imageFiles?.length > 0) {
//               filesToPost = await Promise.all(
//                 scheduledPost.imageFiles.map(async (fileInfo) => ({
//                   buffer: await fs.readFile(fileInfo.path),
//                   mimetype: fileInfo.mimetype,
//                   originalname: fileInfo.filename
//                 }))
//               );
//             }
//           } else {
//             filesToPost = [...draftImageFiles];
//           }

//           const result = await linkedinService.postToLinkedInWithFilesUGC(
//             org,
//             message,
//             imageUrls || [],
//             filesToPost
//           );

//           console.log("✅ Content posted to LinkedIn", result);

//           await PostedContent.findByIdAndUpdate(postId, {
//             $set: {
//               orgId: org._id,
//               status: 'posted',
//               linkedinPostId: result.id,
//               organizationId: orgIdFromRef,
//               postedAt: new Date()
//             }
//           });

//           if (scheduledPostId) {
//             await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
//               $set: {
//                 orgId: org._id,
//                 status: 'posted',
//                 linkedinPostId: result.id,
//                 organizationId: orgIdFromRef,
//                 postedAt: new Date()
//               }
//             });

//             const scheduledPost = await ScheduledPost.findById(scheduledPostId);
//             if (scheduledPost.imageFiles?.length > 0) {
//               await Promise.all(
//                 scheduledPost.imageFiles.map(async (fileInfo) => {
//                   try {
//                     await fs.unlink(fileInfo.path);
//                   } catch (err) {
//                     console.error('Error deleting file:', err);
//                   }
//                 })
//               );
//             }
//           }

//           return {
//             status: 'success',
//             postId,
//             result
//           };
//         } catch (error) {
//           console.error("❌ Error in post:", error);

//           await PostedContent.findByIdAndUpdate(postId, {
//             $set: {
//               orgId: org._id,
//               status: 'failed',
//               organizationId: orgIdFromRef,
//               error: error.message
//             }
//           });

//           if (scheduledPostId) {
//             await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
//               $set: {
//                 orgId: org._id,
//                 status: 'failed',
//                 organizationId: orgIdFromRef,
//                 error: error.message
//               }
//             });
//           }

//           return {
//             status: 'failed',
//             error: error.message
//           };
//         }
//       };

//       if (validScheduleTimes.length === 0) {
//         const result = await postJob();
//         results.push(result);
//       } else {
//         for (const scheduleDate of validScheduleTimes) {
//           const jobName = `linkedin-post-${uuidv4()}`;
//           const scheduledPost = await ScheduledPost.create({
//             orgId,
//             jobId,
//             message,
//             imageUrls,
//             imageFiles: savedFileInfo,
//             scheduleTime: scheduleDate,
//             organizationId: orgIdFromRef,
//             jobName
//           });

//           const job = schedule.scheduleJob(jobName, scheduleDate, async () => {
//             await postJob(scheduledPost._id);
//             scheduledJobs.delete(jobName);
//           });

//           scheduledJobs.set(jobName, job);

//           results.push({
//             status: 'scheduled',
//             organizationId: orgIdFromRef,
//             scheduledPostId: scheduledPost._id,
//             jobName,
//             scheduledTime: scheduleDate.toISOString()
//           });
//         }
//       }
//     })
//   );

//   return res.status(200).json(new ApiResponse(200, results, "✅ Posts processed successfully"));
// });




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
  const jobs = req.body; // Expecting array of job objects
  const imageFiles = req.files || [];

  if (!Array.isArray(jobs) || jobs.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array of jobs");
  }

  const results = [];

  await Promise.all(
    jobs.map(async (job) => {
      const { jobId, message, imageUrls } = job;

      // Validate required fields
      if (!jobId || !message) {
        results.push({
          jobId,
          status: 'failed',
          error: "Missing jobId or message"
        });
        return;
      }

      // Fetch position from job model
      const jobData = await jobPostModel.findById(jobId).select('position');
      if (!jobData) {
        results.push({
          jobId,
          status: 'failed',
          error: 'Job not found'
        });
        return;
      }

      const jobPosition = jobData.position || "Not specified";

      // Filter files specific to this job (e.g., fieldname = `draft-${jobId}`)
      const jobImageFiles = imageFiles.filter(file =>
        file.fieldname === `draft-${jobId}`
      );

      const draftData = {
        jobId,
        message,
        imageUrls: imageUrls || [],
        position: jobPosition,
        status: 'draft'
      };

      if (jobImageFiles.length > 0) {
        draftData.mediaFiles = jobImageFiles.map(file => ({
          filename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        }));
      }

      try {
        const savedPost = await PostedContent.create(draftData);
        results.push({
          jobId,
          status: 'success',
          data: savedPost
        });
      } catch (err) {
        console.error(`Error saving draft for job ${jobId}:`, err);
        results.push({
          jobId,
          status: 'failed',
          error: err.message || 'Failed to save draft'
        });
      }
    })
  );

  return res.status(201).json(
    new ApiResponse(201, results, "✅ Draft posts saved successfully")
  );
});

// Edit the draft 
export const editDraftPost = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const { message, imageUrls } = req.body;
  const imageFiles = req.files || [];

  // Fetch the draft
  const draft = await PostedContent.findOne({ _id: draftId, status: 'draft' });

  if (!draft) {
    throw new ApiError(404, "Draft post not found or already published");
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

  return res.status(200).json(
    new ApiResponse(200, draft, "✅ Draft post updated successfully")
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

// export const generatePostText = async (req, res) => {
//   try {
//     const { jobId } = req.params;

   
    

//     // Fetch job from DB
//     const jobData = await jobPostModel.findById(jobId)
//       .populate('departmentId')
//       .populate('subDepartmentId')
//       .populate('employmentTypeId')
//       .populate('Worklocation')
//       .populate('qualificationId')
//       .populate('package')
//       .populate('jobDescriptionId')
//       .populate('organizationId');

//     if (!jobData) {
//       return res.status(404).json({ error: "Job not found." });
//     }    
//     // Generate post
//     const post = await generateLinkedInPost(jobData);

//     res.json({ post });
//   } catch (error) {
//     console.error("Error generating post:", error);
//     res.status(500).json({ error: "Failed to generate LinkedIn post." });
//   }
// };

// export const generatePostText = async (req, res) => {
//   try {
//     // Get jobIds from URL params
//     const { jobIds } = req.params;

//     if (!jobIds || typeof jobIds !== 'string') {
//       return res.status(400).json({ error: "Job IDs must be provided as comma-separated string" });
//     }

//     const jobIdList = jobIds.split(',').map(id => id.trim());

//     if (!Array.isArray(jobIdList) || jobIdList.length === 0) {
//       return res.status(400).json({ error: "At least one job ID must be provided" });
//     }

//     // Step 1: Extract only position from all jobs
//     const jobPositionDocs = await jobPostModel.find({
//       _id: { $in: jobIdList }
//     })
//       .select('position');

//     if (!jobPositionDocs || jobPositionDocs.length === 0) {
//       return res.status(404).json({ error: "No job found." });
//     }

//     const positions = jobPositionDocs.map(doc => doc.position).filter(Boolean);

//     // Step 2: Fetch full data only for the first job
//     const mainJobId = jobIdList[0];

//     const jobData = await jobPostModel.findById(mainJobId)
//       .populate('departmentId')
//       .populate('subDepartmentId')
//       .populate('employmentTypeId')
//       .populate('Worklocation')
//       .populate('qualificationId')
//       .populate('package')
//       .populate('jobDescriptionId')
//       .populate('organizationId');

//     if (!jobData) {
//       return res.status(404).json({ error: "Main job not found." });
//     }

//     // Step 3: Generate unified LinkedIn post using main job + all positions
//     const post = await generateLinkedInPost(positions, jobData);

//     return res.json({ post });

//   } catch (error) {
//     console.error("Error generating post:", error);
//     return res.status(500).json({ error: "Failed to generate LinkedIn post." });
//   }
// };

// For Multiple job Id For Future enhancement

export const generatePostText = asyncHandler(async (req, res) => {
  const { jobIds } = req.params;
  
    if (!jobIds || typeof jobIds !== 'string') {
    throw new ApiError(400, "Job IDs must be provided as comma-separated string");
  }

  const jobIdList = jobIds.split(',').map(id => id.trim());

  if (jobIdList.length === 0) {
    throw new ApiError(400, "At least one job ID must be provided");
  }

  // Fetch all job positions
  const jobPositionDocs = await jobPostModel.find({ _id: { $in: jobIdList } }).select('position');
  if (!jobPositionDocs || jobPositionDocs.length === 0) {
    throw new ApiError(404, "No job found.");
  }

  const positions = jobPositionDocs.map(doc => doc.position).filter(Boolean);
  const mainJobId = jobIdList[0];

  const jobData = await jobPostModel.findById(mainJobId)
    .populate('departmentId subDepartmentId employmentTypeId Worklocation qualificationId package jobDescriptionId organizationId');

  if (!jobData) {
    throw new ApiError(404, "Main job not found.");
  }

  /* 1.  Create a PostedContent document in “processing” state */
  const cacheDoc = await PostedContent.create({
    jobId: mainJobId,
    organizationId: jobData.organizationId?._id,
    position: positions.length === 1 ? positions[0] : 'Multiple Positions'
  });

  /* 2.  Send early response so gateway never times out */
  res.status(202).json({
    message: 'Post generation started. Please wait while we fetch and process the data.',
    id: cacheDoc._id.toString(),
    status: 'processing'
  });

  /* 3.  Heavy work happens after the response */
  generateLinkedInPost(positions, jobData)
    .then(async post => {
      await PostedContent.findByIdAndUpdate(
        cacheDoc._id,
        {
          message: post.postText,
          imageUrls: post.templates.map(t => t.imageUrl),
          status: 'ready'
        },
        { new: true }
      );
      console.log(`[PostGen] completed for ${cacheDoc._id}`);
    })
    .catch(async err => {
      console.error('[PostGen] failed:', err);
      await PostedContent.findByIdAndUpdate(cacheDoc._id, { status: 'failed' });
    });
});


export const getPostGenStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await PostedContent.findById(id).lean();

  if (!doc) throw new ApiError(404, 'Generation task not found');

  // 202 until ready, 200 when done
  const httpCode = doc.status === 'ready' ? 200 : 202;
  res.status(httpCode).json(doc);
});


// export const generatePostText = async (req, res) => {
//   try {
//     // Extract and parse job IDs from URL param
//     const { jobIds } = req.params;

//     if (!jobIds || typeof jobIds !== 'string') {
//       return res.status(400).json({ error: "Job IDs must be provided as comma-separated string" });
//     }

//     const jobIdList = jobIds.split(',').map(id => id.trim());

//     if (!Array.isArray(jobIdList) || jobIdList.length === 0) {
//       return res.status(400).json({ error: "At least one job ID must be provided" });
//     }

//     // Process each job in parallel
//     const results = await Promise.all(
//       jobIdList.map(async (jobId) => {
//         try {
//           const jobData = await jobPostModel.findById(jobId)
//             .populate('departmentId')
//             .populate('subDepartmentId')
//             .populate('employmentTypeId')
//             .populate('Worklocation')
//             .populate('qualificationId')
//             .populate('package')
//             .populate('jobDescriptionId')
//             .populate('organizationId')
//             .lean()
//             .exec();

//           if (!jobData) {
//             return {
//               jobId,
//               status: 'failed',
//               error: 'Job not found'
//             };
//           }

//           const postResult = await generateLinkedInPost(jobData);

//           return {
//             jobId,
//             postName:jobData.position || "Not specified", // 👈 Included here
//             status: 'success',
//             ...postResult
//           };

//         } catch (err) {
//           console.error(`Error generating post for job ${jobId}:`, err);
//           return {
//             jobId,
//             status: 'failed',
//             error: err.message || 'Failed to generate post'
//           };
//         }
//       })
//     );

//     return res.status(200).json({
//       success: true,
//       results
//     });

//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Internal server error"
//     });
//   }
// };
