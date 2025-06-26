import mongoose from "mongoose";

const bookDemoSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: false },
    workEmail: { type: String, required: false },
    phoneNumber: { type: String }, // Optional
    companyName: { type: String, required: false },
    jobTitle: { type: String, required: false },
    industryType: { type: String },
    OtherIndustry:{type:String},
    numberOfEmployees: { type: String }, // e.g., '1–10', '11–50', etc.
    preferredDemoTimeSlot: { type: Date },
    howDidYouHearAboutUs: { type: String },
    consent: { type: Boolean, required: false }
  },
  { timestamps: true }
);

export default mongoose.model("BookDemo", bookDemoSchema);
