import mongoose from "mongoose";

const industryTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employee',
            default: null
        },
    },
    {
        timestamps: true,
    }
);

const IndustryTypeModel = mongoose.model("industryType", industryTypeSchema);

export default IndustryTypeModel;
