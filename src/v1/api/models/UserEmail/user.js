import mongoose from 'mongoose';
const {Schema} = mongoose

const EmailuserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  photo: String,
  accessToken: String || null,
  refreshToken: String || null,
  expiryDate:{type :Number , default:null},
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, 
}, { timestamps: true });

export default mongoose.model('Emailuser', EmailuserSchema);
