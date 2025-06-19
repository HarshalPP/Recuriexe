import { ListObjectsV2Command, S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { returnFormatter } from '../../formatters/common.formatter.js';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import archiver from 'archiver';
import stream from 'stream';

function getSpacesClient() {
  const endpoint = process.env.SPACES_ENDPOINT;
  const region = process.env.NEXT_PUBLIC_SPACES_REGION;
  const accessKeyId = process.env.SPACES_KEY;
  const secretAccessKey = process.env.SPACES_SECRET;

  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing required DigitalOcean Spaces configuration');
  }

  let spacesClient = new S3Client({
    endpoint: `https://${endpoint}`,
    region: region, 
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: false,
  });

  return spacesClient;
}

export async function fileShare(reqPrefix){
  try {
    const prefix = reqPrefix || '';
    const delimiter = '/';
    const bucket = process.env.SPACES_BUCKET;

    if (!bucket) {
      return returnFormatter(false,"No Bucket Found");
    }

    const client = getSpacesClient();
    const params = {
      Bucket: bucket,
      Delimiter: delimiter,
      Prefix: prefix,
      MaxKeys: 1000,
    };

    const command = new ListObjectsV2Command(params);
    const response = await client.send(command);

    const files = (response.Contents || [])
      .filter(item => item.Key !== prefix)
      .map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        name: item.Key.split('/').pop(),
        type: 'file'
      }));

    const folders = (response.CommonPrefixes || []).map(prefix => ({
      key: prefix.Prefix,
      name: prefix.Prefix.split('/').slice(-2)[0],
      type: 'folder'
    }));

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
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    try {
      const { Body, ContentType, ContentLength, LastModified } = await client.send(command);
      const filename = key.split('/').pop();
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', ContentType || 'application/octet-stream');
      if (ContentLength) res.setHeader('Content-Length', ContentLength);
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
    const archive = archiver('zip', {
      zlib: { level: 5 }
    });

    res.setHeader('Content-Disposition', 'attachment; filename="download.zip"');
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    for (const key of keys) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key
        });

        const { Body } = await client.send(command);
        const filename = key.split('/').pop();
        const passThrough = new stream.PassThrough();
        Body.pipe(passThrough);
        archive.append(passThrough, { name: filename });
      } catch (error) {
        console.warn(`Skipping file ${key}:`, error.message);
        continue;
      }
    }

    await archive.finalize();

  } catch (error) {
    console.error('Error creating ZIP archive:', error);
    if (!res.headersSent) {
      return res.status(500).json(returnFormatter(false, error.message));
    } else {
      res.end();
    }
  }
}

export async function downloadFolderAsZip(folderKey, res) {
  try {
    if (!folderKey) {
      return res.status(400).json(returnFormatter(false, "Folder key is required"));
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return res.status(500).json(returnFormatter(false, "No Bucket Found"));
    }

    const folderPrefix = folderKey.endsWith('/') ? folderKey : `${folderKey}/`;
    const result = await fileShare(folderPrefix);
    console.log(result);

    if (!result.status) {
      return res.status(500).json(returnFormatter(false, "Failed to list folder contents"));
    }

    const folderName = folderPrefix.split('/').filter(Boolean).pop() || 'folder';
    const fileKeys = result.data.files.map(file => file.key);

    if (fileKeys.length === 0) {
      return res.status(404).json(returnFormatter(false, "Folder is empty"));
    }

    const archive = archiver('zip', {
      zlib: { level: 5 }
    });

    res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    const client = getSpacesClient();

    for (const key of fileKeys) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key
        });

        const { Body } = await client.send(command);
        const relativePath = key.substring(folderPrefix.length);
        const passThrough = new stream.PassThrough();
        Body.pipe(passThrough);
        archive.append(passThrough, { name: relativePath });
      } catch (error) {
        console.warn(`Skipping file ${key}:`, error.message);
        continue;
      }
    }

    await archive.finalize();

  } catch (error) {
    console.error('Error creating folder ZIP archive:', error);
    if (!res.headersSent) {
      return res.status(500).json(returnFormatter(false, error.message));
    } else {
      res.end();
    }
  }
}

