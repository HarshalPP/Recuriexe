import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const fileFolderSchema = new Schema(
  {
  name:      { type: String, required: true },
  path:      { type: String, required: true },
  parentId:  { type: ObjectId, ref: 'fileFolder', default: null },
  createdBy: { type: ObjectId, ref: 'employee', default: null },
  sharedWith: [{ type: ObjectId, ref: 'employee', default: null }],
  status: { type: String,enum: ['active', 'recycled', 'deleted'], default: 'active'},
  deletedAt:    { type: Date, default: null },
}, { timestamps: true });



const fileFolderModel = model('fileFolder', fileFolderSchema);

export default fileFolderModel;
