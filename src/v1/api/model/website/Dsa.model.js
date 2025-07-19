const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;



const DsaSchema = new Schema({

    basic_information:{

        Name:{type:String,default:""},
        Business_Name:{type:String,default:""},
        Entity_type:{type:String,default:""},
        PAN:{type:String,default:""},
        GST:{type:String,default:""},
        Registration_No:{type:String,default:""},
        Date:{type:Date,default:Date.now},
        contact_person:{type:String,default:""},
        Designation:{type:String,default:""},
        Phone:{type:String,default:""},
        Email:{type:String,default:""},
        Address:{type:String,default:""},
        Correspondence_Address:{type:String,default:""},
    },

    Experice_and_Experitse:{
        Experience_in_Rural:{type:String,default:""},
        Experience:{type:String,default:""},
        Typeof_Service_Provider:{type:String,default:""},
        Clients:[
            {
            current_clients:{type:String,default:""},
            }
        ],

        Experice_in_Financial:[
            {
            Type:{type:String,default:""},
            }
        ],
        Experice_in_Specialloantype:{type:String,default:""},
    },


    Geographical_coverage:{
        Religion:{type:String,default:""},
        Number_of_Rural:{type:String,default:""},
        Local_language:{type:String,default:""},
        Existing_Relationship:{type:String,default:""},
    },


    Operational_Capacity:{

        office_location:{type:String,default:""},
        availability_of_technology:{type:String,default:""},
        Number_of_feildsAgents:{type:String,default:""},
        Qualification:{type:String,default:""},
        Client_Support_Service:{type:String,default:""},
        Training:{type:String,default:""},
        Loan_Recovery:[{
           List:{type:String,default:""}
        }]
    },


   Financial_Performance:{
    Annunal_Turnover:{type:String,default:""},
    Financial_Documents:{type:String,default:""},
    Cancelled_Cheque:{type:String,default:""},
    Accounnt_Details:{
        Bank_Name:{type:String,default:""},
        Account_Number:{type:String,default:""},
        IFSC_Code:{type:String,default:""},
    },

   },


   Reference:{
    References:[
        {
        Name:{type:String,default:""},
        Contact_Information:{type:String,default:""},
        Relationship:{type:String,default:""}
        }
    ]
   },


   Additional_information:{
    certification:{type:String,default:""},
    Awards:{type:String,default:""},
    Other_Relevant_information:{type:String,default:""},
   },


   Declaration:{
    Name:{type:String,default:""},
    Designation:{type:String,default:""},
    Date:{type:Date,default:Date.now},
    Signature:{type:String,default:""},
   },


   Querires:{
  
    Name:{type:String,default:""},
    Phone:{type:String,default:""},
    Email:{type:String,default:""},

   }


},
{ timestamps: true }
);


const Dsa = mongoose.model('DSA', DsaSchema);
module.exports = Dsa;