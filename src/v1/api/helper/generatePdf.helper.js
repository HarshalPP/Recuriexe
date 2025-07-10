import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import templateModel from "../models/templateModel/template.model.js";
import { returnFormatter } from "../formatters/common.formatter.js";
import mongoose from "mongoose";
import partnerRequestModel from "../models/partnerRequestModel/partnerRequest.model.js";
import uploadToSpaces from "../services/commandServices/uploadToSpace.service.js";
import companyModel from "../models/companyModel/company.model.js";
import initModel from "../models/initModel/init.model.js";



// export async function generatePdfFunc(req) {
//   try {
//     // Get template from database
//     const template = await templateModel.findById(req.body.tempId);

//     if (!template) {
//       return returnFormatter(false, "Template not found");
//     }

//     let job = await jobProductModel.findById(req.body.jobProductId).populate({ 
//       path: "employeeId", 
//       model: "employee", 
//       options: { strictPopulate: false } 
//     });

//     if (!job) {
//       return returnFormatter(false, "No Product found");
//     }

//     const myJob = await jobModel.aggregate([
//       {
//         $lookup: {
//           from: "users",
//           localField: "creatorId",
//           foreignField: "_id",
//           as: "creatorId",
//         },
//       },
//       { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "partnerId",
//           foreignField: "_id",
//           as: "partnerId",
//         },
//       },
//       { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
//           {
//         $lookup: {
//           from: "companies",
//           localField: "creatorId._id",
//           foreignField: "serviceId",
//           as: "creatorCompany",
//         },
//       },
//       { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "jobproducts",
//           localField: "_id",
//           foreignField: "jobId",
//           as: "jobproduct",
//         },
//       },
//       { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
//       {
//         $match: {
//           "jobproduct._id": new mongoose.Types.ObjectId(req.body.jobProductId),
//         }
//       },
//       {
//         $lookup: {
//           from: "userproducts",
//           localField: "jobproduct.userProductId",
//           foreignField: "_id",
//           as: "userProducts",
//         },
//       },
//       { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
//       // {
//       //   $lookup: {
//       //     from: "products",
//       //     localField: "userProducts.productId",
//       //     foreignField: "_id",
//       //     as: "productId",
//       //   },
//       // },
//       {
//         $lookup: {
//           from: "employees",
//           localField: "jobproduct.employeeId",
//           foreignField: "_id",
//           as: "employee",
//         },
//       },
//       { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
//       { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
//     ]);

//     // Check if myJob has any results
//     if (!myJob || myJob.length === 0) {
//       return returnFormatter(false, "No jobs found");
//     }

//     let requestDataArray = await Promise.all(
//       myJob.map(async (data) => {
//         return await partnerRequestModel.aggregate([
//           {
//             $match: {
//               $or: [
//                 { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
//                 { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
//               ] 
//             }
//           },
//           {
//             $lookup: {
//               from: "users",
//               localField: "receiverId",
//               foreignField: "_id",
//               as: "partner"
//             }
//           },
//           { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
//           {
//             $lookup: {
//               from: "companies",
//               localField: "partner._id",
//               foreignField: "serviceId",
//               as: "company"
//             }
//           },
//           { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
//           {
//             $unwind: {
//               path: "$productForm",
//               preserveNullAndEmptyArrays: true
//             }
//           },
//           {
//             $lookup: {
//               from: "forms",
//               let: {
//                 allFields: {
//                   $setUnion: [
//                     "$productForm.initFields.fields",
//                     "$productForm.allocationFields.fields",
//                     "$productForm.agentFields.fields",
//                     "$productForm.submitFields.fields"
//                   ]
//                 }
//               },
//               pipeline: [
//                 {
//                   $match: {
//                     $expr: { $in: ["$_id", "$$allFields"] }
//                   }
//                 },
//                 {
//                   $project: {
//                     _id: 1,
//                     fieldName: 1,
//                     dataType: 1
//                   }
//                 }
//               ],
//               as: "formFields"
//             }
//           },
//           {
//             $addFields: {
//               ...["initFields", "allocationFields", "agentFields", "submitFields"].reduce((acc, fieldType) => {
//                 acc[`productForm.${fieldType}.fields`] = {
//                   $map: {
//                     input: `$productForm.${fieldType}.fields`,
//                     as: "fieldId",
//                     in: {
//                       $let: {
//                         vars: {
//                           fieldObj: {
//                             $arrayElemAt: [
//                               {
//                                 $filter: {
//                                   input: "$formFields",
//                                   as: "form",
//                                   cond: { $eq: ["$$form._id", "$$fieldId"] }
//                                 }
//                               },
//                               0
//                             ]
//                           }
//                         },
//                         in: {
//                           fieldName: "$$fieldObj.fieldName",
//                           dataType: "$$fieldObj.dataType"
//                         }
//                       }
//                     }
//                   }
//                 };
//                 return acc;
//               }, {})
//             }
//           },
//           {
//             $group: {
//               _id: "$_id",
//               doc: { $first: "$$ROOT" },
//               productForms: { $push: "$productForm" }
//             }
//           },
//           {
//             $addFields: {
//               "doc.productForm": "$productForms"
//             }
//           },
//           {
//             $replaceRoot: {
//               newRoot: "$doc"
//             }
//           }
//         ]);
//       })
//     );

