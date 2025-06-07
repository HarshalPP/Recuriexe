import { 
  ListObjectsV2Command, 
  S3Client, 
  GetObjectCommand, 
  HeadObjectCommand, 
  PutObjectCommand 
} from '@aws-sdk/client-s3';

import { returnFormatter } from '../../formatters/common.formatter.js';
import fileFolderModel from '../../models/fileShareModel/fileFolder.model.js'
import fileSharingModel from '../../models/fileShareModel/fileShare.model.js';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import path from 'path';
import archiver from 'archiver';


export function getSpacesClient() {
  // Ensure we have all required environment variables
  const endpoint = process.env.SPACES_ENDPOINT;
  const region = process.env.NEXT_PUBLIC_SPACES_REGION;
  const accessKeyId = process.env.SPACES_KEY;
  const secretAccessKey = process.env.SPACES_SECRET;

  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing required DigitalOcean Spaces configuration');
  }

  // Initialize the S3 client for DigitalOcean Spaces
  let spacesClient = new S3Client({
    endpoint: `https://${endpoint}`,
    region: region, 
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: false, // DigitalOcean Spaces uses subdomain style access
  });

  return spacesClient;
}


export async function fileShare(reqPrefix ,folderId ) {
  try {
    const prefix = reqPrefix || '';
    const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;

    let folders = [];
    let filesRaw = [];

if (folderId) {
  // 🟡 Fetch subfolders by parentId
  folders = await fileFolderModel.find({ parentId: folderId }).lean();
  filesRaw = await fileSharingModel.find({ fileFolderId: folderId }).lean();
} else {
  const prefix = reqPrefix || '';
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;

  if (!prefix) {
    folders = await fileFolderModel.find({ parentId: null }).lean();
    filesRaw = await fileSharingModel.find({ fileFolderId: null }).lean();
  } else {
    const folderRegex = new RegExp(`^${normalizedPrefix}[^/]+/$`, 'i');
    folders = await fileFolderModel.find({ path: folderRegex }).lean();

    const fileRegex = new RegExp(`^${normalizedPrefix}[^/]+$`, 'i');
    filesRaw = await fileSharingModel.find({ fileKey: fileRegex }).lean();
  }
}


    // 🔸 Add logic: count of direct subfolders for each folder
    const folderData = await Promise.all(
      folders.map(async (folder) => {
        const subfolderCount = await fileFolderModel.countDocuments({ parentId: folder._id });
        return {
          _id: folder._id,
          name: folder.name,
          path: folder.path,
          type: 'folder',
          parentId: folder.parentId,
          createdBy: folder.createdBy,
          createdAt: folder.createdAt,
          subfolderCount // ✅ Added field
        };
      })
    );

    const files = filesRaw.map(file => ({
      _id: file._id,
      name: file.fileName,
      key: file.fileKey,
      url: file.url,
      size: file.size,
      mimeType: file.mimeType,
      type: 'file',
      folderId: file.fileFolderId,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt
    }));

    return returnFormatter(true, 'Explorer', {
      prefix: normalizedPrefix,
      folders: folderData,
      files
    });

  } catch (error) {
    console.error('Error fetching from MongoDB:', error);
    return returnFormatter(false, error.message);
  }
}




/**
 * Generate a pre-signed URL for file download
 * @param {string} key - The key/path of the file to download
 * @param {number} expiresIn - URL expiration time in seconds
 */
