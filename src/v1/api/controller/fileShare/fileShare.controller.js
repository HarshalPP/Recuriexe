const { badRequest, success, unknownError } = require("../../../../../globalHelper/response.globalHelper");

const {fileShare,advancedSearch,createFolder,downloadFolderAsZip,downloadMultipleAsZip,generateDownloadUrl,generateUploadUrl,searchObjects,streamFileDownload,uploadFile,uploadMultipleFiles} = require("../../services/fileShare.service");



async function getFileSystem(req, res) {
    try {
        const { prefix } = req.query;
        const { status, message, data } = await fileShare(prefix);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

/**
 * Download a single file
 */
async function downloadFile(req, res) {
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
  async function getDownloadUrl(req, res) {
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
  async function downloadMultipleFiles(req, res) {
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
  async function downloadFolder(req, res) {
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
  async function uploadSingleFile(req, res) {
    try {
      if (!req.file) {
        return badRequest(res, 'No file uploaded');
      }
      
      const { path } = req.body;
      const result = await uploadFile(req.file, path || '');
      
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Upload multiple files
   */
  async function uploadManyFiles(req, res) {
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
  async function createNewFolder(req, res) {
    try {
      const { path } = req.body;
      
      if (!path) {
        return badRequest(res, 'Folder path is required');
      }
      
      const result = await createFolder(path);
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Search for files and folders
   */
  async function searchFileSystem(req, res) {
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
  async function advancedSearchFileSystem(req, res) {
    try {
      const { query, prefix, fileTypes, dateRange, sizeRange } = req.body;
      
      if (!query) {
        return badRequest(res, 'Search query is required');
      }
      
      const options = {
        query,
        prefix: prefix || '',
        fileTypes: fileTypes || [],
        dateRange: dateRange || {},
        sizeRange: sizeRange || {}
      };
      
      const result = await advancedSearch(options);
      return result.status ? success(res, result.message, result.data) : badRequest(res, result.message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  }
  
  /**
   * Delete a file
   */
  async function deleteSingleFile(req, res) {
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
  async function deleteMultipleItems(req, res) {
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
  async function deleteFolderItem(req, res) {
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
  async function deleteFileSystemItem(req, res) {
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

// Export all controllers
module.exports = {
  getFileSystem,
  downloadFile,
  getDownloadUrl,
  downloadMultipleFiles,
  downloadFolder,
  uploadSingleFile,
  uploadManyFiles,
  createNewFolder,
  searchFileSystem,
  advancedSearchFileSystem,
  deleteSingleFile,
  deleteMultipleItems,
  deleteFolderItem,
  deleteFileSystemItem
};
