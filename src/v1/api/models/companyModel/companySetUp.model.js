import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const companySetUpSchema = new mongoose.Schema({
    companyId: {
        type: ObjectId,
        ref: "company",
        required: true,
        unique: true,
    },
    logo: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        default: ""
    }
},
    {
        timestamps: true
    }
);

const companySetUpModel = model('companySetUp', companySetUpSchema);

export default companySetUpModel;
