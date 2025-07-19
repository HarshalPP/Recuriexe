const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const leadGenerateModelSchema = new Schema({

    loanTypeId: { type: ObjectId, ref: 'product', default: null  , required: true},
    remark: { type: String, default: "" },
    customerName: { type: String, default: "" },
    city: { type: String, default: "" },
    customerMobileNo: { type: String, default: "" },
    loanAmount: { type: String },
    pincode: { type: String, default: "" },
    monthlyIncome: { type: String },
    distrct: { type: String, default: "" },
    state:{type:String,default:""},
}, {
    timestamps: true,
})


const WebleadGenerateModel = mongoose.model('LeadGenerateWebsite', leadGenerateModelSchema);

module.exports = WebleadGenerateModel;