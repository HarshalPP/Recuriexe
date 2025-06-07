import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const fileSharingSchema = new Schema(
  {
    fileName:    {type: String,required: true},
    fileKey:     { type: String , default :"" },
    url:         { type: String , default :"" }, 
    size:        { type: Number , default : null },
    mimeType:    { type: String , default :"" },
    fileFolderId:{ type: ObjectId,ref: "fileFolder"},
    sharedWith:  [{ type: ObjectId, ref: 'employee' }],
    uploadedBy:  { type: ObjectId,ref: "employee"},
    status: { type: String,enum: ['active', 'recycled', 'deleted'], default: 'active'},
    deletedAt:    { type: Date, default: null },
   
  },
{
    timestamps: true,
  }
);

fileSharingSchema.index({ fileName: 1 }, { collation: { locale: 'en', strength: 2 } });

const fileSharingModel = model('fileSharing', fileSharingSchema);

export default fileSharingModel;
