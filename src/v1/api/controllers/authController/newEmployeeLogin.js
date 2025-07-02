import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import { success, badRequest, serverValidation, unknownError, unauthorized , notFound } from "../../formatters/globalResponse.js"

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
import organizationPlanModel from "../../models/PlanModel/organizationPlan.model.js";
import { sendEmail } from '../../Utils/sendEmail.js'
import mongoose from "mongoose"
import { ObjectId } from 'mongodb';
import PlanModel from '../../models/PlanModel/Plan.model.js';
import PortalModel from '../../models/PortalSetUp/portalsetup.js';
import { sendEmail1 } from '../../Utils/sendEmail.js'
import AiScreening from '../../models/AiScreeing/AiScreening.model.js';
import subdropDownModel from '../../models/masterDropDownModel/masterDropDownValue.model.js';
import dotenv from 'dotenv'
dotenv.config();


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



    // Determine role IDs
    const roleIds = Array.isArray(employee.roleId) && employee.roleId.length > 0
      ? employee.roleId:[];

    if(roleIds.length === 0){
      return badRequest(res , "Role is not set")
    }

    const roleDetails = await roleModel.find({ _id: { $in: roleIds } });
    const roleNames = roleDetails.map(role => role.roleName);
    // Generate JWT
    const payload = {
      Id: employee._id,
      roleName: roleNames,
      roleId: roleDetails[0]?._id,
      organizationId: employee.organizationId
    };
    // console.log(payload,"payload<>")
    const token = jwt.sign(payload, process.env.JWT_EMPLOYEE_TOKEN); // move secret to env in production

    // Build response
    const data = {
      employeId: `${employee._id}`,
      userName: employee.employeName,
      roleName: roleNames,
      roleId: roleDetails[0]._id,
      employeePhoto: employee.employeePhoto || null,
      token,
      trackingMode: 'active',
      OrganizationModule:employee.OrganizationModule || "Company"
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
      OrganizationModule,
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
      OrganizationModule:OrganizationModule,
      allocatedModule: allocatedModule, // Store allocated modules
    });

    await newOrganization.save();


    const adminRole = new roleModel({
      roleName: "SuperAdmin",
      status: "active",
      organizationId: newOrganization._id
    });

    // Automatically set all Boolean fields to true
    const allKeys = Object.keys(adminRole.toObject());
    allKeys.forEach(key => {
      const value = adminRole[key];
      if (typeof value === "boolean") {
        adminRole[key] = true;
      } else if (typeof value === "object" && value !== null) {
        // Handle nested boolean objects like jobPostDashboard, jobApplications
        Object.keys(value).forEach(subKey => {
          if (typeof value[subKey] === "boolean") {
            value[subKey] = true;
          }
        });
      }
    });

    await adminRole.save();


    // Step 2: Create employee linked to the organization
    const newEmployee = new employeModel({
      userName,
      email,
      password: hashedPassword,
      UserType: "Owner",
      roleId:adminRole._id,
      // roleId: roleIds,
      status: 'active',
      organizationId: newOrganization._id,
      OrganizationModule:OrganizationModule
    });

    await newEmployee.save();

    // Step 3: Update organization with userId and carrierlink
    newOrganization.userId = newEmployee._id;
    newOrganization.carrierlink = `${process.env.PORTAL_PAGE}/${newOrganization._id}`;
    await newOrganization.save();



    // Step 5: Create default AI screening config
    const defaultAiScreening = new AiScreening({
      organizationId: newOrganization._id,
      name: "AI Configuration & Settings",
      description: "Configure AI model parameters, screening criteria, and automation settings",
      coreSettings: {
        qualificationThreshold: 50,
        automaticScreening: true
      },
   screeningCriteria: [
  {
    name: "Skills",
    description: "Check relevant technical skills match",
    weight: 20
  },
  {
    name: "Experience",
    description: "Evaluate professional experience for the job",
    weight: 20
  },
  {
    name: "Education",
    description: "Validate minimum education requirement",
    weight: 20
  },
  {
    name: "Certifications",
    description: "Check for relevant certifications",
    weight: 20
  },
  {
    name: "Project Exposure",
    description: "Assess involvement in relevant projects",
    weight: 0
  },
  {
    name: "Leadership_Initiative",
    description: "Assess leadership or initiative traits",
    weight: 0
  },
  {
    name: "Cultural_Fit",
    description: "Evaluate alignment with company values",
    weight: 0
  },
  {
    name: "Communication_Skills",
    description: "Assess clarity and professionalism in communication",
    weight:20
  },
  {
    name: "Learning_Ability",
    description: "Evaluate continuous learning and adaptability",
    weight: 0
  }
],

      createdBy: newEmployee._id,
      isActive: true
    });

    await defaultAiScreening.save();



    // step 6:-  create a Portal //

    const createPortal = new PortalModel({
      organizationId:newOrganization._id,
      bannerPhoto:"https://cdn.fincooper.in/STAGE/HRMS/IMAGE/1750155569228_Banner.png"
    })

    await createPortal.save();

    
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


    // Step 6 :-  add default Data on Master Drop Down 
        const defaultSubDropdowns = await subdropDownModel.find({
      organizationId: null,
      defaultValue: true
    });
        const newSubDropdowns = defaultSubDropdowns.map(item => ({
      dropDownId: item.dropDownId,
      organizationId: newOrganization._id,
      name: item.name.trim(),
      status: item.status,
      createdBy: newEmployee._id,
      defaultValue: false
    }));

    await subdropDownModel.insertMany(newSubDropdowns);

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

    let { userName, email, mobileNo, employeName, password, roleId, subDepartmentId, departmentId, designationId } = req.body;
    const organizationId = req.employee?.organizationId || null; // Get organizationId from authenticated user

    if (!password) {
      return badRequest(res, 'Password is required');
    }
    const orgainizationDetail = await OrganizationModel.findById(organizationId).select('name');

    // ✅ Check active plan for organization
    const activePlan = await organizationPlanModel.findOne({ organizationId: organizationId, isActive: true });
    if (!activePlan) {
      return badRequest(res, "No active plan found for this organization");
    }


    // ✅ Check number of job posts against plan limit
    const currentJobPostCount = await employeModel.countDocuments({ organizationId: organizationId });
    if (currentJobPostCount >= activePlan.NumberOfUsers) {
      return badRequest(
        res,
        `Job post limit reached. Allowed: ${activePlan.NumberOfUsers}, Current: ${currentJobPostCount}. Please upgrade your plan.`
      );
    }

    // Check if user already exists
    const existingUser = await employeModel.findOne({ email });
    if (existingUser) {
      return badRequest(res, 'Email already exists.');
    }

    // check if userName already exists //

    const existingUserName = await employeModel.findOne({ userName });
    if (existingUserName) {
      return badRequest(res, 'User Name already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if(!roleId){
      return  badRequest(res, 'role is Rerquired');
    }
    // Validate roles
    const validRoles = await roleModel.find({ _id: { $in: roleId } });
    if (!validRoles) {
      return badRequest(res, 'Role IDs are invalid.');
    }

    // Validate subDepartmentId, departmentId, designationId
    if (subDepartmentId && !mongoose.Types.ObjectId.isValid(subDepartmentId)) {
      return badRequest(res, 'Invalid subDepartmentId.');
    }
    if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
      return badRequest(res, 'Invalid departmentId.');
    }
    if (designationId && !mongoose.Types.ObjectId.isValid(designationId)) {
      return badRequest(res, 'Invalid designationId.');
    }

    // Validate check on model by organizationId 
    if (subDepartmentId) {
      const subDepartment = await departmentModel.findOne({ 'subDepartments._id': subDepartmentId, organizationId });
      if (!subDepartment) {
        return badRequest(res, 'Sub-department not found for this organization.');
      }
    }

    if (departmentId) {
      const department = await departmentModel.findOne({ _id: departmentId, organizationId });
      if (!department) {
        return badRequest(res, 'Department not found for this organization.');
      }
    }

    if (designationId) {
      const designation = await designationModel.findOne({ _id: designationId, organizationId });
      if (!designation) {
        return badRequest(res, 'Designation not found for this organization.');
      }
    }

    //   Create new employee
    const newEmployee = new employeModel({
      userName,
      email,
      password: hashedPassword,
      roleId,
      mobileNo,
      subDepartmentId,
      departmentId,
      designationId,
      employeName,
      status: 'active',
      UserType: ['User'],
      onboardingStatus: 'enrolled',
      organizationId: organizationId, // Include organizationId if available
    });

    await newEmployee.save();

    if (activePlan.NumberOfUsers > 0) {
      const Updateservice = await organizationPlanModel.findOneAndUpdate(
        { organizationId: organizationId },
        { $inc: { NumberOfUsers: -1 } }, // Decrement the count
        { new: true }
      );
    }



    // Generate JWT
    // const payload = {
    //   Id: newEmployee._id,
    //   roleName: validRoles.map(r => r.roleName),
    //   organizationId: organizationId || null, // Include organizationId if available
    // };

    // const token = jwt.sign(payload, process.env.JWT_EMPLOYEE_TOKEN);




    // Build response
    const data = {
      employeId: `${newEmployee._id}`,
      userName: newEmployee.userName,
      mobileNo: newEmployee.mobileNo,
      employeName: newEmployee.employeName,
      userName: newEmployee.userName,
      email: newEmployee.email,
      UserType: newEmployee.UserType,
      // roleName: validRoles.map(r => r.roleName),
      // employeePhoto: newEmployee.employeePhoto || null,
      // token,
      // trackingMode: 'active',
    };

    success(res, 'New Employee Created Successfully', data);
    // Send welcome email with credentials
    await sendEmail({
      to: email,
      subject: `🎉 Welcome to ${orgainizationDetail.name} - Your Account Details`,
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
    const { search, status } = req.query;
    const organizationId = req.employee.organizationId;

    const matchStage = {
      status: status ? status : "active",
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


      {
        $lookup: {
          from: "newdesignations", // replace with your actual collection name
          localField: "designationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newdepartments", // replace with your actual collection name
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newdepartments",
          let: { subDeptId: "$subDepartmentId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$$subDeptId",
                    {
                      $map: {
                        input: "$subDepartments",
                        as: "sd",
                        in: "$$sd._id"
                      }
                    }
                  ]
                }
              }
            },
            {
              $project: {
                matchedSubDept: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$subDepartments",
                        as: "sd",
                        cond: {
                          $eq: ["$$sd._id", "$$subDeptId"]
                        }
                      }
                    },
                    0
                  ]
                }
              }
            }
          ],
          as: "subDepartment"
        }
      },
      {
        $unwind: {
          path: "$subDepartment",
          preserveNullAndEmptyArrays: true
        }
      },
      // Search match
      ...(search ? [{ $match: searchMatch }] : []),

      {
        $project: {
          userName: 1,
          employeName: 1,
          workEmail: 1,
          email: 1,
          status:1,
          mobileNo: 1,
          employeUniqueId: 1,
          roleName: "$role.roleName",
          designation: "$designation.name",
          designationId: "$designation._id",
          subDepartmentName: "$subDepartment.matchedSubDept.name",
          subDepartmentId: "$subDepartment.matchedSubDept._id",
          department: "$department.name",
          departmentId: "$department._id",

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

    let { ...updateFields } = req.body;
    const id = req.employee.id
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

// export const adminByUpdateEmployeeId = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     let { ...updateFields } = req.body;
    
//     const id = req.body.employeeId
//     if(!id){
//       return badRequest(res ,"Employee Id Required ")
//     }
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return badRequest(res, "Valid ID is required");
//     }

//     const objectIdFields = [
//       "branchId",
//       "reportingManagerId",
//       "departmentId",
//       "secondaryDepartmentId",
//       "seconSubDepartmentId",
//       "designationId",
//       "workLocationId",
//       "constCenterId",
//       "employementTypeId",
//       "employeeTypeId",
//       "subDepartmentId",
//     ];

//     objectIdFields.forEach(field => {
//       if (updateFields[field]) {
//         if (Array.isArray(updateFields[field])) {
//           updateFields[field] = updateFields[field]
//             .map(value => mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null)
//             .filter(value => value !== null);
//         } else {
//           updateFields[field] = mongoose.Types.ObjectId.isValid(updateFields[field])
//             ? new mongoose.Types.ObjectId(updateFields[field])
//             : null;
//         }
//       } else {
//         updateFields[field] = undefined;
//       }
//     });

//     const fileFields = [
//       "employeePhoto",
//       "resume",
//       "offerLetter",
//       "bankDetails",
//       "aadhar",
//       "panCard",
//       "educationCertification",
//       "experienceLetter",
//       "employmentProof",
//     ];


//     fileFields.forEach(field => {
//       if (req.body[field]) {
//         updateFields[field] = req.body[field]; // dynamic URL directly assigned
//       }
//     });


//     const employee = await employeModel.findById(id);
//     if (!employee) return badRequest(res, "Employee Not Found");

//     if (updateFields.password && employee.password !== updateFields.password) {
//       const salt = await bcrypt.genSalt(10);
//       updateFields.password = await bcrypt.hash(updateFields.password, salt);
//       updateFields.passwordChangedAt = new Date();
//     }

//     if (updateFields.roleId) {
//       const newRoleIds = Array.isArray(updateFields.roleId)
//         ? updateFields.roleId.map(String)
//         : [String(updateFields.roleId)];

//       const existingRoleIds = Array.isArray(employee.roleId)
//         ? employee.roleId.map(r => String(r))
//         : [String(employee.roleId)];

//       const roleChanged = newRoleIds.length !== existingRoleIds.length ||
//         newRoleIds.some(role => !existingRoleIds.includes(role));

//       if (roleChanged) updateFields.passwordChangedAt = new Date();
//     }

//     const allowedFields = [
//       "employeName",
//       "email",
//       "userName",
//       "workEmail",
//       "permanentAddress",
//       "currentAddress",
//       "fatherName",
//       "mobileNo",
//       "emergencyNumber",
//       "fathersMobileNo",
//       "mothersMobileNo",
//       "familyIncome",
//       "bankAccount",
//       "totalExperience",
//       "currentAddressPincode",
//       "permanentAddressPincode",
//       "uanNumber",
//       "joiningDate",
//       "dateOfBirth",
//       "startDate",
//       "endDate",
//     ];

//     const numberTypeFields = [
//       "mobileNo",
//       "emergencyNumber",
//       "fathersMobileNo",
//       "mothersMobileNo",
//       "familyIncome",
//       "bankAccount",
//       "totalExperience",
//       "currentAddressPincode",
//       "uanNumber",
//       "currentCTC",
//       "location.coordinates",
//     ];

//     allowedFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         if (fileFields.includes(field) || objectIdFields.includes(field)) {
//           updateFields[field] = req.body[field];
//         } else if (["joiningDate", "dateOfBirth", "startDate", "endDate"].includes(field)) {
//           const parsedDate = new Date(req.body[field]);
//           if (!isNaN(parsedDate.getTime())) updateFields[field] = parsedDate;
//         } else if (numberTypeFields.includes(field)) {
//           updateFields[field] = !isNaN(parseInt(req.body[field])) ? parseInt(req.body[field]) : undefined;
//         } else {
//           updateFields[field] = req.body[field];
//         }
//       }
//     });

//     if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
//       const latitude = parseFloat(req.body.latitude);
//       const longitude = parseFloat(req.body.longitude);

//       if (!isNaN(latitude) && !isNaN(longitude)) {
//         updateFields.location = {
//           type: "Point",
//           coordinates: [longitude, latitude],
//         };
//       } else {
//         return badRequest(res, "Invalid latitude or longitude provided. Both must be numbers.");
//       }
//     }

//     updateFields.updatedFrom = "finexe";
//     const updateData = await employeModel.findByIdAndUpdate(id, updateFields, { new: true });

//     success(res, "Updated Employee", updateData);

//     let lastEntry = updateData.activeInactiveReason?.[updateData.activeInactiveReason.length - 1] || {};
//     let actionTakenBy = "Not Available";

//     if (lastEntry?.actionTakenBy) {
//       const actionTakenById = await employeModel.findById(lastEntry.actionTakenBy);
//       actionTakenBy = actionTakenById?.employeName || "Not Available";
//     }

//     const fetchName = async (model, id, key = "name") => {
//       if (!id) return "Not Available";
//       const doc = await model.findById(id);
//       return doc?.[key] || "Not Available";
//     };

//     const branchName = await fetchName(branchModel, updateData.branchId);
//     const companyName = req.body.company || "Not Available";

//     const roles = await roleModel.find({ _id: { $in: updateData.roleId } });
//     const roleName = roles.length > 0 ? roles.map(role => role.roleName).join(", ") : "Not Available";

//     const reportingManagerName = await fetchName(employeModel, updateData.reportingManagerId, "employeName");
//     const departmentName = await fetchName(departmentModel, updateData.departmentId);
//     const subDepartmentName = await fetchName(departmentModel, updateData.subDepartmentId);
//     const secondaryDepartmenName = await fetchName(departmentModel, updateData.secondaryDepartmentId);
//     const seconSubDepartmentName = await fetchName(departmentModel, updateData.seconSubDepartmentId);
//     const designationName = await fetchName(designationModel, updateData.designationId);
//     const workLocationName = await fetchName(workLocationModel, updateData.workLocationId);
//     const constCenterName = await fetchName(costCenterModel, updateData.constCenterId, "title");
//     const employementTypeName = await fetchName(employmentTypeModel, updateData.employementTypeId, "title");
//     const employeeTypeName = await fetchName(employeTypeModel, updateData.employeeTypeId, "title");

//     const referedBy = await employeModel.findOne({ employeUniqueId: req.body.referedById });
//     const referedBYName = referedBy?.employeName || "Not Available";

//     // await employeeGoogleSheet(
//     //   updateData,
//     //   branchName,
//     //   companyName,
//     //   roleName,
//     //   reportingManagerName,
//     //   departmentName,
//     //   subDepartmentName,
//     //   secondaryDepartmenName,
//     //   seconSubDepartmentName,
//     //   designationName,
//     //   workLocationName,
//     //   constCenterName,
//     //   employementTypeName,
//     //   employeeTypeName,
//     //   referedBYName,
//     //   actionTakenBy
//     // );
//   } catch (err) {
//     console.error("Update Employee Error:", err);
//     return res.status(500).json({ message: err });
//   }
// };


export const adminByUpdateEmployeeId = async (req, res) => {
  try {
    const { employeeId, email, employeName, userName, designationId, departmentId, subDepartmentId } = req.body;

    const organizationId = req.employee.organizationId

    if (!employeeId) {
      return badRequest(res ,"Employee Id Required ")
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return badRequest(res , "Invalid Employee Id");
    }

    const employee = await employeModel.findById(employeeId);
    if (!employee) {
      return notFound(res ,"Employee not found");
    }

    // Check if email already exists for another employee
    if (email) {
      const existingEmail = await employeModel.findOne({
        email: email,
        _id: { $ne: employeeId },
        organizationId : new ObjectId(organizationId),
      });

      if (existingEmail) {
        return badRequest(res , "Email already exists for another employee");
      }
    }

    // Build update object
    const updateFields = {};

    if (email) updateFields.email = email.trim();
    if (employeName) updateFields.employeName = employeName.trim();
    if (userName) updateFields.userName = userName.trim();
    if (designationId && mongoose.Types.ObjectId.isValid(designationId)) {
      updateFields.designationId = new mongoose.Types.ObjectId(designationId);
    }
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      updateFields.departmentId = new mongoose.Types.ObjectId(departmentId);
    }
    if (subDepartmentId && mongoose.Types.ObjectId.isValid(subDepartmentId)) {
      updateFields.subDepartmentId = new mongoose.Types.ObjectId(subDepartmentId);
    }

    const updatedEmployee = await employeModel.findByIdAndUpdate(
      employeeId,
      { $set: updateFields },
      { new: true }
    );

return success(res ,"Employee updated successfully",{ data: updatedEmployee});

  } catch (err) {
    console.error("Update Error:", err);
   return unknownError(res , "Internal Server Error", err);
  }
};


export const updateEmployeePassword = async (req, res) => {
  try {
    const employeeId = req.employee?.id;
    const { newPassword } = req.body;

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return badRequest(res, "Invalid employee ID");
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return badRequest(res, "Password must be at least 6 characters long");
    }

    const employee = await employeModel.findById(employeeId);
    if (!employee) return badRequest(res, "Employee not found");

    const isSamePassword = await bcrypt.compare(newPassword, employee.password);
    if (isSamePassword) return badRequest(res, "New password cannot be the same as the old one");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    employee.password = hashedPassword;
    employee.passwordChangedAt = new Date();
    await employee.save();

    return success(res, "Password updated successfully");
  } catch (err) {
    console.error("Password Update Error:", err);
    return res.status(500).json({ message: "Internal server error" });
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
        "employeePhoto employeUniqueId employeementHistory _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company onboardingStatus password"
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


export async function getAllEmployeeInfo(req, res) {
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
      query.employeName = new RegExp(`^${req.query.employeName}`, "i");
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
          employeePhoto: 1,
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

export const addNewEmployee = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      mobileNo,
      employeName,
      roleId,
    } = req.body;

    // ✅ 1. Validation
    if (!userName || !email || !password || !mobileNo || !employeName) {
      return badRequest(res, "userName, email, password, mobileNo, and employeName are required.");
    }

    // ✅ 2. Check if email already exists
    const existingUser = await employeModel.findOne({ email });
    if (existingUser) {
      return badRequest(res, "Email already exists.");
    }


    const existinguserName = await employeModel.findOne({ userName });
    if (existinguserName) {
      return badRequest(res, "userName already exists.");
    }
    // ✅ 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 4. Role validation if roleId is given
    let roleIds = [];
    if (roleId) {
      const roleExists = await roleModel.findById(roleId);
      if (!roleExists) {
        return badRequest(res, "Provided roleId does not exist.");
      }
      roleIds.push(roleId);
    }

    // ✅ 5. Create employee
    const newEmployee = new employeModel({
      userName: userName.trim(),
      email: email.trim(),
      password: hashedPassword,
      mobileNo,
      employeName: employeName.trim(),
      UserType: ["User"], // default
      roleId: roleIds,
    });

    await newEmployee.save();

    return success(res, "Employee created successfully", {
      employeId: newEmployee._id,
      employeName: newEmployee.employeName,
      email: newEmployee.email,
      mobileNo: newEmployee.mobileNo,
      userName: newEmployee.userName,
      UserType: newEmployee.UserType,
      roleId: newEmployee.roleId,
    });

  } catch (error) {
    console.error("Error adding employee:", error);
    return unknownError(res, error.message);
  }
};


