import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema;


const AIRuleSchema = new Schema({

  organizationId: {
    type: ObjectId,
    ref: 'Organization',
    default: null
  },
  
  AutomaticScreening: {
    type: Boolean,
    default: false
  },

  AI_Screening: [{
    name: { type: String },
    description: { type: String },
    priority: {
      type: String,
      required: true,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    category: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiScreening"
    }],
    isActive: {
      type: Boolean,
      default: true
    },

  }]
},
  {
    timestamps: true
  });

const AIRule = mongoose.model("AIRule", AIRuleSchema);
export default AIRule;
