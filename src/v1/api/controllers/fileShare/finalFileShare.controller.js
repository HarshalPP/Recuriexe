import { badRequest, success, unknownError } from "../../formatters/globalResponse.js";
import {
  fileShare,
  createFolder,
  uploadFile,
  searchObjects,
  advancedSearch
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
async function advancedFileSearch(req, res) {
  try {
    const options = req.body; // expects { query, prefix, maxResults, fileTypes, dateRange, sizeRange }
    const result = await advancedSearch(options, req);
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
  advancedFileSearch
};

