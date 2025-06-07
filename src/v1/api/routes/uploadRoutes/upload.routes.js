import express from 'express';
import multer from 'multer';
import { uploadImageOrPdf, uploadMultipleImages } from "../../controllers/uploadController/upload.controller.js"

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/uploadSingle', upload.single('file'), uploadImageOrPdf);
router.post('/uploadMultiple', upload.array('files'), uploadMultipleImages);

export default router;