//     let requestDataMap = new Map();

//     requestDataArray.forEach(requestData => {
//       if (requestData && requestData.length > 0 && requestData[0].productForm && Array.isArray(requestData[0].productForm)) {
//         requestData[0].productForm.forEach(item => {
//           if (item?.userProductId) {
//             const idString = item.userProductId.toString();
//             requestDataMap.set(idString, item);
//           }
//         });
//       }
//     });

//     let mergedJobData = myJob.map(job => {
//       if (job.jobproduct?.userProductId) {
//         const userProductIdString = job.jobproduct.userProductId.toString();
//         let matchedData = requestDataMap.get(userProductIdString);

//         if (matchedData) {
//           return {
//             ...job,
//             matchedProductForm: matchedData
//           };
//         }
//       }
//       return job;
//     });

//     // Check if we have valid data after merging
//     if (mergedJobData.length === 0 || !mergedJobData[0].matchedProductForm) {
//       return returnFormatter(false, "Could not match product form data");
//     }



//     // Initialize the placeholders object
//     const placeholders = {};

//     // Process fields from all categories 
//     const fieldCategories = [
//       { fields: mergedJobData[0].matchedProductForm.initFields?.fields || [], valueSource: mergedJobData[0].jobproduct.initValues || [] },
//       { fields: mergedJobData[0].matchedProductForm.allocationFields?.fields || [], valueSource: mergedJobData[0].jobproduct.allocationValues || [] },
//       { fields: mergedJobData[0].matchedProductForm.agentFields?.fields || [], valueSource: mergedJobData[0].jobproduct.agentValues || [] },
//       { fields: mergedJobData[0].matchedProductForm.submitFields?.fields || [], valueSource: mergedJobData[0].jobproduct.submitValues || [] }
//     ];

//     // Process each category
//     fieldCategories.forEach(category => {
//       if (Array.isArray(category.fields)) {
//         category.fields.forEach((field, index) => {
//           if (field?.fieldName) {
//             // Create placeholder key with curly braces
//             const placeholderKey = `{${field.fieldName}}`;

//             // Get value by array index, or use N/A if not available
//             let placeholderValue = "N/A";

//             if (Array.isArray(category.valueSource) && index < category.valueSource.length) {
//               placeholderValue = category.valueSource[index];
//             }

//             // Handle dynamic values mapping if present
//             if (field.valuesMap && placeholderValue !== "N/A") {
//               // If the field has a values map and we have a value, look up the display value
//               const mappedValue = field.valuesMap[placeholderValue];
//               if (mappedValue !== undefined) {
//                 placeholderValue = mappedValue;
//               }
//             }

//             // Add to placeholders object
//             placeholders[placeholderKey] = placeholderValue;
//           }
//         });
//       }
//     });




//  let companyData = await companyModel.findOne({serviceId:mergedJobData[0].creatorId._id});

//     // Replace all placeholders dynamically
//     let html = template.htmlContent;

//     for (const [placeholder, value] of Object.entries(placeholders)) {
//       let processedValue = value;



//       // If value is string with multiple lines, add <br/> at end of each line
//       if (typeof value === 'string' && value.includes('\n')) {
//         processedValue = value.split('\n').map(line => line.trim()).filter(Boolean).join('<br/>');
//       }

//       html = html.replace(
//         new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
//         processedValue || ''
//       );
//     }


//     // Format allocated date
//     const rawDate = new Date(mergedJobData[0].jobproduct.allocatedDate);
//     const day = String(rawDate.getDate()).padStart(2, '0');
//     const month = String(rawDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
//     const year = rawDate.getFullYear();
//     const formattedDate = `${day}/${month}/${year}`;

