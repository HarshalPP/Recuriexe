import mongoose from 'mongoose'

const {Schema} = mongoose;
const {ObjectId} = Schema;


const ClientModelSchema = new Schema({
      organizationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organization',
        default:null
      },

      companyName:{
        type:String
      },

      Email:{
        type:String
      },

      MobileNumber:{
        type:String
      },

      designationId:[{
        type:ObjectId,
        ref:'newdesignation',
        default:null
      }],
      
     location: [{ type: ObjectId, ref: "newbranch" }],
},{
  timestamps:true
}
)


const ClientModel = mongoose.model("Agency" , ClientModelSchema);
export default ClientModel;