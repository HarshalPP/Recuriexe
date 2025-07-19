const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OthersModel = new Schema({
    employeeId:         [{ type: ObjectId , default :null }],
    customerId:              { type: ObjectId , default :null },
    approvalEmployeeId:       { type: ObjectId , default :null },
    LD:                 { type: String , default :"" },
    AddDocument: [
        {
            DocumentName: {
                type: String,
                default: null
            },
            UploadDocument: [
                {
                    type: String,
                    default: null 
                }
            ]
        }
    ],
    remarkByBranchVendor:  { type: String , default :"" },
    remarkByApproval:        { type: String , default :"" },
    approvalDate :           { type: String , default :"" },
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" },
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},
}, {
    timestamps: true,
});

const OtherDocumentDetails = mongoose.model('OtherDocumentDetails', OthersModel);

module.exports = OtherDocumentDetails;
