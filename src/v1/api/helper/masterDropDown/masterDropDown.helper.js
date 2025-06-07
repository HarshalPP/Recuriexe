import dropDownModel from "../../models/masterDropDownModel/masterDropDown.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js";
import { formatDropDown } from "../../formatters/masterDropDown/masterDropDown.formatter.js";
import employeeModel from "../../models/employeemodel/employee.model.js";
import subdropDownModel from "../../models/masterDropDownModel/masterDropDownValue.model.js"
import { formatDropDownValue } from "../../formatters/masterDropDown/masterDropDownValue.formatter.js"

export async function addDropDown(req) {
  try {
    const { name } = req.body;
    const employeeId = req.employee.id
    const organizationId = req.employee.organizationId

    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }

    if (!name) return returnFormatter(false, "Name is required.");

    const existing = await dropDownModel.findOne({ name });

    if (existing) return returnFormatter(false, `${name} Already Exists`);

    const addNewDropDown = await dropDownModel.create(formatDropDown(req, employeeId, organizationId));

    return returnFormatter(true, `${name} Created Successfully.`, addNewDropDown);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


// Get All
// export async function getDropDownList(req) {
//   try {
//     const { status } = req.query
//     const employeeId = req.employee.id;
//     const organizationId = req.employee.organizationId;
//     if (!status) {
//       return returnFormatter(false, "Status is required.");
//     }
    
//       const queryStatus =
//       status === "active" ? ["active", "alwaysActive"] : [status];

//     const list = await dropDownModel.find({ status: { $in: queryStatus },   $or: [
//         { organizationId: organizationId },
//         { organizationId: null }
//       ] }).select('name status');

//     return returnFormatter(true, "DropDown list", list);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// }



export async function getDropDownList(req) {
  try {
    const { status } = req.query;
    const employeeId = req.employee.id;
    const organizationId = req.employee.organizationId;

    if (!status) {
      return returnFormatter(false, "Status is required.");
    }

    const queryStatus =
      status === "active" ? ["active", "alwaysActive"] : [status];

    const list = await dropDownModel.find({
      status: { $in: queryStatus },
      $or: [
        { organizationId: organizationId },
        { organizationId: null }
      ]
    }).select("name status");

    // Convert alwaysActive -> active in response
    const transformedList = list.map(item => ({
      ...item._doc,
      status: item.status === "alwaysActive" ? "active" : item.status
    }));

    return returnFormatter(true, "DropDown list", transformedList);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Get By ID
export async function getDropDownById(req) {
  try {
    const { id } = req.query;

    if (!id) return returnFormatter(false, "drop down ID is required");

    const data = await dropDownModel.findById(id).populate('createdBy', 'employeName employeUniqueId');;
    if (!data) return returnFormatter(false, "DropDown not found.");
    return returnFormatter(true, "DropDown details", data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Update
export async function updateDropDownById(req) {
  try {
    const { id } = req.body;

    const employeeId = req.employee.id
    const employeeVerify = await employeeModel.findById(employeeId, { status: "active" })

    if (!employeeVerify) {
      return returnFormatter(false, "Employee Not Found");
    }

    if (!id) return returnFormatter(false, "Drop down ID is required");
    const updateData = formatDropDown(req);

    const existing = await dropDownModel.findOne({ name: updateData.name, _id: { $ne: id } });
    if (existing) return returnFormatter(false, "Name already exists.");

    const updated = await dropDownModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return returnFormatter(false, "DropDown not found.");
    return returnFormatter(true, "DropDown updated.", updated);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


// export async function activeAndInactiveDropDownById(req) {
//   try {
//     const { id, status } = req.query;

//     if (!id) return returnFormatter(false, "drop down ID is required");

//     if (!status) {
//       return returnFormatter(false, "status is required");
//     }
//     const data = await dropDownModel.findByIdAndUpdate(id, { status: status }, {
//       new: true,
//     })

//     if (!data) return returnFormatter(false, "drop down not found.");

//     return returnFormatter(true, `drop down ${status}`, data);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// }


export async function activeAndInactiveDropDownById(req) {
  try {
    const { id, status } = req.query;

    if (!id) return returnFormatter(false, "Drop down ID is required.");
    if (!status) return returnFormatter(false, "Status is required.");

    const existing = await dropDownModel.findById(id);
    if (!existing) return returnFormatter(false, "Drop down not found.");

    // Prevent update if current status is alwaysActive
    if (existing.status === "alwaysActive") {

      return returnFormatter(false, "This dropdown is system-defined and cannot be modified");
    }

    const data = await dropDownModel.findByIdAndUpdate(id, { status: status }, { new: true });

    return returnFormatter(true, `Drop down ${status}`, data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

//---------------------------------------------------------------------------------------------------

export async function createsubDropDown(req) {
  try {
    const { name, dropDownId } = req.body;
    const employeeId = req.employee.id;
    const organizationId = req.employee.organizationId;

    if (!name || !dropDownId) {
      return returnFormatter(false, "Name and dropDownId are required");
    }

    // Verify employee is active
    const employeeVerify = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeVerify) {
      return returnFormatter(false, "Employee not found or inactive");
    }

    // Check if dropDown exists and is active
    const dropDown = await dropDownModel.findOne({ _id: dropDownId, status: "active" });
    if (!dropDown) {
      return returnFormatter(false, "Drop Down not found");
    }

    // Check for existing subDropDown with same name under same dropDownId and organizationId
    const existing = await subdropDownModel.findOne({
      name: name.trim(),
      dropDownId,
      organizationId: dropDown.organizationId,
    });

    if (existing) {
      return returnFormatter(false, `${name} Already Exists In ${dropDown.name}`);
    }

    // Format and create new subDropDown
    const newSubDropDown = await subdropDownModel.create({
      name: name.trim(),
      dropDownId,
      organizationId: organizationId,
      createdBy: employeeId,
    });

    return returnFormatter(true, `${name} created successfully.`, newSubDropDown);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


export async function subDropDownUpdate(req) {
  try {
    const { name, subDropDownId } = req.body;
    const employeeId = req.employee.id;
    const organizationId = req.employee.organizationId;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return returnFormatter(false, "Name is required and must be a non-empty string.");
    }

    const trimmedName = name.trim();

    // Verify employee is active
    const employee = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employee) {
      return returnFormatter(false, "Employee not found or inactive");
    }

    if (subDropDownId) {
      // Update logic
      const subDrop = await subdropDownModel.findById(subDropDownId);
      if (!subDrop) {
        return returnFormatter(false, "Sub Drop Down not found for update");
      }

      const dropDown = await dropDownModel.findOne({ _id: subDrop.dropDownId, status: "active" });
      if (!dropDown) {
        return returnFormatter(false, "Associated Drop Down not found or inactive");
      }

      // Check for name duplication excluding current
      const duplicate = await subdropDownModel.findOne({
        name: trimmedName,
        dropDownId: subDrop.dropDownId,
        organizationId: organizationId,
        _id: { $ne: subDropDownId }
      });
      if (duplicate) {
        return returnFormatter(false, `${trimmedName} already exists in ${dropDown.name}`);
      }

      subDrop.name = trimmedName;
      subDrop.createdBy = employeeId;
      await subDrop.save();

      return returnFormatter(true, `${trimmedName} updated successfully.`, subDrop);
    } else {
      // Create logic
      return returnFormatter(false, "sub Drop Down Id is required");
    }
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function nameBySubDropDownGet(req) {
  try {
    const { name, status= "active"} = req.query;
    const employeeId = req.employee.id;
    const organizationId = req.employee.organizationId;

    const employee = await employeeModel.findById(employeeId, { status: "active" });
    if (!employee) {
      return returnFormatter(false, "Employee not found or inactive");
    }

    if (!name) {
      return returnFormatter(false, "Name is required.");
    }
    if (!status) {
      return returnFormatter(false, "Status is required.");
    }

    const dropDownVerify = await dropDownModel.findOne({ name: name.trim() });
    
    if (!dropDownVerify) {
      return returnFormatter(false, `${name} Not Found`);
    }
 const dropDownActiveOrNot = await dropDownModel.findOne({
  name: name.trim(),
  status: { $in: ["active", "alwaysActive"] }
});
    if (!dropDownActiveOrNot) {
      return returnFormatter(false, `${name} Inactive`);
    }

    const subDropList = await subdropDownModel.find({ organizationId: organizationId, dropDownId: dropDownVerify._id, status: status }).select('name status');
    return returnFormatter(true, `${name} list`, subDropList);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


export async function detailSubDropDown(req) {
  try {
    const { subDropDownId } = req.query;
    const employeeId = req.employee.id;
    const organizationId = req.employee.organizationId;

    const employee = await employeeModel.findById(employeeId, { status: "active" });
    if (!employee) {
      return returnFormatter(false, "Employee not found or inactive");
    }
    if (!subDropDownId) {
      return returnFormatter(false, "Sub Drop Down ID is required");
    }

    const subDropDownDetail = await subdropDownModel.findById(subDropDownId).populate('dropDownId', 'name').populate('organizationId', 'name');;
    if (!subDropDownDetail) {
      return returnFormatter(false, "Detail not found");
    }
    return returnFormatter(true, `fetch detail`, subDropDownDetail);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


export async function activeAndInactiveSubDropDownById(req) {
  try {
    const { id, status } = req.query;

    if (!id) return returnFormatter(false, "drop down ID is required");

    if (!status) {
      return returnFormatter(false, "status is required");
    }
    const data = await subdropDownModel.findByIdAndUpdate(id, { status: status }, {
      new: true,
    })

    if (!data) return returnFormatter(false, "drop down not found.");

    return returnFormatter(true, `drop down ${status}`, data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}