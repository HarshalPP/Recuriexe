import FileMeta from '../../models/fileShare.model.js/fileShare.model.js';
import Folder from '../../models/fileShare.model.js/folder.model.js';

import RecentActivity from '../../models/fileShare.model.js/fileHistory.model.js';

import { ListObjectsV2Command, S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { returnFormatter } from '../../formatters/common.formatter.js';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import archiver from 'archiver';
import stream from 'stream';

function getSpacesClient() {
  const endpoint = process.env.SPACES_ENDPOINT;
  console.log("Endpoint:", endpoint);
  const region = process.env.SPACES_REGION;
  console.log("Region:", region);
  const accessKeyId = process.env.DO_SPACES_KEY;
  console.log("Access Key ID:", accessKeyId);
  const secretAccessKey = process.env.DO_SPACES_SECRET;
  console.log("Secret Access Key:", secretAccessKey);
  

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

// export async function fileShare(reqPrefix){
//   try {
//     const prefix = reqPrefix || '';
//     const delimiter = '';
//     const bucket = process.env.PATH_BUCKET;;

//     if (!bucket) {
//       return returnFormatter(false,"No Bucket Found");
//     }

//     const client = getSpacesClient();
//     const params = {
//       Bucket: bucket,
//       Delimiter: delimiter,
//       Prefix: `akash/${prefix}`, // Ensure prefix ends with a slash
//       MaxKeys: 1000,
//     };

//     const command = new ListObjectsV2Command(params);
//     const response = await client.send(command);

//     const files = (response.Contents || [])
//       .filter(item => item.Key !== prefix)
//       .map(item => ({
//         key: item.Key,
//         size: item.Size,
//         lastModified: item.LastModified,
//         name: item.Key.split('/').pop(),
//         type: 'file'
//       }));

//     const folders = (response.CommonPrefixes || []).map(prefix => ({
//       key: prefix.Prefix,
//       name: prefix.Prefix.split('/').slice(-2)[0],
//       type: 'folder'
//     }));

//     return returnFormatter(true,"Explorer",{
//       files,
//       folders,
//       prefix,
//       isTruncated: response.IsTruncated,
//       nextContinuationToken: response.NextContinuationToken
//     });
//   } catch (error) {
//     console.error('Error fetching from Spaces:', error);
//     return returnFormatter(false,error.message)
//   }
// }

export async function fileShare(req, parentId) {
  try {
    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId is required");
    }

    // Root ya kisi folder ke andar ke items fetch karo
    const folderFilter = {
      organizationId,
      parentId: parentId || null,
      status: 'active'
    };

    // Folders
    const folders = await Folder.find({ ...folderFilter, type: 'folder' }).lean();

    // Files
    const filesRaw = await Folder.find({ ...folderFilter, type: 'file' }).lean();

    // Subfolder count for each folder
    const folderData = await Promise.all(
      folders.map(async (folder) => {
        const subfolderCount = await Folder.countDocuments({
          organizationId,
          parentId: folder._id,
          type: 'folder',
          status: 'active'
        });
        return {
          _id: folder._id,
          name: folder.name,
          type: 'folder',
          parentId: folder.parentId,
          createdAt: folder.createdAt,
          subfolderCount
        };
      })
    );

    // File data
    const files = filesRaw.map(file => ({
      _id: file._id,
      name: file.name,
      key: file.key,
      url: file.location,
      size: file.size,
      mimeType: file.mimetype,
      type: 'file',
      parentId: file.parentId,
      uploadedBy: file.candidateId,
      createdAt: file.createdAt
    }));

    return returnFormatter(true, 'Explorer', {
      parentId: parentId || null,
      folders: folderData,
      files
    });

  } catch (error) {
    console.error('Error fetching from MongoDB:', error);
    return returnFormatter(false, error.message);
  }
}



// export async function createFolder(folderPath, req) {
//   try {
//     const organizationId = req.employee.organizationId;
//     console.log("Organization ID:", organizationId);
//     const candidateId = req.body.candidateId;
//     if (!organizationId || !candidateId) {
//       return returnFormatter(false, "organizationId and candidateId are required");
//     }
//     if (!folderPath) {
//       return returnFormatter(false, "Folder path is required");
//     }

//     const bucket = process.env.PATH_BUCKET;
//     if (!bucket) {
//       return returnFormatter(false, "No Bucket Found");
//     }

//     const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
//     const client = getSpacesClient();

//     // S3 par folder create karo
//     try {
//       const headCommand = new HeadObjectCommand({
//         Bucket: bucket,
//         Key: normalizedPath
//       });
//       await client.send(headCommand);
//       return returnFormatter(false, "Folder already exists");
//     } catch (error) {
//       if (error.name !== 'NotFound') throw error;
//     }

//     const command = new PutObjectCommand({
//       Bucket: bucket,
//       Key: normalizedPath,
//       Body: '',
//       ContentType: 'application/x-directory'
//     });
//     await client.send(command);

//     // MongoDB me folder meta save karo
//     const folderName = normalizedPath.split('/').filter(Boolean).pop();
//     const folderMeta = new FileMeta({
//       candidateId,
//       organizationId,
//       originalName: folderName,
//       key: normalizedPath,
//       location: '',
//       size: 0,
//       mimetype: 'application/x-directory',
//       type: 'folder',
//       path: normalizedPath,
//       folderName: folderName
//     });
//     const savedFolder = await folderMeta.save();

//     // History me bhi save karo
//     await RecentActivity.create({
//       candidateId,
//       fileId: savedFolder._id,
//       openedAt: new Date()
//     });

//     return returnFormatter(true, "Folder created successfully", { path: normalizedPath });
//   } catch (error) {
//     console.error('Error creating folder:', error);
//     return returnFormatter(false, error.message);
//   }
// }

export async function createFolder(folderPath, req) {
  try {
    const organizationId = req.employee.organizationId;
    const candidateId = req.body.candidateId;
    const parentId = req.body.parentId || null;
    if (!organizationId ) {
      return { status: false, message: "organizationId is required" };
    }
    if (!folderPath) {
      return { status: false, message: "Folder path is required" };
    }

    const bucket = process.env.PATH_BUCKET;
    if (!bucket) {
      return { status: false, message: "No Bucket Found" };
    }

    const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    const client = getSpacesClient();

    // S3 par folder create karo
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: normalizedPath
      });
      await client.send(headCommand);
      return { status: false, message: "Folder already exists" };
    } catch (error) {
      if (error.name !== 'NotFound') throw error;
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: normalizedPath,
      Body: '',
      ContentType: 'application/x-directory'
    });
    await client.send(command);

    // MongoDB me folder meta save karo
    const folderName = normalizedPath.split('/').filter(Boolean).pop();
    const folderDoc = new Folder({
      organizationId,
      candidateId,
      parentId,
      name: folderName,
      type: 'folder',
      key: normalizedPath,
      location: '',
      size: 0,
      mimetype: 'application/x-directory',
      extension: '',
      openedAt: null
    });
    await folderDoc.save();

    return { status: true, message: "Folder created successfully", data: { path: normalizedPath } };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

