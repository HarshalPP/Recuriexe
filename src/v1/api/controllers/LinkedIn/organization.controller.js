// controllers/organization.controller.js
import LinkedInOrganization from "../../models/LinkedIn/Organization.js";
import {asyncHandler} from "../../Utils/LinkedIn/asyncHandler.js";
import {ApiError} from "../../Utils/LinkedIn/ApiError.js";
import {ApiResponse} from "../../Utils/LinkedIn/ApiResponse.js";
import axios from "axios";
import qs from "querystring";
import { log } from "console";

// Create a new organization
export const createOrganization = asyncHandler(async (req, res) => {
  
  const {  linkedinClientId, linkedinClientSecret, linkedinRedirectUri} = req.body;
  
  
  const organizationId = req.employee.organizationId;
  
  if (!linkedinClientId || !linkedinClientSecret || !linkedinRedirectUri) {
    throw new ApiError(400, "All fields are required");
  }

  const newOrg = await LinkedInOrganization.create({
    linkedinClientId,
    linkedinClientSecret,
    linkedinRedirectUri,
    organizationId,
  });

  res.status(201).json(new ApiResponse(201, newOrg, "Organization created successfully"));
});

// Get all organizations
export const getAllOrganizations = asyncHandler(async (req, res) => {
    const organizationId = req.employee.organizationId;

const orgs = await LinkedInOrganization.find({ organizationId: organizationId });

res.status(200).json(new ApiResponse(200, orgs, "Organizations fetched"));
});

// Get a specific organization by ID
export const getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const org = await LinkedInOrganization.findById(id);

  if (!org) {
    throw new ApiError(404, "Organization not found");
  }

  res.status(200).json(new ApiResponse(200, org, "Organization found"));
});

// Delete an organization by ID
export const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const org = await LinkedInOrganization.findById(id);
  if (!org) {
    throw new ApiError(404, "Organization not found");
  }

  await LinkedInOrganization.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, null, "Organization deleted successfully"));
});

// Controller for disconnecting LinkedIn
export const disconnectLinkedIn = asyncHandler(async (req, res) => {
  const { orgId } = req.params;

  // Find organization by ID
  const org = await LinkedInOrganization.findById(orgId);
  if (!org) {
    throw new ApiError(404, "Organization not found");
  }

  // If already disconnected
  if (!org.accessToken && !org.memberId) {
    return res.status(200).json(new ApiResponse(200, null, "Already disconnected"));
  }

  // Optionally revoke token on LinkedIn side
  if (org.accessToken) {
    try {
      await revokeLinkedInToken(org.accessToken, org.linkedinClientId, org.linkedinClientSecret);
    } catch (error) {
      console.error("Failed to revoke LinkedIn token:", error.message);
      // You can choose to continue anyway and just clear tokens locally
    }
  }

  // Clear stored tokens
  org.accessToken = undefined;
  org.memberId = undefined;
  await org.save();

  return res.status(200).json(new ApiResponse(200, null, "✅ LinkedIn disconnected successfully"));
});

// Helper: Revoke LinkedIn access token
async function revokeLinkedInToken(accessToken, clientId, clientSecret) {
  try {
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/revoke", 
      new URLSearchParams({
        token: accessToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("LinkedIn token revoked successfully", response.data);
  } catch (error) {
    console.error("Error revoking LinkedIn token:", error.response?.data || error.message);
    throw error;
  }
}