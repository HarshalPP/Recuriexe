c

import mongoose from 'mongoose';
  const ObjectId = mongoose.Types.ObjectId;

import fileSharingModel from "../../models/fileShareModel/fileShare.model.js"
import fileFolderModel       from '../../models/fileShareModel/fileFolder.model.js';
import {fileShare,advancedSearch,createFolder,
    downloadFolderAsZip,downloadMultipleAsZip,
    generateDownloadUrl,generateUploadUrl,searchObjects,
    streamFileDownload,uploadFile,uploadMultipleFiles} from "../../services/fileShareService/fileShare.service.js";



export async function getFileSystem(req, res) {
    try {
        const { prefix,folderId  } = req.query;
        const { status, message, data } = await fileShare(prefix,folderId );
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Download a single file
 */
export async function downloadFile(req, res) {
    try {
      const { key } = req.query;
      
      if (!key) {
        return badRequest(res, 'File key is required');
      }
      
      // This function will handle the response directly
      await streamFileDownload(key, res);
      
    } catch (error) {
      // Only return error if headers haven't been sent
      if (!res.headersSent) {
        return unknownError(res, error.message);
      }
    }
  }
  
  /**
   * Get a download URL for a file
   */
export async function getDownloadUrl(req, res) {
    try {
      const { key } = req.query;
      
      if (!key) {
        return badRequest(res, 'File key is required');
      }
      
      const result = await generateDownloadUrl(key);
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Download multiple files as a ZIP
   */
export async function downloadMultipleFiles(req, res) {
    try {
      const { keys } = req.body;
      
      if (!keys || !Array.isArray(keys) || keys.length === 0) {
        return badRequest(res, 'Array of file keys is required');
      }
      
      // This function will handle the response directly
      await downloadMultipleAsZip(keys, res);
      
    } catch (error) {
      // Only return error if headers haven't been sent
      if (!res.headersSent) {
        return unknownError(res, error.message);
      }
    }
  }
  
  /**
   * Download a folder as a ZIP
   */
export async function downloadFolder(req, res) {
    try {
      const { key } = req.query;
      
      if (!key) {
        return badRequest(res, 'Folder key is required');
      }
      
      // This function will handle the response directly
      await downloadFolderAsZip(key, res);
      
    } catch (error) {
      // Only return error if headers haven't been sent
      if (!res.headersSent) {
        return unknownError(res, error.message);
      }
    }
  }
  
  /**
   * Upload a single file
   */
export async function uploadSingleFile(req, res) {
  try {
    if (!req.file) {
      return badRequest(res, 'No file uploaded');
    }

    const { fileFolderId } = req.body;
    const uploadedBy = req.employee?.id;
    let destinationPath = process.env.FILESTOREFOLDER ;

    // ✅ Only use fileFolderId if it's a valid ObjectId
    if (fileFolderId && ObjectId.isValid(fileFolderId)) {
      const folder = await fileFolderModel.findById(fileFolderId);
      // console.log("d",folder)
      if (folder.path) {
        destinationPath = folder.path;
      }
    }

    // Upload file
    const result = await uploadFile(req.file, destinationPath);
    if (!result.status) {
      return badRequest(res, result.message);
    }

    // Save metadata
    const fileData = {
      fileName: req.file.originalname,
      fileKey: destinationPath,
      url: result.data.location,
      size: req.file.size,
      mimeType: req.file.mimetype,
      fileFolderId: fileFolderId || null,
      uploadedBy: uploadedBy || null
    };

    const saved = await fileSharingModel.create(fileData);

    return success(res, 'File uploaded and saved successfully', saved);
  } catch (error) {
    console.error("Upload Error:", error);
    return unknownError(res, error.message);
  }
}
  
  /**
   * Upload multiple files
   */
export async function uploadManyFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return badRequest(res, 'No files uploaded');
      }
      
      const { path } = req.body;
      const result = await uploadMultipleFiles(req.files, path || '');
      
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Create a new folder
   */
export async function createNewFolder(req, res) {
    try {
      const { path, parentId } = req.body;
      const createdBy = req.employee.id;
      if (!path) {
        return badRequest(res, 'Folder path is required');
      }
      
      const result = await createFolder(path,parentId ,createdBy);
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Search for files and folders
   */
export async function searchFileSystem(req, res) {
    try {
      const { query, prefix } = req.query;
      
      if (!query) {
        return badRequest(res, 'Search query is required');
      }
      
      const result = await searchObjects(query, prefix || '');
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Advanced search with filters
   */
export async function advancedSearchFileSystem(options) {
  try {
    const {
      query,
      prefix = '',
      fileTypes = [],
      dateRange = {},
      sizeRange = {},
    } = options;

    const regexQuery = new RegExp(query, 'i');
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';

    // 🔍 Search folders
    const folderQuery = {
      name: regexQuery,
    };

    if (normalizedPrefix) {
      folderQuery.path = { $regex: `^${normalizedPrefix}`, $options: 'i' };
    }

    const matchedFolders = await fileFolderModel.find(folderQuery).lean();

    // 🔍 Search files
    const fileQuery = {
      fileName: regexQuery,
    };

    if (normalizedPrefix) {
      fileQuery.fileKey = { $regex: `^${normalizedPrefix}`, $options: 'i' };
    }

    if (fileTypes.length > 0) {
      fileQuery.mimeType = { $in: fileTypes.map(ext => new RegExp(ext, 'i')) };
    }

    if (dateRange.from || dateRange.to) {
      fileQuery.createdAt = {};
      if (dateRange.from) fileQuery.createdAt.$gte = new Date(dateRange.from);
      if (dateRange.to) fileQuery.createdAt.$lte = new Date(dateRange.to);
    }

    if (sizeRange.min || sizeRange.max) {
      fileQuery.size = {};
      if (sizeRange.min) fileQuery.size.$gte = sizeRange.min;
      if (sizeRange.max) fileQuery.size.$lte = sizeRange.max;
    }

    const matchedFiles = await fileSharingModel.find(fileQuery).lean();

    return {
      status: true,
      message: 'Search completed',
      data: {
        folders: matchedFolders.map(folder => ({
          _id: folder._id,
          name: folder.name,
          path: folder.path,
          type: 'folder',
          createdBy: folder.createdBy,
          createdAt: folder.createdAt
        })),
        files: matchedFiles.map(file => ({
          _id: file._id,
          name: file.fileName,
          key: file.fileKey,
          url: file.url,
          size: file.size,
          mimeType: file.mimeType,
          type: 'file',
          uploadedBy: file.uploadedBy,
          createdAt: file.createdAt
        }))
      }
    };

  } catch (error) {
    console.error("Search error:", error);
    return { status: false, message: error.message };
  }
}
  
  /**
   * Delete a file
   */
export async function deleteSingleFile(req, res) {
    try {
      const { key } = req.query;
      
      if (!key) {
        return badRequest(res, 'File key is required');
      }
      
      const result = await deleteFile(key);
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Delete multiple files
   */
export async function deleteMultipleItems(req, res) {
    try {
      const { keys } = req.body;
      
      if (!keys || !Array.isArray(keys) || keys.length === 0) {
        return badRequest(res, 'Array of file keys is required');
      }
      
      const result = await deleteMultipleFiles(keys);
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Delete a folder
   */
export async function deleteFolderItem(req, res) {
    try {
      const { key } = req.query;
      
      if (!key) {
        return badRequest(res, 'Folder key is required');
      }
      
      const result = await deleteFolder(key);
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Universal delete (auto-detects file or folder)
   */
export async function deleteFileSystemItem(req, res) {
    try {
      const { key, type } = req.query;
      
      if (!key) {
        return badRequest(res, 'File or folder key is required');
      }
      
      let result;
      
      // If type is specified, use the appropriate method
      if (type === 'folder' || key.endsWith('/')) {
        result = await deleteFolder(key);
      } else if (type === 'file' || !key.endsWith('/')) {
        result = await deleteFile(key);
      } else {
        return badRequest(res, 'Invalid type specified');
      }
      
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }


export async function getAllFiles(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const [files, total] = await Promise.all([
      fileSharingModel
        .find()
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      fileSharingModel.countDocuments()
    ]);

    if (!files || files.length === 0) {
      return badRequest(res, "No files found");
    }

    return success(res, "Files fetched successfully", {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalFiles: total,
      currentPageFilesCount: files.length,
      files
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return unknownError(res, error.message);
  }
}

