// linkedin.controller.js - Update imports at the top
import LinkedInOrganization from "../../models/LinkedIn/Organization.js";
import ScheduledPost from "../../models/LinkedIn/ScheduledPost.js";
import Organization from "../../models/organizationModel/organization.model.js";
import * as linkedinService from "../../services/Linkedinservice/linkedin.service.js";
import { ApiError } from "../../Utils/LinkedIn/ApiError.js";
import { ApiResponse } from "../../Utils/LinkedIn/ApiResponse.js";
import { asyncHandler } from "../../Utils/LinkedIn/asyncHandler.js";
import schedule from "node-schedule";
import { format } from "date-fns-tz";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
// Import scheduledJobs from scheduler utility
import { scheduledJobs } from "../../Utils/LinkedIn/scheduler.js";
import { PostgetAnalytics } from "../../services/Linkedinservice/linkedin.service.js";
import PostedContent from "../../models/LinkedIn/PostedContent.js";
import { generateLinkedInPost } from "../../services/Linkedinservice/linkedin.service.js";
import jobPostModel from "../../models/jobPostModel/jobPost.model.js";
import {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} from "../../formatters/globalResponse.js";
import e from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { log } from "util";
import { generateAIResponse } from "../../services/Geminiservices/gemini.service.js";
import { title } from "process";
import oganizationPlan from "../../models/PlanModel/organizationPlan.model.js";
import AICreditRule from "../../models/AiModel/AICreditRuleModel .js";

