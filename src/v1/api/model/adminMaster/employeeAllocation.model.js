const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const employeeAllocationModelSchema = new Schema({
 allocatedBy:   { type: String , deafault: ""},
 customerFinId:{ type: String  , deafault: ""},
 allocation1:  { type: String  , deafault: ""},
 allocation2:  { type: String  , deafault: ""},
 allocation3:  { type: String  , deafault: ""},
 allocation4:  { type: String  , deafault: ""},
 allocation5:  { type: String  , deafault: ""},
 allocation6:  { type: String  , deafault: ""},
 allocation7:  { type: String  , deafault: ""},
 allocation8:  { type: String  , deafault: ""},
 status: {  type: String , enum: ["active", "inactive"],default: "active" },

}, {
  timestamps: true
});


const employeeAllocationModel = mongoose.model("employeeAllocation", employeeAllocationModelSchema);

module.exports = employeeAllocationModel;
 