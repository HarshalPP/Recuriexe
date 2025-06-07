import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const boardModelSchema = new Schema({
   createdBy:  {type:ObjectId, default:null},
   title:      { type: String,default:""},
   reminderAt: {type: Date,required: false},
   sharedWith: [ { employeeId: ObjectId, access: { type: String, enum: ["view", "edit"] }}],
   status:     {type: String,enum: ["active", "delete"],default: "active"},
},
{ timestamps: true }
);

 const boardModel = model("board", boardModelSchema);
export default boardModel;