// Redirect to LinkedIn auth
export const redirectToLinkedIn = asyncHandler(async (req, res) => {
  const { orgId } = req.query;

  const org = await LinkedInOrganization.findById(orgId);

  if (!org) return badRequest(res, "Organization not found");

  const state = orgId;
  const scope = "openid profile email w_member_social w_organization_social";

  const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
    org.linkedinClientId
  }&redirect_uri=${encodeURIComponent(
    org.linkedinRedirectUri
  )}&scope=${encodeURIComponent(scope)}&state=${state}`;

  res.redirect(authURL);
});

// Handle LinkedIn OAuth callback
export const handleCallback = asyncHandler(async (req, res) => {
  const { code, state: orgId } = req.query;

  const org = await LinkedInOrganization.findById(orgId);

  if (!org) {
    return badRequest(res, "Invalid organization or state parameter");
  }

  // Get access token and user info from LinkedIn
  const { accessToken, memberId, name, email, picture,linkedInPages,} =
    await linkedinService.exchangeCodeForToken(org, code);

  // Check for existing LinkedIn account with same name and memberId
  const duplicateOrg = await LinkedInOrganization.findOne({
    linkedinName: name,
  });

  if (duplicateOrg && duplicateOrg._id.toString() !== orgId.toString()) {
    // Duplicate found — do NOT update this org
    // Optionally delete the current org if it's an empty placeholder
    try {
      await LinkedInOrganization.findByIdAndDelete(orgId);
    } catch (err) {
      console.error("Error deleting duplicate organization:", err);
    }

    // res.status(409).json(new ApiResponse(409, null, "LinkedIn account already connected elsewhere"));
    return badRequest(res, "LinkedIn account already connected ");
  }

  // No duplicate found — proceed with update
  org.accessToken = accessToken;
  org.memberId = memberId;
  org.linkedinName = name;
  org.linkedinEmail = email;
  org.linkedinProfilePic = picture;
  org.LinkedInorganizationPages = linkedInPages; // Save pages
  await org.save();

  // res.status(200).json(new ApiResponse(200, null, "LinkedIn connected successfully"));
  res.redirect(`https://hr-portal.fincooperstech.com/employeeSetup/Linkedin`);
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

//         console.log("  Content posted to LinkedIn", result);

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

//   return res.status(200).json(new ApiResponse(200, results, "  Posts processed successfully"));
// });

export const postMultipleContentWithFilesUGC = asyncHandler(
  async (req, res) => {
    const { postIds, orgs, scheduleTimes } = req.body; // "orgs" is now an array of { orgId, scheduleTimes }
    const imageFiles = req.files || [];

    // Input validation
    if (!Array.isArray(postIds) || postIds.length === 0) {
      // throw new ApiError(400, "At least one post ID must be provided");
      return badRequest(res, "At least one post ID must be provided");
    }

    if (!Array.isArray(orgs) || orgs.length === 0) {
      // throw new ApiError(400, "At least one organization must be provided");
      return badRequest(res, "At least one organization must be provided");
    }

    // Fetch drafts
    const drafts = await PostedContent.find({
      _id: { $in: postIds },
      status: "draft",
    });

    if (!drafts.length) {
      // throw new ApiError(404, "No drafts found for the given IDs");
      return badRequest(res, "No drafts found for the given IDs");
    }

    const results = [];

    // Process each organization separately
    await Promise.all(
      orgs.map(async ({ orgId, scheduleTimes }) => {
        const OrganisationId = await LinkedInOrganization.findById(
          orgId
        ).populate({
          path: "organizationId",
          select: "_id",
        });

        // if (!OrganisationId) throw new ApiError(404, `Organization not found: ${orgId}`);

        if (!OrganisationId) {
          return badRequest(res, `Organization not found: ${orgId}`);
        }

        const orgIdFromRef = OrganisationId.organizationId?._id;
        const linkedInOrg = await LinkedInOrganization.findById(orgId);

        if (!linkedInOrg?.accessToken) {
          results.push({
            status: "failed",
            orgId,
            error: "LinkedIn not connected for this organization",
          });
          return;
        }

        let validScheduleTimes = [];
        if (scheduleTimes && Array.isArray(scheduleTimes)) {
          validScheduleTimes = scheduleTimes
            .map((t) => new Date(t))
            .filter((date) => !isNaN(date.getTime()));
        }

        // Process each draft for this org
        await Promise.all(
          drafts.map(async (draft) => {
            const {
              _id: postId,
              message,
              imageUrls,
              jobId,
              mediaFiles,
            } = draft;

            const draftImageFiles = imageFiles.filter(
              (file) => file.fieldname === `draft-${postId.toString()}`
            );

            let combinedMediaFiles = [
              ...(mediaFiles || []),
              ...draftImageFiles,
            ];

            let savedFileInfo = combinedMediaFiles.map((file) => ({
              filename: file.filename || `${uuidv4()}-${file.originalname}`,
              path:
                file.path ||
                path.join(
                  "uploads",
                  "scheduled",
                  `${uuidv4()}-${file.originalname}`
                ),
              mimetype: file.mimetype,
              size: file.size,
            }));

            // Save files concurrently if scheduling
            if (draftImageFiles.length > 0 && validScheduleTimes.length > 0) {
              await Promise.all(
                draftImageFiles.map(async (file) => {
                  const fileInfo = savedFileInfo.find(
                    (f) => f.originalname === file.originalname
                  );
                  await fs.mkdir(path.dirname(fileInfo.path), {
                    recursive: true,
                  });
                  await fs.writeFile(fileInfo.path, file.buffer);
                })
              );
            }

            const postJob = async (scheduledPostId = null) => {
              try {
                let filesToPost = [];

                if (scheduledPostId) {
                  const scheduledPost = await ScheduledPost.findById(
                    scheduledPostId
                  );
                  if (scheduledPost.imageFiles?.length > 0) {
                    filesToPost = await Promise.all(
                      scheduledPost.imageFiles.map(async (fileInfo) => ({
                        buffer: await fs.readFile(fileInfo.path),
                        mimetype: fileInfo.mimetype,
                        originalname: fileInfo.filename,
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

                console.log("  Content posted to LinkedIn", result);

                await PostedContent.findByIdAndUpdate(postId, {
                  $set: {
                    orgId: linkedInOrg._id,
                    status: "posted",
                    linkedinPostId: result.id,
                    organizationId: orgIdFromRef,
                    postedAt: new Date(),
                  },
                });

                if (scheduledPostId) {
                  await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
                    $set: {
                      orgId: linkedInOrg._id,
                      status: "posted",
                      linkedinPostId: result.id,
                      organizationId: orgIdFromRef,
                      postedAt: new Date(),
                    },
                  });

                  const scheduledPost = await ScheduledPost.findById(
                    scheduledPostId
                  );
                  if (scheduledPost.imageFiles?.length > 0) {
                    await Promise.all(
                      scheduledPost.imageFiles.map(async (fileInfo) => {
                        try {
                          await fs.unlink(fileInfo.path);
                        } catch (err) {
                          console.error("Error deleting file:", err);
                        }
                      })
                    );
                  }
                }
                return {
                  status: "success",
                  orgId,
                  postId,
                  result,
                };
              } catch (error) {
                console.error("❌ Error in post:", error);

                await PostedContent.findByIdAndUpdate(postId, {
                  $set: {
                    orgId: linkedInOrg._id,
                    status: "failed",
                    organizationId: orgIdFromRef,
                    error: error.message,
                  },
                });

                if (scheduledPostId) {
                  await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
                    $set: {
                      orgId: linkedInOrg._id,
                      status: "failed",
                      organizationId: orgIdFromRef,
                      error: error.message,
                    },
                  });
                }

                return {
                  status: "failed",
                  orgId,
                  error: error.message,
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
                  jobName,
                });

                const job = schedule.scheduleJob(
                  jobName,
                  scheduleDate,
                  async () => {
                    await postJob(scheduledPost._id);
                    scheduledJobs.delete(jobName);
                  }
                );

                scheduledJobs.set(jobName, job);

                results.push({
                  status: "scheduled",
                  orgId,
                  organizationId: orgIdFromRef,
                  scheduledPostId: scheduledPost._id,
                  jobName,
                  scheduledTime: scheduleDate.toISOString(),
                });
              }
            }
          })
        );
      })
    );

    // return res.status(200).json(new ApiResponse(200, results, "  Posts processed successfully"));
    return success(res, "  Posts processed successfully", results);
  }
);

export const postSingleContentWithFilesUGC = asyncHandler(async (req, res) => {
  const { postType, orgs, message, imageUrls = [] } = req.body;
  const imageFiles = req.files || [];

  if (!message || typeof message !== "string") {
    return badRequest(res, "Message is required");
  }

  if (!Array.isArray(orgs) || orgs.length === 0) {
    return badRequest(res, "At least one organization must be provided");
  }

  const results = [];

  await Promise.all(
    orgs.map(async ({ orgId, scheduleTimes }) => {
      const linkedInOrg = await LinkedInOrganization.findById(orgId).populate(
        "organizationId"
      );

      if (!linkedInOrg) {
        results.push({
          status: "failed",
          orgId,
          error: `Organization not found: ${orgId}`,
        });
        return;
      }

      if (!linkedInOrg?.accessToken) {
        results.push({
          status: "failed",
          orgId,
          error: "LinkedIn not connected for this organization",
        });
        return;
      }

      let validScheduleTimes = [];
      if (Array.isArray(scheduleTimes)) {
        validScheduleTimes = scheduleTimes
          .map((t) => new Date(t))
          .filter((date) => !isNaN(date.getTime()));
      }

      const orgIdFromRef = linkedInOrg.organizationId?._id;
      console.log("📌 orgIdFromRef:", orgIdFromRef);

      const postJob = async (scheduledPostId = null) => {
        try {
          let filesToPost = [];

          if (scheduledPostId) {
            console.log("🕒 Running scheduled post job:", scheduledPostId);
            const scheduledPost = await ScheduledPost.findById(scheduledPostId);
            if (scheduledPost?.imageFiles?.length > 0) {
              filesToPost = await Promise.all(
                scheduledPost.imageFiles.map(async (fileInfo) => {
                  console.log("📂 Reading file:", fileInfo.path);
                  return {
                    buffer: await fs.readFile(fileInfo.path),
                    mimetype: fileInfo.mimetype,
                    originalname: fileInfo.filename,
                  };
                })
              );
            }
          } else {
            filesToPost = [...imageFiles];
          }

          const result = await linkedinService.postToLinkedInWithFilesUGC(
            linkedInOrg,
            message,
            imageUrls,
            filesToPost
          );

          console.log("✅ LinkedIn post success:", result?.id);

          if (scheduledPostId) {
            await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
              $set: {
                orgId: linkedInOrg._id,
                status: "posted",
                linkedinPostId: result.id,
                organizationId: orgIdFromRef,
                postedAt: new Date(),
                postType, // ✅ Add postType to ScheduledPost
              },
            });

            const scheduledPost = await ScheduledPost.findById(scheduledPostId);
            if (scheduledPost.imageFiles?.length > 0) {
              await Promise.all(
                scheduledPost.imageFiles.map(async (fileInfo) => {
                  try {
                    await fs.unlink(fileInfo.path);
                    console.log("🧹 Deleted file:", fileInfo.path);
                  } catch (err) {
                    console.error("Error deleting file:", err);
                  }
                })
              );
            }
          } else {
            const postedContent = await PostedContent.create({
              orgIds: [{ orgId }],
              message,
              imageUrls,
              mediaFiles: imageFiles.map((file) => ({
                filename: file.originalname,
                path: file.path || "",
                mimetype: file.mimetype,
                size: file.size,
              })),
              status: "posted",
              linkedinPostId: result.id,
              organizationId: orgIdFromRef,
              postedAt: new Date(),
              postType, // ✅ Add postType to ScheduledPost
            });

            results.push({
              status: "success",
              orgId,
              postedContentId: postedContent._id,
              result,
            });
            return;
          }

          results.push({
            status: "success",
            orgId,
            result,
          });
        } catch (error) {
          console.error("❌ Error in postJob:", error);
          if (scheduledPostId) {
            await ScheduledPost.findByIdAndUpdate(scheduledPostId, {
              $set: {
                status: "failed",
                error: error.message,
              },
            });
          }

          results.push({
            status: "failed",
            orgId,
            error: error.message || "Failed to post",
          });
        }
      };

      if (validScheduleTimes.length === 0) {
        try {
          await postJob();
        } catch (err) {
          results.push({
            status: "failed",
            orgId,
            error: err.message || "Failed to post immediately",
          });
        }
      } else {
        console.log("⏱ validScheduleTimes:", validScheduleTimes);

        for (const scheduleDate of validScheduleTimes) {
          if (scheduleDate <= new Date()) {
            results.push({
              status: "failed",
              orgId,
              error: `⛔ Schedule time ${scheduleDate.toISOString()} is in the past`,
            });
            continue;
          }

          const jobName = `linkedin-post-${uuidv4()}`;

          const savedFileInfo = imageFiles.map((file) => {
            const uuidName = `${uuidv4()}-${file.originalname}`;
            const absPath = path.join(
              process.cwd(),
              "uploads",
              "scheduled",
              uuidName
            );
            return {
              filename: uuidName,
              path: absPath,
              mimetype: file.mimetype,
              size: file.size,
            };
          });

          await Promise.all(
            imageFiles.map(async (file, i) => {
              await fs.mkdir(path.dirname(savedFileInfo[i].path), {
                recursive: true,
              });
              await fs.writeFile(savedFileInfo[i].path, file.buffer);
              console.log("📥 Saved file:", savedFileInfo[i].path);
            })
          );

          const scheduledPost = await ScheduledPost.create({
            orgIds: [{ orgId }],
            message,
            imageUrls,
            imageFiles: savedFileInfo,
            scheduleTime: scheduleDate,
            organizationId: orgIdFromRef,
            jobName,
            postType, // ✅ Add postType to ScheduledPost
          });

          const job = schedule.scheduleJob(jobName, scheduleDate, async () => {
            console.log("🔔 Scheduled job fired:", jobName);
            await postJob(scheduledPost._id);
            scheduledJobs.delete(jobName);
          });

          if (!job) {
            console.error(`❌ Failed to schedule job for: ${jobName}`);
            await ScheduledPost.findByIdAndUpdate(scheduledPost._id, {
              status: "failed",
              error: "Job scheduling failed. Possibly a past date.",
            });
            continue;
          }

          scheduledJobs.set(jobName, job);

          results.push({
            status: "scheduled",
            orgId,
            organizationId: orgIdFromRef,
            scheduledPostId: scheduledPost._id,
            jobName,
            scheduledTime: scheduleDate.toISOString(),
          });
        }
      }
    })
  );

  return success(res, "Posts processed successfully", results);
});

