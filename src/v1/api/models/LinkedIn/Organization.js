import mongoose from 'mongoose';
import { type } from 'os';

const LinkedIninkedInorganizationSchema = new mongoose.Schema({
  name: String,
  linkedinClientId: String,
  linkedinClientSecret: String,
  linkedinRedirectUri: String,
  accessToken:  { type: String, default: null },
  memberId:  { type: String, default: null },
  LinkedInorganizationId: String, // Add this for company page posting
  Description : String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, 
});

const LinkedInOrganization = mongoose.model('LinkedInOrganization', LinkedIninkedInorganizationSchema);

export default LinkedInOrganization;
