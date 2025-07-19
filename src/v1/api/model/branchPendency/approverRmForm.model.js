const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const legalRmDocuments = new Schema({
    employeeId: { type: ObjectId, default: null },
    customerId: { type: ObjectId, default: null },
    
    LD: { type: String, default: "" },
    rmRegistrationNumber: { type: String, default: "" },
    rmRegistrationDate: { type: String, default: "" },
    partnerName: { type: String, default: "" },
    remarks: { type: String, default: "" },
    statusOfReport: { type: String, default: "" },

    completeDate: { type: String, default: "" },
    status: { type: String, enum: ["incomplete", "complete", "reject", "approve", "pending"], default: "pending" }
},
    {
        timestamps: true,
    }
);

const legalRmDetails = mongoose.model(
    "approveRmReport",
    legalRmDocuments
);


module.exports = legalRmDetails;
