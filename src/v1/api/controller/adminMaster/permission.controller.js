const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const permissionModel = require("../../model/adminMaster/permission.model");

  // ------------------Admin Master Permission Pages---------------------------------------
  async function permissionPageAdd(req, res) {
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
      const employeeDetail = await permissionModel.findOne({employeeId:req.body.employeeId , status:"active"})
      if(employeeDetail){
         return badRequest(res, "Employe Already Permission Please Update Only") 
      }
      const permissionDetail = await permissionModel.create(req.body);
     
      success(res, "Permission Page For Employee Successful", permissionDetail);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Permission Page  "active" to  "inactive"(DELETE)---------------------------------------
  async function permissionPageActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          // const status = req.body.status
          const { permissionPageId } = req.body;
          if (!permissionPageId || permissionPageId.trim() === "") {
              return badRequest(res , "permissionPageId Id is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(permissionPageId)) {
            return badRequest(res , "Invalid ID");
          }
          const permission = await permissionModel.findById({ _id: new ObjectId(permissionPageId) });
          if (!permission) {
            return badRequest(res, "permissionPageId  Not Found");
          }

           const permissionUpdate =  await permissionModel.findByIdAndUpdate({ _id:permissionPageId}, { status: "inactive"},{new:true})
            success(res, "Permission Page Inactive" ,permissionUpdate);
          //  else if (status == "inactive") {
          // const bankStatusUpdate =  await permissionModel.findByIdAndUpdate({ _id:bankNameId}, { status:"inactive"},{new:true})
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
  
  // ------------------Admin Master Update  Permission Page ---------------------------------------
  async function updatePermissionPage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { permissionPageId, ...updateFields } = req.body;
      if (!permissionPageId || permissionPageId.trim() === "") {
        return badRequest(res, "Please Select permissionPageId");
      }
  
      const bankNameDetail = await permissionModel.findById({ _id: new ObjectId(permissionPageId) });
      if (!bankNameDetail) {
        return badRequest(res, "permissionPageId  Not Found");
      }

      const updateData = await permissionModel.findByIdAndUpdate(permissionPageId, updateFields, {new :true});
      success(res, "Updated Permission Page",updateData);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Get All Permission Page---------------------------------------
  async function getAllPermissionPage(req, res) {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({
              errorName: "serverValidation",
              errors: errors.array(),
            });
          }
    
          const permissionPageDetail = await permissionModel.aggregate([
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
          success(res, "Permission Page List For Employe",permissionPageDetail);
        } catch (error) {
          console.log(error);
          unknownError(res, error);
        }
      };
// ------------------Admin Master Get Permission Page By employeeId ---------------------------------------
async function getPermissionPageById(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
         const employeeId = new ObjectId(req.query.employeeId)
      const permissionPageDetail = await permissionModel.aggregate([
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
      success(res, "Permission Page List For Employe",permissionPageDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

  

  module.exports = {
    permissionPageAdd,
    permissionPageActiveOrInactive,
    updatePermissionPage,
    getAllPermissionPage,
    getPermissionPageById,
  };
  