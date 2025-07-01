import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const settingSchema = new Schema({
  organizationId: { type: ObjectId, ref: "Organization", default: null },
  ClientIdPrefix: { type: String, default: "CLI" },
  ClientIdSuffix: { type: String, default: "" },
  ClientIdCounter: { type: Number, default:  100},

  ClientIdUseDate: { type: Boolean, default: false },
  ClientIdDateFormat: { type: String, default: "YYYYMMDD" },

  ClientIdUseRandom: { type: Boolean, default: false },
  ClientIdRandomLength: { type: Number, default: 0},

  ClientIdPadLength: { type: Number, default: 0 },
})

const ClientSetting = model("ClientSetting", settingSchema);

export default ClientSetting;