export async function generateDownloadUrl(key, expiresIn = 3600) {
  try {
    if (!key) {
      return returnFormatter(false, "File key is required");
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    const client = getSpacesClient();
    
    // First, check if the object exists
    const headParams = {
      Bucket: bucket,
      Key: key
    };
    
    try {
      await client.send(new HeadObjectCommand(headParams));
    } catch (error) {
      if (error.name === 'NotFound') {
        return returnFormatter(false, "File not found");
      }
      throw error;
    }
    
    // Generate a pre-signed URL for the file
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const url = await getSignedUrl(client, command, { expiresIn });
    
    return returnFormatter(true, "Download URL generated successfully", { url });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return returnFormatter(false, error.message);
  }
}

/**
 * Stream a file directly to the response
 * @param {string} key - The key/path of the file to download
 * @param {object} res - Express response object
 */
export async function streamFileDownload(key, res) {
  try {
    if (!key) {
      return res.status(400).json(returnFormatter(false, "File key is required"));
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return res.status(500).json(returnFormatter(false, "No Bucket Found"));
    }

    const client = getSpacesClient();
    
    // Get the object from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    try {
      
      const { Body, ContentType, ContentLength, LastModified } = await client.send(command);
      // console.log("hashsahhas",ContentLength);
      
      // Extract filename from the key
      const filename = key.split('/').pop();
      
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', ContentType || 'application/octet-stream');
      if (ContentLength) res.setHeader('Content-Length', ContentLength);
      
      // Stream the file to the response
      Body.pipe(res);
      
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return res.status(404).json(returnFormatter(false, "File not found"));
      }
      throw error;
    }
  } catch (error) {
    console.error('Error streaming file:', error);
    return res.status(500).json(returnFormatter(false, error.message));
  }
}

/**
 * Download multiple files as a ZIP archive
 * @param {Array} keys - Array of file keys to include in the ZIP
 * @param {object} res - Express response object
 */
export async function downloadMultipleAsZip(keys, res) {
  try {
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json(returnFormatter(false, "Valid file keys are required"));
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return res.status(500).json(returnFormatter(false, "No Bucket Found"));
    }

    const client = getSpacesClient();
    
    // Set up the ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 5 } // Compression level
    });
    
    // Set response headers for ZIP download
    res.setHeader('Content-Disposition', 'attachment; filename="download.zip"');
    res.setHeader('Content-Type', 'application/zip');
    
    // Pipe the archive to the response
    archive.pipe(res);
    
    // Add each file to the archive
    for (const key of keys) {
      try {
        // Get the object from S3
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key
        });
        
        const { Body } = await client.send(command);
        
        // Extract filename from the key
        const filename = key.split('/').pop();
        
        // Create a pass-through stream
        const passThrough = new stream.PassThrough();
        
        // Pipe the S3 stream to the pass-through stream
        Body.pipe(passThrough);
        
        // Add the stream to the archive with the filename
        archive.append(passThrough, { name: filename });
        
      } catch (error) {
        console.warn(`Skipping file ${key}:`, error.message);
        // Continue with other files even if one fails
        continue;
      }
    }
    
    // Finalize the archive
    await archive.finalize();
    
  } catch (error) {
    console.error('Error creating ZIP archive:', error);
    // If headers haven't been sent yet, send an error response
    if (!res.headersSent) {
      return res.status(500).json(returnFormatter(false, error.message));
    } else {
      // If headers have been sent, just end the response
      res.end();
    }
  }
}

/**
 * Download a folder and its contents as a ZIP archive
 * @param {string} folderKey - The key/prefix of the folder to download
 * @param {object} res - Express response object
 */
export async function downloadFolderAsZip(folderKey, res) {
  try {
    if (!folderKey) {
      return res.status(400).json(returnFormatter(false, "Folder key is required"));
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return res.status(500).json(returnFormatter(false, "No Bucket Found"));
    }

    // Ensure the folder key ends with a slash
    const folderPrefix = folderKey.endsWith('/') ? folderKey : `${folderKey}/`;
    
    // Get all objects in the folder
    const result = await fileShare(folderPrefix);
    console.log(result);
    
    if (!result.status) {
      return res.status(500).json(returnFormatter(false, "Failed to list folder contents"));
    }
    
    // Extract folder name from the key
    const folderName = folderPrefix.split('/').filter(Boolean).pop() || 'folder';
    
    // Extract file keys
    const fileKeys = result.data.files.map(file => file.key);
    
    if (fileKeys.length === 0) {
      return res.status(404).json(returnFormatter(false, "Folder is empty"));
    }
    
    // Set up the ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 5 } // Compression level
    });
    
    // Set response headers for ZIP download
    res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
    res.setHeader('Content-Type', 'application/zip');
    
    // Pipe the archive to the response
    archive.pipe(res);
    
    const client = getSpacesClient();
    
    // Add each file to the archive, preserving the folder structure
    for (const key of fileKeys) {
      try {
        // Get the object from S3
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key
        });
        
        const { Body } = await client.send(command);
        
        // Get the relative path inside the ZIP (removing the folder prefix)
        const relativePath = key.substring(folderPrefix.length);
        
        // Create a pass-through stream
        const passThrough = new stream.PassThrough();
        
        // Pipe the S3 stream to the pass-through stream
        Body.pipe(passThrough);
        
        // Add the stream to the archive with the relative path
        archive.append(passThrough, { name: relativePath });
        
      } catch (error) {
        console.warn(`Skipping file ${key}:`, error.message);
        // Continue with other files even if one fails
        continue;
      }
    }
    
    // Finalize the archive
    await archive.finalize();
    
  } catch (error) {
    console.error('Error creating folder ZIP archive:', error);
    // If headers haven't been sent yet, send an error response
    if (!res.headersSent) {
      return res.status(500).json(returnFormatter(false, error.message));
    } else {
      // If headers have been sent, just end the response
      res.end();
    }
  }
}




