const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const legalTechnicalDocuments = new Schema({
    employeeId: { type: ObjectId, default: null },
    customerId: { type: ObjectId, default: null },
    LD: { type: String, default: "" },
    reportDate: { type: String, required: true },
    place: { type: String, required: true },
    otherTaggingDetail: [{
        tagNo: { type: String, required: true },
        animal: { type: String, required: true },
        breed: { type: String, default: "" },
        gender: { type: String, default: "" },
        colour: { type: String, default: "" },
        milkInLitersPerDay: { type: Number, default: 0 },
        priceOfAnimal: { type: Number, default: 0 },
    }],

    remarks: { type: String, default: "" },
    statusOfReport: { type: String, default: "" },
    completeDate: { type: String, default: "" },
    status: { type: String, enum: ["incomplete", "complete", "reject", "approve", "pending"], default: "pending" }
},
    {
        timestamps: true,
    }
);

const legalTechnicalDetails = mongoose.model(
    "approveTaggingReport",
    legalTechnicalDocuments
);


module.exports = legalTechnicalDetails;
