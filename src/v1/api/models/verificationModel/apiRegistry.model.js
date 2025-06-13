// models/apiRegistry.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema;

const apiRegistrySchema = new mongoose.Schema({
  apiId: {
    type: Number,
    required: true
  },
  apiName: {
    type: String,
    required: true
  },
  description: String,
  defaultLimit: {
    type: Number,
    default: 1000,
  },
  servicePath:{
    type:String,
    required:false
  },
  serviceName:{
    type:String,
    required:false
  },

  status:{
    type:String,
    default:"active"
  },
    apiCategoryId:{
    type:ObjectId,
    ref:"apiCategory",
    default:null
  },
  requiredFields:[{
    type:String,
    required:false
  }]
}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model("ApiRegistry", apiRegistrySchema);