//     // Format completed date
//     const rawDate1 = new Date(mergedJobData[0].jobproduct.completedDate);
//     const day1 = String(rawDate1.getDate()).padStart(2, '0');
//     const month1 = String(rawDate1.getMonth() + 1).padStart(2, '0');
//     const year1 = rawDate1.getFullYear();
//     const formattedDate1 = `${day1}/${month1}/${year1}`;

//     // Replace additional placeholders
//     html = html.replace(new RegExp('{Submitted By}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), mergedJobData[0].employee?.basicDetails.fullName || '');
//     html = html.replace(new RegExp('{Report Status}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), mergedJobData[0]?.jobStatus || 'Positive');
//     html = html.replace(new RegExp('{Recieved Date}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), formattedDate || '');
//     html = html.replace(new RegExp('{Completed Date}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), formattedDate1 || '');
//     html = html.replace(new RegExp('{Completed Date}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), formattedDate1 || '');
//     html = html.replace(new RegExp('{Company Name}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), companyData?.companyName || '');
//     html = html.replace(new RegExp('{Company Address}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), companyData?.address || '');
//     html = html.replace(new RegExp('{Company Email}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), companyData?.email || '');
//     html = html.replace(new RegExp('{Company Contact No}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), companyData?.phone || '');
//     html = html.replace(new RegExp('{Company CIN}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), companyData?.phone || 'ABCD1234');
//     html = html.replace(new RegExp('{sign}'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), mergedJobData[0]?.creatorCompany?.sign || 'ABCD1234');

//     // Launch Puppeteer
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     // Ensure directory exists
//     const pdfDir = path.join(process.cwd(), "pdf");
//     if (!fs.existsSync(pdfDir)) {
//       fs.mkdirSync(pdfDir, { recursive: true });
//     }

//     // Define PDF Path with unique name to avoid conflicts
//     const fileName = `${Date.now()}.pdf`;
//     const pdfPath = path.join(pdfDir, fileName);

//     // Generate PDF
//     await page.pdf({
//       path: pdfPath,
//       format: "A4",
//       printBackground: true,
//       margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
//     });

//     await browser.close();

//     // Now upload the generated PDF file
//     const userId = req.user.serviceId;
//     const contentType = 'application/pdf';
//     const fileContent = fs.readFileSync(pdfPath);

//     // Construct the user-specific folder path
//     const userFolderPath = `${process.env.PATH_BUCKET}/vendor_management/${userId}`;
//     const filePathInBucket = `${userFolderPath}/documents/${fileName}`;

//     // Check if user folder exists in Spaces
//     const bucketName = 'vendor';

//     // Upload the file
//     const uploadResult = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType, {
//       'Content-Disposition': 'inline',
//       'Content-Type': contentType
//     });

//     // Clean up the local PDF file
//     fs.unlinkSync(pdfPath);

//     // Save the URL to the job product (fixed the URL - removed extra closing brace)
//     await jobProductModel.findByIdAndUpdate(req.body.jobProductId, 
//       { report: `https://tech-cdn.fincooper.in/${filePathInBucket}` }
//     );

//     // Return success response with file URL
//     return returnFormatter(true, "PDF generated and uploaded successfully!", 
//       { fileUrl: `https://tech-cdn.fincooper.in/${filePathInBucket}` }
//     );

//   } catch (error) {
//     console.error("PDF generation error:", error);
//     return returnFormatter(false, error.message);
//   }
// }


//--------------------------------------------- accordong to sir ------------------------------------------------


import htmlDocx from "html-docx-js"; // Make sure you have this package installed


// export async function generatePdfFunc(req, res) {
//   try {
//     // 1️⃣ Fetch template
//     let activePlan = await getactiveplan(req);

//     let generatedCount = await initModel.countDocuments({
//       serviceId: req.user.serviceId,
//       reportStatus: "generated",
//       reportDate: {
//         $gte: activePlan?.data?.purchaseDate,
//         $lte: activePlan?.data?.expiryDate,
//       },
//     });

//     if(generatedCount>=activePlan?.data?.planId?.reportsPerMonth){
//       return returnFormatter(false,"Report generation limit reached for this plan")
//     }

//     const template = await templateModel.findById(req.body.tempId);
//     if (!template) {
//       return returnFormatter(false, "Template not found");
//     }

