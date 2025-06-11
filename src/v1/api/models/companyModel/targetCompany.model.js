import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const targetCompanySchema = new Schema({
    organizationId: { type: ObjectId, ref: 'Organization', default: null , unique : true },
    prioritizedCompanies: [{ type: String, default: '' }],
    deprioritizedCompanies: [{ type: String, default: '' }],
    createdBy: { type: ObjectId, ref: "employee", default: null },
    updatedBy: { type: ObjectId, ref: 'employee', default: null }
}, {
    timestamps: true,
});

const targetCompanySchemaModel = mongoose.model("targetCompany", targetCompanySchema);

export default targetCompanySchemaModel;
