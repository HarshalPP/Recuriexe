const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const locationSchema = new Schema({
 
    userId:{
        type: ObjectId,
        ref:"employee",
        required: true
    },
    lat: {
        type: String,
        required: true
    },
    long:  {
        type: String,
        required: true
    },
    date:{
        type:String,
        required:true,
    },
    time:  {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const locationModel = mongoose.model("locationLog", locationSchema);

module.exports = locationModel;