// export async function uploadFile(file, destinationPath = '', req) {
//   try {
//     const organizationId = req.employee.organizationId;
//     console.log("Organization ID:", organizationId);
//     const candidateId = req.body.candidateId;
//     console.log("Candidate ID:", candidateId);
//     if (!organizationId || !candidateId) {
//       return returnFormatter(false, "organizationId and candidateId are required");
//     }
//     if (!file) {
//       return returnFormatter(false, "File is required");
//     }

//     const bucket = process.env.PATH_BUCKET;
//     if (!bucket) {
//       return returnFormatter(false, "No Bucket Found");
//     }

//     const client = getSpacesClient();
//     const originalName = file.originalname;
//     const extension = path.extname(originalName);
//     const fileName = path.basename(originalName, extension);
//     const timestamp = Date.now();

//     let key = destinationPath;
//     if (key && !key.endsWith('/')) key += '/';
//     key += `${fileName}_${timestamp}${extension}`;

//     const upload = new Upload({
//       client,
//       params: {
//         Bucket: bucket,
//         Key: key,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         ACL: 'private',
//       },
//     });

//     const result = await upload.done();

//     // MongoDB me meta-data save karo
//     const folderName = destinationPath.split('/').filter(Boolean).pop() || '';
//     const fileMeta = new FileMeta({
//       candidateId,
//       organizationId,
//       originalName: file.originalname,
//       key: result.Key,
//       location: result.Location,
//       size: file.size,
//       mimetype: file.mimetype,
//       type: 'file',
//       path: destinationPath,
//       folderName: folderName
//     });
//     const savedFile = await fileMeta.save();

