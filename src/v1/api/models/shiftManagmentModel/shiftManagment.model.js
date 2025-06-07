import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema({
name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: String,
  
  },
  endTime: {
    type: String,

  },
  durationHours: {
    type: Number,

  },
  color: { 
    type: String,
    default: "#e6f2ff" // Default light blue color
  },
  workingDays: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  },
  weekendDefinition: {
    type: String,
    enum: ['shift', 'location'],
    default: 'shift'
  },
  weekendDays: {
    type: Map,
    of: Boolean,
    default: () => ({
      'sunday': true,
      'saturday': true
    })
  },
  halfWorkingDay: {
    type: String, // e.g., 'saturday'
    default: null
  },
  shiftMargin: {
    enabled: { type: Boolean, default: false },
    marginBefore: { type: Number, default: 0 }, // minutes
    marginAfter: { type: Number, default: 0 } // minutes
  },
  coreWorkingHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: null },
    endTime: { type: String, default: null }
  },
  allowance: {
    enabled: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    applicableDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'newdepartment' }]
  },

  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'newdepartment' }],
  branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'newbranch' }], // Add your branch model name

  isActive: {
    type: Boolean,
    default: true
  },
  breakTime: {
    type: Number, // Break time in minutes
    default: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }


},{
    timestamps:true
})


const ShiftSchema = mongoose.model('Shift' , shiftSchema)
export default ShiftSchema;