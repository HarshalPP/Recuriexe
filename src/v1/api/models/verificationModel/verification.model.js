import mongoose from "mongoose";
const VerificationSchema = new mongoose.Schema({

    apiName:{
        type:String
    },


    apiLogo:{
        type:String
    },

    status:{
        type:String,
        default:"active"
    },

    description:{
        type:String
    }

},{
    timestamps:true
}
)


const verificationModel = mongoose.model('VerificationAPI' , VerificationSchema)
export default verificationModel