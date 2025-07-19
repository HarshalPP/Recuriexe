const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const availabilityModelSchema = new Schema(
  {
    interviewerId: { type: ObjectId, ref: 'employee'},
    jobformId: { type: ObjectId, ref: 'jobApplyForm'},
    date: { type: Date, required: false },
    startTime: { type: String, required: false },
    endTime: { type: String, required: false },
    status: { type: String, enum: ['available', 'not available'], default: 'available' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
);

const availabilityModel = mongoose.model('availability', availabilityModelSchema);
module.exports = availabilityModel;

