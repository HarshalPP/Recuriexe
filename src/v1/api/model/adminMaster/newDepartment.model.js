const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const newDepartmentModelSchema = new Schema({
    name: { type: String, required: [true, "Name Is Required"], unique: true },
    isSubDepartment: { type: Boolean, default: false },
    departmentId: {
        type: ObjectId,
        ref: "newdepartment",
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true }
);


const newDepartmentModel = mongoose.model("newdepartment", newDepartmentModelSchema);

module.exports = newDepartmentModel;
