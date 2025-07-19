const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const moment = require("moment");

const ObjectId = mongoose.Types.ObjectId;
const employeModel = require("../../model/adminMaster/employe.model");
const bcrypt = require("bcrypt");
const { roamIdCreate } = require("../../services/locationRoam.services");
const { employeeGoogleSheet } = require("./masterGoogleSheet.controller");
const { google } = require("googleapis");
const credentials = require("../../../../../credential.json");

const companyModel = require("../../model/adminMaster/company.model");
const roleModel = require("../../model/adminMaster/role.model");
const vendorModel = require("../../model/adminMaster/vendor.model");
const branchModel = require("../../model/adminMaster/newBranch.model");
const departmentModel = require("../../model/adminMaster/newDepartment.model");
const designationModel = require("../../model/adminMaster/newDesignation.model");
const workLocationModel = require("../../model/adminMaster/newWorkLocation.model");

const costCenterModel = require("../../model/adminMaster/costCenter.model");
const employmentTypeModel = require("../../model/adminMaster/employmentType.model");
const employeTypeModel = require("../../model/adminMaster/employeType.model");
const visitModel = require("../../model/collection/visit.model");
const collectionSheetModel = require("../../model/collection/collectionSheet.model");
const directJoiningModel = require("../../model/hrms/directJoining.model");
const employeeResignationModel = require("../../model/hrms/employeeResignation.model");
const mailSwitchesModel = require("../../model/adminMaster/mailSwitches.model")
const { relievingPDF } = require("../hrms/relievingLetter.controller");
const { experienceLetterPDF } = require("../hrms/experienceletter.controller");
const { getFullEmployeeHierarchy } = require("../../helper/employee.helper");
const { checkIfPunchIn } = require("../../helper/attendance.helper");

