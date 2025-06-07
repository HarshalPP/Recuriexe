import IndustryTypeModel from "../../models/masterDropDownModel/IndustryType.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js";
import { formatIndustryType } from "../../formatters/masterDropDown/industryType.formatter.js";
import employeeModel from "../../models/employeemodel/employee.model.js";
// Add
export async function addIndustryType(req) {
  try {
    const { name } = req.body;
const employeeId = req.employee.id
    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }
    if (!name) return returnFormatter(false, "Name is required.");

    const existing = await IndustryTypeModel.findOne({ name });
    if (existing) return returnFormatter(false, "IndustryType already exists.");

    const newIndustry = await IndustryTypeModel.create(formatIndustryType(req , employeeId));
    return returnFormatter(true, "IndustryType created successfully.", newIndustry);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get All
export async function getIndustryTypeList(req) {
  try {
    const {status} = req.query
    if(!status){
       return returnFormatter(false, "Status is required.");
    }
    const list = await IndustryTypeModel.find({status:status}).populate('createdBy','employeName employeUniqueId').sort({ name: 1 });
    
    return returnFormatter(true, "IndustryType list", list);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get By ID
export async function getIndustryTypeById(req) {
  try {
    const { id } = req.query;

    if (!id) return returnFormatter(false, "industry ID is required");

    const data = await IndustryTypeModel.findById(id).populate('createdBy','employeName employeUniqueId');;
    if (!data) return returnFormatter(false, "IndustryType not found.");
    return returnFormatter(true, "IndustryType details", data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Update
export async function updateIndustryTypeById(req) {
  try {
    const { id } = req.body;

    const employeeId = req.employee.id
    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }

    if (!id) return returnFormatter(false, "industry ID is required");
    const updateData = formatIndustryType(req);

    const existing = await IndustryTypeModel.findOne({ name: updateData.name, _id: { $ne: id } });
    if (existing) return returnFormatter(false, "Name already exists.");

    const updated = await IndustryTypeModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return returnFormatter(false, "IndustryType not found.");
    return returnFormatter(true, "IndustryType updated.", updated);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Dropdown
export async function industryTypeDropdown() {
  try {
    const list = await IndustryTypeModel.find({ status: "active" }).select("name");
           const sortedList = list
      .map(item => ({ name: item.name.trim() ,_id:item._id})) // Trim whitespace
      .sort((a, b) => a.name.localeCompare(b.name))

    return returnFormatter(true, "IndustryType dropdown list.", sortedList);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


export async function activeAndInactiveIndustryTypeById(req) {
  try {
    const { id , status } = req.query;

    if (!id) return returnFormatter(false, "Industry ID is required");

    if(!status){
      return returnFormatter(false, "status is required");
    }
    const data = await IndustryTypeModel.findByIdAndUpdate(id, {status:status}, {
        new: true,
      })

    if (!data) return returnFormatter(false, "Industry Type not found.");

    return returnFormatter(true, `Industry Type ${status}`, data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

