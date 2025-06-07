
import express from 'express'
const router = express.Router();

import { getFileSystem,advancedSearchFileSystem,createNewFolder,deleteFileSystemItem,
    deleteFolderItem,deleteMultipleItems,deleteSingleFile,downloadFile,downloadFolder,
    downloadMultipleFiles,getDownloadUrl,searchFileSystem,uploadManyFiles,
    uploadSingleFile ,getAllFiles} from "../../controllers/fileShare/fileShare.controller.js";

import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"
    
    // Configure multer for memory storage
 import multer from'multer';
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

router.get('/list-objects',verifyEmployeeToken , getFileSystem);
router.get('/download',verifyEmployeeToken , downloadFile);
router.get('/download-url',verifyEmployeeToken , getDownloadUrl);
router.post('/download-multiple',verifyEmployeeToken , downloadMultipleFiles);
router.get('/download-folder',verifyEmployeeToken , downloadFolder);
router.post('/singleUpload', verifyEmployeeToken , singleFileUpload , uploadSingleFile);
router.post('/upload-multiple', multipleFileUpload ,verifyEmployeeToken , uploadManyFiles);
router.post('/create-folder',verifyEmployeeToken , createNewFolder);
router.get('/search',verifyEmployeeToken , searchFileSystem);
router.post('/advanced-search',verifyEmployeeToken , advancedSearchFileSystem);
router.delete('/delete-file',verifyEmployeeToken , deleteSingleFile);
router.post('/delete-multiple',verifyEmployeeToken , deleteMultipleItems);
router.delete('/delete-folder',verifyEmployeeToken , deleteFolderItem);
router.delete('/delete',verifyEmployeeToken , deleteFileSystemItem);
router.get('/getAllFiles',verifyEmployeeToken ,getAllFiles)

export default router;