export const postSingleDraftToAllOrgs = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  const imageFiles = req.files || [];

  // Input validation
  if (!postId) {
    return badRequest(res, "Post ID is required");
  }

  // Fetch draft
  const draft = await PostedContent.findById(postId).where({ status: "draft" });

  if (!draft) {
    return badRequest(res, "Draft not found or already posted");
  }

  const { message, imageUrls, mediaFiles, orgIds, jobId } = draft;

  const results = [];

  // Process each orgId from the draft.orgIds array
  await Promise.all(
    orgIds.map(async ({ orgId }) => {
      const linkedInOrg = await LinkedInOrganization.findById(orgId).populate(
        "organizationId"
      );

      if (!linkedInOrg) {
        results.push({
          status: "failed",
          orgId,
          error: "Organization not found",
        });
        return;
      }

      if (!linkedInOrg.accessToken) {
        results.push({
          status: "failed",
          orgId,
          error: "LinkedIn not connected for this organization",
        });
        return;
      }

      const orgIdFromRef = linkedInOrg.organizationId?._id;

      // Filter files specific to this draft
      const draftImageFiles = imageFiles.filter(
        (file) => file.fieldname === `draft-${postId.toString()}`
      );

      let combinedMediaFiles = [...(mediaFiles || []), ...draftImageFiles];

      let savedFileInfo = combinedMediaFiles.map((file) => ({
        filename: file.filename || `${uuidv4()}-${file.originalname}`,
        path:
          file.path ||
          path.join("uploads", "scheduled", `${uuidv4()}-${file.originalname}`),
        mimetype: file.mimetype,
        size: file.size,
      }));

      // Save files to disk if needed
      if (draftImageFiles.length > 0) {
        await Promise.all(
          draftImageFiles.map(async (file) => {
            const fileInfo = savedFileInfo.find(
              (f) => f.originalname === file.originalname
            );
            await fs.mkdir(path.dirname(fileInfo.path), { recursive: true });
            await fs.writeFile(fileInfo.path, file.buffer);
          })
        );
      }

      // Prepare files for posting
      const filesToPost = await Promise.all(
        savedFileInfo.map(async (fileInfo) => ({
          buffer: await fs.readFile(fileInfo.path),
          mimetype: fileInfo.mimetype,
          originalname: fileInfo.filename,
        }))
      );

      try {
        const result = await linkedinService.postToLinkedInWithFilesUGC(
          linkedInOrg,
          message,
          imageUrls || [],
          filesToPost
        );

        console.log("  Content posted to LinkedIn", result);

        // Update draft with orgId and status
        await PostedContent.findByIdAndUpdate(
          postId,
          {
            $set: {
              status: "posted",
              postedAt: new Date(),
              linkedinPostId: result.id,
            },
          },
          {
            new: true,
          }
        );

        results.push({
          status: "success",
          orgId,
          postId,
          result,
        });
      } catch (error) {
        console.error(`❌ Error posting to org ${orgId}:`, error);

        // Mark this org as failed in the draft
        await PostedContent.findByIdAndUpdate(
          postId,
          {
            $set: {
              status: "failed",
              error: error.message,
            },
          },
          {
            arrayFilters: [{ "elem.orgId": orgId }],
          }
        );

        results.push({
          status: "failed",
          orgId,
          error: error.message,
        });
      }
    })
  );

  return success(res, "  Draft posted to all organizations", results);
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

