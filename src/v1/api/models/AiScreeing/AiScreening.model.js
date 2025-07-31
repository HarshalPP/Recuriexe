import mongoose from 'mongoose';
const { Schema } = mongoose;
const { ObjectId } = Schema;
// Separate Screening Criteria Schema
const ScreeningCriteriaSchema = new Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    weight: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    confidence: {
        type: Number,
        default: 0,
    },
    experience: {
        type: String,
    }
}, {
    _id: true, // Ensure each criteria has its own unique ID
});

// Main AI Screening Schema
const AiScreeningSchema = new Schema({

    organizationId: {
        type: ObjectId,
        ref: 'Organization',
        default: null
    },

    autoScreening: {
        type: Boolean,
        default: true
    },


    autoResumeShortlisting: {
        type: Boolean,
        default: false
    },

    name: {
        type: String,
    },
    description: {
        type: String,
    },

    // Core Settings
    coreSettings: {
        qualificationThreshold: {
            type: Number,
        },
        confidenceThreshold: {
            type: Number,
        },
        automaticScreening: {
            type: Boolean,
            default: false,
        },

    },

    // Custom Screening Criteria (embedded subdocuments)
    screeningCriteria: [ScreeningCriteriaSchema],

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'employee',
    },

    isActive: {
        type: Boolean,
        default: true,
    },

}, {
    timestamps: true,
});

const AiScreening = mongoose.model('AiScreening', AiScreeningSchema);
export default AiScreening;
