const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const udhyamKycModel = new Schema({
    employeeId:              [{ type: ObjectId , default :null }],
    customerId:              { type: ObjectId , default :null },
    approvalEmployeeId:       { type: ObjectId , default :null },
    udhyamKycDocument:   { type: [String]},
    LD:                      { type: String , default :"" },
    // customerName:            { type: String , default :"" },

    udhyamRegistrationNo:    { type: String, default:"" },
    OrganisationName:                { type: String, default:"" },
    typeOfOrganisation:      { type: String , default :"" },
    natureOfBusiness:      { type: String , default :"" },
    MsmeClassification:      { type: String , default :"" },
    dateOfIncorporation:     { type: String , default :"" },
    AddressOfFirm:{
      fullAddress:     { type: String , default :"" },
      landmark:     { type: String , default :"" },
      city:     { type: String , default :"" },
      districtName:     { type: String , default :"" },
      state:     { type: String , default :"" },
      country:     { type: String , default :"" },
      pinCode:     { type: String , default :"" },
      mobileNumber:     { type: String , default :"" },
      emailId:     { type: String , default :"" },
      noOfYearsInCurrentAddress:     { type: String , default :"" },
      businessPremises:     { type: String , default :"" },
    },//
    // dateOfUdhyamRegistration:{ type: String, default:"" },
    // nameOfUnit:              { type: String , default :"" },
    // typeOfEnterprises:       { type: String , default :"" },
    // ownerName:               { type: String , default :"" },
    // addressOfEnterprises:    { type: String , default :"" },

// FOr jainum Use //
    udyamDetails:{
      udyamRegistrationNo: { type: String , default : "" },
      organisationType: { type: String , default : "" },
      socialCategory: { type: String , default : "" },
      dateofIncorporation: { type: String , default : "" },
      majorActivity: { type: String , default : "" },
      DateofCommencementofProductionBusiness: { type: String , default : "" },
      enterpriseType: { type: String , default : "" },
      enterpriseName: { type: String , default : "" },
      classificationDate: { type: String , default : "" },
      classificationYear: { type: String , default : "" },
      officialAddressOfEnterprise: {
        FlatDoorBlockNo: { type: String , default : "" },
        VillageTown: { type: String , default : "" },
        RoadStreetLane: { type: String , default : "" },
        state: { type: String , default : "" },
        mobile: { type: String , default : "" },
        nameofPremisesBuilding: { type: String , default : "" },
        block: { type: String , default : "" },
        city: { type: String , default : "" },
        district: { type: String , default : "" },
        pin: { type: String , default : "" },
      },
      nationalIndustryClassificationCode: {
        activity: { type: String , default : "" },
        date: { type: String , default : "" },
        nic2Digit: { type: String , default : "" },
        nic4Digit: { type: String , default : "" },
        nic5Digit: { type: String , default : "" },
        dicName: { type: String , default : "" },
        msmeDFO: { type: String , default : "" },
        DateofUdyamRegistration: { type: String , default : "" },
      },
      unitsDetails: {
        unitName: { type: String , default : "" },
        flat: { type: String , default : "" },
        building: { type: String , default : "" },
        VillageTown: { type: String , default : "" },
        block: { type: String , default : "" },
        road: { type: String , default : "" },
        city: { type: String , default : "" },
        pin: { type: String , default : "" },
        state: { type: String , default : "" },
        district: { type: String , default : "" },
      },
    },

    remarkByBranchVendor:  { type: String , default :"" },
    remarkByApproval:        { type: String , default :"" },
    approvalDate :           { type: String , default :"" },
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" },
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"}
},
{
    timestamps: true,
  }
);

const udhyamKycDetail = mongoose.model('branchUdhyamKyc', udhyamKycModel);

module.exports = udhyamKycDetail;
