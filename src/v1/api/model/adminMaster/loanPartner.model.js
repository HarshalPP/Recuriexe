const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const loanPartnerSchema = new Schema({
  title: { type: String,required: [true, "Title is required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
}, {
  timestamps: true
});


const loanPartnerModel = mongoose.model("loanPartner", loanPartnerSchema);

module.exports = loanPartnerModel;
 