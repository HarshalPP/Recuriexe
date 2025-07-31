import axios from "axios";
import fs from "fs/promises";
import path from "path";
import PostedContent from "../../models/Social Media/PostedContent.js";
import ScheduledPost from "../../models/Social Media/ScheduledPost.js";
import SocialMediaAccount from "../../models/Social Media/SocialMediaAccount.js";
import schedule from "node-schedule";

const FACEBOOK_API_VERSION = "v23.0";
const INSTAGRAM_API_VERSION = "v14.0";

// Post to Facebook

async function postToFacebook(account, message, imageUrl) {
  const endpoint = imageUrl ? "photos" : "feed";
  const apiUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${account.facebookPageId}/${endpoint}`;

  const params = new URLSearchParams();
  params.append("message", message);
  params.append("access_token", account.facebookPageAccessToken);

  if (imageUrl && endpoint === "photos") {
    params.append("url", imageUrl); // Must be public, HTTPS image URL
  }

  try {
    const response = await axios.post(apiUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log("Facebook API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Facebook API error response:", error.response?.data || error.message);
    throw error;
  }
}



// async function postToFacebook(account, message, imageUrl) {
//   const FACEBOOK_API_VERSION = "v17.0"; // Update as needed

//   // Determine the endpoint based on whether media is provided
//   const endpoint = imageUrl ? "photos" : "feed";
//   const url = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${account.facebookPageId}/${endpoint}`;

//   console.log("url:-", url);

//   try {
//     if (imageUrl) {
//       const response = await axios.post(
//         url,
//         new URLSearchParams({
//           image_url: imageUrl,
//           message,
//           access_token: account.accessToken,
//         }),
//         {
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         }
//       );

//       return response.data;
//     } else {
//       // For text-only posts, use URLSearchParams
//       const response = await axios.post(
//         url,
//         new URLSearchParams({
//           message,
//           access_token: account.accessToken,
//         }),
//         {
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         }
//       );

//       return response.data;
//     }
//   } catch (error) {
//     console.error("[postToFacebook][ERROR]", error.message);
//     throw error; // Re-throw the error for higher-level handling
//   }
// }

// Post to Instagram

