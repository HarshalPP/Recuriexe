import uploadToSpaces from "../spaceservices/space.service.js"

/**
 * Upload a single file to DigitalOcean Spaces
 * @param {Object} file - Multer file object
 * @param {string} folderName - Folder name in the bucket
 * @returns {Promise<string>} - URL of uploaded file
 */
// export const handleSingleFileUpload = async (file, folderName = 'uploads') => {
//   const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'];

//   if (!allowedMimeTypes.includes(file.mimetype)) {
//     throw new Error(`Unsupported file type: ${file.mimetype}`);
//   }

//   const contentType = file.mimetype;
//   const extension = file.originalname.split('.').pop();
//   const timestamp = Date.now();
//   const filePathInBucket = `${process.env.PATH_BUCKET}/HRMS/IMAGE/${Date.now()}_${file.originalname}`;
//   const fileContent = file.buffer;

//   const url = await uploadToSpaces(
//     'finexe',
//     filePathInBucket,
//     fileContent,
//     'public-read',
//     contentType
//   );

//   return url;
// };


export const handleSingleFileUpload = async (file, folderName = 'DOCS') => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',                    // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',              // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain'                             // .txt
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Unsupported file type: ${file.mimetype}`);
  }

  const contentType = file.mimetype;
  const extension = file.originalname.split('.').pop();
  const timestamp = Date.now();

  // Dynamic folder based on file type
  let fileTypeFolder = 'OTHERS';
  if (contentType.startsWith('image/')) fileTypeFolder = 'IMAGE';
  else if (
    contentType.startsWith('application/pdf') ||
    contentType.includes('word') ||
    contentType.includes('excel') ||
    contentType === 'text/plain'
  ) {
    fileTypeFolder = folderName;
  }

  const filePathInBucket = `${process.env.PATH_BUCKET}/HRMS/${fileTypeFolder}/${timestamp}_${file.originalname}`;
  const fileContent = file.buffer;

  const url = await uploadToSpaces(
    'finexe',
    filePathInBucket,
    fileContent,
    'public-read',
    contentType
  );

  return url;
};



/**
 * Upload multiple files to DigitalOcean Spaces
 * @param {Array} files - Array of Multer file objects
 * @param {string} folderName - Folder name in the bucket
 * @returns {Promise<string[]>} - Array of uploaded file URLs
 */
export const handleMultipleFileUpload = async (files, folderName = 'uploads') => {
  const urls = await Promise.all(
    files.map(async (file) => {
      const contentType = file.mimetype;
      const filePath = `${folderName}/${Date.now()}_${file.originalname}`;
      const fileContent = file.buffer;

      const url = await uploadToSpaces(
        process.env.PATH_BUCKET,
        filePath,
        fileContent,
        'public-read',
        contentType
      );

      return url;
    })
  );

  return urls;
};
