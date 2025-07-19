const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const roleModel = require("../../model/adminMaster/role.model");
  const employeeModel = require("../../model/adminMaster/employe.model")
  const { roleGoogleSheet } = require('./masterGoogleSheet.controller')
  
  // ------------------Admin Master Add Role---------------------------------------
  async function roleAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if(req.body.roleName){
        req.body.roleName = req.body.roleName;
      }
      const roleDetail = await roleModel.create(req.body);
      success(res, "Role Added Successful", roleDetail);
      await roleGoogleSheet(roleDetail)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Role "active" or "inactive" updated---------------------------------------
  async function roleActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          const  id = req.body.id;
          const status = req.body.status
          if (!id || id.trim() === "") {
            return badRequest(res , "ID is required and cannot be empty");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return badRequest(res , "Invalid ID");
        }
            if (status == "active") {
                const roleUpdateStatus =  await roleModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "Role Active" ,roleUpdateStatus);
            }
           else if (status == "inactive") {
            const roleUpdateStatus =  await roleModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "Role inactive" ,roleUpdateStatus);
            }
            else{
                return badRequest(res , "Status must be 'active' or 'inactive'");
            }
           
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update Role Name Role ---------------------------------------
  async function updateRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { roleId, ...updateFields } = req.body;
      if (typeof updateFields.roleName === 'string') {
        updateFields.roleName = updateFields.roleName.trim().toLowerCase();
      }
      const updateData = await roleModel.findByIdAndUpdate(roleId, updateFields, {new :true});
      success(res, "Updated Role",updateData);
      await roleGoogleSheet(updateData)
      // console.log(updateData,'update data')
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get All Role---------------------------------------
  async function getAllRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        
      const roleDetail = await roleModel.find({status:"active"});
      success(res, "All Roles",roleDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  async function getAllRoleByType(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const {roleType} = req.query
         const roleDetail = await roleModel.find({status:"active", roleName:roleType});
      success(res, `${roleType} List`,roleDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };


  // -----------------GET ROLE :- "visit" , "collection" List Employee List----------------
async function  getCollectionRoleEmploye(req, res){
  try {
    // Find roles with names "visit" or "collection"
    const targetRoles = await roleModel.find(
      { roleName: { $in: ["visit", "collection"] } },
      { _id: 1, roleName: 1 }
    );

    if (!targetRoles.length) {
      return notFound(res, "No matching roles found");
    }

    // Get role IDs
    const roleIds = targetRoles.map(role => role._id);

    // Find employees who have these roleIds in their roleId array
    const employees = await employeeModel.find(
      { roleId: { $in: roleIds } , status:"active"},
      { _id:1 , employeName: 1, employeUniqueId: 1 }
    );

    if (!employees.length) {
      return notFound(res, "No employees found with these roles");
    }

    // Format the response
    const response = {
      totalCount: employees.length,
      employees: employees.map(emp => ({
        _id: emp._id,
        employeeName: emp.employeName,
        employeeUniqueId: emp.employeUniqueId
      }))
    };

    return success(res, "Employees fetched successfully", response);

  } catch (error) {
    console.error('Error in getEmployeesByRole:', error);
    return unknownError(res, error);
  }
};
  
  module.exports = {
    roleAdd,
    roleActiveOrInactive,
    updateRole,
    getAllRole,
    getAllRoleByType,
    getCollectionRoleEmploye
  };
  
