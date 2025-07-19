const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  // const ObjectId = mongoose.fileNames.ObjectId;
  const fs = require("fs")
  const path = require('path');
  const axios = require('axios');
  const archiver = require("archiver");
  const {aadhaarMarkAsVerified} = require("../services/aadhar.services")
   // ------------------Form Data ONLY Image Upload And Get Image Url---------------------------------------
   
  async function imageUpload(req, res) {
    try {
      const { aadharMasking } = req.query; 

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (!req.file) {
        return badRequest(res, "Please Upload File.");
      }
      const fieldPath = `/uploads/${req.file.filename}`;
      if (aadharMasking === "true") {
        return aadhaarMarkAsVerified(req, res);
      }

      return success(res, "Upload an image and receive the URL.", { image: fieldPath });
  
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  }

  async function downloadSingleImage(req, res) {
    try {
      const { url } = req.body; // Get image URL from request body
      
      if (!url) {
        return badRequest(res, "URL is required");
      }
  
      // Get image from external URL
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream', 
      });
  
      // Get content type and original filename
      const contentType = response.headers['content-type'];
      const originalName = url.split('/').pop() || 'image.png';
  
      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
  
      // Pipe the image stream to the response
      response.data.pipe(res);
  
    } catch (error) {
      console.error("Error in downloadSingleImage:", error);
      return unknownError(res, error.message); 
    }
  }



  // const createZipFromUrls = async (files, outputFileName) => {
  //   try {
  //     const projectRoot = path.resolve(__dirname, '../../../..');
  //     const downloadsDirPath = path.join(projectRoot, 'uploads', 'downloads');
      
  //     await fs.promises.mkdir(downloadsDirPath, { recursive: true });
      
  //     const zipFilePath = path.join(downloadsDirPath, outputFileName);
  //     const output = fs.createWriteStream(zipFilePath);
      
  //     // Configure archiver with maximum compression
  //     const archive = archiver('zip', {
  //       zlib: { level: 9 }, // Maximum compression
  //       store: false // Enable compression
  //     });
  
  //     archive.pipe(output);
  
  //     const MAX_CONCURRENT = 5;
  //     const pool = new Set();
  //     const queue = [...files];
      
  //     const processImage = async (buffer) => {
  //       try {
  //         // Convert buffer to Sharp instance for image processing
  //         const image = sharp(buffer);
  //         const metadata = await image.metadata();
          
  //         // If image is larger than 800px in either dimension, resize it
  //         if (metadata.width > 800 || metadata.height > 800) {
  //           return await image
  //             .resize(800, 800, {
  //               fit: 'inside',
  //               withoutEnlargement: true
  //             })
  //             .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
  //             .toBuffer();
  //         }
          
  //         // If image is already small, just optimize it
  //         return await image
  //           .jpeg({ quality: 80 })
  //           .toBuffer();
  //       } catch {
  //         // If not an image or processing fails, return original buffer
  //         return buffer;
  //       }
  //     };
  
  //     while (queue.length > 0 || pool.size > 0) {
  //       while (pool.size < MAX_CONCURRENT && queue.length > 0) {
  //         const file = queue.shift();
  //         const promise = (async () => {
  //           try {
  //             const response = await axios({
  //               method: 'get',
  //               url: file.url,
  //               responseType: 'arraybuffer',
  //               timeout: 10000,
  //               headers: {
  //                 'Accept': '*/*',
  //                 'Connection': 'keep-alive'
  //               }
  //             });
  
  //             // Process the file (optimize if it's an image)
  //             const processedData = await processImage(Buffer.from(response.data));
  
  //             // Add to archive with high compression
  //             archive.append(processedData, {
  //               name: file.name,
  //               store: false // Enable compression
  //             });
  
  //           } catch (error) {
  //             console.error(`Error downloading ${file.url}:`, error.message);
  //           }
  //         })();
          
  //         pool.add(promise);
  //         promise.then(() => pool.delete(promise));
  //       }
  
  //       if (pool.size > 0) {
  //         await Promise.race(pool);
  //       }
  //     }
  
  //     await archive.finalize();
  
  //     return new Promise((resolve) => {
  //       output.on('close', () => {
  //         // Log the compressed size
  //         const stats = fs.statSync(zipFilePath);
  //         console.log(`Compressed ZIP size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  //         resolve(zipFilePath);
  //       });
  //     });
  
  //   } catch (error) {
  //     throw new Error(`Error creating ZIP file: ${error.message}`);
  //   }
  // };

  const createZipFromUrls = async (files, outputFileName) => {
    try {
      const projectRoot = path.resolve(__dirname, '../../../..');
           const downloadsDirPath = path.join(projectRoot, 'uploads', 'downloads');
      await fs.promises.mkdir(downloadsDirPath, { recursive: true });
  
      // Save the zip file in the uploads/downloads directory
      const zipFilePath = path.join(downloadsDirPath, outputFileName);
      const output = fs.createWriteStream(zipFilePath);
  
      // Configure archiver with maximum compression
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
        store: false // Enable compression
      });
  
      archive.pipe(output);
  
      const MAX_CONCURRENT = 5;
      const pool = new Set();
      const queue = [...files];
  
      const processImage = async (buffer) => {
        try {
          const image = sharp(buffer);
          const metadata = await image.metadata();
  
          if (metadata.width > 800 || metadata.height > 800) {
            return await image
              .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
              })
              .jpeg({ quality: 80 })
              .toBuffer();
          }
  
          return await image.jpeg({ quality: 80 }).toBuffer();
        } catch {
          return buffer;
        }
      };
  
      while (queue.length > 0 || pool.size > 0) {
        while (pool.size < MAX_CONCURRENT && queue.length > 0) {
          const file = queue.shift();
          const promise = (async () => {
            try {
              const response = await axios({
                method: 'get',
                url: file.url,
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                  Accept: '*/*',
                  Connection: 'keep-alive'
                }
              });
  
              const processedData = await processImage(Buffer.from(response.data));
              archive.append(processedData, { name: file.name, store: false });
            } catch (error) {
              console.error(`Error downloading ${file.url}:`, error.message);
            }
          })();
  
          pool.add(promise);
          promise.then(() => pool.delete(promise));
        }
  
        if (pool.size > 0) {
          await Promise.race(pool);
        }
      }
  
      await archive.finalize();
  
      return new Promise((resolve) => {
        output.on('close', () => {
          resolve(`/uploads/downloads/${path.basename(zipFilePath)}`); // Return the relative path
        });
      });
    } catch (error) {
      throw new Error(`Error creating ZIP file: ${error.message}`);
    }
  };
  


  const multipleImageDownload = async (req, res) => {
    try {
      const tokenId = new ObjectId(req.Id);
      const { fileName, url, customerId } = req.body;
  
      // Validate required fields
      if (!fileName) return badRequest(res, "fileName is required");
      if (!url) return badRequest(res, "url is required");
      if (!customerId) return badRequest(res, "customerId is required");
  
      // Convert url to array if single string is provided
      const urls = Array.isArray(url) ? url : [url];
  
      // Validate URLs
      if (urls.some(url => typeof url !== "string")) {
        return badRequest(res, "All URLs must be strings");
      }
  
      const timestamp = Date.now();
      
      // Prepare files for zip creation
      const allFiles = urls.map((url, index) => ({
        url,
        name: `${fileName}_${index + 1}_${timestamp}${getFileExtension(url)}`
      }));
  
      // Create zip file
      const zipFileName = `${customerId}_${fileName}_${timestamp}.zip`;
      const zipFilePath = await createZipFromUrls(allFiles, zipFileName);
  
      // Save download record to filesDownloadModel
      const downloadRecord = new filesDownloadModel({
        fileName,
        customerId,
        downloadBy: tokenId,
        originalUrls: urls,
        zipFilePath,
        downloadedAt: new Date(timestamp)
      });
  
      await downloadRecord.save();
  
      // Prepare response with both relative and full paths
      const relativePath = path.relative(process.cwd(), zipFilePath);
      const fullPath = zipFilePath;
  
      return success(res, "Files downloaded and zipped successfully", {
        downloadRecord,
        zipFilePath: relativePath,
        fullPath
      });
  
    } catch (error) {
      console.error("Error in multipleImageDownload:", error);
      return unknownError(res, error);
    }
  };
  

  // Helper function to get file extension from URL
  const getFileExtension = (url) => {
    // Extract file extension from URL or default to .png if not found
    const match = url.match(/\.(jpg|jpeg|png|gif|pdf)$/i);
    return match ? `.${match[1].toLowerCase()}` : '.png';
  };
  


  module.exports = {
    imageUpload,
    downloadSingleImage,
    createZipFromUrls,
    multipleImageDownload
  }