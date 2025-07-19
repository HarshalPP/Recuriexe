const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const stampExpenseSchema = new Schema({
    assetId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    expanseName: {
        type: String,
        unique: true,
        required: true
    },
    purchaseValue: {
        type: Number,
        default: 0
    },
    paymentDetail: {
        type: String,
        default: ""
    },
    invoice: {
        type: String,
        default: ""
    },
    vendor: {
        type: String,
        default: ""
    },
    formConfigId: {
        type: String,
        ref: "formConfig"
    },
    approvalRequired: {
        type: Boolean,
        default: false
    },
    l1Approver: {
        type: ObjectId,
        ref: "employee",
        default: null
    },
    l1Status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    l1Remark: {
        type: String,
        default: ""
    },
    l2Approver: {
        type: ObjectId,
        ref: "employee",
        default: null
    },
    l2Status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    l2Remark: {
        type: String,
        default: ""
    },
    l3Approver: {
        type: ObjectId,
        ref: "employee",
        default: null
    },
    l3Status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    l3Remark: {
        type: String,
        default: ""
    },
    viewer: [{
        type: ObjectId,
        ref: "employee",
        default: null
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: ObjectId,
        ref: "employee"
    },
    updatedBy: {
        type: ObjectId,
        ref: "employee"
    }
},
    {
        timestamps: true,
    });

// Pre-save middleware to generate the assetId automatically
stampExpenseSchema.pre('validate', async function (next) {
    const doc = this;

    if (!doc.formConfigId) {
        const formConfig = await mongoose.model('formConfig').findOne({ formName: "asset" });
        if (formConfig) {
            doc.formConfigId = formConfig.formConfigId;
        }
    }

    if (!doc.assetId) {
        try {
            // Find the latest asset by sorting by created time
            const latestAsset = await mongoose.model('asset').findOne({}, {}, { sort: { 'createdAt': -1 } });

            let nextSeq = 1; // Default if no assets found

            if (latestAsset && latestAsset.assetId) {
                // Extract the number part from the latest assetId (e.g., FINAS0001 -> 1)
                const lastSeq = parseInt(latestAsset.assetId.replace('FINAS', ''), 10);
                nextSeq = lastSeq + 1; // Increment the sequence
            }

            // Generate new assetId with FINAS prefix and padded number
            doc.assetId = 'FINAS' + nextSeq.toString().padStart(4, '0');
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});



const stampDetail = mongoose.model('rmPaymentExpense', stampExpenseSchema);

module.exports = stampDetail;
