const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const roleSchema = new Schema({
  roleName: { type: String,required: [true, "Role Name is required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
},{
  timestamps:true
});



const roleModel = mongoose.model("role", roleSchema);

module.exports = roleModel;
