const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;


const stampRequestModel = new Schema({
 stampRequestId: {
     type: String,
     unique: true,
     required: true,
     index: true,
 },

 entries:[{
     lender: {
         type: ObjectId,
         ref:"lender",
         required: true
     },

        vendor: {
            type: ObjectId,
            ref:"vendor",
            required: true
        },

       ldNo:{
           type:String,
           required: true
       },
       
       Denominatior:{
           type:String,
           required: true
       },
       
       Quantity:{
           type:String,
           required: true
       }

    
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

viewer:[{
  type: ObjectId,
  ref:"employee",
  default: null
}],

isActive: {
  type: Boolean,
  default: true
},

createdBy: {
  type: ObjectId,
  ref: "employee",
},
updatedBy: {
    type: ObjectId,
    ref: "employee",
},

},{
timestamps: true

});

stampRequestModel.pre('validate', async function (next) {
const doc = this;
if(!doc.formConfigId){
    const formConfig = await mongoose.model('formConfig').findOne({formName: "stampRequest"});
    if(formConfig){
        doc.formConfigId = formConfig.formConfigId;
    }
}

if(!doc.stampRequestId){
try{

    const latestStampRequest = await mongoose.model('stampRequest').findOne({}, {}, {sort: {'createdAt': -1}});
    let nextSeq = 1;
    if(latestStampRequest && latestStampRequest.stampRequestId){
     const latestSeq = parseInt(latestStampRequest.stampRequestId.replace('FINSR', ''), 10);
     nextSeq = latestSeq + 1;
    }

    doc.stampRequestId = 'FINSR' + nextSeq.toString().padStart(4, '0');
    next();

}catch(error){
    next(error);
}
}
else{
    next();
}
})

const stampRequestDetails = mongoose.model('stampRequest', stampRequestModel);
module.exports = stampRequestDetails;