import branchTypeModel from "../../models/masterDropDownModel/branchType.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js";
import { formatBranchType } from "../../formatters/masterDropDown/branchType.formatter.js";
import employeeModel from "../../models/employeemodel/employee.model.js";
import subdropDownModel from "../../models/masterDropDownModel/masterDropDownValue.model.js";

import { ObjectId } from "mongodb";

// import industryType from "../../models/masterDropDownModel/organizationType.model.js"
// Add
export async function addBranchType(req) {
  try {
    const { name } = req.body;
const employeeId = req.employee.id
    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }
    if (!name) return returnFormatter(false, "Name is required.");

    const existing = await branchTypeModel.findOne({ name });
    if (existing) return returnFormatter(false, "BranchType already exists.");

    const newIndustry = await branchTypeModel.create(formatBranchType(req , employeeId));
    return returnFormatter(true, "BranchType created successfully.", newIndustry);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get All
export async function getBranchTypeList(req) {
  try {
    const {status} = req.query
    if(!status){
       return returnFormatter(false, "Status is required.");
    }
    const list = await branchTypeModel.find({status:status}).populate('createdBy','employeName employeUniqueId').sort({ name: 1 });
    
    return returnFormatter(true, "BranchType list", list);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get By ID
export async function getBranchTypeById(req) {
  try {
    const { id } = req.query;

    if (!id) return returnFormatter(false, "Branch ID is required");

    const data = await branchTypeModel.findById(id).populate('createdBy','employeName employeUniqueId');;
    if (!data) return returnFormatter(false, "BranchType not found.");
    return returnFormatter(true, "BranchType details", data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


// avtive inactve
export async function activeAndInactiveBranchTypeById(req) {
  try {
    const { id , status } = req.query;

    if (!id) return returnFormatter(false, "Branch ID is required");

    if(!status){
      return returnFormatter(false, "status is required");
    }
    const data = await branchTypeModel.findByIdAndUpdate(id, {status:status}, {
        new: true,
      })

    if (!data) return returnFormatter(false, "BranchType not found.");

    return returnFormatter(true, `Branch Type ${status}`, data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


// Update
export async function updateBranchTypeById(req) {
  try {
    const { id } = req.body;

    const employeeId = req.employee.id
    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }

    if (!id) return returnFormatter(false, "branch ID is required");
    const updateData = formatBranchType(req);

    const existing = await branchTypeModel.findOne({ name: updateData.name, _id: { $ne: id } });
    if (existing) return returnFormatter(false, "Name already exists.");

    const updated = await branchTypeModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return returnFormatter(false, "BranchType not found.");
    return returnFormatter(true, "BranchType updated.", updated);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Dropdown
export async function branchTypeDropdown() {
  try {
    const list = await branchTypeModel.find({ status: "active" }).select("name _id");
       const sortedList = list
      .map(item => ({ name: item.name.trim() ,_id:item._id})) // Trim whitespace
      .sort((a, b) => a.name.localeCompare(b.name))

    return returnFormatter(true, "BranchType dropdown list.", sortedList);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// master dron down bulk data add 

const sectors = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "CHF",
  "SGD",
  "NZD",
  "ZAR",
  "AED",
  "SAR",
  "HKD",
  "SEK",
  "NOK",
  "DKK",
  "THB",
  "MYR",
  "KRW",
  "IDR",
  "PHP",
  "BDT"
];


export async function adddataOnModel(req) {
  try {
    const employeeId = req.employee?.id;
    const organizationId = new ObjectId('');
    const DropDownId = new ObjectId('')

    console.log('req.employee?.id',req.employee?.id)

    // Filter out sectors that already exist
    const existingSectors = await subdropDownModel.find({ name: { $in: sectors } });
    const existingNames = existingSectors.map(item => item.name);

    const newSectors = sectors
      .filter(name => !existingNames.includes(name))
      .map(name => ({
        name: name.trim(), 
        organizationId: organizationId, 
        dropDownId: DropDownId,
        status: "active",
        createdBy: employeeId
      }));

    if (newSectors.length === 0) {
      return returnFormatter(false, "All organization types already exist.");
    }

    const result = await subdropDownModel.insertMany(newSectors);
    return returnFormatter(true, "Organization types created successfully.", result);

  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
