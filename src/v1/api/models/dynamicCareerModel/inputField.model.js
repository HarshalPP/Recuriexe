import mongoose, { Schema } from "mongoose";
const { ObjectId } = Schema;

// Define input schema for advanced multi-input configuration
const InputSchema = new mongoose.Schema({
  // serviceId: {
  //        type: Schema.Types.ObjectId, 
  //        ref: "users",
  //        required: true,
  //    },
   organizationId: { type: ObjectId, ref: "Organization", default :null },

  type: {
    type: String,
    required: true,
    enum: ['file', 'multifile', 'text', 'textarea', 'dropdown', 'radio', 'checkbox', 'toggle', 'daterange']
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

const inputModel = mongoose.model("input",InputSchema);

export default inputModel;