const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const rmPaymentModel = new Schema({
    rmPaymentId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    claimType:{
        type:String,
        default:"claim"
    },
    lender: {
        type: ObjectId,
        ref:"lender",
        required: false,
        default:null
    },
    vendor: {
        type: ObjectId,
        ref:"vendor",
        required: false,
        default:null
    },

    entries:[{
        
        loanNo:{
            type:String,
            required: false,
            default:""
        },
        loan_amount:{
            type:Number,
            required: false,
            default:0
        },

        Date:{
            type:Date,
            required: false,
            default:Date.now()
        },

        deposited_by:{
            type:String,
            required: false,
            default:""
        },

        Remarks:{
            type:String,
            required: false,
            default:""
        },

        payment_upload:{
            type:String,
            required: false,
            default:""
        }
        // tehsilName: { 
        //     type: String,
        //      default: "" 
        //     },
        // branch: {
        //     type: ObjectId,
        //     ref:"newBranch",
        //     required: true
        //     },

        
    }],

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

// Pre-save middleware to generate the rmPaymentId automatically
rmPaymentModel.pre('validate', async function (next) {
    const doc = this;

    if (!doc.formConfigId) {
        const formConfig = await mongoose.model('formConfig').findOne({ formName: "rmPayment" });
        if (formConfig) {
            doc.formConfigId = formConfig.formConfigId;
        }
    }

    if (!doc.rmPaymentId) {
        try {
            // Find the latest rmPayment by sorting by created time
            const latestrmPayment = await mongoose.model('rmPayment').findOne({}, {}, { sort: { 'createdAt': -1 } });

            let nextSeq = 1; // Default if no rmPayments found

            if (latestrmPayment && latestrmPayment.rmPaymentId) {
                // Extract the number part from the latest rmPaymentId (e.g., FINAS0001 -> 1)
                const lastSeq = parseInt(latestrmPayment.rmPaymentId.replace('FINRP', ''), 10);
                nextSeq = lastSeq + 1; // Increment the sequence
            }

            // Generate new rmPaymentId with FINAS prefix and padded number
            doc.rmPaymentId = 'FINRP' + nextSeq.toString().padStart(4, '0');
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});



const rmPaymentDetail = mongoose.model('rmPayment', rmPaymentModel);

module.exports = rmPaymentDetail;
