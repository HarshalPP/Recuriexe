import mongoose from "mongoose";

const aiConfigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: false,
    },

    enableAIResumeParsing: {
      type: Boolean,
      default: false,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("AIConfig", aiConfigSchema);

