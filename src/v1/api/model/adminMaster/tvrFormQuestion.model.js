const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const tvrFormQuestionSchema = new Schema({
  title: { type: String,required: [true, "Title  is required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
},{
  timestamps:true
});



const tvrFormQuestionModel = mongoose.model("tvrformQuestion", tvrFormQuestionSchema);

module.exports = tvrFormQuestionModel;
