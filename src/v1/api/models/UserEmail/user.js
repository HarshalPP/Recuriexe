import mongoose from "mongoose";
const { Schema } = mongoose;

const EmailuserSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    displayName: String,
    email: String,
    photo: String,
    accessToken: String || null,
    refreshToken: String || null,
    isDefault: Boolean,
    expiryDate: { type: Number, default: null },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Emailuser", EmailuserSchema);
