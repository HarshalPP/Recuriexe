import axios from 'axios';
import qs from 'qs';
import {ApiError} from '../../Utils/LinkedIn/ApiError.js';
import PostedContent from '../../models/LinkedIn/PostedContent.js';
import ScheduledPost from '../../models/LinkedIn/ScheduledPost.js';
// linkedinPostService.js
import { generateAIResponse } from '../Geminiservices/gemini.service.js';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import pLimit from 'p-limit';

import { handleSingleFileUpload, handleMultipleFileUpload } from "../../services/uploadservices/upload.service.js"
import { log } from 'console';
import { badRequest, unknownError } from '../../formatters/globalResponse.js';


// export const exchangeCodeForToken = async (org, code) => {
//   try {
//     const tokenRes = await axios.post(
//       'https://www.linkedin.com/oauth/v2/accessToken',
//       qs.stringify({
//         grant_type: 'authorization_code',
//         code,
//         redirect_uri: org.linkedinRedirectUri,
//         client_id: org.linkedinClientId,
//         client_secret: org.linkedinClientSecret,
//       }),
//       {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       }
//     );
    

//     const accessToken = tokenRes.data.access_token;
    
//     const userInfoRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });

//     console.log("userInfoRes:--",userInfoRes);
    

//     return { accessToken, memberId: userInfoRes.data.sub };
//   } catch (error) {
//     console.error('Error exchanging code for token:', error.response?.data || error.message);
//     throw new ApiError(500, 'Failed to exchange authorization code for token');
//   }
// };

