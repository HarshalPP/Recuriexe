const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const callDoneModelSchema = new Schema({
    LD:                  { type: String,default:null},
    customerName:        { type: String,default:""},
    callBy:              { type: String,default:null},
    crmType:             { type: String,default:""},
    date:                { type: String,default:null},
    callStatus:          { type: String, default:null},
    callRemark:          { type: String, default:""},
    reCallDate:          { type: String, default:null},
    reCallTime:          { type: String, default:null},
    customerResponse:    { type: String, default:""},
    paymentAmount:       { type: Number, default: 0 },
    reasonForNotPay:     { type: String, default:""},
    solution:            { type: String, default:""},
    reasonForCustomerNotContactable:  { type: String, default:""},
    newContactNumber:    { type: Boolean, enum :[true, false], default: false},
    status:              { type: String, enum :["pending","done"], default:"done" },

},
{
  timestamps: true,
}
);

const callDoneModel = mongoose.model("callDone", callDoneModelSchema);

module.exports = callDoneModel;
