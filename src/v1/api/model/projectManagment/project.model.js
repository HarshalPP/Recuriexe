const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const projectSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  manager:{
    type:Schema.Types.ObjectId,
    ref:"employee"
  },
  team:[
    {
        user:{
            type:Schema.Types.ObjectId,
            ref:"employee"
        },
        role:{
            type:String,
            enum:["frontend","backend","qa"]
        }
    }
    ],
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
    file:[{
        type:String
    }]
},
{ timestamps: true }
);

const projectModel = mongoose.model("project", projectSchema);

module.exports = projectModel;
