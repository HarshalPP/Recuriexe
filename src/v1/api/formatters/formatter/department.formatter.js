// export const formateDepartmentForAdd = (bodyData) => {
//     let { name, isSubDepartment, departmentId } = bodyData;
//     if (!isSubDepartment) {
//       departmentId = null;
//     }
//     return { name, isSubDepartment, departmentId };
//   };
  
//   export const formateDepartmentForUpdate = (bodyData) => {
//     let { name, isSubDepartment, departmentId } = bodyData;
//     if (!isSubDepartment) {
//       departmentId = null;
//     }
//     return { name, isSubDepartment, departmentId };
//   };
  


export const formatDepartmentDataForAdd = (bodyData) => {
  const { name, subDepartments = [] } = bodyData;

  // Clean and prepare subDepartments array (if provided)
  const formattedSubDepartments = subDepartments.map((subDept) => ({
    name: subDept.name?.trim(),
    isActive: subDept.isActive !== false, // default to true
  }));

  return {
    name: name?.trim(),
    subDepartments: formattedSubDepartments
  };
};

export const formatDepartmentDataForUpdate = (bodyData) => {
  const { name, subDepartments = [] } = bodyData;

  const formattedSubDepartments = subDepartments.map((subDept) => ({
    name: subDept.name?.trim(),
    isActive: subDept.isActive !== false,
  }));

  return {
    ...(name && { name: name.trim() }),
    ...(subDepartments.length > 0 && { subDepartments: formattedSubDepartments })
  };
};
