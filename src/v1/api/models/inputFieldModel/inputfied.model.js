import mongoose, { Schema } from "mongoose";

// Define input schema for advanced multi-input configuration
const InputSchema = new mongoose.Schema({
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },
    reportId : {
      type: Schema.Types.ObjectId,
      ref: "reportType",
      required: [true, "Report type ID is required"],
    },
  type: {
    type: String,
    required: true,
    enum: ['file', 'multifile', 'text','number', 'textarea', 'dropdown', 'radio', 'checkbox', 'toggle', 'daterange']
  },
  required: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileTypes: {
    type: [String],
    default: []
  },
  options: {
    type: Array,
    default: []
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed
  },
  placeholder: {
    type: String,
    trim: true
  },
  maxFiles: {
    type: Number,
    default: 1
  }
}, {
    timestamps:true
});

const inputFieldModel = mongoose.model("inputField",InputSchema);

export default inputFieldModel;