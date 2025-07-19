const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

// send document to lender(partner)
const customerEsignDocument = new Schema(
  {
    filledBy: { type: ObjectId, default: null },
    customerId: { type: ObjectId, default: null },
    lenderId: { type: ObjectId, default: null },
    // documents:[{
    //   serialNo: { type: Number},
    //   name: { type: String, default: "" },
    //   url: { type: [String], default: "" },
    // }],
    sanctionDocument:[{
                         documentName: { type: String, default: "" },
                         url: { type: [String], default: "" },
                      }],
    esignDocument:[{
                       serialNo: { type: Number,default:null},
                       documentName: { type: String, default: "" },
                       url: { type: [String], default: "" },
                       esignLink: { type: String, default: "" },
                  }],
    disbursementDocument:[{
                             documentName: { type: String, default: "" },
                             url: { type: [String], default: "" },
  }],
  sanctionZipUrl:
     { type: [String], default: [] },
  
  disbursementZipUrl:
     { type: [String], default: [] },

  },
  {
    timestamps: true,
  }
);

const customerEsignDocumentModel = mongoose.model("esignDocument", customerEsignDocument);

module.exports = customerEsignDocumentModel;
