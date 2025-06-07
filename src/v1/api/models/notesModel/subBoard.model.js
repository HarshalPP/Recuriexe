import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const subBoardSchema = new Schema({
   boardId:{type:ObjectId, required:[true,"boardId Is Required"]},
   title:   { type: String,default:""},
//    sharedWith: [
//        { employeeId: ObjectId, access: { type: String, enum: ["view", "edit"] }}],
   status: {type: String,enum: ["active", "delete"],default: "active"},
},
{ timestamps: true }
);

 const subBoardModel = model("subBoard", subBoardSchema);
export default subBoardModel;