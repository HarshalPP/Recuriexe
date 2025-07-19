const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const customerResponseSchema = new Schema({
  title: { type: String,required: [true, "Title is required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
}, {
  timestamps: true
});


const customerResponseModel = mongoose.model("customerResponse", customerResponseSchema);

module.exports = customerResponseModel;
 