const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const bodEodModel = require("../../model/taskManagement/bodEod.model"); 
  const employeModel = require("../../model/adminMaster/employe.model")
  const moment = require("moment-timezone");

//---------------------BOD EOD ADD---------------------------------------
// async function bodEodAdd(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const { employeeId, task, description} = req.body;
//     if (!employeeId || employeeId.trim() === "") {
//         return badRequest(res, "Please Select employeeId");
//       }
//     const employeDetail = await employeModel.findById({ _id: new ObjectId(req.body.employeeId) , status: "active"});
//     if (!employeDetail) {
//         return badRequest(res, "Invalid employe Details");
//       }
//       const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

//     const bodEodEntry = new bodEodModel({
//       employeeId,
//       task,
//       description,
//       startDate
//     });


//     const data = await bodEodEntry.save();

//     return success(res ,"BOD/EOD entry created successfully", data);

// } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }
async function bodEodAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { assignBy, employeeId, tasks, description } = req.body;

    // Ensure employeeId is provided as a valid string
    if (!employeeId) {
      return badRequest(res, "Please provide a valid employeeId");
    }

    // Ensure tasks is an array
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return badRequest(res, "Please provide tasks as a non-empty array");
    }

    // Validate each task object (task and dueDate)
    for (const taskObj of tasks) {
      if (!taskObj.task || taskObj.task.trim() === "") {
        return badRequest(res, "Each task must have a valid task name");
      }
      if (!taskObj.dueDate || isNaN(new Date(taskObj.dueDate))) {
        return badRequest(res, "Each task must have a valid dueDate");
      }
    }

    const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    // Validate the employeeId
    const validEmployee = await employeModel.findOne({
      _id: new ObjectId(employeeId),
      status: "active",
    });

    if (!validEmployee) {
      return badRequest(res, "No valid employee found");
    }

    // Prepare BOD/EOD entries
    const bodEodEntries = tasks.map(({ task, dueDate }) => ({
      employeeId: validEmployee._id,
      assignBy,
      task,
      dueDate, 
      description,
      startDate,
    }));

    // Insert all entries (even if it's just one task)
    const data = await bodEodModel.insertMany(bodEodEntries);

    return success(res, "BOD/EOD entries created successfully", data);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}





