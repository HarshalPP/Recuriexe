import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import { success, badRequest, serverValidation, unknownError  , unauthorized} from "../../formatters/globalResponse.js"

import employeModel from "../../models/employeemodel/employee.model.js"
import departmentModel from "../../models/deparmentModel/deparment.model.js"
import designationModel from "../../models/designationModel/designation.model.js"
import workLocationModel from "../../models/worklocationModel/worklocation.model.js"
import costCenterModel from "../../models/costcenterModel/costcenter.model.js"
import employmentTypeModel from "../../models/employeementTypemodel/employeementtype.model.js"
import employeTypeModel from "../../models/employeeType/employeeType.model.js"
import roleModel from "../../models/RoleModel/role.model.js"
import branchModel from "../../models/branchModel/branch.model.js"
import taskModel from "../../models/taskManagement/task.model.js"
import OrganizationModel from '../../models/organizationModel/organization.model.js';
import {sendEmail} from  '../../Utils/sendEmail.js'
import mongoose from "mongoose"

export const newEmployeeLogin = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: 'serverValidation',
          errors: errors.array(),
        });
      }
  
      const { userName, password } = req.body;
  
      // Find employee with active status
      const employee = await employeModel.findOne({
        userName,
        status: 'active',
      });
  
      if (!employee) return badRequest(res, 'User Name Not Found.');
  
      // Verify password
      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) return badRequest(res, 'Wrong password');
  
      // Fetch role names
      const roleIds = Array.isArray(employee.roleId)
        ? employee.roleId
        : [employee.roleId];
  
      const roleDetails = await roleModel.find({ _id: { $in: roleIds } });
      const roleNames = roleDetails.map(role => role.roleName);
      // Generate JWT
      const payload = {
        Id: employee._id,
        roleName: roleNames,
        organizationId: employee.organizationId
      };
      console.log(payload,"payload<>")
      const token = jwt.sign(payload, process.env.JWT_EMPLOYEE_TOKEN); // move secret to env in production
  
      // Build response
      const data = {
        employeId: `${employee._id}`,
        userName: employee.employeName,
        roleName: roleNames,
        employeePhoto: employee.employeePhoto || null,
        token,
        trackingMode: 'active',
      };
  
      return success(res, 'Employee Logged in successfully', data);
    } catch (error) {
      console.error('Employee login error:', error);
      return unknownError(res, error);
    }
  };



// for  super Admin //
export const SuperAdminRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: 'Validation Error',
        errors: errors.array(),
      });
    }

    const {
      userName,
      email,
      password,
      UserType,
      allocatedModule = []  // Expecting multiple ObjectIds
    } = req.body;

      if (!Array.isArray(allocatedModule)) {
      return badRequest(res, 'Allocated Modules must be provided as an array.');
    }


    // Check if user already exists
    const existingUser = await employeModel.findOne({ email });
    if (existingUser) {
      return badRequest(res, 'Email already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);



    // Step 1: Create organization without carrierlink
    const newOrganization = new OrganizationModel({
      name: "Enter your Organization",
      logo: "",
      website: "https://example.com",
      carrierlink: "", // will update after _id is available
      typeOfOrganization: null,
      typeOfSector: null,
      typeOfIndustry: null,
      contactPerson: "Owner",
      contactNumber: "",
      contactEmail: email,
      allocatedModule: allocatedModule, // Store allocated modules
    });

    await newOrganization.save();

    // Step 2: Create employee linked to the organization
    const newEmployee = new employeModel({
      userName,
      email,
      password: hashedPassword,
      UserType: "Owner",
      // roleId: roleIds,
      status: 'active',
      organizationId: newOrganization._id
    });

    await newEmployee.save();

    // Step 3: Update organization with userId and carrierlink
    newOrganization.userId = newEmployee._id;
    newOrganization.carrierlink = `https://candidate-portal.fincooperstech.com/CareerPage?${newOrganization._id}`;
    await newOrganization.save();

    // Step 4: Generate JWT
    const payload = {
      Id: newEmployee._id,
      // roleName: validRoles.map(r => r.roleName),s
      UserType: newEmployee.UserType,
      organizationId: newOrganization._id,
    };

    const token = jwt.sign(payload, process.env.JWT_EMPLOYEE_TOKEN);

    // Step 5: Build response
    const data = {
      employeId: `${newEmployee._id}`,
      userName: newEmployee.userName,
      // roleName: payload.roleName,
      UserType: newEmployee.UserType,
      employeePhoto: newEmployee.employeePhoto || null,
      organizationId: newOrganization._id,
      token
    };

    return success(res, 'Employee registered successfully', data);
  } catch (error) {
    console.error('Register employee error:', error);
    return unknownError(res, error);
  }
};


