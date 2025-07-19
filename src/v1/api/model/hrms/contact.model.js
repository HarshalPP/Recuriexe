const mongoose =require("mongoose")
const ContactSchema = new mongoose.Schema({
 
    //NAME OF OWNER ,CONTACT DETIAL ,RESIDENTIAL ADDRESS ,ACCOUNT DETAIL ,NAME AS PER ACCOUNT ,ACCOUNT NUMBER ,IFSC CODE ,BANK NAME ,PM RENT ,ADVANCE DEPOSTED AMT ,DATE OF TRANSFER ,UTR DETAIL ,AGRREMENT UPLOAD ,DOCUMENTS UPLOAD ,BRANCH FRONT ,BRNACH INSIDE -1,BRNACH INSIDE -2,APPROACH ROAD

    NameOfOwner:{type:String,default:""},
    ContactDetail:{type:String,default:""},
    ResidentialAddress:{type:String,default:""},
    AccountDetail:{type:String,default:""},
    NameAsPerAccount:{type:String,default:""},
    AccountNumber:{type:String,default:""},
    IFSCCode:{type:String,default:""},
    BankName:{type:String,default:""},
    PmRent:{type:String,default:""},
    AdvanceDepositedAmt:{type:String,default:""},
    DateOfTransfer:{type:Date,default:""},
    UTRDetail:{type:String,default:""},
    AgrrementUpload:{type:String,default:""},
    DocumentsUpload:{type:String,default:""},
    BranchFront:{type:String,default:""},
    BranchInside1:{type:String,default:""},
    BranchInside2:{type:String,default:""},
    ApproachRoad:{type:String,default:""},
},{ timestamps: true }
);
const ContactDetails = mongoose.model("ContactDetails", ContactSchema);
module.exports = ContactDetails;


