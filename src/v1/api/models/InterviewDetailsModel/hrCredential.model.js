import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const hrCredentialSchema = new Schema(
  {
    hrEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    accessToken: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
    },

    expiryDate: {
      type: Number, 
      required: true,
    },


    // organizationId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Organization',
    // },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


export default model('HrCredential', hrCredentialSchema);
