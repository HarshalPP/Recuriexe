const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const vendorInvoiceSchema = new Schema(
    {
        customerId: { type: ObjectId, ref: "customerdetail", required: true },
        assignDate: { type: String, default: "" },
        assignById: { type: ObjectId, ref: "employee", required: true },
        vendorId: { type: ObjectId, ref: "vendor", required: true },
        completeDate: { type: String, default: "" },
        vendorStatus: { type: String, default: "" },
        uploadProperty: { type: [String], default: null },
        paymentUpdateDate: { type: String, default: "" },
        paymentUpdateById: { type: ObjectId, ref: "employee", default: null },
        serviceType: {
            type: String,
            enum: ["firstLegal", "finalLegal", "vettingLegal", "new", "revise",""],
            default: ""
        },
        fileRate: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["WIP", "complete",""],
            default: ""
        },
        paymentStatus: {
            type: String,
            enum: ["due", "paid", "onHold" , "",],
            default: ""
        },
    },
    {
        timestamps: true
    }
)

const vendorInvoiceModel = mongoose.model("vendorInvoice", vendorInvoiceSchema);
module.exports = vendorInvoiceModel;
