const mongoose = require('mongoose');

const physicalFileCourierSchema = new mongoose.Schema({
  customerId: { type: ObjectId, ref: "customerdetail", default: null, unique: true },
  courierDate: { type: Date, default: "" },
  courierCompany: { type: String, default: "" },
  podNo: { type: String, default: "" },
  receipt: { type: String, default: "" },
});

const PhysicalFileCourier = mongoose.model('PhysicalFileCouriertoLender', physicalFileCourierSchema);

module.exports = PhysicalFileCourier;