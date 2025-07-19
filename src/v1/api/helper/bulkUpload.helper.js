const csv = require('csvtojson');

const mongoose = require('mongoose');

// Assuming you have the models set up for each type
const Company = require('../model/adminMaster/company.model');
const Branch = require('../model/adminMaster/branch.model');
const WorkLocation = require('../model/adminMaster/workLocation.model');
const Department = require('../model/adminMaster/department.model');
const Designation = require('../model/adminMaster/designation.model');
const Employee = require('../model/adminMaster/employe.model');
const bcrypt = require("bcrypt");

async function processHierarchy(data, parentIds = {}) {
    for (const item of data) {
        let model, document;

        switch (item.type) {
            case 'company':
                model = Company;
                document = new model({ companyName: item.title });
                break;
            case 'branch':
                model = Branch;
                document = new model({
                    branch: item.title,
                    companyId: parentIds.companyId,
                    location: {
                        type: "Point",
                        coordinates: [0, 0]
                    },
                });
                break;
            case 'workLocation':
                model = WorkLocation;
                document = new model({
                    title: item.title,
                    companyId: parentIds.companyId,
                    branchId: parentIds.branchId,
                    location: {
                        type: "Point",
                        coordinates: [0, 0]
                    },
                });
                break;
            case 'department':
                model = Department;
                document = new model({
                    departmentName: item.title,
                    companyId: parentIds.companyId,
                    branchId: parentIds.branchId,
                    workLocationId: parentIds.workLocationId
                });
                break;
            case 'designation':
                model = Designation;
                document = new model({
                    designationName: item.title,
                    companyId: parentIds.companyId,
                    branchId: parentIds.branchId,
                    workLocationId: parentIds.workLocationId,
                    departmentId: parentIds.departmentId
                });
                break;
            case 'employee':
                model = Employee;
                document = new model({
                    ...item,
                    companyId: parentIds.companyId,
                    branchId: parentIds.branchId,
                    workLocationId: parentIds.workLocationId,
                    departmentId: parentIds.departmentId,
                    designationId: parentIds.designationId
                });
                break;
        }

        if (document) {
            await document.save();
            console.log(`Saved ${item.type}: ${item.title || item.employeName}`);

            if (item.data && item.data.length > 0) {
                const newParentIds = {
                    ...parentIds,
                    [`${item.type}Id`]: document._id
                };
                await processHierarchy(item.data, newParentIds);
            }
        }
    }
}


async function structureData(csvString) {
    // Parse CSV to JSON
    const jsonArray = await csv().fromString(csvString);

    const result = [];

    // Helper function to get or create nested object
    function getOrCreateNested(array, key, value) {
        let found = array.find(item => item.title === value && item.type === key);
        if (!found) {
            found = { type: key, title: value, data: [] };
            array.push(found);
        }
        return found;
    }

    jsonArray.forEach(async obj => {
        const company = getOrCreateNested(result, 'company', obj.companyId);
        const branch = getOrCreateNested(company.data, 'branch', obj.branchId);
        const workLocation = getOrCreateNested(branch.data, 'workLocation', obj.workLocationId);
        const department = getOrCreateNested(workLocation.data, 'department', obj.departmentId);
        const designation = getOrCreateNested(department.data, 'designation', obj.designationId);
        const salt = await bcrypt.genSalt(10);
        const encPass = await bcrypt.hash(obj.password, salt)
        // Add employee data
        designation.data.push({
            type: 'employee',
            employeName: obj.employeName,
            employeUniqueId: obj.employeUniqueId,
            password: encPass,
            userName: obj.userName,
            email: obj.email,
            roleId:new mongoose.Types.ObjectId(obj.roleId),
            workEmail: obj.workEmail,
            mobileNo: obj.mobileNo,
            joiningDate:new Date().getDate(),
            dateOfBirth:new Date().getDate(),
            fatherName: obj.fatherName,
            currentAddress: obj.currentAddress,
            permanentAddress: obj.permanentAddress,
        });
        
    });
    return result;
}

module.exports = {
    structureData,
    processHierarchy
}