export async function uploadFile(file, destinationPath = '') {
  try {
    if (!file) {
      return returnFormatter(false, "File is required");
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    const client = getSpacesClient();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const fileName = path.basename(originalName, extension);
    const timestamp = Date.now();

    let key = destinationPath;
    if (key && !key.endsWith('/')) {
      key += '/';
    }
    key += `${fileName}_${timestamp}${extension}`;

    const upload = new Upload({
      client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
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

export async function uploadMultipleFiles(files, destinationPath = '') {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return returnFormatter(false, "Files are required");
    }

    const results = [];
    const errors = [];

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
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    const timestamp = Date.now();

    let key = destinationPath;
    if (key && !key.endsWith('/')) {
      key += '/';
    }
    key += `${baseName}_${timestamp}${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'private'
    });

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

export async function createFolder(folderPath) {
  try {
    if (!folderPath) {
      return returnFormatter(false, "Folder path is required");
    }

    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) {
      return returnFormatter(false, "No Bucket Found");
    }

    const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    const client = getSpacesClient();

    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: normalizedPath
      });

      await client.send(headCommand);
      return returnFormatter(false, "Folder already exists");
    } catch (error) {
      if (error.name !== 'NotFound') {
        throw error;
      }
    }

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

export async function searchObjects(query, prefix = '', maxResults = 100) {
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

    const params = {
      Bucket: bucket,
      MaxKeys: 1000,
    };

    if (prefix) {
      params.Prefix = prefix;
    }

    let isTruncated = true;
    let continuationToken = null;
    let matchedFiles = [];
    let matchedFolders = new Set();

    while (isTruncated && matchedFiles.length < maxResults) {
      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      const command = new ListObjectsV2Command(params);
      const response = await client.send(command);

      const files = (response.Contents || [])
        .filter(item => {
          if (prefix && item.Key === prefix) return false;
          const fileName = item.Key.split('/').pop();
          return fileName.toLowerCase().includes(searchQuery);
        })
        .map(item => ({
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified,
          name: item.Key.split('/').pop(),
          path: item.Key.substring(0, item.Key.lastIndexOf('/')),
          type: 'file'
        }));

      matchedFiles = [...matchedFiles, ...files].slice(0, maxResults);

      response.Contents.forEach(item => {
        const key = item.Key;
        if (key === prefix) return;
        const parts = key.split('/');
        let path = '';
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!part) continue;
          path = path ? `${path}/${part}` : part;
          if (part.toLowerCase().includes(searchQuery)) {
            const folderKey = `${path}/`;
            matchedFolders.add(folderKey);
          }
        }
      });

      isTruncated = response.IsTruncated;
      continuationToken = response.NextContinuationToken;
    }

    const folders = Array.from(matchedFolders).map(folderKey => {
      const parts = folderKey.split('/');
      const folderName = parts[parts.length - 2];
      return {
        key: folderKey,
        name: folderName,
        path: folderKey.substring(0, folderKey.lastIndexOf(folderName)),
        type: 'folder'
      };
    });

    if (matchedFiles.length === 0 && folders.length === 0) {
      return returnFormatter(false, "No matching files or folders found");
    }

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

    matchedFiles.sort(sortByRelevance);
    const sortedFolders = [...folders].sort(sortByRelevance);

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

    const searchResult = await searchObjects(query, prefix, 1000);

    if (!searchResult.status) {
      return searchResult;
    }

    let { files, folders } = searchResult.items;

    if (fileTypes.length > 0) {
      files = files.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return fileTypes.includes(extension);
      });
    }

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

    files = files.slice(0, maxResults);
    folders = folders.slice(0, maxResults);

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