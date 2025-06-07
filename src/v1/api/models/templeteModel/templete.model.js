import mongoose from 'mongoose';
import moment from 'moment-timezone';

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

// Template Schema
const templateSchema = new Schema({

organizationId: { type: ObjectId, ref: "Organization", default: null },

  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'employee',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const TempleteModel = mongoose.model('Templete' ,  templateSchema)
export default TempleteModel;