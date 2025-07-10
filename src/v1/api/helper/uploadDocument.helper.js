import fs from 'fs';
import { returnFormatter } from '../formatters/common.formatter.js';
import  uploadToSpaces, { checkFolderExists, createFolder }  from '../services/commandServices/uploadToSpace.service.js';

// export const uploadFileDoc = async (req) => {
//   try {
//     // Validate file existence
//     if (!req.file) {
//       return returnFormatter(false, "No document found");
//     }

//     // Read the file from the temp folder
//     const fileContent = fs.readFileSync(req.file.path);
//     const contentType = req.file.mimetype;
//     let folderName = "";
    
//     if (contentType.startsWith("image/")) {
//         folderName = "images";
//     } else if (contentType.startsWith("video/")) {
//         folderName = "videos";
//     } else if (contentType.startsWith("audio/")) {
//         folderName = "audios";
//     } else if (contentType.startsWith("application/pdf")) {
//         folderName = "documents";
//     } else {
//         folderName = "others"; 
//     }
    
//     const filePathInBucket = `${process.env.PATH_BUCKET}/vendor_managment/${folderName}/${Date.now()}_${req.file.originalname}`;
   
//     // Call our separate upload function
//     const bucketName = 'vendor';
//     const data = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType, {
//       'Content-Disposition': 'inline', // To display in browser
//       'Content-Type': contentType
//     });

//     // Clean up the temp file
//     fs.unlinkSync(req.file.path);

//     // Return success response with file URL
//     return returnFormatter(true, "File uploaded successfully!", { fileUrl: `https://tech-cdn.fincooper.in/${filePathInBucket}` });

//   } catch (error) {
//     console.error('Error uploading to Spaces:', error);

//     // If an error occurs, remove the temp file if it exists
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }

//     return returnFormatter(false, error.message);
//   }
// };



export const uploadFileDoc = async (req) => {
  try {
    // Validate file existence
    if (!req.file) {
      return returnFormatter(false, "No document found");
    }

    const userId = req.employee?.organizationId
    if (!userId) {
      return returnFormatter(false, "User ID is required");
    }

    // Read the file from the temp folder
    const fileContent = fs.readFileSync(req.file.path);
    const contentType = req.file.mimetype;
    let folderName = "";

    if (contentType.startsWith("image/")) {
      folderName = "images";
    } else if (contentType.startsWith("video/")) {
      folderName = "videos";
    } else if (contentType.startsWith("audio/")) {
      folderName = "audios";
    } else if (contentType.startsWith("application/pdf")) {
      folderName = "documents";
    } else {
      folderName = "others";
    }

    // Construct the user-specific folder path
    const userFolderPath = `${process.env.PATH_BUCKET}/vendor_management/${userId}`;
    const filePathInBucket = `${userFolderPath}/${folderName}/${Date.now()}_${req.file.originalname}`;

    // Check if user folder exists in Spaces (This depends on your upload service, so update accordingly)
    const bucketName = 'vendor';
    
    // Assuming uploadToSpaces can list objects, otherwise implement a separate check
    const folderExists = await checkFolderExists(bucketName, userFolderPath);
    if (!folderExists) {
      await createFolder(bucketName, userFolderPath);
    }

    // Upload the file
    const data = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType, {
      'Content-Disposition': 'inline', // To display in browser
      'Content-Type': contentType
    });

    // Clean up the temp file
    fs.unlinkSync(req.file.path);

    // Return success response with file URL
    return returnFormatter(true, "File uploaded successfully!", { fileUrl: `https://tech-cdn.fincooper.in/${filePathInBucket}` });

  } catch (error) {
    console.error('Error uploading to Spaces:', error);

    // If an error occurs, remove the temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return returnFormatter(false, error.message);
  }
};



export const uploadMultipleFilesDoc = async (req) => {
  try {
    // Validate file existence
    if (!req.files || req.files.length === 0) {
      return returnFormatter(false, "No documents found");
    }

    const userId = req.employee?.organizationId;
    if (!userId) {
      return returnFormatter(false, "User ID is required");
    }

    const bucketName = 'vendor';
    const userFolderPath = `${process.env.PATH_BUCKET}/vendor_management/${userId}`;

    // // Check and create user folder if not exists
    // const folderExists = await checkFolderExists(bucketName, userFolderPath);
    // if (!folderExists) {
    //   await createFolder(bucketName, userFolderPath);
    // }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const fileContent = fs.readFileSync(file.path);
        const contentType = file.mimetype;

        let folderName = "others";
        if (contentType.startsWith("image/")) {
          folderName = "images";
        } else if (contentType.startsWith("video/")) {
          folderName = "videos";
        } else if (contentType.startsWith("audio/")) {
          folderName = "audios";
        } else if (contentType.startsWith("application/pdf")) {
          folderName = "documents";
        }

        const filePathInBucket = `${userFolderPath}/${folderName}/${Date.now()}_${file.originalname}`;

        const data = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType, {
          'Content-Disposition': 'inline',
          'Content-Type': contentType
        });

        // Clean up the temp file
        fs.unlinkSync(file.path);

        uploadedFiles.push(
       `https://tech-cdn.fincooper.in/${filePathInBucket}`
        );
      } catch (fileError) {
        console.error(`Error uploading file ${file.originalname}:`, fileError);

        // Clean temp file if error occurs
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return returnFormatter(false, "No files were uploaded successfully.");
    }

    return returnFormatter(true, "Files uploaded successfully!", { files: uploadedFiles });

  } catch (error) {
    console.error('Error uploading multiple files to Spaces:', error);
    return returnFormatter(false, error.message);
  }
};
