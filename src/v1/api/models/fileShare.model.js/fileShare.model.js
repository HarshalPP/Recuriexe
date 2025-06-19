import mongoose from 'mongoose';
const { Schema } = mongoose;
const { ObjectId } = Schema;

const FileMetaSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'jobApplyForm'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  parentId:  { type: ObjectId, ref: 'fileFolder', default: null },
  originalName: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  location: {
    type: String,
    // required: true
  },
  
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  lastOpenedAt: {
    type: Date,
    default: null
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

export default mongoose.model('FileMeta', FileMetaSchema);