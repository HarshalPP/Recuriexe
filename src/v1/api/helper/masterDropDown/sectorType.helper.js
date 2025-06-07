import SectorTypeModel from "../../models/masterDropDownModel/sectoreType.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js";
import { formatSectorTypeData } from "../../formatters/masterDropDown/sectorType.formatter.js";
import employeeModel from "../../models/employeemodel/employee.model.js";

// Add
export async function createSectorType(req) {
  try {
    const { name } = req.body;
    const employeeId = req.employee.id

    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }
    if (!name) return returnFormatter(false, "Sector name is required");

    const existing = await SectorTypeModel.findOne({ name: name.trim().toLowerCase() });
    if (existing) return returnFormatter(true, "Sector type already exists");

    const data = formatSectorTypeData(req , employeeId);
    const created = await SectorTypeModel.create(data);
    return returnFormatter(true, "Sector Type Added", created);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get by ID
export async function getSectorTypeDetail(req) {
  try {
    const { id } = req.query;
    if (!id) return returnFormatter(false, "Sector ID is required");

    const result = await SectorTypeModel.findById(id).lean().populate('createdBy','employeName employeUniqueId');;
    return result
      ? returnFormatter(true, "Sector Type Found", result)
      : returnFormatter(true, "Sector Type Not Found", null);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get All
export async function getAllSectorTypes(req) {
  try {
    const {status} = req.query
    if(!status){
      return returnFormatter(false, "Status is required");
    }
    const data = await SectorTypeModel.find({status:status}).lean().populate('createdBy','employeName employeUniqueId').sort({ name: 1 });
    return returnFormatter(true, `Sector Types ${status} List`, data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Update
export async function updateSectorType(req) {
  try {
    const { id , name } = req.body;
    if (!id) return returnFormatter(false, "Sector ID is required");

    const employeeId = req.employee.id
    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }
    const updateData = formatSectorTypeData(req);

    const existing = await SectorTypeModel.findOne({ name, _id: { $ne: id } });

if (existing) {
  return returnFormatter(false, "Sector Type Wwith This Name Already Exists.");
}

    const updated = await SectorTypeModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return updated
      ? returnFormatter(true, "Sector Type Updated", updated)
      : returnFormatter(false, "Sector Type Not Found", null);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


// Dropdown
export async function sectorTypeDropdown() {
  try {
    const list = await SectorTypeModel.find({ status: "active" }).select("name");

           const sortedList = list
      .map(item => ({ name: item.name.trim() ,_id:item._id})) // Trim whitespace
      .sort((a, b) => a.name.localeCompare(b.name))

    return returnFormatter(true, "Sector Type list.", sortedList);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function activeAndInactiveSectorTypeById(req) {
  try {
    const { id , status } = req.query;

    if (!id) return returnFormatter(false, "Sector ID is required");

    if(!status){
      return returnFormatter(false, "status is required");
    }
    const data = await SectorTypeModel.findByIdAndUpdate(id, {status:status}, {
        new: true,
      })

    if (!data) return returnFormatter(false, "Sector Type not found.");

    return returnFormatter(true, `Sector Type ${status}`, data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

