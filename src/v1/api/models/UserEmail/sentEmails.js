import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: String, required: true },
  subject: { type: String },
  message: { type: String },
  filePath: { type: String },
  sentAt: { type: Date, default: Date.now },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, 
  
});

export default mongoose.model('sentEmails', emailSchema);