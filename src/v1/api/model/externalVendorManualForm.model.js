const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const externalManualSchema = new Schema(
    {
        status :  { type: String, enum: ["incomplete" , "pending" , "complete"], default: "pending" },
        externalVendorId: { type: ObjectId, default: null },
        customerFinId: { type: String, default: "" },
        applicantFullName: { type: String, default: "" },
        applicantFatherName: { type: String, default: "" },
        applicantMobileNo: { type: Number },
        applicantAddress: { type: String, default: "" },
        coApplicantFullName: { type: String, default: "" },
        coApplicantMobileNo: { type: Number },
        coApplicantAddress: { type: String, default: "" },
        guarantorFullName: { type: String, default: "" },
        guarantorMobileNo: { type: Number },
        guarantorAddress: { type: String, default: "" },
        
        rcu: {
            rcuVendorId: { type: ObjectId, ref: "vendor", default: null },
            statusByRCUVender: { type: String, enum: ["pending", "WIP", "complete"], default: "pending" },
            uploadRcuDocuments: { type: [String], default: null },
            uploadProperty: { type: String, default: null },
            status: {
                type: String,
                enum: ["incomplete", "negative", "credit Refer", "positive"],
                default: "incomplete",
            },
            reason: { type: String, default: "" },
        },

        legal: {
            legalVendorId: { type: ObjectId, ref: "vendor", default: null },
            statusByLegalVender: { type: String, enum: ["pending", "WIP", "complete"], default: "pending" },
            uploadLegalDocuments: { type: [String], default: null },
            uploadProperty: { type: String, default: null },
            status: {
                type: String,
                enum: ["incomplete", "negative", "credit Refer", "positive"],
                default: "incomplete",
            },
            reason: { type: String, default: "" },
        },

        technical: {
            technicalVendorId: { type: ObjectId, ref: "vendor", default: null },
            statusByTechnicalVender: { type: String, enum: ["pending", "WIP", "complete"], default: "pending" },
            uploadTechnicalDocuments: { type: [String], default: null },
            uploadProperty: { type: String, default: null },
            status: {
                type: String,
                enum: ["incomplete", "negative", "credit Refer", "positive"],
                default: "incomplete",
            },
            reason: { type: String, default: "" },
        },

        otherVendor: {
            otherVendorId: { type: ObjectId, ref: "vendor", default: null },
            statusByOtherVender: { type: String, enum: ["pending", "WIP", "complete"], default: "pending" },
            uploadOtherDocuments: { type: [String], default: null },
            uploadProperty: { type: String, default: null },
            status: {
                type: String,
                enum: ["incomplete", "negative", "credit Refer", "positive"],
                default: "incomplete",
            },
            reason: { type: String, default: "" },
        },

        branchVendor: {
            branchVendorId: { type: ObjectId, ref: "vendor", default: null },
            statusByBranchVendor: { type: String, enum: ["pending", "WIP", "complete"], default: "pending" },
            uploadBranchDocuments: { type: [String], default: null },
            uploadDoc: { type: [String], },
            requirement: [{ type: String }],
            status: {
                type: String,
                enum: ["incomplete", "negative", "credit Refer", "positive"],
                default: "incomplete",
            },
            reason: { type: String, default: "" },
        },
    },
    {
        timestamps: true,
    }
);

const externalManualModelSchema = mongoose.model("externalVendorManualForm", externalManualSchema);

module.exports = externalManualModelSchema;
