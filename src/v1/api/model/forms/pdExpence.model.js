const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const pdExpenceModel = new Schema({
    pdExpenceId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
  entries: [
    {
      dateofvisit: {
        type: Date,
        required: true,
      },
      fileNo: {
        type: String,
        required: true,
      },
      customerName: {
        type: String,
        required: true,
      },
      kmtravel: {
        type: Number,
        required: true,
      },
      caseStatus: {
        type: String,
        required: true,
      },
      upload:{
        type:String,
        required:false,
        default:""
    },

    branch:{
        type:"String",
        required:false,
        default:""
    },

    Amount:{
        type: "String",
        required: false,
        default:""
    }
    },
  ],
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
},{
    timestamps: true,
});

pdExpenceModel.pre('validate' , async function(next){
    const doc = this;
    if(!doc.formConfigId){
        const formConfig = await mongoose.model('formConfig').findOne({formName: 'pdExpence'});
        if(formConfig){
            doc.formConfigId = formConfig.formConfigId;
        }
    }

    if(!doc.pdExpenceId){
        try{
         
            const latestPdExpence = await mongoose.model('pdExpence').findOne({} , {} , {sort: {'createdAt': -1}});
            let nextSeq = 1;
            if(latestPdExpence && latestPdExpence.pdExpenceId){
             const lastSeq = parseInt(latestPdExpence.pdExpenceId.replace('FINPD' , '') ,  10);
             nextSeq = lastSeq + 1;
            }

            doc.pdExpenceId = 'FINPD' + nextSeq.toString().padStart(4 , '0');
            next();
        }catch(err){
            next(err);
        }
    }
    else{
        next();
    }

})

const pdExpenceDetails = mongoose.model('pdExpence' , pdExpenceModel);
module.exports = pdExpenceDetails;



