const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../globalHelper/response.globalHelper");

const customerModel = require("../model/customer.model")
const {uploadToSpaces} = require("../services/spaces.service")
const  creditPdModel = require("../model/credit.Pd.model")
const pdModel = require('../model/credit.Pd.model')
// const {createZipFromUrls} = require("../controller/imageUpload.controller")





const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const axios = require('axios');
const sharp = require('sharp');
const AWS = require('aws-sdk');

// Configure AWS S3 client for DigitalOcean Spaces
const s3 = new AWS.S3({
  endpoint: 'https://blr1.digitaloceanspaces.com',
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET
});

/**
 * Uploads a DOWNLOAD file to DigitalOcean Spaces without waiting for response
 * @param {Array} photos - Array of objects with { url, name } properties
 * @param {String} zipFileName - Name for the output DOWNLOAD file
 * @param {Function} progressCallback - Optional callback for progress updates
 */
async function createAndUploadZipInBackground(photos, zipFileName, progressCallback = null) {
  try {
    // Create temp directory for DOWNLOAD files
    const projectRoot = path.resolve(__dirname, '../../../..');
    const downloadsDirPath = path.join(projectRoot, 'uploads', 'downloads');
    
    if (!fs.existsSync(downloadsDirPath)) {
      fs.mkdirSync(downloadsDirPath, { recursive: true });
    }
    
    const zipFilePath = path.join(downloadsDirPath, zipFileName);
    
    // Create a write stream for the DOWNLOAD file
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } }); // Set compression level to highest
    
    // Set up event handlers for the archive
    archive.on('error', (err) => {
      console.error(`Error creating archive: ${err.message}`);
      if (progressCallback) progressCallback('error', err.message);
    });
    
    // Handle DOWNLOAD completion
    output.on('close', async () => {
      try {
        // Read the DOWNLOAD file
        const fileContent = fs.readFileSync(zipFilePath);
        
        // Upload to DigitalOcean Spaces
        const spaceName = 'finexe'; // Your Space name
        const uploadPath = `LOS/DOWNLOAD/${zipFileName}`;
        
        const params = {
          Bucket: spaceName,
          Key: uploadPath,
          Body: fileContent,
          ACL: 'public-read',
          ContentType: 'application/zip',
          ContentDisposition: `attachment; filename="${zipFileName}"`
        };
        
        const uploadResult = await s3.upload(params).promise();
        const cdnUrl = `https://cdn.fincooper.in/${uploadPath}`;
        
        // Clean up the local file
        fs.unlinkSync(zipFilePath);
        
        if (progressCallback) progressCallback('complete', cdnUrl);
      } catch (uploadError) {
        console.error(`Error uploading DOWNLOAD: ${uploadError.message}`);
        if (progressCallback) progressCallback('error', uploadError.message);
      }
    });
    
    // Pipe the archive data to the file
    archive.pipe(output);
    
    // Process and add each photo to the archive
    let processedCount = 0;
    
    for (const photo of photos) {
      try {
        if (!photo || !photo.url) {
          continue;
        }
        
        // Get the clean URL - no need to check for localhost since we're preprocessing this
        const fileUrl = photo.url;
        
        // Download the photo
        const response = await axios({
          method: 'get',
          url: fileUrl,
          responseType: 'arraybuffer',
          timeout: 15000
        });
        
        // Process the image (optimize & resize if needed)
        let imageBuffer = Buffer.from(response.data);
        
        try {
          const metadata = await sharp(imageBuffer).metadata();
          
          // Only resize/optimize if it's an image
          if (metadata) {
            if (metadata.width > 800 || metadata.height > 800) {
              imageBuffer = await sharp(imageBuffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
            } else {
              imageBuffer = await sharp(imageBuffer)
                .jpeg({ quality: 80 })
                .toBuffer();
            }
          }
        } catch (sharpError) {
          // Continue with original buffer
        }
        
        // Add the photo to the DOWNLOAD
        archive.append(imageBuffer, { name: photo.name });
        
        // Update progress
        processedCount++;
        if (progressCallback) {
          progressCallback('progress', {
            processed: processedCount,
            total: photos.length,
            percent: Math.round((processedCount / photos.length) * 100)
          });
        }
      } catch (photoError) {
        console.error(`Error processing photo ${photo.url}: ${photoError.message}`);
        // Continue with other photos
      }
    }
    
    // Finalize the archive
    await archive.finalize();
    
  } catch (error) {
    console.error(`Error in background DOWNLOAD process: ${error.message}`);
    if (progressCallback) progressCallback('error', error.message);
  }
}