/**
 * Handle file upload to DigitalOcean Spaces
 * @param {object} file - Multer file object
 * @param {string} destinationPath - Path in the bucket where the file should be stored
 */
export async function uploadFile(file, destinationPath = '') {
  try {
    if (!file) {
      return returnFormatter(false, "File is required");
    }

    const bucket = process.env.SPACES_BUCKET;
    const name = process.env.FILESTOREFOLDER;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    const client = getSpacesClient();
    
    // Generate a unique filename to avoid overwriting
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const fileName = path.basename(originalName, extension);
    const timestamp = Date.now();
    
    // Construct the key (path) where the file will be stored
    let key = destinationPath;
    if (key && !key.endsWith('/')) {
      key += '/';
    }
    key += `${name}/${fileName}_${timestamp}${extension}`;
    
    // Upload the file to Spaces
    const upload = new Upload({
      client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private', // Set appropriate ACL as needed
      },
    });

    const result = await upload.done();
    
    return returnFormatter(true, "File uploaded successfully", {
      key: result.Key,
      location: result.Location,
      etag: result.ETag,
      size: file.size,
      mimetype: file.mimetype,
      originalName: file.originalname
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return returnFormatter(false, error.message);
  }
}

/**
 * Handle multiple file uploads to DigitalOcean Spaces
 * @param {Array} files - Array of Multer file objects
 * @param {string} destinationPath - Path in the bucket where the files should be stored
 */
export async function uploadMultipleFiles(files, destinationPath = '') {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return returnFormatter(false, "Files are required");
    }

    const results = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      const result = await uploadFile(file, destinationPath);
      if (result.status) {
        results.push(result.items);
      } else {
        errors.push({
          filename: file.originalname,
          error: result.message
        });
      }
    }

    // Return overall status
    if (errors.length === 0) {
      return returnFormatter(true, "All files uploaded successfully", { files: results });
    } else if (results.length > 0) {
      return returnFormatter(true, "Some files uploaded with errors", { 
        files: results, 
        errors: errors 
      });
    } else {
      return returnFormatter(false, "Failed to upload files", { errors });
    }
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    return returnFormatter(false, error.message);
  }
}

/**
 * Generate a pre-signed URL for client-side uploads
 * @param {string} fileName - Filename to use for the upload
 * @param {string} contentType - MIME type of the file
 * @param {string} destinationPath - Path in the bucket where the file should be stored
 * @param {number} expiresIn - URL expiration time in seconds
 */
