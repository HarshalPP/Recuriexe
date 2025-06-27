import mongoose from "mongoose";
const { Schema } = mongoose;

const clientCandidateAssignmentSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
  candidateIds: [{ type: Schema.Types.ObjectId, ref: "jobApplyForm" }], // array of candidates
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: "employee", required: true },
  assignedAt: { type: Date, default: Date.now },
  excelUrl:{type:String , default:null}
}, {
  timestamps: true
});

export default mongoose.model("ClientCandidateAssignment", clientCandidateAssignmentSchema);
