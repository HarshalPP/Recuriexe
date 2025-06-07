import SundayModel from "../../../models/calenderModel/sundayWokingModel/sunday.working.model.js"
import {
    success,
    unknownError,
    serverValidation,
    badRequest
  } from "../../../formatters/globalResponse.js"
  import { validationResult } from "express-validator";


export const manageSunday = async (req, res) => {
    try {
      const {
        title = '',
        date,
        status = 'active',
        department = [],
        departmentSelection = '',
        isWorking = false,
        reason = ''
      } = req.body;
  
      if (!date || department.length === 0) {
        return badRequest(res, "Please provide both the Date and Department.");
      }
  
      const employeeId = req.employee.id;
  
      const formattedDepartments = department.map(dept => ({
        departmentId: dept.departmentId || null,
      }));
  
      const sunday = await SundayModel.findOneAndUpdate(
        { date },
        {
          title,
          date,
          employeeId,
          status,
          department: formattedDepartments,
          departmentSelection,
          isWorking,
          reason
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
  
      return success(res, "Sunday added/updated successfully", sunday);
    } catch (error) {
      console.error(error);
      return unknownError(res, error);
    }
  };



  // Get all Sunday entries
  export const getSunday = async (req, res) => {
    try {
      const { year, month, date } = req.query;
      const status = "active";
      const matchStage = { status };
  
      // Case 1: Exact date filter
      if (date) {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        matchStage.date = { $gte: startOfDay, $lte: endOfDay };
      }
  
      // Case 2: Filter by year and optionally by month
      else if (year && month) {
        const start = new Date(parseInt(year), parseInt(month) - 1, 1);
        const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
        matchStage.date = { $gte: start, $lte: end };
      }
  
      // Case 3: Filter by year only
      else if (year) {
        const start = new Date(parseInt(year), 0, 1);
        const end = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
        matchStage.date = { $gte: start, $lte: end };
      }
  
      // Case 4: Filter by month only (across all years)
      else if (month) {
        const monthNum = parseInt(month) - 1;
        matchStage.$expr = {
          $eq: [{ $month: "$date" }, monthNum + 1],
        };
      }
  
      const sundays = await SundayModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "newdepartments",
            localField: "department.departmentId",
            foreignField: "_id",
            as: "departmentDetails",
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employeeDetails",
          },
        },
        {
          $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            title: 1,
            date: 1,
            status: 1,
            departmentSelection: 1,
            isWorking: 1,
            reason: 1,
            departmentDetails: {
              _id: 1,
              name: 1,
            },
            employeeDetails: {
              _id: 1,
              employeName: 1,
            },
          },
        },
        { $sort: { date: -1 } },
      ]);
  
      return success(res, "Data fetched successfully", sundays);
    } catch (error) {
      console.error("Error in getSunday:", error);
      return unknownError(res, error);
    }
  };
  
  
  // Get Sunday by ID
  export const getSundayById = async (req, res) => {
    try {
      const { id } = req.query;
  
      if (!id) {
        return serverValidation(res, "Missing required query parameter: id");
      }
  
      const holiday = await SundayModel.findById(id);
  
      if (!holiday) {
        return badRequest(res, "Sunday not found.");
      }
  
      return success(res, "Data fetched successfully", holiday);
    } catch (error) {
      return unknownError(res, error);
    }
  };
  
  // Delete Sunday by ID
  export const deleteSunday = async (req, res) => {
    try {
      const { id } = req.query;
  
      if (!id) {
        return serverValidation(res, "Missing required query parameter: id");
      }
  
      const holiday = await SundayModel.findByIdAndDelete(id);
  
      if (!holiday) {
        return badRequest(res, "Sunday not found.");
      }
  
      return success(res, "Sunday deleted successfully");
    } catch (error) {
      return unknownError(res, error);
    }
  };


  // Dashboard api //


  export const sundayDashboard = async (req, res) => {
    try {
      const today = new Date();
  
      const [
        totalSundays,
        activeCount,
        inactiveCount,
        upcomingCount,
        workingCount,
        reasonStats
      ] = await Promise.all([
        SundayModel.countDocuments(),
        SundayModel.countDocuments({ status: 'active' }),
        SundayModel.countDocuments({ status: 'inactive' }),
        SundayModel.countDocuments({ date: { $gte: today }, status: 'active' }),
        SundayModel.countDocuments({ isWorking: true }),
        SundayModel.aggregate([
          {
            $match: {
              isWorking: true,
              reason: { $ne: '' }
            }
          },
          {
            $group: {
              _id: '$reason',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              reason: '$_id',
              count: 1,
              _id: 0
            }
          }
        ])
      ]);
  
      return success(res, 'Sunday Dashboard Data', {
        totalSundays,
        activeCount,
        inactiveCount,
        upcomingCount,
        workingCount,
        reasonStats,
      });
    } catch (error) {
      console.error('Dashboard Error:', error);
      return unknownError(res, error);
    }
  };