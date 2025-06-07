import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const spacesEndpoint = 'https://blr1.digitaloceanspaces.com';

const s3Client = new S3Client({
  endpoint: spacesEndpoint,
  region: 'blr1', // Required but ignored by DigitalOcean
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

/**
 * Uploads a file to DigitalOcean Spaces and returns its URL.
 *
 * @param {string} bucketName - The DigitalOcean Space name.
 * @param {string} filePathInBucket - The key (file path) in the bucket.
 * @param {Buffer|stream} fileContent - The file data as a Buffer or stream.
 * @param {string} [acl='public-read'] - The access control level.
 * @param {string} [contentType] - The MIME type.
 * @returns {Promise<string>} - Resolves with the uploaded file's URL.
 */
const spacesCDN = 'https://cdn.fincooper.in'; // Your CDN base URL

const uploadToSpaces = async (bucketName, filePathInBucket, fileContent, acl = 'public-read', contentType) => {
  console.log("bucketName" , bucketName)

  const fileBuket = `${process.env.PATH_BUCKET}/LOS/IMAGE/${Date.now()}_${bucketName.originalname}`;

  try {
    const params = {
      Bucket: bucketName,
      Key: filePathInBucket,
      Body: fileContent,
      ACL: acl,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return the public CDN URL instead of Spaces URL
    return `${spacesCDN}/${filePathInBucket}`;
  } catch (error) {
    console.error('Error uploading to Spaces:', error.message);
    throw error;
  }
};


export default uploadToSpaces;
