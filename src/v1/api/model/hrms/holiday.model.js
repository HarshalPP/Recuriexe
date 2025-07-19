const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const HolliDayModelSchema = new Schema(
  {
    title: { type: String, default: "", trim: true }, // Ensures title is trimmed
    date: { 
      type: Date, 
      required: true, 
      unique: true 
    }, 
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active" 
    },
    employeeId: { 
      type: Schema.Types.ObjectId, 
      ref: "employee", 
      default: null 
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Create the model
const HolliDayModel = mongoose.model("Holiday", HolliDayModelSchema);
module.exports = HolliDayModel;
