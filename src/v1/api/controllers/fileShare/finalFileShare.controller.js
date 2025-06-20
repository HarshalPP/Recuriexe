import { badRequest, success, unknownError } from "../../formatters/globalResponse.js";
import {
  fileShare,
  createFolder,
  uploadFile,
  searchObjects,
  advancedSearch,
  getRecentActivities,
  getMostActiveFiles,
  getFolderDataUsage
} from "../../services/fileShareService/finalFileShare.services.js";

async function getFileSystem(req, res) {
  try {
    // parentId query param se lein (root ke liye null ya empty)
    const { parentId } = req.query;
    const result = await fileShare(req, parentId);
    if (result.status) {
      return success(res, result.message, result.data);
    } else {
      return badRequest(res, result.message);
    }
    
  } catch (error) {
    return unknownError(res, error);
  }
}

async function createNewFolder(req, res) {
  try {
    const { path, candidateId } = req.body;
    if (!path ) {
      return badRequest(res, 'Folder path is required');
    }
    const result = await createFolder(path, req); // req pass karein
    return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
  } catch (error) {
    return unknownError(res, error);
  }
}

async function uploadSingleFile(req, res) {
  try {
    const { path, candidateId } = req.body;
    // if (!candidateId) {
    //   return badRequest(res, 'candidateId is required');
    // }
    if (!path ) {
      return badRequest(res, 'Folder path is required');
    }
    if (!req.file) {
      return badRequest(res, 'File is required');
    }
    const result = await uploadFile(req.file, path || '', req);
    return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
  } catch (error) {
    return unknownError(res, error);
  }
}

// Search for files and folders (simple)
async function searchFilesAndFolders(req, res) {
  try {
    const { query, prefix, maxResults } = req.body;
    const result = await searchObjects(query, prefix, maxResults || 100,false, req,parentId);
    return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
  } catch (error) {
    return unknownError(res, error);
  }
}

// Advanced search
// async function advancedFileSearch(req, res) {
//   try {
//     const options = req.body; // expects { query, prefix, maxResults, fileTypes, dateRange, sizeRange }
//     const result = await advancedSearch(options, req);
//     return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
//   } catch (error) {
//     return unknownError(res, error);
//   }
// }

async function advancedFileSearch(req, res) {
  try {
    // Parse query params
    const {
      query = '',
      prefix = '',
      maxResults = 100,
      parentId = null,
      fileTypes,
      dateRange,
      sizeRange
    } = req.query;

    // fileTypes: comma separated string to array
    let fileTypesArr = [];
    if (fileTypes) {
      fileTypesArr = typeof fileTypes === 'string' ? fileTypes.split(',').map(f => f.trim()) : [];
    }

    // dateRange: JSON string or separate from/to
    let dateRangeObj = {};
    if (dateRange) {
      try {
        dateRangeObj = JSON.parse(dateRange);
      } catch {
        // fallback: ?dateRange.from=...&dateRange.to=...
        if (req.query['dateRange.from'] || req.query['dateRange.to']) {
          dateRangeObj = {
            from: req.query['dateRange.from'],
            to: req.query['dateRange.to']
          };
        }
      }
    }

    // sizeRange: JSON string or separate min/max
    let sizeRangeObj = {};
    if (sizeRange) {
      try {
        sizeRangeObj = JSON.parse(sizeRange);
      } catch {
        if (req.query['sizeRange.min'] || req.query['sizeRange.max']) {
          sizeRangeObj = {
            min: req.query['sizeRange.min'] ? Number(req.query['sizeRange.min']) : undefined,
            max: req.query['sizeRange.max'] ? Number(req.query['sizeRange.max']) : undefined
          };
        }
      }
    }

    // Prepare options object for service
    const options = {
      query,
      prefix,
      maxResults: Number(maxResults),
      parentId,
      fileTypes: fileTypesArr,
      dateRange: dateRangeObj,
      sizeRange: sizeRangeObj
    };

    const result = await advancedSearch(options, req);
    return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
  } catch (error) {
    return unknownError(res, error);
  }
}

// Recent Activity (paginated)
async function recentFilesController(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getRecentActivities(req, page, limit);
    return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
  } catch (error) {
    return unknownError(res, error);
  }
}

// Most Active Files/Folders (paginated)
async function mostActiveFilesController(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getMostActiveFiles(req, page, limit);
    return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
  } catch (error) {
    return unknownError(res, error);
  }
}

async function folderDataUsageController(req, res) {
  try {
    const result = await getFolderDataUsage(req);
    return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
  } catch (error) {
    return unknownError(res, error);
  }
}

export {
  getFileSystem,
  createNewFolder,
  uploadSingleFile,
  searchFilesAndFolders,
  advancedFileSearch,
  recentFilesController,
  mostActiveFilesController,
  folderDataUsageController
 
};