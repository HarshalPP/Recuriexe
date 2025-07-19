const {
  badRequest,
  parseJwt,
  success,
  unknownError,
  unauthorized,
} = require("../../../../../globalHelper/response.globalHelper");

const { returnFormatter } = require("../../formatter/common.formatter");

const {
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
} = require("../../helper/branch.helper");

const newBranch = require("../../model/adminMaster/newBranch.model")

//-----------------------Add new branch ------------------------------
async function addBranchController(req, res) {
  try {
    const { status, message, data } = await addBranch(req, req.body);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

//----------------------------get all branch ---------------------------------------

async function getAllBranchController(req, res) {
  try {
    const { status, message, data } = await getAllBranch(req, res);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

async function getAllMapBranchController(req, res) {
  try {
    const { status, message, data } = await getAllMapBranch(req, res);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


// get BranchOnly Name // 

async function getAllBranchdata(req, res) {
  try {

    const findBranh = await newBranch.find({
      isActive: true,
    }).select('name PaymentGateway')

    if (!findBranh) {
      return res.status(400).json({ message: 'Branch not found' })
    }

    return res.status(200).json({
      status: true,
      data: findBranh
    })

  }
  catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get all branch ---------------------------------------

async function getAllCountWebsiteController(req, res) {
  try {
    const { status, message, data } = await getAllCountWebsite(req, res);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get all inactive branch ---------------------------------------

async function getAllInactiveBranchController(req, res) {
  try {
    const { status, message, data } = await getAllInactiveBranch(req, res);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get all regional branch ---------------------------------------

async function getRegionalBranchController(req, res) {
  try {
    const { status, message, data } = await getRegionalBranch();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get branch by ID ---------------------------------------

async function getBranchByIdController(req, res) {
  try {
    const { status, message, data } = await getBranchById(req, req.params.branchId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get branch by ID ---------------------------------------

async function getBranchByRegionalIdController(req, res) {
  try {
    // console.log(req.params.branchId);
    const { status, message, data } = await getBranchByRegionalId(
      req.params.branchId
    );
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

//-----------------------update new branch ------------------------------
async function updateBranchController(req, res) {
  try {
    const { status, message, data } = await updateBranch(req, req.body.Id, req.body);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

//---------------------------deacyive branch---------------------------------------------
async function deactivateBranchByIdController(req, res) {
  try {
    const { status, message, data } = await deactivateBranch(req, req.params.branchId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

async function branchWiseEmployeeList(req, res) {
  try {
    const { status, message, data } = await getBranchWiseEmployeList(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


// 1. Get list of regional branches (only _id and name)
async function allRegionalBranches(req, res) {
  try {
    const regionalBranches = await newBranch.find({ regional: true, status: "active" }).select("name _id").sort({ name: 1 });

    return success(res, "All Regional Branches", { list: regionalBranches });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// 2. Get branches by regionalBranchId (show only _id and name)
async function branchesByRegionalBranch(req, res) {
  try {
    const { regionalBranchId } = req.query;

    if (!regionalBranchId) {
      return badRequest(res, "regional Branch is required");
    }

    // Check if the regionalBranchId is valid
    
    let branches;
    if (regionalBranchId === "all") {
      branches = await newBranch.find(
        { status: "active" },
        { _id: 1, name: 1 }
      );
    } else {
      const regionalBranch = await newBranch.findById(regionalBranchId);
      if (!regionalBranch) {
        return badRequest(res, "Invalid regionalBranchId");
      }
      branches = await newBranch.find(
        { regionalBranchId, status: "active" },
        { _id: 1, name: 1 }
      );
    }

    return success(res, "All Branches", { list: branches });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};


module.exports = {
  addBranchController,
  getAllBranchController,
  getAllCountWebsiteController,
  getRegionalBranchController,
  getBranchByIdController,
  getBranchByRegionalIdController,
  updateBranchController,
  deactivateBranchByIdController,
  getAllInactiveBranchController,
  branchWiseEmployeeList,
  getAllBranchdata,
  branchesByRegionalBranch,
  allRegionalBranches,
  getAllMapBranchController
};
