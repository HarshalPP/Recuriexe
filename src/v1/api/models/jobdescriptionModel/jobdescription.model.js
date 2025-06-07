import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const jobDescriptionModelSchema = new Schema(
  {
    createdById: { type: ObjectId, ref: 'employee', default: null }, // employee ID
    updatedById: { type: ObjectId, ref: 'employee', default: null }, // employee ID
    position: { type: String },

    departmentId: {
      type: ObjectId,
      ref: "newdepartment",
      default:null
     },

    subdeparmentId:{
      type: ObjectId,
      default:null
    },

    organizationId: {
      type: ObjectId,
      ref: 'organization',
      default: null,
    },


    specialSkiils:{
      type:String
    },
 
    designationId: { 
      type: ObjectId, 
      ref: 'newdesignation', // Referencing the Designation model
      required: true, 
    },

    AgeLimit: {
      type: String,
      required:false,
      default: null,
    },

    
    Gender:{
      type: String,
      required: false,
    },

    // jobDescription: {
    //   type: String,
    //   required: [true, 'Job description is required'],
    // },


       jobDescription: {
      JobSummary: { type: String },
      RolesAndResponsibilities: [{ type: String }],
      KeySkills: [{ type: String }],
    },


    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

const JobDescriptionModel = model('jobDescription', jobDescriptionModelSchema);

export default JobDescriptionModel;
