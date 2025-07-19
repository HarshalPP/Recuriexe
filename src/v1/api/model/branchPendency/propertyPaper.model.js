const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const gtrPdcModel = new Schema({
  employeeId:         [{ type: ObjectId , default :null }],
  customerId:              { type: ObjectId , default :null },
  approvalEmployeeId:       { type: ObjectId , default :null },
    // employeeId:         { type: ObjectId , default :null },
    propertyPapersKycDocument : { type: [String]},
    LD:                 { type: String , default :"" },
    // customerName:       { type: String , default :"" },
    propertyOwnerName:  { type: String , default :"" },
    relationWithCustomer:{ type: String , default :"" },
    documentType:       { type: String , default :"" },
    houseNo:              { type: String , default:""},            
    surveyNo:              { type: String , default:""},            
    patwariHalkaNo:              { type: String , default:""},            
    wardNo:              { type: String , default:""},             
    villageName:              { type: String , default:""},            
    grampanchayatName:              { type: String , default:""},            
    tehsilName:              { type: String , default:""},             
    districtName:              { type: String , default:""},             
    pincode:              { type: String , default:""},             
    stateName:              { type: String , default:""},            
    eastBoundary:              { type: String , default:""},            
    westBoundary:              { type: String , default:""},            
    northBoundary:              { type: String , default:""},             
    southBoundary:              { type: String , default:""},            
    plotLength:              { type: String , default:""},             
    plotBridth:              { type: String , default:""},            
    totalPlotArea:              { type: String , default:""},            
    totalAreaOfConstruction:              { type: String , default:""},            
    typeOfConstruction:              { type: String , default:""},             
    ageOfProperty:              { type: String , default:""},            
    pattaNo:              { type: String , default:""},            
    pattaDate:              { type: String , default:""},             
    buildingPermissionNo:              { type: String , default:""},            
    buildingPermissionDate:              { type: String , default:""},             
    mutationCertificateNo:              { type: String , default:""},            
    mutationCertificateDate:              { type: String , default:""},            
    ownerCertificateNo:              { type: String , default:""},            
    ownerCertificateDate:              { type: String , default:""},             
    taxReceiptNo:              { type: String , default:""},            
    taxReceiptDate:              { type: String , default:""},            
    nocCertificateNo:              { type: String , default:""},            
    nocCertificateDate:              { type: String , default:""},            
    coOwnershipDeedNo:              { type: String , default:""},             
    coOwnershipDeedDate:              { type: String , default:""},
    
    remarkByBranchVendor:  { type: String , default :"" },
    remarkByApproval:        { type: String , default :"" },
    approvalDate :           { type: String , default :"" },
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" },
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},

},
{
    timestamps: true,
  }
);

const propertyPaperKycModel = mongoose.model('propertyPaperKyc', gtrPdcModel);

module.exports = propertyPaperKycModel;