//           console.log("  Content posted to LinkedIn", result);

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

//   return res.status(200).json(new ApiResponse(200, results, "  Posts processed successfully"));
// });

//cancel schedule Post

export const cancelScheduledPost = asyncHandler(async (req, res) => {
  const { scheduledPostId } = req.params;

  const scheduledPost = await ScheduledPost.findById(scheduledPostId);
  if (!scheduledPost) {
    // throw new ApiError(404, "Scheduled post not found");
    return badRequest(res, "Scheduled post not found");
  }

  if (scheduledPost.status !== "scheduled") {
    // throw new ApiError(400, `Cannot cancel post with status: ${scheduledPost.status}`);
    return badRequest(
      res,
      `Cannot cancel post with status: ${scheduledPost.status}`
    );
  }

  // Cancel the job
  const job = scheduledJobs.get(scheduledPost.jobName);
  if (job) {
    job.cancel();
    scheduledJobs.delete(scheduledPost.jobName);
  }

  // Update status
  scheduledPost.status = "cancelled";
  await scheduledPost.save();

  // Clean up saved files
  if (scheduledPost.imageFiles) {
    for (const fileInfo of scheduledPost.imageFiles) {
      try {
        await fs.unlink(fileInfo.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  }

  // return res.status(200).json(
  //   new ApiResponse(200, scheduledPost, "  Scheduled post cancelled successfully")
  // );

  return success(res, "  Scheduled post cancelled successfully", scheduledPost);
});

// Reschedule post
export const reschedulePost = asyncHandler(async (req, res) => {
  const { scheduledPostId } = req.params;
  const { newScheduleTime } = req.body;

  if (!newScheduleTime) {
    return badRequest(res, "newScheduleTime is required");
  }

  const scheduledPost = await ScheduledPost.findById(scheduledPostId);
  if (!scheduledPost) {
    return badRequest(res, "Scheduled post not found");
  }

  if (scheduledPost.status !== "scheduled") {
    return badRequest(
      res,
      `Cannot reschedule post with status: ${scheduledPost.status}`
    );
  }

  const newScheduleDate = new Date(newScheduleTime);
  if (isNaN(newScheduleDate.getTime())) {
    return badRequest(res, "Invalid newScheduleTime format");
  }

  if (newScheduleDate <= new Date()) {
    return badRequest(res, "New schedule time must be in the future");
  }

  // Cancel existing job if exists
  const jobKey = scheduledPost.jobName || `scheduled-post-${scheduledPost._id}`;
  const existingJob = scheduledJobs.get(jobKey);

  if (existingJob) {
    existingJob.cancel();
  }

  // Create new job
  const job = schedule.scheduleJob(jobKey, newScheduleDate, async () => {
    try {
      // Get the first orgId from the array
      const linkedInOrg = await LinkedInOrganization.findById(
        scheduledPost.orgIds[0]?.orgId
      );
      console.log("linkedInOrg:--");

      if (!linkedInOrg?.accessToken) {
        console.error("LinkedIn not connected for this organization");
        return;
      }

      let filesToPost = [];

      if (scheduledPost.imageFiles && scheduledPost.imageFiles.length > 0) {
        for (const fileInfo of scheduledPost.imageFiles) {
          try {
            const buffer = await fs.readFile(fileInfo.path);
            filesToPost.push({
              buffer,
              mimetype: fileInfo.mimetype,
              originalname: fileInfo.filename,
            });
          } catch (err) {
            console.error(`Failed to read file ${fileInfo.path}:`, err);
            continue;
          }
        }
      }

      const result = await linkedinService.postToLinkedInWithFilesUGC(
        linkedInOrg,
        scheduledPost.message,
        scheduledPost.imageUrls,
        filesToPost
      );

      // Update post status
      scheduledPost.status = "posted";
      scheduledPost.linkedinPostId = result.id;
      scheduledPost.postedAt = new Date();
      await scheduledPost.save();

      // Clean up temp files
      if (scheduledPost.imageFiles?.length > 0) {
        await Promise.all(
          scheduledPost.imageFiles.map(async (fileInfo) => {
            try {
              await fs.unlink(fileInfo.path);
            } catch (err) {
              console.error("Error deleting file:", err);
            }
          })
        );
      }

      scheduledJobs.delete(jobKey);
    } catch (error) {
      console.error("❌ Error during rescheduled post:", error);

      // Mark as failed
      scheduledPost.status = "failed";
      scheduledPost.error = error.message;
      await scheduledPost.save();

      scheduledJobs.delete(jobKey);
    }
  });

  scheduledJobs.set(jobKey, job);

  // Update DB record
  scheduledPost.scheduleTime = newScheduleDate;
  scheduledPost.jobName = jobKey;
  scheduledPost.status = "scheduled";
  await scheduledPost.save();

  const displayTime = format(newScheduleDate, "yyyy-MM-dd'T'HH:mm:ss'Z'", {
    timeZone: "UTC",
  });

  return success(res, `Post rescheduled for ${displayTime}`, {
    scheduledPostId: scheduledPost._id,
    newScheduledTime: displayTime,
    newScheduledTimeISO: newScheduleDate.toISOString(),
  });
});

// Get all  posts
export const getAllPostByorgId = asyncHandler(async (req, res) => {
  const { orgId } = req.query;
  const { status } = req.query;

  const query = {};
  if (orgId) query.orgId = orgId;
  if (status) query.status = status;

  // Fetch and populate scheduled posts
  const scheduledPosts = await ScheduledPost.find(query)
    .populate("orgId", "name")
    .sort({ scheduleTime: 1 });

  // Fetch and populate posted contents
  const postedContents = await PostedContent.find(query)
    .populate("orgId", "name")
    .sort({ postedAt: -1 });

  // return res.status(200).json(
  //   new ApiResponse(200, {
  //     scheduledPosts,
  //     postedContents
  //   }, "  Posts retrieved successfully")
  // );

  return success(res, "  Posts retrieved successfully", {
    scheduledPosts,
    postedContents,
  });
});

//get all Scheduled Posts

export const getAllScheduledPosts = asyncHandler(async (req, res) => {
  const organizationId = req.employee.organizationId;
  const { orgId } = req.query;

  // Validate organizationId
  if (!organizationId) {
    return badRequest(res, "organizationId not found");
  }

  const query = {
    status: "scheduled",
  };

  // Match by main organization
  query.organizationId = new ObjectId(organizationId);

  // Optional: filter by specific LinkedIn org ID
  if (orgId) {
    query.orgIds = {
      $elemMatch: {
        orgId: new ObjectId(orgId),
      },
    };
  }

  const scheduledPosts = await ScheduledPost.find(query)
    .populate({
      path: "orgIds.orgId",
      select: "linkedinName", // only get the name of the LinkedIn org
      model: "LinkedInOrganization",
    })
    .populate({
      path: "organizationId",
      select: "name", // optional: populate main organization name
      model: "Organization",
    })
    .sort({ scheduleTime: 1 });

  return success(res, "Scheduled posts retrieved successfully", scheduledPosts);
});

// Delete posted content from LinkedIn
export const deleteLinkedInPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { orgId } = req.body;

  if (!orgId || !postId) {
    // throw new ApiError(400, "orgId and postId are required");
    return badRequest(res, "orgId and postId are required");
  }

  const org = await LinkedInOrganization.findById(orgId);
  if (!org?.accessToken) {
    // throw new ApiError(403, "LinkedIn not connected for this organization");
    return badRequest(res, "LinkedIn not connected for this organization");
  }

  try {
    console.log("🗑️ Attempting to delete post:", postId);
    console.log("🏢 Organization:", org.name);

    // Try to delete from LinkedIn
    const deleteResult = await linkedinService.deleteLinkedInPost(
      org.accessToken,
      postId
    );

    // Use the full URN in queries
    const urnPostId = `urn:li:share:${postId}`;

    console.log("🔍 Searching for linkedinPostId:", urnPostId);

    // Query using the full URN
    const scheduledPost = await ScheduledPost.findOne({
      linkedinPostId: urnPostId,
    });
    console.log("Found ScheduledPost:", scheduledPost);

    const postedContent = await PostedContent.findOne({
      linkedinPostId: urnPostId,
    });
    console.log("Found PostedContent:", postedContent);

    if (!scheduledPost && !postedContent) {
      return notFound(res, "No matching posts found to delete in database");
      // throw new ApiError(404, "No matching posts found to delete in database");
    }

    let updatedScheduledPost = null;
    if (scheduledPost) {
      updatedScheduledPost = await ScheduledPost.findByIdAndUpdate(
        scheduledPost._id,
        {
          $set: {
            status: "deleted",
            deletedAt: new Date(),
            linkedinPostId: "",
            deleteMethod: deleteResult.method,
          },
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
            status: "deleted",
            deletedAt: new Date(),
            linkedinPostId: "",
            deleteMethod: deleteResult.method,
          },
        },
        { new: false }
      );
    }

    // return res.status(200).json(
    //   new ApiResponse(200, {
    //     deletedPostId: postId,
    //     method: deleteResult.method,
    //     alreadyDeleted: deleteResult.alreadyDeleted || false,
    //     updatedRecord: Boolean(updatedScheduledPost || updatedPostedContent)
    //   }, deleteResult.alreadyDeleted ?
    //     "  Post was already deleted from LinkedIn" :
    //     "  Post deleted from LinkedIn successfully")
    // );

    return success(
      res,
      deleteResult.alreadyDeleted
        ? "  Post was already deleted from LinkedIn"
        : "  Post deleted from LinkedIn successfully",
      {
        deletedPostId: postId,
        method: deleteResult.method,
        alreadyDeleted: deleteResult.alreadyDeleted || false,
        updatedRecord: Boolean(updatedScheduledPost || updatedPostedContent),
      }
    );
  } catch (error) {
    console.error("❌ Failed to delete LinkedIn post:", error);

    // Handle soft-delete locally if LinkedIn says it's already gone
    if (
      error.statusCode === 404 ||
      error.message.includes("already been deleted")
    ) {
      await ScheduledPost.updateMany(
        { linkedinPostId: `urn:li:share:${postId}` },
        {
          $set: {
            status: "deleted",
            deletedAt: new Date(),
            error: "Post already deleted from LinkedIn",
          },
        }
      );

      await PostedContent.updateMany(
        { linkedinPostId: `urn:li:share:${postId}` },
        {
          $set: {
            status: "deleted",
            deletedAt: new Date(),
            error: "Post already deleted from LinkedIn",
          },
        }
      );

      // return res.status(200).json(
      //   new ApiResponse(200, { deletedPostId: postId }, "  Post was already deleted from LinkedIn")
      // );

      return success(res, "  Post was already deleted from LinkedIn", {
        deletedPostId: postId,
      });
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

  if (!organizationId || typeof organizationId !== "string") {
    // throw new ApiError(400, "Valid Organization ID is required");
    return badRequest(res, "Valid Organization ID is required");
  }

  let analytics;
  try {
    analytics = await PostgetAnalytics(organizationId);
  } catch (error) {
    console.error("❌ Error fetching LinkedIn analytics:", error.message);
    return unknownError(res, "Failed to fetch LinkedIn analytics");
    // throw new ApiError(500, "Failed to fetch LinkedIn analytics");
  }

  // return res.status(200).json(
  //   new ApiResponse(200, analytics, "  LinkedIn analytics fetched successfully")
  // );

  return badRequest(
    res,
    "  LinkedIn analytics fetched successfully",
    analytics
  );
});
/// Saved Drafts

// export const saveDraftPost = asyncHandler(async (req, res) => {
//   const jobs = req.body; // Expecting array of job objects
//   const imageFiles = req.files || [];
//   const organizationId = req.employee.organizationId;

//   if (!Array.isArray(jobs) || jobs.length === 0) {
//     return badRequest(res, "Request body must be a non-empty array of jobs");
//   }

//   const results = [];

//   await Promise.all(
//     jobs.map(async (job) => {
//       const { jobId, message, imageUrls, orgs } = job;

//       // Validate required fields
//       if (!jobId || !message) {
//         results.push({
//           jobId,
//           status: "failed",
//           error: "Missing jobId or message",
//         });
//         return;
//       }

//       // Ensure orgs is an array and not empty
//       if (!Array.isArray(orgs) || orgs.length === 0) {
//         results.push({
//           jobId,
//           status: "failed",
//           error: "At least one org must be provided",
//         });
//         return;
//       }

//       // Fetch position from job model
//       const jobData = await jobPostModel.findById(jobId).select("position");
//       if (!jobData) {
//         results.push({
//           jobId,
//           status: "failed",
//           error: "Job not found",
//         });
//         return;
//       }

//       const jobPosition = jobData.position || "Not specified";

//       // Filter files specific to this job
//       const jobImageFiles = imageFiles.filter(
//         (file) => file.fieldname === `draft-${jobId}`
//       );

//       // Prepare orgIds and fetch linkedinNames
//       const orgIds = [];
//       const linkedinAccountNames = [];

//       for (const { orgId } of orgs) {
//         if (!orgId) continue;

//         try {
//           const linkedInOrg = await LinkedInOrganization.findById(orgId);
//           if (linkedInOrg && linkedInOrg.linkedinName) {
//             linkedinAccountNames.push(linkedInOrg.linkedinName);
//           }

//           orgIds.push({ orgId }); // Keep pushing orgId as before
//         } catch (err) {
//           console.error(`Error fetching LinkedIn org for ID ${orgId}:`, err);
//         }
//       }

//       const draftData = {
//         jobId,
//         message,
//         imageUrls: imageUrls || [],
//         position: jobPosition,
//         status: "draft",
//         organizationId,
//         orgIds, // Still using original structure
//         linkedinAccountNames, // ✅ New field added
//       };

//       if (jobImageFiles.length > 0) {
//         draftData.mediaFiles = jobImageFiles.map((file) => ({
//           filename: file.originalname,
//           path: file.path,
//           mimetype: file.mimetype,
//           size: file.size,
//         }));
//       }

//       try {
//         const savedPost = await PostedContent.create(draftData);
//         results.push({
//           jobId,
//           status: "success",
//           data: savedPost,
//         });
//       } catch (err) {
//         console.error(`Error saving draft for job ${jobId}:`, err);
//         results.push({
//           jobId,
//           status: "failed",
//           error: err.message || "Failed to save draft",
//         });
//       }
//     })
//   );

//   return success(res, "Draft posts saved successfully", results);
// });
export const saveDraftPost = asyncHandler(async (req, res) => {
  const jobs = req.body; // Expecting array of job objects
  const imageFiles = req.files || [];
  const organizationId = req.employee.organizationId;

  if (!Array.isArray(jobs)) {
    return badRequest(res, "Request body must be an array of jobs");
  }

  const results = [];

  await Promise.all(
    jobs.map(async (job) => {
      const { jobId, message, imageUrls, orgs, title } = job;

      // Validate only required field: message
      if (!message) {
        results.push({
          jobId: jobId ?? null,
          status: "failed",
          error: "Missing message",
        });
        return;
      }

      let jobPosition = title || "Not specified"; // Default to title or fallback

      // Fetch job position only if jobId is provided
      if (jobId) {
        const jobData = await jobPostModel.findById(jobId).select("position");
        if (!jobData) {
          results.push({
            jobId,
            status: "failed",
            error: "Job not found",
          });
          return;
        }
        jobPosition = jobData.position || "Not specified";
      }

      // Validate orgs only if jobId is provided
      if (!Array.isArray(orgs) || orgs.length === 0) {
        results.push({
          jobId,
          status: "failed",
          error: "At least one org must be provided",
        });
        return;
      }

      // Filter files specific to this job (if jobId is present)
      const jobImageFiles = jobId
        ? imageFiles.filter((file) => file.fieldname === `draft-${jobId}`)
        : [];

      // Prepare orgIds and fetch linkedinNames
      const orgIds = [];
      const linkedinAccountNames = [];

      if (orgs && Array.isArray(orgs)) {
        for (const { orgId } of orgs) {
          if (!orgId) continue;

          try {
            const linkedInOrg = await LinkedInOrganization.findById(orgId);
            if (linkedInOrg?.linkedinName) {
              linkedinAccountNames.push(linkedInOrg.linkedinName);
            }
            orgIds.push({ orgId });
          } catch (err) {
            console.error(`Error fetching LinkedIn org for ID ${orgId}:`, err);
          }
        }
      }

      const draftData = {
        jobId: jobId ?? null,
        message,
        imageUrls: imageUrls || [],
        position: jobPosition, // Can come from job or title
        status: "draft",
        organizationId,
        orgIds,
        linkedinAccountNames,
      };

      if (jobImageFiles.length > 0) {
        draftData.mediaFiles = jobImageFiles.map((file) => ({
          filename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
        }));
      }

      try {
        const savedPost = await PostedContent.create(draftData);
        results.push({
          jobId: jobId ?? null,
          status: "success",
          data: savedPost,
        });
      } catch (err) {
        console.error(`Error saving draft for job ${jobId ?? "N/A"}:`, err);
        results.push({
          jobId: jobId ?? null,
          status: "failed",
          error: err.message || "Failed to save draft",
        });
      }
    })
  );

  return success(res, "Draft posts saved successfully", results);
});

// Edit the draft

export const editDraftPost = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const { message, imageUrls } = req.body;
  const imageFiles = req.files || [];

  // Fetch the draft
  const draft = await PostedContent.findOne({ _id: draftId, status: "draft" });

  if (!draft) {
    // throw new ApiError(404, "Draft post not found or already published");
    return badRequest(res, "Draft post not found or already published");
  }

  // Update fields
  if (message !== undefined) draft.message = message;
  if (imageUrls !== undefined) draft.imageUrls = imageUrls;

  // Handle file uploads if any
  if (imageFiles.length > 0) {
    draft.mediaFiles = imageFiles.map((file) => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));
  }

  await draft.save();

  // return res.status(200).json(
  //   new ApiResponse(200, draft, "  Draft post updated successfully")
  // );

  return success(res, "  Draft post updated successfully", draft);
});

