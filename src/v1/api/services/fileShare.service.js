const { ListObjectsV2Command,S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { returnFormatter } = require('../formatter/common.formatter');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const archiver = require('archiver');





function getSpacesClient() {
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

async function fileShare(reqPrefix){
    try {
        // Get the prefix (folder path) from query params, default to root
        const prefix = reqPrefix || '';
        // Use the delimiter to group by common prefixes (folders)
        const delimiter = '/';
        const bucket = process.env.SPACES_BUCKET;
    
        if (!bucket) {
          return returnFormatter(false,"No Bucket Found");
        }
    
        const client = getSpacesClient();
        
        // Initialize params for the ListObjectsV2Command
        const params = {
          Bucket: bucket,
          Delimiter: delimiter,
          Prefix: prefix,
          MaxKeys: 1000, // Adjust as needed
        };
    
        // Execute the command
        const command = new ListObjectsV2Command(params);
        const response = await client.send(command);
    
        // Process the response to separate files and folders
        const files = (response.Contents || [])
          .filter(item => item.Key !== prefix) // Remove the current prefix from results
          .map(item => ({
            key: item.Key,
            size: item.Size,
            lastModified: item.LastModified,
            // Extract filename from the full path
            name: item.Key.split('/').pop(),
            type: 'file'
          }));
    
        // Extract folders (Common Prefixes in S3 terminology)
        const folders = (response.CommonPrefixes || []).map(prefix => ({
          key: prefix.Prefix,
          // Extract folder name from the prefix
          name: prefix.Prefix.split('/').slice(-2)[0],
          type: 'folder'
        }));
    
        // Return combined result
        return returnFormatter(true,"Explorer",{
            files,
            folders,
            prefix,
            isTruncated: response.IsTruncated,
            nextContinuationToken: response.NextContinuationToken
          });
      } catch (error) {
        console.error('Error fetching from Spaces:', error);
        return returnFormatter(false,error.message)
      }
}

/**
 * Generate a pre-signed URL for file download
 * @param {string} key - The key/path of the file to download
 * @param {number} expiresIn - URL expiration time in seconds
 */
async function generateDownloadUrl(key, expiresIn = 3600) {
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
async function streamFileDownload(key, res) {
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
async function downloadMultipleAsZip(keys, res) {
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
async function downloadFolderAsZip(folderKey, res) {
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
async function uploadFile(file, destinationPath = '') {
  try {
    if (!file) {
      return returnFormatter(false, "File is required");
    }

    const bucket = process.env.SPACES_BUCKET;
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
    key += `${fileName}_${timestamp}${extension}`;
    
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
async function uploadMultipleFiles(files, destinationPath = '') {
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
async function generateUploadUrl(fileName, contentType, destinationPath = '', expiresIn = 3600) {
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
async function createFolder(folderPath) {
  try {
    if (!folderPath) {
      return returnFormatter(false, "Folder path is required");
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    // Ensure the folder path ends with a slash
    const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    
    const client = getSpacesClient();
    
    // Check if the folder already exists
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: normalizedPath
      });
      
      await client.send(headCommand);
      
      // If we get here, the folder already exists
      return returnFormatter(false, "Folder already exists");
    } catch (error) {
      // If the folder doesn't exist, we can create it
      if (error.name !== 'NotFound') {
        throw error;
      }
    }
    
    // Create an empty object with the folder name (S3 convention for folders)
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: normalizedPath,
      Body: '',
      ContentType: 'application/x-directory'
    });
    
    await client.send(command);
    
    return returnFormatter(true, "Folder created successfully", { path: normalizedPath });
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
async function searchObjects(query, prefix = '', maxResults = 100) {
  try {
    if (!query || query.trim().length === 0) {
      return returnFormatter(false, "Search query is required");
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    const client = getSpacesClient();
    const searchQuery = query.toLowerCase();
    
    // Prepare params for listing objects
    const params = {
      Bucket: bucket,
      MaxKeys: 1000, // Get a large batch to search through
    };
    
    // Add prefix if provided to limit search scope
    if (prefix) {
      params.Prefix = prefix;
    }

    // We'll do pagination if necessary
    let isTruncated = true;
    let continuationToken = null;
    let matchedFiles = [];
    let matchedFolders = new Set();

    // Process all pages
    while (isTruncated && matchedFiles.length < maxResults) {
      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      const command = new ListObjectsV2Command(params);
      const response = await client.send(command);

      // Process files
      const files = (response.Contents || [])
        .filter(item => {
          // Skip the prefix itself
          if (prefix && item.Key === prefix) return false;
          
          // Check if the file name matches the search query
          const fileName = item.Key.split('/').pop();
          return fileName.toLowerCase().includes(searchQuery);
        })
        .map(item => ({
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified,
          name: item.Key.split('/').pop(),
          // Extract path from the key (excluding the filename)
          path: item.Key.substring(0, item.Key.lastIndexOf('/')),
          type: 'file'
        }));

      matchedFiles = [...matchedFiles, ...files].slice(0, maxResults);
      
      // Process implicit folders (inferred from file paths)
      response.Contents.forEach(item => {
        const key = item.Key;
        // Skip the current prefix
        if (key === prefix) return;
        
        // Extract folder paths from the key
        const parts = key.split('/');
        let path = '';
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          
          // Skip empty parts
          if (!part) continue;
          
          // Build up the path
          path = path ? `${path}/${part}` : part;
          
          // If the folder name matches the search query, add it
          if (part.toLowerCase().includes(searchQuery)) {
            const folderKey = `${path}/`;
            matchedFolders.add(folderKey);
          }
        }
      });

      // Check if there are more results
      isTruncated = response.IsTruncated;
      continuationToken = response.NextContinuationToken;
    }

    // Convert matched folders set to array
    const folders = Array.from(matchedFolders).map(folderKey => {
      const parts = folderKey.split('/');
      const folderName = parts[parts.length - 2]; // Get the last non-empty segment
      return {
        key: folderKey,
        name: folderName,
        path: folderKey.substring(0, folderKey.lastIndexOf(folderName)),
        type: 'folder'
      };
    });

    // Check if we have any results
    if (matchedFiles.length === 0 && folders.length === 0) {
      return returnFormatter(false, "No matching files or folders found");
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortByRelevance = (a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      const aExactMatch = aName === searchQuery;
      const bExactMatch = bName === searchQuery;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      const aStartsWithMatch = aName.startsWith(searchQuery);
      const bStartsWithMatch = bName.startsWith(searchQuery);
      
      if (aStartsWithMatch && !bStartsWithMatch) return -1;
      if (!aStartsWithMatch && bStartsWithMatch) return 1;
      
      return 0;
    };

    // Sort the results
    matchedFiles.sort(sortByRelevance);
    const sortedFolders = [...folders].sort(sortByRelevance);

    // Return the results
    return returnFormatter(true, "Search completed successfully", {
      query: searchQuery,
      files: matchedFiles,
      folders: sortedFolders,
      totalResults: matchedFiles.length + sortedFolders.length
    });

  } catch (error) {
    console.error('Error searching objects:', error);
    return returnFormatter(false, error.message);
  }
}

/**
 * Enhanced search with additional features like content type filtering
 * @param {object} options - Search options
 */
async function advancedSearch(options) {
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


module.exports={
    fileShare,
    generateDownloadUrl,
    streamFileDownload,
    downloadMultipleAsZip,
    downloadFolderAsZip,
    searchObjects,
    advancedSearch,
    uploadFile,
    uploadMultipleFiles,
    generateUploadUrl,
    createFolder
}