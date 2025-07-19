const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const customerPaymentSchema = new Schema({
    customerId: { type: ObjectId, default: null },
    customerName: { type: String, default: "" },
    paymentStatus: { type: String, default: "" },
    txnRefNo: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    amount: { type: Number, default: null },
    paymentGateway: { type: String, default: "" },
    paymentDate: { type: Date, default: null },
},
    {
        timestamps: true,
    }
);


const customerPaymentModel = mongoose.model("customerPayment", customerPaymentSchema);

module.exports = customerPaymentModel;