//getDraftPosts
export const getDraftPosts = asyncHandler(async (req, res) => {
  const organizationId = req.employee.organizationId;

  const draftPosts = await PostedContent.find({
    status: "draft",
    organizationId: new ObjectId(organizationId),
  })
    .populate({
      path: "orgIds.orgId",
      select: "linkedinName", // only get the name of the LinkedIn org
      model: "LinkedInOrganization",
    })
    .sort({ createdAt: -1 });

  // return res.status(200).json(
  //   new ApiResponse(200, draftPosts, "  Draft posts fetched successfully")
  // );
  return success(res, "  Draft posts fetched successfully", draftPosts);
});

export const deleteDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;

  if (!draftId) {
    return badRequest(res, "Draft ID is required");
  }

  // Find and delete the draft by ID and status 'draft'
  const deletedDraft = await PostedContent.findOneAndDelete({
    _id: draftId,
    status: "draft",
  });

  if (!deletedDraft) {
    return badRequest(res, "Draft not found or already published");
  }

  return success(res, "  Draft deleted successfully", deletedDraft);
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
  const organizationId = req.employee?.organizationId;

  if (!jobIds || typeof jobIds !== "string") {
    // throw new ApiError(400, "Job IDs must be provided as comma-separated string");
    return badRequest(
      res,
      "Job IDs must be provided as comma-separated string"
    );
  }

  const jobIdList = jobIds.split(",").map((id) => id.trim());

  if (jobIdList.length === 0) {
    // throw new ApiError(400, "At least one job ID must be provided");
    return badRequest(res, "At least one job ID must be provided");
  }

  // Fetch all job positions
  const jobPositionDocs = await jobPostModel
    .find({ _id: { $in: jobIdList } })
    .select("position");
  if (!jobPositionDocs || jobPositionDocs.length === 0) {
    // throw new ApiError(404, "No job found.");
    return badRequest(res, "No job found.");
  }

  const positions = jobPositionDocs.map((doc) => doc.position).filter(Boolean);
  const mainJobId = jobIdList[0];

  const activePlan = await oganizationPlan
    .findOne({ organizationId: organizationId, isActive: true })
    .lean();
  if (!activePlan) {
    return badRequest(res, "no active plan found for this Analizer.");
  }

  if (
    !(activePlan.NumberofAnalizers > 0) &&
    !(activePlan.addNumberOfAnalizers > 0)
  ) {
    return badRequest(
      res,
      "AI limit reached for this organization. Please upgrade your plan."
    );
  }

  const jobData = await jobPostModel
    .findById(mainJobId)
    .populate(
      "departmentId subDepartmentId employmentTypeId Worklocation qualificationId package jobDescriptionId organizationId"
    );

  if (!jobData) {
    // throw new ApiError(404, "Main job not found.");
    return badRequest(res, "Main job not found.");
  }

  /* 1.  Create a PostedContent document in “processing” state */
  const cacheDoc = await PostedContent.create({
    jobId: mainJobId,
    organizationId: jobData.organizationId?._id,
    position: positions.length === 1 ? positions[0] : "Multiple Positions",
  });

  /* 2.  Send early response so gateway never times out */
  // res.status(202).json({
  //   message: 'Post generation started. Please wait while we fetch and process the data.',
  //   id: cacheDoc._id.toString(),
  //   status: 'processing'
  // });

  success(res, "created", {
    message:
      "Post generation started. Please wait while we fetch and process the data.",
    id: cacheDoc._id.toString(),
    status: "processing",
  });

  /* 3.  Heavy work happens after the response */
  generateLinkedInPost(positions, jobData)
    .then(async (post) => {
      await PostedContent.findByIdAndUpdate(
        cacheDoc._id,
        {
          message: post.postText,
          imageUrls: post.templates.map((t) => t.imageUrl),
          status: "ready",
        },
        { new: true }
      );
      console.log(`[PostGen] completed for ${cacheDoc._id}`);
    })
    .catch(async (err) => {
      console.error("[PostGen] failed:", err);
      await PostedContent.findByIdAndUpdate(cacheDoc._id, { status: "failed" });
    });
});

