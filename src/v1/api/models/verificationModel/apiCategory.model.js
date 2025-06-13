// models/apiCategory.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema;

const apiCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true, // prevent duplicates
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  createdBy: {
    type: ObjectId,
    ref: "employee",
    default: null
  },
  updatedBy: {
    type: ObjectId,
    ref: "employee",
    default: null
  }
}, {
  timestamps: true,
});

export default mongoose.model("apiCategory", apiCategorySchema);
