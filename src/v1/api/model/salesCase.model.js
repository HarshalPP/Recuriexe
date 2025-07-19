// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// ObjectId = Schema.ObjectId;

// const salesCaseSchema = new mongoose.Schema({
//     customerId: { type: ObjectId },
//     employeId:{type:ObjectId},
//           agriculturePhotos: { type: [String],  },
//           milkPhotos: { type: [String],  },
//           animalPhotos:{ type: [String]},
//           last3MonthSalarySlipPhotos: { type: [String], },
//           bankStatementPhoto: { type: String, },
//           salaryPhotos: { type: [String], },
//           incomeOtherImages:{type:[String]},
//           incomePhotos:{type:[String]},
//     property: {
//       propertyOwnerName: { type: String, default: "" },
//       relationWithApplicant: { type: String, default: "" },
//       villageName: { type: String, default: "" },
//     },
//       selfiWithCustomer: {type:String},
//       photoWithLatLong: {type:String},
//       front: {type:String},
//       leftSide: {type:String},
//       rightSide: {type:String},
//       approachRoad: {type:String},
//       mainRoad: {type:String},
//       interiorRoad: {type:String},
//     propertyOtherPhotos:{type:[String], default:""},
//     incomeDocuments:{type:[String], default:""},
//     propetyDocuments:{type:[String], default:""},
//   },
//   {
//     timestamps: true,
//   }
// );

// const salesCaseModel = mongoose.model("salesCase", salesCaseSchema);

// module.exports = salesCaseModel;





const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const salesCaseSchema = new mongoose.Schema({
  customerId: { type: ObjectId, ref: "customerdetail", default: null, unique: true },
  employeId: { type: ObjectId, ref: "employee", default: null },

  dronePatta: { type: [String], default: [] },
  propertyPhoto: { type: [String], default: [] },
  workPhoto: { type: [String], default: [] },
  electricityBill: { type: [String], default: [] },
  samagraIdCard: { type: [String], default: [] },
  udyam: { type: [String], default: [] },
  bankStatement: { type: [String], default: [] },
  incomeDocument: { type: [String], default: [] },
},
  {
    timestamps: true,
  }
);

const salesCaseModel = mongoose.model("salesCase", salesCaseSchema);

module.exports = salesCaseModel;
