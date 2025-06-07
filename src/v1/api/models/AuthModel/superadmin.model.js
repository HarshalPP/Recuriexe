import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const superAdminSchema = new Schema({
  userName: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },

  API_Key: {
    type: String
  },

  roleId: [{ type: ObjectId, ref: "role" }],

  passwordChangedAt: {
    type: Date,
    select: false, 
  },

  passwordResetToken: {
    type: String,
  },


  passwordResetExpires: {
    type: Date,
  },

}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// 🔐 Pre-save middleware to hash password
superAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Optional: Method to compare password
superAdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const SuperAdminModel = model('SuperAdmin', superAdminSchema);
export default SuperAdminModel;
