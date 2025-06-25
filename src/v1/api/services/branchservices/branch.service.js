import { returnFormatter } from "../../formatters/common.formatter.js";
import { branchFormatter } from "../../formatters/branch.formatter.js"
import companyModel from "../../models/companyModel/company.model.js";
import branchModel from "../../models/branchModel/branch.model.js";
import workLocationModel from "../../models/worklocationModel/worklocation.model.js";
import employeeModel from "../../models/employeemodel/employee.model.js";
import branchTypeModel from "../../models/masterDropDownModel/branchType.model.js"
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import mongoose from "mongoose";
import subDropDownModel from "../../models/masterDropDownModel/masterDropDownValue.model.js";

const { ObjectId } = mongoose;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // Assuming you're using JWT for login tokens
import { badRequest } from "../../formatters/globalResponse.js";

//---------------------------------------------------
export const convertToISOFormat = (timeStr, dateStr) => {
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
};

//--------------------------------- Create a new branch----------------------------------
export const addBranch = async (req, bodyData) => {
  try {
    const { branchType, branchMaping } = req.body

    const company = await companyModel.find();
    // bodyData.companyId = company[0]._id || null;
    bodyData.createdBy = req.Id;
    bodyData.organizationId = req.employee.organizationId;

    if (!branchType) {
      return returnFormatter(false, "branch Type are required.");
    }

    const validMappedBranches = await branchModel.find({
      _id: { $in: branchMaping }
    });

    // console.log('branchMaping',branchMaping)

    if (validMappedBranches.length !== branchMaping.length) {
      return returnFormatter(false, "One or more branchMaping IDs are invalid.");
    }


  if (bodyData.location && Array.isArray(bodyData.location.coordinates)) {
  const [lng, lat] = bodyData.location.coordinates;

  // Convert strings to numbers safely
  const longitude = parseFloat(lng);
  const latitude = parseFloat(lat);

  if (!isNaN(longitude) && !isNaN(latitude)) {
    bodyData.location = {
      type: "Point",
      coordinates: [latitude , longitude], // Correct format
    };
  } else {
    // Use default location if invalid
    bodyData.location = {
      type: "Point",
      coordinates: [0.0, 0.0],
    };
  }
} else {
  // No coordinates provided, use fallback
  bodyData.location = {
    type: "Point",
    coordinates: [0.0, 0.0],
  };
}





    // bodyData.punchInTime = convertToISOFormat(punchInTime, currentDateISO);
    // bodyData.punchOutTime = convertToISOFormat(punchOutTime, currentDateISO);

    const formattedData = branchFormatter(bodyData);
    // console.log(formattedData);

    const saveData = await branchModel.create(formattedData);

    return returnFormatter(true, "Branch created", saveData);
  } catch (error) {
    console.log(error);
    return returnFormatter(false, error.message);
  }
};

