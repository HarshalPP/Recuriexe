// models/C2CCall.js
import mongoose from 'mongoose';

const c2cCallSchema = new mongoose.Schema({
    vnm: {
        type: String,
        required: true,
        trim: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agent',
    },
    agent: {
        type: String,
        ref: 'agent',
        required: true
    },
    caller: {
        type: String,
        required: true,
        trim: true
    },
    reqId: {
        type: String,
        trim: true
    },
    callToken: {
        type: String,
        trim: true,
        select: false
    }
}, {
    timestamps: true
});

export default mongoose.model('c2ccall', c2cCallSchema);
