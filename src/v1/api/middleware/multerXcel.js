import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), './uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const uploadByExcel = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept excel and csv files
    const filetypes = /xlsx|xls|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check MIME types for Excel and CSV
    const mimetypes = /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application\/vnd.ms-excel|text\/csv|application\/csv/;
    const mimetype = mimetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed!'));
    }
  }
});