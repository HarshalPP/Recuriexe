import mongoose from 'mongoose';

const { Schema } = mongoose;

const CriteriaSchema = new Schema({
  criteria: { type: String, required: false },
  score: { type: Number, required: false },
  reason: { type: String, required: false },
});

const ReasonPointSchema = new Schema({
  point: { type: String, required: false },
  description: { type: String, required: false },
  percentage: { type: String, required: false },
  weight: { type: String, required: false },
  impact: { type: String, required: false }, // only for rejectReason
});

const RiskFactorSchema = new Schema({
  factor: { type: String, required: false },
  level: { type: String, required: false },
  description: { type: String, required: false },
  mitigation: { type: String, required: false },
});

const ScreeningResultSchema = new Schema({
  jobPostId: { type: Schema.Types.ObjectId, ref: 'jobPosts', default:null },
  organizationId: { type: Schema.Types.ObjectId, ref: 'organizations',default:null },
  candidateId: { type: Schema.Types.ObjectId,default:null},
  position: { type: String, required: false },
  department: { type: String, required: false },
  qualification: { type: String, required: false },
  AI_Confidence: { type: Number, required: false },
  AI_Processing_Speed: { type: Number, required: false },
  Accuracy: { type: Number, required: false },
  qualificationThreshold: { type: Number, required: false },
  confidenceThreshold: { type: Number, required: false },
  overallScore: { type: Number, required: false },
  decision: { type: String, required: false },
  breakdown: {
    skillsMatch: { type: Number, required: false },
    experienceMatch: { type: Number, required: false },
    educationMatch: { type: Number, required: false },
    Project_Exposure:{type:Number , required:false},
    Leadership_Initiative:{type:Number , required:false},
    Cultural_Fit:{type:Number , required:false},
    Communication_Skills:{type:Number , required:false},
    Learning_Ability:{type:Number , required:false}
    
  },
  criteria: { type: [CriteriaSchema], required: false },
  acceptReason: { type: [ReasonPointSchema], required: false },
  rejectReason: { type: [ReasonPointSchema], required: false },
  recommendation: { type: String, required: false },
  improvementSuggestions: { type: [String], required: false },
  riskFactors: { type: [RiskFactorSchema], required: false },

}, { timestamps: true });

const ScreeningResultModel = mongoose.model('ScreeningResult', ScreeningResultSchema);

export default ScreeningResultModel;
