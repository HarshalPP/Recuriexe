const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;


const branchExpenceModel = new Schema({

    branchExpenceId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },

    entries: [{
   
        Branch:{
            type:String,
            default:""
        },

        Type:{
            type:String,
            default:""
        },

        Amount:{
            type:Number,
            default:0
        },

        payMode:{
            type:String,
            default:""
        },
        upload:{
            type:String,
            required:false,
            default:""
        },
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

}, { timestamps: true })


// pre-save validation for branchExpenceModel

branchExpenceModel.pre('validate' , async function(next){
    const doc = this;

    if(!doc.formConfigId){
        const formConfig = await mongoose.model('formConfig').findOne({formName: 'branchExpence'});
        if(formConfig){
            doc.formConfigId = formConfig.formConfigId;
        }
    }

    if(!doc.branchExpenceId){
        try{
            const lastestBranchExpence = await mongoose.model('branchExpence').findOne({} , {} , { sort: { 'createdAt' : -1 } });
            let nextSeq = 1;
            if(lastestBranchExpence && lastestBranchExpence.branchExpenceId){
                const lastSeq = parseInt(lastestBranchExpence.branchExpenceId.replace('FINBE', ''), 10);
                nextSeq = lastSeq + 1;
            }

            // Generate the branchExpenceId with FINBE prefix and padded number //

            doc.branchExpenceId = 'FINBE' + nextSeq.toString().padStart(4, '0');
            next();
            
        }
        catch(err){
            next(err);
        }
    }

    else{
        next();
    }
})


const branchExpenceDetails = mongoose.model('branchExpence' , branchExpenceModel);
module.exports = branchExpenceDetails;