/**
 * Clean photo URLs before sending to processing
 * @param {String} photoPath - Raw photo path
 * @param {String} baseName - Base name for the file
 * @param {String} baseUrl - Base URL from environment
 * @returns {Object|null} - Processed photo object or null
 */
const processPhotoUrl = (photoPath, baseName, baseUrl) => {
  if (!photoPath) return null;
  
  let fullUrl = '';
  
  // If photoPath is already a complete URL, use it directly
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    fullUrl = photoPath;
  } else {
    // Otherwise, combine with baseUrl
    fullUrl = `${baseUrl}${photoPath}`;
  }
  
  // Remove localhost prefix if present (this is done at preprocessing)
  if (fullUrl.includes('http://localhost:5500/')) {
    fullUrl = fullUrl.replace('http://localhost:5500/', '');
  }
  
  const extension = getFileExtension(photoPath);
  return {
    url: fullUrl,
    name: `${baseName}${extension}`
  };
};

const pdDownloadPhotos = async (req, res) => {
  try {
    const { customerId } = req.query;
    
    if (!customerId) {
      return notFound(res , "Customer ID is required");
    }

    const customerDetails = await customerModel.findById(customerId)

    if(!customerDetails){
      return notFound(res , "Customer Not Found");
    }
    const {customerFinId} = customerDetails
    
    // Get baseUrl from environment
    let baseUrl = process.env.BASE_URL || '';
    if (baseUrl.includes('http://localhost:5500/')) {
      baseUrl = baseUrl.replace('http://localhost:5500/', '');
    }
    
    // Find the credit PD data
    const creditData = await creditPdModel.findOne({ customerId });
    if (!creditData) {
      return notFound(res, "No data found for this customer");
    }

    // Preprocess photo arrays - this is quick and won't delay response
    const housePhotos = [
      processPhotoUrl(creditData.landmarkPhoto, 'landmark', baseUrl),
      processPhotoUrl(creditData.latLongPhoto, 'location', baseUrl),
      processPhotoUrl(creditData.front, 'front_view', baseUrl),
      processPhotoUrl(creditData.leftSide, 'left_side', baseUrl),
      processPhotoUrl(creditData.rightSide, 'right_side', baseUrl),
      processPhotoUrl(creditData.approachRoad, 'approach_road', baseUrl),
      processPhotoUrl(creditData.mainRoad, 'main_road', baseUrl),
      processPhotoUrl(creditData.interiorRoad, 'interior_road', baseUrl),
      processPhotoUrl(creditData.selfieWithProperty, 'selfie_with_property', baseUrl),
      processPhotoUrl(creditData.propertyPhoto, 'property_main', baseUrl),
      ...(creditData.fourBoundaryPhotos || []).map((photo, index) => 
        processPhotoUrl(photo, `boundary_${index + 1}`, baseUrl)
      ),
      ...(creditData.houseInsidePhoto || []).map((photo, index) => 
        processPhotoUrl(photo, `inside_${index + 1}`, baseUrl)
      ),
      ...(creditData.propertyOtherPhotos || []).map((photo, index) => 
        processPhotoUrl(photo, `property_other_${index + 1}`, baseUrl)
      )
    ].filter(Boolean);

    const workPhotos = [];
    if (creditData.incomeSource && Array.isArray(creditData.incomeSource)) {
      creditData.incomeSource.forEach((source, sourceIndex) => {
        // Add available photo collections
        if (source.agricultureBusiness && source.agricultureBusiness.agriculturePhotos) {
          source.agricultureBusiness.agriculturePhotos.forEach((photo, index) => {
            const processedPhoto = processPhotoUrl(photo, `agriculture_${sourceIndex + 1}_${index + 1}`, baseUrl);
            if (processedPhoto) workPhotos.push(processedPhoto);
          });
        }
        
        if (source.agricultureBusiness && source.agricultureBusiness.agricultureLandImage) {
          source.agricultureBusiness.agricultureLandImage.forEach((photo, index) => {
            const processedPhoto = processPhotoUrl(photo, `agriculture_${sourceIndex + 1}_${index + 1}`, baseUrl);
            if (processedPhoto) workPhotos.push(processedPhoto);
          });
        }

        if (source.milkBusiness && source.milkBusiness.milkPhotos) {
          source.milkBusiness.milkPhotos.forEach((photo, index) => {
            const processedPhoto = processPhotoUrl(photo, `milk_business_${sourceIndex + 1}_${index + 1}`, baseUrl);
            if (processedPhoto) workPhotos.push(processedPhoto);
          });
        }
        if (source.milkBusiness && source.milkBusiness.animalPhotos) {
          source.milkBusiness.animalPhotos.forEach((photo, index) => {
            const processedPhoto = processPhotoUrl(photo, `milk_business_${sourceIndex + 1}_${index + 1}`, baseUrl);
            if (processedPhoto) workPhotos.push(processedPhoto);
          });
        }

        if (source.other && source.other.incomeOtherImages) {
          source.other.incomeOtherImages.forEach((photo, index) => {
            const processedPhoto = processPhotoUrl(photo, `other_business_${sourceIndex + 1}_${index + 1}`, baseUrl);
            if (processedPhoto) workPhotos.push(processedPhoto);
          });
        }

        if (source.salaryIncome && source.salaryIncome.salaryPhotos) {
          source.salaryIncome.salaryPhotos.forEach((photo, index) => {
            const processedPhoto = processPhotoUrl(photo, `salary_Income_${sourceIndex + 1}_${index + 1}`, baseUrl);
            if (processedPhoto) workPhotos.push(processedPhoto);
          });
        }
        
        // Add other income sources as needed
      });
    }

    const timestamp = Date.now();
    const zipInfo = {
      status: 'processing',
      housePhotos: {
        count: housePhotos.length,
        status: housePhotos.length > 0 ? 'processing' : 'none',
        zipFileName: housePhotos.length > 0 ? `house_photos_${customerFinId}_${timestamp}.zip` : null,
        estimatedUrl: housePhotos.length > 0 ? `https://cdn.fincooper.in/LOS/DOWNLOAD/house_photos_${customerFinId}_${timestamp}.zip` : null
      },
      workPhotos: {
        count: workPhotos.length,
        status: workPhotos.length > 0 ? 'processing' : 'none',
        zipFileName: workPhotos.length > 0 ? `work_photos_${customerFinId}_${timestamp}.zip` : null,
        estimatedUrl: workPhotos.length > 0 ? `https://cdn.fincooper.in/LOS/DOWNLOAD/work_photos_${customerFinId}_${timestamp}.zip` : null
      }
    };

    // Start background processing of DOWNLOAD files without waiting for completion
    if (housePhotos.length > 0) {
      createAndUploadZipInBackground(housePhotos, zipInfo.housePhotos.zipFileName);
    }
    
    if (workPhotos.length > 0) {
      createAndUploadZipInBackground(workPhotos, zipInfo.workPhotos.zipFileName);
    }

    await pdModel.findOneAndUpdate(
      { customerId },
      {
        housePhotosZip: zipInfo.housePhotos.estimatedUrl,
        workPhotosZip: zipInfo.workPhotos.estimatedUrl,
      },
      { new: true }
    );

    // Return response immediately with estimated URLs
    return success(res, "Images Convert To Zip Dundle", {
      data: {
        housePhotosCount: housePhotos.length,
        workPhotosCount: workPhotos.length,
        housePhotosZip: zipInfo.housePhotos.estimatedUrl,
        workPhotosZip: zipInfo.workPhotos.estimatedUrl,
        status: "processing" // Let the client know DOWNLOAD is being created asynchronously
      }
    });
    
  } catch (error) {
    console.error(`Error in pdDownloadPhotos: ${error.message}`);
    return unknownError(res ,"Error processing DOWNLOAD request", error.message);
  }
};

