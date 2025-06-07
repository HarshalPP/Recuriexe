import Holiday from "../../../models/calenderModel/holidayModel/holiday.model.js"
import {
    success,
    unknownError,
    serverValidation,
    badRequest
  } from "../../../formatters/globalResponse.js"
  import { validationResult } from "express-validator";



  // Add Holiday //


  export const manageHoliday = async (req, res) => {
    try {
      let {
        title = '',
        date,
        description = '',
        type = 'Company',
        status = 'active',
        employeeId = null
      } = req.body;
  
      if (!date) {
        return badRequest(res , "Date is Required")
      }
  
      // Override employeeId from middleware, if available
      if (req.employee.id) {
        employeeId = req.employee.id;
      }
  
      const holidayDate = new Date(date);
  
      const holiday = await Holiday.findOneAndUpdate(
        {
          date: {
            $gte: new Date(holidayDate.setHours(0, 0, 0, 0)),
            $lte: new Date(holidayDate.setHours(23, 59, 59, 999)),
          },
        },
        {
          title,
          date: holidayDate,
          description,
          type,
          status,
          employeeId,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
  
      return success(res, 'Holiday added/updated successfully', holiday);
    } catch (error) {
      return unknownError(res, error);
    }
  };


  // check Holiday //
  export const checkOrListHolidays = async (req, res) => {
    try {
      const { date, type, year, month } = req.query;
      const filter = { status: 'active' };
  
      // Case 1: Check if a specific date is a holiday
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
  
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
  
        filter.date = { $gte: startOfDay, $lte: endOfDay };
  
        const holiday = await Holiday.findOne(filter);
  
        return success(
          res,
          holiday ? 'It is a holiday.' : 'It is not a holiday.',
          {
            date,
            isHoliday: !!holiday,
            ...(holiday && { holiday }),
          }
        );
      }
  
      // Case 2: Filter by type
      if (type) {
        filter.type = type;
      }
  
      if (year && month) {
        // Filter for specific month in a specific year
        const start = new Date(parseInt(year), parseInt(month) - 1, 1);
        const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      } else if (year) {
        // Filter for entire year
        const start = new Date(parseInt(year), 0, 1);
        const end = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      } else if (month) {
        // Filter for a month in the current year
        const currentYear = new Date().getFullYear();
        const start = new Date(currentYear, parseInt(month) - 1, 1);
        const end = new Date(currentYear, parseInt(month), 0, 23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      }
      
  
      const holidays = await Holiday.find(filter).sort({ date: 1 });
  
      return success(res, 'Holidays fetched successfully', {
        count: holidays.length,
        holidays,
      });
  
    } catch (error) {
      return unknownError(res, error);
    }
  };




  // delete Holiday //


  export const deleteHoliday = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) return badRequest(res, "Holiday ID is required");
  
      const deleted = await Holiday.findByIdAndDelete(id);
  
      if (!deleted) return badRequest(res, "Holiday not found");
  
      return success(res, "Holiday deleted successfully", deleted);
    } catch (error) {
      return unknownError(res, error);
    }
  };



  // Holiday DashBoard //


  export const holidayDashboard = async (req, res) => {
    try {
      const now = new Date();
  
      const totalHolidays = await Holiday.countDocuments();
      const activeHolidays = await Holiday.countDocuments({ status: 'active' });
  
      const upcomingHolidays = await Holiday.countDocuments({
        date: { $gte: now },
        status: 'active',
      });
  
      const distinctTypes = await Holiday.distinct('type');
  
      const mostCommonTypeAgg = await Holiday.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);
  
      const nextHolidays = await Holiday.find({ date: { $gte: now }, status: 'active' })
        .sort({ date: 1 })
        .limit(3)
        .select('title date type');
  
      const lastUpdatedHoliday = await Holiday.findOne().sort({ updatedAt: -1 }).select('title updatedAt');
  
      return success(res, 'Holiday dashboard stats', {
        totalHolidays,
        activeHolidays,
        upcomingHolidays,
        distinctHolidayTypes: distinctTypes.length,
        mostCommonType: mostCommonTypeAgg[0]?._id || 'N/A',
        nextHolidays,
        lastUpdatedHoliday,
      });
    } catch (error) {
      return unknownError(res, error);
    }
  };