
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
    organizationId: {
        type: String,
        ref: 'organization',
        required: true
    },
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Monthly', 'Yearly', 'One-time'], 
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  bankDetails: {
    accountHolderName: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    }
  }
}, {
  timestamps: true
});

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