// ----------------GET BOD EOD LIST  BY employeeId------------------------
async function getbodEodByEmployeeId(req, res) {
    try {
      const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

      const result = await bodEodModel.aggregate([
        { $match: { employeeId: new ObjectId(req.query.employeeId) } },  
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employeeDetail",
          },
        },
        { $unwind: "$employeeDetail" }, 
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$employeeId", 
            employeeDetail: { $first: "$employeeDetail" }, 
            tasks: {
              $push: { 
                _id: "$_id",
                employeeId:"$employeeId",
                task: "$task",
                description: "$description",
                startDate: "$startDate",
                endDate: "$endDate",
                managerBodStatus: "$managerBodStatus",
                managerEodStatus: "$managerEodStatus",
                status: "$status",
                createdAt: "$createdAt",
                updatedAt: "$updatedAt"
              }
            }
          }
        },
        {
          $project: {
           "employeeDetail.password": 0,"employeeDetail.bankDetails": 0,"employeeDetail.emergencyNumber": 0,"employeeDetail.aadhar": 0,
          "employeeDetail.panCard": 0,"employeeDetail.maritalStatus": 0,"employeeDetail.gender": 0,"employeeDetail.bankAccount": 0,
          "employeeDetail.ifscCode": 0,"employeeDetail.employeePhoto": 0,"employeeDetail.currentAddress": 0,"employeeDetail.permanentAddress": 0,
          "employeeDetail.branchId": 0,"employeeDetail.companyId": 0,"employeeDetail.roleId": 0,"employeeDetail.reportingManagerId": 0,
          "employeeDetail.departmentId": 0,"employeeDetail.designationId": 0,"employeeDetail.workLocationId": 0,"employeeDetail.constCenterId": 0,
          "employeeDetail.employementTypeId": 0,"employeeDetail.employeeTypeId": 0,"employeeDetail.status": 0,"employeeDetail.description": 0,
          "employeeDetail.offerLetter": 0,"employeeDetail.package": 0,"employeeDetail.resume": 0,"employeeDetail.salutation": 0,"employeeDetail.createdAt": 0,
          "employeeDetail.updatedAt": 0,"employeeDetail.__v": 0,"employeeDetail.fatherName": 0,"employeeDetail.employeUniqueId": 0,
          "employeeDetail.referedById": 0,"employeeDetail.bankAccountProof": 0,"employeeDetail.bankName": 0,
          "employeeDetail.currentAddressCity": 0,"employeeDetail.currentAddressPincode": 0,"employeeDetail.currentAddressState": 0,
          "employeeDetail.currentCTC": 0,"employeeDetail.currentDesignation": 0,"employeeDetail.educationCertification": 0,
          "employeeDetail.employmentProof": 0,"employeeDetail.endDate": 0,"employeeDetail.experienceLetter": 0,"employeeDetail.familyIncome": 0,
          "employeeDetail.fathersMobileNo": 0,"employeeDetail.fathersOccupation": 0,"employeeDetail.highestQualification": 0,
          "employeeDetail.lastOrganization": 0,"employeeDetail.motherName": 0,"employeeDetail.mothersMobileNo": 0,"employeeDetail.nameAsPerBank": 0,
          "employeeDetail.permanentAddressCity": 0,"employeeDetail.permanentAddressPincode": 0,"employeeDetail.permanentAddressState": 0,
          "employeeDetail.startDate": 0,"employeeDetail.totalExperience": 0,"employeeDetail.university": 0,
          _id: 0
          }
        }
      ]).sort({ createdAt: -1 });
      
      success(res, "Get Employee Task Detail", result.length > 0 ? result[0] : {});
  
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

//----------GET BOD EOD LIST BY TOKEN AND SELFTASK,ASSIGNTASK,RECEIVEDTASK-----------
async function getbodEodById(req, res) {
  try {
    
    // const tokenId = new ObjectId(req.Id); 
    const {employeeId,status } = req.query;
    const employeeDetail = await employeModel.findById({ _id: new ObjectId(employeeId) ,status:"active"})

if (!status || !['selfTask', 'assignedTask', 'receivedTask'].includes(status)) {
      return badRequest(res, "Status must be 'selfTask', 'assignedTask', or 'receivedTask'.")

    }

    // Create a match condition based on the task status
    let matchCondition = {};

    if (status === "selfTask") {
      matchCondition = {
        employeeId: employeeDetail._id, 
        assignBy: employeeDetail._id      
      };
    }

    // For assignedTask: the user assigns the task to someone else
    else if (status === "assignedTask") {
      matchCondition = {
        assignBy: employeeDetail._id, 
        employeeId: { $ne: employeeDetail._id }
      };
    }

    else if (status === "receivedTask") {
      matchCondition = {
        employeeId: employeeDetail._id,  
        assignBy: { $ne: employeeDetail._id }
      };
    }

    // Fetch tasks based on the match condition
    const result = await bodEodModel.aggregate([
      { $match: matchCondition }, 
      {
        $lookup: {
          from: "employees",       
          localField: "employeeId", 
          foreignField: "_id",      
          as: "employeeDetail"     
        },
      },
      { $unwind: "$employeeDetail" },  
      { $sort: { createdAt: -1 } },   
      {
        $project: {
          "employeeDetail.password": 0,  
          "employeeDetail.bankDetails": 0,
          //  _id: 0  
        }
      },
      {
        $lookup: {
          from: "employees",       
          localField: "assignBy", 
          foreignField: "_id",      
          as: "assignDetail"     
        },
      },
      { $unwind: "$assignDetail" },  
      { $sort: { createdAt: -1 } },   
      {
        $project: {
          "assignDetail.password": 0,  
          "assignDetail.bankDetails": 0,
          //  _id: 0  
        }
      }
    ]);

    // Return the filtered tasks
    return success(res,"Task details fetched successfully", result )
  
  } catch (error) {
    console.log(error);
    unknownError(res, error.message);
  }
}

