const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");
const { spawn } = require('child_process');
const pm2 = require('pm2');
const fs = require("node:fs");
const AnsiToHtml = require('ansi-to-html');
const JSZip = require('jszip');
const axios = require('axios');
const sharp = require("sharp")

const {
  writeEnvFile,
  loadEnvFile,
  reloadPM2Process,
} = require("../../helper/server.helper");
const uploadToSpaces = require("../../services/spaces.service");


async function stageLogStream(req, res) {
  try {
    const ansiToHtml = new AnsiToHtml({ newline: true });

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (res.flushHeaders) res.flushHeaders();

    pm2.connect((err) => {
      if (err) {
        console.error(err);
        res.end();
        return;
      }

      pm2.launchBus((err, bus) => {
        if (err) {
          console.error(err);
          res.end();
          return;
        }

        // Production logs
        bus.on("log:out", (data) => {
          if (data.process.name === "finexe-prod") {
            const htmlLine = ansiToHtml.toHtml(data.data);
            // Format: <pm_id>|<process_name>  | <log_line>
            const prefix = `${data.process.pm_id}|${data.process.name}  | `;
            res.write("event: prod-out\n");
            res.write(`data: ${JSON.stringify(prefix + htmlLine)}\n\n`);
            if (res.flush) res.flush();
          }
        });

        // Staging logs
        bus.on("log:out", (data) => {
          if (data.process.name === "loan-stage") {
            const htmlLine = ansiToHtml.toHtml(data.data);
            const prefix = `${data.process.pm_id}|${data.process.name}  | `;
            res.write("event: stage-out\n");
            res.write(`data: ${JSON.stringify(prefix + htmlLine)}\n\n`);
            if (res.flush) res.flush();
          }
        });

        // Error logs
        bus.on("log:err", (data) => {
          const htmlLine = ansiToHtml.toHtml(data.data);
          const prefix = `${data.process.pm_id}|${data.process.name}  | `;
          res.write("event: err\n");
          res.write(`data: ${JSON.stringify(prefix + htmlLine)}\n\n`);
          if (res.flush) res.flush();
        });

        req.on("close", () => {
          pm2.disconnect();
        });
      });
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// Routes

/**
 * GET /api/env/:envName
 * Retrieves the environment variables for the specified environment.
 */
const getEnv = async (req, res) => {
  const { envName } = req.params;

  // Security: Validate envName against allowed environments
  const allowedEnvs = ["stage", "production"];
  if (!allowedEnvs.includes(envName)) {
    return badRequest(res, "Invalid environment name.");
  }

  try {
    const envVars = await loadEnvFile(envName);
    return success(res, "env data", envVars);
  } catch (error) {
    return unknownError(res,error.message)
  }
};


const updateEnv = async (req, res) => {
  const { envName } = req.params;
  const newVars = req.body; // Expecting { KEY: "value", ... }

  // Security: Validate envName against allowed environments
  const allowedEnvs = ["stage", "production"];
  if (!allowedEnvs.includes(envName)) {
    return badRequest(res, "Invalid environment name.");
  }

  // Security: Validate newVars
  if (typeof newVars !== "object" || Array.isArray(newVars)) {
    return badRequest(res, "Invalid data format. Expecting key-value pairs.");
  }

  // Optional: Further validation on keys and values (e.g., allowed characters)

  try {
    await writeEnvFile(envName, newVars);

    // Optionally reload PM2 process to apply changes
    // Replace 'your-process-name' with the actual PM2 process name
    // You might need to map envName to processName if different
    let processName;
    if (envName === "stage") processName = "loan-stage";
    if (envName === "production") processName = "finexe-prod";

    success(
      res,
      `.env.${envName} updated and PM2 process '${processName}' reloaded.`
    );
    await reloadPM2Process(processName);
  } catch (error) {
    return unknownError(res,error.message)
  }
};

const uploadImage = async (req, res) => {
  try {
    // Validate file existence
    if (!req.file) {
      return badRequest(res,"No file provided.")
    }
    
    // Read the file from the temp folder
    const fileContent = fs.readFileSync(req.file.path);
    const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/IMAGE/${Date.now()}_${req.file.originalname}`;
    const contentType = req.file.mimetype;

    // Call our separate upload function
    const bucketName = 'finexe';
    // const data = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType);
    const data = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType, {
      'Content-Disposition': 'inline', // To display in browser
      'Content-Type': contentType
    });

    // Clean up the temp file
    fs.unlinkSync(req.file.path);

    // data.Location will be the public URL of the uploaded file (if ACL is public)
    return success(res,"File uploaded successfully!",{image: `https://cdn.fincooper.in/${filePathInBucket}`})

  } catch (error) {
    console.error('Error uploading to Spaces:', error);

    // If something fails, attempt to remove the temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return unknownError(res,error)

  }
}

const uploadImageCompress = async (req, res) => {
  try {
    console.log("uploadImage function start");

    // Validate file existence
    if (!req.file) {
      return badRequest(res, "No file provided.");
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);
    const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/IMAGE/${Date.now()}_${req.file.originalname}`;
    const contentType = req.file.mimetype;

    if (contentType === "image/gif") {
      fs.unlinkSync(filePath); // Delete temp file
      return badRequest(res, "GIF format Images is not allowed.");
    }

    console.log("Image compression started...");

    let compressedContent = fileContent;

    if (contentType.startsWith('image/')) {
      compressedContent = await sharp(fileContent)
        .resize({ width: 1200, withoutEnlargement: true }) // Resize
        .jpeg({ quality: 70 }) // Compression Quality
        .toBuffer();
    }

    console.log(`Compressed Size: ${fileContent.length} → ${compressedContent.length}`);

    const data = await uploadToSpaces('finexe', filePathInBucket, compressedContent, 'public-read', contentType, {
      'Content-Disposition': 'inline',
      'Content-Type': contentType
    });

    // Delete temp file
    fs.unlinkSync(filePath);

    return success(res, "File uploaded successfully!", { image: `https://cdn.fincooper.in/${filePathInBucket}` });

  } catch (error) {
    console.error("Error uploading image:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return unknownError(res, error);
  }
};


  
  


const uploadPdf = async (req, res) => {
  try {
    // Validate file existence
    if (!req.file) {
      return badRequest(res,"No file provided.")
    }
    
    // Read the file from the temp folder
    const fileContent = fs.readFileSync(req.file.path);
    const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/Pdf/${Date.now()}_${req.file.originalname}`;
    const contentType = req.file.mimetype;

    // Call our separate upload function
    const bucketName = 'finexe';
    // const data = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType);
    const data = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType, {
      'Content-Disposition': 'inline', // To display in browser
      'Content-Type': contentType
    });

    // Clean up the temp file
    fs.unlinkSync(req.file.path);

    // data.Location will be the public URL of the uploaded file (if ACL is public)
    return success(res,"File uploaded successfully!",{image: `https://cdn.fincooper.in/${filePathInBucket}`})

  } catch (error) {
    console.error('Error uploading to Spaces:', error);

    // If something fails, attempt to remove the temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return unknownError(res,error)

  }
}


// upload zip file
// const uploadZip = async (files, fileName) => {
//   try {
//     console.log(files, fileName, "files, fileName");
//     const zip = new JSZip();

//     // Download all PDFs and add to zip
//     const downloadPromises = files.map(async (file) => {
//       try {
//         // Download the PDF
//         const response = await axios({
//           method: 'get',
//           url: file.url,
//           responseType: 'arraybuffer'
//         });

//         // Add to zip with the specified name
//         zip.file(file.name, response.data);
//       } catch (downloadError) {
//         console.error(`Error downloading file ${file.url}:`, downloadError);
//         throw downloadError;
//       }
//     });

//     // Wait for all downloads to complete
//     await Promise.all(downloadPromises);

//     // Generate the zip file
//     const zipBuffer = await zip.generateAsync({
//       type: 'nodebuffer',
//       compression: 'DEFLATE'
//     });

//     const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/DOWNLOAD/${Date.now()}_${fileName}`;
//     const contentType = 'application/zip';

//     // Use existing uploadToSpaces function
//     const bucketName = 'finexe';
//     await uploadToSpaces(bucketName, filePathInBucket, zipBuffer, 'public-read', contentType);

//     return `https://cdn.fincooper.in/${filePathInBucket}`;

//   } catch (error) {
//     console.error('Error creating/uploading zip:', error);
//     throw error;
//   }
// };

const uploadZip = async (files, fileName) => {
  try {
    console.log(files, fileName, "files, fileName");
    const zip = new JSZip();
    
    // Track successful files
    let successCount = 0;

    // Download all files and add to zip
    const downloadPromises = files.map(async (file, index) => {
      try {
        console.log(`Starting download of file ${index + 1}/${files.length}: ${file.url}`);
        
        // Extract correct file extension from URL
        const url = file.url;
        const urlParts = url.split('.');
        const fileExtension = urlParts.length > 1 ? urlParts.pop().toLowerCase() : 'pdf';
        
        // Ensure file name has correct extension
        let fileName = file.name;
        if (!fileName.endsWith(`.${fileExtension}`)) {
          fileName = fileName.replace(/\.[^/.]+$/, '') + `.${fileExtension}`;
        }
        
        // Download the file
        const response = await axios({
          method: 'get',
          url: url,
          responseType: 'arraybuffer',
          timeout: 30000 // 30 second timeout
        });
        
        console.log(`Downloaded file ${index + 1}: ${fileName} (${response.data.byteLength} bytes)`);
        
        // Verify we have valid data before adding to zip
        if (response.data && response.data.byteLength > 0) {
          // Add to zip with the specified name
          zip.file(fileName, response.data);
          successCount++;
          console.log(`Added ${fileName} to zip archive`);
        } else {
          console.warn(`Skipping empty file: ${fileName}`);
        }
      } catch (downloadError) {
        console.error(`Error downloading file ${file.url}:`, downloadError);
        // Continue with other files even if one fails
      }
    });

    // Wait for all downloads to complete
    await Promise.all(downloadPromises);
    
    // Check if we have any files in the zip
    if (successCount === 0) {
      throw new Error('No files were successfully downloaded and added to the zip');
    }

    console.log(`Generating zip with ${successCount} files`);
    
    // Generate the zip file
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6 // Default compression level
      }
    });
    
    console.log(`Zip generated successfully (${zipBuffer.length} bytes)`);

    const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/DOWNLOAD/${Date.now()}_${fileName}`;
    const contentType = 'application/zip';

    // Upload to cloud storage
    console.log(`Uploading zip to ${filePathInBucket}`);
    const bucketName = 'finexe';
    await uploadToSpaces(bucketName, filePathInBucket, zipBuffer, 'public-read', contentType);
    
    console.log(`Zip uploaded successfully`);

    return `https://cdn.fincooper.in/${filePathInBucket}`;

  } catch (error) {
    console.error('Error creating/uploading zip:', error);
    throw error;
  }
};

module.exports = {
  stageLogStream,
  getEnv,
  updateEnv,
  uploadImage,
  uploadZip,
  uploadImageCompress
};
