import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const HolidaySchema = new Schema(
  {
    title: { type: String, default: '', trim: true },
    date: {
      type: Date,
      required: true,
      unique: true,
    },

    description: {
        type: String,
        trim: true,
      },

      type: {
        type: String,
        enum: ['National', 'Religious', 'Optional', 'Company'],
        default: 'Company',
      },


    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'employee',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// Pre-save middleware to update the updatedAt field
HolidaySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });
  
  // Method to check if a date is a holiday
  HolidaySchema.statics.isHoliday = async function(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const holiday = await this.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      isActive: true
    });
    
    return !!holiday;
  };

const Holiday = model('Holiday', HolidaySchema);
export default Holiday;
