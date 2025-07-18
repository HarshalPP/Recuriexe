import mongoose from "mongoose";
import { Schema } from "mongoose";
import {ObjectId} from "mongodb"

const caseInitiationSchema = new Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
    },

    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobApplyForm'
    },

    candidateInfo: {
        name: { type: String, required: true },
        emailId: { type: String, required: true },
        mobileNumber: { type: String, required: true },
    },

    caseType: {
        type: String,
        enum: ["pre-employment", "employee-verification", "periodic-check", "incident-based"],
        default: "pre-employment",
    },

    send:{
        type:Boolean,
        default:false
    },

    Received:{
        type:Boolean,
        default:false
    },

    // Verification Stages
    stageId: {
        type: ObjectId,
        ref: "Stage",
        default: null,
    },

     ReportId:{
      type:ObjectId,
      ref:'reportcategories',
      default:null
    },


    StageName:{
        type:String,
    }


},{
    timestamps:true
})


const caseInitiationModel = mongoose.model('CaseInitiation' , caseInitiationSchema)
export default caseInitiationModel;