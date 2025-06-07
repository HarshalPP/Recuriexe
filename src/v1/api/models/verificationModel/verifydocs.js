import mongoose from "mongoose";
const Schema = mongoose.Schema;

const verifydocs = new Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    default: null,
  },

  type: {
    type: String,
  },

  panverification: {
    type: String,
    default: "false",
  },
  panData: {
    type: Object,
    default: {},
  },

  bankverification: {
    type: String,
    default: "false",
  },
  bankData: {
    type: Object,
    default: {},
  },

  aadharverification: {
    type: String,
    default: "false",
  },
  aadharData: {
    type: Object,
    default: {},
  },

  addressverification: {
    type: String,
    default: "false",
  },
  addressData: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
});

const verifydocument = mongoose.model("verifydocs", verifydocs);
export default verifydocument;
