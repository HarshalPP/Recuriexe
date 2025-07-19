const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const branchRequestModel = new Schema(
  {
    branchRequestId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    clusterOffice: {
      type: ObjectId,
      ref: "newBranch",
      required: true,
    },
    branchName: {
      type: String,
      unique: true,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    branchAddress: {
      type: String,
      required: true,
    },
    branchLongitude: {
      type: Number,
      required: true,
    },
    branchLatitude: {
      type: Number,
      required: true,
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    residentialAddress: {
      type: String,
      required: true,
    },
    accountDetails: {
      name: {
        type: String,
        required: true,
      },
      accountNo: {
        type: String,
        required: true,
      },
      ifsc: {
        type: String,
        required: true,
      },
      bankName: {
        type: String,
        required: true,
      },
    },
    brokerAccountDetails: {
      name: {
        type: String,
        required: true,
      },
      accountNo: {
        type: String,
        required: true,
      },
      ifsc: {
        type: String,
        required: true,
      },
      bankName: {
        type: String,
        required: true,
      },
    },
    pmRent: {
      type: Number,
      requred: true,
    },
    advanceAmount: {
      type: Number,
      required: true,
    },
    rentDate: {
      type: Date,
      required: true,
    },
    rentBrokerExpenses: {
      type: Number,
      required: true,
    },
    documents: {
      branchFront: {
        type: String,
        required: true,
      },
      branchInSide1: {
        type: String,
        required: true,
      },
      branchInSide2: {
        type: String,
        required: true,
      },
      approachRoad: {
        type: String,
        required: true,
      },
      agreement: {
        type: String,
        required: true,
      },
    },
    formConfigId: {
      type: String,
      ref: "formConfig",
    },
    approvalRequired: {
      type: Boolean,
      default: false,
    },
    l1Approver: {
      type: ObjectId,
      ref: "employee",
      default: null,
    },
    l1Status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    l1Remark: {
      type: String,
      default: "",
    },
    l2Approver: {
      type: ObjectId,
      ref: "employee",
      default: null,
    },
    l2Status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    l2Remark: {
      type: String,
      default: "",
    },
    l3Approver: {
      type: ObjectId,
      ref: "employee",
      default: null,
    },
    l3Status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    l3Remark: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: ObjectId,
      ref: "employee",
    },
    updatedBy: {
      type: ObjectId,
      ref: "employee",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate the branchRequestId automatically
branchRequestModel.pre("validate", async function (next) {
  const doc = this;

  if (!doc.formConfigId) {
    const formConfig = await mongoose
      .model("formConfig")
      .findOne({ formName: "branchRequest" });
    if (formConfig) {
      doc.formConfigId = formConfig.formConfigId;
    }
  }

  if (!doc.branchRequestId) {
    try {
      // Find the latest branchRequest by sorting by created time
      const latestbranchRequest = await mongoose
        .model("branchRequest")
        .findOne({}, {}, { sort: { createdAt: -1 } });

      let nextSeq = 1; // Default if no branchRequests found
      
      
      if (latestbranchRequest && latestbranchRequest.branchRequestId) {
        // Extract the number part from the latest branchRequestId (e.g., FINAS0001 -> 1)
        const lastSeq = parseInt(
          latestbranchRequest.branchRequestId.replace("FINBR", ""),
          10
        );
        nextSeq = lastSeq + 1; // Increment the sequence
      }

      // Generate new branchRequestId with FINAS prefix and padded number
      doc.branchRequestId = "FINBR" + nextSeq.toString().padStart(4, "0");
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

branchRequestModel.index({ location: "2dsphere" });


const branchRequestDetail = mongoose.model("branchRequest", branchRequestModel);

module.exports = branchRequestDetail;