//----------------GET BOD EOD LIST BY REPORTING MANAGER ID----------------
async function getbodEodByManagerId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Extract tokenId from request
    const tokenId = req.Id;

    // Find the employee by reportingManagerId
    const employees = await employeModel.find({ reportingManagerId: tokenId });
    const employeeId = employees.map(emp => emp._id);
    console.log("dd",employeeId)
    if (!employeeId.length) {
      return notFound(res, "Employee not found with the provided reportingManagerId.")
   
    }

    // If the employee is found, proceed with the aggregation
    const result = await bodEodModel.aggregate([
      { $match: { employeeId: { $in: employeeId } } },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail",
        },
      },
      { $unwind: "$employeeDetail" },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$employeeId",
          employeeDetail: { $push: "$employeeDetail" },
          tasks: {
            $push: {
              _id: "$_id",
              employeeId: "$employeeId",
              task: "$task",
              description: "$description",
              startDate: "$startDate",
              endDate: "$endDate",
              managerBodStatus: "$managerBodStatus",
              managerEodStatus: "$managerEodStatus",
              status: "$status",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
        },
      },
      {
        $project: {
          "employeeDetail.password": 0,
          "employeeDetail.bankDetails": 0,
          "employeeDetail.emergencyNumber": 0,
          "employeeDetail.aadhar": 0,
          "employeeDetail.panCard": 0,
          "employeeDetail.maritalStatus": 0,
          "employeeDetail.gender": 0,
          "employeeDetail.bankAccount": 0,
          "employeeDetail.ifscCode": 0,
          "employeeDetail.employeePhoto": 0,
          "employeeDetail.currentAddress": 0,
          "employeeDetail.permanentAddress": 0,
          "employeeDetail.branchId": 0,
          "employeeDetail.companyId": 0,
          "employeeDetail.roleId": 0,
          "employeeDetail.reportingManagerId": 0,
          "employeeDetail.departmentId": 0,
          "employeeDetail.designationId": 0,
          "employeeDetail.workLocationId": 0,
          "employeeDetail.constCenterId": 0,
          "employeeDetail.employementTypeId": 0,
          "employeeDetail.employeeTypeId": 0,
          "employeeDetail.status": 0,
          "employeeDetail.description": 0,
          "employeeDetail.offerLetter": 0,
          "employeeDetail.package": 0,
          "employeeDetail.resume": 0,
          "employeeDetail.salutation": 0,
          "employeeDetail.createdAt": 0,
          "employeeDetail.updatedAt": 0,
          "employeeDetail.__v": 0,
          "employeeDetail.fatherName": 0,
          "employeeDetail.employeUniqueId": 0,
          "employeeDetail.referedById": 0,
          "employeeDetail.bankAccountProof": 0,
          "employeeDetail.bankName": 0,
          "employeeDetail.currentAddressCity": 0,
          "employeeDetail.currentAddressPincode": 0,
          "employeeDetail.currentAddressState": 0,
          "employeeDetail.currentCTC": 0,
          "employeeDetail.currentDesignation": 0,
          "employeeDetail.educationCertification": 0,
          "employeeDetail.employmentProof": 0,
          "employeeDetail.endDate": 0,
          "employeeDetail.experienceLetter": 0,
          "employeeDetail.familyIncome": 0,
          "employeeDetail.fathersMobileNo": 0,
          "employeeDetail.fathersOccupation": 0,
          "employeeDetail.highestQualification": 0,
          "employeeDetail.lastOrganization": 0,
          "employeeDetail.motherName": 0,
          "employeeDetail.mothersMobileNo": 0,
          "employeeDetail.nameAsPerBank": 0,
          "employeeDetail.permanentAddressCity": 0,
          "employeeDetail.permanentAddressPincode": 0,
          "employeeDetail.permanentAddressState": 0,
          "employeeDetail.startDate": 0,
          "employeeDetail.totalExperience": 0,
          "employeeDetail.university": 0,
          _id: 0,
        },
      },
    ]).sort({ createdAt: -1 });

    // Send the result as a response
    success(res, "Get Employee Task Detail", result.length > 0 ? result[0] : {});

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}



