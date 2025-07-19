
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const posCloserSchema = new mongoose.Schema({
    LD :                             {type: String, required: true},
    posCloserBy:                     { type: String, default:"" },
    customerName:                    { type: String, default:"" },
    mobileNo:                        { type: Number, default:null},
    amountToBeReceivedFromCustomer:  { type: Number, default:0,required: [true, "Received Amount Is Required"] },
    dateOfDeposit:             { type: String, default:"",required: [true, "Deposit Date Is Required"] },
    settlementForReason:       { type: String, default:"",required: [true, "settlement For Reason Is Required"] },
    settlementAmountByApproval:{ type: Number, default:0},
    status:                    { type: String, enum:["accept","pending","reject"], default:"pending" },
  },
  {
    timestamps: true,
  });

const posCloserModel = mongoose.model('posCloser', posCloserSchema);

module.exports =  posCloserModel 