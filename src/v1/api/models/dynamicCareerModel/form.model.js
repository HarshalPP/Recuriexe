import mongoose, { Schema, model } from 'mongoose';
const { ObjectId } = Schema;

// Reuse the InputSchema here
const InputSchema = new Schema({
//   organizationId: { type: ObjectId, ref: "Organization", default :null },
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
  _id: true, // prevent nested _id for each input if you don't want it
  timestamps: false
});

const formSchema = new Schema({
  organizationId: { type: ObjectId, ref: "Organization", default: null },
  title: String,

  // 👇 Now embedding input fields directly
  fields: [InputSchema],

  status: {
    type: String,
    default: "active"
  },
  schemaVersion: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const formModel = model("form", formSchema);
export default formModel;