//----------------------------get all branch ---------------------------------------
export const getAllBranch = async (req, res) => {
  try {
    const filterParam = req.query.filter ? JSON.parse(req.query.filter) : {};
    const query = filterParam.branches || [];
const organizationId = req.query.organizationId

if(!organizationId){
  return badRequest(res , "organization Id Required")
}
    // console.log('qurt----', query);
  // const baseFilter = {
  //     isActive: true,
  //     // organizationId: req.employee.organizationId, // ✅ Filter by organization
  //   };

  //   if (query.length > 0) {
  //     baseFilter._id = { $in: query };
  //   }
    const branches = await branchModel
      .find({organizationId})
      .populate("regionalBranchId")
      .populate({ path: "createdBy", select: "employeName" })
      .populate({ path: "updatedBy", select: "employeName" })
      .populate({ path: "branchType", select: "name" })
      .populate({ path: "branchMaping", select: "name" });

    if (!branches || branches.length === 0) {
      return returnFormatter(false, "Branches not found");
    }

    const branchIds = branches.map(branch => branch._id);
    const employeeCounts = await employeeModel.aggregate([
          {
        $match: {
          branchId: { $in: branchIds },
          // organizationId: req.employee.organizationId, // ✅ Match employees from the same organization
        },
      },
      { $group: { _id: "$branchId", totalEmployees: { $count: {} } } }
    ]);

    const employeeCountMap = {};
    employeeCounts.forEach(item => {
      employeeCountMap[item._id.toString()] = item.totalEmployees;
    });


        // 📍 Get work locations for all branches
    const workLocations = await workLocationModel.find({
      branchId: { $in: branchIds },
      isActive: true,
    });

// 🗺️ Map work locations to branchId
// 🗺️ Map work locations to branchId
const workLocationMap = {};
workLocations.forEach(loc => {
  const bId = loc.branchId.toString();
  if (!workLocationMap[bId]) workLocationMap[bId] = [];
  workLocationMap[bId].push({ _id: loc._id, name: loc.name }); // ⬅️ push object with _id and name
});

branches.forEach(branch => {
  const branchId = branch._id.toString();
  branch._doc.totalEmployees = employeeCountMap[branchId] || 0;
  branch._doc.workLocations = workLocationMap[branchId] || []; // array of { _id, name }
});



    return returnFormatter(true, "Branches found", branches);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


//----------------------------get all branch ---------------------------------------
export const getAllListBranch = async (req, res) => {
  try {
    const filterParam = req.query.filter ? JSON.parse(req.query.filter) : {};
    const query = filterParam.branches || [];
const organizationId = req.employee.organizationId 
    const branches = await branchModel
      .find({organizationId})
      .populate("regionalBranchId")
      .populate({ path: "createdBy", select: "employeName" })
      .populate({ path: "updatedBy", select: "employeName" })
      .populate({ path: "branchType", select: "name" })
      .populate({ path: "branchMaping", select: "name" });

    if (!branches || branches.length === 0) {
      return returnFormatter(false, "Branches not found");
    }

    const branchIds = branches.map(branch => branch._id);
    const employeeCounts = await employeeModel.aggregate([
          {
        $match: {
          branchId: { $in: branchIds },
          // organizationId: req.employee.organizationId, // ✅ Match employees from the same organization
        },
      },
      { $group: { _id: "$branchId", totalEmployees: { $count: {} } } }
    ]);

    const employeeCountMap = {};
    employeeCounts.forEach(item => {
      employeeCountMap[item._id.toString()] = item.totalEmployees;
    });


        // 📍 Get work locations for all branches
    const workLocations = await workLocationModel.find({
      branchId: { $in: branchIds },
      isActive: true,
    });

// 🗺️ Map work locations to branchId
// 🗺️ Map work locations to branchId
const workLocationMap = {};
workLocations.forEach(loc => {
  const bId = loc.branchId.toString();
  if (!workLocationMap[bId]) workLocationMap[bId] = [];
  workLocationMap[bId].push({ _id: loc._id, name: loc.name }); // ⬅️ push object with _id and name
});

branches.forEach(branch => {
  const branchId = branch._id.toString();
  branch._doc.totalEmployees = employeeCountMap[branchId] || 0;
  branch._doc.workLocations = workLocationMap[branchId] || []; // array of { _id, name }
});



    return returnFormatter(true, "Branches found", branches);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};
//-----------------------------get inactive branch --------------------------------
export const getInactiveBranch = async (req, res) => {
  try {
    const branches = await branchModel
      .find({ isActive: false ,   organizationId: req.employee.organizationId }) // Filter by organization
      .populate("regionalBranchId")
      .populate({ path: "createdBy", select: "employeName" })
      .populate({ path: "updatedBy", select: "employeName" });

    if (!branches || branches.length === 0) {
      return returnFormatter(false, "Inactive Branch not found");
    }

    const branchIds = branches.map(branch => branch._id);

    const employeeCounts = await employeeModel.aggregate([
            {
        $match: {
          branchId: { $in: branchIds },
          organizationId: req.employee.organizationId, // ✅ Match employees from the same organization
        },
      },
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

    return returnFormatter(true, "Inactive Branch found", branches);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------create work location---------------------------------
export const createWorkLocation = async (req, bodyData) => {
  try {
    const workLocation = await workLocationModel.findOne({ name: bodyData.name });
    if (workLocation) {
      return returnFormatter(false, "Work location with the same name already exists.");
    }

    const saveData = await workLocationModel.create(bodyData);
    return returnFormatter(true, "Work location created", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------get all work location--------------------------------
export const getAllWorkLocation = async (req, res) => {
  try {
    const workLocations = await workLocationModel.find();
    if (!workLocations || workLocations.length === 0) {
      return returnFormatter(false, "No work locations found");
    }
    return returnFormatter(true, "Work locations found", workLocations);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------get work location by id----------------------------
export const getWorkLocationById = async (req, res) => {
  try {
    const workLocation = await workLocationModel.findById(req.params.id);
    if (!workLocation) {
      return returnFormatter(false, "Work location not found");
    }
    return returnFormatter(true, "Work location found", workLocation);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


//----------------------------get branch by id---------------------------------------
export const getBranchById = async (branchId) => {
  try {
    const branch = await branchModel
      .findById({ _id: branchId })
      .populate({ path: "updatedBy", select: "employeName" })
      .populate("regionalBranchId")
      .populate({ path: "createdBy", select: "employeName" });

    if (!branch) {
      return returnFormatter(false, "Branch not found");
    }
    return returnFormatter(true, "Branch found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------get branch by regional id---------------------------------------
export const getBranchByRegionalId = async (branchId) => {
  try {
    const branch = await branchModel
      .find({ regionalBranchId: branchId })
      .populate({ path: "createdBy", select: "employeName" })
      .populate({ path: "updatedBy", select: "employeName" });

    if (!branch) {
      return returnFormatter(false, "Branch not found");
    }
    return returnFormatter(true, "Branch found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------update branch---------------------------------------
export const updateBranch = async (req, branchId, bodyData) => {
  try {

    if(!branchId){
      return returnFormatter(false, "Branch Id are required");
    }
    const existBranch = await branchModel.findById(branchId);

    if (!existBranch) {
      return returnFormatter(false, "Branch does not exist.");
    }
    if (bodyData.name && bodyData.name !== existBranch.name) {
      const existingBranchWithSameName = await branchModel.findOne({
        name: bodyData.name,
        _id: { $ne: branchId }, 
      });

      if (existingBranchWithSameName) {
        return returnFormatter(
          false,
          "Branch with the same name already exists."
        );
      }
    }

const { branchType, branchMaping } = req.body

        const validMappedBranches = await branchModel.find({
      _id: { $in: branchMaping }
    });

    if (validMappedBranches.length !== branchMaping.length) {
      return returnFormatter(false, "branchMaping IDs are invalid.");
    }

        if (!branchType) {
      return returnFormatter(false, "branch Type are required.");
    }

    const branchFind = await subDropDownModel.findById(branchType)
    if (!branchFind) {
      return returnFormatter(false, "branch Type Not Found.");
    }

    bodyData.updatedBy = req.Id;
    if (bodyData.location && bodyData.location.coordinates) {
      bodyData.location = {
        type: "Point",
        coordinates: bodyData.location.coordinates,
      };
    }
    const formattedData = branchFormatter(bodyData);

    const saveData = await branchModel.findOneAndUpdate(
      { _id: branchId },
      formattedData,
      { new: true }
    );

    return returnFormatter(true, "Branch updated", saveData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};

//----------------------------deactivate branch (soft delete)---------------------------------------
export const deactivateBranch = async (req, branchId) => {
  try {
    const {isActive} = req.body
    const employee = await employeeModel.find({ branchId, status: "active" });
    const jobPost = await jobPostModel.find({ branchId, status: "active" });
    const branch = await branchModel.find({ regionalBranchId: branchId });
    const workLocation = await workLocationModel.find({ branchId });

    if (employee.length > 0) {
      return returnFormatter(
        false,
        "Cannot deactivate branch as it has employees"
      );
    } else if (branch.length > 0) {
      return returnFormatter(
        false,
        "Cannot deactivate branch as it is a regional branch"
      );
    } else if (jobPost.length > 0) {
      return returnFormatter(
        false,
        "Cannot deactivate branch as it is a job post"
      );
    } else {
      const deactivatedBranch = await branchModel.findOneAndUpdate(
        { _id: branchId },
        { isActive: isActive, updatedBy: req.Id },
        { new: true }
      );

      if (!deactivatedBranch) {
        return returnFormatter(false, "Branch not found");
      }
      return returnFormatter(true, `Branch is ${isActive?"active":"inactive"}`, deactivatedBranch);
    }
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


export const getRegionalBranch = async () => {
  try {
    const branch = await branchModel
      .find({ 
        regional: "true",

       })
      .populate({ path: "createdBy", select: "employeName" })
      .populate({ path: "updatedBy", select: "employeName" });

    if (!branch || branch.length === 0) {
      return returnFormatter(false, "Branch not found");
    }

    return returnFormatter(true, "Branch found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


export const getAllInactiveBranch = async (req, res) => {
  try {
    const branch = await branchModel
      .find({ isActive: false , organizationId: req.employee.organizationId }) // ✅ Filter by organization
      .populate("regionalBranchId")
      .populate({ path: "createdBy", select: "employeName" })
      .populate({ path: "updatedBy", select: "employeName" });

    if (!branch || branch.length === 0) {
      return returnFormatter(false, "Branch not found");
    }

    return returnFormatter(true, "Branch found", branch);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
};


//  -------------------------- get all branch ----------------------//
export async function allBranchHrms(requestsObject) {
  try {
    const { limit = 10000, page = 1 } = requestsObject.query
    const pageNumber = parseInt(page) || 1
    const limitNumber = parseInt(limit) || 10
    const skip = (pageNumber - 1) * limitNumber
    const branchData = await branchModel.find({organizationId: req.employee.organizationId})
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });
    const totalBranches = await branchModel.countDocuments({});

    const totalPages = Math.ceil(totalBranches / limitNumber);
    const formattedBranchData = branchData.map(branch => ({
      _id: branch._id,
      name: branch.name?.toUpperCase() || '',
      address: branch.address,
      city: branch.city,
      state: branch.state,
      pincode: branch.pincode,
      type: branch.type,
      regional: branch.regional,
      location: branch.location,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt
    }));
    return returnFormatter(true, "All Branch", {
      branches: formattedBranchData,
      totalPages: totalPages,
      currentPage: pageNumber,
      totalBranches: totalBranches
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function getBranchByJobPost(req) {
  try {
    const { organizationId, jobPostId } = req.query;

    if (!organizationId || !jobPostId) {
      return returnFormatter(false, "organizationId and jobPostId are required");
    }

    const jobPost = await jobPostModel.findOne({
      _id: new mongoose.Types.ObjectId(jobPostId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });

    if (!jobPost) {
      return returnFormatter(false, "Job Post not found");
    }

    const branchIds = jobPost.branchId || [];

    // Now fetch work locations where branchId matches any of these
    const workLocations = await workLocationModel.find({
      branchId: { $in: branchIds },
      organizationId: new mongoose.Types.ObjectId(organizationId),
    }).select("name branchId");

    return returnFormatter(true, "Branch names fetched from workLocation model", workLocations);
  } catch (error) {
    console.error("Error in getBranchByJobPost:", error);
    return returnFormatter(false, error.message);
  }
}