// Update Super Admin Register //

export const SuperAdminUpdate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: 'Validation Error',
        errors: errors.array(),
      });
    }

    const { userName, email, password, allocatedModule = [] } = req.body;
    const Id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(Id)) {
      return badRequest(res, 'Valid employee ID is required');
    }

    if (!Array.isArray(allocatedModule)) {
      return badRequest(res, 'Allocated Modules must be provided as an array.');
    }

    // Find the employee to update
    const employee = await employeModel.findById(Id);
    if (!employee) return badRequest(res, 'Admin not found.');

    // Update employee fields securely
    if (userName) employee.userName = userName;
    if (email) employee.email = email;

    if (password) {
      employee.password = await bcrypt.hash(password, 10);
      employee.passwordChangedAt = new Date();
    }

    await employee.save();

    // Update allocated modules in the organization model
    const organization = await OrganizationModel.findById(employee.organizationId);
    if (organization) {
      organization.carrierlink = `https://candidate-portal.fincooperstech.com/CareerPage?${organization._id}`;
      organization.allocatedModule = allocatedModule;
      await organization.save();
    }

    // Generate JWT
    const payload = {
      Id: employee._id,
      UserType: employee.UserType,
      organizationId: employee.organizationId,
    };

    const token = jwt.sign(payload, process.env.JWT_EMPLOYEE_TOKEN);

    const data = {
      employeId: `${employee._id}`,
      userName: employee.userName,
      UserType: employee.UserType,
      employeePhoto: employee.employeePhoto || null,
      organizationId: employee.organizationId,
      token
    };

    return success(res, 'Employee updated successfully', data);
  } catch (error) {
    console.error('Update Super Admin error:', error);
    return unknownError(res, error);
  }
};