// ------------------Admin Master Add Employe---------------------------------------
async function employeAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const {
        branchId,
        // companyId,
        roleId,
        reportingManagerId,
        departmentId,
        subDepartmentId,
        secondaryDepartmentId,
        seconSubDepartmentId,
        designationId,
        workLocationId,
        constCenterId,
        employementTypeId,
        employeeTypeId,
        directJoiningId,
      } = req.body;
      // console.log(req.body);
      if (req.body.directJoiningId) {
        const directJoining = await directJoiningModel.findByIdAndUpdate(
          { _id: req.body.directJoiningId },
          { onboardingStatus: "onboarded" },
          { new: true }
        );
      }
      const userNameDetail = await employeModel.findOne({
        userName: req.body.userName,
      });
      if (userNameDetail) {
        return badRequest(res, "Username Already Exist");
      }
      if (req.body.email) {
        const emailDetail = await employeModel.findOne({
          email: req.body.email,
        });
        if (emailDetail) {
          return badRequest(res, "Email Already Exist");
        }
      }
      if (req.body.mobileNo) {
        const mobileNoDetail = await employeModel.findOne({
          mobileNo: req.body.mobileNo,
        });
        if (mobileNoDetail) {
          return badRequest(res, "mobileNo Already Exist");
        }
      }

      const { latitude, longitude } = req.body;

      const lat = latitude ? parseFloat(latitude) : 0;
      const lng = longitude ? parseFloat(longitude) : 0;

      let fieldsToProcess = [
        "employeName",
        "email",
        "userName",
        "workEmail",
        "permanentAddress",
        "currentAddress",
        "fatherName",
        "description",
      ];
      fieldsToProcess.forEach((field) => {
        if (req.body[field]) {
          req.body[field] = req.body[field];
        }
      });
      // console.log(req.body);
      if (!req.body.referedById) {
        req.body.referedById = null;
      }

      const employeData = new employeModel(req.body);
      const salt = await bcrypt.genSalt(10);
      employeData.password = await bcrypt.hash(req.body.password, salt);
      // if (req.file) {
      //   const fieldPath = await `/uploads/${req.file.filename}`;
      //   employeData.employeePhoto = fieldPath;
      // }
      const objectIdFields = [
        "secondaryDepartmentId",
        "seconSubDepartmentId",
        "subDepartmentId",
        "branchId",
        // "companyId",
        // "roleId",
        "reportingManagerId",
        "departmentId",
        "designationId",
        "workLocationId",
        "constCenterId",
        "employementTypeId",
        "employeeTypeId",
        "directJoiningId",
      ];

      objectIdFields.forEach((field) => {
        if (employeData[field]) {
          // Correct usage of isValid to check if it's a valid ObjectId string
          if (mongoose.Types.ObjectId.isValid(employeData[field])) {
            employeData[field] = new mongoose.Types.ObjectId(
              employeData[field]
            );
          } else {
            // Assign null if the value is invalid
            employeData[field] = null;
          }
        } else {
          // Assign null if the field is not provided
          employeData[field] = null;
        }
      });

      if (req.files) {
        if (req.files["employeePhoto"]) {
          const photoPath = `/uploads/${req.files["employeePhoto"][0].filename}`;
          employeData.employeePhoto = photoPath;
        }
        if (req.files["resume"]) {
          const resumePath = `/uploads/${req.files["resume"][0].filename}`;
          employeData.resume = resumePath;
        }
        if (req.files["offerLetter"]) {
          const offerLetterPath = `/uploads/${req.files["offerLetter"][0].filename}`;
          employeData.offerLetter = offerLetterPath;
        }
        if (req.files["bankDetails"]) {
          const bankDetailsPath = `/uploads/${req.files["bankDetails"][0].filename}`;
          employeData.bankDetails = bankDetailsPath;
        }
        if (req.files["aadhar"]) {
          const aadharDetailsPath = `/uploads/${req.files["aadhar"][0].filename}`;
          employeData.aadhar = aadharDetailsPath;
        }
        if (req.files["panCard"]) {
          const panCardDetailsPath = `/uploads/${req.files["panCard"][0].filename}`;
          employeData.panCard = panCardDetailsPath;
        }
        if (req.files["educationCertification"]) {
          const educationCertificationDetailsPath = `/uploads/${req.files["educationCertification"][0].filename}`;
          employeData.educationCertification =
            educationCertificationDetailsPath;
        }
        if (req.files["experienceLetter"]) {
          const experienceLetterDetailsPath = `/uploads/${req.files["experienceLetter"][0].filename}`;
          employeData.experienceLetter = experienceLetterDetailsPath;
        }
        if (req.files["employmentProof"]) {
          const employmentProofDetailsPath = `/uploads/${req.files["employmentProof"][0].filename}`;
          employeData.employmentProof = employmentProofDetailsPath;
        }
      }

      employeData.location = {
        type: "Point",
        coordinates: [lng, lat], // Set to [0, 0] if latitude and longitude are not provided
      };

      const employeResult = await employeData.save();

      const reqForRoamIdCreate = {
        body: { employeeId: employeResult._id.toString() },
      };

      const roamResponse = await roamIdCreate(reqForRoamIdCreate);

      if (roamResponse && roamResponse.user_id) {
        // console.log("Roam Response:", roamResponse.user_id);
        // Update employeModel with the generated user_id from Roam
        await employeModel.findByIdAndUpdate(
          employeResult._id,
          {
            locationRoamId: roamResponse.user_id,
          },
          { new: true }
        );
      }

      success(res, "Employe Added Successfully", employeData);

      let actionTakenById;
      let actionTakenBy = "";

      let lastEntry =
        employeData.activeInactiveReason[
          employeData.activeInactiveReason.length - 1
        ];
      if (lastEntry) {
        actionTakenById = await employeModel.findById(lastEntry.actionTakenBy);

        actionTakenBy = actionTakenById?.employeName
          ? actionTakenById.employeName
          : "Not Available";
      }
      if (!lastEntry) {
        lastEntry = {}; // Initialize as an empty object
        lastEntry.reason = "";
        lastEntry.date = "";
      }
      // console.log(lastEntry);
      const branchById = await branchModel.findById(employeData.branchId);
      const branchName = branchById?.name ? branchById.name : "Not Available";

      // const branchName = req.body.branchId;
      // const departmentName = req.body.departmentId;
      // const designationName = req.body.designationId;
      // const costCenter = req.body.constCenterId;
      // const employementTypeName = req.body.employementTypeId;

      // const companyById = await companyModel.findById(employeData.companyId);
      // const companyName = companyById?.companyName
      //   ? companyById.companyName
      //   : "Not Available";

      const companyName = req.body.company;

      // const roleById = await roleModel.findById(employeData.roleId);
      // const roleName = roleById?.roleName ? roleById.roleName : "Not Available";
      const roles = await roleModel.find({
        _id: { $in: employeData.roleId }, // Match all IDs in the roleId array
      });

      const roleName =
        roles.length > 0
          ? roles.map((role) => role.roleName).join(", ") // Join all role names into a string
          : "Not Available";

      const reportingManagerBYId = await employeModel.findById(
        employeData.reportingManagerId
      );
      const reportingManagerName = reportingManagerBYId?.employeName
        ? reportingManagerBYId.employeName
        : "Not Available";

      const departmentById = await departmentModel.findById(
        employeData.departmentId
      );
      const departmentName = departmentById?.name
        ? departmentById.name
        : "Not Available";

      const subDepartmentById = await departmentModel.findById(
        employeData.subDepartmentId
      );
      const subDepartmentName = subDepartmentById?.name
        ? subDepartmentById.name
        : "Not Available";

      const secondaryDepartmentById = await departmentModel.findById(
        employeData.secondaryDepartmentId
      );
      const secondaryDepartmenName = secondaryDepartmentById?.name
        ? secondaryDepartmentById.name
        : "Not Available";

      const seconSubDepartmentById = await departmentModel.findById(
        employeData.seconSubDepartmentId
      );
      const seconSubDepartmentName = seconSubDepartmentById?.name
        ? seconSubDepartmentById.name
        : "Not Available";

      const designationById = await designationModel.findById(
        employeData.designationId
      );
      const designationName = designationById?.name
        ? designationById.name
        : "Not Available";

      const workLocationById = await workLocationModel.findById(
        employeData.workLocationId
      );
      const workLocationName = workLocationById?.name
        ? workLocationById.name
        : "Not Available";

      const constCenterById = await costCenterModel.findById(
        employeData.constCenterId
      );
      const constCenterName = constCenterById?.title
        ? constCenterById.title
        : "Not Available";

      const employementTypeById = await employmentTypeModel.findById(
        employeData.employementTypeId
      );
      const employementTypeName = employementTypeById?.title
        ? employementTypeById.title
        : "Not Available";

      const employeeTypeById = await employeTypeModel.findById(
        employeData.employeeTypeId
      );
      const employeeTypeName = employeeTypeById?.title
        ? employeeTypeById.title
        : "Not Available";

      const referedBy = await employeModel.findOne({
        employeUniqueId: req.body.referedById,
      });
      const referedBYName = referedBy?.employeName
        ? referedBy.employeName
        : "Not Available";

      await employeeGoogleSheet(
        employeData,
        branchName,
        companyName,
        roleName,
        reportingManagerName,
        departmentName,
        designationName,
        workLocationName,
        constCenterName,
        employementTypeName,
        employeeTypeName,
        referedBYName,
        subDepartmentName,
        secondaryDepartmenName,
        seconSubDepartmentName,
        actionTakenBy,
        lastEntry
      );
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Employe "active" or "inactive" updated---------------------------------------
async function employeActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.id;
      const status = req.body.status;
      if (!id || id.trim() === "") {
        return notFound(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      if (status !== "active" && status !== "inactive") {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
      if (!req.body.reason) {
        return notFound(res, "Enter Reason");
      }
      const employe = await employeModel.findById(id);
      if (!employe) {
        return notFound(res, "Employee not found");
      }

      if (employe.status === status) {
        return badRequest(res, `Employee is already ${status}`);
      }

      const newReportingManagerId = req.body.newReportingManagerId;

      if (newReportingManagerId) {
        const newManagerExists = await employeModel.exists({
          _id: newReportingManagerId,
        });
        if (!newManagerExists) {
          return badRequest(
            res,
            "The provided new reporting manager ID is invalid."
          );
        }
        let employeeList = await employeModel.find({reportingManagerId:id})
        updateMultipleDataOnSheet(employeeList,req.body.company,newReportingManagerId)
        await employeModel.updateMany(
          { reportingManagerId: id, status: "active" },
          { $set: { reportingManagerId: newReportingManagerId } }
        );
        await employeModel.updateMany(
          { reportingManagerId: id, status: "inactive" },
          { $set: { reportingManagerId: null } }
        );
        const isReportingManager = await employeModel.exists({
          reportingManagerId: id,
        });
        if (isReportingManager && status === "inactive") {
          return badRequest(
            res,
            "Cannot deactivate the employee as they are a reporting manager for others"
          );
        }
      }

      const updateData = await employeModel.findByIdAndUpdate(
        id,
        {
          $push: {
            activeInactiveReason: {
              actionTakenBy: req.Id,
              date: new Date(),
              reason: req.body.reason,
            },
          },
          status,
        },
        { new: true }
      );

      success(res, `Employee status updated to ${status}`, updateData);
      const branchById = await branchModel.findById(updateData.branchId);
      const branchName = branchById?.name ? branchById.name : "Not Available";

      // const companyById = await companyModel.findById(updateData.companyId);
      // const companyName = companyById?.companyName
      //   ? companyById.companyName
      //   : "Not Available";

      const companyName = req.body.company;

      const roleById = await roleModel.findById(updateData.roleId);
      const roleName = roleById?.roleName ? roleById.roleName : "Not Available";

      const reportingManagerBYId = await employeModel.findById(
        updateData.reportingManagerId
      );
      const reportingManagerName = reportingManagerBYId?.employeName
        ? reportingManagerBYId.employeName
        : "Not Available";

      const departmentById = await departmentModel.findById(
        updateData.departmentId
      );
      const departmentName = departmentById?.name
        ? departmentById.name
        : "Not Available";

      const subDepartmentById = await departmentModel.findById(
        updateData.subDepartmentId
      );
      const subDepartmentName = subDepartmentById?.name
        ? departmentById.name
        : "Not Available";

      const secondaryDepartmentById = await departmentModel.findById(
        updateData.secondaryDepartmentId
      );
      const secondaryDepartmenName = secondaryDepartmentById?.name
        ? secondaryDepartmentById.name
        : "Not Available";

      const seconSubDepartmentById = await departmentModel.findById(
        updateData.seconSubDepartmentId
      );
      const seconSubDepartmentName = seconSubDepartmentById?.name
        ? seconSubDepartmentById.name
        : "Not Available";

      const designationById = await designationModel.findById(
        updateData.designationId
      );
      const designationName = designationById?.name
        ? designationById.name
        : "Not Available";

      const workLocationById = await workLocationModel.findById(
        updateData.workLocationId
      );
      const workLocationName = workLocationById?.name
        ? workLocationById.name
        : "Not Available";

      const constCenterById = await costCenterModel.findById(
        updateData.constCenterId
      );
      const constCenterName = constCenterById?.title
        ? constCenterById.title
        : "Not Available";

      const employementTypeById = await employmentTypeModel.findById(
        updateData.employementTypeId
      );
      const employementTypeName = employementTypeById?.title
        ? employementTypeById.title
        : "Not Available";

      const employeeTypeById = await employeTypeModel.findById(
        updateData.employeeTypeId
      );
      const employeeTypeName = employeeTypeById?.title
        ? employeeTypeById.title
        : "Not Available";
      const referedBy = await employeModel.findOne({
        employeUniqueId: req.body.referedById,
      });
      const referedBYName = referedBy?.employeName
        ? referedBy.employeName
        : "Not Available";

      let actionTakenById;
      let actionTakenBy = "Not Available";

      const lastEntry =
        updateData.activeInactiveReason[
          updateData.activeInactiveReason.length - 1
        ];

      if (lastEntry) {
        // Use the actionTakenBy from the last entry to find the employee details
        actionTakenById = await employeModel.findById(lastEntry.actionTakenBy);
        // Get the employee name or set to "Not Available" if not found
        actionTakenBy = actionTakenById?.employeName
          ? actionTakenById.employeName
          : "Not Available";
      }
      await employeeGoogleSheet(
        updateData,
        branchName,
        companyName,
        roleName,
        reportingManagerName,
        departmentName,
        designationName,
        workLocationName,
        constCenterName,
        employementTypeName,
        employeeTypeName,
        referedBYName,
        subDepartmentName,
        secondaryDepartmenName,
        seconSubDepartmentName,
        actionTakenBy,
        lastEntry
      );
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function updateMultipleDataOnSheet(employeeList,companyName,newReportingManagerId) {

  for (let index = 0; index < employeeList.length; index++) {
    const updateData = employeeList[index];
    const branchById = await branchModel.findById(updateData.branchId);
      const branchName = branchById?.name ? branchById.name : "Not Available";

      // const companyById = await companyModel.findById(updateData.companyId);
      // const companyName = companyById?.companyName
      //   ? companyById.companyName
      //   : "Not Available";


      const roleById = await roleModel.findById(updateData.roleId);
      const roleName = roleById?.roleName ? roleById.roleName : "Not Available";

      const reportingManagerBYId = await employeModel.findById(
        newReportingManagerId
      );
      const reportingManagerName = reportingManagerBYId?.employeName
        ? reportingManagerBYId.employeName
        : "Not Available";

      const departmentById = await departmentModel.findById(
        updateData.departmentId
      );
      const departmentName = departmentById?.name
        ? departmentById.name
        : "Not Available";

      const subDepartmentById = await departmentModel.findById(
        updateData.subDepartmentId
      );
      const subDepartmentName = subDepartmentById?.name
        ? departmentById.name
        : "Not Available";

      const secondaryDepartmentById = await departmentModel.findById(
        updateData.secondaryDepartmentId
      );
      const secondaryDepartmenName = secondaryDepartmentById?.name
        ? secondaryDepartmentById.name
        : "Not Available";

      const seconSubDepartmentById = await departmentModel.findById(
        updateData.seconSubDepartmentId
      );
      const seconSubDepartmentName = seconSubDepartmentById?.name
        ? seconSubDepartmentById.name
        : "Not Available";

      const designationById = await designationModel.findById(
        updateData.designationId
      );
      const designationName = designationById?.name
        ? designationById.name
        : "Not Available";

      const workLocationById = await workLocationModel.findById(
        updateData.workLocationId
      );
      const workLocationName = workLocationById?.name
        ? workLocationById.name
        : "Not Available";

      const constCenterById = await costCenterModel.findById(
        updateData.constCenterId
      );
      const constCenterName = constCenterById?.title
        ? constCenterById.title
        : "Not Available";

      const employementTypeById = await employmentTypeModel.findById(
        updateData.employementTypeId
      );
      const employementTypeName = employementTypeById?.title
        ? employementTypeById.title
        : "Not Available";

      const employeeTypeById = await employeTypeModel.findById(
        updateData.employeeTypeId
      );
      const employeeTypeName = employeeTypeById?.title
        ? employeeTypeById.title
        : "Not Available";
      const referedBy = await employeModel.findOne({
        employeUniqueId: req.body.referedById,
      });
      const referedBYName = referedBy?.employeName
        ? referedBy.employeName
        : "Not Available";

      let actionTakenById;
      let actionTakenBy = "Not Available";

      const lastEntry =
        updateData.activeInactiveReason[
          updateData.activeInactiveReason.length - 1
        ];

      if (lastEntry) {
        // Use the actionTakenBy from the last entry to find the employee details
        actionTakenById = await employeModel.findById(lastEntry.actionTakenBy);
        // Get the employee name or set to "Not Available" if not found
        actionTakenBy = actionTakenById?.employeName
          ? actionTakenById.employeName
          : "Not Available";
      }
      await employeeGoogleSheet(
        updateData,
        branchName,
        companyName,
        roleName,
        reportingManagerName,
        departmentName,
        designationName,
        workLocationName,
        constCenterName,
        employementTypeName,
        employeeTypeName,
        referedBYName,
        subDepartmentName,
        secondaryDepartmenName,
        seconSubDepartmentName,
        actionTakenBy,
        lastEntry
      );
  }
  
}


// ------------------Admin Master Update employe Name Employe ---------------------------------------
async function updateEmployee(req, res) {
  try {
    // console.log(req.body.roleId);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { id, ...updateFields } = req.body;
    if (!id) {
      id = req.Id;
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Valid ID is required");
    }

    // Fields to convert to ObjectId if they exist in req.body
    const objectIdFields = [
      "branchId",
      // "companyId",
      // "roleId",
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

    // objectIdFields.forEach((field) => {
    //   if (updateFields[field] && mongoose.Types.ObjectId.isValid(updateFields[field])) {
    //     updateFields[field] = new mongoose.Types.ObjectId(updateFields[field]);
    //   }
    // });
    objectIdFields.forEach((field) => {
      if (updateFields[field]) {
        // Check if the field is an array
        if (Array.isArray(updateFields[field])) {
          // Validate each element in the array
          updateFields[field] = updateFields[field].map((value) =>
            mongoose.Types.ObjectId.isValid(value)
              ? new mongoose.Types.ObjectId(value)
              : null
          );
          // Remove invalid entries (null values)
          updateFields[field] = updateFields[field].filter(
            (value) => value !== null
          );
        } else {
          // Handle single ObjectId
          if (mongoose.Types.ObjectId.isValid(updateFields[field])) {
            updateFields[field] = new mongoose.Types.ObjectId(
              updateFields[field]
            );
          } else {
            // Assign null if the value is invalid
            updateFields[field] = null;
          }
        }
      } else {
        // Assign undefined if the field is not provided
        updateFields[field] = undefined;
      }
    });
    // console.log(req.body.roleId);

    // Process document file uploads (only update if new files are provided)
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

    fileFields.forEach((field) => {
      if (req.files && req.files[field]) {
        updateFields[field] = `/uploads/${req.files[field][0].filename}`;
      } else if (req.body[field]) {
        updateFields[field] = req.body[field];
      }
    });

    // Fetch the existing employee to check password and prevent updating null values
    const employee = await employeModel.findById(id);
    if (!employee) {
      return badRequest(res, "Employee Not Found");
    }

    // Hash and update password if it's provided and different from the existing one
    if (updateFields.password && employee.password !== updateFields.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(updateFields.password, salt);
      updateFields.passwordChangedAt = new Date(); // added new
    }


    // new added //
    if (updateFields.roleId) {
      const newRoleIds = Array.isArray(updateFields.roleId)
        ? updateFields.roleId.map(String)
        : [String(updateFields.roleId)];

      const existingRoleIds = Array.isArray(employee.roleId)
        ? employee.roleId.map((r) => String(r))
        : [String(employee.roleId)];

      const roleChanged =
        newRoleIds.length !== existingRoleIds.length ||
        newRoleIds.some((role) => !existingRoleIds.includes(role));

      if (roleChanged) {
        updateFields.passwordChangedAt = new Date();
      }
    }

    // --  end of changes //


    // Update only fields that exist in req.body and have values
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

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (fileFields.includes(field) || objectIdFields.includes(field)) {
          updateFields[field] = req.body[field];
        } else if (
          ["joiningDate", "dateOfBirth", "startDate", "endDate"].includes(field)
        ) {
          const parsedDate = new Date(req.body[field]);
          if (!isNaN(parsedDate.getTime())) updateFields[field] = parsedDate;
        } else if (numberTypeFields.includes(field)) {
          if (!isNaN(parseInt(req.body[field]))) {
            updateFields[field] = parseInt(req.body[field]);
          } else {
            updateFields[field] = undefined;
          }
        } else {
          updateFields[field] = req.body[field];
        }
      }
    });
    if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      const latitude = parseFloat(req.body.latitude);
      const longitude = parseFloat(req.body.longitude);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        updateFields["location"] = {
          type: "Point",
          coordinates: [longitude, latitude], // Longitude first, latitude second
        };
      } else {
        return badRequest(
          res,
          "Invalid latitude or longitude provided. Both must be numbers."
        );
      }
    }
    // Perform the update with only the provided fields
    // console.log(updateFields);
    updateFields["updatedFrom"] = "finexe";
    const updateData = await employeModel.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    success(res, "Updated Employee", updateData);
    let actionTakenById;
    let actionTakenBy = "";

    let lastEntry =
      updateData.activeInactiveReason[
        updateData.activeInactiveReason.length - 1
      ];
    if (lastEntry) {
      actionTakenById = await employeModel.findById(lastEntry.actionTakenBy);

      actionTakenBy = actionTakenById?.employeName
        ? actionTakenById.employeName
        : "Not Available";
    }
    if (!lastEntry) {
      lastEntry = {}; // Initialize as an empty object
      lastEntry.reason = "";
      lastEntry.date = "";
    }
    const branchById = await branchModel.findById(updateData.branchId);
    const branchName = branchById?.name ? branchById.name : "Not Available";

    // const companyById = await companyModel.findById(updateData.companyId);
    // const companyName = companyById?.companyName
    //   ? companyById.companyName
    //   : "Not Available";

    const companyName = req.body.company;

    const roles = await roleModel.find({
      _id: { $in: updateData.roleId }, // Match all IDs in the roleId array
    });

    const roleName =
      roles.length > 0
        ? roles.map((role) => role.roleName).join(", ") // Join all role names into a string
        : "Not Available";

    const reportingManagerBYId = await employeModel.findById(
      updateData.reportingManagerId
    );
    const reportingManagerName = reportingManagerBYId?.employeName
      ? reportingManagerBYId.employeName
      : "Not Available";

    const departmentById = await departmentModel.findById(
      updateData.departmentId
    );
    const departmentName = departmentById?.name
      ? departmentById.name
      : "Not Available";

    const subDepartmentById = await departmentModel.findById(
      updateData.subDepartmentId
    );
    const subDepartmentName = subDepartmentById?.name
      ? departmentById.name
      : "Not Available";

    const secondaryDepartmentById = await departmentModel.findById(
      updateData.secondaryDepartmentId
    );
    const secondaryDepartmenName = secondaryDepartmentById?.name
      ? secondaryDepartmentById.name
      : "Not Available";

    const seconSubDepartmentById = await departmentModel.findById(
      updateData.seconSubDepartmentId
    );
    const seconSubDepartmentName = seconSubDepartmentById?.name
      ? seconSubDepartmentById.name
      : "Not Available";

    const designationById = await designationModel.findById(
      updateData.designationId
    );
    const designationName = designationById?.name
      ? designationById.name
      : "Not Available";

    const workLocationById = await workLocationModel.findById(
      updateData.workLocationId
    );
    const workLocationName = workLocationById?.name
      ? workLocationById.name
      : "Not Available";

    const constCenterById = await costCenterModel.findById(
      updateData.constCenterId
    );
    const constCenterName = constCenterById?.title
      ? constCenterById.title
      : "Not Available";

    const employementTypeById = await employmentTypeModel.findById(
      updateData.employementTypeId
    );
    const employementTypeName = employementTypeById?.title
      ? employementTypeById.title
      : "Not Available";

    const employeeTypeById = await employeTypeModel.findById(
      updateData.employeeTypeId
    );
    const employeeTypeName = employeeTypeById?.title
      ? employeeTypeById.title
      : "Not Available";
    const referedBy = await employeModel.findOne({
      employeUniqueId: req.body.referedById,
    });
    const referedBYName = referedBy?.employeName
      ? referedBy.employeName
      : "Not Available";

    await employeeGoogleSheet(
      updateData,
      branchName,
      companyName,
      roleName,
      reportingManagerName,
      departmentName,
      designationName,
      workLocationName,
      constCenterName,
      employementTypeName,
      employeeTypeName,
      referedBYName,
      subDepartmentName,
      secondaryDepartmenName,
      seconSubDepartmentName,
      actionTakenBy,
      lastEntry
    );
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------Admin Master Update employe Name Employe ---------------------------------------
async function updateEmployeePhoto(req, res) {
  try {
    // console.log(req.body.roleId);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { employeePhoto } = req.body;
    const id = new ObjectId(req.Id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Valid ID is required");
    }
    if (!employeePhoto) {
      return badRequest(res, "Employee Photo is required");
    }

    // Fetch the existing employee  src="https://stageapi.fincooper.in/uploads/file_1734954194440.istockphoto-1354842602-612x612.jpg"
    const employee = await employeModel.findById(id);
    if (!employee) {
      return badRequest(res, "Employee Not Found");
    }

    const updateData = await employeModel.findByIdAndUpdate(
      { _id: id },
      { employeePhoto: employeePhoto },
      { new: true }
    );
    success(res, "Updated Employee Photo", updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All Employe except newjoinee role---------------------------------------

async function getAllEmploye(req, res) {
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


// async function getEmployeeHierarchalDropDown(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const userId = req.Id
//     const employeeList = await getFullEmployeeHierarchy(userId)
 
//     const employeDetail = await employeModel
//       .find({
//         status: "active",
//         onboardingStatus: { $in: ["enrolled"] },
//         _id: { $in: employeeList.data },
//         // roleId: { $ne: newJoineeRole._id },
//         // onboardingStatus: "enrolled"
//       })
//       .select(
//         "employeePhoto employeUniqueId employeementHistory _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company onboardingStatus"
//       )

//       // .populate("companyId")
//       .populate({ path: "roleId", select: " roleName" })
//       .populate({ path: "branchId", select: " name" })
//       .populate({ path: "departmentId", select: " name" })
//       .populate({ path: "designationId", select: " name" })
//       .populate({ path: "workLocationId", select: " name" })
//       .populate({ path: "reportingManagerId", select: " employeName" })
//       .populate({ path: "employeeTypeId", select: " title" })
//       .populate({ path: "employementTypeId", select: " title" })
//       .populate({ path: "constCenterId", select: " title" })
//       .sort({ createdAt: -1 });
//     const count = employeDetail.length;
//     // console.log(employeDetail.length)
//     console.log(employeDetail.length);

//     success(res, "All Employes", employeDetail);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

async function getEmployeeHierarchalDropDown(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const userId = req.Id
    const employeeList = await getFullEmployeeHierarchy(userId)
    
    // Get employeName from query params for filtering
    const { employeName } = req.query;
    
    // Create filter object
    const filter = {
      status: "active",
      onboardingStatus: { $in: ["enrolled"] },
      _id: { $in: employeeList.data },
      // roleId: { $ne: newJoineeRole._id },
      // onboardingStatus: "enrolled"
    }
    
    // Add employeName filter if provided
    if (employeName) {
      filter.employeName = { $regex: employeName, $options: 'i' }; // Case-insensitive partial match
    }
 
    const employeDetail = await employeModel
      .find(filter)
      .select(
        "employeePhoto employeUniqueId employeementHistory _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company onboardingStatus"
      )

      // .populate("companyId")
      .populate({ path: "roleId", select: " roleName" })
      .populate({ path: "branchId", select: " name" })
      .populate({ path: "departmentId", select: " name" })
      .populate({ path: "designationId", select: " name" })
      .populate({ path: "workLocationId", select: " name" })
      .populate({ path: "reportingManagerId", select: " employeName" })
      .populate({ path: "employeeTypeId", select: " title" })
      .populate({ path: "employementTypeId", select: " title" })
      .populate({ path: "constCenterId", select: " title" })
      .sort({ createdAt: -1 });
    // const count = employeDetail.length;
    // console.log(employeDetail.length)
    // console.log(employeDetail.length);

    success(res, "All Employes", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------Admin Master Get All Employe except newjoinee role---------------------------------------


async function getNewJoineeEmployee(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const employeDetail = await employeModel
      .find({
        status: "active",
        onboardingStatus: { $in: ["onboarded"] },
        // roleId: { $in: newJoineeRole._id },
        // onboardingStatus: "enrolled"
      })
      .select(
        "employeePhoto employeUniqueId employeementHistory _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company onboardingStatus"
      )

      // .populate("companyId")
      .populate({ path: "roleId", select: " roleName" })
      .populate({ path: "branchId", select: " name" })
      .populate({ path: "departmentId", select: " name" })
      .populate({ path: "designationId", select: " name" })
      .populate({ path: "workLocationId", select: " name" })
      .populate({ path: "reportingManagerId", select: " employeName" })
      .populate({ path: "employeeTypeId", select: " title" })
      .populate({ path: "employementTypeId", select: " title" })
      .populate({ path: "constCenterId", select: " title" })
      .sort({ createdAt: -1 });
    const count = employeDetail.length;
    // console.log(employeDetail.length)
    console.log(employeDetail.length);

    success(res, "New joinee data", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------Admin Master Get All Employe---------------------------------------

async function getAllJoiningEmployee(req, res) {
  try {
    const onboardingStatus = req.query.onboardingStatus;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const employeDetail = await employeModel
      .find({ status: "active", onboardingStatus: onboardingStatus })
      .select(
        "image employeUniqueId _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company"
      )
      .sort({ createdAt: -1 })
      // .populate("companyId")
      .populate({ path: "roleId", select: " roleName" })
      .populate({ path: "branchId", select: " name" })
      .populate({ path: "departmentId", select: " name" })
      .populate({ path: "designationId", select: " name" })
      .populate({ path: "workLocationId", select: " name" })
      .populate({ path: "reportingManagerId", select: " employeName" })
      .populate({ path: "employeeTypeId", select: " title" })
      .populate({ path: "employementTypeId", select: " title" })
      .populate({ path: "constCenterId", select: " title" });
    const count = employeDetail.length;
    // console.log(employeDetail.length)
    // console.log(employeDetail.length);

    success(res, "All Joining Employee Details", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//--------------------------------------------get all inactive employee--------------------
async function getAllInactiveEmployee(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const employeDetail = await employeModel
      .find({ status: "inactive", onboardingStatus: "enrolled" })
      .sort({ createdAt: -1 })
      // .populate("companyId")
      .populate({ path: "roleId", select: " roleName" })
      .populate({ path: "branchId", select: " name" })
      .populate({ path: "departmentId", select: " name" })
      .populate({ path: "designationId", select: " name" })
      .populate({ path: "workLocationId", select: " name" })
      .populate({ path: "reportingManagerId", select: " employeName" })
      .populate({ path: "employeeTypeId", select: " title" })
      .populate({ path: "employementTypeId", select: " title" })
      .populate({ path: "constCenterId", select: " title" });
    const count = employeDetail.length;
    // console.log(employeDetail.length)
    // console.log(employeDetail.length);

    success(res, "All Employes", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All Employe---------------------------------------
async function getEmployeeById(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    // let employeeId;

    // // First check if Id exists in token request
    // if (req.Id) {
    //   employeeId = new ObjectId(req.Id);
    // }
    // // If not found in token, check query parameter
    // else if (req.query.Id) {
    //   employeeId = req.query.Id;
    // }
    const employeeId = req.query.Id;

    const employeDetail = await employeModel
      .findById({ _id: employeeId })
      .populate({ path: "roleId", select: " roleName" })
      .populate({ path: "branchId", select: " name" })
      .populate({ path: "departmentId", select: " name" })
      .populate({ path: "designationId", select: " name" })
      .populate({ path: "workLocationId", select: " name" })
      .populate({ path: "reportingManagerId", select: " employeName" })
      .populate({ path: "employeeTypeId", select: " title" })
      .populate({ path: "employementTypeId", select: " title" })
      .populate({ path: "constCenterId", select: " title" });
    // .populate("roleId")
    // .populate("companyId")
    // .populate("reportingManagerId")
    // .populate("employeeTypeId")
    // .populate("employementTypeId")
    // .populate("constCenterId")
    // .populate("employementTypeId")
    // .populate("employeeTypeId");
    success(res, "Employee detail", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Employe Detail By Token---------------------------------------
async function getEmployeeByToken(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let employeeId;

    // First check if Id exists in token request
    if (req.Id) {
      employeeId = new ObjectId(req.Id);
    }

    const employeDetail = await employeModel
      .findById({ _id: employeeId })
      .populate({ path: "roleId", select: " roleName" })
      .populate({ path: "branchId", select: " name" })
      .populate({ path: "departmentId", select: " name" })
      .populate({ path: "designationId", select: " name" })
      .populate({ path: "workLocationId", select: " name" })
      .populate({ path: "reportingManagerId", select: " employeName" })
      .populate({ path: "employeeTypeId", select: " title" })
      .populate({ path: "employementTypeId", select: " title" })
      .populate({ path: "constCenterId", select: " title" });
    // .populate("roleId")
    // .populate("companyId")
    // .populate("reportingManagerId")
    // .populate("employeeTypeId")
    // .populate("employementTypeId")
    // .populate("constCenterId")
    // .populate("employementTypeId")
    // .populate("employeeTypeId");
    success(res, "Employee detail", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//----------------------------------------------------------------------------------------

async function getAllEmployeeSheet(req, res) {
  try {
    const spreadsheetId = process.env.ADMINMASTER_GOOGLE_SHEET_KEY_LIVE;
    const sheetName = "EMPLOYEE DETAILS";
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return badRequest(res, "No data found.");
    } else {
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          // Ensure that even empty fields are included
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });

      success(res, "Get All EMPLOYEE", data);
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return badRequest(res, "Invalid sheet name.");
    } else {
      unknownError(res, error.message);
    }
  }
}

// -------------GET ALL EMPLOYEE BY ROLE----------------------------
async function getAllEmployeByRole(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const roleNameToMatch = req.query.role;

    let roleFilter = {};
    if (roleNameToMatch) {
      roleFilter = {
        "role.roleName": {
          $in: [roleNameToMatch],
        },
      };
    }

    const employeDetail = await employeModel.aggregate([
      {
        $match: { status: "active", onboardingStatus: "enrolled" },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $unwind: "$role",
      },
      {
        $match: roleFilter,
      },
    ]);

    // Simplify the employee details
    const simplifiedEmployees = employeDetail.map((employee) => ({
      _id: employee._id,
      employeName: employee.employeName,
      userName: employee.employeName,
    }));

    success(res, `${roleNameToMatch} Employees List`, simplifiedEmployees);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Get All Employe Api For Website----------------
async function getAllEmployeForWebsite(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const employeDetail = await employeModel
      .find({ status: "active", onboardingStatus: "enrolled" })
      .populate("roleId", "roleName status  _id")
      .populate("departmentId", "name status  _id")
      .populate("designationId", "name status  _id")
      .select(
        "_id employeName userName email employeePhoto status description websiteListing"
      );

    success(res, "All Employees", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Get All Employe Api For Website----------------
async function getAllEmployeForWebsite(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const employeDetail = await employeModel
      .find({ status: "active", onboardingStatus: "enrolled" })
      .populate("roleId", "roleName status  _id")
      .populate("departmentId", "name status  _id")
      .populate("designationId", "name status  _id")
      .select(
        "_id employeName userName email employeePhoto status description websiteListing"
      );

    success(res, "All Employees", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Get filtered Employee Api For Website----------
async function getFilteredEmployeForWebsite(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const employeDetail = await employeModel
      .find({
        status: "active",
        websiteListing: "active",
        onboardingStatus: "enrolled",
      })
      .populate("roleId", "roleName status  _id")
      .populate("departmentId", "name status  _id")
      .populate("designationId", "name status  _id")
      .select(
        "_id employeName userName email employeePhoto status description websiteListing"
      );

    success(res, "All Employees", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function deleteEmployee(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { id } = req.query;
    if (!id) {
      return badRequest(res, "ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      return badRequest(res, "Invalid ID");
    }
    const employeeData = await employeModel.findByIdAndDelete(id);
    if (!employeeData) {
      return notFound(res, "Employee not found");
    }
    success(res, "Employee deleted successfully");
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getHoDashboard(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    async function getSubordinates(managerId) {
      const employees = await employeModel.find({
        reportingManagerId: managerId,
      });

      const formattedEmployees = await Promise.all(
        employees.map(async (employee) => {
          const children = await getSubordinates(employee._id);
          return {
            _id: employee._id,
            id: {
              name: employee.employeName,
              id: employee.employeUniqueId || employee._id.toString(),
              mobile: employee.mobileNo,
              workEmail: employee.workEmail,
              employeePhoto: employee.employeePhoto,
              dateOfBirth: employee.dateOfBirth,
              fatherName: employee.fatherName,
              permanentAddress: employee.permanentAddress,
              currentAddress: employee.currentAddress,
              employeePhoto: employee.employeePhoto,
              children: children.length > 0 ? children : undefined,
            },
          };
        })
      );

      return formattedEmployees;
    }

    const manager = await employeModel.findById(req.query._id);
    if (!manager) {
      return res.status(404).json({
        errorName: "notFound",
        message: "Manager not found",
      });
    }

    const hierarchy = {
      _id: manager._id,
      id: {
        name: manager.employeName,
        id: manager.employeUniqueId || manager._id.toString(),
        mobile: manager.mobileNo,
        workEmail: manager.workEmail,
        fatherName: manager.fatherName,
        permanentAddress: manager.permanentAddress,
        currentAddress: manager.currentAddress,
        employeePhoto: manager.employeePhoto,
        dateOfBirth: manager.dateOfBirth,
        employeePhoto: manager.employeePhoto,
        children: await getSubordinates(req.query._id),
      },
    };

    success(res, "Employee Hierarchy", hierarchy);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getHoDashboardinGrid(req, res) {
  try {
    // Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Extract _id and reportingManagerId from the query parameters
    const { _id, reportingManagerId } = req.query;

    let employees = [];

    if (_id) {
      // If _id is provided, fetch the employee with that _id
      const mainEmployee = await employeModel.findById(_id);

      if (mainEmployee) {
        employees.push(mainEmployee);

        // Then, fetch team members (employees reporting to the main employee)
        const teamMembers = await employeModel.find({
          reportingManagerId: _id,
        });
        employees = employees.concat(teamMembers);
      }
    } else if (reportingManagerId) {
      // If reportingManagerId is provided, fetch the reporting manager
      const reportingManager = await employeModel.findById(reportingManagerId);

      if (reportingManager) {
        employees.push(reportingManager);

        // Then, fetch team members (employees reporting to this manager)
        const teamMembers = await employeModel.find({ reportingManagerId });
        employees = employees.concat(teamMembers);
      }
    } else {
      // If neither _id nor reportingManagerId is provided, return an error
      return notFound(res, "No _id or reportingManagerId provided");
    }

    // Structure the response data
    const responseData = {
      employees: employees.map((employee) => ({
        _id: employee._id,
        name: employee.employeName,
        mobileNo: employee.mobileNo,
        status: employee.status,
        employeePhoto: employee.employeePhoto,
        dateOfBirth: employee.dateOfBirth,
        joiningDate: employee.joiningDate,
        fatherName: employee.fatherName,
        currentAddress: employee.currentAddress,
        permanentAddress: employee.permanentAddress,
        email: employee.email,
        workEmail: employee.workEmail,
        // Add other relevant properties...
      })),
    };

    // Respond with success and structured employee data
    return success(res, "Employees fetched successfully", responseData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function employeeAllDetails(req, res) {
  try {
    const { id } = req.query;
    const employeeFind = await employeModel.findById(id);
    if (!employeeFind) {
      return badRequest(res, "Employee not found");
    }

    const roleFind = await roleModel.findById(employeeFind.roleId);
    if (!roleFind) {
      return badRequest(res, "Role not found for this employee");
    }
    const employeUniqueId = employeeFind.employeUniqueId;
    const visitStatusCount = await visitModel.aggregate([
      { $match: { visitBy: employeUniqueId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const collectionSheetStatusCount = await collectionSheetModel.aggregate([
      { $match: { collectedBy: employeUniqueId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Prepare employee details including role name and status counts
    const employeeDetail = {
      employeName: employeeFind.employeName,
      mobileNo: employeeFind.mobileNo,
      joiningDate: employeeFind.joiningDate,
      currentAddress: employeeFind.currentAddress,
      permanentAddress: employeeFind.permanentAddress,
      employeUniqueId: employeeFind.employeUniqueId,
      roleName: roleFind.roleName, // Get role name from role model

      // Visit status counts
      visitStatus: {
        accept: visitStatusCount.find((v) => v._id === "accept")?.count || 0,
        pending: visitStatusCount.find((v) => v._id === "pending")?.count || 0,
        reject: visitStatusCount.find((v) => v._id === "reject")?.count || 0,
      },

      // CollectionSheet status counts
      collectionSheetStatus: {
        accept:
          collectionSheetStatusCount.find((v) => v._id === "accept")?.count ||
          0,
        pending:
          collectionSheetStatusCount.find((v) => v._id === "pending")?.count ||
          0,
        reject:
          collectionSheetStatusCount.find((v) => v._id === "reject")?.count ||
          0,
      },
    };

    return success(res, "Employee Details successfully", employeeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getEmployeeListByBranchAndRole(req, res) {
  const { branchId, roleName } = req.query;

  try {
    const role = await roleModel.findOne({ roleName });
    if (!role) {
      return notFound(res, "Role not found");
    }
    const employeesList = await employeModel
      .find({ branchId, roleId: role._id })
      .populate("roleId");

    if (!employeesList || employeesList.length === 0) {
      return notFound(res, `No employees found By Branch`);
    }
    return success(res, "Employees List successfully", employeesList);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function getEmployeByBranch(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { branchId } = req.query;
    if (!branchId) {
      return badRequest(res, "Branch ID is required");
    }

    const employeDetail = await employeModel
      .find({ branchId, status: "active", onboardingStatus: "enrolled" })
      .sort({ createdAt: -1 })
      .populate("branchId");
    // .populate("roleId")
    // .populate("reportingManagerId")
    // .populate("employeeTypeId")
    // .populate("employementTypeId")
    // .populate("departmentId")
    // .populate("designationId")
    // .populate("workLocationId")
    // .populate("constCenterId")
    // .populate("employementTypeId")
    // .populate("employeeTypeId");

    // Check if employees are found
    const count = employeDetail.length;
    if (count === 0) {
      return success(res, "No employees found for the given branch ID");
    }

    // Return success with the employee data
    return success(res, `Employees List By Branch`, { count, employeDetail });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function employeeVerify(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = new ObjectId(req.Id);
    // console.log("tokenId", tokenId);

    const customerDetail = await employeModel.findById({ _id: tokenId });
    if (!customerDetail) {
      return badRequest(res, "employeeId Not Found");
    }
    const employeDetail = await employeModel.findOne({
      _id: tokenId,
      status: "active",
    });
    if (employeDetail) {
      return success(res, "Employee active", { employeDetail: true });
    } else {
      return success(res, "Employee inactive", { employeDetail: false });
    }
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function punchInVerify(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = new ObjectId(req.Id);
    const {status,message,data} = await checkIfPunchIn(tokenId)
    // console.log("tokenId", tokenId);
    return success(res, message,data);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

async function getCrmCallingEmploye(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Find the _id of the role with roleName "crmCalling"
    const role = await roleModel.findOne({ roleName: "crmCalling" });
    if (!role) {
      return badRequest(res, "Role with name 'crmCalling' not found");
    }

    const employeDetail = await employeModel
      .find({ status: "active", roleId: role._id })
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

    const count = employeDetail.length;
    success(res, "All Employes", employeDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//-----------------------------------------------------------------
async function employeeApproval(req, res) {
  try {
    const Id = req.body.Id;

    if (!Id || !mongoose.Types.ObjectId.isValid(Id)) {
      return badRequest(res, "ID is required and cannot be empty");
    }
    await employeModel.findByIdAndUpdate(
      { _id: Id },
      { onboardingStatus: "enrolled" },
      { new: true }
    );

    success(res, "Employee Onboarded Successfully");
  } catch (error) {
    unknownError(res, error);
  }
}

async function updateRoleData(req, res) {
  try {
    const data = await employeModel.updateMany(
      { roleId: { $ne: [] } }, // Ensure roleId is not already an array
      [
        {
          $set: {
            roleId: {
              $cond: {
                if: { $isArray: "$roleId" },
                then: "$roleId", // If it's already an array, leave it as is
                else: [{ $toObjectId: "$roleId" }], // Convert roleId to an array of ObjectId
              },
            },
          },
        },
      ]
    );

    success(res, "EMploye Data update RoleId", data.length);
  } catch (error) {
    unknownError(res, error);
  }
}
//------------------------------------------------------------------
async function updateEmployeeSheet(req, res) {
  try {
    console.log(req.body._id);
    const { data } = req.body;

    console.log("data---------------------->>>>>>> ", data);

    const validFields = [
      "employeUniqueId",
      "employeName",
      "userName",
      "email",
      "workEmail",
      "mobileNo",
      "joiningDate",
      "dateOfBirth",
      "fatherName",
      "motherName",
      "fathersOccupation",
      "fathersMobileNo",
      "mothersMobileNo",
      "familyIncome",
      "gender",
      "salutation",
      "maritalStatus",
      "package",
      "nameAsPerBank",
      "bankName",
      "bankAccount",
      "ifscCode",
      "highestQualification",
      "currentDesignation",
      "startDate",
      "endDate",
      "totalExperience",
      "currentCTC",
      "university",
      "lastOrganization",
      "currentAddress",
      "currentAddressCity",
      "currentAddressState",
      "currentAddressPincode",
      "permanentAddress",
      "permanentAddressCity",
      "permanentAddressState",
      "permanentAddressPincode",
      "referedById",
      "subDepartmentId",
      "uanNumber",
      "esicNumber",
      "company",
      "secondaryDepartmentId",
      "seconSubDepartmentId",
      "roleId",
      "reportingManagerId",
      "departmentId",
      "designationId",
      "workLocationId",
      "constCenterId",
      "employementTypeId",
      "employeeTypeId",
      "location",
      "websiteListing",
      "onboardingStatus",
      "status",
      "EMPLOYEE_TARGET",
    ];

    const updateFields = {};
    updateFields["updatedFrom"] = "sheet";
    for (let key in data) {
      if (
        validFields.includes(key) &&
        data[key] !== undefined &&
        data[key] !== null
      ) {
        updateFields[key] = data[key];
      }
    }

    //id check in resoective model
    if (data.BRANCHID) {
      let branch = await branchModel.findOne({ name: data.BRANCHID });

      if (branch) {
        updateFields["branchId"] = branch._id;
      }
    }

    // id check in empluee target//


        // ✅ Updating Employee Target correctly
        if (Array.isArray(data.EMPLOYEE_TARGET)) {
          updateFields["employeeTarget"] = data.EMPLOYEE_TARGET.map(target => ({
            title: typeof target.title == "string" ? target.title.trim() : "",
            value: target.value !== undefined && target.value !== null 
              ? String(target.value).trim()  // Ensures `value` is always a string
              : ""  
          }));
        }
        
        


    if (data.ROLEID) {
      const roleNames = data.ROLEID.split(",").map((role) => role.trim());
      const roles = await roleModel.find({ roleName: { $in: roleNames } });
      if (roles.length > 0) {
        updateFields["roleId"] = roles.map((role) => role._id);
      }
    }
    if (data.REPORTINGMANAGERID) {
      let reporting = await employeModel.findOne({
        employeName: data.REPORTINGMANAGERID,
      });

      if (reporting) {
        updateFields["reportingManagerId"] = reporting._id;
      }
    }
    if (data.DEPARTMENTID) {
      let department = await departmentModel.findOne({
        name: data.DEPARTMENTID,
      });

      if (department) {
        updateFields["departmentId"] = department._id;
      }
    }
    if (data.SUBDEPARTMENT) {
      let subdepartment = await departmentModel.findOne({
        name: data.SUBDEPARTMENT,
      });

      if (subdepartment) {
        updateFields["subDepartmentId"] = subdepartment._id;
      }
    }
    if (data.SECONDARYDEPARTMENT) {
      let secondarydepartment = await departmentModel.findOne({
        name: data.SECONDARYDEPARTMENT,
      });

      if (secondarydepartment) {
        updateFields["secondaryDepartmentId"] = secondarydepartment._id;
      }
    }
    if (data.SECONDARYSUBDEPARTMENT) {
      let role = await departmentModel.findOne({
        name: data.SECONDARYSUBDEPARTMENT,
      });

      if (role) {
        updateFields["seconSubDepartmentId"] = role._id;
      }
    }
    if (data.DESIGNATIONID) {
      let role = await designationModel.findOne({ name: data.DESIGNATIONID });

      if (role) {
        updateFields["designationId"] = role._id;
      }
    }
    if (data.WORKLOCATIONID) {
      let role = await workLocationModel.findOne({
        title: data.WORKLOCATIONID,
      });

      if (role) {
        updateFields["workLocationId"] = role._id;
      }
    }
    if (data.COSTCENTERID) {
      let role = await costCenterModel.findOne({ title: data.COSTCENTERID });

      if (role) {
        updateFields["constCenterId"] = role._id;
      }
    }
    if (data.EMPLOYMENTTYPEID) {
      let role = await employmentTypeModel.findOne({
        title: data.EMPLOYMENTTYPEID,
      });

      if (role) {
        updateFields["employementTypeId"] = role._id;
      }
    }
    if (data.EMPLOYEETYPEID) {
      let role = await employeTypeModel.findOne({ title: data.EMPLOYEETYPEID });

      if (role) {
        updateFields["employeeTypeId"] = role._id;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return badRequest(res, "No valid fields to update.");
    }

    const updatedEmployee = await employeModel.findByIdAndUpdate(
      data._id,
      updateFields,
      { new: true }
    );
    if (!updatedEmployee) {
      return badRequest(res, "Employee not found.");
    }

    success(res, "Employee updated successfully", updatedEmployee);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Employee Resignation---------------------------
async function addEmployeeResignation(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { employeeId, lastWorkingDate, resignationReason, employeeSignature,resignationType,lastWorkingDateByManager } =
      req.body;
      
    if (!employeeId && resignationType=="self" ) {
      employeeId = req.Id;
    } else {
      req.body.approvalByReportingManager = "approved";
    }
    
    let resignationApplied = await employeeResignationModel.findOne({
      employeeId: employeeId,
      approvalByReportingManager: { $in: ["approved", "active"] },
    });
    
    
    if (resignationApplied) {
      return badRequest(res, "Employee Resignation already added.");
    }

    req.body.appliedDate = new Date();
    req.body.employeeId =employeeId ;
    
    const employeedata =  await employeModel.findById(employeeId);
    if(!employeedata){
      return badRequest(res, "Employee not found");
    }
    if(!employeedata.reportingManagerId){
      return badRequest(res, "Employee has no reporting manager");
    }
    req.body.reportingManagerId =employeedata.reportingManagerId ;
     
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return badRequest(res, "Valid Employee Id is required");
    }
    if (!lastWorkingDateByManager && resignationType==="onBehalf") {
      return badRequest(res, "Employee Last Working Date by reporting manager is required");
    }
    if (!lastWorkingDate && resignationType==="self") {
      return badRequest(res, "Employee Last Working Date is required");
    }
    if (!resignationReason) {
      return badRequest(res, "Employee Resignation Reason is required");
    }
    if (!employeeSignature) {
      return badRequest(res, "Employee Employee Signature is required");
    }
    if(lastWorkingDateByManager){
      req.body.lastWorkingDateByManager = new Date(req.body.lastWorkingDateByManager);
    }
    if(lastWorkingDate){
      req.body.lastWorkingDate = new Date(req.body.lastWorkingDate);
    }
    const resignation = await employeeResignationModel.create(req.body);

    success(res, "Employee Resignation Added sucessfully", resignation);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//-------------------get employee resignation data------------------
async function getAllEmployeeResignation(req, res) {
  try {
    const employeeResignation = await employeeResignationModel.find({
      status:"active"
    })
    .populate("employeeId")
    .populate({ path: "reportingManagerId", select: " employeName" });

    // Return the response
    success(res, "Employee resignation all data", employeeResignation);
  
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//-------------------get employee resignation data------------------
async function getEmployeeResignationForRM(req, res) {
  try {
    const employeeResignation = await employeeResignationModel.find({
      status:"active"
    })
    .populate("employeeId")
    .populate({ path: "reportingManagerId", select: " employeName" });

    // Return the response
    success(res, "Employee resignation all data", employeeResignation);
  
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//----------------------- action on resignation by rm-----------------
async function employeeResignationAction(req, res) {
  try {
    let { resignationId,lastWorkingDateByManager,reasonByReportingManager} = req.body;

    if (!mongoose.Types.ObjectId.isValid(resignationId)) {
      return badRequest(res, "Valid Resignation Id is required");
    }

    const validModes = ["approved", "notApproved"];
    if (!validModes.includes(req.body.approvalByReportingManager)) {
      return badRequest(res, "Action must be approved or notApproved");
    }

    if(req.body.approvalByReportingManager && req.body.approvalByReportingManager=="approved"){
      const UpdateDate = await employeeResignationModel.findByIdAndUpdate({ _id: resignationId }, { lastWorkingDateByManager: req.body.lastWorkingDateByManager }, { new: true });
      console.log(UpdateDate);
    }
    if (!lastWorkingDateByManager) {
      return badRequest(res, "Employee Last Working Date by reporting manager is required");
    }
    if (!reasonByReportingManager) {
      return badRequest(res, "Reason by reporting manager is required");
    }
    
    req.body.lastWorkingDateByManager = new Date(req.body.lastWorkingDateByManager);
    const updatedEmployeeResignation = await employeeResignationModel.findByIdAndUpdate(
      resignationId,
      req.body,
      { new: true }
    );
    // Return the response
    success(res, "Employee resignation action performed", updatedEmployeeResignation);
  
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


async function getEmployeeWorkingUnder(req, res) {
  try {
    const employeeUnder = await employeModel.find({
      reportingManagerId: req.Id,
      status:"active"
    }).select("employeName");

    // Return the response
    success(res, "Employee working under", employeeUnder);
  
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//-------------------get employee working under him - he is reporting manager of whom
async function createRelivingPdf(req, res) {
  try {
    const employeeId= req.query.employeeId;
    console.log(employeeId);
    const resignationDetails = await employeeResignationModel.findOne({
      employeeId:employeeId,
    });
    if(!resignationDetails){
      return badRequest(res, "Resignation Details not found");
    }
    if(!resignationDetails.lastWorkingDateByManager){
      return badRequest(res, "Resignation Details doesn not have last working date");
    }
    
    const employeeDetails = await employeModel.findById(employeeId)
    .populate({ path: "branchId", select: " name" })
    .populate({ path: "designationId", select: " name" });

    if(!employeeDetails.joiningDate){
      return badRequest(res, "Employee Details doesn not have joining date");
    }
    // console.log(employeeDetails)
    if(!employeeDetails){
      return badRequest(res, "Employee not found");
    }
    const pdfPath = await relievingPDF(
      employeeDetails,
      resignationDetails
    );
    console.log("http://localhost:5500" + pdfPath);

    await employeModel.findByIdAndUpdate(
      { _id: employeeId },
      { relievingLetterFincooper:pdfPath  },
      { new: true }
    );
    success(res, "PDF generated successfully", pdfPath);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function createExperienceLetterPdf(req, res) {
  try {

    const employeeId= req.query.employeeId;
    console.log(employeeId);
    const resignationDetails = await employeeResignationModel.find({
      employeeId:employeeId,
    });
    if(!resignationDetails){
      return badRequest(res, "Resignation Details not found");
    }
    const employeeDetails = await employeModel.findById(employeeId)
    .populate({ path: "branchId", select: " name" })
    .populate({ path: "designationId", select: " name" });
    // console.log(employeeDetails)
    if(!employeeDetails){
      return badRequest(res, "Employee not found");
    }
    const pdfPath = await experienceLetterPDF(
      employeeDetails,
      resignationDetails
    );
    console.log("http://localhost:5500" + pdfPath);
    await employeModel.findByIdAndUpdate(
      { _id: employeeId },
      { experienceLetterFincooper:pdfPath  },
      { new: true }
    );
    success(res, "PDF generated successfully", pdfPath);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------action on approve and reject by admin / hod / account // ---------------------------------------

async function employeeApprovalandReject(req, res) {
  try {
    const employeeId = req.Id;
    const { resignationId, Approval_Status , Remarks} = req.body;
    if (!employeeId) {
      return badRequest(res, "Employee ID is required");
    }
   const resignation = await employeeResignationModel.findById(resignationId);

   if (!resignation) {
     return badRequest(res, "Employee Resignation not found");
   }
     if (
      resignation.adminApproval_Status == Approval_Status ||
      resignation.HodApproval_status == Approval_Status ||
      resignation.accountApproval_status == Approval_Status
    ) {
      return badRequest(res, `Some other authority has already ${Approval_Status} this resignation.`);
    }
  
    // Validate roles and update approval status based on role
    let updateFields = {};
    if (req.roleName.includes("admin")) {
      updateFields = {
        adminApproval_id: employeeId,
        adminApproval_Status: Approval_Status,
        admin_Remarks: Remarks,
      };
    } else if (req.roleName.includes("hod")) {
      updateFields = {
        HodApproval_id: employeeId,
        HodApproval_status: Approval_Status,
        Hod_Remarks: Remarks,
      };
    } else if (req.roleName.includes("account")) {
      updateFields = {
        accountApproval_id: employeeId,
        accountApproval_status: Approval_Status,
        account_Remarks: Remarks,
      };
    } else {
      return badRequest(res, "Unauthorized role for approval/rejection" );
    }

    // Find and update the employee resignation
    const updatedEmployee = await employeeResignationModel.findOneAndUpdate(
      { _id: resignationId },
      { $set: updateFields },
      { new: true }
    );

    // Check if the employee resignation exists
    if (!updatedEmployee) {
      return badRequest(res, "Employee Resignation not found");
    }

    // Success response
    return success(
      res,
      `Employee Resignation ${Approval_Status} by ${req.roleName} successfully`,
      updatedEmployee
    );
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// -------------- get api to fetch the reportingmanger approval -------------

async function getApprovedEmployeeResignations(req, res) {
  try {
    const approvedResignations = await employeeResignationModel.find({
      status: "active",
      approvalByReportingManager: "approved",
    })
    .sort({ createdAt: -1 })
      .populate("employeeId") 
      .populate("reportingManagerId", "employeName")
      .populate("adminApproval_id", "employeName")
      .populate("HodApproval_id", "employeName")
      .populate("accountApproval_id", "employeName")
      .populate({
        path: "employeeId",
        populate: {
          path: "departmentId"
        }
      });

      

    if (approvedResignations.length === 0) {
      return badRequest(res, "No approved resignations found");
    }

    // Return the response with the found resignations
    return success(res, "Approved Employee Resignations fetched successfully", approvedResignations);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


// make a function to get all the employees who has gpot the approval //
async function getEmployeeHierarchy(req, res) {
  try {
      const { employeeId } = req.query;

      if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
          return badRequest(res, "Valid Employee ID is required");
      }

      // Get initial employee
      const employee = await employeModel.findById(
          employeeId,
          {
            _id:1,
              employeName: 1,
              employeUniqueId: 1,
              reportingManagerId: 1,
              currentDesignation: 1
          }
      ).lean();

      if (!employee) {
          return notFound(res, "Employee not found");
      }

      // Initialize response object with employee details
      const hierarchyData = {
          employee: {
              _id: employee._id,
              name: employee.employeName,
              employeeUniqueId: employee.employeUniqueId,
              designation: employee.currentDesignation || ""
          }
      };

      let currentManagerId = employee.reportingManagerId;
      let level = 1;
      const MAX_LEVELS = 10;

      // Loop through reporting managers up to MAX_LEVELS
      while (currentManagerId && level <= MAX_LEVELS && mongoose.isValidObjectId(currentManagerId)) {
          const manager = await employeModel.findById(
              currentManagerId,
              {
                  _id:1,
                  employeName: 1,
                  employeUniqueId: 1,
                  reportingManagerId: 1,
                  currentDesignation: 1
              }
          ).lean();

          if (!manager) {
              break;
          }

          // Add manager to hierarchy
          hierarchyData[`reportingPerson${level}`] = {
              _id: employee._id,
              name: manager.employeName,
              employeeUniqueId: manager.employeUniqueId,
              designation: manager.currentDesignation || ""
          };

          // Move to next manager
          currentManagerId = manager.reportingManagerId;
          level++;
      }

      return success(res, "Hierarchy details retrieved successfully", hierarchyData);

  } catch (error) {
      console.error("Error in getEmployeeHierarchy:", error);
      return unknownError(res, error);
  }
}

async function getEmployeeTrackingConfig(req, res) {
  try {
    const { id } = req.params;

    const employeeData = await employeModel.findById(id).select("shouldTrack trackingInterval")

    return success(res, "Employee Tracking Config", employeeData);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


async function changeEmployeeTrackingConfig(req, res) {
  try {
    const { id } = req.params;
    const {shouldTrack , trackingInterval} = req.body
    const employeeData = await employeModel.findByIdAndUpdate(id,{shouldTrack , trackingInterval})


    return success(res, "Employee Tracking Config", employeeData);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

// --------- EMPLOYEE HIeRARCHY TREE STRUCTURE LIST API ------------------
async function employeeTreeHierarchy(req, res) {
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

// ------------COLLECTION MANAGER LIST-----------------------
async function getCollectionManagerList(req, res) {
  try {
    // Get collection role ID
    const collectionRole = await roleModel.findOne({ roleName: "collection" });
    if (!collectionRole) {
      return notFound(res, "Collection role not found");
    }

    // Get employees with "collection" role
    const collectionEmployees = await employeModel.find(
      {
        roleId: collectionRole._id,
        status: "active",
        reportingManagerId: { $ne: null } // ensure managerId exists
      },
      {
        reportingManagerId: 1
      }
    ).lean();

    if (!collectionEmployees.length) {
      return notFound(res, "No collection employees found", []);
    }

    // Extract unique reportingManagerIds
    const managerIds = [...new Set(collectionEmployees.map(emp => emp.reportingManagerId.toString()))];

    // Fetch manager details
    const managers = await employeModel.find(
      { _id: { $in: managerIds } },
      {
        _id: 1,
        employeName: 1,
        employeUniqueId: 1,
        employeePhoto: 1
      }
    );

    return success(res, "Collection managers retrieved successfully", managers);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function createMailSwitches(req, res) {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      return badRequest(res, "Invalid request body.");
    }

    const existing = await mailSwitchesModel.findOne();

    let result;
    if (existing) {
      // Update the existing mail switch configuration
      result = await mailSwitchesModel.findByIdAndUpdate(existing._id, body, { new: true });
      success(res, "Mail switches updated successfully", result);
    } else {
      // Create a new configuration (first-time only)
      result = await mailSwitchesModel.create(body);
      success(res, "Mail switches created successfully", result);
    }
  } catch (error) {
    unknownError(res, error);
  }
}




// Get Mail Switches
async function getMailSwitches(req, res) {
  try {
    const config = await mailSwitchesModel.findOne();
    if (!config) {
      return badRequest(res, "No mail switch found.");
    }

    const formattedResponse = {
      masterMailStatus: true,
      loginMail: config.loginMail,
      loginMailDetails: {
        todayLoginCompleteMail: config.todayLoginCompleteMail,
      },
      cibilMail: config.cibilMail,
      cibilMailDetails: {
        todayCibilQueryMail: config.todayCibilQueryMail,
        cibilSubmitTimeMailSend: config.cibilSubmitTimeMailSend,
        checkCibilPendingFileMailSendMorning: config.checkCibilPendingFileMailSendMorning,
        checkCibilPendingFileMailSendAfternoon: config.checkCibilPendingFileMailSendAfternoon,
      },
      pdMail: config.pdMail,
      pdMailDetails: {
        mailSendCustomerPdDone: config.mailSendCustomerPdDone,
        pdNotCompleteFilesMailFunctionMorning: config.pdNotCompleteFilesMailFunctionMorning,
        pdNotCompleteFilesMailFunctionAfternoon: config.pdNotCompleteFilesMailFunctionAfternoon,
        pdNotCompleteFilesMailFunctionEvening: config.pdNotCompleteFilesMailFunctionEvening,
      },
      vendorMail: config.vendorMail,
      vendorMailDetails: {
        rcuAssignMail: config.rcuAssignMail,
        legalAssignMail: config.legalAssignMail,
        legalFiAssignMail: config.legalFiAssignMail,
        technicalAssignMail: config.technicalAssignMail,
        rmTaggingAssignMail: config.rmTaggingAssignMail,
        vendorApproveForLoginMail: config.vendorApproveForLoginMail,
        sendPendingVendorEmailsAfternoon: config.sendPendingVendorEmailsAfternoon,
        sendPendingVendorEmailsEvening: config.sendPendingVendorEmailsEvening,
        mailSendVendorLoginCredentials: config.mailSendVendorLoginCredentials,
      },
      newFileManagementMail: config.newFileManagementMail,
      newFileManagementMailDetails: {
        sanctionSubmissionMail: config.sanctionSubmissionMail,
      },
      collectionMail: config.collectionMail,
      collectionMailDetails: {
        collectionVisitMailMorning: config.collectionVisitMailMorning,
        collectionVisitMailAfterNoon: config.collectionVisitMailAfterNoon,
        collectionVisitMailEvening: config.collectionVisitMailEvening,
        collectionTargetIncompleteMailMorning: config.collectionTargetIncompleteMailMorning,
        collectionTargetIncompleteMailAfterNoon: config.collectionTargetIncompleteMailAfterNoon,
        collectionTargetIncompleteMailEvening: config.collectionTargetIncompleteMailEvening,
        collectionZeroVisitEmiWarningsMailMorning: config.collectionZeroVisitEmiWarningsMailMorning,
        collectionZeroVisitEmiWarningsMailAfterNoon: config.collectionZeroVisitEmiWarningsMailAfterNoon,
        collectionZeroVisitEmiWarningsMailEvening: config.collectionZeroVisitEmiWarningsMailEvening,
        collectionRevisitRemindersMailMorning: config.collectionRevisitRemindersMailMorning,
        collectionRevisitRemindersMailAfterNoon: config.collectionRevisitRemindersMailAfterNoon,
        collectionRevisitRemindersMailEvening: config.collectionRevisitRemindersMailEvening,
        collectionPatnerWiseMailMorning: config.collectionPatnerWiseMailMorning,
        collectionPatnerWiseMailAfterNoon: config.collectionPatnerWiseMailAfterNoon,
        collectionPatnerWiseMailEvening: config.collectionPatnerWiseMailEvening,
      },
      hrmsMail: config.hrmsMail,
      hrmsMailDetails: {
        // Add fields if any for HRMS later
      },
    };

    success(res, "Mail switch Details", formattedResponse);
  } catch (error) {
    unknownError(res, error);
  }
}


module.exports = {
  employeAdd,
  employeActiveOrInactive,
  getEmployeeTrackingConfig,
  changeEmployeeTrackingConfig,
  updateEmployee,
  getAllEmploye,
  getAllInactiveEmployee,
  getAllEmployeeSheet,
  getAllEmployeForWebsite,
  deleteEmployee,
  getEmployeeById,
  getAllEmployeByRole,
  getHoDashboard,
  getHoDashboardinGrid,
  employeeAllDetails,
  getFilteredEmployeForWebsite,
  getEmployeeListByBranchAndRole,
  getEmployeByBranch,
  employeeVerify,
  getCrmCallingEmploye,
  getCollectionManagerList,
  getEmployeeByToken,
  getAllJoiningEmployee,
  employeeApproval,
  updateRoleData,
  updateEmployeeSheet,
  getNewJoineeEmployee,
  updateEmployeePhoto,
  addEmployeeResignation,
  getApprovedEmployeeResignations,
  employeeApprovalandReject,
  getEmployeeWorkingUnder,
  getAllEmployeeResignation,
  getEmployeeResignationForRM,
  employeeResignationAction,
  createRelivingPdf,
  getEmployeeHierarchalDropDown,
  createExperienceLetterPdf,
  getEmployeeHierarchy,
  punchInVerify,
  employeeTreeHierarchy,
  createMailSwitches,
  getMailSwitches,
};
