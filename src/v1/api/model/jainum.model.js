const mongoose = require('mongoose')
const Schema = mongoose.Schema
ObjectId = Schema.ObjectId;



const jainumSchema = new Schema({

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'

    },

    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    },

    cid: {
        type: String,
    },

    cid_crypt: {
        type: String
    },

    file_number: {
        type: String
    },

    merchant_id: {
        type: String
    },

    Type: {
        type: String
    },
    loan_id: {
        type: String
    },
    loan_idcrypt: {
    type: String
    },
    loan_number:{
        type:String,
        default:""
    },

    installment_start_date:{
        type: Date,
        default:null
    },

    product_scheme_code:{
        type: String,
        default:""
    },

    AmountPaid:{
        type:String
    }
},
    {
        timestamps: true
    })


const jainummodel = mongoose.model("Jainumdata", jainumSchema)
module.exports = jainummodel