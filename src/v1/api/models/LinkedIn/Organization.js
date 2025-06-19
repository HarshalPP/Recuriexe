import mongoose from 'mongoose';
import { type } from 'os';

const LinkedIninkedInorganizationSchema = new mongoose.Schema({
  linkedinName: { type: String, default: null },
  linkedinClientId: String,
  linkedinClientSecret: String,
  linkedinRedirectUri: String,
  linkedinEmail: { type: String, default: null },
  linkedinProfilePic: { type: String, default: null },
  accessToken:  { type: String, default: null },
  memberId:  { type: String, default: null },
  LinkedInorganizationId: String, // Add this for company page posting
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, 
});

const LinkedInOrganization = mongoose.model('LinkedInOrganization', LinkedIninkedInorganizationSchema);

export default LinkedInOrganization;