// Helper function to get file extension
const getFileExtension = (url) => {
  if (!url) return '.png';
  
  // Extract file extension from URL or default to .png if not found
  const match = url.match(/\.(jpg|jpeg|png|gif|pdf|webp)$/i);
  return match ? `.${match[1].toLowerCase()}` : '.png';
};

module.exports = { pdDownloadPhotos };





// const path = require('path');
// const fs = require('fs');
// const archiver = require('archiver');
// const axios = require('axios');
// const sharp = require('sharp');
// const AWS = require('aws-sdk');

// // Configure AWS S3 client for DigitalOcean Spaces
// const s3 = new AWS.S3({
//   endpoint: 'https://blr1.digitaloceanspaces.com',
//   accessKeyId: process.env.DO_SPACES_KEY,
//   secretAccessKey: process.env.DO_SPACES_SECRET
// });

// /**
//  * Uploads a DOWNLOAD file to DigitalOcean Spaces without waiting for response
//  * @param {Array} photos - Array of objects with { url, name } properties
//  * @param {String} zipFileName - Name for the output DOWNLOAD file
//  * @param {Function} progressCallback - Optional callback for progress updates
//  */
// async function createAndUploadZipInBackground(photos, zipFileName, progressCallback = null) {
//   try {
//     // Create temp directory for DOWNLOAD files
//     const projectRoot = path.resolve(__dirname, '../../../..');
//     const downloadsDirPath = path.join(projectRoot, 'uploads', 'downloads');
    
