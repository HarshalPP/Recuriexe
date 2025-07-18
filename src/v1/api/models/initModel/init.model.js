

import mongoose, { Schema, model } from "mongoose";

const initSchema = new Schema(
  {
     organizationId: { type: mongoose.Types.ObjectId, default: null, ref:"Organization" },
    partnerId: { type: mongoose.Types.ObjectId, default: null, ref:"Organization" },
    referServiceId: {
      type: Schema.Types.ObjectId,
      ref: "services",
      required: true,

    },
    doneBy: {
      type: Schema.Types.ObjectId,
      ref: "employees",
      required: true,
    },
    fileNo: {
      type: String
    },
    customerName: {
      type: String
    },
    fatherName: {
      type: String
    },
    contactNo: {
      type: String
    },
    sign : String,
    paymentStatus : {
      type : String,
      default : "unpaid"
    },
    address: {
      type: String
    },
    allocatedEmp: {
      type: Schema.Types.ObjectId,
      ref: "employees",
      default: null
    },
    allocatedOfficeEmp: {
      type: Schema.Types.ObjectId,
      ref: "employees",
      default: null
    },
    workStatus: {
      type: String,
      default: "allocated",
    },
    allocatedDate: { type: Date },
    isJobCreated: {
      type: Boolean,
      default: false
    },
    reportType:{
       type: Schema.Types.ObjectId,
      ref: "userProducts",
      default: null
    },
    reportUrl : [String],
    reportStatus : {
      type : String,
      default : "pending"
    },
    reportDate : Date,
    reportTAT : Number,
    wordUrl : [String],
    charge : Number,
    initiatedDate: { type: Date },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "jobs",
      default: null
    },
    initFields: [{
      _id: false,
      fieldName: { type: String },
      dataType: { type: String },
      value: { type: Schema.Types.Mixed }

    }],
    allocationFields: [{
      _id: false,
      fieldName: { type: String },
      dataType: { type: String },
      value: { type: Schema.Types.Mixed }


    }],
    agentFields: [{
      _id: false,
      fieldName: { type: String },
      dataType: { type: String },
      value: { type: Schema.Types.Mixed }



    }],
    submitFields: [{
      _id: false,
      fieldName: { type: String },
      dataType: { type: String },
      value: { type: Schema.Types.Mixed },
    }]
    
    // ✅ Updated submitFields with dynamic stage structure
    // submitFields: [
    //   {
    //     stageNumber: { type: Number, required: true },
    //     stageName: { type: String },
    //     isActive: { type: Boolean, default: false },
    //     fields: [
    //       {
    //         fieldName: { type: String },
    //         dataType: { type: String },
    //         value: { type: Schema.Types.Mixed },
    //         supportingDoc: { type: String, default: "" },
    //       },
    //     ],
    //   },
    // ],
  },
  { timestamps: true }
);

const initModel = model("JobInit", initSchema);
export default initModel;
