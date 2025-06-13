// import newDepartmentModel from "../../models/deparmentModel/deparment.model.js"
// import { returnFormatter } from "../../formatters/common.formatter.js"
// // import { newDepartmentGoogleSheet } from "../controller/adminMaster/masterGoogleSheet.controller.js";
// import { formateDepartmentForAdd, formateDepartmentForUpdate } from "../../formatters/formatter/department.formatter.js"

// // Create a new department
// export const addDepartment = async (bodyData) => {
//   try {
//     const formattedData = formateDepartmentForAdd(bodyData);
//     const saveData = await newDepartmentModel.create(formattedData);
//     // await newDepartmentGoogleSheet(saveData);
//     return returnFormatter(true, "Department created successfully", saveData);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };

// // Get a department by ID
// export const getDepartmentById = async (departmentId) => {
//   try {
//     const department = await newDepartmentModel.findOne({ _id: departmentId });
//     if (!department) {
//       return returnFormatter(false, "Department not found");
//     }
//     return returnFormatter(true, "Department found", department);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };

// // Get all departments
// export const getAllDepartments = async () => {
//   try {
//     const departments = await newDepartmentModel
//       .find({})
//       .populate({ path: "departmentId", select: "name" });
//     if (departments.length === 0) {
//       return returnFormatter(false, "No departments found");
//     }
//     return returnFormatter(true, "Departments found", departments);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };

// // Get all main departments (non-sub departments)
// export const getAllMainDepartments = async () => {
//   try {
//     const departments = await newDepartmentModel.find({
//       isSubDepartment: false,
//     });
//     if (departments.length === 0) {
//       return returnFormatter(false, "No departments found");
//     }
//     return returnFormatter(true, "Departments found", departments);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };

// // Update a department
// export const updateDepartment = async (departmentId, updateData) => {
//   try {
//     const formattedData = formateDepartmentForUpdate(updateData);
//     const updatedDepartment = await newDepartmentModel.findOneAndUpdate(
//       { _id: departmentId },
//       formattedData,
//       { new: true }
//     );
//     if (!updatedDepartment) {
//       return returnFormatter(false, "Department not found");
//     }
//     // await newDepartmentGoogleSheet(updatedDepartment);

//     return returnFormatter(
//       true,
//       "Department updated successfully",
//       updatedDepartment
//     );
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };

// // Deactivate a department (soft delete)
// export const deactivateDepartment = async (departmentId) => {
//   try {
//     const deactivatedDepartment = await newDepartmentModel.findOneAndUpdate(
//       { _id: departmentId },
//       { isActive: false },
//       { new: true }
//     );
//     if (!deactivatedDepartment) {
//       return returnFormatter(false, "Department not found");
//     }
//     return returnFormatter(
//       true,
//       "Department deactivated",
//       deactivatedDepartment
//     );
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };

// // Get all sub-departments by parent departmentId
// export const getSubDepartmentsByDepartmentId = async (departmentId) => {
//   try {
//     const subDepartments = await newDepartmentModel.find({ departmentId });
//     if (subDepartments.length === 0) {
//       return returnFormatter(false, "No sub-departments found");
//     }
//     return returnFormatter(true, "Sub-departments found", subDepartments);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// };


import newDepartmentModel from "../../models/deparmentModel/deparment.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js";

// ----------------- Create Department with Sub-Departments ----------------- //