// ----------------UPDATE BOD EOD LIST  BY employeeId---------------------
async function updateEodByemployeId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { taskId, status } = req.body;


     const validStatuses = ["pending", "processing", "completed"];
     if (!validStatuses.includes(status)) {
       return badRequest(res, `Invalid status. Allowed values are: ${validStatuses.join(", ")}`);
     }
    // Check if employeeId is provided
    if (!taskId || taskId.trim() === "") {
      return badRequest(res, "Please Select taskId");
    }

    const endDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDTh:mm:ss A");
    const updatedBodEod = await bodEodModel.findByIdAndUpdate(
      { _id: new ObjectId(taskId) }, 
      { $set: { endDate, status } }, 
      { new: true, upsert: false } 
    );

    if (!updatedBodEod) {
      return badRequest(res, "BOD/EOD entry not found for the given taskId");
    }

    return success(res, "BOD/EOD entry updated successfully", updatedBodEod);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// --------------GET API TO CHECK EMPLOYEE DONE BOD OR EOD----------------
async function getbodEodVerify(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
 const tokenId = new ObjectId(req.Id)
   console.log("sd",tokenId)
   const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
    
    // Query the database
    const result = await bodEodModel.findOne({
      employeeId: tokenId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });

    console.log("Query Result:", result);
    if (result) {
      return success(res,"Get BOD / EOD Verify", {data: true} )
    } else {
      return success(res,"Get BOD / EOD Verify", {data: false });
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------Update Eod Bod By Manager----------------------------------
async function bodEodUpdateByManager(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id); 
  
    const { employeeId, remarkBodByManager, managerBodStatus, remarkEodByManager, managerEodStatus } = req.body;

    // Validate employeeId
    if (!employeeId || employeeId.trim() === "") {
      return badRequest(res, "Please select a valid employeeId");
    }

    // Check if the employee exists and is active
    const employeDetail = await employeModel.findById({
      _id: new ObjectId(employeeId),
      status: "active",
    });

    if (!employeDetail) {
      return badRequest(res, "Invalid employee details");
    }

    // Build the update object dynamically based on the provided fields
    const updateFields = {};
    if (remarkBodByManager) {
      updateFields.remarkBodByManager = remarkBodByManager;
      updateFields.managerBodStatus = managerBodStatus;
    
      // Set status based on managerBodStatus
      if (managerBodStatus === "accept") {
        updateFields.status = "processing";
        console.log("dd",managerBodStatus ,  updateFields.status)
      } else if (managerBodStatus === "reject") {
        updateFields.status = "pending";
      }
    }
    
    // Update fields for remarkEodByManager
    if (remarkEodByManager) {
      updateFields.remarkEodByManager = remarkEodByManager;
      updateFields.managerEodStatus = managerEodStatus;
    
      // Set status based on managerEodStatus
      if (managerEodStatus === "accept") {
        updateFields.status = "completed";
      } else if (managerEodStatus === "incomplete") {
        updateFields.status = "processing";
      }
    }
    
    const updatedData = await bodEodModel.findOneAndUpdate({ employeeId: new ObjectId(employeeId)},
    { $set: updateFields ,updateBy: tokenId},
    { new: true } // Return the updated document
  );
 
    return success(res, "BOD/EOD entry updated successfully", updatedData);

  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}





module.exports = {
  bodEodAdd,
  getbodEodByEmployeeId,
  getbodEodById,
  getbodEodByManagerId,
  updateEodByemployeId,
  getbodEodVerify,
  bodEodUpdateByManager
};
