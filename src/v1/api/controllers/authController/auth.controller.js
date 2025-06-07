import User from "../../models/AuthModel/auth.model.js"
import crypto from 'crypto'
import { sendToken } from "../../Utils/genToken.js"
import { sendEmail } from "../../Utils/sendEmail.js"
import { generateToken, verifyToken } from "../../config/jwt.js"
import jwt from 'jsonwebtoken'
import { generateScreeningPrompt } from "../../prompt/resumeprompt.js"
import { generateAIScreening } from "../../services/Geminiservices/gemini.service.js"
import aiModel from "../../models/AiModel/ai.model.js"
import {
  success,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  serverValidation,
  unknownError,
  validation,
  alreadyExist,
  sendResponse,
  invalid,
  onError
} from "../../../../../src/v1/api/formatters/globalResponse.js"
import mongoose from "mongoose"

const generateResetPasswordToken = () => {
  return crypto.randomBytes(20).toString("hex");
};


const sendVerificationEmail = async (user) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const tokendata = token

  const verificationLink = `https://hrms-api.fincooperstech.com/v1/api/Auth/verifyemail/${token}`;

  const html = `
  <!DOCTYPE html>
  <html>
  +
  <head>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f7;
              margin: 0;
              padding: 0;
          }
          .email-container {
              background-color: #ffffff;
              width: 90%;
              max-width: 600px;
              margin: 30px auto;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
              border: 1px solid #e0e0e0;
          }
          .email-header {
              background-color: #1a73e8;
              padding: 20px;
              text-align: center;
              color: white;
          }
          .email-body {
              padding: 30px;
              color: #333333;
              line-height: 1.6;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin-top: 20px;
              background-color:rgb(95, 232, 26);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
              color: white;

          }
          .email-footer {
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #888888;
          }
          .highlight {
              color: #1a73e8;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="email-header">
              <h1>Email Verification</h1>
          </div>
          <div class="email-body">
              <p>Hi <strong>${user.userName || 'User'}</strong>,</p>

              <p>Thank you for signing up with <span class="highlight">Fincoopers Portal</span>!</p>

              <p>Please verify your email address to activate your account. Click the button below to confirm your email:</p>

              <a href="${verificationLink}" 
   class="button" 
   style="
      display: inline-block;
      padding: 12px 25px;
      margin-top: 20px;
      background-color: rgb(95, 232, 26);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
   ">
   Verify Email
</a>


              <p>If you didn’t sign up for an account, you can ignore this email.</p>

              <p>
                Thanks,<br>
                <strong>Best regards</strong><br>
                HR Department<br>
                <a href="mailto:hr@fincoopers.com">hr@fincoopers.com</a>
              </p>
          </div>
          <div class="email-footer">
              &copy; ${new Date().getFullYear()} NY Elizabeth. All rights reserved.
          </div>
      </div>
  </body>
  </html>
  `;

  await sendEmail({
    to: user.email,
    subject: "✅ Verify Your Email",
    html
  });
};

