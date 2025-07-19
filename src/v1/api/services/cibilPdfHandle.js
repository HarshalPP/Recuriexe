
require('dotenv').config(); // if using a .env file
const { S3Client,PutObjectCommand  } = require('@aws-sdk/client-s3');
const applicantModel = require("../model/applicant.model")
const {success ,unknownError} = require("../../../../globalHelper/response.globalHelper")
const {axios} = require("axios")
const fs = require('fs').promises;
const path = require('path');
const spacesEndpoint = 'https://blr1.digitaloceanspaces.com';


const s3Client = new S3Client({
  endpoint: 'https://blr1.digitaloceanspaces.com',
  region: 'blr1',
  credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
  }
});

const waitForFile = async (filePath, attempts = 5, delay = 1000) => {
  for (let i = 0; i < attempts; i++) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      if (i === attempts - 1) return false;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

// Function to upload file to Spaces
async function uploadToSpaces(filePath) {
  try {
    if (!filePath.toLowerCase().endsWith('.pdf')) {
      filePath = `${filePath}.pdf`;
  }

  console.log('Checking file at path:', filePath);

  // Wait for file to be available
  const fileExists = await waitForFile(filePath);
  if (!fileExists) {
      throw new Error(`File not found after multiple attempts: ${filePath}`);
  }

  // Read the file
  const fileContent = await fs.readFile(filePath);
  console.log('File read successfully, size:', fileContent.length);

  const fileName = path.basename(filePath);
      console.log('fileName----3.2',fileName)
      // Create new path in bucket
      const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/PDF/${fileName}`;
      
      console.log('filePathInBucket----3.3',filePathInBucket)
      // Upload parameters
      const params = {
          Bucket: 'finexe',
          Key: filePathInBucket,
          Body: fileContent,
          ACL: 'public-read',
          ContentType: getContentType(fileName)
      };

      // Upload file
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      
      return `https://cdn.fincooper.in/${filePathInBucket}`;
  } catch (error) {
      console.error('Upload error:', error);
      return null;
  }
}

// Get content type based on file extension
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const types = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return types[ext] || 'application/octet-stream';
}

module.exports = {uploadToSpaces }