const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const boardModelSchema = new Schema({
   createdBy:  {type:ObjectId, default:null},
   title:      { type: String,default:""},
   reminderAt: {type: Date,required: false},
   sharedWith: [ { employeeId: ObjectId, access: { type: String, enum: ["view", "edit"] }}],
   status:     {type: String,enum: ["active", "delete"],default: "active"},
},
{ timestamps: true }
);

const boardModel = mongoose.model("board", boardModelSchema);
module.exports = boardModel;
 
