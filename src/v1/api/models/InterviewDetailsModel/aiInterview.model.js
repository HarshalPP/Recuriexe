import mongoose from "mongoose";
const {Schema , ObjectId} = mongoose


const MessageSchema = new Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
});



// ✅ Updated Summary Schema to match Gemini AI output
const AISummarySchema = new Schema({
  candidateStrengths: [{ type: String }],
  weaknesses: [{ type: String }],
  jobFitScore: { type: String }, // e.g. "6/10"
  finalRemarks: { type: String },
  status: {
    type: String,
    enum: ['Recommended', 'Not Recommended', 'Neutral'],
    default: 'Neutral',
  }
});



// Job Description Subschema
const JobDescriptionSchema = new Schema({
  JobSummary: { type: String },
  RolesAndResponsibilities: [{ type: String }],
  KeySkills: [{ type: String }],
});

const AIInterviewSchema = new Schema({
  organizationId: { type: ObjectId, ref: "Organization", default:null },
  candidateId: { type: ObjectId, ref: "jobApplyForm", default: null },
  jobId: { type: ObjectId, ref: "Job", default:null },
  hrId: { type: ObjectId, ref: "employee", default:null },
  resumeText: { type: String },
  jobDescription: { type: JobDescriptionSchema },  // ✅ changed from String to Object
  language: { type: String, default: "English" },
  history: [MessageSchema],
  isComplete: { type: Boolean, default: false },
  durationMinutes: { type: Number, default: "" },
  scheduleDate: { type: Date, default: null },
  status: {
    type: String,
    enum: ['pending', 'running', 'complete', 'cancelled'],
    default: 'pending'
  },
  summary: AISummarySchema,
  videoUrl: { type: String, default: "" },
   aiDecision: {
    type: String,
    enum: ['Recommended', 'Not Recommended', 'Neutral', 'Pending'],
    default: 'Pending'
  }
}, { timestamps: true });





const AI_Interviwew = mongoose.model('AIInterview' , AIInterviewSchema)
export default AI_Interviwew;