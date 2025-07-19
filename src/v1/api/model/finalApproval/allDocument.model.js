const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const loanDocumentSchema = new Schema(
  {
    customerId: { type: ObjectId, default: null },
    dualNameDeclaration: {
      type: [String], default: []
    },
    dualSignDeclaration: {
      type: [String], default: []
    },
    dualDoBDeclaration: {
      type: [String], default: []
    },
    applicantBSV: {
      type: [String], default: []
    },
    guarantorBSV: {
      type: [String], default: []
    },
    insuranceForm: {
      type: [String], default: []
    },
    emOrRmDeed: {
      type: [String], default: []
    },
    vettingReport: {
      type: [String], default: []
    },
    camReport: {
      type: [String], default: []
    },
    coOwnershipDeed: {
      type: [String], default: []
    },
    appKycDocument: {
      type: [String], default: []
    },
    coAppKycDocument: {
      type: [String], default: []
    },
    form60: {
      type: [String], default: []
    },
    docObjt: [ // additional document list
      {
        name: {
          type: String,
          default :""
        },
        file: {
          type: String,
          default :""
        },
      },
    ],
    requestedDoc: [
      {
        requestedBy: {
          type: ObjectId,
        },
        name: {
          type: String,
          default :""
        },
        file: {
          type: String,
          default :""
        },
      },
    ],
    stampPdf: {
      type: [String],
      default: []
    },
  },

  {
    timestamps: true,
  }
);

const loanDocumentModel = mongoose.model(
  "loanDocumentModel",
  loanDocumentSchema
);
module.exports = loanDocumentModel;
