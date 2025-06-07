import { handleSingleFileUpload, handleMultipleFileUpload } from "../../services/uploadservices/upload.service.js"

export const uploadImageOrPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'uploads';
    const url = await handleSingleFileUpload(req.file, folder);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url
    });
  } catch (error) {
    console.error('Single upload error:', error);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
};


export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' });

    const urls = await handleMultipleFileUpload(req.files, req.body.folder || 'uploads');
    res.status(200).json({ urls });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Multiple upload failed' });
  }
};
