
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const permissionFormSchema = new Schema({
    thirdPartyApi:[
      {
        type:String , enum:["aadhaar","aadhaarOcr","panNo","panFather","bank","electricity","udyam"],default:[]
      }
    ],
    applicant:        { type: Boolean,  enum:[true,false], default:false},
    coApplicant:      { type: Boolean,  enum:[true,false], default:false},
    guarantor:        { type: Boolean,  enum:[true,false], default:false},
    reference:        { type: Boolean,  enum:[true,false], default:false},
    banking:          { type: Boolean,  enum:[true,false], default:false},
    salescaseDetail:  { type: Boolean,  enum:[true,false], default:false},
    salescaseProperty:{ type: Boolean,  enum:[true,false], default:false},
    salescaseIncome:  { type: Boolean,  enum:[true,false], default:false},
    cibilDetail:      { type: Boolean,  enum:[true,false], default:false},
    externalManager:  { type: Boolean,  enum:[true,false], default:false},
    pdReportDetail:   { type: Boolean,  enum:[true,false], default:false},
    pdReportProperty: { type: Boolean,  enum:[true,false], default:false},
    pdReportIncome:   { type: Boolean,  enum:[true,false], default:false},
    status:           { type: String,   enum:["active", "inactive"], default: "active"},
    branchForms: {
      agricultureIncomeForm:{ type: Boolean, enum:[true,false], default:false },
      appPdcForm:{ type: Boolean, enum:[true,false], default:false },
      bankStatementForm:{ type: Boolean, enum:[true,false],  default:false },
      electricityKycForm:{ type: Boolean, enum:[true,false],  default:false },
      esignPhotoForm:{ type: Boolean, enum:[true,false], default:false },
      gtrPdcForm:{ type: Boolean,enum:[true,false],  default:false },
      milkIncomeForm:{ type: Boolean,enum:[true,false],  default:false },
      enachLinkForm:{ type: Boolean,enum:[true,false],  default:false },
      otherBuisnessForm:{ type: Boolean,enum:[true,false],  default:false },
      otherDocumentForm:{ type: Boolean,enum:[true,false],  default:false },
      physicalFileCourierForm:{ type: Boolean,enum:[true,false],  default:false },
      propertyPaperKycForm:{ type: Boolean,enum:[true,false],  default:false },
      rmPaymentUpdateForm:{ type: Boolean,enum:[true,false],  default:false },
      salaryAndOtherIncomeForm:{ type: Boolean,enum:[true,false],  default:false },
      samagraIdKycForm:{ type: Boolean,enum:[true,false],  default:false },
      appEsignLinkForm:{ type: Boolean,enum:[true,false],  default:false },
      udhyamKycForm:{ type: Boolean,enum:[true,false],  default:false },
      nachRegistrationKycForm:{ type: Boolean,enum:[true,false],  default:false },
      signKycForm:{ type: Boolean,enum:[true,false],  default:false },
      incomeDetailForm:{ type: Boolean,enum:[true,false],  default:false },

    }
},{
  timestamps:true
});

const permissionFormModel = mongoose.model("permissionForm", permissionFormSchema);

module.exports = permissionFormModel;



// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// ObjectId = Schema.ObjectId;

// const permissionFormSchema = new Schema({
//     title:            { type: String, required: [true,"Title Is Required"]},
//     applicant:        { type: String, enum:[true,false], default:"false"},
//     coApplicant:      { type: String, enum:["true","false"], default:"false"},
//     guarantor:        { type: String, enum:["true","false"], default:"false"},
//     reference:        { type: String, enum:["true","false"], default:"false"},
//     banking:          { type: String, enum:["true","false"], default:"false"},
//     salescaseProperty:{ type: String, enum:["true","false"], default:"false"},
//     salescaseIncome:  { type: String, enum:["true","false"], default:"false"},
//     cibilDetail:      { type: String, enum:["true","false"], default:"false"},
//     pdReportProperty: { type: String, enum:["true","false"], default:"false"},
//     pdReportIncome:   { type: String, enum:["true","false"], default:"false"},
//     status: {
//              type: String,
//              enum: ["active", "inactive"],
//              default: "active",
//              },
// },{
//   timestamps:true
// });



// const permissionFormModel = mongoose.model("permissionForm", permissionFormSchema);

// module.exports = permissionFormModel;
