import mongoose from 'mongoose';

const pincodeLocationSchema = new mongoose.Schema({
  pincode: {
    type: Number,
    unique: true,
    trim: true
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
    state: {
    type: String,
  },
  district: {
    type: String,
  },
  area :{
    type: String,
  }
}, { timestamps: true });

export default mongoose.model('pincodeLocation', pincodeLocationSchema);
