import mongoose from 'mongoose'
import ClientSetting from "../../models/settingModel/clientsetting.model.js"

const {Schema} = mongoose;
const {ObjectId} = Schema;


const ClientModelSchema = new Schema({
      organizationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organization',
        default:null
      },

      ClientUniqueId:{
       type:String
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

// Set Pre middleware //
ClientModelSchema.pre("save", async function (next) {
  try {
    if (this.ClientUniqueId) return next();

    const organizationId = this.organizationId;

    let setting = await ClientSetting.findOne({ organizationId:organizationId });

   if (!setting) {
      setting = await ClientSetting.create({ organizationId });
    }
    setting.ClientIdCounter += 1;
    await setting.save();

    const parts = [];

    if (setting.ClientIdPrefix) {
      parts.push(setting.ClientIdPrefix);
    }

    if (setting.ClientIdUseDate && setting.ClientIdDateFormat) {
      parts.push(moment().format(setting.ClientIdDateFormat));
    }

    if (setting.ClientIdUseRandom && setting.ClientIdRandomLength > 0) {
      const random = Math.floor(Math.random() * Math.pow(10, setting.ClientIdRandomLength))
        .toString()
        .padStart(setting.ClientIdRandomLength, "0");
      parts.push(random);
    }

    parts.push(setting.ClientIdCounter.toString().padStart(setting.ClientIdPadLength, "0"));

    if (setting.ClientIdPrefix) {
      parts.push(setting.ClientIdSuffix);
    }

    this.ClientUniqueId = parts.join("");

    next();
  } catch (error) {
    next(error);
  }
});


const ClientModel = mongoose.model("Agency" , ClientModelSchema);
export default ClientModel;