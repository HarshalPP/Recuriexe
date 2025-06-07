import mongoose from "mongoose";
const { Schema } = mongoose;

const allocatedSchema = new Schema({
    Name:{
        type: String,
        required: [true, "Name is required"],
        trim: true
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },

    Cost:{
        type:String,
        required:true
    }
},{
    timestamps:true
})


const AllocatedModule = mongoose.model("Allocated", allocatedSchema);
export default AllocatedModule;


//