export const getPostGenStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await PostedContent.findById(id).lean();
  const organizationId = req.employee?.organizationId;

  const activePlan = await oganizationPlan
    .findOne({ organizationId: organizationId, isActive: true })
    .lean();
  if (!activePlan) {
    return badRequest(res, "no active plan found for this Analizer.");
  }

  if (
    !(activePlan.NumberofAnalizers > 0) &&
    !(activePlan.addNumberOfAnalizers > 0)
  ) {
    return badRequest(
      res,
      "AI limit reached for this organization. Please upgrade your plan."
    );
  }

  // if (!doc) throw new ApiError(404, 'Generation task not found');
  if (!doc) {
    return badRequest(res, "Generation task not found");
  }

  // 202 until ready, 200 when done
  const httpCode = doc.status === "ready" ? 200 : 202;
  success(res, "AI-generated message retrieved successfully.", doc);
  // res.status(httpCode).json(doc);

  const CreditRules = await AICreditRule.findOne({
    actionType: "LINKEDIN_AI",
  });

  // if (!CreditRules) {
  //   return badRequest(res, "No credit rule found for DESIGNATION_AI");
  // }

  const creditsNeeded = CreditRules.creditsRequired || 1;

  // Update candidate with AI screening result
  if (activePlan.NumberofAnalizers > 0) {
    const Updateservice = await oganizationPlan.findOneAndUpdate(
      { organizationId: organizationId },
      { $inc: { NumberofAnalizers: -creditsNeeded } }, // Decrement the count
      { new: true }
    );
  }

  // If main is 0, try to decrement from addNumberOfAnalizers
  else if (activePlan.addNumberOfAnalizers > 0) {
    await oganizationPlan.findOneAndUpdate(
      { organizationId: organizationId },
      { $inc: { addNumberOfAnalizers: -creditsNeeded } },
      { new: true }
    );
  } else {
    return badRequest(
      res,
      "AI limit reached for this organization. Please upgrade your plan."
    );
  }
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