//     if (!fs.existsSync(downloadsDirPath)) {
//       fs.mkdirSync(downloadsDirPath, { recursive: true });
//     }
    
//     const zipFilePath = path.join(downloadsDirPath, zipFileName);
    
//     // Create a write stream for the DOWNLOAD file
//     const output = fs.createWriteStream(zipFilePath);
//     const archive = archiver('zip', { zlib: { level: 9 } }); // Set compression level to highest
    
//     // Set up event handlers for the archive
//     archive.on('error', (err) => {
//       console.error(`Error creating archive: ${err.message}`);
//       if (progressCallback) progressCallback('error', err.message);
//     });
    
//     // Handle DOWNLOAD completion
//     output.on('close', async () => {
//       try {
//         // Read the DOWNLOAD file
//         const fileContent = fs.readFileSync(zipFilePath);
        
//         // Upload to DigitalOcean Spaces
//         const spaceName = 'finexe'; // Your Space name
//         const uploadPath = `LOS/DOWNLOAD/${zipFileName}`;
        
//         const params = {
//           Bucket: spaceName,
//           Key: uploadPath,
//           Body: fileContent,
//           ACL: 'public-read',
//           ContentType: 'application/zip',
//           ContentDisposition: `attachment; filename="${zipFileName}"`
//         };
        
//         const uploadResult = await s3.upload(params).promise();
//         const cdnUrl = `https://cdn.fincooper.in/${uploadPath}`;
        
//         // Clean up the local file
//         fs.unlinkSync(zipFilePath);
        
//         if (progressCallback) progressCallback('complete', cdnUrl);
//       } catch (uploadError) {
//         console.error(`Error uploading DOWNLOAD: ${uploadError.message}`);
//         if (progressCallback) progressCallback('error', uploadError.message);
//       }
//     });
    
//     // Pipe the archive data to the file
//     archive.pipe(output);
    
//     // Process and add each photo to the archive
//     let processedCount = 0;
    
//     for (const photo of photos) {
//       try {
//         if (!photo || !photo.url) {
//           continue;
//         }
        
//         // Get the clean URL - no need to check for localhost since we're preprocessing this
//         const fileUrl = photo.url;
        
//         // Download the photo
//         const response = await axios({
//           method: 'get',
//           url: fileUrl,
//           responseType: 'arraybuffer',
//           timeout: 15000
//         });
        
