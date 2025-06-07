import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const mailContentSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'mailSender', required: true },
  toMail: { type: String, required: true },
  newToMailId: { type: Boolean, default: false },
  ccMail: [{ type: String }],
  subject: { type: String, required: true },
  body: { type: String, required: true },
  attachments: [{ type: String }],
  stage: {
    type: String,
    enum: ['jobApplied', 'interviewScheduled', 'reInterviewScheduled'],
    required: true,
  },
}, { timestamps: true });

const mailContentModel = model('mailContent', mailContentSchema);

export default mailContentModel;