// Create new employee //
export const createNewEmployee = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: 'serverValidation',
        errors: errors.array(),
      });
    }

    let { userName, email, password, roleId } = req.body;
    const organizationId = req.employee?.organizationId || null; // Get organizationId from authenticated user

    // Check if user already exists
    const existingUser = await employeModel.findOne({ email });
    if (existingUser) {
      return badRequest(res, 'Email already exists.');
    }

    // check if userName already exists //

    const existingUserName = await employeModel.findOne({userName});
    if (existingUserName) {
      return badRequest(res, 'User Name already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate roles
    const validRoles = await roleModel.find({ _id: { $in: roleId } });
    if (!validRoles) {
      return badRequest(res, 'Role IDs are invalid.');
    }

    // Create new employee
    const newEmployee = new employeModel({
      userName,
      email,
      password: hashedPassword,
      roleId,
      status: 'active',
      onboardingStatus:'enrolled',
      organizationId: organizationId || null, // Include organizationId if available
    });

    await newEmployee.save();

    // Generate JWT
    const payload = {
      Id: newEmployee._id,
      roleName: validRoles.map(r => r.roleName),
      organizationId: organizationId || null, // Include organizationId if available
    };
    
    const token = jwt.sign(payload, process.env.JWT_EMPLOYEE_TOKEN);


    // Send welcome email with credentials
await sendEmail({
  to: email,
  subject: '🎉 Welcome to Fincoopers Tech - Your Account Details',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #e8f0fe; padding: 50px 20px;">
      <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 15px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); overflow: hidden;">
        <div style="background-color: #4A90E2; padding: 30px; text-align: center;">
          <img src="https://cdn.fincooper.in/STAGE/HRMS/IMAGE/1748500070653_Fin%20Colour.png" alt="Fincoopers Logo" style="width: 130px;" />
          <h1 style="color: #fff; margin-top: 20px; font-size: 28px;">Welcome to Fincoopers Tech!</h1>
          <p style="color: #d6e4f0; margin-top: 10px;">Your journey with innovation begins here 🚀</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            We're thrilled to have you on board! Below are your login credentials. Please keep them safe and secure:
          </p>

          <table style="width: 100%; margin-top: 25px; font-size: 15px; border-collapse: collapse; border: 1px solid #ddd;">
            <tr style="background-color: #f0f4f8;">
              <td style="padding: 12px; font-weight: bold;">👤 Username</td>
              <td style="padding: 12px; color: #333;">${userName}</td>
            </tr>
            <tr>
              <td style="background-color: #f0f4f8; padding: 12px; font-weight: bold;">🔐 Password</td>
              <td style="padding: 12px; color: #333;">${password}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 40px 0 30px;">
            <a href="http://hr-portal.fincooperstech.com/" target="_blank" style="background-color: #4A90E2; color: white; padding: 14px 28px; font-size: 16px; border-radius: 6px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
              🔓 Login to Dashboard
            </a>
          </div>

          <p style="font-size: 14px; color: #777; text-align: center;">
            Need help? Contact us at 
            <a href="mailto:support@fincoopers.tech" style="color: #4A90E2; text-decoration: none;">support@fincoopers.tech</a>.
          </p>
          <p style="font-size: 14px; color: #777; text-align: center;">
            We're excited to have you onboard. Let's build great things together!
          </p>

          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 40px;">
            Warm regards,<br/>
            <strong>The Fincoopers Tech Team</strong>
          </p>
        </div>
      </div>
    </div>
  `,
});



    // Build response
    const data = {
      employeId: `${newEmployee._id}`,
      userName: newEmployee.userName,
      roleName: validRoles.map(r => r.roleName),
      employeePhoto: newEmployee.employeePhoto || null,
      token,
      trackingMode: 'active',
    };




    return success(res, 'New Employee Created Successfully', data);
  } catch (error) {
    console.error('Create New Employee Error:', error);
    return unknownError(res, error);
  }
}



// Get All Employee Info //


// export const getAllEmployeeInfodata = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation(res, {
//         errorName: 'serverValidation',
//         errors: errors.array(),
//       });
//     }

//     const employeDetail = await employeModel
//       .find({ status: "active" })
//       .select(
//         "userName email employeUniqueId"
//       )
//       .populate({ path: "roleId", select: "roleName" })
//       .sort({ createdAt: -1 })

//     success(res, 'All Employee Details', employeDetail);
//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }



export const getAllEmployeeInfodata = async (req, res) => {
  try {
    const { search ,status  } = req.query;
  const organizationId = req.employee.organizationId;
  
    const matchStage = {
      status: status?status:"active",
      organizationId: new mongoose.Types.ObjectId(organizationId)
    };

    // Initial search match stage
    const searchMatch = search
      ? {
          $or: [
            { userName: { $regex: search, $options: "i" } },
            { employeName: { $regex: search, $options: "i" } },
            { workEmail: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { employeUniqueId: { $regex: search, $options: "i" } },
            { "role.roleName": { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const employeDetail = await employeModel.aggregate([
      { $match: matchStage },

      {
        $lookup: {
          from: "roles", // replace with your actual collection name
          localField: "roleId",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },

      // Search match
      ...(search ? [{ $match: searchMatch }] : []),

      {
        $project: {
          userName: 1,
          employeName: 1,
          workEmail: 1,
          email: 1,
          employeUniqueId: 1,
          roleName: "$role.roleName"
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    success(res, "All Employee Details", employeDetail);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
};





  
// add this joining form //


// take data for token //
export const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let {  ...updateFields } = req.body;
    const id=req.employee.id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Valid ID is required");
    }

    const objectIdFields = [
      "branchId",
      "reportingManagerId",
      "departmentId",
      "secondaryDepartmentId",
      "seconSubDepartmentId",
      "designationId",
      "workLocationId",
      "constCenterId",
      "employementTypeId",
      "employeeTypeId",
      "subDepartmentId",
    ];

    objectIdFields.forEach(field => {
      if (updateFields[field]) {
        if (Array.isArray(updateFields[field])) {
          updateFields[field] = updateFields[field]
            .map(value => mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null)
            .filter(value => value !== null);
        } else {
          updateFields[field] = mongoose.Types.ObjectId.isValid(updateFields[field])
            ? new mongoose.Types.ObjectId(updateFields[field])
            : null;
        }
      } else {
        updateFields[field] = undefined;
      }
    });

    const fileFields = [
      "employeePhoto",
      "resume",
      "offerLetter",
      "bankDetails",
      "aadhar",
      "panCard",
      "educationCertification",
      "experienceLetter",
      "employmentProof",
    ];
    
    
    fileFields.forEach(field => {
      if (req.body[field]) {
        updateFields[field] = req.body[field]; // dynamic URL directly assigned
      }
    });
    

    const employee = await employeModel.findById(id);
    if (!employee) return badRequest(res, "Employee Not Found");

    if (updateFields.password && employee.password !== updateFields.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(updateFields.password, salt);
      updateFields.passwordChangedAt = new Date();
    }

    if (updateFields.roleId) {
      const newRoleIds = Array.isArray(updateFields.roleId)
        ? updateFields.roleId.map(String)
        : [String(updateFields.roleId)];

      const existingRoleIds = Array.isArray(employee.roleId)
        ? employee.roleId.map(r => String(r))
        : [String(employee.roleId)];

      const roleChanged = newRoleIds.length !== existingRoleIds.length ||
        newRoleIds.some(role => !existingRoleIds.includes(role));

      if (roleChanged) updateFields.passwordChangedAt = new Date();
    }

    const allowedFields = [
      "employeName",
      "email",
      "userName",
      "workEmail",
      "permanentAddress",
      "currentAddress",
      "fatherName",
      "mobileNo",
      "emergencyNumber",
      "fathersMobileNo",
      "mothersMobileNo",
      "familyIncome",
      "bankAccount",
      "totalExperience",
      "currentAddressPincode",
      "permanentAddressPincode",
      "uanNumber",
      "joiningDate",
      "dateOfBirth",
      "startDate",
      "endDate",
    ];

    const numberTypeFields = [
      "mobileNo",
      "emergencyNumber",
      "fathersMobileNo",
      "mothersMobileNo",
      "familyIncome",
      "bankAccount",
      "totalExperience",
      "currentAddressPincode",
      "uanNumber",
      "currentCTC",
      "location.coordinates",
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (fileFields.includes(field) || objectIdFields.includes(field)) {
          updateFields[field] = req.body[field];
        } else if (["joiningDate", "dateOfBirth", "startDate", "endDate"].includes(field)) {
          const parsedDate = new Date(req.body[field]);
          if (!isNaN(parsedDate.getTime())) updateFields[field] = parsedDate;
        } else if (numberTypeFields.includes(field)) {
          updateFields[field] = !isNaN(parseInt(req.body[field])) ? parseInt(req.body[field]) : undefined;
        } else {
          updateFields[field] = req.body[field];
        }
      }
    });

    if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      const latitude = parseFloat(req.body.latitude);
      const longitude = parseFloat(req.body.longitude);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        updateFields.location = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      } else {
        return badRequest(res, "Invalid latitude or longitude provided. Both must be numbers.");
      }
    }

    updateFields.updatedFrom = "finexe";
    const updateData = await employeModel.findByIdAndUpdate(id, updateFields, { new: true });

    success(res, "Updated Employee", updateData);

    let lastEntry = updateData.activeInactiveReason?.[updateData.activeInactiveReason.length - 1] || {};
    let actionTakenBy = "Not Available";

    if (lastEntry?.actionTakenBy) {
      const actionTakenById = await employeModel.findById(lastEntry.actionTakenBy);
      actionTakenBy = actionTakenById?.employeName || "Not Available";
    }

    const fetchName = async (model, id, key = "name") => {
      if (!id) return "Not Available";
      const doc = await model.findById(id);
      return doc?.[key] || "Not Available";
    };

    const branchName = await fetchName(branchModel, updateData.branchId);
    const companyName = req.body.company || "Not Available";

    const roles = await roleModel.find({ _id: { $in: updateData.roleId } });
    const roleName = roles.length > 0 ? roles.map(role => role.roleName).join(", ") : "Not Available";

    const reportingManagerName = await fetchName(employeModel, updateData.reportingManagerId, "employeName");
    const departmentName = await fetchName(departmentModel, updateData.departmentId);
    const subDepartmentName = await fetchName(departmentModel, updateData.subDepartmentId);
    const secondaryDepartmenName = await fetchName(departmentModel, updateData.secondaryDepartmentId);
    const seconSubDepartmentName = await fetchName(departmentModel, updateData.seconSubDepartmentId);
    const designationName = await fetchName(designationModel, updateData.designationId);
    const workLocationName = await fetchName(workLocationModel, updateData.workLocationId);
    const constCenterName = await fetchName(costCenterModel, updateData.constCenterId, "title");
    const employementTypeName = await fetchName(employmentTypeModel, updateData.employementTypeId, "title");
    const employeeTypeName = await fetchName(employeTypeModel, updateData.employeeTypeId, "title");

    const referedBy = await employeModel.findOne({ employeUniqueId: req.body.referedById });
    const referedBYName = referedBy?.employeName || "Not Available";

    // await employeeGoogleSheet(
    //   updateData,
    //   branchName,
    //   companyName,
    //   roleName,
    //   reportingManagerName,
    //   departmentName,
    //   subDepartmentName,
    //   secondaryDepartmenName,
    //   seconSubDepartmentName,
    //   designationName,
    //   workLocationName,
    //   constCenterName,
    //   employementTypeName,
    //   employeeTypeName,
    //   referedBYName,
    //   actionTakenBy
    // );
  } catch (err) {
    console.error("Update Employee Error:", err);
    return res.status(500).json({ message: err });
  }
};


// Update employee particular //
export const updateEmployeeById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Valid ID is required");
    }

    let { ...updateFields } = req.body;

    const objectIdFields = [
      "branchId",
      "reportingManagerId",
      "departmentId",
      "secondaryDepartmentId",
      "seconSubDepartmentId",
      "designationId",
      "workLocationId",
      "constCenterId",
      "employementTypeId",
      "employeeTypeId",
      "subDepartmentId",
    ];

    objectIdFields.forEach(field => {
      if (updateFields[field]) {
        if (Array.isArray(updateFields[field])) {
          updateFields[field] = updateFields[field]
            .map(value => mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null)
            .filter(value => value !== null);
        } else {
          updateFields[field] = mongoose.Types.ObjectId.isValid(updateFields[field])
            ? new mongoose.Types.ObjectId(updateFields[field])
            : null;
        }
      } else {
        updateFields[field] = undefined;
      }
    });

    const fileFields = [
      "employeePhoto",
      "resume",
      "offerLetter",
      "bankDetails",
      "aadhar",
      "panCard",
      "educationCertification",
      "experienceLetter",
      "employmentProof",
    ];

    fileFields.forEach(field => {
      if (req.body[field]) {
        updateFields[field] = req.body[field];
      }
    });

    const employee = await employeModel.findById(id);
    if (!employee) return badRequest(res, "Employee Not Found");

    if (updateFields.password && employee.password !== updateFields.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(updateFields.password, salt);
      updateFields.passwordChangedAt = new Date();
    }

    if (updateFields.roleId) {
      const newRoleIds = Array.isArray(updateFields.roleId)
        ? updateFields.roleId.map(String)
        : [String(updateFields.roleId)];

      const existingRoleIds = Array.isArray(employee.roleId)
        ? employee.roleId.map(r => String(r))
        : [String(employee.roleId)];

      const roleChanged = newRoleIds.length !== existingRoleIds.length ||
        newRoleIds.some(role => !existingRoleIds.includes(role));

      if (roleChanged) updateFields.passwordChangedAt = new Date();
    }

    const allowedFields = [
      "employeName",
      "email",
      "userName",
      "workEmail",
      "permanentAddress",
      "currentAddress",
      "fatherName",
      "mobileNo",
      "emergencyNumber",
      "fathersMobileNo",
      "mothersMobileNo",
      "familyIncome",
      "bankAccount",
      "totalExperience",
      "currentAddressPincode",
      "permanentAddressPincode",
      "uanNumber",
      "joiningDate",
      "dateOfBirth",
      "startDate",
      "endDate",
    ];

    const numberTypeFields = [
      "mobileNo",
      "emergencyNumber",
      "fathersMobileNo",
      "mothersMobileNo",
      "familyIncome",
      "bankAccount",
      "totalExperience",
      "currentAddressPincode",
      "uanNumber",
      "currentCTC",
      "location.coordinates",
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (fileFields.includes(field) || objectIdFields.includes(field)) {
          updateFields[field] = req.body[field];
        } else if (["joiningDate", "dateOfBirth", "startDate", "endDate"].includes(field)) {
          const parsedDate = new Date(req.body[field]);
          if (!isNaN(parsedDate.getTime())) updateFields[field] = parsedDate;
        } else if (numberTypeFields.includes(field)) {
          updateFields[field] = !isNaN(parseInt(req.body[field])) ? parseInt(req.body[field]) : undefined;
        } else {
          updateFields[field] = req.body[field];
        }
      }
    });

    if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      const latitude = parseFloat(req.body.latitude);
      const longitude = parseFloat(req.body.longitude);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        updateFields.location = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      } else {
        return badRequest(res, "Invalid latitude or longitude provided. Both must be numbers.");
      }
    }

    updateFields.updatedFrom = "finexe";

    const updateData = await employeModel.findByIdAndUpdate(id, updateFields, { new: true });
    success(res, "Updated Employee", updateData);

  } catch (err) {
    console.error("Update Employee by ID Error:", err);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};




// get all new joineee details //


export const getAllJoiningEmployee = async (req, res) => {
  try {
    const onboardingStatus = req.query.onboardingStatus;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const [employeDetail, totalCount] = await Promise.all([
      employeModel
        .find({ status: "active", onboardingStatus })
        .select(
          "image employeUniqueId _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "roleId", select: "roleName" })
        .populate({ path: "branchId", select: "name" })
        .populate({ path: "departmentId", select: "name" })
        .populate({ path: "designationId", select: "name" })
        .populate({ path: "workLocationId", select: "name" })
        .populate({ path: "reportingManagerId", select: "employeName" })
        .populate({ path: "employeeTypeId", select: "title" })
        .populate({ path: "employementTypeId", select: "title" })
        .populate({ path: "constCenterId", select: "title" }),

      employeModel.countDocuments({ status: "active", onboardingStatus }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    success(res, "All Joining Employee Details", {
      employees: employeDetail,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
};


// get all Employee //


export const getAllEmploye = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }


    const RoleName = req.query.RoleName;
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;

    // Extract employeName from query params
    const employeName = req.query.employeName;

    // Base filter
    const filter = {
      status: "active",
      onboardingStatus: { $in: ["enrolled"] },
      // Uncomment below if you want to exclude a specific role
      // roleId: { $ne: newJoineeRole._id }
    };

    // Add employeName filter if provided
    if (employeName) {
      // Using regex for case-insensitive partial matching
      filter.employeName = { $regex: employeName, $options: "i" };
    }

    const [employeDetail, totalCount] = await Promise.all([
      employeModel
        .find(filter)
        .select(
          "employeePhoto employeUniqueId employeementHistory _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company onboardingStatus email"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "roleId", select: "roleName" })
        .populate({ path: "branchId", select: "name" })
        .populate({ path: "departmentId", select: "name" })
        .populate({ path: "designationId", select: "name" })
        .populate({ path: "workLocationId", select: "name" })
        .populate({ path: "reportingManagerId", select: "employeName" })
        .populate({ path: "employeeTypeId", select: "title" })
        .populate({ path: "employementTypeId", select: "title" })
        .populate({ path: "constCenterId", select: "title" }),

      employeModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    success(res, "All Employees", {
      employees: employeDetail,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
};

// get employee by id //
export const getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const employee = await employeModel
      .findById(employeeId)
      .select(
        "employeePhoto employeUniqueId employeementHistory _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company onboardingStatus"
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

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return success(res, "Employee detail", employee);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};


export async function getAllEmployeeInfo(req ,res) {
    try {
        const userData = await employeModel.find();
        return success(res, "employee list", userData)
    } catch (error) {
        return unknownError(false, error.message)
    }
}


export const getEmployeeCount = async (req, res) => {
  try {
    let query = {};

    if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }
    if (req.query.company) {
      query.company = req.query.company;
    }
    if (req.query.workLocationId) {
      query.workLocationId = req.query.workLocationId;
    }
    if (req.query.departmentId) {
      query.departmentId = req.query.departmentId;
    }
    if (req.query.roleId) {
      query.roleId = req.query.roleId;
    }
    if (req.query.designationId) {
      query.designationId = req.query.designationId;
    }
    if (req.query.reportingManagerId) {
      query.reportingManagerId = req.query.reportingManagerId;
    }
    if (req.query.employementTypeId) {
      query.employementTypeId = req.query.employementTypeId;
    }
    if (req.query.constCenterId) {
      query.constCenterId = req.query.constCenterId;
    }

    // Case-sensitive employeName filter
    if (req.query.employeName) {
      query.employeName = new RegExp(`^${req.query.employeName}`,"i");
    }

    query = { ...query, status: "active", onboardingStatus: "enrolled" };

    const employeeDetails = await employeModel
      .find(query, { password: 0 })
      .populate({ path: "roleId", select: "_id roleName" })
      .populate({
        path: "reportingManagerId",
        select: "_id userName employeName",
      })
      .populate({ path: "employeeTypeId", select: "_id title" })
      .populate({ path: "employementTypeId", select: "_id title" })
      .populate({ path: "constCenterId", select: "_id title" })
      .populate({ path: "branchId", select: "_id name" })
      .populate({ path: "departmentId", select: "_id name" })
      .populate({ path: "subDepartmentId", select: "_id name" })
      .populate({ path: "designationId", select: "_id name" })
      .populate({ path: "subDepartmentId", select: "_id name" })
      .populate({ path: "workLocationId", select: "_id name" });

    const employeeIds = employeeDetails.map(emp => emp._id.toString());

    // Find all employees who are set as someone’s reportingManagerId
    const managers = await employeModel.find(
      { reportingManagerId: { $in: employeeIds } },
      { reportingManagerId: 1 }
    );

    const managerIdsSet = new Set(managers.map(m => m.reportingManagerId.toString()));
      // Get pending task counts by employeeId
      const pendingTasks = await taskModel.aggregate([
        {
          $match: {
            employeeId: { $in: employeeDetails.map(emp => emp._id) },
            assignBy: { $in: employeeDetails.map(emp => emp._id) },
            status: "pending"
          }
        },
        {
          $group: {
            _id: "$employeeId",
            count: { $sum: 1 }
          }
        }
      ]);
  
      const taskCountMap = {};
      pendingTasks.forEach(task => {
        taskCountMap[task._id.toString()] = task.count;
      });

      const employeesGroupedByManager = await employeModel.aggregate([
        {
          $match: {
            reportingManagerId: { $in: employeeIds.map(id => new mongoose.Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: "$reportingManagerId",
            photos: { $push: "$employeePhoto" }
          }
        }
      ]);
  
      const managerPhotosMap = {};
      employeesGroupedByManager.forEach(manager => {
        managerPhotosMap[manager._id.toString()] = manager.photos;
      });

    // Add manager: true/false to each employee
    const updatedEmployeeDetails = employeeDetails.map(emp => {
      const isManager = managerIdsSet.has(emp._id.toString());
      const empObj = emp.toObject(); // ensure plain object
      const empId = empObj._id.toString();
      const task = taskCountMap[empId] || 0;

      const employePhotoDetail = isManager
      ? { employePhotos: managerPhotosMap[empId] || [] }
      : {};
      
      return {
        ...emp.toObject(),
        manager: isManager,
        pendingTask: task,
        employePhotoDetail: employePhotoDetail
      };
    });

    const employeeCount = updatedEmployeeDetails.length;

    success(res, "Employee Count", { employeeCount, employeeDetails: updatedEmployeeDetails });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// --------- EMPLOYEE HIeRARCHY TREE STRUCTURE LIST API ------------------
  export const employeeTreeHierarchy = async (req, res) => {
  try {
    // Get top-level employees (reportingManagerId: null)
    const topManagers = await employeModel.find(
      { reportingManagerId: null },
      {
        _id: 1,
        employeName: 1,
        employeUniqueId: 1,
        reportingManagerId: 1,
        currentDesignation: 1
      }
    ).lean();

    if (!topManagers || topManagers.length === 0) {
      return notFound(res, "No top-level employees found");
    }

    // Recursive function to get children
    async function getChildren(managerId) {
      const children = await employeModel.find(
        { reportingManagerId: managerId },
        {
          _id: 1,
          employeName: 1,
          employeUniqueId: 1,
          employeePhoto:1,
          reportingManagerId: 1,
          currentDesignation: 1
        }
      ).lean();

      // For each child, find their children recursively
      const childrenWithSubordinates = await Promise.all(
        children.map(async (child) => {
          const subChildren = await getChildren(child._id);
          return {
            _id: child._id,
            name: child.employeName,
            employeeUniqueId: child.employeUniqueId,
            employeePhoto: child.employeePhoto,
            designation: child.currentDesignation || "",
            subordinates: subChildren
          };
        })
      );

      return childrenWithSubordinates;
    }

    // Build the full hierarchy
    const hierarchy = await Promise.all(
      topManagers.map(async (manager) => {
        const subordinates = await getChildren(manager._id);
        return {
          _id: manager._id,
          name: manager.employeName,
          employeeUniqueId: manager.employeUniqueId,
          employeePhoto: manager.employeePhoto,
          designation: manager.currentDesignation || "",
          subordinates
        };
      })
    );

    return success(res, "Hierarchy details retrieved successfully", hierarchy);

  } catch (error) {
    console.error("Error in getEmployeeHierarchy:", error);
    return unknownError(res, error);
  }
}

// ----------GET ALL EMPLOYEE LIST FOR NOTES------------------------------
 export const allEmployeDetail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Single query with both filtering and case-insensitive sorting
    const employeDetail = await employeModel
      .find({
        status: "active",
        onboardingStatus: { $in: ["enrolled"] },
        employeName: { $ne: "" }  // Filter out employees with empty names
      })
      .select(
        "employeePhoto employeUniqueId employeementHistory _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company onboardingStatus"
      )
      .sort({ employeName: 1 })
      .collation({ locale: 'en', strength: 2 })  // Case-insensitive sorting
      .populate({ path: "roleId", select: "roleName" })
      .populate({ path: "branchId", select: "name" })
      .populate({ path: "departmentId", select: "name" })
      .populate({ path: "designationId", select: "name" })
      .populate({ path: "workLocationId", select: "name" })
      .populate({ path: "reportingManagerId", select: "employeName" })
      .populate({ path: "employeeTypeId", select: "title" })
      .populate({ path: "employementTypeId", select: "title" })
      .populate({ path: "constCenterId", select: "title" });

    const count = employeDetail.length;
    console.log(count);

    success(res, "All Employes", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}




export const employeeActiveInactive = async (req, res) => {
  try {
    const { _id, status } = req.query;
    const organizationId = req.employee.organizationId;

    if (!_id || !status) {
      return badRequest(res, 'Employee _id and status are required');
    }

    if (!['active', 'inactive'].includes(status)) {
      return badRequest(res, 'Status must be either "active" or "inactive"');
    }

    if (!organizationId) {
      return badRequest(res, 'Organization not assigned');
    }

    const employee = await employeModel.findOne(
      { _id: new mongoose.Types.ObjectId(_id), organizationId: new mongoose.Types.ObjectId(organizationId) },
      'userName employeName email workEmail status'
    );

    if (!employee) {
      return notFound(res, 'Employee not found');
    }

    if (employee.status === status) {
      return badRequest(res, `Employee Is Already ${status}`);
    }

    employee.status = status;
    await employee.save();

    return success(res, `Employee status updated to ${status}`, {
      userName: employee.userName,
      employeeName: employee.employeName,
      email: employee.email,
      workEmail: employee.workEmail,
      status: employee.status,
    });
  } catch (error) {
    console.error('Error updating employee status:', error);
    return unknownError(res, error);
  }
};