//     // History me bhi save karo
//     await RecentActivity.create({
//       candidateId,
//       fileId: savedFile._id,
//       openedAt: new Date()
//     });

//     return returnFormatter(true, "File uploaded successfully", {
//       key: result.Key,
//       location: result.Location,
//       etag: result.ETag,
//       size: file.size,
//       mimetype: file.mimetype,
//       originalName: file.originalname
//     });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     return returnFormatter(false, error.message);
//   }
// }

export async function uploadFile(file, destinationPath = '', req) {
  try {
    const organizationId = req.employee.organizationId;
    const candidateId = req.body.candidateId;
    const parentId = req.body.parentId || null;
    if (!organizationId ) {
      return { status: false, message: "organizationId is  required" };
    }
    if (!file) {
      return { status: false, message: "File is required" };
    }

    const bucket = process.env.PATH_BUCKET;
    if (!bucket) {
      return { status: false, message: "No Bucket Found" };
    }

    const client = getSpacesClient();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const fileName = path.basename(originalName, extension);
    const timestamp = Date.now();

    let key = destinationPath;
    if (key && !key.endsWith('/')) key += '/';
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

    // MongoDB me file meta-data save karo
    const fileDoc = new Folder({
      organizationId,
      candidateId,
      parentId,
      name: file.originalname,
      type: 'file',
      key: result.Key,
      location: result.Location,
      size: file.size,
      mimetype: file.mimetype,
      extension: extension,
      openedAt: null
    });
    await fileDoc.save();

    return {
      status: true,
      message: "File uploaded successfully",
      data: {
        key: result.Key,
        location: result.Location,
        etag: result.ETag,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname
      }
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

export async function getFolderOrFile(key, req) {
  try {
    const organizationId = req.user.organizationId;
    const candidateId = req.user._id; // Or from req.body if needed

    // Sirf apne org ka data
    const item = await FileMeta.findOne({ key, organizationId });
    if (!item) return returnFormatter(false, "Not found");

    // History update
    await RecentActivity.create({
      candidateId,
      fileId: item._id,
      openedAt: new Date()
    });

    return returnFormatter(true, "Item fetched", item);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

/**
 * Search for files and folders in MongoDB (Folder model)
 * @param {string} query - Search query
 * @param {string} prefix - Optional prefix to limit search to a specific folder
 * @param {number} maxResults - Maximum number of results to return
 */

// export async function searchObjects(query, prefix = '', maxResults = 100, allowBlankQuery = false,req) {
//   try {
//     if (!allowBlankQuery && (!query || query.trim().length === 0)) {
//       return returnFormatter(false, "Search query is required");
//     }

//     // OrganizationId from req
//     console.log("Request Employee:", req?.employee);
//     console.log("Request Body:", req?.body);
//         console.log("Request Employee:", req?.employee.organizationId);

//     const organizationId = req.employee.organizationId;
//     console.log("Organization ID:", organizationId);
//     if (!organizationId) {
//       return returnFormatter(false, "OrganizationId is required");
//     }

//     const searchQuery = (query || '').toLowerCase();
//     const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';
//     const nameRegex = query && query.trim().length > 0 ? new RegExp(searchQuery, 'i') : /.*/;

//     // Folders
//     const folderFilter = { organizationId, type: 'folder', name: nameRegex };
//     if (normalizedPrefix) {
//       folderFilter.key = { $regex: `^${normalizedPrefix}`, $options: 'i' };
//     }

//     const matchedFolders = await Folder
//       .find(folderFilter)
//       .limit(maxResults)
//       .lean();

//     const folders = matchedFolders.map(folder => ({
//       _id: folder._id,
//       name: folder.name,
//       key: folder.key,
//       type: 'folder',
//       createdBy: folder.candidateId,
//       createdAt: folder.createdAt
//     }));

//     // Files
//     const fileFilter = { organizationId, type: 'file', name: nameRegex };
//     if (normalizedPrefix) {
//       fileFilter.key = { $regex: `^${normalizedPrefix}`, $options: 'i' };
//     }

//     const matchedFiles = await Folder
//       .find(fileFilter)
//       .limit(maxResults)
//       .lean();

//     const files = matchedFiles.map(file => ({
//       _id: file._id,
//       name: file.name,
//       key: file.key,
//       url: file.location,
//       size: file.size,
//       mimeType: file.mimetype,
//       extension: file.extension,
//       type: 'file',
//       uploadedBy: file.candidateId,
//       createdAt: file.createdAt,
//       path: file.key ? file.key.substring(0, file.key.lastIndexOf('/')) : ''
//     }));

//     if (folders.length === 0 && files.length === 0) {
//       return returnFormatter(false, "No matching files or folders found");
//     }

//     // Sort by relevance
//     const sortByRelevance = (a, b) => {
//       const aName = a.name.toLowerCase();
//       const bName = b.name.toLowerCase();
//       const aExact = aName === searchQuery;
//       const bExact = bName === searchQuery;
//       if (aExact && !bExact) return -1;
//       if (!aExact && bExact) return 1;
//       if (aName.startsWith(searchQuery) && !bName.startsWith(searchQuery)) return -1;
//       if (!aName.startsWith(searchQuery) && bName.startsWith(searchQuery)) return 1;
//       return 0;
//     };

//     folders.sort(sortByRelevance);
//     files.sort(sortByRelevance);

//     return returnFormatter(true, "Search completed successfully", {
//       query: searchQuery,
//       folders,
//       files,
//       totalResults: folders.length + files.length
//     });

//   } catch (error) {
//     console.error('Error searching from models:', error);
//     return returnFormatter(false, error.message);
//   }
// }

/**
 * Enhanced search with additional features like content type filtering
 * @param {object} options - Search options
 */
// export async function advancedSearch(options) {
//   try {
//     const { 
//       query='', 
//       prefix = '', 
//       maxResults = 100, 
//       fileTypes = [], 
//       dateRange = {},
//       sizeRange = {}
//     } = options;

//     // if (!query || query.trim().length === 0) {
//     //   return returnFormatter(false, "Search query is required");
//     // }

//     // Get basic search results
//     const searchResult = await searchObjects(query, prefix, 1000,true); // Get more results for filtering
    
//     if (!searchResult.status) {
//       return searchResult;
//     }

//     let { files, folders } = searchResult.data;
    
//     // File type filtering
//     if (fileTypes.length > 0) {
//       files = files.filter(file => {
//         const extension = file.name.split('.').pop().toLowerCase();
//         return fileTypes.includes(extension);
//       });
//     }
    
//     // Date range filtering
//     if (dateRange.from || dateRange.to) {
//       files = files.filter(file => {
//         const createdAt = new Date(file.createdAt).getTime();
//         if (dateRange.from && dateRange.to) {
//           return createdAt >= new Date(dateRange.from).getTime() && 
//                  createdAt <= new Date(dateRange.to).getTime();
//         } else if (dateRange.from) {
//           return createdAt >= new Date(dateRange.from).getTime();
//         } else {
//           return createdAt <= new Date(dateRange.to).getTime();
//         }
//       });
//     }
    
//     // Size range filtering
//     if (sizeRange.min !== undefined || sizeRange.max !== undefined) {
//       files = files.filter(file => {
//         if (sizeRange.min !== undefined && sizeRange.max !== undefined) {
//           return file.size >= sizeRange.min && file.size <= sizeRange.max;
//         } else if (sizeRange.min !== undefined) {
//           return file.size >= sizeRange.min;
//         } else {
//           return file.size <= sizeRange.max;
//         }
//       });
//     }
    
//     // Limit results
//     files = files.slice(0, maxResults);
//     folders = folders.slice(0, maxResults);
    
//     if (files.length === 0 && folders.length === 0) {
//       return returnFormatter(false, "No matching items found after applying filters");
//     }
    
//     return returnFormatter(true, "Advanced search completed successfully", {
//       query,
//       filters: {
//         fileTypes: fileTypes.length > 0 ? fileTypes : null,
//         dateRange: (dateRange.from || dateRange.to) ? dateRange : null,
//         sizeRange: (sizeRange.min !== undefined || sizeRange.max !== undefined) ? sizeRange : null
//       },
//       files,
//       folders,
//       totalResults: files.length + folders.length
//     });
    
//   } catch (error) {
//     console.error('Error in advanced search:', error);
//     return returnFormatter(false, error.message);
//   }
// }

export async function searchObjects(query, prefix = '', maxResults = 100, allowBlankQuery = false, req, parentId = null) {
  try {
    if (!allowBlankQuery && (!query || query.trim().length === 0)) {
      return returnFormatter(false, "Search query is required");
    }

    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId is required");
    }

    const searchQuery = (query || '').toLowerCase();
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';
    const nameRegex = query && query.trim().length > 0 ? new RegExp(searchQuery, 'i') : /.*/;

    // Folders
    const folderFilter = { organizationId, type: 'folder', name: nameRegex, parentId: parentId || null };
    if (normalizedPrefix) {
      folderFilter.key = { $regex: `^${normalizedPrefix}`, $options: 'i' };
    }

    const matchedFolders = await Folder
      .find(folderFilter)
      .limit(maxResults)
      .lean();

    const folders = matchedFolders.map(folder => ({
      _id: folder._id,
      name: folder.name,
      key: folder.key,
      type: 'folder',
      createdBy: folder.candidateId,
      createdAt: folder.createdAt
    }));

    // Files
    const fileFilter = { organizationId, type: 'file', name: nameRegex, parentId: parentId || null };
    if (normalizedPrefix) {
      fileFilter.key = { $regex: `^${normalizedPrefix}`, $options: 'i' };
    }

    const matchedFiles = await Folder
      .find(fileFilter)
      .limit(maxResults)
      .lean();

    const files = matchedFiles.map(file => ({
      _id: file._id,
      name: file.name,
      key: file.key,
      url: file.location,
      size: file.size,
      mimeType: file.mimetype,
      extension: file.extension,
      type: 'file',
      uploadedBy: file.candidateId,
      createdAt: file.createdAt,
      path: file.key ? file.key.substring(0, file.key.lastIndexOf('/')) : ''
    }));

    if (folders.length === 0 && files.length === 0) {
      return returnFormatter(false, "No matching files or folders found");
    }

    // Sort by relevance
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

// export async function advancedSearch(options, req) {
//   try {
//     const { 
//       query='', 
//       prefix = '', 
//       maxResults = 100, 
//       fileTypes = [], 
//       dateRange = {},
//       sizeRange = {}
//     } = options;

//     // Get basic search results with organization filter
//     const searchResult = await searchObjects(query, prefix, 1000, true,req); // allowBlankQuery = true
    
//     if (!searchResult.status) {
//       return searchResult;
//     }

//     let { files, folders } = searchResult.data;
    
//     // File type filtering (extension field par)
//     // if (fileTypes.length > 0) {
//     //   const normalizedTypes = fileTypes.map(ext => ext.startsWith('.') ? ext.toLowerCase() : '.' + ext.toLowerCase());
//     //   files = files.filter(file => normalizedTypes.includes((file.extension || '').toLowerCase()));
//     // }
    
//     if (fileTypes.length > 0) {
//   const normalizedTypes = fileTypes.map(ext => ext.startsWith('.') ? ext.toLowerCase() : '.' + ext.toLowerCase());
//   files = files.filter(file => normalizedTypes.includes((file.extension || '').toLowerCase()));
//   // Agar fileTypes diya hai to folders ko empty kar do
//   folders = [];
// }
//     // Date range filtering
//     if (dateRange.from || dateRange.to) {
//       files = files.filter(file => {
//         const createdAt = new Date(file.createdAt).getTime();
//         if (dateRange.from && dateRange.to) {
//           return createdAt >= new Date(dateRange.from).getTime() && 
//                  createdAt <= new Date(dateRange.to).getTime();
//         } else if (dateRange.from) {
//           return createdAt >= new Date(dateRange.from).getTime();
//         } else {
//           return createdAt <= new Date(dateRange.to).getTime();
//         }
//       });
//     }
    
//     // Size range filtering
//     if (sizeRange.min !== undefined || sizeRange.max !== undefined) {
//       files = files.filter(file => {
//         if (sizeRange.min !== undefined && sizeRange.max !== undefined) {
//           return file.size >= sizeRange.min && file.size <= sizeRange.max;
//         } else if (sizeRange.min !== undefined) {
//           return file.size >= sizeRange.min;
//         } else {
//           return file.size <= sizeRange.max;
//         }
//       });
//     }
    
//     // Limit results
//     files = files.slice(0, maxResults);
//     folders = folders.slice(0, maxResults);
    
//     if (files.length === 0 && folders.length === 0) {
//       return returnFormatter(false, "No matching items found after applying filters");
//     }
    
//     return returnFormatter(true, "Advanced search completed successfully", {
//       query,
//       filters: {
//         fileTypes: fileTypes.length > 0 ? fileTypes : null,
//         dateRange: (dateRange.from || dateRange.to) ? dateRange : null,
//         sizeRange: (sizeRange.min !== undefined || sizeRange.max !== undefined) ? sizeRange : null
//       },
//       files,
//       folders,
//       totalResults: files.length + folders.length
//     });
    
//   } catch (error) {
//     console.error('Error in advanced search:', error);
//     return returnFormatter(false, error.message);
//   }
// }

// export async function advancedSearch1(options, req) {
//   try {
//     const {
//       query = '',
//       prefix = '',
//       maxResults = 100,
//       fileTypes = [],
//       dateRange = {},
//       sizeRange = {},
//       parentId = null
//     } = options;

//     const organizationId = req.employee.organizationId;
//     if (!organizationId) {
//       return returnFormatter(false, "OrganizationId is required");
//     }

//     const searchQuery = (query || '').toLowerCase();
//     const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';
//     const nameRegex = query && query.trim().length > 0 ? new RegExp(searchQuery, 'i') : /.*/;

//     // File type group mapping
//     const fileTypeGroups = {
//       image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
//       video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
//       audio: ['.mp3', '.wav', '.aac', '.ogg', '.flac'],
//       document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
//     };

//     // Expand group names to extensions
//     let normalizedTypes = [];
//     if (fileTypes.length > 0) {
//       fileTypes.forEach(type => {
//         const lower = type.toLowerCase();
//         if (fileTypeGroups[lower]) {
//           normalizedTypes.push(...fileTypeGroups[lower]);
//         } else {
//           normalizedTypes.push(lower.startsWith('.') ? lower : '.' + lower);
//         }
//       });
//     }

//     // Folders filter (folders tabhi laao jab fileTypes nahi diya ho)
//     let folders = [];
//     if (!fileTypes.length) {
//       const folderFilter = { organizationId, type: 'folder', name: nameRegex, parentId: parentId || null };
//       if (normalizedPrefix) {
//         folderFilter.key = { $regex: `^${normalizedPrefix}`, $options: 'i' };
//       }
//       const matchedFolders = await Folder.find(folderFilter).limit(maxResults).lean();
//       folders = matchedFolders.map(folder => ({
//         _id: folder._id,
//         name: folder.name,
//         key: folder.key,
//         type: 'folder',
//         createdBy: folder.candidateId,
//         createdAt: folder.createdAt
//       }));
//     }

//     // Files filter
//     const fileFilter = { organizationId, type: 'file', name: nameRegex, parentId: parentId || null };
//     if (normalizedPrefix) {
//       fileFilter.key = { $regex: `^${normalizedPrefix}`, $options: 'i' };
//     }
//     if (normalizedTypes.length > 0) {
//       fileFilter.extension = { $in: normalizedTypes };
//     }
//     let files = await Folder.find(fileFilter).limit(1000).lean();

//     // Date range filtering
//     if (dateRange.from || dateRange.to) {
//       files = files.filter(file => {
//         const createdAt = new Date(file.createdAt).getTime();
//         if (dateRange.from && dateRange.to) {
//           return createdAt >= new Date(dateRange.from).getTime() &&
//                  createdAt <= new Date(dateRange.to).getTime();
//         } else if (dateRange.from) {
//           return createdAt >= new Date(dateRange.from).getTime();
//         } else {
//           return createdAt <= new Date(dateRange.to).getTime();
//         }
//       });
//     }

//     // Size range filtering
//     if (sizeRange.min !== undefined || sizeRange.max !== undefined) {
//       files = files.filter(file => {
//         if (sizeRange.min !== undefined && sizeRange.max !== undefined) {
//           return file.size >= sizeRange.min && file.size <= sizeRange.max;
//         } else if (sizeRange.min !== undefined) {
//           return file.size >= sizeRange.min;
//         } else {
//           return file.size <= sizeRange.max;
//         }
//       });
//     }

//     files = files.map(file => ({
//       _id: file._id,
//       name: file.name,
//       key: file.key,
//       url: file.location,
//       size: file.size,
//       mimeType: file.mimetype,
//       extension: file.extension,
//       type: 'file',
//       uploadedBy: file.candidateId,
//       createdAt: file.createdAt,
//       path: file.key ? file.key.substring(0, file.key.lastIndexOf('/')) : ''
//     }));

//     // Sort by relevance if query diya ho
//     if (query && query.trim().length > 0) {
//       const sortByRelevance = (a, b) => {
//         const aName = a.name.toLowerCase();
//         const bName = b.name.toLowerCase();
//         const aExact = aName === searchQuery;
//         const bExact = bName === searchQuery;
//         if (aExact && !bExact) return -1;
//         if (!aExact && bExact) return 1;
//         if (aName.startsWith(searchQuery) && !bName.startsWith(searchQuery)) return -1;
//         if (!aName.startsWith(searchQuery) && bName.startsWith(searchQuery)) return 1;
//         return 0;
//       };
//       folders.sort(sortByRelevance);
//       files.sort(sortByRelevance);
//     }

//     files = files.slice(0, maxResults);
//     folders = folders.slice(0, maxResults);

//     // If fileTypes filter laga hai, folders ko empty kar do
//     if (fileTypes.length > 0) {
//       folders = [];
//     }

//     if (files.length === 0 && folders.length === 0) {
//       return returnFormatter(false, "No matching files or folders found");
//     }

//     return returnFormatter(true, "Search completed successfully", {
//       query,
//       filters: {
//         fileTypes: fileTypes.length > 0 ? fileTypes : null,
//         dateRange: (dateRange.from || dateRange.to) ? dateRange : null,
//         sizeRange: (sizeRange.min !== undefined || sizeRange.max !== undefined) ? sizeRange : null
//       },
//       files,
//       folders,
//       totalResults: files.length + folders.length
//     });

//   } catch (error) {
//     console.error('Error in unified search:', error);
//     return returnFormatter(false, error.message);
//   }
// }


// Helper to get all descendant folder IDs recursively
async function getAllDescendantFolderIds(parentId, organizationId) {
  let ids = [];
  const children = await Folder.find({ organizationId, parentId, type: 'folder' }, '_id').lean();
  for (const child of children) {
    ids.push(child._id);
    const subIds = await getAllDescendantFolderIds(child._id, organizationId);
    ids = ids.concat(subIds);
  }
  return ids;
}


export async function advancedSearch(options, req) {
  try {
    const {
      query = '',
      prefix = '',
      maxResults = 100,
      fileTypes = [],
      dateRange = {},
      sizeRange = {},
      parentId = null
    } = options;

    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId is required");
    }

    const searchQuery = (query || '').toLowerCase();
    const normalizedPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';
    const nameRegex = query && query.trim().length > 0 ? new RegExp(searchQuery, 'i') : /.*/;

    // File type group mapping
    const fileTypeGroups = {
      image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
      video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
      audio: ['.mp3', '.wav', '.aac', '.ogg', '.flac'],
      document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
    };

    // Expand group names to extensions
    let normalizedTypes = [];
    if (fileTypes.length > 0) {
      fileTypes.forEach(type => {
        const lower = type.toLowerCase();
        if (fileTypeGroups[lower]) {
          normalizedTypes.push(...fileTypeGroups[lower]);
        } else {
          normalizedTypes.push(lower.startsWith('.') ? lower : '.' + lower);
        }
      });
    }

    // --------- Recursive ParentId Logic ---------
    let parentIds = [];
    if (parentId) {
      parentIds = [parentId];
      const descendantIds = await getAllDescendantFolderIds(parentId, organizationId);
      parentIds = parentIds.concat(descendantIds);
    }

    // Folders filter (folders tabhi laao jab fileTypes nahi diya ho)
    let folders = [];
    if (!fileTypes.length) {
      const folderFilter = { organizationId, type: 'folder', name: nameRegex };
      if (parentId) folderFilter.parentId = { $in: parentIds };
      else folderFilter.parentId = null;
      if (normalizedPrefix) {
        folderFilter.key = { $regex: `^${normalizedPrefix}`, $options: 'i' };
      }
      const matchedFolders = await Folder.find(folderFilter).limit(maxResults).lean();
      folders = matchedFolders.map(folder => ({
        _id: folder._id,
        name: folder.name,
        key: folder.key,
        type: 'folder',
        createdBy: folder.candidateId,
        createdAt: folder.createdAt
      }));
    }

    // Files filter
    const fileFilter = { organizationId, type: 'file', name: nameRegex };
    if (parentId) fileFilter.parentId = { $in: parentIds };
    else fileFilter.parentId = null;
    if (normalizedPrefix) {
      fileFilter.key = { $regex: `^${normalizedPrefix}`, $options: 'i' };
    }
    if (normalizedTypes.length > 0) {
      fileFilter.extension = { $in: normalizedTypes };
    }
    let files = await Folder.find(fileFilter).limit(1000).lean();

    // Date range filtering
    if (dateRange.from || dateRange.to) {
      files = files.filter(file => {
        const createdAt = new Date(file.createdAt).getTime();
        if (dateRange.from && dateRange.to) {
          return createdAt >= new Date(dateRange.from).getTime() &&
                 createdAt <= new Date(dateRange.to).getTime();
        } else if (dateRange.from) {
          return createdAt >= new Date(dateRange.from).getTime();
        } else {
          return createdAt <= new Date(dateRange.to).getTime();
        }
      });
    }

    // Size range filtering
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

    files = files.map(file => ({
      _id: file._id,
      name: file.name,
      key: file.key,
      url: file.location,
      size: file.size,
      mimeType: file.mimetype,
      extension: file.extension,
      type: 'file',
      uploadedBy: file.candidateId,
      createdAt: file.createdAt,
      path: file.key ? file.key.substring(0, file.key.lastIndexOf('/')) : ''
    }));

    // Sort by relevance if query diya ho
    if (query && query.trim().length > 0) {
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
    }

    files = files.slice(0, maxResults);
    folders = folders.slice(0, maxResults);

    // If fileTypes filter laga hai, folders ko empty kar do
    if (fileTypes.length > 0) {
      folders = [];
    }

    if (files.length === 0 && folders.length === 0) {
      return returnFormatter(false, "No matching files or folders found");
    }

    return returnFormatter(true, "Search completed successfully", {
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
    console.error('Error in unified search:', error);
    return returnFormatter(false, error.message);
  }
}