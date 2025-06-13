import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema;

const apiReportSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true }, // unique report name
  description: { type: String, default: "" },
  userId: { type: ObjectId, ref: "employee", required: true }, // who created this report
  apis: [{ type: ObjectId, ref: "ApiRegistry" }], // selected APIs
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: { type: ObjectId, ref: "employee", default: null },
  updatedBy: { type: ObjectId, ref: "employee", default: null },
}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model("ApiReport", apiReportSchema);
