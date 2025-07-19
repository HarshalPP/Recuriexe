const formateDepartmentForAdd = (bodyData) => {
    let { name, isSubDepartment, departmentId } = bodyData
    if (!isSubDepartment) {
        departmentId = null
    }
    return { name, isSubDepartment, departmentId }
}

const formateDepartmentForUpdate = (bodyData) => {
    let { name, isSubDepartment, departmentId } = bodyData
    if (!isSubDepartment) {
        departmentId = null
    }
    return { name, isSubDepartment, departmentId }
}

module.exports = {
    formateDepartmentForAdd,
    formateDepartmentForUpdate
}