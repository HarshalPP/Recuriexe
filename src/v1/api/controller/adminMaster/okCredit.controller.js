const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const okCreditModel = require("../../model/adminMaster/okCredit.model");
 const employeModel = require("../../model/adminMaster/employe.model");
  
// ------------------Admin Master Assign OkCredit No---------------------------------------
async function okCreditAssign(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      let creditData = req.body;
  
      if (!Array.isArray(creditData)) {
        creditData = [creditData]; 
      }
      const employeeIds = creditData.map(data => data.employeeId);
      const existingEmployees = await okCreditModel.find({
        employeeId: { $in: employeeIds },
        status: "active"
      });
  
      if (existingEmployees.length > 0) {
        const employeeNames = await employeModel.find({
          _id: { $in: existingEmployees.map(emp => emp.employeeId) }
        }).select('employeName');
  
        const employeeNamesStr = employeeNames.map(emp => emp.employeName).join(', ');
  
        return badRequest(res, `Employees ${employeeNamesStr} already assigned`);
      }
  
      // If no employeeId exists, save all the data
      const savedCredits = await okCreditModel.insertMany(creditData);
      success(res, "Credit Assign Successful", savedCredits);
  
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  
  
  // ------------------Admin Master update Credit NO. ---------------------------------------
  async function creditNoUpdate(req, res) {
    try {
      // Validate the incoming request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { creditId, creditNo, employeeId } = req.body;
      const creditRecord = await okCreditModel.findById(creditId);
      if (!creditRecord) {
        return notFound(res, "Credit record not found");
      }
      if (!creditNo || !employeeId) {
        return badRequest(res,"creditNo and employeeId cannot be empty");
      }

      creditRecord.creditNo = creditNo;
      creditRecord.employeeId = employeeId;
      const updatedCreditRecord = await creditRecord.save();
      return success(res, "CreditNo and EmployeeId updated successfully", updatedCreditRecord);
  
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Get All Assign To Ok Credit No---------------------------------------
  async function getAllOkCreditAssign(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }

      const creditNoDetail = await okCreditModel.aggregate([
        { $match: {status:'active'}},
        {
            $lookup: {
                from : "employees",
                localField:"employeeId",
                foreignField:"_id",
                as:"employeeDetail"
            }
        },
        {
            $project:{
                 "employeeDetail.__v":0, "employeeDetail.createdAt":0,"employeeDetail.updatedAt":0,"employeeDetail.password":0,
                 "employeeDetail.employeeTypeId":0, "employeeDetail.joiningDate":0,"employeeDetail.dateOfBirth":0,"employeeDetail.fatherName":0,
                 "employeeDetail.companyId":0, "employeeDetail.branchId":0,"employeeDetail.workLocationId":0,"employeeDetail.departmentId":0,
                 "employeeDetail.designationId":0, "employeeDetail.reportingManagerId":0,"employeeDetail.roleId":0,"employeeDetail.userName":0,
                 "employeeDetail.employementTypeId":0, "employeeDetail.employeeTypeId":0,"employeeDetail.permanentAddress":0,"employeeDetail.currentAddress":0,
                 "employeeDetail.constCenterId":0,"employeeDetail.description":0, "employeeDetail.status":0,"employeeDetail.email":0,
            }
        },
        {$unwind:"$employeeDetail"}
      ]);
      success(res, "OkCredit Assign List ",creditNoDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Status Active Or Inactive---------------------------------------
  async function okCreditActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
            const  id = req.body.creditId;
            const status = req.body.status
            if (!id || id.trim() === "") {
              return badRequest(res , "ID is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest(res , "Invalid ID");
          }
            if (status == "active") {
                const okCreditUpdateStatus =  await okCreditModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "okCredit active" ,okCreditUpdateStatus);
            }
           else if (status == "inactive") {
            const okCreditUpdateStatus =  await okCreditModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "okCredit  inactive" ,okCreditUpdateStatus);
            }
            else{
                return badRequest(res, "Status must be 'active' or 'inactive'");
            }
           
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }

  module.exports = {
    okCreditAssign,
    creditNoUpdate,
    getAllOkCreditAssign,
    okCreditActiveOrInactive
  };
  