import locationModel from "../../models/trackingModel/tracking.model.js";
import { locationFormatter } from "../../formatters/tracking.formatter/tracking.formatter.js";
import { returnFormatter } from "../../formatters/common.formatter.js";
import mongoose from "mongoose";
import employeModel from "../../models/employeemodel/employee.model.js";

import {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
  } from "../../formatters/globalResponse.js"

// Add location
// user give latitude and langitude  add location
export const saveLocation = async(req , res)=> {
  try {
    const { latitude, longitude } = req.body;
    console.log('req',req.employee.id)

    console.log('0')
    // Check if latitude and longitude are provided
    if (latitude === undefined || longitude === undefined) {
      return badRequest(false, "Latitude and Longitude are required");
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return badRequest(false, "Latitude and Longitude must be valid numbers");
    }

    // Use formatter after validation
    const formatted = {
      employeeId: req.employee.id,
      location: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON format
      },
    };

    if (!formatted.employeeId) {
      return notFound(false, "Employee ID is required");
    }

    const locationExists = await locationModel.findOne({
      employeeId: formatted.employeeId,
      "location.coordinates": formatted.location.coordinates,
    });


    const location = await locationModel.create(formatted);
    console.log('7')
    return success(res, "Location added successfully", location);

  } catch (error) {
    console.error("Error saving location:", error);
    return unknownError(res , error)
  }
}

// Get location list with optional filters
export async function fetchLocationList(req , res) {
    try {
        const { startDate, endDate, employeeId } = req.query;

        const match = {};

        if (startDate && endDate) {
            match.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        if (!employeeId) {
            return badRequest(res, "Employee ID Reruired");
        }

        const employeeDetail = await employeModel.findById(employeeId, {status:"active"});
        
        if (!employeeDetail) {
            return notFound(res, "Employee not found");
        }

        const data = await locationModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "employees",
                    localField: "employeeId",
                    foreignField: "_id",
                    as: "employeeDetails",
                },
            },
            {
                $unwind: "$employeeDetails",
            },
            {
                $project: {
                    _id: 1,
                    location: 1,
                    createdAt: 1,
                    userName: "$employeeDetails.userName",
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);

        return success(res, "Location list fetched successfully", data);
    } catch (error) {
        return unknownError(res, error.message);
    }
}
