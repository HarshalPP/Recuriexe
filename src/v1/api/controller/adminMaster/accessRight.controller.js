const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const accessRightModel = require("../../model/adminMaster/accessRight.model");

  // ------------------Admin Master Access Rights---------------------------------------
  async function addAccessRights(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.employeeId) {
        req.body.employeeId = req.body.employeeId;
      }
      const employeeDetail = await accessRightModel.findOne({employeeId:req.body.employeeId , status:"active"})
      if(employeeDetail){
         return badRequest(res, "Employe Already Permission Please Update Only") 
      }
      const accessDetail = await accessRightModel.create(req.body);
     
      success(res, "Access Rights For Employee Successful", accessDetail);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Access Rights  "active" to  "inactive"(DELETE)---------------------------------------
  async function toggleAccessRightsStatus(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          // const status = req.body.status
          const { accessRightId } = req.body;
          if (!accessRightId || accessRightId.trim() === "") {
              return badRequest(res , "Access Right Id  is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(accessRightId)) {
            return badRequest(res , "Invalid ID");
          }
          const accessDetail = await accessRightModel.findById({ _id: new ObjectId(accessRightId) });
          if (!accessDetail) {
            return badRequest(res, "accessRightId  Not Found");
          }

           const accessDetailUpdate =  await accessRightModel.findByIdAndUpdate({ _id:accessRightId}, { status: "inactive"},{new:true})
            success(res, "Access Right Page Inactive" ,accessDetailUpdate);
          //  else if (status == "inactive") {
          // const bankStatusUpdate =  await accessRightModel.findByIdAndUpdate({ _id:bankNameId}, { status:"inactive"},{new:true})
          //   success(res, "Bank inactive" ,bankStatusUpdate);
          //   }
          //   else{
          //       return badRequest(res,"Status must be 'active' or 'inactive'");
          //   }
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update  Access Rights ---------------------------------------
  async function updateAccessRights(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { accessRightId, ...updateFields } = req.body;
      if (!accessRightId || accessRightId.trim() === "") {
        return badRequest(res, "Please Select accessRightId");
      }
  
      const accessDetail = await accessRightModel.findById({ _id: new ObjectId(accessRightId) });
      if (!accessDetail) {
        return badRequest(res, "accessRightId  Not Found");
      }

      const updateData = await accessRightModel.findByIdAndUpdate(accessRightId, updateFields, {new :true});
      success(res, "Updated Access Rights",updateData);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Get All Access Rights---------------------------------------
  async function getAllAccessRights(req, res) {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({
              errorName: "serverValidation",
              errors: errors.array(),
            });
          }
    
          const accessDetail = await accessRightModel.aggregate([
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
          success(res, "Access Rights List For Employe",accessDetail);
        } catch (error) {
          console.log(error);
          unknownError(res, error);
        }
      };
// ------------------Admin Master Get Access Rights By employeeId ---------------------------------------
async function getAccessRightsDetailById(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
         const employeeId = new ObjectId(req.query.employeeId)
      const accessDetail = await accessRightModel.aggregate([
        { $match: {employeeId:employeeId,status:'active'}},
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
      success(res, "Access Rights List For Employe",accessDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

  

  module.exports = {
    addAccessRights,
    updateAccessRights,
    getAllAccessRights,
    getAccessRightsDetailById,
    toggleAccessRightsStatus
  };
  