export const addDepartment = async (bodyData) => {
  try {
    const data = await newDepartmentModel.findOne({name: bodyData.name})
    // if(data){
    // return returnFormatter(false, "Department name is already exist");
    // }
    const saveData = await newDepartmentModel.create(bodyData);
    return returnFormatter(true, "Department created successfully", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

// ----------------- Get Department By ID ----------------- //
export const getDepartmentById = async (departmentId) => {
  try {
    const department = await newDepartmentModel.findById(departmentId);
    if (!department) {
      return returnFormatter(false, "Department not found");
    }
    return returnFormatter(true, "Department found", department);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

// ----------------- Get All Departments ----------------- //


export const getnewdepartment = async (req) => {
  try {
    const organizationId = req.employee.organizationId;
    const departments = await newDepartmentModel.find({organizationId})
      .populate({path:'createdBy' , select:'employeName'})
    // if (departments.length === 0) {
    //   return returnFormatter(false, "No departments found");
    // }
    return returnFormatter(true, "Departments found", departments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

export const getnewdepartmentByToken = async (req) => {
  try {
    const organizationId = req.query.organizationId;
    // console.log("organizationId", organizationId)
    const departments = await newDepartmentModel.find({organizationId})
      .populate({path:'createdBy' , select:'employeName'})
    // if (departments.length === 0) {
    //   return returnFormatter(false, "No departments found");
    // }
    return returnFormatter(true, "Departments found", departments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

export const getAllDepartments = async (req) => {
  try {
    const organizationId = req.employee.organizationId;
    const departments = await newDepartmentModel.find({ organizationId })
      .populate({ path: "createdBy", select: "employeName" });

    if (departments.length === 0) {
      return returnFormatter(false, "No departments found");
    }


    // Flatten sub-departments
    const result = departments.flatMap((dept) => {
      if (!dept.subDepartments || dept.subDepartments.length === 0) {
        return [{ departmentId: dept._id, departmentName: dept.name, isSubDepartment: false }];
      }
      

      return dept.subDepartments.map((sub) => ({
        departmentId: dept._id,
        departmentName: dept.name,
        subDepartmentId: sub._id,
        subDepartmentName: sub.name,
        isSubDepartment: true,
        isActive: sub.isActive,
        createdAt: dept.createdAt,
      }));
    });

    return returnFormatter(true, "Departments with sub-departments", result);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


export const departmentDropDown = async (req) => {
  try {
    const organizationId = req.employee.organizationId;
    const departments = await newDepartmentModel.find({ organizationId }).select('name')

    return returnFormatter(true, "Departments Drop DOwn", departments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


export const Activeeparment = async () => {
  try {
    const departments = await newDepartmentModel.find({isActive:true})
    .sort({createdAt:-1})
    if (departments.length === 0) {
      return returnFormatter(false, "No departments found");
    }
    return returnFormatter(true, "Departments found", departments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

// ----------------- Get All Main Departments (with at least one subDepartment) ----------------- //
export const getAllMainDepartments = async () => {
  try {
    const departments = await newDepartmentModel.find({ subDepartments: { $exists: true, $not: { $size: 0 } } });
    if (departments.length === 0) {
      return returnFormatter(false, "No main departments found");
    }
    return returnFormatter(true, "Main departments found", departments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

// ----------------- Update Department ----------------- //
export const updateDepartment = async (departmentId, updateData) => {
  console.log("departmentId" , departmentId)
  console.log("updateData" , updateData)
  try {
    const updatedDepartment = await newDepartmentModel.findByIdAndUpdate(
      departmentId,
      updateData,
      { new: true }
    );
    if (!updatedDepartment) {
      return returnFormatter(false, "Department not found");
    }
    return returnFormatter(true, "Department updated successfully", updatedDepartment);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

// ----------------- Deactivate Department (Soft Delete) ----------------- //
export const deactivateDepartment = async (departmentId) => {
  try {
    const deactivatedDepartment = await newDepartmentModel.findByIdAndUpdate(
      departmentId,
      { isActive: false },
      { new: true }
    );
    if (!deactivatedDepartment) {
      return returnFormatter(false, "Department not found");
    }
    return returnFormatter(true, "Department deactivated", deactivatedDepartment);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

// ----------------- Get Sub-Departments From Department Document ----------------- //
export const getSubDepartmentsByDepartmentId = async (departmentId) => {
  try {
    const department = await newDepartmentModel.findById(departmentId);
    if (!department || !department.subDepartments || department.subDepartments.length === 0) {
      return returnFormatter(false, "No sub-departments found");
    }
    return returnFormatter(true, "Sub-departments found", department.subDepartments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


export const getDepartmentCandidantSides = async (req) => {
  try {
    const departments = await newDepartmentModel.find({})
      .populate({path:'createdBy' , select:'employeName'})
    if (departments.length === 0) {
      return returnFormatter(false, "No departments found");
    }
    return returnFormatter(true, "Departments found", departments);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};