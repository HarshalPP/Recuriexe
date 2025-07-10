import dotenv from "dotenv";
dotenv.config()
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { returnFormatter } from "../../formatters/common.formatter.js";

const spacesEndpoint = 'https://blr1.digitaloceanspaces.com';

const s3Client = new S3Client({
    endpoint: spacesEndpoint,
    region: 'blr1', // DigitalOcean ignores this, but it's required by AWS SDK
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET,
    },
});

/**
 * Uploads a file to DigitalOcean Spaces
 *
 * @param {string} bucketName - The name of your DigitalOcean Space.
 * @param {string} filePathInBucket - The path (Key) within the bucket, e.g. 'uploads/image.jpg'.
 * @param {stream|Buffer} fileContent - File data as a stream or buffer.
 * @param {string} [acl='public-read'] - Access control, default is 'public-read'.
 * @param {string} [contentType] - Optional content/mime type (e.g., 'image/jpeg').
 * @returns {Promise<object>} - Resolves with the upload data.
 */
export default async function uploadToSpaces(bucketName, filePathInBucket, fileContent, acl = 'public-read', contentType) {
    try {
        const params = {
            Bucket: bucketName,
            Key: filePathInBucket,
            Body: fileContent,
            ACL: acl,
            ContentType: contentType
        };

        

        const command = new PutObjectCommand(params);
        const response = await s3Client.send(command);
        
        return returnFormatter(true,"uploaded succesfully", response)
    } catch (error) {
        returnFormatter(false,error.message)
    }
}



