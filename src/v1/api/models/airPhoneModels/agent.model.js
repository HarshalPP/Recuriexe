// models/Agent.js
import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    product: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    virtual_number: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model('agent', agentSchema);
