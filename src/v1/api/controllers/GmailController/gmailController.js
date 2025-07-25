import {
  badRequest,
  success,
  unknownError,
} from "../../formatters/globalResponse.js";
import { google } from "googleapis";
import { sendGmail } from "../../services/sendEmail/sendEmailservice.js";
import User from "../../models/UserEmail/user.js";
import Email from "../../models/UserEmail/sentEmails.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const sendMail = async (req, res) => {
  const { to, subject, message, userId, file } = req.body;

  // Use file upload (req.file) or file URL from body (file)
  const filePath = req.file?.path || file || null;
  const normalizedPath = filePath?.replace(/\\/g, "/"); // Normalize backslashes on Windows

  const organizationId = req.employee.organizationId;

  if (!userId) return badRequest(res, "userId is required");

  try {
    const user = await User.findById(userId);
    if (!user?.refreshToken) return badRequest(res, "Unauthorized");

    // Setup OAuth2 client
    // const oAuth2Client = new google.auth.OAuth2(
    //   '59791320328-i1d74g3tv6iqoq0jd1ij2krv7r1u4rgl.apps.googleusercontent.com',
    //   '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',
    //   'http://localhost:4000/api/google/callback'
    // );

    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      `${process.env.BASE_URI}/v1/api/google/callback`
    );
    // "872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com",
    // "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",
    // "https://hrms-api.fincooperstech.com/v1/api/google/callback"

    oAuth2Client.setCredentials({ refresh_token: user.refreshToken });
    const { token } = await oAuth2Client.getAccessToken();

    // Send email with attachment (URL or local path)
    await sendGmail(token, to, subject, message, normalizedPath);

    // Save email info in DB
    const emailDoc = new Email({
      userId,
      to,
      subject,
      message,
      organizationId,
      filePath: normalizedPath || null,
      sentAt: new Date(),
    });

    await emailDoc.save();

    return success(res, "Email sent successfully!");
  } catch (err) {
    console.error("SendMail Error:", err);
    return unknownError(res, "Failed to send email", err);
  }
};

export const sendMailHelper = async (mailData) => {
  // Destructure the data directly from the passed object
  const { to, subject, message, userId, organizationId, file } = mailData;

  const filePath = file || null;
  const normalizedPath = filePath?.replace(/\\/g, "/") || null;

  // Throw errors instead of calling badRequest(res, ...)
  if (!userId) throw new Error("userId is required to send an email.");
  if (!to || !subject)
    throw new Error("'to' and 'subject' fields are required.");

  try {
    const user = await User.findById(userId);
    if (!user?.refreshToken) {
      throw new Error("User is not authorized or is missing a refresh token.");
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      `${process.env.BASE_URI}/v1/api/google/callback`
    );

    // "872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com",
    // "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",
    // "https://hrms-api.fincooperstech.com/v1/api/google/callback"

    oAuth2Client.setCredentials({ refresh_token: user.refreshToken });
    const { token } = await oAuth2Client.getAccessToken();

    const data = await sendGmail(token, to, subject, message, normalizedPath);
    console.log("data" , data)

    const emailDoc = new Email({
      userId,
      to,
      subject,
      message,
      organizationId,
      filePath: normalizedPath,
      sentAt: new Date(),
    });

    await emailDoc.save();

    // The helper function doesn't send a response. It just returns on success.
    return true;
  } catch (err) {
    console.error("sendMailHelper Error:", err.message);
    // Re-throw the error so the calling controller can handle it
    throw err;
  }
};
// get all users

export const getAllUsers = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    const users = await User.find({ organizationId }).select(
      "_id displayName email accessToken organizationId isDefault"
    );

    return success(res, "Users fetched successfully", users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return unknownError(res, "Failed to fetch users", error);
  }
};

// disconnect account

export const disconnectGoogleAccount = async (req, res) => {
  // const organizationId = req.employee.organizationId;

  const { userId } = req.params;

  if (!userId) return badRequest(res, "userId is required");

  try {
    const user = await User.findById(userId);
    if (!user) return badRequest(res, "User not found");

    user.accessToken = "";
    user.refreshToken = "";
    await user.save();

    return success(res, "Google account disconnected successfully");
  } catch (error) {
    console.error("Disconnect Error:", error);
    return unknownError(res, "Failed to disconnect Google account", err);
  }
};

// export const setDefaultEmail = async (req, res) => {
//   try {
//     const { emailId } = req.params;
//     const userOrgId = req.employee.organizationId;

//     const targetEmail = await User.findOne({
//       _id: new ObjectId(emailId),
//       organizationId: userOrgId,
//     });

//     // If the target email doesn't exist or doesn't belong to the user's org, return an error.
//     if (!targetEmail) {
//       return badRequest(res, "Email not found in your organization.");
//     }

//     // If the target email is already the default, there's nothing to do.
//     if (targetEmail.isDefault) {
//       return success(res, "This email is already set as the default.", targetEmail);
//     }

//     // 2. Unset any previous default email for the organization.
//     // Using updateMany is a safe approach that handles potential edge cases
//     // where more than one email might have been marked as default.
//     await User.updateMany(
//       { organizationId: userOrgId, isDefault: true },
//       { $set: { isDefault: false } }
//     );

//     // 3. Set the target email as the new default and save it.
//     targetEmail.isDefault = true;
//     await targetEmail.save();

//     return success(res, "Default email has been updated successfully.", targetEmail);

//   } catch (err) {
//     console.error("Error in setDefaultEmail:", err);
//     return unknownError(res);
//   }
// };

export const setDefaultEmail = async (req, res) => {
  try {
    const { emailId } = req.params;
    const userOrgId = req.employee.organizationId;

    const targetEmail = await User.findOne({
      _id: new ObjectId(emailId),
      organizationId: userOrgId,
    });

    if (!targetEmail) {
      return badRequest(res, "Email not found in your organization.");
    }

    if (targetEmail.isDefault) {
      targetEmail.isDefault = false;
      await targetEmail.save();
      return success(res, "Default email has been removed.", targetEmail);
    } else {
      await User.updateMany(
        { organizationId: new ObjectId(userOrgId), isDefault: true },
        { $set: { isDefault: false } }
      );

      // Then, set the target email as the new default.
      targetEmail.isDefault = true;
      await targetEmail.save();
      return success(
        res,
        "Default email has been updated successfully.",
        targetEmail
      );
    }
  } catch (err) {
    console.error("Error in toggleDefaultEmail:", err);
    return unknownError(res);
  }
};
