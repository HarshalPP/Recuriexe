import mongoose from "mongoose";

const subdropDownSchema = new mongoose.Schema(
    {
        dropDownId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'dropDown',
            required: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employee',
            default: null
        },
        defaultValue: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const subdropDownModel = mongoose.model("subDropDown", subdropDownSchema);

export default subdropDownModel;


