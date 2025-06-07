import OrganizationType from "../../models/masterDropDownModel/organizationType.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js";
import { formatOrganizationType } from "../../formatters/masterDropDown/organizationType.formatter.js";
import employeeModel from "../../models/employeemodel/employee.model.js"
// Create
export async function addOrganizationType(req) {
  try {
    const { name } = req.body;

    const employeeId = req.employee.id

    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }
    if (!name) return returnFormatter(false, "Name is required.");

    const existing = await OrganizationType.findOne({ name: name.trim() });
    if (existing) return returnFormatter(false, "Organization type already exists.");

    const newEntry = await OrganizationType.create(formatOrganizationType(req, employeeId));
    return returnFormatter(true, "Organization type created successfully.", newEntry);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// List All
export async function getOrganizationTypeList(req) {
  try {
    const { status } = req.query
    if (!status) {
      return returnFormatter(false, "Status is required.");
    }
    const list = await OrganizationType.find({ status: status }).populate('createdBy', 'employeName employeUniqueId').sort({ name: 1 });

    return returnFormatter(true, "Organization type list fetched.", list);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get by ID
export async function getOrganizationTypeById(req) {
  try {
    const { id } = req.query;
    if (!id) return returnFormatter(false, "organization Type ID is required");
    const data = await OrganizationType.findById(id).populate('createdBy', 'employeName employeUniqueId');;
    if (!data) return returnFormatter(false, "Organization type not found.");
    return returnFormatter(true, "Organization type found.", data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Update
export async function updateOrganizationType(req) {
  try {
    const { id } = req.body;
    if (!id) return returnFormatter(false, "organization Type ID is required");

    const employeeId = req.employee.id
    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }

    const updateData = formatOrganizationType(req);

    const duplicate = await OrganizationType.findOne({ name: updateData.name, _id: { $ne: id } });
    if (duplicate) return returnFormatter(false, "Name already exists.");

    const updated = await OrganizationType.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return returnFormatter(false, "Organization type not found.");
    return returnFormatter(true, "Organization type updated.", updated);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Dropdown
export async function organizationTypeDropdown() {
  try {
    const list = await OrganizationType.find({ status: "active" }).select("name");

           const sortedList = list
      .map(item => ({ name: item.name.trim() ,_id:item._id})) // Trim whitespace
      .sort((a, b) => a.name.localeCompare(b.name))


    return returnFormatter(true, "Dropdown data fetched.", sortedList);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


export async function activeAndInactiveOrganizationTypeById(req) {
  try {
    const { id , status } = req.query;

    if (!id) return returnFormatter(false, "Organization ID is required");

    if(!status){
      return returnFormatter(false, "status is required");
    }
    const data = await OrganizationType.findByIdAndUpdate(id, {status:status}, {
        new: true,
      })

    if (!data) return returnFormatter(false, "Organization Type not found.");

    return returnFormatter(true, `Organization Type ${status}`, data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}