import { Router } from "express";
import { uploadFile, uploadMultipleFile } from "../../controllers/uploadCommandController/fileUpload.controller.js";
import uploads from "../../middleware/multer.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";


const uploadRouter = Router();


uploadRouter.post("/upload",verifyEmployeeToken,uploads.single("image"),uploadFile);

uploadRouter.post("/multi-mupload",verifyEmployeeToken,uploads.array("images"),uploadMultipleFile);

export default uploadRouter;