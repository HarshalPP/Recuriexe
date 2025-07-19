const { returnFormatter } = require("../formatter/common.formatter");
const { branchFormatter } = require("../formatter/branch.formatter");
const companyModel = require("../model/adminMaster/company.model");
const branchModel = require("../model/adminMaster/newBranch.model");
const workLocationModel = require("../model/adminMaster/newWorkLocation.model");
const employeeModel = require("../model/adminMaster/employe.model");
const {
  newBranchGoogleSheet,
} = require("../controller/adminMaster/masterGoogleSheet.controller");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Assuming you're using JWT for login tokens

//---------------------------------------------------
function convertToISOFormat(timeStr, dateStr) {
  const [time, period] = timeStr.split(" "); // Split "10:00 am" into time and period
  let [hours, minutes] = time.split(":").map(Number); // Split hours and minutes
  const dateParts = dateStr.split("T")[0]; // Extract the date part from ISO format date

  // Adjust hours based on AM/PM
  if (period.toLowerCase() === "pm" && hours < 12) hours += 0;
  if (period.toLowerCase() === "am" && hours === 12) hours = 0;

  // Build ISO format date string
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${dateParts}T${formattedHours}:${formattedMinutes}:00 ${period.toUpperCase()}`;
}
//--------------------------------- Create a new branch----------------------------------
async function addBranch(req, bodyData) {
  try {
    const existingBranch = await branchModel.findOne({
      name: bodyData.name,
    });
    if (existingBranch) {
      return returnFormatter(
        false,
        "Branch with the same name already exists."
      );
    }
    const company = await companyModel.find();
    bodyData.companyId = company[0]._id;
    bodyData.createdBy = req.Id;
    if (bodyData.regional === "false" || bodyData.regional === false) {
      if (!bodyData.regionalBranchId) {
        return returnFormatter(
          false,
          "RegionalBranch Id is required when regional is false."
        );
      }
    }
    
    const punchInTime = req.body.punchInTime;
    const punchOutTime = req.body.punchOutTime;
    if (!punchInTime || !punchOutTime) {
      return returnFormatter(
        false,
        "Both punchInTime and punchOutTime are required."
      );
    }
    const currentDateISO = new Date().toISOString(); // Current date in ISO format, e.g., "2024-12-11T12:00:00.000Z"
    
    bodyData.punchInTime = convertToISOFormat(punchInTime, currentDateISO);
    bodyData.punchOutTime = convertToISOFormat(punchOutTime, currentDateISO);
    
    const formattedData = branchFormatter(bodyData);
    console.log(formattedData);
    
    const saveData = await branchModel.create(formattedData);
    let reginalBranchName 
    if (formattedData.regional) {
      reginalBranchName = "N/A"
    }else{
      const regionalBranch = await branchModel.findById({
        _id: saveData.regionalBranchId,
      });
      reginalBranchName = regionalBranch.name
    }
    // saveData.regionalBranchId = regionalBranch.name;

    const sheetData = { ...saveData._doc, regionalBranch: reginalBranchName };
    // console.log(sheetData);

    await newBranchGoogleSheet(sheetData);

    return returnFormatter(true, "Branch created", saveData);
  } catch (error) {
    console.log(error)
    return returnFormatter(false, error.message);
  }
}

//----------------------------get all branch ---------------------------------------
// async function getAllBranch(req, res) {
//   try {
//     // console.log(req.Id);
//     const branch = await branchModel
//       .find({
//         isActive: true,
//       })
//       .populate("regionalBranchId")
//       .populate({ path: "createdBy", select: " employeName" })
//       .populate({ path: "updatedBy", select: " employeName" });
//     if (!branch) {
//       return returnFormatter(false, "branch not found");
//     }
//     return returnFormatter(true, "branch found", branch);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// }


// async function getAllBranch11(req, res) {
//   try {
//     const branches = await branchModel
//       .find({ isActive: true })
//       .populate("regionalBranchId")
//       .populate({ path: "createdBy", select: "employeName" })
//       .populate({ path: "updatedBy", select: "employeName" });

//     if (!branches || branches.length === 0) {
//       return returnFormatter(false, "Branches not found");
//     }

//     const branchIds = branches.map(branch => branch._id);
    
  
//     const employeeCounts = await employeeModel.aggregate([
//       { $match: { branchId: { $in: branchIds } } },
//       { $group: { _id: "$branchId", totalEmployees: { $count: {} } } }
//     ]);


//     const employeeCountMap = {};
//     employeeCounts.forEach(item => {
//       employeeCountMap[item._id.toString()] = item.totalEmployees;
//     });

//     branches.forEach(branch => {
//       const branchId = branch._id.toString();
//       branch._doc.totalEmployees = employeeCountMap[branchId] || 0; 
//     });

//     return returnFormatter(true, "Branches found", branches);
//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// }

async function getAllBranch(req, res) {
  try {
    // const query = req.body.branches || []; 
    // const query = req.query.branch ? req.query.branch.split(",") : [];

    const filterParam = req.query.filter ? JSON.parse(req.query.filter) : {};
    const query = filterParam.branches || [];

    console.log('qurt----',query)

    // const branches = await branchModel
    //   .find({ _id: { $in: query }, isActive: true }) 
    //   .populate("regionalBranchId")
    //   .populate({ path: "createdBy", select: "employeName" })
    //   .populate({ path: "updatedBy", select: "employeName" });

    const filter = query.length > 0 
  ? { _id: { $in: query }, isActive: true } 
  : { isActive: true };

const branches = await branchModel
  .find(filter)
  .populate("regionalBranchId")
  .populate({ path: "createdBy", select: "employeName" })
  .populate({ path: "updatedBy", select: "employeName" });
  
    if (!branches || branches.length === 0) {
      return returnFormatter(false, "Branches not found");
    }

    const branchIds = branches.map(branch => branch._id);
    
  
    const employeeCounts = await employeeModel.aggregate([
      { $match: { branchId: { $in: branchIds } } },
      { $group: { _id: "$branchId", totalEmployees: { $count: {} } } }
    ]);


    const employeeCountMap = {};
    employeeCounts.forEach(item => {
      employeeCountMap[item._id.toString()] = item.totalEmployees;
    });

    branches.forEach(branch => {
      const branchId = branch._id.toString();
      branch._doc.totalEmployees = employeeCountMap[branchId] || 0; 
    });

    return returnFormatter(true, "Branches found", branches);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}



async function getAllMapBranch() {
  try {
    // Only select fields we actually need to reduce data transfer
    const branches = await branchModel
      .find(
        { isActive: true },
        {
          _id: 1,
          name: 1,
          address: 1,
          city: 1,
          state: 1,
          pincode: 1,
          location: 1,
          createdAt: 1,
          type: 1
        }
      )
      .lean(); // Use lean() for better performance when you don't need Mongoose document methods
    
    if (!branches || branches.length === 0) {
      return returnFormatter(false, "branch not found");
    }

    // Transform the data to match the desired format
    const transformedBranches = branches.map(branch => {
      // Format the full address by combining address components
      const fullAddress = [
        branch.address,
        branch.city,
        branch.state,
        branch.pincode
      ].filter(Boolean).join(', ');

      // Extract and format location data
      let location = { lat: 0, lng: 0 }; // Default location
      if (branch.location && branch.location.coordinates && branch.location.coordinates.length === 2) {
        // Convert from [longitude, latitude] to {lat, lng}
        location = {
          lat: branch.location.coordinates[1], // Latitude is second in GeoJSON coordinates
          lng: branch.location.coordinates[0]  // Longitude is first in GeoJSON coordinates
        };
      }

      // Format established date from createdAt
      let established = '2000-01-01'; // Default established date
      if (branch.createdAt) {
        const date = new Date(branch.createdAt);
        established = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      // Return the branch in the new format
      return {
        id: branch._id.toString(),
        name: branch.name || 'Unnamed Branch',
        address: fullAddress || 'No Address Available',
        phone: '+91 11-1234-5678', // Default phone number
        manager: 'Branch Manager', // Default manager name
        employeeCount: 50, // Default employee count
        location: location,
        established: established,
        branchType: branch.type || 'Regular Branch'
      };
    });

    return returnFormatter(true, "branch found", transformedBranches);
  } catch (error) {
    console.error("Error fetching branch data:", error);
    return returnFormatter(false, error.message);
  }
}

// --------------- get branch only Name //------------

// async function getBranch(req,res){
//   try{
//     const findBranch = await branchModel.find({})

//     if (!findBranch) {
//       return returnFormatter(false, "branch not found");
//     }

//   }
//   catch(error){
//     return returnFormatter(false, error.message);
//   }
// }
//----------------------------get all branch ---------------------------------------
async function getAllCountWebsite(req, res) {
  try {
    // console.log(req.Id);
    const branch = await branchModel
      .find({
        isActive: true,
      });
      const employee = await employeeModel
      .find({
        status: "active",
      });
      const branchCount = branch.length;
      const employeeCount = employee.length;
    
    return returnFormatter(true, "branch found", {branchCount,employeeCount});
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------get all branch ---------------------------------------
async function getAllInactiveBranch(req, res) {
  try {
    // console.log(req.Id);
    const branch = await branchModel
      .find({
        isActive: false,
      })
      .populate("regionalBranchId")
      .populate({ path: "createdBy", select: " employeName" })
      .populate({ path: "updatedBy", select: " employeName" });

    if (!branch) {
      return returnFormatter(false, "branch not found");
    }
    return returnFormatter(true, "branch found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------get all branch ---------------------------------------
async function getRegionalBranch() {
  try {
    const branch = await branchModel
      .find({
        regional: "true",
      })
      .populate({ path: "createdBy", select: " employeName" })
      .populate({ path: "updatedBy", select: " employeName" });
    if (!branch) {
      return returnFormatter(false, "branch not found");
    }
    return returnFormatter(true, "branch found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

//----------------------------get all branch ---------------------------------------
async function getBranchById(branchId) {
  try {
    // console.log(branchId);
    const branch = await branchModel
      .findById({
        _id: branchId,
      })
      .populate({ path: "updatedBy", select: " employeName" })
      .populate("regionalBranchId")
      .populate({ path: "createdBy", select: " employeName" });
    if (!branch) {
      return returnFormatter(false, "branch not found");
    }
    return returnFormatter(true, "branch found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------get all branch ---------------------------------------
async function getBranchByRegionalId(branchId) {
  try {
    // console.log(branchId);
    const branch = await branchModel
      .find({
        regionalBranchId: branchId,
      })
      .populate({ path: "createdBy", select: " employeName" })
      .populate({ path: "updatedBy", select: " employeName" });
    // console.log(branch);
    if (!branch) {
      return returnFormatter(false, "branch not found");
    }
    return returnFormatter(true, "branch found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
//----------------------------------------------------------------------
async function updateBranch(req, branchId, bodyData) {
  try {
    // Find the existing branch by ID
    branchId = new ObjectId(branchId);
    const existBranch = await branchModel.findById(branchId);

    if (!existBranch) {
      return returnFormatter(false, "Branch does not exist.");
    }
    const punchInTime = req.body.punchInTime;
    const punchOutTime = req.body.punchOutTime;
    if (!punchInTime || !punchOutTime) {
      return returnFormatter(
        false,
        "Both punchInTime and punchOutTime are required."
      );
    }
    const currentDateISO = new Date().toISOString(); // Current date in ISO format, e.g., "2024-12-11T12:00:00.000Z"
    
    bodyData.punchInTime = convertToISOFormat(punchInTime, currentDateISO);
    bodyData.punchOutTime = convertToISOFormat(punchOutTime, currentDateISO);

    // Check if the new name is different from the current name
    if (bodyData.name && bodyData.name !== existBranch.name) {
      // Check if another branch with the new name already exists
      const existingBranchWithSameName = await branchModel.findOne({
        name: bodyData.name,
        _id: { $ne: branchId }, // Ensure it is not the same branch being updated
      });

      if (existingBranchWithSameName) {
        return returnFormatter(
          false,
          "Branch with the same name already exists."
        );
      }
    }

    // // Fetch the first company and assign its ID to bodyData
    // const company = await companyModel.find();
    // bodyData.companyId = company[0];

    bodyData.updatedBy = req.Id;

    // If regional is 'false', ensure regionalBranchId is provided
    if (bodyData.regional === "false") {
      if (!bodyData.regionalBranchId) {
        return returnFormatter(
          false,
          "RegionalBranch Id is required when regional is false."
        );
      }
    }

    // Validate and format location to GeoJSON if provided
    if (bodyData.location && bodyData.location.coordinates) {
      bodyData.location = {
        type: "Point",
        coordinates: bodyData.location.coordinates, // Ensure it's in [longitude, latitude] format
      };
    }

    // Format the data
    const formattedData = branchFormatter(bodyData);

    // Update the branch
    const saveData = await branchModel.findOneAndUpdate(
      { _id: branchId },
      formattedData,
      { new: true }
    );

    let reginalBranchName 
    if (formattedData.regional) {
      reginalBranchName = "N/A"
    }else{
      const regionalBranch = await branchModel.findById({
        _id: saveData.regionalBranchId,
      });
      reginalBranchName = regionalBranch.name
    }
    // saveData.regionalBranchId = regionalBranch.name;

    const sheetData = { ...saveData._doc, regionalBranch: reginalBranchName };
    
    await newBranchGoogleSheet(sheetData);

    return returnFormatter(true, "Branch updated", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
// -----------------------------Deactivate a branch (soft delete)--------------------------------------------
async function deactivateBranch(req, branchId) {
  try {
    const employee = await employeeModel.find({ branchId: branchId,status:"active" });
    const branch = await branchModel.find({ regionalBranchId: branchId });
    const workLocation = await workLocationModel.find({ branchId: branchId });

    // Check if any of the collections have records associated with the branch
    if (employee.length > 0) {
      return returnFormatter(
        false,
        "Cannot deactive branch as it has employees"
      );
    } else if (branch.length > 0) {
      return returnFormatter(
        false,
        "Cannot deactive branch as it a regional branch"
      );
    // } 
    // else if (workLocation.length > 0) {
    //   return returnFormatter(
    //     false,
    //     "Cannot deactive branch as it has work locations"
    //   );
    } else {
      const deactivatedBranch = await branchModel.findOneAndUpdate(
        { _id: branchId },
        { isActive: false, updatedBy: req.Id },
        { new: true }
      );
      if (!deactivatedBranch) {
        return returnFormatter(false, "Branch not found");
      }
      return returnFormatter(true, "Branch deactivated", deactivatedBranch);
    }
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function getBranchWiseEmployeList(req) {
  try {
    const response = await branchModel.aggregate([
      {
        $lookup: {
          from: 'employees', 
          localField: '_id', 
          foreignField: 'branchId', 
          as: 'branchEmployee' 
        }
      },
      {
        $addFields: {
          branchEmployeeLength: { $size: '$branchEmployee' },
          lowerCaseName: { $toLower: '$name' } // Normalize case for sorting
        }
      },
      {
        $sort: {
          lowerCaseName: 1 // Case-insensitive alphabetical sort
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          city: 1,
          state: 1,
          pincode: 1,
          branchEmployeeLength: 1, // Include branchEmployeeLength in the output
          branchEmployee: 1
        }
      }
    ]);

    return returnFormatter(true, "Branch-wise employee details", {
      dataLength: response.length,
      branchesLength: response.length, // Since response length matches branches count in this aggregation
      response
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

module.exports = {
  addBranch,
  getAllBranch,
  getAllCountWebsite,
  getRegionalBranch,
  getBranchById,
  getBranchByRegionalId,
  updateBranch,
  deactivateBranch,
  getAllInactiveBranch,
  getBranchWiseEmployeList,
  getAllMapBranch
};
