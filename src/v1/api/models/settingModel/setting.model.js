import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const settingSchema = new Schema({
  employeIdPrefix: { type: String, default: "EMP" },
  employeIdSuffix: { type: String, default: "" },
  employeIdCounter: { type: Number, default: 0 },

  employeIdUseDate: { type: Boolean, default: false },
  employeIdDateFormat: { type: String, default: "YYYYMMDD" },

  employeIdUseRandom: { type: Boolean, default: false },
  employeIdRandomLength: { type: Number, default: 4 },

  employeIdPadLength: { type: Number, default: 4 },
})

const Settings = model("Settings", settingSchema);

export default Settings;