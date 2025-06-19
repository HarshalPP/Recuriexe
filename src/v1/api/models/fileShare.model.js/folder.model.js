import mongoose from 'mongoose';

const foldersSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization'
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'jobApplyForm'
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'folderSchema',
    default: null
  },
  name: { // file ya folder ka naam
    type: String,
    required: true
  },
  type: { // 'folder' ya 'file'
    type: String,
    enum: ['folder', 'file'],
    required: true
  },
  key: { // S3 key (file ke liye), folder ke liye path
    type: String
  },
  location: { // S3 URL (file ke liye)
    type: String
  },
  size: { // file ke liye
    type: Number
  },
  mimetype: { // file ke liye
    type: String
  },
  extension: { // file ke liye
    type: String
  },
  status: { 
    type: String,
    enum: ['active', 'recycled', 'deleted'],
    default: 'active'
  },
  deletedAt: {
    type: Date,
    default: null
  },
  openedAt: {
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

export default mongoose.model('folderSchema', foldersSchema);