// Ai generate post data for other posting

export const generateLinkedotherInPost = async (req, res) => {
  try {
    const { title } = req.query;
    const organizationId = req.employee?.organizationId;

    const activePlan = await oganizationPlan
      .findOne({ organizationId: organizationId, isActive: true })
      .lean();
    if (!activePlan) {
      return badRequest(res, "no active plan found for this Analizer.");
    }

    if (
      !(activePlan.NumberofAnalizers > 0) &&
      !(activePlan.addNumberOfAnalizers > 0)
    ) {
      return badRequest(
        res,
        "AI limit reached for this organization. Please upgrade your plan."
      );
    }

    // Validate input
    if (!title || typeof title !== "string") {
      return badRequest(res, "A valid title is required.");
    }

    if (!organizationId) {
      return badRequest(res, "Organization ID is missing from the request.");
    }

    // Fetch organization by ID
    const organization = await Organization.findById(organizationId).select(
      "name"
    );

    if (!organization) {
      return notFound(res, "Organization not found.");
    }

    const organizationName = organization.name;

    // Enhanced Prompt - Ask for PLAIN TEXT only
    const prompt = `
    Generate a professional LinkedIn post based on this title: "${title}"

    This post is for ${organizationName}, a leading company in its field. 
    Make sure the tone is professional, engaging, and suitable for sharing on LinkedIn. 

    Include:
    - Relevant hashtags (e.g., #hiring, #techjobs, etc.)
    - Emojis where appropriate
    - Highlight the value or impact of the topic

    Return ONLY the post content as plain text. Do NOT wrap it in JSON, markdown, or include any extra explanation.
    `;

    // Get AI-generated content
    const aiResponse = await generateAIResponse(prompt);

    let postContent = "";

    if (typeof aiResponse === "string") {
      try {
        const parsed = JSON.parse(aiResponse);
        postContent = parsed.text || aiResponse; // Fallback to raw string if no .text
      } catch (e) {
        postContent = aiResponse; // Already plain text
      }
    } else if (aiResponse && typeof aiResponse.text === "string") {
      postContent = aiResponse.text;
    } else {
      postContent = "Post could not be generated.";
    }

    // Return success response
    success(res, "LinkedIn post generated successfully.", {
      message: postContent,
    });

    const CreditRules = await AICreditRule.findOne({
      actionType: "LINKEDIN_AI",
    });

    // if (!CreditRules) {
    //   return badRequest(res, "No credit rule found for DESIGNATION_AI");
    // }

    const creditsNeeded = CreditRules.creditsRequired || 1;

    // Update candidate with AI screening result
    if (activePlan.NumberofAnalizers > 0) {
      const Updateservice = await oganizationPlan.findOneAndUpdate(
        { organizationId: organizationId },
        { $inc: { NumberofAnalizers: -creditsNeeded } }, // Decrement the count
        { new: true }
      );
    }

    // If main is 0, try to decrement from addNumberOfAnalizers
    else if (activePlan.addNumberOfAnalizers > 0) {
      await oganizationPlan.findOneAndUpdate(
        { organizationId: organizationId },
        { $inc: { addNumberOfAnalizers: -creditsNeeded } },
        { new: true }
      );
    } else {
      return badRequest(
        res,
        "AI limit reached for this organization. Please upgrade your plan."
      );
    }
  } catch (error) {
    console.error("Error generating LinkedIn post:", error);
    return unknownError(res);
  }
};
