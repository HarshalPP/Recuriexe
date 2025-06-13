import {
    badRequest,
    success,
    unknownError,
    unauthorized,
  } from "../../formatters/globalResponse.js"
  

  
  import {
    addBranch,
    getAllBranch,
    getAllListBranch,
    getRegionalBranch,
    getBranchById,
    getBranchByRegionalId,
    updateBranch,
    deactivateBranch,
    getAllInactiveBranch,
    allBranchHrms
  } from "../../services/branchservices/branch.service.js"
  
  import newBranch from "../../models/branchModel/branch.model.js"
  
  //----------------------- Add new branch ------------------------------
  
  export async function addBranchController(req, res) {
    try {
      const { status, message, data } = await addBranch(req, req.body);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //---------------------------- Get all branch ---------------------------------------
  export async function getAllBranchController(req, res) {
    try {
      const { status, message, data } = await getAllBranch(req, res);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //---------------------------- Get all branch ---------------------------------------
  export async function getAllListBranchController(req, res) {
    try {
      const { status, message, data } = await getAllListBranch(req, res);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
//   export async function getAllMapBranchController(req, res) {
//     try {
//       const { status, message, data } = await getAllMapBranch(req, res);
//       return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   }
  
  //---------------------------- Get only Branch Name ---------------------------------------
  export async function getAllBranchdata(req, res) {
    try {
      const findBranh = await newBranch.find({ isActive: true }).select("name");
  
      if (!findBranh) {
        return res.status(400).json({ message: "Branch not found" });
      }
  
      return res.status(200).json({
        status: true,
        data: findBranh,
      });
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //---------------------------- Get all count for website ---------------------------------------
//   export async function getAllCountWebsiteController(req, res) {
//     try {
//       const { status, message, data } = await getAllCountWebsite(req, res);
//       return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   }
  
  //---------------------------- Get all inactive branch ---------------------------------------
  export async function getAllInactiveBranchController(req, res) {
    try {
      const { status, message, data } = await getAllInactiveBranch(req, res);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //---------------------------- Get all regional branch ---------------------------------------
  export async function getRegionalBranchController(req, res) {
    try {
      const { status, message, data } = await getRegionalBranch();
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //---------------------------- Get branch by ID ---------------------------------------
  export async function getBranchByIdController(req, res) {
    try {
      const { status, message, data } = await getBranchById(req, req.params.branchId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //---------------------------- Get branch by regional ID ---------------------------------------
  export async function getBranchByRegionalIdController(req, res) {
    try {
      const { status, message, data } = await getBranchByRegionalId(req.params.branchId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //----------------------- Update branch ------------------------------
  export async function updateBranchController(req, res) {
    try {
      console.log('req.body.Id')
      const { status, message, data } = await updateBranch(req, req.body.Id, req.body);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //--------------------------- Deactivate branch ---------------------------------------------
  export async function deactivateBranchByIdController(req, res) {
    try {
      const { status, message, data } = await deactivateBranch(req, req.params.branchId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  //--------------------------- Branch-wise employee list ---------------------------------------------
//   export async function branchWiseEmployeeList(req, res) {
//     try {
//       const { status, message, data } = await getBranchWiseEmployeList(req);
//       return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//       return unknownError(res, error.message);
//     }
//   }
  
  // 1. Get list of regional branches (only _id and name)
  export async function allRegionalBranches(req, res) {
    try {
      const regionalBranches = await newBranch.find({
        regional: true,
        status: "active",
      }).select("name _id");
  
      return success(res, "All Regional Branches", { list: regionalBranches });
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }
  
  // 2. Get branches by regionalBranchId (show only _id and name)
  export async function branchesByRegionalBranch(req, res) {
    try {
      const { regionalBranchId } = req.query;
      if (!regionalBranchId) {
        return badRequest(res, "regionalBranchId is required");
      }
  
      const branches = await newBranch.find(
        { regionalBranchId },
        { _id: 1, name: 1 }
      );
  
      return success(res, "All Branches", { list: branches });
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }
  

  //----------------------- get all branch ------------------------------
  export async function allBranch(req, res) {
    try {
      const { status, message, data } = await allBranchHrms(req, req.body);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }