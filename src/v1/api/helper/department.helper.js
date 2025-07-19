const newDepartmentModel = require("../model/adminMaster/newDepartment.model");
const { returnFormatter } = require("../formatter/common.formatter");
const {
  newDepartmentGoogleSheet,
} = require("../controller/adminMaster/masterGoogleSheet.controller");

const {formateDepartmentForAdd,formateDepartmentForUpdate} = require('../formatter/department.formatter')
// Create a new department
async function addDepartment(bodyData) {
  try {
    const formattedData = formateDepartmentForAdd (bodyData)
    const saveData = await newDepartmentModel.create(formattedData);
    await newDepartmentGoogleSheet(saveData);
    return returnFormatter(true, "Department created successfully", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get a department by ID
async function getDepartmentById(departmentId) {
  try {
    const department = await newDepartmentModel.findOne({ _id: departmentId });
    if (!department) {
      return returnFormatter(false, "Department not found");
    }
    return returnFormatter(true, "Department found", department);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get all departments
// async function getAllDepartments() {
//     try {
//         const departments = await newDepartmentModel.find({}).populate({ path: 'departmentId', select: ' name' });
//         if (departments.length === 0) {
//             return returnFormatter(false, "No departments found");
//         }
//         return returnFormatter(true, "Departments found", departments);
//     } catch (error) {
//         return returnFormatter(false, error.message);
//     }
//     return returnFormatter(true, "Departments found", departments);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// }
async function getAllDepartments() {
  try {
    const departments = await newDepartmentModel
      .find({})
      .populate({ path: "departmentId", select: " name" });
    if (departments.length === 0) {
      return returnFormatter(false, "No departments found");
    }
    return returnFormatter(true, "Departments found", departments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function getAllMainDepartments() {
  try {
    const departments = await newDepartmentModel.find({
      isSubDepartment: false,
    });
    if (departments.length === 0) {
      return returnFormatter(false, "No departments found");
    }
    return returnFormatter(true, "Departments found", departments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Update a department
async function updateDepartment(departmentId, updateData) {
  try {
    const formattedData = formateDepartmentForUpdate(updateData)
    const updatedDepartment = await newDepartmentModel.findOneAndUpdate(
      { _id: departmentId },
      formattedData,
      { new: true }
    );
    if (!updatedDepartment) {
      return returnFormatter(false, "Department not found");
    }
    await newDepartmentGoogleSheet(updatedDepartment);

    return returnFormatter(
      true,
      "Department updated successfully",
      updatedDepartment
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Deactivate a department (soft delete)
async function deactivateDepartment(departmentId) {
  try {
    const deactivatedDepartment = await newDepartmentModel.findOneAndUpdate(
      { _id: departmentId },
      { isActive: false },
      { new: true }
    );
    if (!deactivatedDepartment) {
      return returnFormatter(false, "Department not found");
    }
    return returnFormatter(
      true,
      "Department deactivated",
      deactivatedDepartment
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get all sub-departments by parent departmentId
async function getSubDepartmentsByDepartmentId(departmentId) {
  try {
    const subDepartments = await newDepartmentModel.find({ departmentId });
    if (subDepartments.length === 0) {
      return returnFormatter(false, "No sub-departments found");
    }
    return returnFormatter(true, "Sub-departments found", subDepartments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

module.exports = {
  addDepartment,
  getDepartmentById,
  getAllDepartments,
  updateDepartment,
  deactivateDepartment,
  getSubDepartmentsByDepartmentId,
  getAllMainDepartments,
};
