const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const customerTestimonialSchema = new Schema(
  {
    description: { type: String, default: "" },
    customer_name: { type: String, default: "" },
    occupation: { type: String, default: "" },
    city: { type: String, default: "" },
    image: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const customerTestimonialModel = mongoose.model(
  "customerTestimonial",
  customerTestimonialSchema
);

module.exports = customerTestimonialModel;
