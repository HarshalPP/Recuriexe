import FileMeta from '../../models/fileShare.model.js/fileShare.model.js';
import Folder from '../../models/fileShare.model.js/folder.model.js';
import mongoose from "mongoose";


import RecentActivity from '../../models/fileShare.model.js/fileHistory.model.js';

import { ListObjectsV2Command, S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { returnFormatter } from '../../formatters/common.formatter.js';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import archiver from 'archiver';
import stream from 'stream';

// DO_SPACES_KEY = "DO00J8YLJ3UV33N4XZ6G"
// DO_SPACES_SECRET ="NL2q0i+0C8RgAJBRX16NwvZ+ibbt0gpID7sA/By/VQ0"
// PATH_BUCKET = "finexe"
// SPACES_ENDPOINT="blr1.digitaloceanspaces.com"   
// SPACES_REGION="blr1"    
 

function getSpacesClient() {
  // const endpoint = process.env.SPACES_ENDPOINT;
    const endpoint = "blr1.digitaloceanspaces.com";

  console.log("Endpoint:", endpoint);
  // const region = process.env.SPACES_REGION;
    const region = "blr1";

  console.log("Region:", region);
  // const accessKeyId = process.env.DO_SPACES_KEY;
    const accessKeyId = "DO00J8YLJ3UV33N4XZ6G";

  console.log("Access Key ID:", accessKeyId);
  // const secretAccessKey = process.env.DO_SPACES_SECRET;
    const secretAccessKey = "NL2q0i+0C8RgAJBRX16NwvZ+ibbt0gpID7sA/By/VQ0";

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

async function trackOpenActivity(items, req) {
  const organizationId = req.employee.organizationId;
  const candidateId = req.employee._id;
  if (!items || !items.length) return;
  const now = new Date();

  // Bulk insert FileHistory
  await RecentActivity.insertMany(
    items.map(i => ({
      fileId: i._id,
      organizationId,
      candidateId,
      action: 'open',
      at: now
    }))
  );
}

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

    await trackOpenActivity(folders, req);
    await trackOpenActivity(filesRaw, req);

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
    const candidateId = req.body.candidateId || null;
    const parentId = req.body.parentId || null;
    if (!organizationId ) {
      return { status: false, message: "organizationId is required" };
    }
    if (!folderPath) {
      return { status: false, message: "Folder path is required" };
    }

    // const bucket = process.env.PATH_BUCKET;
    const bucket = "finexe"; // Use your actual bucket name here
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

    await RecentActivity.create({
  fileId: folderDoc._id,
  organizationId,
  candidateId,
  action: 'createFolder',
  at: new Date()
});

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

// export async function uploadFile(file, destinationPath = '', req) {
//   try {
//     const organizationId = req.employee.organizationId;
//     const candidateId = req.body.candidateId;
//     const parentId = req.body.parentId || null;
//     if (!organizationId ) {
//       return { status: false, message: "organizationId is  required" };
//     }
//     if (!file) {
//       return { status: false, message: "File is required" };
//     }

//     const bucket = process.env.PATH_BUCKET;
//     if (!bucket) {
//       return { status: false, message: "No Bucket Found" };
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

//     // MongoDB me file meta-data save karo
//     const fileDoc = new Folder({
//       organizationId,
//       candidateId,
//       parentId,
//       name: file.originalname,
//       type: 'file',
//       key: result.Key,
//       location: result.Location,
//       size: file.size,
//       mimetype: file.mimetype,
//       extension: extension,
//       openedAt: null
//     });
//     await fileDoc.save();

//    await RecentActivity.create({
//   fileId: fileDoc._id,
//   organizationId,
//   candidateId,
//   action: 'upload',
//   at: new Date()
// });
//     return {
//       status: true,
//       message: "File uploaded successfully",
//       data: {
//         key: result.Key,
//         location: result.Location,
//         etag: result.ETag,
//         size: file.size,
//         mimetype: file.mimetype,
//         originalName: file.originalname
//       }
//     };
//   } catch (error) {
//     return { status: false, message: error.message };
//   }
// }

export async function uploadFile(file, destinationPath = '', req , ) {
  try {
    const organizationId = req.employee?.organizationId;
    const candidateId = req.body.candidateId;
    const parentId = req.body.parentId || null;

    if (!organizationId) {
      return { status: false, message: "organizationId is required" };
    }

    if (!file) {
      return { status: false, message: "File is required" };
    }

    // const bucket = process.env.PATH_BUCKET;
    const bucket = "finexe";
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
        ACL: 'public-read', // <-- Change this if public URL is expected
      },
    });

    const result = await upload.done();
    console.log("Upload result:", result);

    const fileDoc = new Folder({
      organizationId,
      candidateId,
      parentId,
      name: originalName,
      type: 'file',
      key: key,
      location: `https://${process.env.SPACES_ENDPOINT}/${bucket}/${key}`, // or result.Location
      size: file.size,
      mimetype: file.mimetype,
      extension: extension,
      openedAt: null
    });

    await fileDoc.save();

    await RecentActivity.create({
      fileId: fileDoc._id,
      organizationId,
      candidateId,
      action: 'upload',
      at: new Date()
    });

    return {
      status: true,
      message: "File uploaded successfully",
      data: {
        key: result.Key,
        location: fileDoc.location,
        etag: result.ETag,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname
      }
    };

  } catch (error) {
    console.error("Upload error:", error);
    return { status: false, message: error.message };
  }
}

