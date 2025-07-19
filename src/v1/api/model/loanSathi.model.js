const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const loanSathiSchema = new Schema({
    loanSathiId:{
        type:String,
        required:true,
        unique:true
    },
    fullName: {
        type: String,
        required: true
    },
    email:  {
        type: String,
        required: true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    userName:  {
        type: String,
        required: true
    },
    password:  {
        type: String,
        required: true
    },
    roleName:  {
        type: String,
        required: true,
        ref: "role"
    },
    salesPersonId: {
        type: String,
        required: true,
        ref: "employee"
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const loanSathiModel = mongoose.model("loanSathi", loanSathiSchema);

module.exports = loanSathiModel;