// Register User //
export const register = async (req, res, next) => {
  try {
    const { email, password, userName, resume, mobileNumber } = req.body;

    if (!email || !password || !userName) {
      return badRequest(res, 'Email, password, and username are required.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return badRequest(res, 'User already exists.');
    }


    const existingUserName = await User.findOne({ userName })
    if (existingUserName) {
      return badRequest(res, "Username is already exist , Please use another userName")
    }


    const resetToken = generateResetPasswordToken();
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const userData = {
      email,
      userName,
      password,
      resume,
      mobileNumber,
      passwordResetToken: resetToken,
      passwordResetExpires
    };

    const newUser = await User.create(userData);

sendToken(newUser, 201, res);

const subject = "Welcome to Fincoopers Tech India – Your Candidate Portal Access";
const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #2c3e50; text-align: center;">Welcome to Fincoopers Tech India!</h2>
    <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>

    <p style="font-size: 16px; color: #333;">
      Thank you for signing up at <strong>Fincoopers Tech India</strong>!
    </p>

    <p style="font-size: 16px; color: #333;">
      You can now log in to your candidate portal using the button below:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://candidate-portal.fincooperstech.com/login"
         style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #fff; text-decoration: none; font-weight: bold; border-radius: 5px;"
         target="_blank">
        Click here to login
      </a>
    </div>
    <p style="font-size: 16px; color: #333;">
      Best regards,<br/>
      <strong>Fincoopers Tech India Team</strong>
    </p>

    <hr style="margin-top: 40px;" />
    <p style="font-size: 12px; color: #777; text-align: center;">
      This is an automated message, please do not reply directly to this email.
    </p>
  </div>
`;

await sendEmail({
                to: email,
                subject: subject,
                html: html, 
            });


    sendVerificationEmail(newUser).catch(err => {
      console.error("Error sending verification email:", err.message);
    });

    // Resume Analizer //
    // const aiConfig = await aiModel.findOne({ title: 'Resume Analizer', enableAIResumeParsing: true })
    // if (resume && aiConfig) {
    //   // AI screening logic AFTER user creation
    //   const prompt = generateScreeningPrompt(resume);
    //   const screeningResult = await generateAIScreening(prompt, resume);

    //   if (screeningResult && typeof screeningResult == 'object') {
    //     await User.findByIdAndUpdate(
    //       newUser.id,
    //       {
    //         $set: {
    //           ...screeningResult,
    //           Resume_Analizer: "true"
    //         }
    //       },
    //       { new: true }
    //     );
    //   } else {
    //     await User.findByIdAndUpdate(
    //       newUser.id,
    //       { Resume_Analizer: "false" },
    //       { new: true }
    //     );
    //   }
    // } else {
    //   // If AI config is missing or resume is not available
    //   await User.findByIdAndUpdate(
    //     newUser.id,
    //     { Resume_Analizer: "false" },
    //     { new: true }
    //   );
    // }


  } catch (error) {
    next(error);
  }
};
 


export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return badRequest(res, "Please provide an email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return badRequest(res, "Invalid email");
    }

    if (!user.password) {
      const token = user.getSignedToken();
      await User.findByIdAndUpdate(user._id, { activeToken: token });
      return success(res, "Login Successful", {
        success: true,
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
        token
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return badRequest(res, "Invalid password");
    }



    const token = user.getSignedToken();

    await User.findByIdAndUpdate(user._id, { activeToken: token });

    return success(res, "Login Successful", {
      success: true,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        passwordResetToken: user.passwordResetToken,
        isEmailVerified: user.isEmailVerified,
      },
      token
    });

  } catch (error) {
    unknownError(res, error);
  }
};



// shows the percenteage //
// function calculateProfileCompletion(user) {
//   console.log("user")
//   let completion = 0;

//   // Profile Information (Check if values exist)
//   const profileFields = [
//     'gender', 'dob', 'address1', 'city', 'state',
//     'country', 'pincode',
//   ];

//   // profileFields.forEach(field => {
//   //   if (user.profile_Info && user.profile_Info[field]) {
//   //     if (field === 'socialAccounts' && user.profile_Info[field].length > 0) {
//   //       completion += 1;
//   //     } else if (field !== 'socialAccounts') {
//   //       completion += 1;
//   //     }
//   //   }
//   // });

//   // Job Preferences (Check if values exist)
//   // const jobPreferencesFields = [
//   //   'preferredLocations', 'jobType', 'noticePeriodInDays'
//   // ];

//   // jobPreferencesFields.forEach(field => {
//   //   if (user.jobPreferences && user.jobPreferences[field] &&
//   //     (Array.isArray(user.jobPreferences[field])
//   //       ? user.jobPreferences[field].length > 0
//   //       : user.jobPreferences[field])) {
//   //     completion += 1;
//   //   }
//   // });

//   // Resume (Check if resume and parsed keywords exist)
//   if (user.resume && user.resume !== "") completion += 1;
//   // if (user.resumeDetails && user.resumeDetails.parsedKeywords && user.resumeDetails.parsedKeywords.length > 0) completion += 1;

//   // Professional Experience & Education (Array checks)
//   // if (user.professional_Experience && user.professional_Experience.length > 0) completion += 1;
//   if (user.education && user.education.length > 0) completion += 1;

//   // Skills (Array check)
//   if (user.skills && user.skills.length > 0) completion += 1;

//   // Dynamically calculate total fields based on the fields in the profile
//   const totalFields = profileFields.length; // 4 includes Resume, Experience, Education, and Skills

//   // Calculate profile completion percentage
//   const profileCompletionPercentage = Math.min((completion / totalFields) * 100, 100);

//   return profileCompletionPercentage;
// }


function calculateProfileCompletion(user) {
  let completion = 0;

  // Basic profile info from Basic_Info
  const basicInfoFields = [
    'Name', 'email', 'gender', 'dob', 'fatherName', 'MotherName',
    'maritalStatus', 'EmergencyNumber', 'EmergencyContact', 'RelationwihContact',
    'Nationality', 'identityMark', 'height', 'caste', 'landmark', 'category',
    'religion', 'bloodGroup', 'homeDistrict', 'homeState', 
  ];

  basicInfoFields.forEach(field => {
    if (user.Basic_Info?.[field]) completion++;
  });

  // Address checks
  const addressFields = ['address1', 'city', 'state', 'country', 'pincode'];
  addressFields.forEach(field => {
    if (user.Basic_Info?.CurrentAddress?.[field]) completion++;
    if (user.Basic_Info?.PermentAddress?.[field]) completion++;
  });

  // Family Info
  const familyFields = ['fatherName', 'motherName', 'fathersOccupation', 'fathersMobileNo', 'mothersMobileNo', 'familyIncome', 'familymember'];
  familyFields.forEach(field => {
    if (user.Family_Info?.[field]) completion++;
  });

  // KYC
  const kycFields = ['pancardNo', 'aadharcardNo', 'passportNo', 'uanNumber', 'VoterId'];
  kycFields.forEach(field => {
    if (user.KYC_Details?.[field]) completion++;
  });

  // Resume
  if (user.resume && user.resume !== '') completion++;

  // Skills, Education, Experience
  if (user.skills?.length > 0) completion++;
  if (user.education?.length > 0) completion++;
  if (user.professional_Experience?.length > 0) completion++;



  // Define the total number of important fields used above
  const totalFields = (
    basicInfoFields.length +
    (addressFields.length * 2) +
    familyFields.length +
    kycFields.length +
    1 + // resume
    1 + // skills
    1 + // education
    1 + // experience
    3 + // jobPreferences
    1 + // resume keywords
    1 + // summary
    1   // socialAccounts
  );

  const percentage = Math.min((completion / totalFields) * 100, 100);
  return Math.round(percentage);
}





export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Make sure req.user is populated by auth middleware
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });


    if (!updatedUser) {
      return notFound(res, 'User not found');
    }

    // Update profile completion percentage after updating user profile
    const updatedPercentage = calculateProfileCompletion(updatedUser);

    // Update the profile completion percentage in the database
    updatedUser.profileCompletionPercentage = updatedPercentage;
    await updatedUser.save(); // Save the updated user document


    return sendResponse(res, 200, true, 'Profile updated successfully', updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return unknownError(res, error);
  }
};



export const userProfile = async (req, res) => {
  try {
    const UserId = req.user?._id;

    if (!UserId) {
      return badRequest(res, "User not found");
    }

    const objectId = new mongoose.Types.ObjectId(UserId);

    const userData = await User.aggregate([
      {
        $match: { _id: objectId }
      },
      {
        $project: {
          password: 0,
          otp: 0,
          passwordResetToken: 0,
          passwordResetExpires: 0,
          __v: 0
        }
      }
    ]);

    if (!userData || userData.length === 0) {
      return badRequest(res, "User data not found");
    }

    return success(res, "User profile fetched successfully", userData[0]);
  } catch (error) {
    console.error("User Profile Error:", error);
    return badRequest(res, "Something went wrong");
  }
};


export const verifyUser = async (req, res, next) => {
  const { token } = req.params;
  if (!token) {
    return badRequest(res, "Please provide the token");
  }
  try {

    const decoded = verifyToken(token);

    if (!decoded) {
      return badRequest(res, "Invalid token");
    }

    const { id } = decoded;

    let loggedInUser = await User.findOne({
      _id: id,
      activeToken: token
    }).select('userName email role isEmailVerified profileCompletionPercentage')

    if (!loggedInUser) {
      return badRequest(res, "Invalid token");
    }
    return success(res, "User verified successfully", loggedInUser);

  }
  catch (error) {
    unknownError(res, error);
  }
}


export const sendVerificationMail = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return badRequest(res, "Please provide an email ");
    }

    // Find user by email and select password field explicitly
    const findUser = await User.findOne({ email });

    if (!findUser) {
      return badRequest(res, "Invalid email ");
    }
    if (findUser.isEmailVerified) {
      return badRequest(res, "Email  already verified!");
    }
    sendVerificationEmail(findUser);

    return success(res, "Verification mail sent", {
      success: true
    });

  } catch (error) {
    unknownError(res, error);
  }
};

export const verifyMail = async (req, res) => {
  const { token } = req.params;

  try {
    if (!token) {
      return badRequest(res, "Please provide a token");
    }

    let userId = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.error('Invalid token:', err.message);
      return badRequest(res, 'Invalid or expired token');
    }

    const findUser = await User.findOne({ _id: userId });
    if (!findUser) {
      return badRequest(res, "User not found");
    }

    if (findUser.isEmailVerified == true) {
      return badRequest(res, "Email already verified!");
    }

    findUser.isEmailVerified = true;
    findUser.emailVerifiedDate = Date.now();

    await findUser.save();

    return success(res, "Email verified!", {
      success: true
    });

  } catch (error) {
    unknownError(res, error);
  }
};




// Forgot Password Controller
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email input
        if (!email) {
            return badRequest(res, "Please provide an email.");
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return badRequest(res, "User not found.");
        }

        // Generate reset password token
        const resetToken = user.getResetPasswordToken();
        console.log(resetToken);
        await user.save({ validateBeforeSave: false });

        // Construct reset URL
        // const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;
        const resetUrl = `https://candidate-portal.fincooperstech.com/ResetPassword/${resetToken}`;

        // Email Template
        const message = `
    <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 10px;
            border-top: 1px solid #e0e0e0;
            border-radius: 0 0 5px 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Hello ${user.userName},</h2>
        </div>
        <div class="content">
            <p>We have received a request to reset your password for your account on <strong>Carrer Page</strong>. If you did not request this change, you can ignore this email and your password will not be changed.</p>
            
            <p>To reset your password, please click on the following link and follow the instructions:</p>
            
            <p><a class="button" href="${resetUrl}">Reset Password</a></p>
            
            <p>This link will expire in <strong>15 minutes</strong> for security reasons. If you need to reset your password after this time, please make another request.</p>
        </div>
        <div class="footer">
            <h3>Thank you,</h3>
        </div>
    </div>
</body>
</html>
    `;

        // Send email
        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                html: message, // Sending as HTML
            });

            return success(res, "Password reset email sent successfully.");
        } catch (error) {
            // Reset token values if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return unknownError(res, "Email could not be sent. Please try again later.");
        }
    } catch (error) {
        return unknownError(res, error.message || "Something went wrong.");
    }
};


// Reset Password //

export const resetPassword = async (req, res , next) => {

    try {
const {resetToken} = req.params
        const { password  } = req.body;


        if (!resetToken || !password) {
            return badRequest(res, "Invalid token or password");
        }

        const user = await User.findOne({
            passwordResetToken: resetToken,
            passwordResetExpires: { $gt: Date.now() },
        })

        if (!user) {
            return badRequest(res, "Invalid token or token expired");
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        return success(res, "Password reset successfully");

        
    } catch (error) {

        unknownError(res, error);
        
    }

}