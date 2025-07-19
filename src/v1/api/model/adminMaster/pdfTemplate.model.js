const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const pdfTemplateModelSchema = new Schema({
   title: { type: String },
   type: {
      type: String,
      enum: ["cam" , "e-sign"],
    },
   workFlow: { type: String },
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const pdfTemplateModel = mongoose.model("pdfTemplate", pdfTemplateModelSchema);

module.exports = pdfTemplateModel;
 