//         // Process the image (optimize & resize if needed)
//         let imageBuffer = Buffer.from(response.data);
        
//         try {
//           const metadata = await sharp(imageBuffer).metadata();
          
//           // Only resize/optimize if it's an image
//           if (metadata) {
//             if (metadata.width > 800 || metadata.height > 800) {
//               imageBuffer = await sharp(imageBuffer)
//                 .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
//                 .jpeg({ quality: 80 })
//                 .toBuffer();
//             } else {
//               imageBuffer = await sharp(imageBuffer)
//                 .jpeg({ quality: 80 })
//                 .toBuffer();
//             }
//           }
//         } catch (sharpError) {
//           // Continue with original buffer
//         }
        
//         // Add the photo to the DOWNLOAD
//         archive.append(imageBuffer, { name: photo.name });
        
//         // Update progress
//         processedCount++;
//         if (progressCallback) {
//           progressCallback('progress', {
//             processed: processedCount,
//             total: photos.length,
//             percent: Math.round((processedCount / photos.length) * 100)
//           });
//         }
//       } catch (photoError) {
//         console.error(`Error processing photo ${photo.url}: ${photoError.message}`);
//         // Continue with other photos
//       }
//     }
    
//     // Finalize the archive
//     await archive.finalize();
    
//   } catch (error) {
//     console.error(`Error in background DOWNLOAD process: ${error.message}`);
//     if (progressCallback) progressCallback('error', error.message);
//   }
// }

// /**
//  * Clean photo URLs before sending to processing
//  * @param {String} photoPath - Raw photo path
//  * @param {String} baseName - Base name for the file
//  * @param {String} baseUrl - Base URL from environment
//  * @returns {Object|null} - Processed photo object or null
//  */
// const processPhotoUrl = (photoPath, baseName, baseUrl) => {
//   if (!photoPath) return null;
  
//   let fullUrl = '';
  
//   // If photoPath is already a complete URL, use it directly
//   if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
//     fullUrl = photoPath;
//   } else {
//     // Otherwise, combine with baseUrl
//     fullUrl = `${baseUrl}${photoPath}`;
//   }
  
//   // Remove localhost prefix if present (this is done at preprocessing)
//   if (fullUrl.includes('http://localhost:5500/')) {
//     fullUrl = fullUrl.replace('http://localhost:5500/', '');
//   }
  
//   const extension = getFileExtension(photoPath);
//   return {
//     url: fullUrl,
//     name: `${baseName}${extension}`
//   };
// };

// const pdDownloadPhotos = async (req, res) => {
//   try {
//     const { customerId } = req.query;
    
//     if (!customerId) {
//       return res.status(400).json({
//         success: false,
//         message: "Customer ID is required"
//       });
//     }
    
//     // Get baseUrl from environment
//     let baseUrl = process.env.BASE_URL || '';
//     if (baseUrl.includes('http://localhost:5500/')) {
//       baseUrl = baseUrl.replace('http://localhost:5500/', '');
//     }
    
//     // Find the credit PD data
//     const creditData = await creditPdModel.findOne({ customerId });
//     if (!creditData) {
//       return notFound(res, "No data found for this customer");
//     }

//     // Preprocess photo arrays - this is quick and won't delay response
//     const housePhotos = [
//       processPhotoUrl(creditData.landmarkPhoto, 'landmark', baseUrl),
//       processPhotoUrl(creditData.latLongPhoto, 'location', baseUrl),
//       processPhotoUrl(creditData.front, 'front_view', baseUrl),
//       processPhotoUrl(creditData.leftSide, 'left_side', baseUrl),
//       processPhotoUrl(creditData.rightSide, 'right_side', baseUrl),
//       processPhotoUrl(creditData.approachRoad, 'approach_road', baseUrl),
//       processPhotoUrl(creditData.mainRoad, 'main_road', baseUrl),
//       processPhotoUrl(creditData.interiorRoad, 'interior_road', baseUrl),
//       processPhotoUrl(creditData.selfieWithProperty, 'selfie_with_property', baseUrl),
//       processPhotoUrl(creditData.propertyPhoto, 'property_main', baseUrl),
//       ...(creditData.fourBoundaryPhotos || []).map((photo, index) => 
//         processPhotoUrl(photo, `boundary_${index + 1}`, baseUrl)
//       ),
//       ...(creditData.houseInsidePhoto || []).map((photo, index) => 
//         processPhotoUrl(photo, `inside_${index + 1}`, baseUrl)
//       ),
//       ...(creditData.propertyOtherPhotos || []).map((photo, index) => 
//         processPhotoUrl(photo, `property_other_${index + 1}`, baseUrl)
//       )
//     ].filter(Boolean);

