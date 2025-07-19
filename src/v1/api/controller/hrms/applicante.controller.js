const {
    success,
    unknownError,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const bcrypt = require("bcrypt");
  const jwt = require("jsonwebtoken");
  
  const ApplicanteModel = require("../../model/hrms/newcandidate.model");
  


  // Register Profile //
  const RegisterProfile = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Basic validation
      if (!email || !password) {
        return badRequest(res, "Please Provide Email and Password");
      }
  
      // Check for existing email
      const existingCandidate = await ApplicanteModel.findOne({ email });
      if (existingCandidate) {
        return res.status(409).json({ message: "Email is already registered." });
      }
  
      // Save candidate (raw password; will be hashed by schema)
      const newCandidate = new ApplicanteModel({
        email,
        password,
      });
  
      await newCandidate.save();
  
      // Generate JWT Token
      const token = jwt.sign(
        {
          id: newCandidate._id,
          email: newCandidate.email,
        },
        process.env.CANDIDATE_JWT_SECRET,
        { expiresIn: process.env.CANDIDATE_JWT_EXPIRES_IN || "7d" }
      );
  
      return success(res, "Candidate registered successfully", {
        token,
        user: {
          id: newCandidate._id,
          email: newCandidate.email,
        },
      });
    } catch (error) {
      console.error("Error in RegisterProfile:", error);
      return unknownError(res, "Something went wrong");
    }
  };

  // Login api //
  
  const loginCandidate = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return badRequest(res, "Please provide email and password");
      }
  
      const candidate = await ApplicanteModel.findOne({ email });
      if (!candidate) {
        return badRequest(res, "Email not found");
      }
  
      const isMatch = await candidate.matchPassword(password);
      if (!isMatch) {
        return badRequest(res, "Password does not match");
      }
  
      const token = jwt.sign(
        {
          id: candidate._id,
          email: candidate.email,
        },
        process.env.CANDIDATE_JWT_SECRET,
        { expiresIn: process.env.CANDIDATE_JWT_EXPIRES_IN || "7d" }
      );
  
      return success(res, "Login successful", {
        token,
        user: {
          id: candidate._id,
          email: candidate.email,
        },
      });
    } catch (error) {
      console.error("Error in loginCandidate:", error);
      return unknownError(res, "Internal Server Error");
    }
  };
  
  

// Update Password //
 const updatePassword = async (req, res, next) => {
    try {
        // Extract user ID from request
        const { _id } = req.user._id;
   
        // Extract password fields from request body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmPassword) {
            return badRequest(res, "Please provide old password, new password, and confirm password");
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return badRequest(res, "New password and confirm password do not match");
        }

        // Find user by ID and include password field
        const user = await ApplicanteModel.findById(_id).select("+password");
        if (!user) {
            return badRequest(res, "User not found");
        }

        // Validate old password
        const isPasswordMatch = await user.matchPassword(oldPassword);
        if (!isPasswordMatch) {
            return badRequest(res, "Invalid old password");
        }

        // Update password and set password change timestamp
        user.password = newPassword;
        user.passwordChangedAt = Date.now();

        // Save updated user details
        await user.save();

        return success(res, "Password updated successfully");

    } catch (error) {
        unknownError(res, error);
    }
};

// verfiied Token
const verifyCandidateToken = async (req, res) => {
    try {
      const token = req.headers.authorization
  
      if (!token) {
        return badRequest(res, "Token is required");
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.CANDIDATE_JWT_SECRET);
  
      const user = await ApplicanteModel.findById(decoded.id).select("id email role");
      if (!user) {
        return badRequest(res, "User not found");
      }
  
      return success(res, "Token is valid", {
        user,
      });
  
    } catch (error) {
      console.error("Error verifying token:", error);
      return badRequest(res, "Invalid or expired token");
    }
  };

// check Profile //
  const getCandidateProfile = async (req, res) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
  
      if (!authHeader) {
        return badRequest(res, "Authorization token missing or invalid");
      }
  
      const token = authHeader
  
      // Verify token
      const decoded = jwt.verify(token, process.env.CANDIDATE_JWT_SECRET);
  
      // Fetch candidate details
      const candidate = await ApplicanteModel.findById(decoded.id).select("-password -otp");
  
      if (!candidate) {
        return badRequest(res, "Candidate not found");
      }
  
      return success(res, "Candidate profile fetched successfully", candidate);
    } catch (err) {
      console.error("Error in getCandidateProfile:", err);
      return unknownError(res, "Invalid token or internal error");
    }
  };


  const setJobAlert = async (req, res) => {
    try {
      const { jobAlerts } = req.body;
      const userId = req.user.id;
  
      if (!Array.isArray(jobAlerts) || jobAlerts.length === 0) {
        return badRequest(res, "Please provide job positions for alerts.");
      }
  
      const user = await ApplicanteModel.findByIdAndUpdate(
        userId,
        { jobAlerts },
        { new: true }
      );
  
      return success(res, "Job alert preferences updated", user);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  


  module.exports = {
    RegisterProfile,
    loginCandidate,
    updatePassword,
    verifyCandidateToken,
    getCandidateProfile,
    setJobAlert
  }