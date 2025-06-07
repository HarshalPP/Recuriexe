import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const settingSchema = new Schema({
  organizationId: { type: ObjectId, ref: "Organization", default: null },
  PostIdPrefix: { type: String, default: "Job" },
  PostIdSuffix: { type: String, default: "" },
  PostIdCounter: { type: Number, default: 0 },

  PostIdUseDate: { type: Boolean, default: false },
  PostIdDateFormat: { type: String, default: "YYYYMMDD" },

  PostIdUseRandom: { type: Boolean, default: false },
  PostIdRandomLength: { type: Number, default: 0},

  PostIdPadLength: { type: Number, default: 0 },
})

const candidatesetting = model("PostSetting", settingSchema);

export default candidatesetting;