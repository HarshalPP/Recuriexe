import Shift from "../../models/shiftManagmentModel/shiftManagment.model.js"
import departmentModel from "../../models/deparmentModel/deparment.model.js"
import branchModel from "../../models/branchModel/branch.model.js"
import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js"


// Create new shift
export const createShift = async (req, res) => {
  try {
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let durationHours = endHour - startHour;
    const durationMinutes = endMinute - startMinute;
    

    durationHours += durationMinutes / 60;
    
    if (durationHours < 0) {
      durationHours += 24; 
    }
    

    durationHours = Math.round(durationHours * 100) / 100;

    req.body.durationHours = durationHours;
    
    if (req.body.shiftMargin && req.body.shiftMargin.enabled) {
      if (typeof req.body.shiftMargin.marginBefore !== 'number' || req.body.shiftMargin.marginBefore < 0) {
        req.body.shiftMargin.marginBefore = 0;
      }
      if (typeof req.body.shiftMargin.marginAfter !== 'number' || req.body.shiftMargin.marginAfter < 0) {
        req.body.shiftMargin.marginAfter = 0;
      }
    }
    
    if (req.body.coreWorkingHours && req.body.coreWorkingHours.enabled) {
      if (!req.body.coreWorkingHours.startTime || !req.body.coreWorkingHours.endTime) {
        return res.status(400).json({
          success: false,
          error: 'Core working hours require both start and end times'
        });
      }
    }
    

    if (req.body.weekendDefinition && !['shift', 'location'].includes(req.body.weekendDefinition)) {
      req.body.weekendDefinition = 'shift';
    }
    

    if (req.body.allowance && req.body.allowance.enabled) {

      if (typeof req.body.allowance.amount !== 'number' || req.body.allowance.amount < 0) {
        req.body.allowance.amount = 0;
      }
      
      if (req.body.allowance.applicableDepartments && Array.isArray(req.body.allowance.applicableDepartments)) {
        // Verify each department ID exists
        for (const deptId of req.body.allowance.applicableDepartments) {
          const deptExists = await departmentModel.findById(deptId);
          if (!deptExists) {
            // return res.status(400).json({
            //   success: false,
            //   error: `Department with ID ${deptId} does not exist`
            // });

            return badRequest(res , `Department with ID ${deptId} does not exist`)
          }
        }
      }
    }
    
    const shift = await Shift.create(req.body);
    return success(res , "Added successfully" , shift)


  } catch (error) {
    if (error.name == 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
     return unknownError(res , error)
    } else {
     return unknownError(res , error)
    }
  }
};


// Get all shifts
export const getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ isActive: true })
    .populate({path:'allowance.applicableDepartments' , select:'name'})
    .populate({path:'departments' , select:'name'})
    .populate({path:'branches' , select:'name'})
    return success(res , "fetch shift successfully" , shifts)

    // res.status(200).json({
    //   success: true,
    //   count: shifts.length,
    //   data: shifts
    // });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};


export const updateShift = async (req, res) => {
  try {
    // Recalculate duration if both times are updated
    if (req.body.startTime && req.body.endTime) {
      const [startHour, startMinute] = req.body.startTime.split(':').map(Number);
      const [endHour, endMinute] = req.body.endTime.split(':').map(Number);

      let durationHours = endHour - startHour;
      const durationMinutes = endMinute - startMinute;
      durationHours += durationMinutes / 60;

      if (durationHours < 0) durationHours += 24;

      req.body.durationHours = Math.round(durationHours * 100) / 100;
    }

    // Validate weekendDefinition
    if (req.body.weekendDefinition && !['shift', 'location'].includes(req.body.weekendDefinition)) {
      req.body.weekendDefinition = 'shift';
    }

    req.body.updatedAt = Date.now();

    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!shift) return badRequest(res, 'Shift not found');

    return success(res, 'Shift updated successfully', shift);
  } catch (error) {
    if (error.name == 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return badRequest(res, messages.join(', '));
    } else {
      return unknownError(res, error);
    }
  }
};



// delete Shift //
export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!shift) {
      return badRequest(res, 'Shift not found');
    }

    return success(res, 'Shift has been deactivated', {});
  } catch (error) {
    return unknownError(res, error);
  }
};


// assing department and braches
export const assignDepartmentsAndBranches = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { departments = [], branches = [] } = req.body;


    for (const deptId of departments) {
      const exists = await departmentModel.findById(deptId);
      if (!exists) return badRequest(res, `Invalid department ID: ${deptId}`);
    }

    // Validate branch IDs
    for (const branchId of branches) {
      const exists = await branchModel.findById(branchId);
      if (!exists) return badRequest(res, `Invalid branch ID: ${branchId}`);
    }

    const shift = await Shift.findByIdAndUpdate(
      shiftId,
      {
        $set: {
          departments,
          branches,
          updatedAt: Date.now()
        }
      },
      { new: true }
    ).populate('departments branches');

    if (!shift) return badRequest(res, 'Shift not found');

    return success(res, 'Departments and branches assigned successfully', shift);

  } catch (error) {
    return unknownError(res, error);
  }
};



