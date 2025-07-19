const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const employeeTestimonialSchema = new Schema(
  {
    description: { type: String, default: "" },
    employee_name: { type: String, default: "" },
    occupation: { type: String, default: "" },
    city: { type: String, default: "" },
    image: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const employeeTestimonialModel = mongoose.model(
  "employeeTestimonial",
  employeeTestimonialSchema
);

module.exports = employeeTestimonialModel;
