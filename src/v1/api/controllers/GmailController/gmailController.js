import {badRequest, success, unknownError } from "../../formatters/globalResponse.js";
import { google } from 'googleapis';
import  {sendGmail}  from '../../services/sendEmail/sendEmailservice.js';
import User from '../../models/UserEmail/user.js';
import Email from '../../models/UserEmail/sentEmails.js'; 

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
    const oAuth2Client = new google.auth.OAuth2(
      '59791320328-i1d74g3tv6iqoq0jd1ij2krv7r1u4rgl.apps.googleusercontent.com',
      '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',
      'http://localhost:4000/api/google/callback'
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




