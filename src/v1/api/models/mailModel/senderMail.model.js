import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const senderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }, 
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const mailSenderModel = model('mailSender', senderSchema);

export default mailSenderModel ;