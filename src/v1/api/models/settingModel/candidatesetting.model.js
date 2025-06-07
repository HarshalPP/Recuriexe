import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const settingSchema = new Schema({
  candidateIdPrefix: { type: String, default: "CAN" },
  candidateIdSuffix: { type: String, default: "" },
  candidateIdCounter: { type: Number, default: 0 },

  candidateIdUseDate: { type: Boolean, default: false },
  candidateIdDateFormat: { type: String, default: "YYYYMMDD" },

  candidateIdUseRandom: { type: Boolean, default: false },
  candidateIdRandomLength: { type: Number, default: 0},

  candidateIdPadLength: { type: Number, default: 0 },
})

const candidatesetting = model("candidateSetting", settingSchema);

export default candidatesetting;