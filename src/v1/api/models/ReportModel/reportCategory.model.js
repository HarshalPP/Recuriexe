import mongoose from "mongoose";
import { Schema } from "mongoose";


const reportCategorySchema = new Schema({

    reportName: {
        type: String
    },

    categories: [
        {
            type: String,
            enum: ["bankVerification", "drivingLicense", "panVerification", "aadharVerification"], // Add more as needed
        },
    ],

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
    },

    jobPostId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"jobPost"
    },

    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
})

const reportCategoryModel = mongoose.model('reportcategories', reportCategorySchema)
export default reportCategoryModel;