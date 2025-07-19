const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.Types.ObjectId;



const regulationSchema = new Schema({
    employeeId:{
        type: ObjectId,
        ref: 'employee',
        required:false
    },

    date: {
        type: Date,
        required: false
    },

    Reason:{
        type: String,
        required: false
    },

    reportingManagerId:{
        type: ObjectId,
        ref: 'employee',
        required: false
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: false
    },

    approvedBy: {
        type: ObjectId,
        ref: 'employee',
        required: false
    },

    approvalDate: {
        type: Date,
        required: false
    },

    mark:{
        type: String,
        default: '',
    }

},{
    timestamps: true
})


const regulationModel = mongoose.model('regulation', regulationSchema);
module.exports = regulationModel;