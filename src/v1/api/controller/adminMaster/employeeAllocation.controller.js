const {
    success,
    unknownError,
    serverValidation,
    notFound,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const employeeAllocationModel = require("../../model/adminMaster/employeeAllocation.model")
  const employeeModel = require("../../model/adminMaster/employe.model")
  const roleModel = require("../../model/adminMaster/role.model")
//    ------------------Allocation For Employee------------------------------
async function employeeAllocationAdd(req, res) {
  try {
    const tokenId = new ObjectId(req.Id);

    // Find employee by _id: tokenId
    const employee = await employeeModel.findOne({ _id: tokenId });

    if (!employee) {
      return badRequest(res, "Employee not found");
    }

    const updatedAllocatedBy = employee.employeUniqueId;

    const { customerFinIds, ...allocations } = req.body;

    // Validate request body
    if (!Array.isArray(customerFinIds) || customerFinIds.length === 0) {
      return badRequest(res, "customerFinIds must be a non-empty array");
    }

    const savedAllocations = [];
    const updateAllocated = [];

    const operations = customerFinIds.map(async (customerFinId) => {
      // Check if allocation already exists
      let existingAllocation = await employeeAllocationModel.findOne({ customerFinId });

      if (existingAllocation) {
        // Update only provided allocations
        existingAllocation.allocatedBy = updatedAllocatedBy;
        Object.keys(allocations).forEach((key) => {
          if (allocations[key] !== undefined) {
            existingAllocation[key] = allocations[key];
          }
        });

        await existingAllocation.save();
        updateAllocated.push(existingAllocation);
      } else {
        // Save new allocation entry
        const newAllocation = await employeeAllocationModel.create({
          customerFinId,
          allocatedBy: updatedAllocatedBy,
          ...allocations
        });

        savedAllocations.push(newAllocation);
      }
    });

    await Promise.all(operations); // Execute all async operations in parallel

    return success(res, "Allocations Processed Successfully", {
      savedAllocations, // New allocations
      updateAllocated  // Updated allocations
    });

  } catch (error) {
    console.error("Error in employeeAllocationAdd:", error);
    return unknownError(res, error);
  }
}


// -------------------Allocation Update Single Or Multiple Allocation--------
async function employeeAllocationUpdate(req, res) {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { 
      employeeId, 
      customerFinId,
      allocation1,
      allocation2,
      allocation3,
      allocation4,
      allocation5,
      oldAllocationId, 
      newAllocationId 
    } = req.body;

    // Check for single employee allocation update
    if (employeeId && customerFinId) {
      // Create update object with only provided fields
      const updateFields = {};
      if (allocation1 !== undefined) updateFields.allocation1 = allocation1;
      if (allocation2 !== undefined) updateFields.allocation2 = allocation2;
      if (allocation3 !== undefined) updateFields.allocation3 = allocation3;
      if (allocation4 !== undefined) updateFields.allocation4 = allocation4;
      if (allocation5 !== undefined) updateFields.allocation5 = allocation5;
      if (allocation6 !== undefined) updateFields.allocation6 = allocation6;
      if (allocation7 !== undefined) updateFields.allocation7 = allocation7;
      if (allocation8 !== undefined) updateFields.allocation8 = allocation8;

      // Find and update the allocation for the given employeeId and customerFinId
      const updatedAllocation = await employeeAllocationModel.findOneAndUpdate(
        { 
          employeeId,
          customerFinId 
        },
        { 
          $set: updateFields
        },
        { 
          new: true,
          upsert: true // Create if doesn't exist
        }
      );

      // Check if an allocation was actually updated
      if (!updatedAllocation) {
        return badRequest(res, "Failed to update allocation");
      }

      // Respond with the updated allocation
      return success(res, "Allocation Updated Successfully", updatedAllocation);
    }

    // Check for bulk allocation ID change
    if (oldAllocationId && newAllocationId) {
      // Update all matching records in any allocation field
      const updateResult = await employeeAllocationModel.updateMany(
        {
          $or: [
            { allocation1: oldAllocationId },
            { allocation2: oldAllocationId },
            { allocation3: oldAllocationId },
            { allocation4: oldAllocationId },
            { allocation5: oldAllocationId },
            { allocation6: oldAllocationId },
            { allocation7: oldAllocationId },
            { allocation8: oldAllocationId }
          ]
        },
        {
          $set: {
            'allocation1': {
              $cond: [
                { $eq: ['$allocation1', oldAllocationId] },
                newAllocationId,
                '$allocation1'
              ]
            },
            'allocation2': {
              $cond: [
                { $eq: ['$allocation2', oldAllocationId] },
                newAllocationId,
                '$allocation2'
              ]
            },
            'allocation3': {
              $cond: [
                { $eq: ['$allocation3', oldAllocationId] },
                newAllocationId,
                '$allocation3'
              ]
            },
            'allocation4': {
              $cond: [
                { $eq: ['$allocation4', oldAllocationId] },
                newAllocationId,
                '$allocation4'
              ]
            },
            'allocation5': {
              $cond: [
                { $eq: ['$allocation5', oldAllocationId] },
                newAllocationId,
                '$allocation5'
              ]
            },
            'allocation6': {
              $cond: [
                { $eq: ['$allocation6', oldAllocationId] },
                newAllocationId,
                '$allocation6'
              ]
            },
            'allocation7': {
              $cond: [
                { $eq: ['$allocation7', oldAllocationId] },
                newAllocationId,
                '$allocation7'
              ]
            },
            'allocation8': {
              $cond: [
                { $eq: ['$allocation8', oldAllocationId] },
                newAllocationId,
                '$allocation8'
              ]
            }
          }
        }
      );

      // Fetch updated records
      const updatedRecords = await employeeAllocationModel.find({
        $or: [
          { allocation1: newAllocationId },
          { allocation2: newAllocationId },
          { allocation3: newAllocationId },
          { allocation4: newAllocationId },
          { allocation5: newAllocationId },
          { allocation6: newAllocationId },
          { allocation7: newAllocationId },
          { allocation8: newAllocationId }
        ]
      });

      // Respond with the updated records
      return success(res, "Allocation IDs updated successfully", {
        updatedCount: updateResult.modifiedCount,
        updatedRecords
      });
    }

    // Input validation error
    return badRequest(res, 
      "Invalid request data. Provide either employeeId with customerFinId and allocation details, or oldAllocationId and newAllocationId."
    );

  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function getAllocationAndNoAllocation(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Step 1: Get the "status" filter from query
    const { status } = req.query;

    // Step 2: Fetch all active employees
    const allEmployeDetails = await employeeModel.find({ status: "active" })
      .select(
        "image employeUniqueId _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company"
      )
      .sort({ createdAt: -1 })
      .populate({ path: "roleId", select: "roleName" })
      .populate({ path: "branchId", select: "name" })
      .populate({ path: "departmentId", select: "name" })
      .populate({ path: "designationId", select: "name" })
      .populate({ path: "workLocationId", select: "name" })
      .populate({ path: "reportingManagerId", select: "employeName" })
      .populate({ path: "employeeTypeId", select: "title" })
      .populate({ path: "employementTypeId", select: "title" })
      .populate({ path: "constCenterId", select: "title" });

    // Step 3: Fetch employee allocations if status is "allocation"
    let filteredDetails = [];
    if (status === "allocation") {
      const employeeAllocations = await employeeAllocationModel.find({});
      const employeeIdsWithAllocations = new Set(
        employeeAllocations.map(allocation => allocation.employeeId.toString())
      );

      // Filter employeDetails to only include employees with allocations
      filteredDetails = allEmployeDetails.filter(employe =>
        employeeIdsWithAllocations.has(employe._id.toString())
      );

      // Add allocation details to each employee
      const allocationDetails = await employeeModel.find({
        _id: { $in: employeeAllocations.map(allocation => allocation.allocationId) }
      }).select("_id image employeUniqueId workEmail mobileNo userName employeName");

      filteredDetails = filteredDetails.map(employe => {
        const employeeAllocation = employeeAllocations.find(
          allocation => allocation.employeeId.toString() === employe._id.toString()
        );
        const allocationDetail = allocationDetails.find(
          allocation => allocation._id.toString() === employeeAllocation.allocationId.toString()
        );

        return {
          employeeDetail: employe,
          allocationDetail: allocationDetail ? allocationDetail.toObject() : {} // Return empty object if no allocation found
        };
      });
    } else if (status === "noAllocation") {
      // Filter employeDetails to only include employees without allocations
      const employeeAllocations = await employeeAllocationModel.find({});
      const employeeIdsWithAllocations = new Set(
        employeeAllocations.map(allocation => allocation.employeeId.toString())
      );

      filteredDetails = allEmployeDetails.filter(
        employe => !employeeIdsWithAllocations.has(employe._id.toString())
      ).map(employe => ({
        employeeDetail: employe,
        allocationDetail: {} // Empty object for no allocation
      }));
    } else {
      // If no specific status is provided, return all employee details
      filteredDetails = allEmployeDetails.map(employe => ({
        employeeDetail: employe,
        allocationDetail: {} // Default empty object
      }));
    }

    // Step 4: Return the filtered employee details
    success(res, "Filtered Employee Details", filteredDetails);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

 
async function getAllocationEmployeeList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Step 1: Fetch all data from employeeAllocationModel
    const employeeAllocations = await employeeAllocationModel.find({});

    if (!employeeAllocations.length) {
      return res.status(404).json({
        message: "No employee allocations found.",
      });
    }

    // Step 2: Extract unique employeeIds and allocationIds from employeeAllocations
    const employeeIds = [...new Set(employeeAllocations.map(allocation => allocation.employeeId))];
    const allocationIds = [...new Set(employeeAllocations.map(allocation => allocation.allocationId))];

    // Step 3: Fetch allocation details from allocationModel for the allocationIds
    const allocationDetails = await employeeModel.find({ _id: { $in: allocationIds } }).select(
      "_id image employeUniqueId workEmail mobileNo userName employeName"
    );
        
    // Step 4: Fetch employee details from employeModel for the employeeIds
    const employeDetails = await employeeModel
      .find({ _id: { $in: employeeIds }, status: "active" })
      .select(
        "_id image employeUniqueId workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company"
      )
      .populate({ path: "roleId", select: "roleName" })
      .populate({ path: "branchId", select: "name" })
      .populate({ path: "departmentId", select: "name" })
      .populate({ path: "designationId", select: "name" })
      .populate({ path: "workLocationId", select: "name" })
      .populate({ path: "reportingManagerId", select: "employeName" })
      .populate({ path: "employeeTypeId", select: "title" })
      .populate({ path: "employementTypeId", select: "title" })
      .populate({ path: "constCenterId", select: "title" });

    // Step 5: Combine employee allocation details
    const allocationDetailWithEmployees = allocationDetails.map(allocation => {
      // Find employees associated with this allocationId
      const employees = employeeAllocations
        .filter(empAlloc => empAlloc.allocationId.toString() === allocation._id.toString())
        .map(empAlloc => employeDetails.find(emp => emp._id.toString() === empAlloc.employeeId.toString()));

      return {
        allocationId: allocation._id,
        allocationDetail: allocation, // Include all details of the allocation
        employeeDetail: employees.map(employee => employee ? employee.toObject() : null).filter(Boolean)
      };
    });

    // Step 6: Prepare the response
    success(res, "All Employees with Allocations", allocationDetailWithEmployees);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}



  
  module.exports = {
    employeeAllocationAdd,
    employeeAllocationUpdate,
    getAllocationAndNoAllocation,
    getAllocationEmployeeList

  };
  