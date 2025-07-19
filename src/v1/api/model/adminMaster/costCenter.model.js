const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const costCenterModelSchema = new Schema({
  title: { type: String,required: [true, "Title is required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
}, {
  timestamps: true
});


const costCenterModel = mongoose.model("costCenter", costCenterModelSchema);

module.exports = costCenterModel;
 