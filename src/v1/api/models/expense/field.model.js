import { model, Schema } from "mongoose";

const fieldSchema = new Schema(
  {
    labelName: {
      type: String,
      required: true,
      trim: true,
    },
    
    dataType: {
      type: String,
      required: true,
      enum: [
        "Text Box (Single Line)",
        "Email",
        "URL",
        "Phone",
        "Number",
        "Decimal",
        "Date",
        "Amount",
        "Percent",
        "DateAndTime",
        "CheckBox",
        "Dropdown",
        "AutoGenerateNumber",
        "MultiSelect",
        "Lookup",
        "textBox",
        "Attechment",
        "externalLookup",
      ],
    },
    moduleType: {
      type: String,
      required: true,
      enum: ["trips", "expenses", "report", "advance", "purchaseRequest"],
    },
    helpText: {
      type: String,
      default: "",
    },
    restrictDuplicates: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: String,
      default: "",
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    showInPdf: {
      type: Boolean,
      default: true,
    },
    prefix: {
      type: String,
      default: "",
    },
    startingNumber: {
      type: String,
      default: "",
    },
    suffix: {
      type: String,
      default: "",
    },
    options: {
      type: [String],
      default: [],
    },
    module: {
      type: [String],
      default: [],
    },
    service: {
      type: [String],
      default: [],
    },
    fileTypes: {
      type: String,
      enum: ["all", "image", "document", "pdf"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "employee",
      default: null,
    },
  },
  { timestamps: true }
);

const fieldModel = model("field", fieldSchema);
export default fieldModel;
