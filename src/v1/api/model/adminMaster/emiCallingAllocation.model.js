const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const emiCallingAllocationSchema = new Schema({
 allocatedBy:   { type: String , deafault: ""},
 customerFinId:{ type: String  , deafault: ""},
 allocation1:  { type: String  , deafault: ""},
 allocation2:  { type: String  , deafault: ""},
 allocation3:  { type: String  , deafault: ""},
 allocation4:  { type: String  , deafault: ""},
 status: {  type: String , enum: ["active", "inactive"],default: "active" },

}, {
  timestamps: true
});


const emiCallingAllocationModel = mongoose.model("emiCallingAllocation", emiCallingAllocationSchema);

module.exports = emiCallingAllocationModel;
 