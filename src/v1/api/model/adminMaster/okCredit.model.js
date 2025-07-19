const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const okCreditModelSchema = new Schema({
   employeeId: { type: ObjectId,required: [true, "EmployeeId is required"]},
   creditNo: { type: Number,required: [true, "creditNo is required"]},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const okCreditModel = mongoose.model("okCredit", okCreditModelSchema);

module.exports = okCreditModel;
 