// uploadToSpaces.js

require('dotenv').config(); // if using a .env file
const { S3Client,PutObjectCommand  } = require('@aws-sdk/client-s3');

const spacesEndpoint = 'https://blr1.digitaloceanspaces.com';


const s3Client = new S3Client({
    endpoint: spacesEndpoint,
    region: 'blr1', // DigitalOcean ignores this, but it's required by the AWS SDK
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
    },
    // If you have DNS issues with virtual-hosted style ("bucket.region.digitaloceanspaces.com"),
    // you can try forcing path-style requests:
    // forcePathStyle: true,
  });

/**
 * Uploads a file to DigitalOcean Spaces
 *
 * @param {string} bucketName - The name of your DigitalOcean Space.
 * @param {string} filePathInBucket - The path (Key) within the bucket, e.g. 'uploads/image.jpg'.
 * @param {stream|Buffer} fileContent - File data as a stream or buffer.
 * @param {string} [acl='public-read'] - Access control, default is 'public-read'.
 * @param {string} [contentType] - Optional content/mime type (e.g., 'image/jpeg').
 * @returns {Promise<object>} - Resolves with the upload data (including the file's URL).
 */
async function uploadToSpaces(bucketName, filePathInBucket, fileContent, acl = 'public-read', contentType) {
  const params = {
    Bucket: bucketName,
    Key: filePathInBucket,
    Body: fileContent,
    ACL: acl,
    ContentType: contentType
  };


  // Send the PutObjectCommand
  const command = new PutObjectCommand(params);
  const response = await s3Client.send(command);
  return response
  if (contentType) {
    params.ContentType = contentType;
  }

  // 's3Client.upload' returns a managed upload object with a .promise() method.
  const data = await s3Client.upload(params).promise();
  return data; // data.Location will be the file URL if ACL is public
}

module.exports = uploadToSpaces;
