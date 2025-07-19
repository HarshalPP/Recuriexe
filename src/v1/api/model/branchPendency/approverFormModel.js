const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const technicalApproveFormSchema = new Schema({

  employeeId:              { type: ObjectId , default :null },
    customerId:              { type: ObjectId , default :null },
    LD:          { type: String , default :"" },
    
  propertyHolderInformation: {
    documentHolderName:       { type: String },
    fatherName:               { type: String },
    relationWithApplicant:    { type: String }
  },
  propertyLocationDetails: {
    houseNumber:              { type: String },
    surveyNumber:             { type: String },
    patwariHalkaNumber:       { type: String },
    wardNumber:               { type: String },
    villageName:              { type: String },
    gramPanchayat:            { type: String },
    tehsil:                   { type: String },
    district:                 { type: String },
    state:                    { type: String }
  },
  propertyAddressAndLandmark: {
    propertyLandmark:         { type: String },
    fullAddressOfProperty:    { type: String },
     
    // longitude:{type:Number,},
    // latitude:{type:Number,},
    latitudeOfTheProperty:           { type: String, default: "" },
    longitudeOfTheProperty:          { type: String, default: "" },

    
    location: {                                               
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }
    }
  },
  propertySpecifications: {
    propertyType:             { type: String },
    totalLandArea:            { type: String },
    totalBuiltUpArea:         { type: String },
    constructionType:         { type: String },
    constructionQuality:      { type: String },
    propertyAge:              { type: String },
    devlopmentPercentage:     { type: String }
  },
  propertyBoundaries: {
    eastBoundary:             { type: String },
    westBoundary:             { type: String },
    northBoundary:            { type: String },
    southBoundary:            { type: String }
  },

  propertyValuation: {
    landValue:                { type: String },
    constructionValue:        { type: String },
    fairMarketValueOfLand:    { type: String },
    valuationDoneBy:             { type: String },
    realizableValue:          { type: String }
  },

  completeDate:                { type: String, default: "" },
  status:                      { type: String, enum: ["incomplete", "complete", "reject", "approve", "pending"], default: "pending" }

}, {
  timestamps: true
});

module.exports = mongoose.model('approveTechnicalForm', technicalApproveFormSchema);