export const forgotPasswordForEmployee = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return badRequest(res, "Please provide an email.");
    }

    // Find employee by email
    const employee = await employeModel.findOne({ email });
    if (!employee) {
      return badRequest(res, "Employee not found with this email.");
    }

    // Generate reset token and expiry
    const resetToken = employee.getResetPasswordToken();
    console.log("resetToken", resetToken)
    // This sets passwordResetToken & passwordResetExpires
    await employee.save({ validateBeforeSave: false });

    // Prepare reset URL
    const resetUrl = `https://hr-portal.fincooperstech.com/EmployeePasswordReset/${resetToken}`;

    // Prepare email message
    const message = `
      <html>
      <body>
        <h2>Hello ${employee.userName || employee.employeName || "Employee"},</h2>
        <p>You requested to reset your password. Please click below to proceed:</p>
        <a href="${resetUrl}" style="padding:10px 20px;background-color:#4CAF50;color:white;border-radius:5px;text-decoration:none;">Reset Password</a>
        <p>This link will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn’t request this, you can ignore this email.</p>
        <br />
        <p>Thanks,<br />HR Team</p>
      </body>
      </html>
    `;

    // Send email
    try {
      await sendEmail1({
        to: employee.email,
        subject: "Employee Password Reset Request",
        html: message,
      });

      return success(res, "Password reset email sent successfully.");
    } catch (error) {
      // If email fails, clear token and expiry
      employee.passwordResetToken = undefined;
      employee.passwordResetExpires = undefined;
      await employee.save({ validateBeforeSave: false });

      return unknownError(res, "Failed to send email. Please try again.");
    }
  } catch (error) {
    return unknownError(res, error.message || "Something went wrong.");
  }
};


