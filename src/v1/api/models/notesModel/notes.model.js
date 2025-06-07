import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const notesModelSchema = new Schema({
   createdBy:{type:ObjectId, default:null},
   title:    { type: String,default:""},
   content:  { type: String,default:""},
   bgColor:  { type: String,default:""},
   reminderAt: {type: Date,required: false, default: null},
   subBoardId:   {type: ObjectId ,default: null}, 
   type:     { type: String, enum: ["notes", "board"], required:[true,"Type Is Required"]},
   sharedWith: [ { employeeId: ObjectId, access: { type: String, enum: ["view", "edit"] }}],
   status:   {type: String,enum: ["active", "delete"],default: "active"},
},
{ timestamps: true }
);

 const notesModel = model("notes", notesModelSchema);
export default notesModel;