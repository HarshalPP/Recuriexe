const {
  success,
  unknownError,
  serverValidation,
  unauthorized,
  badRequest,
  parseJwt,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const roleModel = require("../model/adminMaster/role.model");
const employeModel = require("../model/adminMaster/employe.model");
const vendorModel = require('../model/adminMaster/vendor.model')
const vendorTypeModel = require('../model/adminMaster/vendorType.model')
const lenderModel = require('../model/lender.model')
const customerModel = require("../model/customer.model")
const permissionPageModel = require("../model/adminMaster/accessRight.model")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { roamIdCreate } = require("../services/locationRoam.services");


// ---------------------Employee Login Api------------------------
async function employeLogin(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const { userName, password, employeeRole } = req.body;
      console.log(userName, password);
      if (employeeRole && employeeRole.toLowerCase() == "vendor") {
        const verifyVendor = await vendorModel.findOne({
          userName: userName,
          status: "active",
        });
        if (!verifyVendor) {
          return badRequest(res, "vendor Not Found")
        }
        const vendorRoleDetail = await vendorTypeModel.findById({
          _id: (verifyVendor.vendorType),
        });

        const roleDetail = await roleModel.findById({
          _id: (verifyVendor.roleId),
        });

        if (verifyVendor) {
          const isMatch = await bcrypt.compare(password, verifyVendor.password);
          if (isMatch) {
            // Generate JWT token
            const payload = {
              Id: verifyVendor._id,
              roleName: `${roleDetail.roleName}And${vendorRoleDetail.vendorType}`,
            };
            const token = jwt.sign(payload, 'FIN-COOPER');
            var data = {
              employeId: verifyVendor._id,
              userName: verifyVendor.userName,
              roleName: `${roleDetail.roleName}And${vendorRoleDetail.vendorType}`,
              token: token,
              roamId: "67604248cf332b259997fd8e"

            };
            return success(res, "Vendor Logged in successfully", data);
          } else {
            return badRequest(res, "Wrong password");
          }
        } else {
          return badRequest(res, "Not Found UserName");
        }


      } else if (employeeRole && employeeRole.toLowerCase() == "lender") {
        const verifyLender = await lenderModel.findOne({
          userName: userName,
          status: "active",
        });
        if (!verifyLender) {
          return badRequest(res, "lender Not Found")
        }
        if (verifyLender) {
          const isMatch = await bcrypt.compare(password, verifyLender.password);
          if (isMatch) {
            // Generate JWT token
            const payload = {
              Id: verifyLender._id,
              roleName: verifyLender.roleName,
            };
            const token = jwt.sign(payload, 'FIN-COOPER');
            var data = {
              employeId: verifyLender._id,
              userName: verifyLender.userName,
              roleName: verifyLender.roleName,
              token: token,
              roamId: "67604248cf332b259997fd8e"

            };
            return success(res, "Lender Logged in successfully", data);
          } else {
            return badRequest(res, "Wrong password");
          }
        } else {
          return badRequest(res, "Not Found UserName");
        }

      }

      const verifySalesMan = await employeModel.findOne({
        userName: userName,
        status: "active",
      });
      console.log("s", verifySalesMan);
      if (!verifySalesMan) {
        return badRequest(res, "User Name Not Found")
      }
      const roleDetail = await roleModel.findById({
        _id: (verifySalesMan.roleId),
      });
      if (verifySalesMan) {
        const isMatch = await bcrypt.compare(password, verifySalesMan.password);

        if (isMatch) {
          // Generate JWT token
          const payload = {
            Id: verifySalesMan._id,
            roleName: roleDetail.roleName,
          };
          const token = jwt.sign(payload, 'FIN-COOPER');
          // console.log("s",token);
          var data = {
            employeId: verifySalesMan._id,
            userName: verifySalesMan.userName,
            roleName: roleDetail.roleName,
            token: token,
            roamId: "67604248cf332b259997fd8e"
          };
          // console.log("s",token);
          success(res, "User Logged in successfully", data);
        } else {
          badRequest(res, "Wrong password");
        }
      } else {
        badRequest(res, "Not Found UserName");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function updatePasswordByUserName(req, res) {
  try {
    const { newPassword, oldPassword } = req.body;
    const employeeRole = req.roleName
    const userId = req.Id

    if (!employeeRole) {
      return badRequest(res, 'employeeRole required')
    }
    let verifySalesMan;
    if (employeeRole === 'vendor') {
      verifySalesMan = await vendorModel.findOne({
        _id: userId,
        status: "active",
      });
    } else {
      verifySalesMan = await employeModel.findOne({
        _id: userId,
        status: "active",
      });
    }

    if (!verifySalesMan) {
      return badRequest(res, "User not found or inactive");
    }

    const salt = await bcrypt.genSalt(10);
    const compare = await bcrypt.compare(oldPassword, verifySalesMan.password)
    if (!compare) {
      return badRequest(res, "Invalid password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    verifySalesMan.password = hashedPassword;
    verifySalesMan.passwordChangedAt = new Date(); // Update passwordChangedAt field
    await verifySalesMan.save();

    success(res, "Password updated successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function newEmployeeLogin(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { userName, password, employeeRole } = req.body;
    const timestamp = Date.now(); // Returns the current timestamp in milliseconds
    const timestampInSeconds = Math.floor(Date.now());

    // Handling vendor login
    if (employeeRole && employeeRole.toLowerCase() === "vendor") {
      const verifyVendor = await vendorModel.findOne({
        userName: userName,
        status: { $in: ["active", "new"] },
      });

      if (!verifyVendor) {
        return badRequest(res, "Vendor Not Found");
      }

      // const vendorRoleDetail = await vendorTypeModel.findById(verifyVendor.vendorType);
      const roleDetail = await roleModel.findById(verifyVendor.roleId);
      // console.log('roleDetail---///----',roleDetail)

      const isMatch = await bcrypt.compare(password, verifyVendor.password);
      if (isMatch) {
        // const roleNames = Array.isArray(roleDetail.roleName) ? roleDetail.roleName : [roleDetail.roleName];
        // const vendorTypeName = Array.isArray(vendorRoleDetail.vendorType) ? vendorRoleDetail.vendorType : [vendorRoleDetail.vendorType];


        const vendorTypeIds = Array.isArray(verifyVendor.vendorType) ? verifyVendor.vendorType : [verifyVendor.vendorType];
        // Use $in to find all matching role details in the roleModel
        const vendorTypeDetails = await vendorTypeModel.find({
          _id: { $in: vendorTypeIds },
        });

        // Extract role names from the role details
        if (roleDetail.roleName === "newVendor") {
          const vendorTypeName = vendorTypeDetails.map(role => role.vendorType);
          const payload = {
            Id: verifyVendor._id,
            roleName: ["newVendor"],
          };
          const token = jwt.sign(payload, 'FIN-COOPER');

          const data = {
            employeId: `${verifyVendor._id}`,
            userName: verifyVendor.fullName,
            roleName: ["newVendor"],
            token: token,
            roamId: "67604248cf332b259997fd8e",
            trackingMode: "active"
          };
          return success(res, "Vendor Logged in successfully", data);
        } else {

          const vendorTypeName = vendorTypeDetails.map(role => role.vendorType);
          const payload = {
            Id: verifyVendor._id,
            roleName: [...vendorTypeName],
          };
          const token = jwt.sign(payload, 'FIN-COOPER');

          const data = {
            employeId: `${verifyVendor._id}`,
            userName: verifyVendor.fullName,
            roleName: [...vendorTypeName],
            token: token,
            roamId: "67604248cf332b259997fd8e",
            trackingMode: "active"
          };
          return success(res, "Vendor Logged in successfully", data);
        }

      } else {
        return badRequest(res, "Wrong password");
      }
    }

    // Handling lender login
    if (employeeRole && employeeRole.toLowerCase() === "lender") {
      const verifyLender = await lenderModel.findOne({
        userName: userName,
        status: "active",
      });

      if (!verifyLender) {
        return badRequest(res, "Lender Not Found");
      }

      const isMatch = await bcrypt.compare(password, verifyLender.password);
      if (isMatch) {
        const roleNames = Array.isArray(verifyLender.roleName) ? verifyLender.roleName : [verifyLender.roleName];

        const payload = {
          Id: verifyLender._id,
          roleName: roleNames,
        };
        const token = jwt.sign(payload, 'FIN-COOPER');

        const data = {
          employeId: `${verifyLender._id}`,
          userName: verifyLender.fullName,
          roleName: roleNames,
          token: token,
          roamId: "67604248cf332b259997fd8e",
          trackingMode: "active"
        };

        return success(res, "Lender Logged in successfully", data);
      } else {
        return badRequest(res, "Wrong password");
      }
    }

    // Handling employee (salesman) login
    const verifySalesMan = await employeModel.findOne({
      userName: userName,
      status: "active",
    });
    
    if (!verifySalesMan) {
      return badRequest(res, "User Name Not Found..");
    }

    // Log the roleId field
    const roleIds = Array.isArray(verifySalesMan.roleId) ? verifySalesMan.roleId : [verifySalesMan.roleId];
    // Use $in to find all matching role details in the roleModel
    const roleDetails = await roleModel.find({
      _id: { $in: roleIds },
    });

    // Extract role names from the role details
    const roleNames = roleDetails.map(role => role.roleName);
    // const permissions = await permissionPageModel.findOne({ employeeId: verifySalesMan._id });
    // if (permissions) {
    //   Object.keys(permissions.toObject()).forEach(key => {
    //     if (permissions[key] === true) {
    //       roleNames.push(key); // Push the key to roleNames if the value is true
    //     }
    //   });
    // }

    const isMatch = await bcrypt.compare(password, verifySalesMan.password);
    if (isMatch) {
      const payload = {
        Id: verifySalesMan._id,
        roleName: [...roleNames],
      };
      const token = jwt.sign(payload, 'FIN-COOPER');
      let roamId = verifySalesMan.locationRoamId
      if (!roamId) {
        let req_data = {
          body: { ...verifySalesMan._doc, employeeId: verifySalesMan._id }
        }
        let roamData = await roamIdCreate(req_data)
        roamId = roamData.user_id
        await employeModel.findByIdAndUpdate(verifySalesMan._id, { locationRoamId: roamData.user_id })

      }

      const data = {
        employeId: `${verifySalesMan._id}`,
        userName: verifySalesMan.employeName,
        roleName: [...roleNames],
        employeePhoto: verifySalesMan.employeePhoto,
        token: token,
        roamId: roamId || null,
        trackingMode: "active"
      };

      return success(res, "User Logged in successfully", data);
    } else {
      return badRequest(res, "Wrong password");
    }
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}




module.exports = {
  employeLogin,
  updatePasswordByUserName,
  newEmployeeLogin
}
