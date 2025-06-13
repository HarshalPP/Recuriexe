import mongoose from "mongoose";

const qualificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        // required: true,
      },
}, { timestamps: true });

const Qualification = mongoose.model("Qualification", qualificationSchema);
export default Qualification;
