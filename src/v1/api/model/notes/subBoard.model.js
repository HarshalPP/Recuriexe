const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const subBoardSchema = new Schema({
   boardId:{type:ObjectId, required:[true,"boardId Is Required"]},
   title:   { type: String,default:""},
//    sharedWith: [
//        { employeeId: ObjectId, access: { type: String, enum: ["view", "edit"] }}],
   status: {type: String,enum: ["active", "delete"],default: "active"},
},
{ timestamps: true }
);


const subBoardModel = mongoose.model("subBoard", subBoardSchema);
module.exports = subBoardModel;
 
