const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const vendorSchema = new Schema(
  {
    customerId: { type: ObjectId, ref: "customerdetail", default: null ,unique: true },
    externalVendorId: { type: ObjectId, ref: "employee", default: null },
    partnerNameId: { type: ObjectId, ref: 'lender', default: null },
    branchNameId: { type: ObjectId, ref: 'newbranch', default: null },
    creditPdId: { type: ObjectId, ref: "employee", default: null },
    creditPdRejectPhoto: { type: [String], default: "" },
    pdfCreateByCreditPd: { type: String, default: "" },
    remarkForCreditPd: { type: String, default: "" },
    remarkByCreditPd: { type: String, default: "" },
    reasonForReject: { type: String, default: "" },
    creditPdCompleteDate: { type: String, default: "" },
    creditPdAssignDate: { type: String },
    creditPdApprovarDate: { type: String, default: "" },
    approvalRemarkCreditPd: { type: String, default: "" },
    pdApproverEmployeeId: { type: ObjectId, ref: "employee", default: null },
    pdAssignEmployeeId: { type: ObjectId, default: null },
    creditPdSendMail: {
      type: String, enum: ["mailSend", "mailNotSend", "mailAgainSend"],
      default: "mailNotSend",
    },
    statusByCreditPd: {
      type: String,
      enum: ["incomplete", "WIP", "complete", "pending", "approve", "reject", "notAssign", "notRequired", "rivert", "accept", "rejectByApprover" , "rejectByHo"],
      default: "notAssign",
    },

    hoCompleteDate: { type: String , default :"" },
    hoRePdDate: { type: String , default :"" },
    remarkByHo: { type: String , default :"" },
    hoEmployeeId: { type: ObjectId, ref: 'employee', default: null },
    hoStatus: {
      type: String,
      enum: ["rePd", "complete", "notComplete", "notAssign","correction"],
      default: "notAssign"
    },

    vendors: [{
      vendorType: { type: String, default: '' },
      vendorId: { type: ObjectId, ref: "vendor", default: null },
      assignDocuments: { type: [String], default: null },
      pdfRemark: { type: String, default: '' },
      externalVendorRemark: { type: String, default: "" },
      uploadProperty: { type: [String], default: null },
      finalLegalUpload: { type: [String], default: [] },
      vettingLegalUpload: { type: [String], default: [] },
      estimateDocument : { type: [String], default: [] },
      remarkByVendor: { type: String, default: '' },
      sendMail: {
        type: String, enum: ["mailSend", "mailNotSend", "mailAgainSend"],
        default: "mailNotSend",
      },
      statusByVendor: {
        type: String,
        enum: ["notRequired", "notAssign", "WIP", "approve", "complete", "reject"],
        default: "notAssign",
      },
      fileStageStatus : {type: String, enum: ["firstLegal","finalLegal","vettingLegal","new","revise",""], default: ""},
      receiverName: { type: String,default: '' },
      vendorStatus: { type: String ,default : ""},
      reason: { type: String, default: "" },
      requirement: { type: [String] ,default: [] },
      numberOfCattle: { type: String ,default: ''},
      cattlesBreed: { type: String , default: '' },
      milkLitPerDay: { type: String , default: '' },
      areaOfLand: { type: String , default: '' },
      areaOfConstruction: { type: String , default: '' },
      fairMarketValue: { type: String , default: '' },
      vendorUploadDate: { type: String , default: '' },
      approverRemark: { type: String, default: '' },
      approverDate: { type: String ,default: ''},
      assignDate: { type: String, default: "" },
      approverEmployeeId: { type: ObjectId, ref: "employee", default: null },
      assignEmployeeId: { type: ObjectId, ref: "employee", default: null },
    }],
    location: {
      type: { type: String },
      coordinates: { type: [Number] }
    },
    rcuImageUploads: {
      selfiWithLatLongHouseFront: { type: String, default: null },
      customerPhotoWithHouseFront: { type: String, default: null },
      houseTotalLengthPhoto: { type: String, default: null },
      houseTotalWidthPhoto: { type: String, default: null },
      houseLeftSidePhoto: { type: String, default: null },
      houseRightSidePhoto: { type: String, default: null },
      houseApproachRoadPhoto: { type: String, default: null },
      kitchenPhotos: { type: String, default: null }
    },
    status: { // Ho sTATUS
      type: String,
      enum: ["incomplete", "complete", "pending", "reject"],
      default: "incomplete",
    },

    fileRevertStatusByPd: { type: String, enum: ["allDone", "formRequired",], default: "allDone" },
    fileRevertRemarkByPd: { type: String, default: "" },
    fileRevertStatusBySales: {
      coApplicant: { type: Boolean, default: true },
      guarantor: { type: Boolean, default: true },
    },
    fileRevertStatusByCibil: { type: Boolean, default: true },

    fileHoldRemark: { type: String, default: "" },
    fileStatus: { type: String, enum: ["active", "inactive"], default: "active" },

    queryDetails: [
      {
        query: { type: String },
        queryType: { type: String, enum: ["Ho", "Branch"] },
        resolve: { type: String },
        resolveType: { type: String, enum: ["Ho", "Branch"] },
      },
    ],
   rejectemployeeId:{type:ObjectId,ref:'employee',default:null},
   rejectRemark:{type:String,default:''},

  },
  {
    timestamps: true,
  }
);

vendorSchema.index({ location: "2dsphere" });
const externalVendorFormModel = mongoose.model("externalVendorDynamic", vendorSchema);

module.exports = externalVendorFormModel;