export const exchangeCodeForToken = async (org, code) => {
  try {
    // Step 1: Get Access Token
    const tokenRes = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken', 
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: org.linkedinRedirectUri,
        client_id: org.linkedinClientId,
        client_secret: org.linkedinClientSecret,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Step 2: Get User Profile Info
    const userInfoRes = await axios.get('https://api.linkedin.com/v2/userinfo',  {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });

    const userData = userInfoRes.data;

    // Extract name, email, and profile picture
    const name = `${userData.given_name} ${userData.family_name}`.trim() || userData.name || 'Unknown';
    const email = userData.email || '';
    
    let picture = '';
    if (userData.picture) {
      picture = userData.picture; // From OpenID Connect standard claim
    } else if (userData.profilePicture && userData.profilePicture.displayImageURLWithFocalPoint) {
      picture = userData.profilePicture.displayImageURLWithFocalPoint; // Fallback
    }
        // Step 3: Get organizations where the user has administrative access
    // const orgsRes = await axios.get(
    //   'https://api.linkedin.com/rest/organizationalEntityAcls',
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       'X-Restli-Protocol-Version': '2.0.0',
    //       'LinkedIn-Version': '202402',
    //     },
    //   }
    // );

    // const linkedInPages = orgsRes.data.elements.map(el => ({
    //   id: el.organizationUrn.split(':').pop(), // Extract numeric ID
    //   urn: el.organizationUrn,
    //   role: el.role,
    //   isPrimary: el.isPrimary,
    // }));

    return {
      accessToken,
      memberId: userData.sub, // Unique user ID from LinkedIn
      name,
      email,
      picture,
      // linkedInPages
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    return badRequest(res , "Failed to exchange authorization code for token")
    // throw new ApiError(500, 'Failed to exchange authorization code for token');
  }
};

export const uploadImageToLinkedIn = async (accessToken, authorUrn, imageUrl) => {
  try {
    // Step 1: Initialize upload
    const initializeUploadRes = await axios.post(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    const uploadUrl = initializeUploadRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = initializeUploadRes.data.value.asset;

    // Step 2: Download image from URL
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    // Step 3: Upload image binary to LinkedIn
    await axios.post(uploadUrl, imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });

    return asset; // This is the media URN to use in the post
  } catch (error) {
    console.error('Error uploading image to LinkedIn:', error.response?.data || error.message);
    return unknownError(res , "Internal server error")
    // throw new ApiError(500, 'Failed to upload image to LinkedIn');
  }
};

export const postToLinkedIn = async (org, message, imageUrls = []) => {
  try {
    const author = `urn:li:person:${org.memberId}`;
    
    // Build the post body
    const postBody = {
      author: author,
      commentary: message,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };

    // Upload images to LinkedIn first if provided
    if (imageUrls && imageUrls.length > 0) {
      console.log('Uploading images to LinkedIn...');
      const mediaAssets = [];
      
      for (const imageUrl of imageUrls) {
        try {
          const mediaUrn = await uploadImageToLinkedIn(org.accessToken, author, imageUrl);
          mediaAssets.push(mediaUrn);
        } catch (error) {
          console.error(`Failed to upload image ${imageUrl}:`, error.message);
        }
      }

      if (mediaAssets.length > 0) {
        // Correct media structure for LinkedIn API
        postBody.content = {
          media: mediaAssets.map(asset => ({
            id: asset  // Use 'id' instead of 'media'
          }))
        };
      }
    }

    console.log('Posting to LinkedIn with body:', JSON.stringify(postBody, null, 2));

    const response = await axios.post(
      'https://api.linkedin.com/v2/posts',
      postBody,
      {
        headers: {
          'Authorization': `Bearer ${org.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401'
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error posting to LinkedIn:', error.response?.data || error.message);
    return unknownError(res , 'Failed to post content to LinkedIn')
    // throw new ApiError(500, 'Failed to post content to LinkedIn');
  }
};

// Alternative approach using UGC Posts API (if the above doesn't work)
export const postToLinkedInUGC = async (org, message, imageUrls = []) => {
  try {
        console.log('rog;;---',org)

    console.log(`org.memberId:-${org.memberId}`);

    const author = `urn:li:person:${org.memberId}`;
    
    // Build the post body for UGC API
    const postBody = {
      author: author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: message
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    // Upload images if provided
    if (imageUrls && imageUrls.length > 0) {
      console.log('Uploading images to LinkedIn...');
      const mediaAssets = [];
      
      for (const imageUrl of imageUrls) {
        try {
          const mediaUrn = await uploadImageToLinkedIn(org.accessToken, author, imageUrl);
          mediaAssets.push({
            status: "READY",
            description: {
              text: "Image"
            },
            media: mediaUrn,
            title: {
              text: "Image"
            }
          });
        } catch (error) {
          console.error(`Failed to upload image ${imageUrl}:`, error.message);
        }
      }

      if (mediaAssets.length > 0) {
        postBody.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = "IMAGE";
        postBody.specificContent["com.linkedin.ugc.ShareContent"].media = mediaAssets;
      }
    }

    console.log('Posting to LinkedIn UGC with body:', JSON.stringify(postBody, null, 2));

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postBody,
      {
        headers: {
          'Authorization': `Bearer ${org.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error posting to LinkedIn UGC:', error.response?.data || error.message);
    throw new ApiError(500, 'Failed to post content to LinkedIn');
  }
};

// Function to post as organization (company page)
export const postToLinkedInAsOrganization = async (org, message, imageUrls = []) => {
  try {
    const orgUrn = `urn:li:organization:${org.LinkedInorganizationPages.id}`;
    
    const postBody = {
      author: orgUrn,
      commentary: message,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };

    // Upload images to LinkedIn first if provided
    if (imageUrls && imageUrls.length > 0) {
      console.log('Uploading images to LinkedIn for organization...');
      const mediaAssets = [];
      
      for (const imageUrl of imageUrls) {
        try {
          const mediaUrn = await uploadImageToLinkedIn(org.accessToken, orgUrn, imageUrl);
          mediaAssets.push(mediaUrn);
        } catch (error) {
          console.error(`Failed to upload image ${imageUrl}:`, error.message);
        }
      }

      if (mediaAssets.length > 0) {
        postBody.content = {
          media: mediaAssets.map(asset => ({
            id: asset  // Use 'id' instead of 'media'
          }))
        };
      }
    }

    const response = await axios.post(
      'https://api.linkedin.com/v2/posts',
      postBody,
      {
        headers: {
          'Authorization': `Bearer ${org.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401'
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error posting to LinkedIn as organization:', error.response?.data || error.message);
    return unknownError(res  , "Failed to post content to LinkedIn as organization")
    // throw new ApiError(500, 'Failed to post content to LinkedIn as organization');
  }
};

// Add this new function to linkedin.service.js
export const uploadImageBufferToLinkedIn = async (accessToken, authorUrn, imageBuffer, mimeType) => {
  try {
    // Step 1: Register the upload
    const initializeUploadRes = await axios.post(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    const uploadUrl = initializeUploadRes.data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
    const asset = initializeUploadRes.data.value.asset;

    // Step 2: Upload the image buffer
    await axios.post(uploadUrl, imageBuffer, {
      headers: {
        "Content-Type": mimeType,
      },
    });

    return asset; // Return the media URN
  } catch (error) {
    console.error("Error uploading image buffer to LinkedIn:", error.response?.data || error.message);
    return unknownError(res ,  "Failed to upload image to LinkedIn")
    // throw new ApiError(500, "Failed to upload image to LinkedIn");
  }
};

// Update the postToLinkedIn function to handle both URLs and file buffers
export const postToLinkedInWithFilesUGC = async (org, message, imageUrls = [], imageFiles = []) => {
  try {
    
    const author = `urn:li:person:${org.memberId}`; // Author URN for the authenticated user

    console.log("author:--",author);
    
    // Build the base post body for UGC API
    const postBody = {
      author: author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: message, // The message content of the post
          },
          shareMediaCategory: "NONE", // Default to no media
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC", // Post visibility
      },
    };

    const mediaAssets = [];

    // **Step 1: Upload Local Files to LinkedIn**
    if (imageFiles && imageFiles.length > 0) {
      console.log("Uploading local images to LinkedIn...");
      for (const file of imageFiles) {
        try {
          const mediaUrn = await uploadImageBufferToLinkedIn(
            org.accessToken,
            author,
            file.buffer,
            file.mimetype
          );
          mediaAssets.push({
            status: "READY",
            description: {
              text: "Uploaded image",
            },
            media: mediaUrn,
            title: {
              text: file.originalname || "Image",
            },
          });
        } catch (error) {
          console.error(`Failed to upload image file ${file.originalname}:`, error.message);
        }
      }
    }

    // **Step 2: Upload Images from URLs**
    if (imageUrls && imageUrls.length > 0) {
      console.log("Uploading images from URLs to LinkedIn...");
      for (const imageUrl of imageUrls) {
        try {
          const mediaUrn = await uploadImageToLinkedIn(org.accessToken, author, imageUrl);
          mediaAssets.push({
            status: "READY",
            description: {
              text: "Uploaded image",
            },
            media: mediaUrn,
            title: {
              text: "Image",
            },
          });
        } catch (error) {
          console.error(`Failed to upload image URL ${imageUrl}:`, error.message);
        }
      }
    }

    // **Step 3: Add Media to Post Body**
    if (mediaAssets.length > 0) {
      postBody.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = "IMAGE";
      postBody.specificContent["com.linkedin.ugc.ShareContent"].media = mediaAssets;
    }

    console.log("Posting to LinkedIn UGC with body:", JSON.stringify(postBody, null, 2));

    // **Step 4: Post Content to LinkedIn**
    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      postBody,
      {
        headers: {
          Authorization: `Bearer ${org.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    return response.data; // Return the LinkedIn response
  } catch (error) {
    console.error("Error posting to LinkedIn UGC:", error.response?.data || error.message);
    // return unknownError(res , "Failed to post content to LinkedIn")
    throw new ApiError(500, "Failed to post content to LinkedIn");
  }
};

// linkedin.service.js - Updated delete function
export const deleteLinkedInPost = async (accessToken, postId) => {
  try {
    // Format the post ID correctly - LinkedIn expects full URN format
    let formattedPostId = postId;
    
    // If postId is just numeric, convert to full URN format
    if (/^\d+$/.test(postId)) {
      formattedPostId = `urn:li:share:${postId}`;
    }
    
    // Remove LinkedIn-Version header as it's causing 426 error
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json'
    };

    // Use v2 API endpoint instead of REST endpoint
    const url = `https://api.linkedin.com/v2/shares/${encodeURIComponent(formattedPostId)}`;
    
    console.log('🗑️ Attempting to delete LinkedIn post:', formattedPostId);
    console.log('🔗 Delete URL:', url);
    
    const response = await axios.delete(url, { headers });
    
    console.log('✅ Post deleted successfully from LinkedIn');
    return response.data;
    
  } catch (error) {
    console.error('❌ Error deleting LinkedIn post:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      postId: postId
    });
    
    // Handle specific LinkedIn API errors
    if (error.response?.status === 404) {
      throw new ApiError(404, 'Post not found on LinkedIn. It may have already been deleted.');
    } else if (error.response?.status === 403) {
      throw new ApiError(403, 'Insufficient permissions to delete this post. Check your LinkedIn app permissions.');
    } else if (error.response?.status === 401) {
      throw new ApiError(401, 'LinkedIn access token is invalid or expired.');
    } else if (error.response?.status === 426) {
      throw new ApiError(426, 'LinkedIn API version issue. Please contact support.');
    } else {
      throw new ApiError(500, `Failed to delete post from LinkedIn: ${error.response?.data?.message || error.message}`);
    }
  }
};

export const PostgetAnalytics = async (organizationId) => {
  try {
    // Count scheduled posts
    const scheduledPostsCount = await ScheduledPost.countDocuments({
      organizationId,
      status: 'scheduled'
    });

    // Define today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Count published posts today
    const publishedTodayCount = await PostedContent.countDocuments({
      organizationId,
      status: 'posted',
      postedAt: { $gte: todayStart, $lte: todayEnd }
    });

    // Count failed posts
    const failedPostsCount = await PostedContent.countDocuments({
      organizationId,
      status: 'failed'
    });

    return {
      scheduledPosts: scheduledPostsCount,
      publishedToday: publishedTodayCount,
      failedPosts: failedPostsCount
    };
  } catch (error) {
    console.error('Error fetching LinkedIn analytics:', error);
    throw new Error('Failed to fetch LinkedIn analytics');
  }
};
 
//Generate Conent for Linkedin Posting 

// export const generateLinkedInPost = async (jobData) => {
//   // Helper to safely access nested properties
//   const safeAccess = (obj, ...props) =>
//     props.reduce((acc, prop) => (acc && acc[prop] !== undefined ? acc[prop] : null), obj);

//   // Extract values with fallbacks
//   const position = jobData.position || "Not specified";

//   const department = safeAccess(jobData, 'department', 'name');
//   const subDepartment = safeAccess(jobData, 'subDepartment', 'name');

//   const employmentType = safeAccess(jobData, 'employmentType', 'title') || "On-site";
//   const location = jobData.Worklocation.name;

//   const experience = jobData.experience || "Not specified";

//   const qualifications = Array.isArray(jobData.qualificationId)
//     ? jobData.qualificationId.map(q => q.name || "").filter(Boolean).join(", ")
//     : "Not specified";

//   const gender = jobData.gender || "Not specified";
//   const ageLimit = jobData.AgeLimit || "No Limit";
//   const noOfPosition = jobData.noOfPosition || 0;

//   const keySkills = jobData.jobDescriptionId.jobDescription.KeySkills;

//   const responsibilities = jobData.jobDescriptionId.jobDescription.RolesAndResponsibilities;

//   const jobDescription = jobData.jobDescriptionId.jobDescription.JobSummary;

//   const organizationName = jobData?.organizationId?.name ?? "Your organisation Name";

//   const organizationEmail = jobData?.organizationId?.website ?? "Your organisation Website";

//   const ContactEmail = jobData?.organizationId?.contactEmail ?? "Your contactEmail";

//   // Build prompt for Gemini API
//   const prompt = `
// Generate a LinkedIn job post using the following details:

// - **Job Title**: ${position}
// - **Department**: ${department || "Admin"} / ${subDepartment || "Office Management"}
// - **Employment Type**: ${employmentType}
// - **Location**: ${location}
// - **Experience Required**: ${experience}
// - **Qualification**: ${qualifications}
// - **Gender Preference**: ${gender}
// - **Age Limit**: ${ageLimit}
// - **Positions Available**: ${noOfPosition}
// - **Job Summary**: ${jobDescription}
// - **Key Skills**: ${keySkills.slice(0, 5).join(', ') || "Various skills"}
// - **Key Responsibilities**: ${responsibilities.slice(0, 3).join(', ') || "General duties"}
// - **OrganizationName**: ${organizationName}
// - **OrganizationEmail**: ${organizationEmail}
// - **ContactEmail**: ${ContactEmail}


// **Style Guidelines**:
// - Use emojis (🚨, 📍, 🧑‍💻, ⚡, 🔹, 📩).
// - Bold headings for sections (e.g., "📍 Location").
// - Bullet points for skills/responsibilities.
// - Add a professional yet engaging tone.
// - End with relevant hashtags (e.g., #HiringNow, #${position.replace(/\s+/g, '')}, #${location}).

// Return the final post as a JSON object like:
// {
//   "post": "🚨 We're Hiring!..."
// }
// `;

//   const response = await generateAIResponse(prompt);
//   return response.post || response.text || "Failed to generate post.";
// };


const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Template rendering setup
const TEMPLATE_DIR = path.join(process.cwd(), 'src', 'v1', 'api', 'templates', 'linkedInTemplate');
const templateCache = {};

// Concurrency limit: 1 concurrent image generation at a time
const renderLimit = pLimit(1);

let browser = null;

 async function renderTemplate(templateName, data) {
  if (!templateCache[templateName]) {
    const filePath = path.join(TEMPLATE_DIR, `${templateName}.html`);
    const source = fs.readFileSync(filePath, 'utf-8');
    templateCache[templateName] = handlebars.compile(source, { strict: true });
  }
  return templateCache[templateName](data);
}

// Init Puppeteer with reconnect logic
 async function initBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

// Convert HTML to image with error handling and cleanup
 async function convertHtmlToImage(html, options = {}) {
  const {
    width = 800,
    height = 600,
    format = 'png',
    quality = 100,
    fullPage = false,
    deviceScaleFactor = 2,
  } = options;

  let page;

  try {
    const browserInstance = await initBrowser();
    page = await browserInstance.newPage();

    await page.setViewport({
      width: parseInt(width),
      height: parseInt(height),
      deviceScaleFactor: parseInt(deviceScaleFactor),
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const screenshotOptions = { type: format, fullPage };
    if (format === 'jpeg') screenshotOptions.quality = parseInt(quality);
    if (!fullPage) {
      screenshotOptions.clip = {
        x: 0,
        y: 0,
        width: parseInt(width),
        height: parseInt(height),
      };
    }

    const imageBuffer = await page.screenshot(screenshotOptions);
    return imageBuffer;
  } catch (err) {
    console.error('Error converting HTML to image:', err.message);
    throw err;
  } finally {
    if (page) {
      await page.close().catch(console.error); // Safely close page
    }
  }
}

 async function generateTemplateImage(templateId, templateData) {
  const templateName = `template-${templateId}`;

  try {
    const html = await renderTemplate(templateName, templateData);

    // Run under concurrency limit
    const imageBuffer = await renderLimit(() => convertHtmlToImage(html));

    const uploadResult = await handleSingleFileUpload({
      buffer: imageBuffer,
      originalname: `linkedin_post_template_${templateId}_${Date.now()}.png`,
      mimetype: 'image/png'
    }, 'HRMS/IMAGE');

    return {
      templateId,
      imageUrl: uploadResult
    };
  } catch (error) {
    console.error(`Error generating template-${templateId}:`, error.message);
    return {
      templateId,
      error: error.message
    };
  }
}

// export const generateLinkedInPost = async (jobData) => {
//   console.log("Job Data:", jobData);  

//   const safeAccess = (obj, ...props) =>
//     props.reduce((acc, prop) => (acc && acc[prop] !== undefined ? acc[prop] : null), obj);

//   // --- Extract Job Data ---
//   const position = jobData.position || "Not specified";
//   const department = safeAccess(jobData, 'department', 'name') || "Admin";
//   const subDepartment = safeAccess(jobData, 'subDepartment', 'name') || "Office Management";
//   const employmentType = safeAccess(jobData, 'employmentType', 'title') || "On-site";
//   const location = jobData.Worklocation?.name || "Remote";
//   const experience = jobData.experience || "Not specified";

//   const qualifications = Array.isArray(jobData.qualificationId)
//     ? jobData.qualificationId.map(q => q.name || "").filter(Boolean).join(", ")
//     : "Not specified";

//   const gender = jobData.gender || "Not specified";
//   const ageLimit = jobData.AgeLimit || "No Limit";
//   const noOfPosition = jobData.noOfPosition || 0;

//   const keySkills = jobData.jobDescriptionId?.jobDescription?.KeySkills || [];
//   const responsibilities = jobData.jobDescriptionId?.jobDescription?.RolesAndResponsibilities || [];
//   const jobDescription = jobData.jobDescriptionId?.jobDescription?.JobSummary || "";

//   const organizationName = jobData?.organizationId?.name ?? "Your organisation Name";
//   const organizationWebsite = jobData?.organizationId?.website ?? "https://example.com";     
//   const contactEmail = jobData?.organizationId?.contactEmail ?? "contact@example.com";
//   const carrierlink = jobData?.organizationId?.carrierlink ?? "";
//   const logo = jobData?.organizationId?.logo ?? "Logo_URI";
//   const addressLine1 = jobData?.organizationId?.addressLine1 ?? "address";

//   // --- Step 1: Generate Post Text via AI ---
//   const prompt = `
//   Generate a LinkedIn job post using the following details:
//   - **Job Title**: ${position}
//   - **Department**: ${department} / ${subDepartment}
//   - **Employment Type**: ${employmentType}
//   - **Location**: ${location}
//   - **Experience Required**: ${experience}
//   - **Qualification**: ${qualifications}
//   - **Gender Preference**: ${gender}
//   - **Age Limit**: ${ageLimit}
//   - **Positions Available**: ${noOfPosition}
//   - **Job Summary**: ${jobDescription}
//   - **Key Skills**: ${keySkills.slice(0, 5).join(', ') || "Various skills"}
//   - **Key Responsibilities**: ${responsibilities.slice(0, 3).join(', ') || "General duties"}
//   - **OrganizationName**: ${organizationName}
//   - **organizationWebsite**: ${organizationWebsite}
//   - **ContactEmail**: ${contactEmail}
//   - **carrierlink**: ${carrierlink}
//   - **Address**: ${addressLine1}

//   **Style Guidelines**:
//   - Use emojis (🚨, 📍, 🧑‍💻, ⚡, 🔹, 📩).
//   - Bold headings for sections.
//   - Bullet points for skills/responsibilities.
//   - Professional yet engaging tone.
//   - End with relevant hashtags.
  
//   Return the final post as a JSON object like:
//   {
//     "post": "🚨 We're Hiring!..."
//   }
//   `;

//   const aiResponse = await generateAIResponse(prompt);
//   const postText = aiResponse.post || aiResponse.text || "Failed to generate post.";

//   // --- Step 2: Prepare Template Data ---
//   const templateData = {
//     jobTitle: position,
//     openPositions: [position],
//     contactEmail,
//     carrierlink,
//     postContent: postText,
//     position,
//     department,
//     subDepartment,
//     employmentType,
//     location,
//     experience,
//     qualifications,
//     gender,
//     ageLimit,
//     noOfPosition,
//     jobDescription,
//     keySkills: keySkills.slice(0, 5),
//     responsibilities: responsibilities.slice(0, 3),
//     organizationName,
//     organizationWebsite,
//     logo,
//     addressLine1,
//   };

//   // --- Step 3: Generate All Templates in Parallel ---
//   const templateIds = [1, 2, 3, 4, 5];
//   const templatePromises = templateIds.map(id => generateTemplateImage(id, templateData));

//   const results = await Promise.all(templatePromises);

//   return {
//     postText,
//     templates: results
//   };
// };

export const generateLinkedInPost = async (positions, jobData) => {
  console.log("positions",positions);
  
  const safeAccess = (obj, ...props) =>
    props.reduce((acc, prop) => (acc && acc[prop] !== undefined ? acc[prop] : null), obj);

  // --- Extract Job Data from main job ---
  const position = jobData.position || "Not specified";
  const department = safeAccess(jobData, 'department', 'name') || "Admin";
  const subDepartment = safeAccess(jobData, 'subDepartment', 'name') || "Office Management";
  const employmentType = safeAccess(jobData, 'employmentType', 'title') || "On-site";
  const location = jobData.Worklocation?.name || "";
  const experience = jobData.experience || "Not specified";
const qualifications = Array.isArray(jobData.qualificationId)
  ? jobData.qualificationId
      .map(q => q.name || "")
      .filter(Boolean)
  : [];

  const gender = jobData.gender || "Not specified";
  const ageLimit = jobData.AgeLimit || "No Limit";
  const noOfPosition = jobData.noOfPosition || 0;

  const keySkills = jobData.jobDescriptionId?.jobDescription?.KeySkills || [];
  const responsibilities = jobData.jobDescriptionId?.jobDescription?.RolesAndResponsibilities || [];
  const jobDescription = jobData.jobDescriptionId?.jobDescription?.JobSummary || "";

  const organizationName = jobData?.organizationId?.name ?? "Your organisation Name";
  const organizationWebsite = jobData?.organizationId?.website ?? "https://example.com";        
  const contactEmail = jobData?.organizationId?.contactEmail ?? "contact@example.com";
  const carrierlink = jobData?.organizationId?.carrierlink ?? "";
  const logo = jobData?.organizationId?.logo ?? "Logo_URI";
  const addressLine1 = jobData?.organizationId?.addressLine1 ?? "address";

  // Format position list
  let positionText = '';
  if (positions.length === 1) {
    positionText = `as a ${positions[0]}`;
  } else {
    positionText = 'for Multiple Roles:\n' +
      positions.map((pos, index) => `• Position ${index + 1}: ${pos}`).join('\n');
  }

  console.log("carrierlink-----",carrierlink);
  
  // Build prompt
    const prompt = `
    Generate a LinkedIn job post using the following job data. 
    Return the response **only as a string** of LinkedIn-friendly post content. 

    Job Data:
    Company: ${organizationName}
    Position(s): ${positions.join(', ')}
    Location: ${location}
    Experience Required: ${experience}
    Employment Type: ${employmentType}
    Department: ${department}
    Careers Link: ${carrierlink }

    Key Skills:
    ${keySkills.slice(0, 8).map(skill => `• ${skill}`).join('\n')}

    Return only the LinkedIn post string. Do not return any JSON object.
    `;

  console.log(prompt);
  

let postText = "Failed to generate post.";

try {
  const aiResponse = await generateAIResponse(prompt);
  console.log("Raw AI Response:", aiResponse);

  if (!aiResponse) {
    throw new Error("Empty AI response");
  }

  if (typeof aiResponse === 'string') {
    postText = aiResponse;
  } else if (aiResponse.post || aiResponse.text) {
    postText = aiResponse.post || aiResponse.text;
  } else {
    throw new Error("Invalid AI response structure");
  }
} catch (err) {
  console.error("AI Generation Failed:", err.message);
}
  // Prepare template data dynamically
  const templateData = {
    jobTitle: positions.length == 1 ? positions[0] : "Multiple Positions",
    openPositions: positions,
    // position: positions[0] || "Job Position", // <-- Add this line
    contactEmail,
    carrierlink,
    postContent: postText,
    department,
    subDepartment,
    employmentType,
    location,
    experience,
    qualifications: qualifications.slice(0, 5),
    keySkills: keySkills.slice(0, 5),
    responsibilities: responsibilities.slice(0, 3),
    organizationName,
    organizationWebsite,
    logo,
    addressLine1
  };

  // Add dynamic position fields if multiple
  if (positions.length > 1) {
    positions.forEach((pos, idx) => {
      templateData[`position${idx + 1}`] = pos;
    });
  } else {
    templateData.position = positions[0];
  }

  console.log("templateData",templateData);
  

  // Generate templates
  const templateIds = [1, 2, 3, 4, 5];
  const templatePromises = templateIds.map(id => generateTemplateImage(id, templateData));

  const results = await Promise.all(templatePromises);

  return {
    postText,
    templates: results
  };
};