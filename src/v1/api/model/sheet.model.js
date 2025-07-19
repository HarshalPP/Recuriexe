const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const sheetSchema = new Schema({
    sheetId: {
        type: String,
        required: true,
        unique: true
    },
    sheetCategoryId: {
        type: String,
        required: true,
        ref: "sheetCategory"
    },
    sheetName: {
        type: String,
        required: true,
    },
    sheetDescription: {
        type: String,
        required: true,
    },
    sheetLink: {
        type: String,
        required: true,
    },
    assignedEmployees:[{
        type:String,
        ref:'employee'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
});

const sheetModel = model("sheet", sheetSchema);

module.exports = sheetModel;