//     // 2️⃣ Fetch init data
//     const initData = await initModel.find({ _id: req.body.initId })
//       .populate({ path: "partnerId", model: "user", options: { strictPopulate: false } })
//       .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
//       .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
//       .populate({ path: "referServiceId", model: "service", options: { strictPopulate: false } })
//       .populate({ path: "reportType", model: "userProduct", options: { strictPopulate: false } })
//       .sort({ createdAt: -1 });

//     if (!initData.length) {
//       return returnFormatter(true, "No init data found", []);
//     }

//     const jobInit = initData[0];
//     const partnerId = jobInit.partnerId?._id || jobInit.partnerId;
//     const serviceId = new mongoose.Types.ObjectId(req.user.serviceId);

//     // 3️⃣ Fetch partner request data
//     const requestData = await partnerRequestModel.aggregate([
//       {
//         $match: {
//           $or: [
//             { senderId: partnerId, receiverId: serviceId },
//             { senderId: serviceId, receiverId: partnerId }
//           ]
//         }
//       }
//     ]).sort({ createdAt: -1 });

//     // 4️⃣ Fetch company data
//     const companyData = await companyModel.findOne({ serviceId: serviceId });

//     // 5️⃣ Merge all relevant data
//     const mergedJobData = {
//       ...jobInit.toObject(),
//       company: companyData,
//       requestData: requestData[0] || null
//     };

//     // 6️⃣ Build placeholders
//     const placeholders = {};
//     const fieldCategories = [
//       { fields: jobInit.initFields || [] },
//       { fields: jobInit.allocationFields || [] },
//       { fields: jobInit.agentFields || [] },
//       { fields: jobInit.submitFields || [] }
//     ];

//     fieldCategories.forEach(category => {
//       category.fields.forEach(field => {
//         if (field?.fieldName) {
//           const placeholderKey = `{${field.fieldName}}`;
//           const placeholderValue = field.value !== undefined && field.value !== null ? field.value : "N/A";
//           placeholders[placeholderKey] = placeholderValue;
//         }
//       });
//     });

//     // 7️⃣ Replace placeholders in template
//     let html = template.htmlContent;
//     for (const [placeholder, value] of Object.entries(placeholders)) {

//       let processedValue = value;
//       if (typeof value === "string" && value.includes("\n")) {
//         processedValue = value.split("\n").map(line => line.trim()).filter(Boolean).join("<br/>");
//       }
//       html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), processedValue);
//     }

//     // 8️⃣ Format allocated and completed dates
//     const formatDate = (date) => {
//       if (!date) return '';
//       const d = new Date(date);
//       const day = String(d.getDate()).padStart(2, '0');
//       const month = String(d.getMonth() + 1).padStart(2, '0');
//       const year = d.getFullYear();
//       return `${day}/${month}/${year}`;
//     };

//     const formattedAllocatedDate = formatDate(jobInit.allocatedDate);
//     const formattedCompletedDate = formatDate(jobInit.completedDate);

//     // 9️⃣ Replace additional placeholders
//     html = html.replace(/{allocatedOfficeEmp}/g, jobInit?.allocatedOfficeEmp?.basicDetails?.fullName || '');
//     html = html.replace(/{doneBy}/g, jobInit?.doneBy?.basicDetails?.fullName || '');
//     html = html.replace(/{serviceName}/g, jobInit?.referServiceId?.serviceName || '');
//     html = html.replace(/{reportType}/g, jobInit?.reportType?.productName || '');
//     html = html.replace(/{partnerName}/g, jobInit?.partnerId?.fullName || '');
//     html = html.replace(/{allocatedDate}/g, formattedAllocatedDate || '');
//     html = html.replace(/{completedDate}/g, formattedCompletedDate || '');
//             html = html.replace(/{charge}/g, jobInit?.charge || '');

//     // 🔟 Generate PDF using Puppeteer
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdfDir = path.join(process.cwd(), "pdf");
//     if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

//     const fileName = `${Date.now()}.pdf`;
//     const pdfPath = path.join(pdfDir, fileName);

//     await page.pdf({
//       path: pdfPath,
//       format: "A4",
//       printBackground: true,
//       margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
//     });

//     await browser.close();

//     // 1️⃣1️⃣ Generate Word docx from HTML
//     const wordFileName = `${Date.now()}.docx`;
//     const wordPath = path.join(pdfDir, wordFileName);

//     const docxBlob = htmlDocx.asBlob(html);
//     const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
//     fs.writeFileSync(wordPath, docxBuffer);