//     const workPhotos = [];
//     if (creditData.incomeSource && Array.isArray(creditData.incomeSource)) {
//       creditData.incomeSource.forEach((source, sourceIndex) => {
//         // Add available photo collections
//         if (source.agricultureBusiness && source.agricultureBusiness.agriculturePhotos) {
//           source.agricultureBusiness.agriculturePhotos.forEach((photo, index) => {
//             const processedPhoto = processPhotoUrl(photo, `agriculture_${sourceIndex + 1}_${index + 1}`, baseUrl);
//             if (processedPhoto) workPhotos.push(processedPhoto);
//           });
//         }
        
//         if (source.milkBusiness && source.milkBusiness.milkPhotos) {
//           source.milkBusiness.milkPhotos.forEach((photo, index) => {
//             const processedPhoto = processPhotoUrl(photo, `milk_business_${sourceIndex + 1}_${index + 1}`, baseUrl);
//             if (processedPhoto) workPhotos.push(processedPhoto);
//           });
//         }
        
//         // Add other income sources as needed
//       });
//     }

//     const timestamp = Date.now();
//     const zipInfo = {
//       status: 'processing',
//       housePhotos: {
//         count: housePhotos.length,
//         status: housePhotos.length > 0 ? 'processing' : 'none',
//         zipFileName: housePhotos.length > 0 ? `house_photos_${customerId}_${timestamp}.zip` : null,
//         estimatedUrl: housePhotos.length > 0 ? `https://cdn.fincooper.in/LOS/DOWNLOAD/house_photos_${customerId}_${timestamp}.zip` : null
//       },
//       workPhotos: {
//         count: workPhotos.length,
//         status: workPhotos.length > 0 ? 'processing' : 'none',
//         zipFileName: workPhotos.length > 0 ? `work_photos_${customerId}_${timestamp}.zip` : null,
//         estimatedUrl: workPhotos.length > 0 ? `https://cdn.fincooper.in/LOS/DOWNLOAD/work_photos_${customerId}_${timestamp}.zip` : null
//       }
//     };

//     // Start background processing of DOWNLOAD files without waiting for completion
//     if (housePhotos.length > 0) {
//       createAndUploadZipInBackground(housePhotos, zipInfo.housePhotos.zipFileName);
//     }
    
//     if (workPhotos.length > 0) {
//       createAndUploadZipInBackground(workPhotos, zipInfo.workPhotos.zipFileName);
//     }

//     // Return response immediately with estimated URLs
//     return success(res, "DOWNLOAD creation started, files will be available shortly", {
//       data: {
//         housePhotosCount: housePhotos.length,
//         workPhotosCount: workPhotos.length,
//         housePhotosZip: zipInfo.housePhotos.estimatedUrl,
//         workPhotosZip: zipInfo.workPhotos.estimatedUrl,
//         status: "processing" // Let the client know DOWNLOAD is being created asynchronously
//       }
//     });
    
//   } catch (error) {
//     console.error(`Error in pdDownloadPhotos: ${error.message}`);
//     return res.status(500).json({
//       success: false,
//       message: "Error processing DOWNLOAD request",
//       error: error.message
//     });
//   }
// };

// // Helper function to get file extension
// const getFileExtension = (url) => {
//   if (!url) return '.png';
  
//   // Extract file extension from URL or default to .png if not found
//   const match = url.match(/\.(jpg|jpeg|png|gif|pdf|webp)$/i);
//   return match ? `.${match[1].toLowerCase()}` : '.png';
// };

// module.exports = { pdDownloadPhotos };