import express from "express";
import multer from "multer";
import {
  getFileSystem,
  createNewFolder,
  uploadSingleFile,
  searchFilesAndFolders,
  advancedFileSearch,
recentFilesController,
  mostActiveFilesController,
  folderDataUsageController
  
} from "../../controllers/fileShare/finalFileShare.controller.js";

import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"


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
router.get('/list-objects',verifyEmployeeToken, getFileSystem);

router.post('/create-folder',verifyEmployeeToken, createNewFolder);

router.post('/upload', verifyEmployeeToken, singleFileUpload, uploadSingleFile);

router.post('/search',verifyEmployeeToken, searchFilesAndFolders);
router.get('/search/advanced',verifyEmployeeToken, advancedFileSearch);

router.get('/recent-activity', verifyEmployeeToken, recentFilesController);

// Most active files/folders (paginated)
router.get('/most-active', verifyEmployeeToken, mostActiveFilesController);

router.get('/folder-data-usage', verifyEmployeeToken, folderDataUsageController);


export default router;
