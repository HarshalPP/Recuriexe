import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const departmentBudgetSchema = new mongoose.Schema({

  departmentId: {
    type: ObjectId,
    ref: "newdepartment",
    default: null
  },

  desingationId: {
    type: ObjectId,
    ref: 'newdesignation',
    default: null
  },

  organizationId: {
    type: ObjectId,
    ref: "Organization",
    default: null
  },
  
  allocatedBudget: {
    type: Number,
    required: true,
    default:0,
  },
    usedBudget: {
    type: Number,
    default:0,
  },
  numberOfEmployees: {
    type: Number,
    required: true,
    default:0,
  },

  status: {
    type: String,
    enum : ["active","inactive"],
    default: "active"
  },


    createdBy: { type: ObjectId, ref: "employee"  ,default: null },
    updatedBy: { type: ObjectId, ref: "employee", default: null },
    
  // employmentTypeId: {
  //   type: ObjectId,
  //   ref: "employmentType",
  //   default: null
  // },


  // employeeTypeId: {
  //   type: ObjectId,
  //   ref: 'employeeType',
  //   default: null
  // },

  // jobPostId: {
  //   type: ObjectId,
  //   ref: "jobposts",
  //   default: null
  // },

  // branchId: [{
  //   type: ObjectId,
  //   ref: "newbranch"
  // }],

  // qualificationId: {
  //   type: ObjectId,
  //   ref: "qualification",
  //   // required: [true, "Eligibility Is Required"],
  //   default: null
  // },

  // organizationBudget: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'organizationbudget',
  //   required: true
  // },
  // HoldingBudget: {
  //   type: Number,
  //   required: false
  // },

}, { timestamps: true });

const DepartmentBudget = mongoose.model('DepartmentBudget', departmentBudgetSchema);
export default DepartmentBudget;
