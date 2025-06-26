// models/userTableConfig.model.js

import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  key: { type: String, required: false },      
  active: { type: Boolean, default: false },  
});

const userTableConfigSchema = new mongoose.Schema({

     orgainizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    employeeId: { type: mongoose.Schema.Types.ObjectId,
     ref:"employee",
     default:null
   },

  type: { type: String, enum: ['column', 'freeze'], required: true },  // freeze or column

  config: [columnSchema],
}, { timestamps: true });


const UserTableConfig = mongoose.model('UserTableConfig', userTableConfigSchema);
export default UserTableConfig;
