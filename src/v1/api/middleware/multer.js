import multer, { diskStorage } from "multer";

const storage = diskStorage({
    destination: function(req, file, cb) {
        cb(null, './sheet/');
    },
    filename: function(req, file, cb) {
        cb(null, `${new Date().toDateString().replaceAll(" ","-")}_${new Date().getTime()}_${(file.originalname).replaceAll(" ","-")}`);
    },
});

const uploads = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Set file size limit to 5MB
});

export default uploads;
