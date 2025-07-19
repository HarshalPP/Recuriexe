const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const projectTaskSchema = new mongoose.Schema({
projectId:{
    type:Schema.Types.ObjectId,
    ref:"project"
    },
  title:{
    type:String,
    required:true
  },
  frontEndEmployee:{
    type:Schema.Types.ObjectId,
    ref:"employee"
  },
  backendEndEmployee:{
    type:Schema.Types.ObjectId,
    ref:"employee"
  },
  qaEmployee:{
    type:Schema.Types.ObjectId,
    ref:"employee"
  },
  frontEndStatus:{
    type:String,
    enum:['pending','inprogress','complete']
  },
  backendEndStatus:{
    type:String,
    enum:['pending','inprogress','complete']
  },
  qaStatus:{
    type:String,
    enum:['pending','inprogress','complete']
  },
  liveStatus:{
    type:String,
    enum:['underDevelopment','stage','live']
  },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    detail:{
        type:String
    },

},
{ timestamps: true }
);

const projectTaskModel = mongoose.model("projectTask", projectTaskSchema);

module.exports = projectTaskModel;
