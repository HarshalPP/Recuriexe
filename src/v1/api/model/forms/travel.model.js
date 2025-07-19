const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;


const travelModel = new Schema({
    travelId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },

    start_travel_date: {
        type:Date,
        required:false,
        default:Date.now()
    },

    end_travel_date: {
        type:Date,
        required:false,
        default:Date.now()
    },

    purpose_of_travel: {
        type:String,
        required:false,
        default:""
    },

   travel_along_with:[
    {
        type: ObjectId,
        ref:"employee",
        required: true,
        default: []
    }
   ],

   travel_mode: {
         type:String,
         required:false,
         default:""
   },

entries:[{
expense_type:{
    type:String,
    required:false, 
},

amount:{
    type:Number,
    required:false,
    default:0
},

upload:{
    type:String,
    required:false,
    default:""
},

}],

Own_car_details:[{

    travel_date:{
        type:Date,
        required:false,
        default:Date.now()
    },


    state:{
        type:String,
        required:false,
        default:""
    },

    travel_from:{
        type:String,
        required:false,
        default:""
    },

    tarvel_to:{
        type:String,
        required:false,
        default:""
    },

    km:{
        type:Number,
        required:false,
        default:0
    },

    amount:{
        type:Number,
        required:false,
        default:0
    },
    from:{
        type: String,
        required:false,
    },

    to:{
        type: String,
        required:false,
    },

    check:{
        type: String,
        required:false,
    }
}],

public_transport_details:[{


    tarvel_date:{
        type:Date,
        required:false,
        default:Date.now()
    },

   ticket_Amount:{
        type:Number,
        required:false,
        default:0
    },

    uploadTicket:{
        type:String,
        required:false,
        default:null

    },

    state:{
        type:String,
        required:false,
        default:""
    },

}],

formConfigId: {
    type: String,
    ref: "formConfig"
},

approvalRequired: {
       type: Boolean,
       default: false
},
l1Approver: {
    type: ObjectId,
    ref: "employee",
    default: null
},
l1Status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
},
l1Remark: {
    type: String,
    default: ""
},
l2Approver: {
    type: ObjectId,
    ref: "employee",
    default: null
},
l2Status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
},
l2Remark: {
    type: String,
    default: ""
},
l3Approver: {
    type: ObjectId,
    ref: "employee",
    default: null
},
l3Status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
},
l3Remark: {
    type: String,
    default: ""
},

viewer:[{
  type: ObjectId,
  ref:"employee",
  default: null
}],

isActive: {
  type: Boolean,
  default: true
},

createdBy: {
  type: ObjectId,
  ref: "employee",
},
updatedBy: {
    type: ObjectId,
    ref: "employee",
}




},{
    timestamps: true
}


)

travelModel.pre('validate' , async function(next){
    const doc = this;
    if(!doc.formConfigId){
    const formConfig = await mongoose.model('formConfig').findOne({formName: 'travel'});
    if(formConfig){
        doc.formConfigId = formConfig.formConfigId;
    }
    }

    if(!doc.travelId){
        try{

            const latestTravel = await mongoose.model('travel').findOne({} , {} , {sort: {createdAt: -1}});
            let nextSeq = 1;
            if(latestTravel && latestTravel.travelId){
                const latestSeq = parseInt(latestTravel.travelId.replace('FINTR', ''), 10);
                nextSeq = latestSeq + 1;
            }
            doc.travelId = 'FINTR' + nextSeq.toString().padStart(4, '0');
            next();

        }catch(error){
            next(error);
        }
    }

    else{
        next();
    }
})

const travelDetails = mongoose.model('travel', travelModel);
module.exports = travelDetails;