//     // 1️⃣2️⃣ Upload PDF to Spaces
//     const userId = req.user.serviceId;
//     const pdfContent = fs.readFileSync(pdfPath);
//     const pdfFilePathInBucket = `vendor_management/${userId}/documents/${fileName}`;
//     await uploadToSpaces('vendor', pdfFilePathInBucket, pdfContent, 'public-read', 'application/pdf', {
//       'Content-Disposition': 'inline',
//       'Content-Type': 'application/pdf'
//     });

//     // 1️⃣3️⃣ Upload Word file to Spaces
//     const wordContent = fs.readFileSync(wordPath);
//     const wordFilePathInBucket = `vendor_management/${userId}/documents/${wordFileName}`;
//     await uploadToSpaces('vendor', wordFilePathInBucket, wordContent, 'public-read', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', {
//       'Content-Disposition': 'inline',
//       'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     });
//     let existingInit = await initModel.findById(req.body.initId)
//     // 1️⃣4️⃣ Clean up local files
//     fs.unlinkSync(pdfPath);
//     fs.unlinkSync(wordPath);
//     const diffInMs = new Date() - existingInit.createdAt;
//     const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
//     // 1️⃣5️⃣ Update report URL in initModel
//     await initModel.findByIdAndUpdate(req.body.initId, {
//       workStatus: "reportgenerated",
//       reportStatus: "generated",
//       reportDate: new Date(),
//       reportTAT: diffInDays,
//       $push: {
//         reportUrl: `https://tech-cdn.fincooper.in/${pdfFilePathInBucket}`,
//         wordUrl: `https://tech-cdn.fincooper.in/${wordFilePathInBucket}`
//       }
//     });

//     // 1️⃣6️⃣ Return URLs for both PDF and Word
//     return returnFormatter(true, "PDF and Word files generated and uploaded successfully!", {
//       pdfUrl: `https://tech-cdn.fincooper.in/${pdfFilePathInBucket}`,
//       wordUrl: `https://tech-cdn.fincooper.in/${wordFilePathInBucket}`
//     });

//   } catch (error) {
//     console.error("PDF/Word generation error:", error);
//     return returnFormatter(false, error.message);
//   }
// }


