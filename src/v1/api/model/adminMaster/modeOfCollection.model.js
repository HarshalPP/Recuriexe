const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const modelOfCollectionSchema = new Schema({
  title:{ type: String, required: [true, "Title is required"]},
  extraForm:{type:Boolean,enum:[true,false],default:false },
  email:{type:Boolean,enum:[true,false],default:true },
  transactionImage:{type:Boolean,enum:[true,false],default:true },
  transactionId:{type:Boolean,enum:[true,false],default:true },
  dropdownId:{type:ObjectId,default:null},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
},
{
  timestamps: true,
}
);

const modelOfCollectionModel = mongoose.model("modelOfCollection", modelOfCollectionSchema);

module.exports = modelOfCollectionModel;
