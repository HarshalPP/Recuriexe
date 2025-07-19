const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const projectCommunicationSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  projectId:{
    type:Schema.Types.ObjectId,
    ref:"project"
  },
  user:{
      type:Schema.Types.ObjectId,
      ref:"employee"
  },
    message:{
        type:String,
        required:true
    },
},
{ timestamps: true }
);

const projectCommunicationModel = mongoose.model("projectCommunication", projectCommunicationSchema);

module.exports = projectCommunicationModel;
