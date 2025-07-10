import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const mailContentSchema = new mongoose.Schema({
  organizationId: { type: ObjectId, ref: "Organization", default: null },
  senderId: { type: String, default: "" },
  toMail: { type: String, default:"" },
  ccMail: [{ type: String ,default:[]}],
  subject: { type: String, required: true ,default:"" },
  body: { type: String, required: true , default:"" },
  name: { type: String, require: true ,default:""},
  modelType: {type:String , default:""},
  file: [{ type: String }],
}, { timestamps: true });

const mailContentModel = model('mailContent', mailContentSchema);

export default mailContentModel;
