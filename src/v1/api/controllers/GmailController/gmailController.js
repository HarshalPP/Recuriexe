import {badRequest, success, unknownError } from "../../formatters/globalResponse.js";
import { google } from 'googleapis';
import  {sendGmail}  from '../../services/sendEmail/sendEmailservice.js';
import User from '../../models/UserEmail/user.js';
import Email from '../../models/UserEmail/sentEmails.js'; 
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const sendMail = async (req, res) => {
  const { to, subject, message, userId, file } = req.body;

  // Use file upload (req.file) or file URL from body (file)
  const filePath = req.file?.path || file || null;
  const normalizedPath = filePath?.replace(/\\/g, '/'); // Normalize backslashes on Windows

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
      '872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com',
      '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',
      'https://hrms-api.fincooperstech.com/v1/api/google/callback'
    );

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
      sentAt: new Date()
    });
    

    await emailDoc.save();

    return success(res, "Email sent successfully!");
  } catch (err) {
    console.error("SendMail Error:", err);
    return unknownError(res, "Failed to send email", err);
  }
};


// get all users 

export const getAllUsers = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    const users = await User.find({ organizationId })
      .select('_id displayName email accessToken organizationId'); 

    return success(res, "Users fetched successfully", users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return unknownError(res, "Failed to fetch users", error); 
  }
};

// disconnect account

export const disconnectGoogleAccount = async (req, res) => {
  // const organizationId = req.employee.organizationId;

  const { userId } = req.params;

  if (!userId) return  badRequest(res, "userId is required");

  try {
    const user = await User.findById(userId);
    if (!user) return  badRequest(res, "User not found");

    user.accessToken = '';
    user.refreshToken = '';
    await user.save();

    return success(res, "Google account disconnected successfully");
  } catch (error) {
    console.error('Disconnect Error:', error);
     return unknownError(res, "Failed to disconnect Google account", err);
  }
};


export const setDefaultEmail = async (req, res) => {
  try {
    const { emailId } = req.params;
    const userOrgId = req.employee.organizationId;;

    const targetEmail = await User.findOne({ _id: new ObjectId(emailId) , organizationId: userOrgId });
    if (!targetEmail) return badRequest(res, "Email not found");

    const currentDefault = await User.findOne({ organizationId: userOrgId, isDefault: true });

    // // Case 1: Already default
    // if (currentDefault && currentDefault._id.toString() === emailId) {
    //   return success(res, "Already set as default", targetEmail);
    // }

    // Case 2: Another default exists, send conflict
    if (currentDefault) {
      return success(res, "Conflict: another default exists", {
        conflict: true,
        currentDefault: {
          _id: currentDefault._id,
          email: currentDefault.email,
        }
      });
    }

    // Case 3: No conflict, set as default
    targetEmail.isDefault = true;
    await targetEmail.save();
    return success(res, "Default email set successfully", targetEmail);

  } catch (err) {
    console.error("Error in setDefaultEmail:", err);
    return unknownError(res);
  }
};

export const forceSetDefaultEmail = async (req, res) => {
  try {
    const { emailId } = req.params;
    const userOrgId = req.employee.organizationId;;

    const targetEmail = await User.findOne({ _id: emailId, organizationId: userOrgId });
    if (!targetEmail) return badRequest(res, "Email not found");

    // Unset any previous default
    await User.updateMany(
      { organizationId: userOrgId },
      { $set: { isDefault: false } }
    );

    // Set new default
    targetEmail.isDefault = true;
    await targetEmail.save();

    return success(res, "Default email updated", targetEmail);

  } catch (err) {
    console.error("Error in forceSetDefaultEmail:", err);
    return unknownError(res);
  }
};