export async function generateUploadUrl(fileName, contentType, destinationPath = '', expiresIn = 3600) {
  try {
    if (!fileName || !contentType) {
      return returnFormatter(false, "Filename and content type are required");
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    const client = getSpacesClient();
    
    // Generate a unique key for the file
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    const timestamp = Date.now();
    
    let key = destinationPath;
    if (key && !key.endsWith('/')) {
      key += '/';
    }
    key += `${baseName}_${timestamp}${extension}`;
    
    // Create the command
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'private'
    });
    
    // Generate the pre-signed URL
    const url = await getSignedUrl(client, command, { expiresIn });
    
    return returnFormatter(true, "Upload URL generated successfully", { 
      url,
      key,
      expires: new Date(Date.now() + expiresIn * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return returnFormatter(false, error.message);
  }
}

/**
 * Create a new folder in DigitalOcean Spaces
 * @param {string} folderPath - The path for the new folder
 */
export async function createFolder(folderPath, parentId = null, createdBy = null) {
  try {
    if (!folderPath) {
      return returnFormatter(false, "Folder path is required");
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    const rootPath = process.env.FILESTOREFOLDER; // example: 'local-File'
    const folderNames = folderPath.split('/').filter(Boolean);
    if (folderNames.length === 0) {
      return returnFormatter(false, "Invalid folder path");
    }

    const client = getSpacesClient();

    let currentParentId = parentId || null;
    let currentPath = rootPath.endsWith('/') ? rootPath : `${rootPath}/`; // base path
    let pathArray = [];
    let lastCreatedFolder = null;

    for (const folderName of folderNames) {
      // If we have a parentId, get parent's path
      if (currentParentId) {
        const parentFolder = await fileFolderModel.findById(currentParentId);
        if (!parentFolder) {
          return returnFormatter(false, "Invalid parent folder");
        }
        currentPath = `${parentFolder.path}${folderName}/`;
      } else {
        currentPath = `${rootPath}/${folderName}/`.replace(/\/+/g, '/'); // normalize slashes
      }

      pathArray.push(folderName);

      // Check if folder already exists in DB under this parent
      let existingFolder = await fileFolderModel.findOne({
        name: folderName,
        parentId: currentParentId,
      });

      if (existingFolder) {
        currentParentId = existingFolder._id;
        continue; // Folder already exists, move to next
      }

      // Check if folder exists in S3
      try {
        const headCommand = new HeadObjectCommand({
          Bucket: bucket,
          Key: currentPath,
        });
        await client.send(headCommand);
      } catch (error) {
        if (error.name !== 'NotFound') {
          throw error;
        }

        // Folder not found in S3, create it
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: currentPath,
          Body: '',
          ContentType: 'application/x-directory',
        });
        await client.send(command);
      }

      // Save folder in DB
      const folderData = {
        name: folderName,
        path: currentPath,
        pathArray: [...pathArray],
        parentId: currentParentId,
        createdBy: createdBy || null,
      };

      const savedFolder = await fileFolderModel.create(folderData);
      currentParentId = savedFolder._id;
      lastCreatedFolder = savedFolder;
    }

    return returnFormatter(true, "Folder(s) created successfully", lastCreatedFolder);
  } catch (error) {
    console.error('Error creating folder:', error);
    return returnFormatter(false, error.message);
  }
}




/**
 * Search for files and folders in DigitalOcean Spaces
 * @param {string} query - Search query
 * @param {string} prefix - Optional prefix to limit search to a specific folder
 * @param {number} maxResults - Maximum number of results to return
 */

export async function searchObjects(query, prefix = '', maxResults = 100) {
  try {
    if (!query || query.trim().length === 0) {
      return returnFormatter(false, "Search query is required");
    }

    const searchQuery = query.toLowerCase();
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';
    const nameRegex = new RegExp(searchQuery, 'i');

    // =====================
    // 🔍 Search FOLDERS
    // =====================
    const folderFilter = { name: nameRegex };
    if (normalizedPrefix) {
      folderFilter.path = { $regex: `^${normalizedPrefix}`, $options: 'i' };
    }

    const matchedFolders = await fileFolderModel
      .find(folderFilter)
      .limit(maxResults)
      .lean();

    const folders = matchedFolders.map(folder => ({
      _id: folder._id,
      name: folder.name,
      // key: folder.path,
      path: folder.path,
      type: 'folder',
      createdBy: folder.createdBy,
      createdAt: folder.createdAt
    }));

    // =====================
    // 🔍 Search FILES
    // =====================
    const fileFilter = { fileName: nameRegex };
    if (normalizedPrefix) {
      fileFilter.fileKey = { $regex: `^${normalizedPrefix}`, $options: 'i' };
    }

    const matchedFiles = await fileSharingModel
      .find(fileFilter)
      .limit(maxResults)
      .lean();

    const files = matchedFiles.map(file => ({
      _id: file._id,
      name: file.fileName,
      // key: file.fileKey,
      url: file.url,
      size: file.size,
      mimeType: file.mimeType,
      type: 'file',
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt,
      path: file.fileKey
        ? file.fileKey.substring(0, file.fileKey.lastIndexOf('/'))
        : ''
    }));

    // =====================
    // Return or fallback
    // =====================
    if (folders.length === 0 && files.length === 0) {
      return returnFormatter(false, "No matching files or folders found");
    }

    // =====================
    // 🔠 Sort by Relevance
    // =====================
    const sortByRelevance = (a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aExact = aName === searchQuery;
      const bExact = bName === searchQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      if (aName.startsWith(searchQuery) && !bName.startsWith(searchQuery)) return -1;
      if (!aName.startsWith(searchQuery) && bName.startsWith(searchQuery)) return 1;
      return 0;
    };

    folders.sort(sortByRelevance);
    files.sort(sortByRelevance);

    return returnFormatter(true, "Search completed successfully", {
      query: searchQuery,
      folders,
      files,
      totalResults: folders.length + files.length
    });

  } catch (error) {
    console.error('Error searching from models:', error);
    return returnFormatter(false, error.message);
  }
}


/**
 * Enhanced search with additional features like content type filtering
 * @param {object} options - Search options
 */
export async function advancedSearch(options) {
  try {
    const { 
      query, 
      prefix = '', 
      maxResults = 100, 
      fileTypes = [], 
      dateRange = {},
      sizeRange = {}
    } = options;

    if (!query || query.trim().length === 0) {
      return returnFormatter(false, "Search query is required");
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    // Get basic search results
    const searchResult = await searchObjects(query, prefix, 1000); // Get more results for filtering
    
    if (!searchResult.status) {
      return searchResult;
    }

    let { files, folders } = searchResult.items;
    
    // Apply file type filtering if specified
    if (fileTypes.length > 0) {
      files = files.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return fileTypes.includes(extension);
      });
    }
    
    // Apply date range filtering if specified
    if (dateRange.from || dateRange.to) {
      files = files.filter(file => {
        const lastModified = new Date(file.lastModified).getTime();
        
        if (dateRange.from && dateRange.to) {
          return lastModified >= new Date(dateRange.from).getTime() && 
                 lastModified <= new Date(dateRange.to).getTime();
        } else if (dateRange.from) {
          return lastModified >= new Date(dateRange.from).getTime();
        } else {
          return lastModified <= new Date(dateRange.to).getTime();
        }
      });
    }
    
    // Apply size range filtering if specified
    if (sizeRange.min !== undefined || sizeRange.max !== undefined) {
      files = files.filter(file => {
        if (sizeRange.min !== undefined && sizeRange.max !== undefined) {
          return file.size >= sizeRange.min && file.size <= sizeRange.max;
        } else if (sizeRange.min !== undefined) {
          return file.size >= sizeRange.min;
        } else {
          return file.size <= sizeRange.max;
        }
      });
    }
    
    // Limit results to requested max
    files = files.slice(0, maxResults);
    folders = folders.slice(0, maxResults);
    
    // Check if we still have any results after filtering
    if (files.length === 0 && folders.length === 0) {
      return returnFormatter(false, "No matching items found after applying filters");
    }
    
    return returnFormatter(true, "Advanced search completed successfully", {
      query,
      filters: {
        fileTypes: fileTypes.length > 0 ? fileTypes : null,
        dateRange: (dateRange.from || dateRange.to) ? dateRange : null,
        sizeRange: (sizeRange.min !== undefined || sizeRange.max !== undefined) ? sizeRange : null
      },
      files,
      folders,
      totalResults: files.length + folders.length
    });
    
  } catch (error) {
    console.error('Error in advanced search:', error);
    return returnFormatter(false, error.message);
  }
}