export async function generatePdfFunc(req, res) {
  try {
    // 1️⃣ Fetch template


    const template = await templateModel.findById(req.body.tempId);
    if (!template) {
      return returnFormatter(false, "Template not found");
    }

    // 2️⃣ Fetch init data
    const initData = await initModel.find({ _id: req.body.initId })
      .populate({ path: "partnerId", model: "Organization", options: { strictPopulate: false } })
      .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
      .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
      .populate({ path: "referServiceId", model: "service", options: { strictPopulate: false } })
      .populate({ path: "reportType", model: "userProduct", options: { strictPopulate: false } })
      .sort({ createdAt: -1 });

    if (!initData.length) {
      return returnFormatter(true, "No init data found", []);
    }

    const jobInit = initData[0];
    const partnerId = jobInit.partnerId?._id || jobInit.partnerId;
    const serviceId = new mongoose.Types.ObjectId(req.employee.organizationId);

    // 3️⃣ Fetch partner request data
    const requestData = await partnerRequestModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: partnerId, receiverId: serviceId },
            { senderId: serviceId, receiverId: partnerId }
          ]
        }
      }
    ]).sort({ createdAt: -1 });

    // 4️⃣ Fetch company data
    const companyData = await companyModel.findOne({ organizationId: serviceId });

    // 5️⃣ Merge all relevant data
    const mergedJobData = {
      ...jobInit.toObject(),
      company: companyData,
      requestData: requestData[0] || null
    };

    // 6️⃣ Build placeholders
    const placeholders = {};
    const fieldCategories = [
      { fields: jobInit.initFields || [] },
      { fields: jobInit.allocationFields || [] },
      { fields: jobInit.agentFields || [] },
      { fields: jobInit.submitFields || [] }
    ];

    fieldCategories.forEach(category => {
      category.fields.forEach(field => {
        if (field?.fieldName) {
          const placeholderKey = `{${field.fieldName}}`;
          const placeholderValue = field.value !== undefined && field.value !== null ? field.value : "N/A";
          placeholders[placeholderKey] = placeholderValue;
        }
      });
    });

    // 7️⃣ Replace placeholders in template with value or image if it's an image URL
    let html = template.htmlContent;

    const isImageUrl = (url) => {
      return typeof url === 'string' && /\.(jpeg|jpg|png|gif|bmp|webp|svg)$/i.test(url);
    };

    for (const [placeholder, value] of Object.entries(placeholders)) {
      let processedValue = value;

      // Handle multiline text
      if (typeof value === "string" && value.includes("\n")) {
        processedValue = value.split("\n").map(line => line.trim()).filter(Boolean).join("<br/>");
      }
// Detect and convert image URLs or arrays of image URLs into <img> tags
if (Array.isArray(value)) {
  processedValue = value.map(val => {
    if (isImageUrl(val)) {
      return `<img src="${val}" style="width:100px;height:auto;max-height:100px;object-fit:contain;margin:2px;" alt="Image" />`;
    }
    return val;
  }).join("<br/>");
} else if (isImageUrl(value)) {
  processedValue = `<img src="${value}" style="width:100px;height:auto;max-height:100px;object-fit:contain;" alt="Image" />`;
}


      html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), processedValue);
    }

    // 8️⃣ Format allocated and completed dates
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formattedAllocatedDate = formatDate(jobInit.allocatedDate);
    const formattedCompletedDate = formatDate(jobInit.completedDate);

    // 9️⃣ Replace additional placeholders
    html = html.replace(/{allocatedOfficeEmp}/g, jobInit?.allocatedOfficeEmp?.basicDetails?.fullName || '');
    html = html.replace(/{doneBy}/g, jobInit?.doneBy?.basicDetails?.fullName || '');
    html = html.replace(/{serviceName}/g, jobInit?.referServiceId?.serviceName || '');
    html = html.replace(/{reportType}/g, jobInit?.reportType?.productName || '');
    html = html.replace(/{partnerName}/g, jobInit?.partnerId?.fullName || '');
    html = html.replace(/{allocatedDate}/g, formattedAllocatedDate || '');
    html = html.replace(/{completedDate}/g, formattedCompletedDate || '');
    html = html.replace(/{charge}/g, jobInit?.charge || '');

    // 🔟 Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfDir = path.join(process.cwd(), "pdf");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const fileName = `${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, fileName);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();

    // 1️⃣1️⃣ Generate Word docx from HTML
    const wordFileName = `${Date.now()}.docx`;
    const wordPath = path.join(pdfDir, wordFileName);

    const docxBlob = htmlDocx.asBlob(html);
    const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
    fs.writeFileSync(wordPath, docxBuffer);

    // 1️⃣2️⃣ Upload PDF to Spaces
    const userId = req.employee.organizationId;
    const pdfContent = fs.readFileSync(pdfPath);
    const pdfFilePathInBucket = `vendor_management/${userId}/documents/${fileName}`;
    await uploadToSpaces('vendor', pdfFilePathInBucket, pdfContent, 'public-read', 'application/pdf', {
      'Content-Disposition': 'inline',
      'Content-Type': 'application/pdf'
    });

    // 1️⃣3️⃣ Upload Word file to Spaces
    const wordContent = fs.readFileSync(wordPath);
    const wordFilePathInBucket = `vendor_management/${userId}/documents/${wordFileName}`;
    await uploadToSpaces('vendor', wordFilePathInBucket, wordContent, 'public-read', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', {
      'Content-Disposition': 'inline',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // 1️⃣4️⃣ Clean up local files
    fs.unlinkSync(pdfPath);
    fs.unlinkSync(wordPath);

    let existingInit = await initModel.findById(req.body.initId);
    const diffInMs = new Date() - existingInit.createdAt;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    // 1️⃣5️⃣ Update report URL in initModel
    await initModel.findByIdAndUpdate(req.body.initId, {
      workStatus: "reportgenerated",
      reportStatus: "generated",
      reportDate: new Date(),
      reportTAT: diffInDays,
      $push: {
        reportUrl: `https://tech-cdn.fincooper.in/${pdfFilePathInBucket}`,
        wordUrl: `https://tech-cdn.fincooper.in/${wordFilePathInBucket}`
      }
    });

    // 1️⃣6️⃣ Return URLs for both PDF and Word
    return returnFormatter(true, "PDF and Word files generated and uploaded successfully!", {
      pdfUrl: `https://tech-cdn.fincooper.in/${pdfFilePathInBucket}`,
      wordUrl: `https://tech-cdn.fincooper.in/${wordFilePathInBucket}`
    });

  } catch (error) {
    console.error("PDF/Word generation error:", error);
    return returnFormatter(false, error.message);
  }
}


