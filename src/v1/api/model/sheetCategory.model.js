const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const sheetCategorySchema = new Schema({
    sheetCategoryId: {
        type: String,
        required: true,
        unique: true
    },
    sheetCategoryName: {
        type: String,
        required: true,
        unique: true
    },
    custom: {
        type: Boolean,
        default: false
    },
    creator: {
        type: String,
        ref: 'employee'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    schemaVersion: {
        type: Number,
        default: 0
    }
});

const sheetCategoryModel = model("sheetCategory", sheetCategorySchema);

module.exports = sheetCategoryModel;
