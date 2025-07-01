// import mongoose from "mongoose";

// const callScheduleSchema = new mongoose.Schema({
//    organizationId: {
//           type: mongoose.Schema.Types.ObjectId,
//           required: true
//       },
//   agent: { type: String, required: true },      // agent mobile ya id
//   caller: { type: String, required: true },     // caller number
//   vnm: { type: String, required: true },        // virtual number
//   scheduleAt: { type: Date, required: true },   // kab call karni hai UTC format
//   status: { type: String, enum: ['pending', 'running', 'done', 'failed'], default: 'pending' },
//   gapInMinutes: { type: Number, default: 0 }, // ✅ NEW FIELD
//   result: { type: Object, default: null }
// }, { timestamps: true });

// export default mongoose.model("CallSchedule", callScheduleSchema);

import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

/** Result sub-document */
const resultSchema = new Schema(
  {
    unique_id: {
      type: String,
      default: "", // default to null if not provided
      trim: true,
    },
    status: {
      type: String,
      // enum: ["success", "failed", "no-answer"], // add/remove statuses as needed
      // required: true,
      default: "",
    },
    message: {
      type: String,
      default: "", // default to empty string if not provided
      trim: true,
    },
  },
  { _id: false }            // don’t create a separate _id for this sub-doc
);

/** Main schema */
const callScheduleSchema = new Schema(
  {
    organizationId: {
      type: Types.ObjectId,
      required: true,
      ref: "Organization",  // adjust if you have an Organization model
    },
    agent: {
      type: String,
      required: true,
      trim: true,
    },                       // agent mobile/id
    caller: {
      type: String,
      required: true,
      trim: true,
    },                       // caller number
    vnm: {
      type: String,
      required: true,
      trim: true,
    },                       // virtual number
    scheduleAt: {
      type: Date,
      // required: true,
      // default: null,   
    },                       // call time (UTC)
    status: {
      type: String,
      enum: ["pending", "running", "done", "failed","cancelled",""],
      default: "",
    },
    gapInMinutes: {
      type: Number,
      default: 0,
    },
    result: {
      type: resultSchema,    // 👉 strongly-typed sub-document
      default: {},           // default to empty object if not provided
    },
  },
  { timestamps: true }
);

export default model("CallSchedule", callScheduleSchema);
