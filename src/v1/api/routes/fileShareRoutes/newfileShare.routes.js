import express from "express";
import multer from "multer";
import {
  getFileSystem,
  advancedSearchFileSystem,
  createNewFolder,
  deleteFileSystemItem,
  deleteFolderItem,
  deleteMultipleItems,
  deleteSingleFile,
  downloadFile,
  downloadFolder,
  downloadMultipleFiles,
  getDownloadUrl,
  searchFileSystem,
  uploadManyFiles,
  uploadSingleFile
} from "../../controllers/fileShare/newFileShare.controller.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 50MB file size limit
  }
});

// Multer middleware
const singleFileUpload = upload.single('file');
const multipleFileUpload = upload.array('files', 10);

/**
 * List files and folders
 * GET /api/v1/fileShare/list-objects
 * Query params:
 * - prefix: Path prefix to list (optional)
 */
router.get('/list-objects', getFileSystem);

/**
 * Download a file
 * GET /api/v1/fileShare/download
 * Query params:
 * - key: File key to download
 */
router.get('/download', downloadFile);

/**
 * Generate a pre-signed download URL
 * GET /api/v1/fileShare/download-url
 * Query params:
 * - key: File key to generate download URL for
 */
router.get('/download-url', getDownloadUrl);

/**
 * Download multiple files as a ZIP
 * POST /api/v1/fileShare/download-multiple
 * Body:
 * - keys: Array of file keys to download
 */
router.post('/download-multiple', downloadMultipleFiles);

/**
 * Download a folder as a ZIP
 * GET /api/v1/fileShare/download-folder
 * Query params:
 * - key: Folder key to download
 */
router.get('/download-folder', downloadFolder);

/**
 * Upload a file
 * POST /api/v1/fileShare/upload
 * Form data:
 * - file: File to upload
 * - path: Destination path (optional)
 */
router.post('/upload', singleFileUpload, uploadSingleFile);

/**
 * Upload multiple files
 * POST /api/v1/fileShare/upload-multiple
 * Form data:
 * - files: Files to upload
 * - path: Destination path (optional)
 */
router.post('/upload-multiple', multipleFileUpload, uploadManyFiles);

/**
 * Create a new folder
 * POST /api/v1/fileShare/create-folder
 * Body:
 * - path: Folder path to create
 */
router.post('/create-folder', createNewFolder);

/**
 * Search for files and folders
 * GET /api/v1/fileShare/search
 * Query params:
 * - query: Search query
 * - prefix: Path prefix to limit search (optional)
 */
router.get('/search', searchFileSystem);

/**
 * Advanced search with filters
 * POST /api/v1/fileShare/advanced-search
 * Body:
 * - query: Search query
 * - prefix: Path prefix to limit search (optional)
 * - fileTypes: Array of file extensions to filter by (optional)
 * - dateRange: Object with from and to dates (optional)
 * - sizeRange: Object with min and max sizes in bytes (optional)
 */
router.post('/advanced-search', advancedSearchFileSystem);

/**
 * Delete a file
 * DELETE /api/v1/fileShare/delete-file
 * Query params:
 * - key: File key to delete
 */
router.delete('/delete-file', deleteSingleFile);

/**
 * Delete multiple files
 * POST /api/v1/fileShare/delete-multiple
 * Body:
 * - keys: Array of file keys to delete
 */
router.post('/delete-multiple', deleteMultipleItems);

/**
 * Delete a folder and all its contents
 * DELETE /api/v1/fileShare/delete-folder
 * Query params:
 * - key: Folder key to delete
 */
router.delete('/delete-folder', deleteFolderItem);

/**
 * Universal delete endpoint (auto-detects file or folder)
 * DELETE /api/v1/fileShare/delete
 * Query params:
 * - key: File or folder key to delete
 * - type: Explicitly specify 'file' or 'folder' (optional)
 */
router.delete('/delete', deleteFileSystemItem);

export default router;
