import mongoose, { model, Schema } from 'mongoose';


const productSchema = new Schema({
      productName: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // status: {
    //     type: String,
    //     enum: ["pending", "approve", "reject"], 
    //     default: "approve" 
    // },
    moduleId: {
        type: mongoose.Types.ObjectId,
        ref: "modules"
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },
     referId : {
        type: Schema.Types.ObjectId, 
        ref: "services",
        required: true,
    },
    requestId :{
          type: Schema.Types.ObjectId, 
        ref: "requests",
    },
    isActive : {
        type : Boolean,
        default : true
    },
    schemaVersion: { type: Number, default: 0 },
}, { timestamps: true });

const userProductModel = model("userProduct", productSchema);
export default userProductModel;
