const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const technicalReportKycSchema = new Schema(
  {
    employeeId: { type: ObjectId, default: null },
    LD: { type: String, default: "" },
    customerName: { type: String, default: "" },
    nameOfDocumentsHolder: { type: String, default: "" },
    addressAsPerInspection: { type: String, default: "" },
    landmark: { type: String, default: "" },
    typeOfLocality: { type: String, default: "" },
    typeOfProperty: { type: String, default: "" },
    typeOfStructure: { type: String, default: "" },
    areaOfPlot: { type: Number, default: 0 },
    totalBuiltUpArea: { type: Number, default: 0 },
    occupationStatus: { type: String, default: "" },
    occupancy: { type: String, default: "" },
    ageOfProperty: { type: Number, default: 0 },
    landValue: { type: Number, default: 0 },
    constructionValue: { type: Number, default: 0 },
    fairMarketValueOfLand: { type: Number, default: 0 },
    realizableValue: { type: Number, default: 0 },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    valuationDoneBy: { type: String, default: "" },
  },
  {
    timestamps: true, 
  }
);

const technicalReportKycModel = mongoose.model('technicalReportKyc', technicalReportKycSchema);

module.exports = technicalReportKycModel;
