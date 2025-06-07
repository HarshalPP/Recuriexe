import mongoose from 'mongoose';

const organizationBudgetSchema = new mongoose.Schema({
  company: { 
    type:String, 
    required: false 
  },


  type: { 
    type: String, 
    // enum: ['salary-based', 'asset-based'], 
    required: false,
    default:"salary-based" 
  },

  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    default: null
  },

  totalBudget: { 
    type: Number, 
    required: true 
  },
  remainingBudget: { 
    type: Number, 
    required: true 
  },

  status:{
    type:String,
    default:"active"
  }
}, { timestamps: true });

const OrganizationBudget = mongoose.model('OrganizationBudget', organizationBudgetSchema);
export default OrganizationBudget;