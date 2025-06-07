import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const jobSaveSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "User",
        required: true,
    },
    jobPostId: {
        type: ObjectId,
        ref: "jobPost",
        required: true,
    }
},
    {
        timestamps: true
    }
);

const jobSaveModel = model('jobSave', jobSaveSchema);

export default jobSaveModel;