//   remove from spaces
export async function removeFromSpaces(filePathInBucket) {
    try {

        // Define the base URL to remove
        const baseUrl = "https://tech-cdn.fincooper.in/";

        // Extract the file path by removing the base URL
        if (filePathInBucket.startsWith(baseUrl)) {
            filePathInBucket = filePathInBucket.replace(baseUrl, "");
        }


        let bucketName = "vendor";
        const params = {
            Bucket: bucketName,
            Key: filePathInBucket,
        };

        const command = new DeleteObjectCommand(params);
        const response = await s3Client.send(command);

        return returnFormatter(true, "Deleted successfully", response);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}





    // async function listFiles(bucketName, prefix) {
    //     const params = { Bucket: bucketName, Prefix: prefix };
    //     const command = new ListObjectsV2Command(params);
    //     const response = await s3Client.send(command);
    //     console.log(response.Contents);
    // }
    
    // listFiles("vendor", "stage/vendor_managment/");




// Function to check if a folder exists
export const checkFolderExists = async (bucketName, folderPath) => {
  try {
    const command = new HeadObjectCommand({ Bucket: bucketName, Key: `${folderPath}/` });
    await s3Client.send(command);
    return true; // Folder exists
  } catch (error) {
    if (error.name === "NotFound") {
      return false; // Folder does not exist
    }
    throw error; // Other errors
  }
};

// Function to create a folder (by uploading an empty object)
export const createFolder = async (bucketName, folderPath) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${folderPath}/`,
      Body: "", // Empty content (folders are virtual in S3-like storage)
      ACL: "public-read",
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error creating folder:", error);
    return false;
  }
};


/**
 * Lists files from DigitalOcean Spaces
 *
 * @param {string} bucketName - The name of your DigitalOcean Space.
 * @param {string} [prefix=''] - Optional prefix to filter files (e.g., 'uploads/' to list files in uploads folder).
 * @param {number} [maxKeys=1000] - Maximum number of files to return (default: 1000).
 * @param {string} [continuationToken] - Token for pagination (for large result sets).
 * @returns {Promise<object>} - Resolves with the list data including files and folders.
 */
export async function listFromSpaces(bucketName, prefix = '', maxKeys = 1000, continuationToken = null) {
    try {
        const params = {
            Bucket: bucketName,
            Prefix: prefix,
            MaxKeys: maxKeys,
        };

        // Add continuation token if provided (for pagination)
        if (continuationToken) {
            params.ContinuationToken = continuationToken;
        }

        const command = new ListObjectsV2Command(params);
        const response = await s3Client.send(command);

        // Format the response for easier use
        const files = response.Contents ? response.Contents.map(file => ({
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
            etag: file.ETag,
            url: `${spacesEndpoint.replace('https://', `https://${bucketName}.`)}/${file.Key}`
        })) : [];

        const folders = response.CommonPrefixes ? response.CommonPrefixes.map(folder => ({
            prefix: folder.Prefix
        })) : [];

        const result = {
            files,
            folders,
            isTruncated: response.IsTruncated || false,
            nextContinuationToken: response.NextContinuationToken || null,
            keyCount: response.KeyCount || 0,
            totalFiles: files.length
        };

        return returnFormatter(true, "Files listed successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Lists all files from a specific folder/prefix (handles pagination automatically)
 *
 * @param {string} bucketName - The name of your DigitalOcean Space.
 * @param {string} [prefix=''] - Prefix to filter files (folder path).
 * @returns {Promise<object>} - Resolves with all files in the specified prefix.
 */
export async function listAllFromSpaces(bucketName, prefix = '') {
    try {
        let allFiles = [];
        let allFolders = [];
        let continuationToken = null;
        let hasMore = true;

        while (hasMore) {
            const response = await listFromSpaces(bucketName, prefix, 1000, continuationToken);
            
            if (!response.success) {
                return response;
            }

            allFiles = allFiles.concat(response.data.files);
            allFolders = allFolders.concat(response.data.folders);

            hasMore = response.data.isTruncated;
            continuationToken = response.data.nextContinuationToken;
        }

        const result = {
            files: allFiles,
            folders: allFolders,
            totalFiles: allFiles.length,
            totalFolders: allFolders.length
        };

        return returnFormatter(true, "All files listed successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

/**
 * Lists files with additional filtering options
 *
 * @param {string} bucketName - The name of your DigitalOcean Space.
 * @param {object} options - Filtering options.
 * @param {string} [options.prefix=''] - Prefix to filter files.
 * @param {string} [options.extension] - Filter by file extension (e.g., 'jpg', 'png').
 * @param {number} [options.minSize] - Minimum file size in bytes.
 * @param {number} [options.maxSize] - Maximum file size in bytes.
 * @param {Date} [options.modifiedAfter] - Filter files modified after this date.
 * @param {Date} [options.modifiedBefore] - Filter files modified before this date.
 * @returns {Promise<object>} - Resolves with filtered files.
 */
export async function listFromSpacesWithFilters(bucketName, options = {}) {
    try {
        const {
            prefix = '',
            extension,
            minSize,
            maxSize,
            modifiedAfter,
            modifiedBefore
        } = options;

        const response = await listAllFromSpaces(bucketName, prefix);
        
        if (!response.success) {
            return response;
        }

        let filteredFiles = response.data.files;

        // Filter by extension
        if (extension) {
            const ext = extension.toLowerCase();
            filteredFiles = filteredFiles.filter(file => 
                file.key.toLowerCase().endsWith(`.${ext}`)
            );
        }

        // Filter by size
        if (minSize !== undefined) {
            filteredFiles = filteredFiles.filter(file => file.size >= minSize);
        }
        if (maxSize !== undefined) {
            filteredFiles = filteredFiles.filter(file => file.size <= maxSize);
        }

        // Filter by modification date
        if (modifiedAfter) {
            filteredFiles = filteredFiles.filter(file => 
                new Date(file.lastModified) > modifiedAfter
            );
        }
        if (modifiedBefore) {
            filteredFiles = filteredFiles.filter(file => 
                new Date(file.lastModified) < modifiedBefore
            );
        }

        const result = {
            files: filteredFiles,
            folders: response.data.folders,
            totalFiles: filteredFiles.length,
            appliedFilters: options
        };

        return returnFormatter(true, "Filtered files listed successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}