// export async function uploadDirectFile(file, parentId , organizationId ,location ="https://cdn.fincooper.in/STAGE/HRMS/IMAGE/1749308795532_Nikit Resume.pdf") {
//   try {

//     if (!organizationId) {
//       return { status: false, message: "organizationId is required" };
//     }

//     if (!file) {
//       return { status: false, message: "File is required" };
//     }

//     // const 
//     // const bucket = "finexe";
//     // if (!bucket) {
//     //   return { status: false, message: "No Bucket Found" };
//     // }

//     // const client = getSpacesClient();
//     // const originalName = file.originalname;
//     // const extension = path.extname(originalName);
//     // const fileName = path.basename(originalName, extension);
//     // const timestamp = Date.now();

//     // let key = destinationPath;
//     // if (key && !key.endsWith('/')) key += '/';
//     // key += `${fileName}_${timestamp}${extension}`;

//     // const upload = new Upload({
//     //   client,
//     //   params: {
//     //     Bucket: bucket,
//     //     Key: key,
//     //     Body: file.buffer,
//     //     ContentType: file.mimetype,
//     //     ACL: 'public-read', // <-- Change this if public URL is expected
//     //   },
//     // });

//     // const result = await upload.done();
//     // console.log("Upload result:", result);

//     const fileDoc = new Folder({
//       organizationId,
//       parentId,
//       name: originalName,
//       type: 'file',
//       key: key,
//       location: location, // or result.Location
//       size: file.size,
//       mimetype: file.mimetype,
//       extension: extension,
//       openedAt: null
//     });

//     await fileDoc.save();

//     await RecentActivity.create({
//       fileId: fileDoc._id,
//       organizationId,
//       candidateId,
//       action: 'upload',
//       at: new Date()
//     });

//     return {
//       status: true,
//       message: "File uploaded successfully",
//       data: {
//         key: result.Key,
//         location: fileDoc.location,
//         etag: result.ETag,
//         size: file.size,
//         mimetype: file.mimetype,
//         originalName: file.originalname
//       }
//     };

//   } catch (error) {
//     console.error("Upload error:", error);
//     return { status: false, message: error.message };
//   }
// }


import axios from 'axios';
import mime from 'mime-types'; // npm install mime-types

