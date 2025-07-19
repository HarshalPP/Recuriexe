const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const questionModelSchema = new Schema({
  userId: { type: ObjectId },
  question_Answer: [
    {
      question: { type: String, default: "" },
      answer: { type: String, default: "" },
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
    },
  ],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
},
  {
    timestamps: true,
  }
);

const questionModel = mongoose.model("question", questionModelSchema);

module.exports = questionModel;
