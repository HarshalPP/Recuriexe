const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const leadGenerateModelSchema = new Schema(
  {
    employeeGenerateId: { type: ObjectId, ref: 'employee', default: null },
    employeeAssignId: { type: ObjectId , default: null },
    managerId: { type: ObjectId, ref: 'employee', default: null },
    branchId : {type: ObjectId, ref: 'newbranch', default: null },
    loanTypeId: { type: ObjectId, ref: 'product', default: null },
    remark:{type:String, default :""},
    customerName: { type: String , default: ""},
    city: { type: String  ,   default: ""},        
    customerMobileNo: { type: String  ,   default: ""}, 
    loanAmount: { type: String , default: "" },    
    pincode: { type: String  , default: ""},      
    emi: { type: String  ,   default: ""}, 
    tenure: { type: String , default: "" },    
    roi: { type: String  , default: ""}, 
    salesRejectRemark: { type: String  , default: ""}, 
    monthlyIncome: { type: String , default: ""}, 
    selfieWithCustomer: { type: String, default: null }, 
    status: { type: String, enum: ['approved', 'pending', 'reject','leadConvert','rejectBySales'], default: 'pending' },
    leadGeneratedBy : {type :String ,  enum: ['website' , 'sales'], default: 'sales' },
    distrctName : {type :String ,  default: ""},
    pakkaHouse  : {type :String ,   default: ""},
    agriland : {type :String ,   default: ""},
    otherSourceOfIncome  : {type :String ,   default: ""},
    customerFeedback  : {type :String ,   default: ""},
    formCompleteDate: { type: String , default:""},
    customerType : { type: String , default:""},
    leadStatus:{ type: String ,anum :["active","inactive"], default:"active"},
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    
  },
  {
    timestamps: true,
  }
);

const leadGenerateModel = mongoose.model('LeadGenerate', leadGenerateModelSchema);

module.exports = leadGenerateModel;
