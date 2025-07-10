import mongoose, { model, Schema } from 'mongoose';


const docSchema = new Schema({
    serviceId : {
        type: Schema.Types.ObjectId, 
        ref: "users",
        required: true,
    },
    requestId :{
        type: Schema.Types.ObjectId, 
        ref: "partner_requests",
        required: true,
    },
   reportId :{
        type: Schema.Types.ObjectId, 
        ref: "userProducts",
    },
    documentName : String,
   
   
    schemaVersion: { type: Number, default: 0 },
}, { timestamps: true });

const docModel = model("doc", docSchema);
export default docModel;