async function postToInstagram(account, caption, mediaUrl) {  
  const uploadUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${account.igAccountId}/media`;
  const publishUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${account.igAccountId}/media_publish`;

  
  const uploadResponse = await axios.post(
    uploadUrl,
    new URLSearchParams({
      image_url: mediaUrl,
      caption,
      access_token: account.accessToken,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const creationId = uploadResponse.data.id;
  

  const publishResponse = await axios.post(
    publishUrl,
    new URLSearchParams({
      creation_id: creationId,
      access_token: account.accessToken,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return publishResponse.data;
}

// Post to Instagram using Instagram Login
async function postToInstagramDirect(account, caption, mediaUrl) {
  try {
    const { userId, accessToken } = account;

    if (!userId || !accessToken) {
      throw new Error("Invalid Instagram account details");
    }

    // Step 1: Upload Media
    const uploadUrl = `https://graph.instagram.com/${INSTAGRAM_API_VERSION}/${userId}/media`;

    const uploadResponse = await axios.post(
      uploadUrl,
      new URLSearchParams({
        image_url: mediaUrl,
        caption,
        access_token: accessToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const creationId = uploadResponse.data.id;

    // Step 2: Publish Media
    const publishUrl = `https://graph.instagram.com/${INSTAGRAM_API_VERSION}/${userId}/media_publish`;

    console.log("publishUrl",publishUrl);
    

    const publishResponse = await axios.post(
      publishUrl,
      new URLSearchParams({
        creation_id: creationId,
        access_token: accessToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("publishResponse.data",publishResponse.data);
    
    return publishResponse.data;
  } catch (error) {
    console.error("Failed to post to Instagram:", error.message);
    throw error;
  }
}

// Save posted content
async function savePostedContent(
  platform,
  accountId,
  message,
  mediaUrls,
  mediaFiles,
  fbPostId,
  igMediaId,
  userId,
  fbAccName,
  igAccName,
  organizationId,
) {
  return PostedContent.create({
    message,
    mediaUrls,
    mediaFiles: mediaFiles.map((f) => ({
      filename: f.filename,
      path: f.path,
      mimetype: f.mimetype,
      size: f.size,
    })),
    platforms: [platform],
    status: "posted",
    postedAt: new Date(),
    facebookPostId: fbPostId,
    instagramMediaId: igMediaId,
    userId,
    accountId,
    facebookPageName: fbAccName,
    instagramAccountName: igAccName,
    organizationId:organizationId,
  });
}

// // Schedule a new post
// async function scheduleNewPost(
//   platform,
//   accountId,
//   message,
//   mediaUrls,
//   files,
//   scheduleTime,
//   userId,
//   fbAccName,
//   igAccName
// ) {
//   const jobName = `social-post-${Date.now()}`;
//   const tempFilePaths = [];

//   if (files.length > 0) {
//     for (const file of files) {
//       const uuidName = `${Date.now()}-${file.originalname}`;
//       const filePath = path.join(
//         process.cwd(),
//         "uploads",
//         "scheduled",
//         uuidName
//       );
//       await fs.mkdir(path.dirname(filePath), { recursive: true });
//       await fs.writeFile(filePath, file.buffer);
//       tempFilePaths.push({
//         filename: file.originalname,
//         path: filePath,
//         mimetype: file.mimetype,
//         size: file.size,
//       });
//     }
//   }

//   const scheduledPost = await ScheduledPost.create({
//     platform,
//     accountId,
//     message,
//     mediaUrls,
//     mediaFiles: tempFilePaths,
//     scheduleTime,
//     status: "scheduled",
//     jobName,
//     userId,
//     facebookPageName: fbAccName,
//     instagramAccountName: igAccName,
//   });

//   return scheduledPost;
// }

// // Execute scheduled post
// async function executeScheduledPost(scheduledPost) {
//   const { _id, platform, accountId, message, mediaUrls, mediaFiles } =
//     scheduledPost;
//   let result = null,
//     fbPostId = null,
//     igMediaId = null;

//   try {
//     const account = await SocialMediaAccount.findById(accountId);
//     if (!account || !account.accessToken) throw new Error("Invalid account");

//     if (platform === "facebook_page") {
//       result = await postToFacebook(account, message, mediaUrls[0]);
//       fbPostId = result.id;
//     } else if (platform === "instagram_business") {
//       result = await postToInstagram(account, message, mediaUrls[0]);
//       igMediaId = result.id;
//     }

//     await savePostedContent(
//       platform,
//       accountId,
//       message,
//       mediaUrls,
//       mediaFiles,
//       fbPostId,
//       igMediaId,
//       _id
//     );

//     await ScheduledPost.findByIdAndUpdate(_id, {
//       status: "posted",
//       resultId: fbPostId || igMediaId,
//       postedAt: new Date(),
//     });

//     // Delete temp files
//     if (mediaFiles?.length) {
//       await Promise.all(
//         mediaFiles.map(async (f) => {
//           try {
//             await fs.unlink(f.path);
//           } catch (err) {
//             console.error("Error deleting file:", err);
//           }
//         })
//       );
//     }
//   } catch (error) {
//     console.error("Failed to execute scheduled post:", error.message);
//     await ScheduledPost.findByIdAndUpdate(_id, {
//       status: "failed",
//       error: error.message,
//     });
//   }
// }

const scheduledJobs = new Map(); // To store job references by scheduledPostId

// Schedule a new post (can be scheduled at multiple times)
async function scheduleNewPost(
  platform,
  accountId,
  message,
  mediaUrls,
  files,
  scheduleTimes, // Array of Date strings or Date objects
  userId,
  fbAccName,
  igAccName,
  organizationId,
) {
  const tempFilePaths = [];

  if (files.length > 0) {
    for (const file of files) {
      const uuidName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "scheduled",
        uuidName
      );
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.buffer);
      tempFilePaths.push({
        filename: file.originalname,
        path: filePath,
        mimetype: file.mimetype,
        size: file.size,
      });
    }
  }

  // Save the scheduled post to DB first (with placeholders for jobs)
  const scheduledPost = await ScheduledPost.create({
    platform,
    accountId,
    message,
    mediaUrls,
    mediaFiles: tempFilePaths,
    scheduleTimes: scheduleTimes.map((t) => new Date(t)),
    status: "scheduled",
    jobNames: [],
    scheduleStatuses: scheduleTimes.map((t) => ({
      time: new Date(t),
      status: "pending",
    })),
    userId,
    facebookPageName: fbAccName,
    instagramAccountName: igAccName,
    organizationId: organizationId,
  });

  const jobNames = [];

  for (const time of scheduleTimes) {
    const validTime = new Date(time);
    if (isNaN(validTime)) {
      console.warn(`Invalid schedule time skipped: ${time}`);
      continue;
    }

    const jobName = `social-post-${scheduledPost._id}-${Date.now()}`;

    const job = schedule.scheduleJob(jobName, validTime, async () => {
      console.log(`Running scheduled post: ${scheduledPost._id} at ${validTime}`);
      try {
        await executeScheduledPost(scheduledPost._id, validTime);
      } catch (err) {
        console.error(`Failed in scheduled job ${jobName}:`, err.message);
      }
    });

    jobNames.push(jobName);
    scheduledJobs.set(`${scheduledPost._id}-${jobName}`, job);
    console.log(`Scheduled job ${jobName} for post ${scheduledPost._id} at ${validTime}`);
  }

  scheduledPost.jobNames = jobNames;
  await scheduledPost.save();

  return scheduledPost;
}

// Execute scheduled post
// async function executeScheduledPost(scheduledPostId, scheduledTime) {
//   const scheduledPost = await ScheduledPost.findById(scheduledPostId);
//   if (!scheduledPost) return;

//   // Find the index of the scheduled time in scheduleStatuses
//   const index = scheduledPost.scheduleStatuses.findIndex(
//     (status) => status.time.getTime() === new Date(scheduledTime).getTime()
//   );

//   if (index === -1) {
//     console.warn(`Scheduled time not found for post ${scheduledPostId}`);
//     return;
//   }

//   const { platform, accountId, message, mediaUrls, mediaFiles } = scheduledPost;

//   let result = null,
//     fbPostId = null,
//     igMediaId = null;
    

//   try {
//     const account = await SocialMediaAccount.findById(accountId);
//     if (!account || !account.accessToken) throw new Error("Invalid account");

//     if (platform === "facebook_page") {
//       result = await postToFacebook(account, message, mediaUrls[0]);
//       fbPostId = result.id;
//     } else if (platform === "instagram_business") {
//       result = await postToInstagram(account, message, mediaUrls[0]);
//       igMediaId = result.id;
//     }

//     await savePostedContent(
//       platform,
//       accountId,
//       message,
//       mediaUrls,
//       mediaFiles,
//       fbPostId,
//       igMediaId,
//       scheduledPost.userId
//     );

//     // Update the status of the specific scheduled time
//     scheduledPost.scheduleStatuses[index].status = "posted";
//     scheduledPost.updatedAt = new Date();

//     // If all scheduled times are posted, update the overall status
//     if (
//       scheduledPost.scheduleStatuses.every(
//         (status) => status.status === "posted"
//       )
//     ) {
//       scheduledPost.status = "posted";
//       scheduledPost.postedAt = new Date();
//     }

//     await scheduledPost.save();

//     // Delete temp files
//     if (mediaFiles?.length) {
//       await Promise.all(
//         mediaFiles.map(async (f) => {
//           try {
//             await fs.unlink(f.path);
//           } catch (err) {
//             console.error("Error deleting file:", err);
//           }
//         })
//       );
//     }

//     // Remove all job references from memory
//     scheduledPost.jobNames.forEach((jobName) => {
//       scheduledJobs.delete(`${scheduledPostId}-${jobName}`);
//     });
//   } catch (error) {
//     console.error("Failed to execute scheduled post:", error.message);

//     // Update the status of the specific scheduled time to "failed"
//     scheduledPost.scheduleStatuses[index].status = "failed";
//     scheduledPost.scheduleStatuses[index].error = error.message;
//     scheduledPost.updatedAt = new Date();

//     await scheduledPost.save();
//   }
// }


async function executeScheduledPost(scheduledPostId, scheduledTime) {
  const scheduledPost = await ScheduledPost.findById(scheduledPostId);
  if (!scheduledPost) return;

  const index = scheduledPost.scheduleStatuses.findIndex(
    (status) => new Date(status.time).getTime() === new Date(scheduledTime).getTime()
  );

  if (index === -1) {
    console.warn(`Scheduled time not found for post ${scheduledPostId}`);
    return;
  }

  const {
    platform,
    accountId,
    message,
    mediaUrls,
    mediaFiles,
  } = scheduledPost;

  let result = null,
      fbPostId = null,
      igMediaId = null;

  try {
    const account = await SocialMediaAccount.findById(accountId);
    if (!account || !account.accessToken) {
      throw new Error("Invalid or disconnected social media account");
    }

    if (platform === "facebook_page") {
      result = await postToFacebook(account, message, mediaUrls[0]);
      fbPostId = result.id;
    } else if (platform === "instagram_business") {
      result = await postToInstagram(account, message, mediaUrls[0]);
      igMediaId = result.id;
    } else if (platform === "instagram_basic") {
      result = await postToInstagramDirect(account, message, mediaUrls[0]);
      igMediaId = result.id;
    }

    await savePostedContent(
      platform,
      accountId,
      message,
      mediaUrls,
      mediaFiles,
      fbPostId,
      igMediaId,
      scheduledPost.userId
    );

    scheduledPost.scheduleStatuses[index].status = "posted";
    scheduledPost.updatedAt = new Date();

    const allPosted = scheduledPost.scheduleStatuses.every(
      (status) => status.status === "posted"
    );
    if (allPosted) {
      scheduledPost.status = "posted";
      scheduledPost.postedAt = new Date();
    }

    await scheduledPost.save();

    // Clean up media files 
    if (mediaFiles?.length > 0) {
      for (const f of mediaFiles) {
        try {
          await fs.unlink(f.path);
        } catch (err) {
          console.error("Error deleting file:", err.message);
        }
      }
    }

    // Clear job references from memory
    scheduledPost.jobNames.forEach((jobName) => {
      scheduledJobs.delete(`${scheduledPostId}-${jobName}`);
    });

  } catch (error) {
    console.error("Failed to execute scheduled post:", error.message);

    scheduledPost.scheduleStatuses[index].status = "failed";
    scheduledPost.scheduleStatuses[index].error = error.message;
    scheduledPost.updatedAt = new Date();

    await scheduledPost.save();
  }
}


// Rehydrate existing scheduled jobs on server restart
async function restoreScheduledJobs() {
  const pendingPosts = await ScheduledPost.find({ status: "scheduled" });

  for (const post of pendingPosts) {
    const jobId = post._id.toString();

    for (let i = 0; i < post.scheduleTimes.length; i++) {
      const scheduleTime = post.scheduleTimes[i];
      const jobName = post.jobNames[i];

      // Check if the scheduled time has already been posted
      if (post.scheduleStatuses[i].status === "posted") continue;

      if (new Date(scheduleTime) <= new Date()) {
        // Already due, run immediately
        console.log(`Executing overdue post: ${jobId} at ${scheduleTime}`);
        await executeScheduledPost(jobId, scheduleTime);
      } else {
        // Schedule again
        const job = schedule.scheduleJob(jobName, scheduleTime, async () => {
          await executeScheduledPost(jobId, scheduleTime);
        });

        scheduledJobs.set(`${jobId}-${jobName}`, job);
        console.log(`Restored scheduled post: ${jobId} at ${scheduleTime}`);
      }
    }
  }
}


export {
  postToFacebook,
  postToInstagram,
  savePostedContent,
  scheduleNewPost,
  executeScheduledPost,
  postToInstagramDirect,
  restoreScheduledJobs,
};