export async function saveFileFromUrl({ fileUrl, parentId, organizationId, candidateId = null }) {
  try {
    if (!fileUrl || !organizationId || !parentId) {
      return { status: false, message: "fileUrl, organizationId, and parentId are required" };
    }

    // Get file metadata and buffer
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    const parsedUrl = new URL(fileUrl);
    const originalName = decodeURIComponent(path.basename(parsedUrl.pathname));
    const extension = path.extname(originalName);
    const mimetype = mime.lookup(extension) || 'application/octet-stream';
    const size = buffer.length;

    const key = parsedUrl.pathname.replace(/^\/+/, ''); // remove starting slash if any

    const fileDoc = new Folder({
      organizationId,
      candidateId,
      parentId,
      name: originalName,
      type: 'file',
      key: key,
      location: fileUrl,
      size: size,
      mimetype: mimetype,
      extension: extension,
      openedAt: null
    });

    await fileDoc.save();

    await RecentActivity.create({
      fileId: fileDoc._id,
      organizationId,
      candidateId,
      action: 'upload',
      at: new Date()
    });

    return {
      status: true,
      message: "File saved from URL successfully",
      data: {
        key,
        location: fileUrl,
        size,
        mimetype,
        originalName
      }
    };
  } catch (error) {
    console.error("saveFileFromUrl error:", error);
    return { status: false, message: error.message || "Failed to save file from URL" };
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


// export async function advancedSearch(options, req) {
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

//     // --------- Recursive ParentId Logic ---------
//     let parentIds = [];
//     if (parentId) {
//       parentIds = [parentId];
//       const descendantIds = await getAllDescendantFolderIds(parentId, organizationId);
//       parentIds = parentIds.concat(descendantIds);
//     }

//     // Folders filter (folders tabhi laao jab fileTypes nahi diya ho)
//     let folders = [];
//     if (!fileTypes.length) {
//       const folderFilter = { organizationId, type: 'folder', name: nameRegex };
//       if (parentId) folderFilter.parentId = { $in: parentIds };
//       else folderFilter.parentId = null;
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
//     const fileFilter = { organizationId, type: 'file', name: nameRegex };
//     if (parentId) fileFilter.parentId = { $in: parentIds };
//     else fileFilter.parentId = null;
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
      // Agar parentId nahi diya, to parentId filter mat lagao (poore org me search ho)
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
    // Agar parentId nahi diya, to parentId filter mat lagao (poore org me search ho)
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

export async function getRecentActivities(req, page = 1, limit = 10) {
  try {
    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId is required");
    }

    const skip = (page - 1) * limit;

    const activities = await RecentActivity.find({ organizationId })
      .sort({ at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await RecentActivity.countDocuments({ organizationId });

    const fileIds = [...new Set(activities.map(a => a.fileId?.toString()))];
    const files = await Folder.find({ _id: { $in: fileIds } }).lean();

    const recent = activities.map(act => ({
      ...act,
      file: files.find(f => f._id.toString() === act.fileId?.toString())
    }));

    return returnFormatter(true, "Recent activities", {
      items: recent,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    return returnFormatter(false, error.message);
  }
}


export async function getMostActiveFiles(req, page = 1, limit = 10) {
  try {
    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId is required");
    }

    const skip = (page - 1) * limit;

    const agg = await rece.aggregate([
      { $match: { organizationId } },
      { $group: { _id: "$fileId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalAgg = await rece.aggregate([
      { $match: { organizationId } },
      { $group: { _id: "$fileId" } },
      { $count: "total" }
    ]);
    const total = totalAgg[0]?.total || 0;

    const fileIds = agg.map(a => a._id);
    const files = await Folder.find({ _id: { $in: fileIds } }).lean();

    const mostActive = agg.map(a => ({
      count: a.count,
      file: files.find(f => f._id.toString() === a._id.toString())
    }));

    return returnFormatter(true, "Most active files/folders", {
      items: mostActive,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in getMostActiveFiles:', error);
    return returnFormatter(false, error.message);
  }
}



export async function getFolderDataUsage1(req) {
  try {
    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId is required");
    }

    // 1. Organization ka total data size (sirf files ka sum)
    const orgTotalAgg = await Folder.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), type: 'file', status: 'active' } },
      { $group: { _id: null, totalSize: { $sum: "$size" } } }
    ]);
    const orgTotalSize = orgTotalAgg[0]?.totalSize || 0;

    // 2. Har folder ke andar ka total data size (direct files + subfolders ke files recursively)
    // Sab folders fetch karo
    const allFolders = await Folder.find({ organizationId, type: 'folder', status: 'active' }).lean();

    // Helper: Recursively get all descendant folder IDs
    async function getAllDescendantFolderIds(folderId) {
      let ids = [folderId];
      const children = allFolders.filter(f => f.parentId && f.parentId.toString() === folderId.toString());
      for (const child of children) {
        ids = ids.concat(await getAllDescendantFolderIds(child._id));
      }
      return ids;
    }

    // For each folder, calculate total size (including all subfolders)
    const folderData = [];
    for (const folder of allFolders) {
      const descendantIds = await getAllDescendantFolderIds(folder._id);
      const files = await Folder.find({
        organizationId,
        type: 'file',
        status: 'active',
        parentId: { $in: descendantIds }
      }).lean();
      const folderSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
      folderData.push({
        folderId: folder._id,
        folderName: folder.name,
        folderPath: folder.key,
        size: folderSize,
        // sizeMB: (folderSize / (1024 * 1024)).toFixed(2),
        sizeGB: (folderSize / (1024 * 1024 * 1024)).toFixed(2), // <-- GB me

        percent: orgTotalSize ? ((folderSize / orgTotalSize) * 100).toFixed(2) : "0.00"
      });
    }

    // Sort by size descending
    folderData.sort((a, b) => b.size - a.size);

    return returnFormatter(true, "Folder-wise data usage", {
      organizationTotalSize: orgTotalSize,
      // organizationTotalSizeMB: (orgTotalSize / (1024 * 1024)).toFixed(2),
       organizationTotalSizeGB: (orgTotalSize / (1024 * 1024 * 1024)).toFixed(2), // <-- GB me

      folders: folderData
    });
  } catch (error) {
    console.error('Error in getFolderDataUsage:', error);
    return returnFormatter(false, error.message);
  }
}

// export async function getFolderDataUsage(req) {
//   try {
//     const organizationId = req.employee.organizationId;
//     if (!organizationId) {
//       return returnFormatter(false, "OrganizationId is required");
//     }

//     // 1. Organization ka total data size (sirf files ka sum)
//     const orgTotalAgg = await Folder.aggregate([
//       { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), type: 'file', status: 'active' } },
//       { $group: { _id: null, totalSize: { $sum: "$size" } } }
//     ]);
//     const orgTotalSize = orgTotalAgg[0]?.totalSize || 0;

//     // 2. Sirf root folders lao (parentId: null)
//     const rootFolders = await Folder.find({ organizationId, type: 'folder', status: 'active', parentId: null }).lean();

//     // 3. Sare folders ek hi baar lao (for recursion)
//     const allFolders = await Folder.find({ organizationId, type: 'folder', status: 'active' }).lean();

//     // Helper: Recursively get all descendant folder IDs
//     function getAllDescendantFolderIds(folderId) {
//       let ids = [folderId];
//       const children = allFolders.filter(f => f.parentId && f.parentId.toString() === folderId.toString());
//       for (const child of children) {
//         ids = ids.concat(getAllDescendantFolderIds(child._id));
//       }
//       return ids;
//     }

//     // For each root folder, calculate total size and file count (including all subfolders)
//     const folderData = [];
//     for (const folder of rootFolders) {
//       const descendantIds = getAllDescendantFolderIds(folder._id);
//       // Get all files in this folder and its subfolders
//       const files = await Folder.find({
//         organizationId,
//         type: 'file',
//         status: 'active',
//         parentId: { $in: descendantIds }
//       }).lean();
//       const folderSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
//       folderData.push({
//         folderId: folder._id,
//         folderName: folder.name,
//         folderPath: folder.key,
//         filesCount: files.length,
//         size: folderSize,
//         sizeGB: (folderSize / (1024 * 1024 * 1024)).toFixed(2),
//         percent: orgTotalSize ? ((folderSize / orgTotalSize) * 100).toFixed(2) : "0.00"
//       });
//     }

//     // Sort by size descending
//     folderData.sort((a, b) => b.size - a.size);

//     return returnFormatter(true, "Folder-wise data usage", {
//       organizationTotalSize: orgTotalSize,
//       organizationTotalSizeGB: (orgTotalSize / (1024 * 1024 * 1024)).toFixed(2),
//       folders: folderData
//     });
//   } catch (error) {
//     console.error('Error in getFolderDataUsage:', error);
//     return returnFormatter(false, error.message);
//   }
// }

// src/v1/api/helper/storage.helper.js  (या जहाँ रखना चाहें)


//— डैशबोर्ड में दिखने वाली कैटेगरी‑मैपिंग
const CATEGORY_MAP = {
  images: {
    label: 'Images',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
  },
  sheets: {
    label: 'Excel Sheet',
    extensions: ['.xls', '.xlsx', '.csv', '.ods'],
  },
  documents: {
    label: 'Document',
    extensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'],
  },
  videos: {
    label: 'Videos',
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
  },
  audios: {
    label: 'Audios',
    extensions: ['.mp3', '.wav', '.aac', '.ogg', '.flac'],
  },
};

export async function getFolderDataUsage(req) {
  try {
    /* ------------------------------------------------------------------ */
    /* 0. बेसिक validations                                              */
    /* ------------------------------------------------------------------ */
    const organizationId = req.employee?.organizationId;
    if (!organizationId) {
      return returnFormatter(false, 'OrganizationId is required');
    }

    /* ------------------------------------------------------------------ */
    /* 1.  Organisation के सभी active files एक ही बार खींच लो            */
    /* ------------------------------------------------------------------ */
    const activeFiles = await Folder.find({
      organizationId,
      type: 'file',
      status: 'active',
    }).lean();

    const orgTotalSize = activeFiles.reduce(
      (acc, f) => acc + (f.size || 0),
      0,
    );

    /* ------------------------------------------------------------------ */
    /* 2.  📊 कैटेगरी‑वाइज usage (Images, Sheets, Documents…)             */
    /* ------------------------------------------------------------------ */
    const categoryUsage = Object.keys(CATEGORY_MAP).reduce((acc, key) => {
      acc[key] = { ...CATEGORY_MAP[key], count: 0, size: 0 };
      return acc;
    }, { others: { label: 'Others', extensions: [], count: 0, size: 0 } });

    for (const file of activeFiles) {
      const ext = (file.extension || '').toLowerCase();
      let found = false;
      for (const key of Object.keys(CATEGORY_MAP)) {
        if (CATEGORY_MAP[key].extensions.includes(ext)) {
          categoryUsage[key].count += 1;
          categoryUsage[key].size += file.size || 0;
          found = true;
          break;
        }
      }
      if (!found) {
        categoryUsage.others.count += 1;
        categoryUsage.others.size += file.size || 0;
      }
    }

    // % calculation and GB conversion
    const categoryUsageArr = Object.values(categoryUsage)
      .map((c) => ({
        label: c.label,
        count: c.count,
        size: c.size,
        sizeGB: (c.size / (1024 ** 3)).toFixed(2),
        percent: orgTotalSize
          ? ((c.size / orgTotalSize) * 100).toFixed(2)
          : '0.00',
      }))
      .sort((a, b) => b.size - a.size); // biggest first

    /* ------------------------------------------------------------------ */
    /* 3.  🌳 Root‑folder structure & recursive size                       */
    /* ------------------------------------------------------------------ */
    // सभी active folders एक बार ले आयें (recursive traversal के लिये)
    const allFolders = await Folder.find({
      organizationId,
      type: 'folder',
      status: 'active',
    }).lean();

    // root folders (parentId == null)
    const rootFolders = allFolders.filter((f) => f.parentId === null);

    // helper → DFS to collect descendant ids
    const childrenMap = new Map(); // parentId → [childFolders]
    for (const f of allFolders) {
      if (f.parentId) {
        const p = f.parentId.toString();
        if (!childrenMap.has(p)) childrenMap.set(p, []);
        childrenMap.get(p).push(f);
      }
    }

    function gatherDescendants(id) {
      const ids = [id];
      const kids = childrenMap.get(id.toString()) || [];
      for (const k of kids) ids.push(...gatherDescendants(k._id));
      return ids;
    }

    const folderData = [];

    for (const root of rootFolders) {
      const descendantIds = gatherDescendants(root._id);

      // सभी files जिनका parentId इन ids में है
      const sizeAndCount = activeFiles.reduce(
        (obj, f) => {
          if (
            f.parentId &&
            descendantIds.includes(f.parentId.toString())
          ) {
            obj.count += 1;
            obj.size += f.size || 0;
          }
          return obj;
        },
        { count: 0, size: 0 },
      );

      folderData.push({
        folderId: root._id,
        folderName: root.name,
        folderPath: root.key,
        filesCount: sizeAndCount.count,
        size: sizeAndCount.size,
        sizeGB: (sizeAndCount.size / (1024 ** 3)).toFixed(2),
        percent: orgTotalSize
          ? ((sizeAndCount.size / orgTotalSize) * 100).toFixed(2)
          : '0.00',
      });
    }

    // सबसे बड़ा folder सबसे आगे
    folderData.sort((a, b) => b.size - a.size);

    /* ------------------------------------------------------------------ */
    /* 4.  📤 Response                                                     */
    /* ------------------------------------------------------------------ */
    const ORG_QUOTA_GB = 30; // UI गेज के लिये (env में रखना चाहें तो कर लीजिये)

    return returnFormatter(true, 'Dashboard data usage', {
      organization: {
        usedBytes: orgTotalSize,
        usedGB: (orgTotalSize / (1024 ** 3)).toFixed(2),
        quotaGB: ORG_QUOTA_GB,
        percentUsed: (
          (orgTotalSize / (ORG_QUOTA_GB * 1024 ** 3)) *
          100
        ).toFixed(2),
      },
      categories: categoryUsageArr, // gauge + left‑pane cards
      // folders: folderData, // main grid/list – already size‑desc sorted
    });
  } catch (err) {
    console.error('getFolderDataUsage error →', err);
    return returnFormatter(false, err.message);
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