export const resetEmployeePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return badRequest(res, "Please provide a new password.");
    }
    console.log("token", token)

    // Hash token again to match with DB
    // const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    // console.log("passwordResetToken",passwordResetToken)

    // Find employee with valid token
    const employee = await employeModel.findOne({
      passwordResetToken: token, // match the token directly
      passwordResetExpires: { $gt: Date.now() }, // token not expired
    });

    if (!employee) {
      return badRequest(res, "Invalid or expired reset token.");
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);
    console.log("employee.password", employee.password)

    // Clear reset token fields
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;

    await employee.save();

    return success(res, "Password reset successful.");
  } catch (error) {
    console.error("Error resetting employee password:", error);
    return unknownError(res, error || "Something went wrong.");
  }
};


// plan detials left credits

export const planCreditRemaining = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId;

    if (!organizationId) {
      return badRequest(res, "Organization ID not found");
    }

    if (!ObjectId.isValid(organizationId)) {
      return badRequest(res, "Invalid Organization ID");
    }

    // Step 1: Get current plan details for the organization
    const planDetails = await organizationPlanModel.findOne({
      organizationId: new ObjectId(organizationId)
    });
    

    if (!planDetails) {
      return badRequest(res, "Plan details not found for the organization");
    }

    const planId = planDetails.planId;

    if (!planId || !ObjectId.isValid(planId)) {
      return badRequest(res, "Invalid or missing Plan ID in plan details");
    }

    // Step 2: Get main plan (template) by planId
    const mainplandetails = await PlanModel.findOne({
      _id: new ObjectId(planId)
    });

    if (!mainplandetails) {
      return badRequest(res, "Main plan template not found");
    }

    // Step 3: Extract values
    const currentJobs = planDetails.NumberOfJobPosts || 0;
    const maxJobs = mainplandetails.NumberOfJobPosts || 0;

    const currentUsers = planDetails.NumberOfUsers || 0;
    const maxUsers = mainplandetails.NumberOfUsers || 0;

    const currentAnalyzers = planDetails.NumberofAnalizers || 0;
    const maxAnalyizers = mainplandetails.NumberofAnalizers || 0;

    // Step 4: Calculate used values and percentages
    const jobPostUsed = maxJobs - currentJobs;
    const jobPostPerc = maxJobs > 0 ? ((jobPostUsed / maxJobs) * 100).toFixed(2) : 0;

    const userUsed = maxUsers - currentUsers;
    const userPerc = maxUsers > 0 ? ((userUsed / maxUsers) * 100).toFixed(2) : 0;

    const analyzerUsed = maxAnalyizers - currentAnalyzers;
    const analyzerPerc = maxAnalyizers > 0 ? ((analyzerUsed / maxAnalyizers) * 100).toFixed(2) : 0;

    // Step 5: Build response object with correct usage strings
    const usageSummary = {
      planDetails: {
        planName: mainplandetails.planName,
        planDescription: mainplandetails.planDescription,
        planPrice: mainplandetails.planPrice,
        planDurationInDays: mainplandetails.planDurationInDays,
        isActive: planDetails.isActive,
        planId:planId,
      },
      usage: {
        jobPostUsage: `${jobPostUsed}/${maxJobs}`,
        jobPostUsagePercentage: `${jobPostPerc}%`,
        userUsage: `${userUsed}/${maxUsers}`,
        userUsagePercentage: `${userPerc}%`,
        analyzerUsage: `${analyzerUsed}/${maxAnalyizers}`,
        analyzerUsagePercentage: `${analyzerPerc}%`,
        addNumberOfAnalizers:planDetails.addNumberOfAnalizers
      }
    };


    // ✅ Send success response using your helper
    return success(res, "Plan usage calculated successfully", usageSummary);

  } catch (error) {
    console.error("Error calculating plan usage:", error);
    return badRequest(res, "Internal server error occurred");
  }
};

