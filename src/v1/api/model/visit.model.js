const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const visitModelSchema = new Schema({
    LD:                  { type: String,default:""},
    customerName:        { type: String,default:""},
    visitBy:             { type: String,default:"" },
    visitDate:           { type: String, default:""},
    revisitDate:           { type: String, default:""},
    newContactNumber:    { type: Number, default:null },
    customerResponse:    { type: String, default:""},
    paymentAmount:       { type: Number, default: 0 },
    reasonForNotPay:     { type: String, default:""},
    solution:            { type: String, default:""},
    reasonForCustomerNotContactable:  { type: String, default:""},
    visitSelfie:         { type: String, default:""},
    address:             { type: String, default:""},
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], required: true }
     },
    status:    { type: String, enum :["accept","pending","reject"], default:"pending" },
    reason:              { type: String, default:"" },
},
{
  timestamps: true,
}
);

visitModelSchema.index({ location: "2dsphere" });


const visitModel = mongoose.model("visit", visitModelSchema);

module.exports = visitModel;
