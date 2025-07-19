const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const groupTaskModelSchema = new Schema({
  groupName: {
    type: String,
    required: true
},
groupTask: {
  type: String,
  required: true
},
groupId: {
    type: String,
    required: true,
    unique: true
},
createdBy: {
    type: ObjectId,
    ref: 'Employee',
    required: true
},
members: [{
    employeeId: {
        type: ObjectId,
        ref: 'Employee',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: String,
        default: ""
    },
    leftAt: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}],
isActive: {
    type: Boolean,
    default: true
}
}, {
timestamps: true
});

const groupTaskModel = mongoose.model("groupTask", groupTaskModelSchema);

module.exports = groupTaskModel;
