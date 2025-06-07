import mongoose from "mongoose";

const sectorTypeSchema = new mongoose.Schema(
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

const SectorTypeModel = mongoose.model("sectorType", sectorTypeSchema);

export default SectorTypeModel;
