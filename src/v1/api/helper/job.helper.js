import mongoose from "mongoose";
import { returnFormatter } from "../formatters/common.formatter.js";
import employeeModel from "../models/employeemodel/employee.model.js";
import jobModel from "../models/jobModel/job.model.js";
import partnerRequestModel from "../models/partnerRequestModel/partnerRequest.model.js";
import fs from "fs";
import ExcelJS from "exceljs";
import userProductModel from "../models/userProduct/userProduct.model.js";
import { generateAIResponseWithImageUrl } from "../services/commandServices/gemini.services.js";
import initModel from "../models/initModel/init.model.js";
import moment from "moment";
import { getAllInitFields } from "../helper/initFields.helper.js";
//----------------------------   get partner Products ------------------------------


export async function getPartnerProductInfo(requestsObject) {
  try {
    const serviceId = new mongoose.Types.ObjectId(requestsObject.employee.organizationId);
const requestId = new mongoose.Types.ObjectId(requestsObject.query.requestId);
const referId = new mongoose.Types.ObjectId(requestsObject.query.referId);

const initData = await initModel.findById(requestsObject.query.initId).lean();

async function fetchPartners(query) {
  return await partnerRequestModel
    .aggregate([
      { $match: query },
      {
        $lookup: {
          from: "organizations",
          localField: "receiverId",
          foreignField: "_id",
          as: "partner",
        },
      },
      { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "companies",
          localField: "partner._id",
          foreignField: "organizationId",
          as: "company",
        },
       },
       { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            productForm: {
              $filter: {
                input: "$productForm",
                as: "form",
                cond: { $eq: ["$$form.isChecked", true] }
              }
            }
          }
        },
        { $unwind: "$productForm" },
        {
          $lookup: {
            from: "userproducts",
            localField: "productForm.userProductId",
            foreignField: "_id",
            as: "userProduct"
          }
        },
        { $unwind: { path: "$userProduct", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            "userProduct.requestId": requestId,
            "userProduct.referId": referId
          }
        },
        {
          $addFields: {
            "productForm.userProduct": "$userProduct"
          }
        },
        { $project: { userProduct: 0 } },
        {
          $lookup: {
            from: "form-libraries",
            let: {
              allFields: {
                $setUnion: [
                  "$productForm.initFields.fields",
                  "$productForm.allocationFields.fields",
                  "$productForm.agentFields.fields",
                  {
                    $map: {
                      input: { $ifNull: ["$productForm.submitFields.fields", []] },
                      as: "submitField",
                      in: "$$submitField.fieldId"
                    }
                  }
                ]
              }
            },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$allFields"] } } },
              { $project: { _id: 1, fieldName: 1, dataType: 1 ,isRequired:1} }
            ],
            as: "formFields"
          }
        },
        {
          $addFields: {
            "productForm.initFields.fields": mapFieldData("$productForm.initFields.fields", "$formFields"),
            "productForm.allocationFields.fields": mapFieldData("$productForm.allocationFields.fields", "$formFields"),
            "productForm.agentFields.fields": mapFieldData("$productForm.agentFields.fields", "$formFields"),
            "productForm.submitFields.fields": {
              $map: {
                input: { $ifNull: ["$productForm.submitFields.fields", []] },
                as: "submitField",
                in: {
                  $let: {
                    vars: {
                      fieldObj: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$formFields",
                              as: "form",
                              cond: { $eq: ["$$form._id", "$$submitField.fieldId"] }
                            }
                          }, 0
                        ]
                      }
                    },
                    in: {
                      fieldId: "$$submitField.fieldId",
                      fieldName: "$$fieldObj.fieldName",
                      dataType: "$$fieldObj.dataType",
                      isRequired: "$$fieldObj.isRequired",
                      supportingDoc: "$$submitField.supportingDoc",
                      _id: "$$submitField._id"
                    }
                  }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: "$_id",
            doc: { $first: "$$ROOT" },
            productForms: { $push: "$productForm" }
          }
        },
        {
          $addFields: {
            "doc.productForm": "$productForms"
          }
        },
        {
          $replaceRoot: {
            newRoot: "$doc"
          }
        }
      ]).sort({ createdAt: -1 });
    }

    function mapFieldData(fieldPath, formFieldsPath) {
      return {
        $map: {
          input: fieldPath,
          as: "fieldId",
          in: {
            $let: {
              vars: {
                fieldObj: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: formFieldsPath,
                        as: "form",
                        cond: { $eq: ["$$form._id", "$$fieldId"] }
                      }
                    }, 0
                  ]
                }
              },
              in: {
                fieldName: "$$fieldObj.fieldName",
                dataType: "$$fieldObj.dataType",
                isRequired: "$$fieldObj.isRequired",
              }
            }
          }
        }
      };
    }

    const sentPartners = await fetchPartners({ senderId: serviceId, status: "accepted" });
    const receivedPartners = await fetchPartners({ receiverId: serviceId, status: "accepted" });

    const formatPartners = (partners, isSent) =>
      partners.map(partner => ({
        ...partner,
        partnerId: isSent ? partner.receiverId : partner.senderId
      }));

    // Updated injectValues function - match by fieldName and update dataType
    const injectValues = (fields) => {
      if (!fields || fields.length === 0) return [];

      if (Array.isArray(initData?.initFields) && initData.initFields.length > 0) {
        return fields.map(field => {
          // Find matching field in initData.initFields by fieldName
          const matchingInitField = initData.initFields.find(f =>
            f.fieldName === field.fieldName
          );
          return {
            ...field,
            value: matchingInitField ? matchingInitField.value : field.value || "",
            dataType: matchingInitField ? matchingInitField.dataType : field.dataType
          };
        });
      }

      // Default: empty or fallback
      return fields.map(field => ({
        ...field,
        value: field.value || ""
      }));
    };

    // Updated injectSubmitFieldValues function to handle submitFields structure
    const injectSubmitFieldValues = (submitFields) => {
      if (!submitFields || submitFields.length === 0) return [];

      if (Array.isArray(initData?.submitFields) && initData.submitFields.length > 0) {
        return submitFields.map(field => {
          // Find matching field in initData.submitFields by fieldName
          const matchingSubmitField = initData.submitFields.find(f =>
            f.fieldName === field.fieldName
          );
          return {
            ...field,
            value: matchingSubmitField ? matchingSubmitField.value : field.value || "",
            dataType: matchingSubmitField ? matchingSubmitField.dataType : field.dataType
          };
        });
      }

      // Default: empty or fallback
      return submitFields.map(field => ({
        ...field,
        value: field.value || ""
      }));
    };

    const injectFieldValues = (productForm) => {
      return productForm.map(product => ({
        ...product,
        initFields: {
          ...product.initFields,
          fields: injectValues(product.initFields.fields || [])
        },
        allocationFields: {
          ...product.allocationFields,
          fields: injectValues(product.allocationFields.fields || [])
        },
        agentFields: {
          ...product.agentFields,
          fields: injectValues(product.agentFields.fields || [])
        },
        submitFields: {
          ...product.submitFields,
          fields: injectSubmitFieldValues(product.submitFields.fields || [])
        }
      }));
    };

    const allPartners = [
      ...formatPartners(sentPartners, true),
      ...formatPartners(receivedPartners, false)
    ].map(partner => ({
      ...partner,
      productForm: injectFieldValues(partner.productForm || [])
    }));

    // Add initFields, allocationFields, agentFields, and submitFields to initData at root level
    if (initData) {
      // Ensure initData has the same structure as productForm fields
      initData.initFields = initData.initFields || [];
      initData.allocationFields = initData.allocationFields || [];
      initData.agentFields = initData.agentFields || [];
      initData.submitFields = initData.submitFields || [];
    }

    return returnFormatter(true, "Fetched partner products", [...allPartners,initData.sign]);
  } catch (error) {
    return returnFormatter(false, `Error fetching partner products: ${error.message}`);
  }
}

//----------------------------   fetch auto data from ai ----------------------------z--

export async function fetchAutoDataFromAi(requestsObject) {
    try {
        let partnerRequestId = new mongoose.Types.ObjectId(requestsObject.body.reqId)
        let productId = new mongoose.Types.ObjectId(requestsObject.body.userProductId)
        let initFieldsData = requestsObject.body.initFields;

        let doc = [];
        initFieldsData?.forEach(field => {
            if (field.dataType === "file") {
                doc.push(field.value);
            } else if (field.dataType === "multiUpload") {
                if (Array.isArray(field.value)) {
                    doc.push(...field.value); // spread to push all items in array
                }
            }
        });

        let partnerData = await partnerRequestModel.aggregate([
            { $match: { _id: partnerRequestId } },
            {
                $lookup: {
                    from: "companies",
                    localField: "partner._id",
                    foreignField: "serviceId",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },

            // Filtering productForm array for only checked items
            {
                $addFields: {
                    productForm: {
                        $filter: {
                            input: "$productForm",
                            as: "form",
                            cond: { $eq: ["$$form.isChecked", true] }
                        }
                    }
                }
            },
            { $unwind: { path: "$productForm", preserveNullAndEmptyArrays: true } },

            // ✅ ADD THIS STAGE to filter by userProductId
            {
                $match: {
                    "productForm.userProductId": productId
                }
            },

            {
                $lookup: {
                    from: "forms",
                    let: {
                        allFields: {
                            $setUnion: [
                                "$productForm.initFields.fields",
                                "$productForm.allocationFields.fields",
                                "$productForm.agentFields.fields",
                                // ✅ Extract fieldId from submitFields for lookup
                                {
                                    $map: {
                                        input: { $ifNull: ["$productForm.submitFields.fields", []] },
                                        as: "submitField",
                                        in: "$$submitField.fieldId"
                                    }
                                }
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$allFields"] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1,
                                isRequired : 1
                            }
                        }
                    ],
                    as: "formFields"
                }
            },

            // ✅ Handle regular fields (initFields, allocationFields, agentFields)
            ...["initFields", "allocationFields", "agentFields"].map(fieldType => ({
                $addFields: {
                    [`productForm.${fieldType}.fields`]: {
                        $map: {
                            input: `$productForm.${fieldType}.fields`,
                            as: "fieldId",
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$formFields",
                                                        as: "form",
                                                        cond: { $eq: ["$$form._id", "$$fieldId"] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: "$$fieldObj.fieldName",
                                        dataType: "$$fieldObj.dataType"
                                    }
                                }
                            }
                        }
                    }
                }
            })),

            // ✅ Special handling for submitFields
            {
                $addFields: {
                    "productForm.submitFields.fields": {
                        $map: {
                            input: { $ifNull: ["$productForm.submitFields.fields", []] },
                            as: "submitField",
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$formFields",
                                                        as: "form",
                                                        cond: { $eq: ["$$form._id", "$$submitField.fieldId"] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldId: "$$submitField.fieldId",
                                        fieldName: "$$fieldObj.fieldName",
                                        dataType: "$$fieldObj.dataType",
                                        supportingDoc: "$$submitField.supportingDoc",
                                        _id: "$$submitField._id"
                                    }
                                }
                            }
                        }
                    }
                }
            },

            {
                $group: {
                    _id: "$_id",
                    doc: { $first: "$$ROOT" },
                    productForms: { $push: "$productForm" }
                }
            },
            {
                $addFields: {
                    "doc.productForm": "$productForms"
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$doc"
                }
            }
        ]).sort({ createdAt: -1 });


        // ✅ Get submitFields for prompt generation
        const submitFields = partnerData[0].productForm[0].submitFields;
        
        // ✅ Filter only string type fields for processing
        const submitFieldsForProcessing = {
            fields: submitFields.fields.filter(field => field.dataType === 'string'||field.dataType === 'textarea'),
            isActive: submitFields.isActive
        };
        
        // ✅ Updated prompt using submitFields structure
    let prompt = `Extract comprehensive and accurate information from multiple documents based on specific field requirements and ensure all output is in English.

Input:
* urls: ${JSON.stringify(doc)}
* submit_fields: ${JSON.stringify(submitFieldsForProcessing.fields)}

Instructions:

1. Open and process each document from the provided URLs.

2. For each field in submit_fields, extract the required information based on the supporting document type specified:
${submitFieldsForProcessing.fields.map(field => 
   `   - ${field.fieldName}: Look specifically in ${field.supportingDoc} documents`
).join('\n')}

3. Extract complete and accurate versions of each field:
   - Use full names (e.g., "Ramprasad Chaudhary" not just "Ramprasad")
   - Include complete addresses with PIN codes
   - Provide full contact numbers with country codes
   - Include complete details as specified in the supporting document

4. Translate all non-English content (such as Hindi, regional languages) to fluent and complete English.

5. For each field, search in the document type mentioned in supportingDoc:
   - Read the specific document type carefully
   - Extract the most relevant and complete information
   - Ensure accuracy after translation

6. Document Processing Guidelines:
   - If a field requires "Aadhaar" - look for Aadhaar card documents
   - If a field requires "House Receipt" - look for property/house-related receipts
   - If a field requires "Property Tax Receipt" - look for tax payment documents
   - Match the supporting document type with the actual document content

7. If any field is not found in its specified supporting document, return its value as null.

8. Special Case - Boundary Fields:
   - For fields like **East Boundary**, **West Boundary**, **North Boundary**, **South Boundary**:
     - If the specified boundary is **not found** in the document, return the value as **"Please Refer Technical"** instead of null.

9. Document List Processing (For the field **Document_List**):
   - Scan all processed documents for recognizable titles and ownership information
   - Format each document in the form:
     **[Document Name] dt.[DD-MM-YYYY] in favour of [Full Name]. (Original/Photocopy)**
   - If a date is not present, skip "dt." section
   - If "in favour of" name is not found, attempt to infer owner from document if safe
   - Use "Original" or "Photocopy" based on document quality and appearance
   - Present the entries starting from number **3** onward, like:
     3. Aadhaar Card in favour of Ramprasad Chaudhary. (Photocopy)  
     4. Property Tax Receipt dt.12-04-2020 in favour of Shri Bhaiyadin S/o Shri Mangilal. (Original)  
     5. Gas Pass Book dt.20-01-2019 in favour of Ramprasad Chaudhary. (Photocopy)
   - Always end the list with the mandatory deed entry as the last numbered item.

10. Property Information:
   - Extract "Description of the property" with only the address
   - Focus on location, area, and basic property details
   - Do NOT include unnecessary legal clauses

Return a single JSON object with field names as keys:

{
${submitFieldsForProcessing.fields.map(field => `  "${field.fieldName}": "extracted value from ${field.supportingDoc}"`).join(',\n')}${submitFieldsForProcessing.fields.length > 0 ? ',' : ''}

}

Important Notes:
- Focus only on the fields specified in submit_fields
- Match each field with its corresponding supportingDoc requirement
- For Document_List field, number all documents starting from 3
- Include document name, date (if found), and "in favour of" full name with original/photocopy tag
- Always end the list with the mandatory deed entry
- Ensure all extracted information is complete, accurate, and translated to English
- Return null for fields not found in their specified supporting documents
- For missing boundary fields (East/West/North/South), return "Please Refer Technical"`





        let data = await generateAIResponseWithImageUrl(prompt, doc);

        return returnFormatter(true, "Fetched partner products", data);
    } catch (error) {
        console.error("Error in fetchAutoDataFromAi:", error);
        return returnFormatter(false, error.message);
    }
}

//----------------------------   fetch auto data from ai ------------------------------

export async function fetchAdCasedata(requestsObject) {
    try {
        let doc = requestsObject.body.doc;

        // Fetch dynamic fields
        let defautData = await getAllInitFields(requestsObject);

        // Extract just field names from the objects
        // Filter for fields with dataType "string" or "textArea" and extract just field names
        const fieldsList = defautData.data
            .filter(field => field.dataType === "string" || field.dataType === "textarea")
            .map(field => field.fieldName);

        // Create a formatted string for fields

        let prompt = `You are an intelligent assistant tasked with extracting structured information from multiple document images. Carefully read all available documents and fill the requested fields with complete and translated data in English.

Documents to process:
* urls: ${doc}

Fields to extract:
${fieldsList}

Instructions:

1. Open and analyze each document from the provided URLs.
2. Extract the full and most accurate version of each requested field. Example: 
   - "Ramprasad Chaudhary" instead of just "Ramprasad"
   - Include full addresses with PIN codes where applicable.
3. Translate all non-English text (e.g., Hindi) into fluent English before extracting and only give english response.
4. For contact information, look for labels like: "phone number", "mobile", "contact", etc., and ensure correct formatting (e.g., +91 format).
5. Use the following criteria to select the best version of each field:
   - Completeness (full names, full addresses, etc.)
   - Clarity and detail (e.g., include institution names in education)
   - Language accuracy post-translation
   - Date accuracy

Return a single JSON object with the extracted fields, 
`;

        let data = await generateAIResponseWithImageUrl(prompt, doc);

        return returnFormatter(true, "Fetched partner products", data);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}




//----------------------------   fetch auto data from ai for emp ------------------------------

export async function fetchAutoDataFromAiEmp(requestsObject) {
    try {
        // Retrieve productId from the request
        let jobId = new mongoose.Types.ObjectId(requestsObject.body.jobProductId);

        // Find the job product
        let jobProduct = await jobProductModel.findById(jobId);

        if (!jobProduct) {
            return returnFormatter(false, "No job found");
        }
        if (jobProduct.aiBody == {}) {
            return returnFormatter(false, "No ai data found")
        }
        // Retrieve doc from the request
        let doc = jobProduct.aiBody.doc;

        let partnerData = await partnerRequestModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(jobProduct.aiBody.reqId) } },
            {
                $lookup: {
                    from: "companies",
                    localField: "partner._id",
                    foreignField: "serviceId",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },

            // Filtering productForm array for only checked items
            {
                $addFields: {
                    productForm: {
                        $filter: {
                            input: "$productForm",
                            as: "form",
                            cond: { $eq: ["$$form.isChecked", true] }
                        }
                    }
                }
            },
            { $unwind: { path: "$productForm", preserveNullAndEmptyArrays: true } },

            // Filter by userProductId
            {
                $match: {
                    "productForm.userProductId": jobProduct.userProductId
                }
            },

            {
                $lookup: {
                    from: "forms",
                    let: {
                        allFields: {
                            $setUnion: [
                                "$productForm.initFields.fields",
                                "$productForm.allocationFields.fields",
                                "$productForm.agentFields.fields",
                                "$productForm.submitFields.fields"
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$allFields"] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1
                            }
                        }
                    ],
                    as: "formFields"
                }
            },

            ...["initFields", "allocationFields", "agentFields", "submitFields"].map(fieldType => ({
                $addFields: {
                    [`productForm.${fieldType}.fields`]: {
                        $map: {
                            input: `$productForm.${fieldType}.fields`,
                            as: "fieldId",
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$formFields",
                                                        as: "form",
                                                        cond: { $eq: ["$$form._id", "$$fieldId"] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: "$$fieldObj.fieldName",
                                        dataType: "$$fieldObj.dataType"
                                    }
                                }
                            }
                        }
                    }
                }
            })),

            {
                $group: {
                    _id: "$_id",
                    doc: { $first: "$$ROOT" },
                    productForms: { $push: "$productForm" }
                }
            },
            {
                $addFields: {
                    "doc.productForm": "$productForms"
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$doc"
                }
            }
        ]).sort({ createdAt: -1 });


        if (!partnerData || partnerData.length === 0) {
            return returnFormatter(false, "No partner data found");
        }

        const initFieldNames = partnerData[0].productForm[0].agentFields.fields
            .filter(field => field.dataType === 'string')
            .map(field => field.fieldName);

        let prompt = `Extract comprehensive information from multiple documents and ensure English output.

Input:
- urls: Array of document URLs to analyze
- fields: Array of field names to extract

Instructions:
1. Process each document from the provided URLs
2. Extract complete versions of the specified fields (e.g., "Ramprasad Chaudhary" not just "Ramprasad")
3. Translate all Hindi content (or any other non-English language) to English
4. When searching for contact information, look for variations (e.g., "phone number", "mobile number", "contact")
5. Select the highest quality version of each field based on:
   - Completeness of information
   - Level of detail
   - Data accuracy after translation
6. Format missing fields as null values

Return a single JSON object with field names as keys and their complete English values.

Example:
{
  "East Boundry": "Something",   
  "West Boundry": "Something",   
  "North Boundry": "Something",   
  "South Boundry": "Something",   
  "Description of the property": "The resident ame is taht and liveing in that city",  // translated from Hindi
  "Tax Reciept Date": "Master of Business Administration, Harvard University",
}

URLs: ${doc}
Fields: ${initFieldNames}`;

        let data = await generateAIResponseWithImageUrl(prompt, doc);

        return returnFormatter(true, "Fetched partner products", data);

    } catch (error) {
        console.error("Error in fetchAutoDataFromAiEmp:", error);
        return returnFormatter(false, error.message);
    }
}



//----------------------------   add Job ------------------------------
export async function addJob(requestsObject) {
    if (!requestsObject?.body) {
        return returnFormatter(false, "Invalid request: body is required");
    }
    if (!requestsObject?.body.partnerId || requestsObject?.body.partnerId == "") {
        return returnFormatter(false, "No parner Selected");
    }
    if (!requestsObject?.body.reportType || requestsObject?.body.reportType == "") {
        return returnFormatter(false, "Please select report type");
    }
    const session = await mongoose.startSession();

    try {
        let employeeId;
        let newJobData = null;
        const createdJobProducts = [];
        await session.withTransaction(async () => {
            const formattedData = formateJob(requestsObject);
            const serviceId = requestsObject.user?.serviceId;
            const { jobProductList } = requestsObject.body;

            // Create job document with the correct data
            if (requestsObject.user?.userType === "client") {
                let employee = await employeeModel.findOne({ authId: requestsObject.body.partnerId });
                newJobData = await jobModel.create([{ ...formattedData, creatorId: serviceId }], { session });
            } else {
                formattedData.partnerId = serviceId;
                newJobData = await jobModel.create([{ ...formattedData, creatorId: requestsObject.body.partnerId }], { session });
            }

            // Get the fresh job ID directly from the newly created document
            const newJobId = newJobData[0]._id;

            // Immediately create job products using the fresh job ID

            for (const data of jobProductList || []) {

                const newProduct = await jobProductModel.create([{
                    jobId: newJobId, // Use the fresh job ID
                    jobStatus: 'pending',
                    ...data
                }], { session });

                createdJobProducts.push(newProduct[0]);
            }
        });

        // Find partner request within the transaction
        let requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: newJobData[0].creatorId, receiverId: newJobData[0].partnerId },
                        { senderId: newJobData[0].partnerId, receiverId: newJobData[0].creatorId }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: requestsObject.body.partnerId,
                    foreignField: "_id",
                    as: "partner"
                }
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "partner._id",
                    foreignField: "serviceId",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            {
                $unwind: {
                    path: '$productForm',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'forms',
                    let: {
                        allFields: {
                            $setUnion: [
                                '$productForm.initFields.fields',
                                '$productForm.allocationFields.fields',
                                '$productForm.agentFields.fields',
                                '$productForm.submitFields.fields'
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$allFields'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1
                            }
                        }
                    ],
                    as: 'formFields'
                }
            },
            {
                $addFields: {
                    'productForm.initFields.fields': {
                        $map: {
                            input: '$productForm.initFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.allocationFields.fields': {
                        $map: {
                            input: '$productForm.allocationFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.agentFields.fields': {
                        $map: {
                            input: '$productForm.agentFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.submitFields.fields': {
                        $map: {
                            input: '$productForm.submitFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    productForms: { $push: '$productForm' }
                }
            },
            {
                $addFields: {
                    'doc.productForm': '$productForms'
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$doc'
                }
            }
        ])
            .sort({ createdAt: -1 });

        if (requestData.length >= 1) {
            if (requestData[0].allocationId.length == 1) {
                employeeId = requestData[0].allocationId[0]
                await jobModel.findByIdAndUpdate(newJobData[0]._id, { allocationId: requestData[0].allocationId[0], isAccepted: true })
            }
        }

        // test code


        // Create Map for product form items
        const requestDataMap = new Map();
        if (requestData[0].productForm) {
            requestData[0].productForm.forEach(item => {
                if (item?.userProductId) {
                    const idString = item.userProductId.toString();
                    requestDataMap.set(idString, item);
                }
            });
        }

        // // Process the job products we just created instead of querying again
        for (const job of createdJobProducts) {

            if (job.userProductId) {
                const userProductIdString = job.userProductId.toString();
                const matchedData = requestDataMap.get(userProductIdString);
                let jobProductStatus = 'pending';

                if (matchedData) {

                    // Check conditions and determine highest applicable stage
                    if (matchedData.allocationFields?.isActive === true) {
                        jobProductStatus = 'pending';

                    }
                    else {
                        let partner;

                        if (requestsObject.user.userType == "client") {

                            partner = newJobData[0].partnerId
                        } else {
                            partner = new mongoose.Types.ObjectId(requestsObject.user.serviceId);
                        }
                        let releventEmp = await getAllProductANdLocationEmployeeForautoallocation(partner, job.locationId);

                        let ids;
                        if (releventEmp.status == true) {
                            ids = releventEmp?.data?.map((data) => data._id);
                        }
                        await jobProductModel.findByIdAndUpdate(job._id, { autoALoocatedEmpId: ids })
                        if (matchedData.agentFields?.isActive === true) {
                            jobProductStatus = 'allocated';

                        }
                        else {

                            await jobProductModel.findByIdAndUpdate(job._id, { employeeId: employeeId })
                            if (matchedData.submitFields.isActive === true) {

                                jobProductStatus = 'completed';
                            }
                            else {
                                jobProductStatus = 'submitted';
                            }
                        }
                    }

                    // Update job product status if it's changed from the default
                    if (jobProductStatus !== 'pending') {
                        await jobProductModel.findByIdAndUpdate(
                            job._id,
                            { jobStatus: jobProductStatus },
                            { session }
                        );
                    }
                }
            }
        }

        let alljobProduts = await jobProductModel.find({ jobId: newJobData[0]._id });

        let isALlALocated = alljobProduts.every((data) => data.jobStatus == "allocated")
        let isALlCompleted = alljobProduts.every((data) => data.jobStatus == "completed")
        let isALlSubmitted = alljobProduts.every((data) => data.jobStatus == "submitted")

        let isSomePending = alljobProduts.some((data) => data.jobStatus === "pending");
        let isSomeAllocated = alljobProduts.some((data) => data.jobStatus === "allocated");
        let isSomeCompleted = alljobProduts.some((data) => data.jobStatus === "completed");

        if (isSomePending) {
            await jobModel.findByIdAndUpdate(newJobData[0]._id, { stageId: 2 });
        } else if (isSomeAllocated) {
            await jobModel.findByIdAndUpdate(newJobData[0]._id, { stageId: 3 });
        } else if (isSomeCompleted) {
            await jobModel.findByIdAndUpdate(newJobData[0]._id, { stageId: 4 });
        }
        if (isALlALocated) {
            await jobModel.findByIdAndUpdate(newJobData[0]._id, { stageId: 3 })
        }

        if (isALlCompleted) {
            await jobModel.findByIdAndUpdate(newJobData[0]._id, { stageId: 4 })
        }

        if (isALlSubmitted) {
            await jobModel.findByIdAndUpdate(newJobData[0]._id, { stageId: 5 })
        }
        await initModel.findByIdAndUpdate(requestsObject.body.initId, { jobId: newJobData[0]._id, isJobCreated: true, initiatedDate: new Date(), allocatedOfficeEmp: newJobData[0].allocationId })
        return returnFormatter(true, addJobSuccessMessage);

    } catch (error) {
        return returnFormatter(false, error.message || "Failed to add job");
    } finally {
        session.endSession();
    }
}




// --------------------- allocate Job -----------------------
export async function allocateJobByJobId(jobId, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let isData = await jobProductModel.findById(jobId).session(session);
        if (!isData) {
            await session.abortTransaction();
            session.endSession();
            return returnFormatter(false, "No job product found");
        }

        // Update job product
        let jobData = await jobProductModel.findByIdAndUpdate(
            jobId,
            {
                ...updateData.body,
                allocatedDate: new Date(),
                jobStatus: "allocated",
                isAccepted: true
            },
            { new: true, session }
        );

        let newJob = await jobModel.findById(jobData.jobId).session(session);

        let alljobProduts = await jobProductModel.find({ jobId: newJob._id, }).session(session);

        let isALlPending = alljobProduts.every((data) => data.jobStatus == "pending")
        let isALlALocated = alljobProduts.every((data) => data.jobStatus == "allocated")
        let isALlCompleted = alljobProduts.every((data) => data.jobStatus == "completed")
        let isALlSubmitted = alljobProduts.every((data) => data.jobStatus == "submitted")

        let isSomePending = alljobProduts.some((data) => data.jobStatus === "pending");
        let isSomeAllocated = alljobProduts.some((data) => data.jobStatus === "allocated");
        let isSomeCompleted = alljobProduts.some((data) => data.jobStatus === "completed");


        if (isSomePending) {

            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 2 });
        } if (isSomeAllocated) {

            let data = await jobModel.findByIdAndUpdate(newJob._id, { stageId: 3 }, { new: true });

        } if (isSomeCompleted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 4 });
        }
        if (isALlPending) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 2 })
        }

        if (isALlALocated) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 3 })
        }

        if (isALlCompleted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 4 })
        }

        if (isALlSubmitted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 5 })
        }


        await session.commitTransaction();
        session.endSession();
        return returnFormatter(true, "Job allocated successfully");
    } catch (error) {

        await session.abortTransaction();
        session.endSession();
        return returnFormatter(false, error.message);

    }


}


// ---------------------un allocate Job -----------------------
export async function UnallocateJobByJobId(jobId, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        let isData = await jobProductModel.findById(jobId).session(session);
        if (!isData) {
            await session.abortTransaction();
            session.endSession();
            return returnFormatter(false, "No job product found");
        }



        // Update job product
        let jobData = await jobProductModel.findByIdAndUpdate(
            jobId,
            {
                allocationValues: [],
                jobStatus: "pending",
                isAccepted: false,
                $unset: { employeeId: "" }
            },
            { new: true, session }
        );
        ;

        let newJob = await jobModel.findById(jobData.jobId).session(session);


        let alljobProduts = await jobProductModel.find({ jobId: newJob._id }).session(session);

        let isALlPending = alljobProduts.every((data) => data.jobStatus == "pending")
        let isALlALocated = alljobProduts.every((data) => data.jobStatus == "allocated")
        let isALlCompleted = alljobProduts.every((data) => data.jobStatus == "completed")
        let isALlSubmitted = alljobProduts.every((data) => data.jobStatus == "submitted")

        let isSomePending = alljobProduts.some((data) => data.jobStatus === "pending");
        let isSomeAllocated = alljobProduts.some((data) => data.jobStatus === "allocated");
        let isSomeCompleted = alljobProduts.some((data) => data.jobStatus === "completed");


        if (isSomePending) {

            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 2 });
        } if (isSomeAllocated) {

            let data = await jobModel.findByIdAndUpdate(newJob._id, { stageId: 3 }, { new: true });

        } if (isSomeCompleted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 4 });
        }
        if (isALlPending) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 2 })
        }

        if (isALlALocated) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 3 })
        }

        if (isALlCompleted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 4 })
        }

        if (isALlSubmitted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 5 })
        }

        await session.commitTransaction();
        session.endSession();
        return returnFormatter(true, "Job reassign successfully");
    } catch (error) {

        await session.abortTransaction();
        session.endSession();
        return returnFormatter(false, error.message);

    }


}

// --------------------- update job only -----------------------
export async function updateJobById(jobProductId, updateData) {
    try {
        // Fetch existing job data
        let jobData = await jobProductModel.findById(jobProductId);
        if (!jobData) {
            return returnFormatter(false, "Not found");
        }

        let updatedEmpjob = await jobProductModel.findByIdAndUpdate(updateData.body.jobProductId, { ...updateData.body, jobStatus: "completed" }, { new: true })


        return returnFormatter(true, "Job updated successfully");
    } catch (error) {
        console.error("Error in updateJobById:", error);
        return returnFormatter(false, error.message);
    }
}


// --------------------- reset job only -----------------------
export async function resetJob(jobId) {
    try {

        // Fetch existing job data
        let jobData = await jobModel.findById(jobId);
        if (!jobData) {
            return returnFormatter(false, "Not found");
        }

        let updatedEmpjob = await jobModel.findByIdAndUpdate(jobId, { stageId: 4 }, { new: true })

        await jobProductModel.findOneAndUpdate({ jobId: updatedEmpjob._id }, { jobStatus: "completed" });

        return returnFormatter(true, "Job reset successfully");
    } catch (error) {
        console.error("Error in updateJobById:", error);
        return returnFormatter(false, error.message);
    }
}



// --------------------- update employee my job only -----------------------



export async function updateMyJobById(updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobProductId, ...updateFields } = updateData.body;

        // Check if the job exists
        const existingJob = await jobProductModel.findById(jobProductId).session(session);
        if (!existingJob) {
            await session.abortTransaction();
            session.endSession();
            return returnFormatter(false, "No job found");
        }

        // Update the job status to "completed"
        const updatedEmpJob = await jobProductModel.findByIdAndUpdate(
            jobProductId,
            { ...updateFields, completedDate: new Date(), jobStatus: "completed" },
            { new: true, session }
        );

        if (!updatedEmpJob) {
            await session.abortTransaction();
            session.endSession();
            return returnFormatter(false, "Failed to update job");
        }

        // Fetch all jobs with the same jobId
        const createdJobProducts = await jobProductModel.find({ jobId: updatedEmpJob.jobId }).session(session);
        let newJob = await jobModel.findById(updatedEmpJob.jobId).session(session);



        let requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: newJob.creatorId, receiverId: newJob.partnerId },
                        { senderId: newJob.partnerId, receiverId: newJob.creatorId }
                    ]
                }
            },
            // {
            //     $lookup: {
            //         from: "users",
            //         localField: requestsObject.body.partnerId,
            //         foreignField: "_id",
            //         as: "partner"
            //     }
            // },
            // { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "partner._id",
                    foreignField: "serviceId",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            {
                $unwind: {
                    path: '$productForm',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'forms',
                    let: {
                        allFields: {
                            $setUnion: [
                                '$productForm.initFields.fields',
                                '$productForm.allocationFields.fields',
                                '$productForm.agentFields.fields',
                                '$productForm.submitFields.fields'
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$allFields'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1
                            }
                        }
                    ],
                    as: 'formFields'
                }
            },
            {
                $addFields: {
                    'productForm.initFields.fields': {
                        $map: {
                            input: '$productForm.initFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.allocationFields.fields': {
                        $map: {
                            input: '$productForm.allocationFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.agentFields.fields': {
                        $map: {
                            input: '$productForm.agentFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.submitFields.fields': {
                        $map: {
                            input: '$productForm.submitFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    productForms: { $push: '$productForm' }
                }
            },
            {
                $addFields: {
                    'doc.productForm': '$productForms'
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$doc'
                }
            }
        ])
            .sort({ createdAt: -1 });


        // test code


        // Create Map for product form items
        const requestDataMap = new Map();
        if (requestData[0].productForm) {
            requestData[0].productForm.forEach(item => {
                if (item?.userProductId) {
                    const idString = item.userProductId.toString();
                    requestDataMap.set(idString, item);
                }
            });
        }

        // // Process job products
        for (const job of createdJobProducts) {
            if (job.userProductId) {
                const userProductIdString = job.userProductId.toString();
                const matchedData = requestDataMap.get(userProductIdString);
                let jobProductStatus = 'pending';

                if (matchedData) {
                    if (matchedData.submitFields?.isActive === true) {
                        jobProductStatus = 'completed';
                    } else {
                        jobProductStatus = 'submitted';
                    }

                    if (jobProductStatus !== 'pending') {
                        await jobProductModel.findByIdAndUpdate(
                            job._id,
                            { jobStatus: jobProductStatus },
                            { session }
                        );
                    }
                }
            }
        }

        let allJobProducts = await jobProductModel.find({ jobId: newJob._id }).session(session);

        let isAllAllocated = allJobProducts.every(data => data.jobStatus === "allocated");
        let isAllCompleted = allJobProducts.every(data => data.jobStatus === "completed");
        let isAllSubmitted = allJobProducts.every(data => data.jobStatus === "submitted");

        let isSomePending = allJobProducts.some(data => data.jobStatus === "pending");
        let isSomeAllocated = allJobProducts.some(data => data.jobStatus === "allocated");
        let isSomeCompleted = allJobProducts.some(data => data.jobStatus === "completed");

        if (isSomePending) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 2 }, { session });
        } if (isSomeAllocated) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 3 }, { session });
        } if (isSomeCompleted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 4 }, { session });
        }

        if (isAllAllocated) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 3 }, { session });
        }
        if (isAllCompleted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 4 }, { session });
        }
        if (isAllSubmitted) {
            await jobModel.findByIdAndUpdate(newJob._id, { stageId: 5 }, { session });
        }

        await session.commitTransaction();
        session.endSession();

        return returnFormatter(true, "Job updated successfully");
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return returnFormatter(false, error.message);
    }
}


// --------------------- update job Stage only -----------------------

export async function updateJobStage(jobId, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Find the job product by ID
        const jobProduct = await jobProductModel.findById(jobId).session(session);
        if (!jobProduct) {
            return returnFormatter("No job product found");
        }

        const newData = await userInvoiceModel.findOne({ serviceId: updateData.user.serviceId }).populate({
            path: "templateInvoiceId",
            model: "invoiceTemplate",
            options: { strictPopulate: false },
        });

        if (!newData) {
            return returnFormatter(false, "No invoice template created")
        }


        // Update the job product status
        const updatedJobProduct = await jobProductModel.findByIdAndUpdate(
            jobId,
            { jobStatus: "submitted", jobProductStatus: updateData.body.jobStatus },
            { new: true, session }
        );

        if (updatedJobProduct) {
            await generateInvoice(updateData, updatedJobProduct.jobId)
        }

        // Get the parent job
        const jobData = await jobModel.findById(updatedJobProduct.jobId).session(session);

        // Find ALL job products for this job
        const allJobProducts = await jobProductModel.find({ jobId: jobData._id }).session(session);

        // Check if ALL job products have status "submitted"
        const isAllSubmitted = allJobProducts.every((data) => data.jobStatus === "submitted");

        // If all job products are submitted, update the main job's stage
        if (isAllSubmitted) {
            await jobModel.findByIdAndUpdate(
                jobData._id,
                { ...updateData.body, stageId: 5 },
                { new: true, session }
            );
        }
        // Commit the transaction
        await session.commitTransaction();
        return returnFormatter(true, "Job updated successfully");

    } catch (error) {
        await session.abortTransaction();
        return returnFormatter(false, error.message);
    } finally {
        session.endSession();
    }
}




//----------------------------- accept the job allocation by emp------------------



// --------------------- accept alloction  job  -----------------------
export async function acceptJobALoocation(updateData) {
    try {

        let jobData = await jobModel.findById(updateData.body.jobId);
        if (!jobData) {
            return returnFormatter(false, "Not found");
        }

        let updatedEmpjob = await jobModel.findByIdAndUpdate(
            updateData.body.jobId,
            { allocationId: updateData.user.empId, isAccepted: true },
            { new: true }
        );

        await initModel.findOneAndUpdate(
            { jobId: updatedEmpjob._id },
            { allocatedOfficeEmp: updatedEmpjob.allocationId }
        );

        return returnFormatter(true, "Job accepted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// --------------------- accept emp  job  -----------------------
export async function acceptJobForEmp(updateData) {
    try {

        let jobData = await jobProductModel.findById(updateData.body.jobId);
        if (!jobData) {
            return returnFormatter(false, "Not found");
        }

        let updatedEmpjob = await jobProductModel.findByIdAndUpdate(updateData.body.jobId, { employeeId: updateData.user.empId, isAccepted: true }, { new: true });

        return returnFormatter(true, "Job accepted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// --------------------- delete Job -----------------------

export async function deleteJobById(jobId) {
    try {
        let currentJob = await jobModel.findById(jobId);

        const processData = await getProcessByJobId(currentJob._id);

        if (!processData) {
            return returnFormatter(false, noOProcessErrorMessage)
        }
        const { status, message, data } = await deleteProcessById(processData.data._id);
        const updatedCompanyData = await jobModel.findByIdAndDelete(jobId)
        return returnFormatter(true, DJobDeleteMessage)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}

// --------------------- get Job -----------------------

export async function getJobById(jobId) {
    try {

        // Fetch job data
        const jobData = await jobModel.findById(jobId).lean(); // Use .lean() to get a plain object


        return returnFormatter(true, JobSuccessMessage, jobData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- get all Jobs -----------------------
export async function getAllJob(requestsObject) {
    try {
        if (!requestsObject?.user?.serviceId) {
            return returnFormatter(false, "Service ID is required.");
        }


        let matchStage = {};

        if (requestsObject.user.userType === "client") {
            matchStage.creatorId = new mongoose.Types.ObjectId(requestsObject.user.serviceId);
        } else {
            matchStage.partnerId = new mongoose.Types.ObjectId(requestsObject.user.serviceId);
        }

        let myJob = await jobModel.aggregate([
            {
                $match: matchStage

            },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorId",
                },
            },
            { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partnerId",
                },
            },
            { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "allJobProducts",
                },
            },
            // Filter jobproducts by status
            {
                $addFields: {
                    filteredJobProducts: {
                        $filter: {
                            input: "$allJobProducts",
                            as: "jp",
                            cond: {
                                $in: ["$$jp.jobStatus", ["pending", "allocated", "completed"]]
                            }
                        }
                    }
                }
            },
            // Only keep jobs that have at least one matching jobproduct
            { $match: { "filteredJobProducts.0": { $exists: true } } },
            // Lookup userproducts for all filtered jobproducts
            {
                $lookup: {
                    from: "userproducts",
                    localField: "filteredJobProducts.userProductId",
                    foreignField: "_id",
                    as: "allUserProducts",
                },
            },
            // Lookup products for all userproducts
            {
                $lookup: {
                    from: "products",
                    localField: "allUserProducts.productId",
                    foreignField: "_id",
                    as: "allProducts",
                },
            },
            // Enrich each jobproduct with its related userProduct and product
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$filteredJobProducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        userProduct: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allUserProducts",
                                                        as: "userProduct",
                                                        cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allProducts",
                                                        as: "product",
                                                        cond: {
                                                            $eq: [
                                                                "$$product._id",
                                                                {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $map: {
                                                                                input: {
                                                                                    $filter: {
                                                                                        input: "$allUserProducts",
                                                                                        as: "up",
                                                                                        cond: { $eq: ["$$up._id", "$$jobproduct.userProductId"] }
                                                                                    }
                                                                                },
                                                                                as: "userProduct",
                                                                                in: "$$userProduct.productId"
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }


                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Clean up temporary fields
            {
                $project: {
                    allJobProducts: 0,
                    filteredJobProducts: 0,
                    allUserProducts: 0,
                    allProducts: 0
                }
            }
        ]);



        // Find partner request within the transaction

        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );


        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        if (requestDataArray.length === 0) {
            return returnFormatter(true, JobSuccessMessage, []);
        }


        // Create a Map to store userProductId mapping
        let requestDataMap = new Map();

        // Iterate over filterReqData, as it's an array
        requestDataArray.forEach(req => {
            if (req.productForm && Array.isArray(req.productForm)) {
                req.productForm.forEach(item => {
                    if (item?.userProductId) {
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Check if requestDataMap is empty
        if (requestDataMap.size === 0) {
            return returnFormatter(true, JobSuccessMessage, []);
        }

        // Merge job data with matched product form and filter out unmatched jobs
        let mergedJobData = myJob.map(job => {
            // Process each job to add matchedProductForm to each jobproduct
            if (job.jobproducts && Array.isArray(job.jobproducts)) {
                // Map over each jobproduct to add matched form data
                job.jobproducts = job.jobproducts.map(jobproduct => {
                    if (jobproduct?.userProductId) {
                        const userProductIdString = jobproduct.userProductId.toString();
                        const matchedData = requestDataMap.get(userProductIdString);

                        if (matchedData) {
                            return {
                                ...jobproduct,
                                matchedProductForm: matchedData
                            };
                        }
                    }
                    return jobproduct;
                });

                // Only keep jobproducts that have matching form data
                job.jobproducts = job.jobproducts.filter(jobproduct => jobproduct.matchedProductForm);

                // Only return jobs that have at least one matching jobproduct
                if (job.jobproducts.length > 0) {
                    return job;
                }
            }
            return null;
        }).filter(job => job !== null);
        return returnFormatter(true, JobSuccessMessage, mergedJobData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// --------------------- get accepted Job by  partnerId for allocation -----------------------
export async function getAcceptedJobByPartnerId(requestsObject) {
    try {
        let matchCondition = {
            [requestsObject.user.role === "emp_admin" ? "partnerId" : "allocationId"]:
                new mongoose.Types.ObjectId(
                    requestsObject.user.role === "emp_admin" ? requestsObject.user.serviceId : requestsObject.user.empId
                )
        };

        // Check stageId from query params
        if (requestsObject.query.stageId) {
            if (Number(requestsObject.query.stageId) === 3) {
                return returnFormatter(false, "This stageId not allowed");
            }

            // Special handling for stageId 4 - don't add it to matchCondition
            // so we can include stageId 3 records too
            if (Number(requestsObject.query.stageId) !== 4) {
                matchCondition.stageId = Number(requestsObject.query.stageId);
            } else {
                // For stageId 4, we want to match both stageId 3 and 4
                matchCondition.$or = [
                    { stageId: 2 },
                    { stageId: 3 },
                    { stageId: 4 }
                ];
            }
        }

        // Determine jobStatus filter based on query stageId
        let jobStatusFilter = {};
        if (requestsObject.query.stageId) {
            if (Number(requestsObject.query.stageId) === 2) {
                jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending"] } };
            } else if (Number(requestsObject.query.stageId) === 4) {
                // For stageId 4, we only care about the completed status
                jobStatusFilter = { "jobproduct.jobStatus": "completed" };
            } else {
                jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
            }
        } else {
            // Default if no stageId provided
            jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
        }
        const myJob = await jobModel.aggregate([
            { $match: { ...matchCondition, isAccepted: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorId",
                },
            },
            { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "creatorId._id",
                    foreignField: "serviceId",
                    as: "creatorCompany",
                },
            },
            { $unwind: { path: "$creatorCompany", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partnerId",
                },
            },
            { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproduct",
                },
            },
            { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "employees",
                    localField: "allocationId",
                    foreignField: "_id",
                    as: "alloctedEmp",
                },
            },
            { $unwind: { path: "$alloctedEmp", preserveNullAndEmptyArrays: true } },
            { $match: jobStatusFilter },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproduct.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "services",
                    localField: "userProducts.referId",
                    foreignField: "_id",
                    as: "services",
                },
            },
            { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },

        ]);



        let mergeMyJob = await jobModel.aggregate([
            { $match: { ...matchCondition, isAccepted: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "allUserProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        userProduct: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allUserProducts",
                                                        as: "userProduct",
                                                        cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "allUserProducts.productId",
                    foreignField: "_id",
                    as: "allProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allProducts",
                                                        as: "product",
                                                        cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Lookup employee details
            {
                $lookup: {
                    from: "employees",
                    localField: "jobproducts.employeeId",
                    foreignField: "_id",
                    as: "allEmployees",
                },
            },
            // Add employee details to jobproducts
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        employee: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allEmployees",
                                                        as: "employee",
                                                        cond: { $eq: ["$$employee._id", "$$jobproduct.employeeId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    allUserProducts: 0,
                    allProducts: 0,
                    allEmployees: 0
                }
            }
        ]);


        // Check if myJob has any results
        if (!myJob || myJob.length === 0) {
            return returnFormatter(true, "No jobs found", []);
        }
        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );



        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        // Create a Map to store userProductId mapping
        let requestDataMap = new Map();

        // Iterate over requestDataArray and populate requestDataMap
        requestDataArray.forEach(requestData => {
            if (requestData?.productForm && Array.isArray(requestData.productForm)) {
                requestData.productForm.forEach(item => {
                    if (item?.userProductId) {
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Merge job data with matched product form and filter out unmatched jobs
        let mergedJobData = myJob.reduce((acc, job) => {
            if (job?.jobproduct?.userProductId) {
                const userProductIdString = job.jobproduct.userProductId.toString();
                let matchedData = requestDataMap.get(userProductIdString);

                if (matchedData) {
                    acc.push({
                        ...job,
                        matchedProductForm: matchedData
                    });
                }
            }
            return acc;
        }, []);
        // corrected code
        let filteredMergedjob = mergeMyJob.filter((data) =>
            data.jobproducts.some((jp) => jp.jobStatus === "completed")
        );


        let isLast = false;
        if (requestsObject.query.stageId == 4) {
            isLast = filteredMergedjob.map((data) => {

                if (data.reportType == "separated") {
                    return true;
                }

                let filterData = data.jobproducts.filter((jData) => {
                    return jData.jobStatus !== "submitted";
                });

                // Check if there are any filtered jobs and the last one is completed
                return filterData.length > 0 && filterData[filterData.length - 1].jobStatus == "completed";
            });
        }



        // Step 1: Add isLast to each job
        mergedJobData = mergedJobData.map((job, index) => ({
            ...job,
            isLast: isLast[index]
        }));

        // Step 2: Fetch and merge initModel data for each job
        mergedJobData = await Promise.all(
            mergedJobData.map(async (data) => {
                const intFields = await initModel.findOne({ jobId: data.jobproduct.jobId });
                let initaedBy = await employeeModel.findById(intFields.allocatedEmp)
                return {
                    ...data,
                    fileNo: intFields?.fileNo || null,
                    customerName: intFields?.customerName || null,
                    fatherName: intFields?.fatherName || null,
                    phoneNo: intFields?.contactNo || null,
                    address: intFields?.address || null,
                    initaedBy: initaedBy
                };
            })
        );


        const partnerId = requestsObject.query.partnerId;
        const filterType = requestsObject.query.dateFilter; // 'today', 'thisweek', 'thismonth', or 'custom'
        const startDateParam = requestsObject.query.startDate;
        const endDateParam = requestsObject.query.endDate;

        let startDate, endDate;

        // Handle date filters
        switch (filterType) {
            case 'today':
                startDate = moment().startOf('day').toDate();
                endDate = moment().endOf('day').toDate();
                break;
            case 'thisweek':
                startDate = moment().startOf('week').toDate();
                endDate = moment().endOf('week').toDate();
                break;
            case 'thismonth':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                break;
            case 'custom':
                if (startDateParam && endDateParam) {
                    startDate = moment(startDateParam).startOf('day').toDate();
                    endDate = moment(endDateParam).endOf('day').toDate();
                }
                break;
        }

        // Apply filters only if any filtering is needed
        if (filterType || partnerId) {
            const filteredItems = mergedJobData.filter(item => {
                let match = true;

                // Partner ID match
                if (partnerId) {
                    match = match && item.creatorId?._id?.toString() === partnerId;
                }


                // Date range match
                if (startDate && endDate) {
                    const createdAt = new Date(item.createdAt);

                    match = match && createdAt >= startDate && createdAt <= endDate;
                }

                return match;
            });

            return returnFormatter(true, JobSuccessMessage, filteredItems);
        }


        return returnFormatter(true, JobSuccessMessage, mergedJobData);


    } catch (error) {
        console.error("Error in getJobByPartnerId:", error);
        return returnFormatter(false, error.message);
    }
}


//--------------------- copy for all completed  for dashboard count-----------------------
export async function getAcceptedJobByPartnerIdCompleted(requestsObject) {
    try {
        // Set default stageId to 4 if not provided
        const stageId = requestsObject.query.stageId ? Number(requestsObject.query.stageId) : 4;

        // Determine match condition
        let matchCondition = {
            [requestsObject.user.role === "emp_admin" ? "partnerId" : "allocationId"]:
                new mongoose.Types.ObjectId(
                    requestsObject.user.role === "emp_admin"
                        ? requestsObject.user.serviceId
                        : requestsObject.user.empId
                )
        };

        // Determine jobStatus filter based on stageId
        let jobStatusFilter = {};
        if (stageId === 4) {
            // For stageId 4, we only care about the completed status
            jobStatusFilter = { "jobproduct.jobStatus": "completed" };
        } else {
            // Default if other stageId provided
            jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
        }
        const myJob = await jobModel.aggregate([
            { $match: { ...matchCondition, isAccepted: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorId",
                },
            },
            { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "creatorId._id",
                    foreignField: "serviceId",
                    as: "creatorCompany",
                },
            },
            { $unwind: { path: "$creatorCompany", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partnerId",
                },
            },
            { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproduct",
                },
            },
            { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
            { $match: jobStatusFilter },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproduct.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "services",
                    localField: "userProducts.referId",
                    foreignField: "_id",
                    as: "services",
                },
            },
            { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },

        ]);



        let mergeMyJob = await jobModel.aggregate([
            { $match: { ...matchCondition, isAccepted: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "allUserProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        userProduct: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allUserProducts",
                                                        as: "userProduct",
                                                        cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "allUserProducts.productId",
                    foreignField: "_id",
                    as: "allProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allProducts",
                                                        as: "product",
                                                        cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Lookup employee details
            {
                $lookup: {
                    from: "employees",
                    localField: "jobproducts.employeeId",
                    foreignField: "_id",
                    as: "allEmployees",
                },
            },
            // Add employee details to jobproducts
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        employee: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allEmployees",
                                                        as: "employee",
                                                        cond: { $eq: ["$$employee._id", "$$jobproduct.employeeId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    allUserProducts: 0,
                    allProducts: 0,
                    allEmployees: 0
                }
            }
        ]);


        // Check if myJob has any results
        if (!myJob || myJob.length === 0) {
            return returnFormatter(true, "No jobs found", []);
        }
        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );



        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        // Create a Map to store userProductId mapping
        let requestDataMap = new Map();

        // Iterate over requestDataArray and populate requestDataMap
        requestDataArray.forEach(requestData => {
            if (requestData?.productForm && Array.isArray(requestData.productForm)) {
                requestData.productForm.forEach(item => {
                    if (item?.userProductId) {
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Merge job data with matched product form and filter out unmatched jobs
        let mergedJobData = myJob.reduce((acc, job) => {
            if (job?.jobproduct?.userProductId) {
                const userProductIdString = job.jobproduct.userProductId.toString();
                let matchedData = requestDataMap.get(userProductIdString);

                if (matchedData) {
                    acc.push({
                        ...job,
                        matchedProductForm: matchedData
                    });
                }
            }
            return acc;
        }, []);
        // corrected code
        let filteredMergedjob = mergeMyJob.filter((data) =>
            data.jobproducts.some((jp) => jp.jobStatus === "completed")
        );


        let isLast = false;
        if (requestsObject.query.stageId == 4) {
            isLast = filteredMergedjob.map((data) => {

                if (data.reportType == "separated") {
                    return true;
                }

                let filterData = data.jobproducts.filter((jData) => {
                    return jData.jobStatus !== "submitted";
                });

                // Check if there are any filtered jobs and the last one is completed
                return filterData.length > 0 && filterData[filterData.length - 1].jobStatus == "completed";
            });
        }



        // Now map through mergedJobData and add corresponding isLast value
        mergedJobData = mergedJobData.map((job, index) => {
            return {
                ...job,
                isLast: isLast[index] // Add the corresponding isLast value
            };
        });


        const partnerId = requestsObject.query.partnerId;
        const filterType = requestsObject.query.dateFilter; // 'today', 'thisweek', 'thismonth', or 'custom'
        const startDateParam = requestsObject.query.startDate;
        const endDateParam = requestsObject.query.endDate;

        let startDate, endDate;

        // Handle date filters
        switch (filterType) {
            case 'today':
                startDate = moment().startOf('day').toDate();
                endDate = moment().endOf('day').toDate();
                break;
            case 'thisweek':
                startDate = moment().startOf('week').toDate();
                endDate = moment().endOf('week').toDate();
                break;
            case 'thismonth':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                break;
            case 'custom':
                if (startDateParam && endDateParam) {
                    startDate = moment(startDateParam).startOf('day').toDate();
                    endDate = moment(endDateParam).endOf('day').toDate();
                }
                break;
        }

        // Apply filters only if any filtering is needed
        if (filterType || partnerId) {
            const filteredItems = mergedJobData.filter(item => {
                let match = true;

                // Partner ID match
                if (partnerId) {
                    match = match && item.creatorId?._id?.toString() === partnerId;
                }


                // Date range match
                if (startDate && endDate) {
                    const createdAt = new Date(item.createdAt);

                    match = match && createdAt >= startDate && createdAt <= endDate;
                }

                return match;
            });

            return returnFormatter(true, JobSuccessMessage, filteredItems);
        }


        return returnFormatter(true, JobSuccessMessage, mergedJobData);


    } catch (error) {
        console.error("Error in getJobByPartnerId:", error);
        return returnFormatter(false, error.message);
    }
}


//----------------------------- copy for all pending for dashboard count ---------------------
//--------------------- copy for all completed -----------------------
export async function getAcceptedJobByPartnerIdPending(requestsObject) {
    try {
        // Set default stageId to 4 if not provided
        const stageId = 2;

        // Determine match condition
        let matchCondition = {
            [requestsObject.user.role === "emp_admin" ? "partnerId" : "allocationId"]:
                new mongoose.Types.ObjectId(
                    requestsObject.user.role === "emp_admin"
                        ? requestsObject.user.serviceId
                        : requestsObject.user.empId
                )
        };

        // Determine jobStatus filter based on stageId
        let jobStatusFilter = {};
        if (stageId === 2) {
            // For stageId 4, we only care about the completed status
            jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending"] } };
        } else {
            // Default if other stageId provided
            jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
        }
        const myJob = await jobModel.aggregate([
            { $match: { ...matchCondition, isAccepted: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorId",
                },
            },
            { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "creatorId._id",
                    foreignField: "serviceId",
                    as: "creatorCompany",
                },
            },
            { $unwind: { path: "$creatorCompany", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partnerId",
                },
            },
            { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproduct",
                },
            },
            { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
            { $match: jobStatusFilter },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproduct.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "services",
                    localField: "userProducts.referId",
                    foreignField: "_id",
                    as: "services",
                },
            },
            { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },

        ]);



        let mergeMyJob = await jobModel.aggregate([
            { $match: { ...matchCondition, isAccepted: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "allUserProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        userProduct: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allUserProducts",
                                                        as: "userProduct",
                                                        cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "allUserProducts.productId",
                    foreignField: "_id",
                    as: "allProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allProducts",
                                                        as: "product",
                                                        cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Lookup employee details
            {
                $lookup: {
                    from: "employees",
                    localField: "jobproducts.employeeId",
                    foreignField: "_id",
                    as: "allEmployees",
                },
            },
            // Add employee details to jobproducts
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        employee: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allEmployees",
                                                        as: "employee",
                                                        cond: { $eq: ["$$employee._id", "$$jobproduct.employeeId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    allUserProducts: 0,
                    allProducts: 0,
                    allEmployees: 0
                }
            }
        ]);


        // Check if myJob has any results
        if (!myJob || myJob.length === 0) {
            return returnFormatter(true, "No jobs found", []);
        }
        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );



        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        // Create a Map to store userProductId mapping
        let requestDataMap = new Map();

        // Iterate over requestDataArray and populate requestDataMap
        requestDataArray.forEach(requestData => {
            if (requestData?.productForm && Array.isArray(requestData.productForm)) {
                requestData.productForm.forEach(item => {
                    if (item?.userProductId) {
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Merge job data with matched product form and filter out unmatched jobs
        let mergedJobData = myJob.reduce((acc, job) => {
            if (job?.jobproduct?.userProductId) {
                const userProductIdString = job.jobproduct.userProductId.toString();
                let matchedData = requestDataMap.get(userProductIdString);

                if (matchedData) {
                    acc.push({
                        ...job,
                        matchedProductForm: matchedData
                    });
                }
            }
            return acc;
        }, []);
        // corrected code
        let filteredMergedjob = mergeMyJob.filter((data) =>
            data.jobproducts.some((jp) => jp.jobStatus === "completed")
        );


        let isLast = false;
        if (requestsObject.query.stageId == 4) {
            isLast = filteredMergedjob.map((data) => {

                if (data.reportType == "separated") {
                    return true;
                }

                let filterData = data.jobproducts.filter((jData) => {
                    return jData.jobStatus !== "submitted";
                });

                // Check if there are any filtered jobs and the last one is completed
                return filterData.length > 0 && filterData[filterData.length - 1].jobStatus == "completed";
            });
        }



        // Now map through mergedJobData and add corresponding isLast value
        mergedJobData = mergedJobData.map((job, index) => {
            return {
                ...job,
                isLast: isLast[index] // Add the corresponding isLast value
            };
        });


        const partnerId = requestsObject.query.partnerId;
        const filterType = requestsObject.query.dateFilter; // 'today', 'thisweek', 'thismonth', or 'custom'
        const startDateParam = requestsObject.query.startDate;
        const endDateParam = requestsObject.query.endDate;

        let startDate, endDate;

        // Handle date filters
        switch (filterType) {
            case 'today':
                startDate = moment().startOf('day').toDate();
                endDate = moment().endOf('day').toDate();
                break;
            case 'thisweek':
                startDate = moment().startOf('week').toDate();
                endDate = moment().endOf('week').toDate();
                break;
            case 'thismonth':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                break;
            case 'custom':
                if (startDateParam && endDateParam) {
                    startDate = moment(startDateParam).startOf('day').toDate();
                    endDate = moment(endDateParam).endOf('day').toDate();
                }
                break;
        }

        // Apply filters only if any filtering is needed
        if (filterType || partnerId) {
            const filteredItems = mergedJobData.filter(item => {
                let match = true;

                // Partner ID match
                if (partnerId) {
                    match = match && item.creatorId?._id?.toString() === partnerId;
                }


                // Date range match
                if (startDate && endDate) {
                    const createdAt = new Date(item.createdAt);

                    match = match && createdAt >= startDate && createdAt <= endDate;
                }

                return match;
            });

            return returnFormatter(true, JobSuccessMessage, filteredItems);
        }


        return returnFormatter(true, JobSuccessMessage, mergedJobData);


    } catch (error) {
        console.error("Error in getJobByPartnerId:", error);
        return returnFormatter(false, error.message);
    }
}




// --------------------- get Job by  partnerId -----------------------
export async function getJobByPartnerId(requestsObject) {
    try {
        let matchCondition = {
            partnerId: new mongoose.Types.ObjectId(requestsObject.user.serviceId)
        };

        // Check stageId from query params
        if (requestsObject.query.stageId) {
            if (Number(requestsObject.query.stageId) === 3) {
                return returnFormatter(false, "This stageId not allowed");
            }

            // Special handling for stageId 4 - don't add it to matchCondition
            // so we can include stageId 3 records too
            if (Number(requestsObject.query.stageId) !== 4) {
                matchCondition.stageId = Number(requestsObject.query.stageId);
            } else {
                // For stageId 4, we want to match both stageId 3 and 4
                matchCondition.$or = [
                    { stageId: 3 },
                    { stageId: 4 }
                ];
            }
        }

        // Determine jobStatus filter based on query stageId
        let jobStatusFilter = {};
        if (requestsObject.query.stageId) {
            if (Number(requestsObject.query.stageId) === 2) {
                jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending"] } };
            } else if (Number(requestsObject.query.stageId) === 4) {
                // For stageId 4, we only care about the completed status
                jobStatusFilter = { "jobproduct.jobStatus": "completed" };
            } else {
                jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
            }
        } else {
            // Default if no stageId provided
            jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
        }
        const myJob = await jobModel.aggregate([
            { $match: matchCondition },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorId",
                },
            },
            { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partnerId",
                },
            },
            { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproduct",
                },
            },
            { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
            // { $match: jobStatusFilter },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproduct.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },

        ]);

        // Check if myJob has any results
        if (!myJob || myJob.length === 0) {
            return returnFormatter(true, "No jobs found", []);
        }



        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );



        let requestDataMap = new Map();

        requestDataArray.forEach(requestData => {
            if (requestData && requestData.productForm && Array.isArray(requestData.productForm)) {
                requestData.productForm.forEach(item => {
                    if (item?.userProductId) {
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        let mergedJobData = myJob.map(job => {
            if (job.jobproduct?.userProductId) {
                const userProductIdString = job.jobproduct.userProductId.toString();
                let matchedData = requestDataMap.get(userProductIdString);

                if (matchedData) {
                    return {
                        ...job,
                        matchedProductForm: matchedData
                    };
                }
            }
            return job;
        });



        return returnFormatter(true, JobSuccessMessage, mergedJobData);
    } catch (error) {
        console.error("Error in getJobByPartnerId:", error);
        return returnFormatter(false, error.message);
    }
}



// --------------------- get all allocated Job -----------------------
export async function getAllAllocated(requestsObject) {
    try {
        let matchCondition = {
            allocationId: new mongoose.Types.ObjectId(requestsObject.user.empId)
        };


        // Check stageId from query params
        if (requestsObject.query.stageId) {
            if (Number(requestsObject.query.stageId) === 3) {
                return returnFormatter(false, "This stageId not allowed");
            }

            // Special handling for stageId 4 - don't add it to matchCondition
            // so we can include stageId 3 records too
            if (Number(requestsObject.query.stageId) !== 4) {
                matchCondition.stageId = Number(requestsObject.query.stageId);
            } else {
                // For stageId 4, we want to match both stageId 3 and 4
                matchCondition.$or = [
                    { stageId: 2 },
                    { stageId: 3 },
                    { stageId: 4 }
                ];
            }
        }

        // Determine jobStatus filter based on query stageId
        let jobStatusFilter = {};
        if (requestsObject.query.stageId) {
            if (Number(requestsObject.query.stageId) === 2) {
                jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending"] } };
            }
            else {
                jobStatusFilter = { "jobproduct.jobStatus": { $in: ["allocated"] } };
            }
        } else {
            // Default if no stageId provided
            jobStatusFilter = { "jobproduct.jobStatus": { $in: ["allocated"] } };
        }

        const myJob = await jobModel.aggregate([
            { $match: { ...matchCondition, isAccepted: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorId",
                },
            },
            { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partnerId",
                },
            },
            { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproduct",
                },
            },
            { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },

            { $match: jobStatusFilter },
            // Fixed syntax error in the match condition
            { $match: { "jobproduct.employeeId": { $ne: "" } } },
            {
                $lookup: {
                    from: "employees",
                    localField: "jobproduct.employeeId",
                    foreignField: "_id",
                    as: "employeeId",
                },
            },
            { $unwind: { path: "$employeeId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproduct.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "services",
                    localField: "userProducts.referId",
                    foreignField: "_id",
                    as: "services",
                },
            },
            { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
        ]);

        let mergeMyJob = await jobModel.aggregate([
            { $match: { ...matchCondition, isAccepted: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "allUserProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        userProduct: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allUserProducts",
                                                        as: "userProduct",
                                                        cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "allUserProducts.productId",
                    foreignField: "_id",
                    as: "allProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allProducts",
                                                        as: "product",
                                                        cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Lookup employee details
            {
                $lookup: {
                    from: "employees",
                    localField: "jobproducts.employeeId",
                    foreignField: "_id",
                    as: "allEmployees",
                },
            },
            // Add employee details to jobproducts
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        employee: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allEmployees",
                                                        as: "employee",
                                                        cond: { $eq: ["$$employee._id", "$$jobproduct.employeeId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    allUserProducts: 0,
                    allProducts: 0,
                    allEmployees: 0,
                }
            }
        ]);

        // Check if myJob has any results
        if (!myJob || myJob.length === 0) {
            return returnFormatter(true, "No jobs found", []);
        }

        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );

        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        // Create a Map to store userProductId mapping
        let requestDataMap = new Map();

        // Iterate over requestDataArray and populate requestDataMap
        requestDataArray.forEach(requestData => {

            if (requestData?.productForm && Array.isArray(requestData.productForm)) {
                requestData.productForm.forEach(item => {
                    if (item?.userProductId) {
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Merge job data with matched product form and filter out unmatched jobs
        let mergedJobData = myJob.reduce((acc, job) => {
            if (job?.jobproduct?.userProductId) {

                const userProductIdString = job.jobproduct.userProductId.toString();

                let matchedData = requestDataMap.get(userProductIdString);

                if (matchedData) {
                    acc.push({
                        ...job,
                        matchedProductForm: matchedData
                    });
                }
            }
            return acc;
        }, []);

        mergedJobData = await Promise.all(
            mergedJobData.map(async (data) => {
                const intFields = await initModel.findOne({ jobId: data.jobproduct.jobId });

                return {
                    ...data,
                    fileNo: intFields?.fileNo || null,
                    customerName: intFields?.customerName || null,
                    fatherName: intFields?.fatherName || null,
                    phoneNo: intFields?.contactNo || null,
                    address: intFields?.address || null
                };
            })
        );


        const partnerId = requestsObject.query.partnerId;
        const filterType = requestsObject.query.dateFilter; // 'today', 'thisweek', 'thismonth', or 'custom'
        const startDateParam = requestsObject.query.startDate;
        const endDateParam = requestsObject.query.endDate;

        let startDate, endDate;

        // Handle date filters
        switch (filterType) {
            case 'today':
                startDate = moment().startOf('day').toDate();
                endDate = moment().endOf('day').toDate();
                break;
            case 'thisweek':
                startDate = moment().startOf('week').toDate();
                endDate = moment().endOf('week').toDate();
                break;
            case 'thismonth':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                break;
            case 'custom':
                if (startDateParam && endDateParam) {
                    startDate = moment(startDateParam).startOf('day').toDate();
                    endDate = moment(endDateParam).endOf('day').toDate();
                }
                break;
        }

        // Apply filters only if any filtering is needed
        if (filterType || partnerId) {
            const filteredItems = mergedJobData.filter(item => {
                let match = true;

                // Partner ID match
                if (partnerId) {
                    match = match && item.creatorId?._id?.toString() === partnerId;
                }


                // Date range match
                if (startDate && endDate) {
                    const createdAt = new Date(item.createdAt);

                    match = match && createdAt >= startDate && createdAt <= endDate;
                }

                return match;
            });

            return returnFormatter(true, JobSuccessMessage, filteredItems);
        }

        // No filtering, return all data
        return returnFormatter(true, JobSuccessMessage, mergedJobData);

    } catch (error) {
        console.error("Error in getAllAllocated:", error);
        return returnFormatter(false, error.message);
    }
}

// ----------------------------- get allocation pending jobs ---------------------------------
export async function getPendingJobByPartnerId(requestsObject) {
    try {
        let matchCondition = {
            [requestsObject.user.role === "admin" ? "partnerId" : "allocationId"]:
                new mongoose.Types.ObjectId(
                    requestsObject.user.role === "admin" ? requestsObject.user.serviceId : requestsObject.user.empId
                )
        };


        // Check stageId from query params
        if (requestsObject.query.stageId) {
            if (Number(requestsObject.query.stageId) === 3) {
                return returnFormatter(false, "This stageId not allowed");
            }

            // Special handling for stageId 4 - don't add it to matchCondition
            // so we can include stageId 3 records too
            if (Number(requestsObject.query.stageId) !== 4) {
                matchCondition.stageId = Number(requestsObject.query.stageId);
            } else {
                // For stageId 4, we want to match both stageId 3 and 4
                matchCondition.$or = [
                    { stageId: 3 },
                    { stageId: 4 }
                ];
            }
        }

        // Determine jobStatus filter based on query stageId
        let jobStatusFilter = {};
        if (requestsObject.query.stageId) {
            if (Number(requestsObject.query.stageId) === 2) {
                jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending"] } };
            } else if (Number(requestsObject.query.stageId) === 4) {
                // For stageId 4, we only care about the completed status
                jobStatusFilter = { "jobproduct.jobStatus": "completed" };
            } else {
                jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
            }
        } else {
            // Default if no stageId provided
            jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
        }
        const myJob = await jobModel.aggregate([
            { $match: { isAccepted: false } },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorId",
                },
            },
            { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partnerId",
                },
            },
            { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproduct",
                },
            },
            { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
            { $match: jobStatusFilter },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproduct.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "services",
                    localField: "userProducts.referId",
                    foreignField: "_id",
                    as: "services",
                },
            },
            { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },

        ]);



        // Check if myJob has any results
        if (!myJob || myJob.length === 0) {
            return returnFormatter(true, "No jobs found", []);
        }
        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                return partnerRequestModel.findOne({
                    $or: [
                        { senderId: data?.creatorId, receiverId: data?.partnerId },
                        { senderId: data?.partnerId, receiverId: data?.creatorId }
                    ]
                });
            })
        );

        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        if (requestDataArray.length === 0) {
            return returnFormatter(true, JobSuccessMessage, []);
        }

        let filterReqData = [];

        // Iterate over requestDataArray
        for (let requestData of requestDataArray) {
            if (Array.isArray(requestData.allocationId)) {
                for (let i = 0; i < requestData.allocationId.length; i++) {
                    if (String(requestData.allocationId[i]) === String(requestsObject.user.empId)) {
                        filterReqData.push(requestData); // Push the matched data
                    }
                }
            }
        }

        // Ensure filterReqData is not empty
        if (filterReqData.length === 0) {
            return returnFormatter(true, JobSuccessMessage, []);
        }

        // Create a Map to store userProductId mapping
        let requestDataMap = new Map();

        // Iterate over filterReqData, as it's an array
        filterReqData.forEach(req => {
            if (req.productForm && Array.isArray(req.productForm)) {
                req.productForm.forEach(item => {
                    if (item?.userProductId) {
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Check if requestDataMap is empty
        if (requestDataMap.size === 0) {
            return returnFormatter(true, JobSuccessMessage, []);
        }

        // Merge job data with matched product form and filter out unmatched jobs
        let mergedJobData = myJob.reduce((acc, job) => {
            let userProductIdString = job?.jobproduct?.userProductId?.toString();
            if (userProductIdString) {
                let matchedData = requestDataMap.get(userProductIdString);
                if (matchedData) {
                    acc.push({
                        ...job,
                        matchedProductForm: matchedData
                    });
                }
            }
            return acc;
        }, []);


        // Step 2: Fetch and merge initModel data for each job
        mergedJobData = await Promise.all(
            mergedJobData.map(async (data) => {
                const intFields = await initModel.findOne({ jobId: data.jobproduct.jobId });
                let initaedBy = await employeeModel.findById(intFields.allocatedEmp)
                return {
                    ...data,
                    fileNo: intFields?.fileNo || null,
                    customerName: intFields?.customerName || null,
                    fatherName: intFields?.fatherName || null,
                    phoneNo: intFields?.contactNo || null,
                    address: intFields?.address || null,
                    initaedBy: initaedBy
                };
            })
        );


        const partnerId = requestsObject.query.partnerId;
        const filterType = requestsObject.query.dateFilter; // 'today', 'thisweek', 'thismonth', or 'custom'
        const startDateParam = requestsObject.query.startDate;
        const endDateParam = requestsObject.query.endDate;

        let startDate, endDate;

        // Handle date filters
        switch (filterType) {
            case 'today':
                startDate = moment().startOf('day').toDate();
                endDate = moment().endOf('day').toDate();
                break;
            case 'thisweek':
                startDate = moment().startOf('week').toDate();
                endDate = moment().endOf('week').toDate();
                break;
            case 'thismonth':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                break;
            case 'custom':
                if (startDateParam && endDateParam) {
                    startDate = moment(startDateParam).startOf('day').toDate();
                    endDate = moment(endDateParam).endOf('day').toDate();
                }
                break;
        }

        // Apply filters only if any filtering is needed
        if (filterType || partnerId) {
            const filteredItems = mergedJobData.filter(item => {
                let match = true;

                // Partner ID match
                if (partnerId) {
                    match = match && item.creatorId?._id?.toString() === partnerId;
                }


                // Date range match
                if (startDate && endDate) {
                    const createdAt = new Date(item.createdAt);

                    match = match && createdAt >= startDate && createdAt <= endDate;
                }

                return match;
            });

            return returnFormatter(true, JobSuccessMessage, filteredItems);
        }


        return returnFormatter(true, JobSuccessMessage, mergedJobData);
    } catch (error) {
        console.error("Error in getJobByPartnerId:", error);
        return returnFormatter(false, error.message);
    }
}

// merge

// export async function getPendingJobByPartnerId(requestsObject) {
//     try {
//         // Set the base match condition based on user role
//         let matchCondition = {
//             [requestsObject.user.role === "emp_admin" ? "partnerId" : "allocationId"]:
//                 new mongoose.Types.ObjectId(
//                     requestsObject.user.role === "emp_admin" ? requestsObject.user.serviceId : requestsObject.user.empId
//                 )
//         };

//         // Check stageId from query params
//         if (requestsObject.query.stageId) {
//             if (Number(requestsObject.query.stageId) === 3) {
//                 return returnFormatter(false, "This stageId not allowed");
//             }

//             // Special handling for stageId 4 - don't add it to matchCondition
//             // so we can include stageId 3 records too
//             if (Number(requestsObject.query.stageId) !== 4) {
//                 matchCondition.stageId = Number(requestsObject.query.stageId);
//             } else {
//                 // For stageId 4, we want to match both stageId 3 and 4
//                 matchCondition.$or = [
//                     { stageId: 3 },
//                     { stageId: 4 },
//                     { stageId: 2 }
//                 ];
//             }
//         }

//         // Determine jobStatus filter based on query stageId
//         let statusValues = ["pending", "allocated", "completed"];
//         if (requestsObject.query.stageId) {
//             if (Number(requestsObject.query.stageId) === 2) {
//                 statusValues = ["pending"];
//             } else if (Number(requestsObject.query.stageId) === 4) {
//                 statusValues = ["completed"];
//             }
//         }



//         const myJob = await jobModel.aggregate([
//             { $match: {...matchCondition,isAccepted:false} },

//             // Lookup creator details
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "creatorId",
//                     foreignField: "_id",
//                     as: "creatorId",
//                 },
//             },
//             { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },

//             // Lookup partner details
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "partnerId",
//                     foreignField: "_id",
//                     as: "partnerId",
//                 },
//             },
//             { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },

//             // Lookup creator company details
//             {
//                 $lookup: {
//                     from: "companies",
//                     localField: "creatorId._id",
//                     foreignField: "serviceId",
//                     as: "creatorCompany",
//                 },
//             },
//             { $unwind: { path: "$creatorCompany", preserveNullAndEmptyArrays: true } },

//             // Lookup jobproduct details
//             {
//                 $lookup: {
//                     from: "jobproducts",
//                     localField: "_id",
//                     foreignField: "jobId",
//                     as: "jobproduct",
//                 },
//             },
//             { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },

//             // Filter by job status
//             {
//                 $match: {
//                     "jobproduct.jobStatus": { $in: statusValues }
//                 }
//             },

//             // Lookup allocated employee details
//             {
//                 $lookup: {
//                     from: "employees",
//                     localField: "allocationId",
//                     foreignField: "_id",
//                     as: "alloctedEmp",
//                 },
//             },
//             { $unwind: { path: "$alloctedEmp", preserveNullAndEmptyArrays: true } },

//             // Lookup user products
//             {
//                 $lookup: {
//                     from: "userproducts",
//                     localField: "jobproduct.userProductId",
//                     foreignField: "_id",
//                     as: "userProducts",
//                 },
//             },
//             { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },

//             // Lookup services
//             {
//                 $lookup: {
//                     from: "services",
//                     localField: "userProducts.referId",
//                     foreignField: "_id",
//                     as: "services",
//                 },
//             },
//             { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },

//             // Add additional fields from init values
//             {
//                 $addFields: {
//                     fileNo: { $arrayElemAt: ["$jobproduct.initValues", 2] },
//                     customerName: { $arrayElemAt: ["$jobproduct.initValues", 3] },
//                     fatherName: { $arrayElemAt: ["$jobproduct.initValues", 4] },
//                     phoneNo: { $arrayElemAt: ["$jobproduct.initValues", 5] },
//                     address: { $arrayElemAt: ["$jobproduct.initValues", 6] }
//                 }
//             }
//         ]);

//         console.log(myJob.length);

//         // Check if myJob has any results
//         if (!myJob || myJob.length === 0) {
//             return returnFormatter(true, "No jobs found", []);
//         }

//         // Find the request data and add matchedProductForm
//         let requestDataArray = await Promise.all(
//             myJob.map(async (data) => {
//                 let requestData = await partnerRequestModel.aggregate([
//                     {
//                         $match: {
//                             $or: [
//                                 { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
//                                 { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
//                             ]
//                         }
//                     },
//                     {
//                         $lookup: {
//                             from: "users",
//                             localField: "receiverId",
//                             foreignField: "_id",
//                             as: "partner"
//                         }
//                     },
//                     { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
//                     {
//                         $lookup: {
//                             from: "companies",
//                             localField: "partner._id",
//                             foreignField: "serviceId",
//                             as: "company"
//                         }
//                     },
//                     { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
//                     {
//                         $unwind: {
//                             path: '$productForm',
//                             preserveNullAndEmptyArrays: true
//                         }
//                     },
//                     {
//                         $lookup: {
//                             from: 'forms',
//                             let: {
//                                 allFields: {
//                                     $setUnion: [
//                                         '$productForm.initFields.fields',
//                                         '$productForm.allocationFields.fields',
//                                         '$productForm.agentFields.fields',
//                                         '$productForm.submitFields.fields'
//                                     ]
//                                 }
//                             },
//                             pipeline: [
//                                 {
//                                     $match: {
//                                         $expr: { $in: ['$_id', '$$allFields'] }
//                                     }
//                                 },
//                                 {
//                                     $project: {
//                                         _id: 1,
//                                         fieldName: 1,
//                                         dataType: 1
//                                     }
//                                 }
//                             ],
//                             as: 'formFields'
//                         }
//                     },
//                     {
//                         $addFields: {
//                             'productForm.initFields.fields': {
//                                 $map: {
//                                     input: '$productForm.initFields.fields',
//                                     as: 'fieldId',
//                                     in: {
//                                         $let: {
//                                             vars: {
//                                                 fieldObj: {
//                                                     $arrayElemAt: [
//                                                         {
//                                                             $filter: {
//                                                                 input: '$formFields',
//                                                                 as: 'form',
//                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
//                                                             }
//                                                         }, 0
//                                                     ]
//                                                 }
//                                             },
//                                             in: {
//                                                 fieldName: '$$fieldObj.fieldName',
//                                                 dataType: '$$fieldObj.dataType'
//                                             }
//                                         }
//                                     }
//                                 }
//                             },
//                             'productForm.allocationFields.fields': {
//                                 $map: {
//                                     input: '$productForm.allocationFields.fields',
//                                     as: 'fieldId',
//                                     in: {
//                                         $let: {
//                                             vars: {
//                                                 fieldObj: {
//                                                     $arrayElemAt: [
//                                                         {
//                                                             $filter: {
//                                                                 input: '$formFields',
//                                                                 as: 'form',
//                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
//                                                             }
//                                                         }, 0
//                                                     ]
//                                                 }
//                                             },
//                                             in: {
//                                                 fieldName: '$$fieldObj.fieldName',
//                                                 dataType: '$$fieldObj.dataType'
//                                             }
//                                         }
//                                     }
//                                 }
//                             },
//                             'productForm.agentFields.fields': {
//                                 $map: {
//                                     input: '$productForm.agentFields.fields',
//                                     as: 'fieldId',
//                                     in: {
//                                         $let: {
//                                             vars: {
//                                                 fieldObj: {
//                                                     $arrayElemAt: [
//                                                         {
//                                                             $filter: {
//                                                                 input: '$formFields',
//                                                                 as: 'form',
//                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
//                                                             }
//                                                         }, 0
//                                                     ]
//                                                 }
//                                             },
//                                             in: {
//                                                 fieldName: '$$fieldObj.fieldName',
//                                                 dataType: '$$fieldObj.dataType'
//                                             }
//                                         }
//                                     }
//                                 }
//                             },
//                             'productForm.submitFields.fields': {
//                                 $map: {
//                                     input: '$productForm.submitFields.fields',
//                                     as: 'fieldId',
//                                     in: {
//                                         $let: {
//                                             vars: {
//                                                 fieldObj: {
//                                                     $arrayElemAt: [
//                                                         {
//                                                             $filter: {
//                                                                 input: '$formFields',
//                                                                 as: 'form',
//                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
//                                                             }
//                                                         }, 0
//                                                     ]
//                                                 }
//                                             },
//                                             in: {
//                                                 fieldName: '$$fieldObj.fieldName',
//                                                 dataType: '$$fieldObj.dataType'
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     },
//                     {
//                         $group: {
//                             _id: '$_id',
//                             doc: { $first: '$$ROOT' },
//                             productForms: { $push: '$productForm' }
//                         }
//                     },
//                     {
//                         $addFields: {
//                             'doc.productForm': '$productForms'
//                         }
//                     },
//                     {
//                         $replaceRoot: {
//                             newRoot: '$doc'
//                         }
//                     }
//                 ])
//                 .sort({ createdAt: -1 });

//                 // Find matching product form for this job
//                 let matchedProductForm = null;
//                 if (requestData.length > 0 && requestData[0].productForm) {
//                     const matchingForm = requestData[0].productForm.find(form => 
//                         form.userProductId && form.userProductId.toString() === data.userProducts._id.toString()
//                     );
//                     if (matchingForm) {
//                         matchedProductForm = matchingForm;
//                     }
//                 }

//                 // Add matchedProductForm to the job data
//                 return {
//                     ...data,
//                     matchedProductForm: matchedProductForm
//                 };
//             })
//         );

//         // Filter out jobs without matching product forms
//         requestDataArray = requestDataArray.filter(data => data.matchedProductForm !== null);

//         if (requestDataArray.length === 0) {
//             return returnFormatter(true, JobSuccessMessage, []);
//         }

//         // Apply additional filters
//         const partnerId = requestsObject.query.partnerId;
//         const filterType = requestsObject.query.dateFilter; // 'today', 'thisweek', 'thismonth', or 'custom'
//         const startDateParam = requestsObject.query.startDate;
//         const endDateParam = requestsObject.query.endDate;

//         let startDate, endDate;

//         // Handle date filters
//         switch (filterType) {
//             case 'today':
//                 startDate = moment().startOf('day').toDate();
//                 endDate = moment().endOf('day').toDate();
//                 break;
//             case 'thisweek':
//                 startDate = moment().startOf('week').toDate();
//                 endDate = moment().endOf('week').toDate();
//                 break;
//             case 'thismonth':
//                 startDate = moment().startOf('month').toDate();
//                 endDate = moment().endOf('month').toDate();
//                 break;
//             case 'custom':
//                 if (startDateParam && endDateParam) {
//                     startDate = moment(startDateParam).startOf('day').toDate();
//                     endDate = moment(endDateParam).endOf('day').toDate();
//                 }
//                 break;
//         }

//         // Apply filters only if any filtering is needed
//         if (filterType || partnerId) {
//             const filteredItems = requestDataArray.filter(item => {
//                 let match = true;

//                 // Partner ID match
//                 if (partnerId) {
//                     match = match && item.creatorId?._id?.toString() === partnerId;
//                 }

//                 // Date range match
//                 if (startDate && endDate) {
//                     const createdAt = new Date(item.createdAt);
//                     match = match && createdAt >= startDate && createdAt <= endDate;
//                 }

//                 return match;
//             });

//             return returnFormatter(true, JobSuccessMessage, filteredItems);
//         }

//         // No filtering, return all data
//         return returnFormatter(true, JobSuccessMessage, requestDataArray);

//     } catch (error) {
//         console.error("Error in getPendingJobByPartnerId:", error);
//         return returnFormatter(false, error.message);
//     }
// }
// --------------------- get completed Job by  employeeId -----------------------

export async function getCompletedJobByEmpId(requestsObject) {
    try {
        let empId = requestsObject.user.empId;
        let empObjectId = new mongoose.Types.ObjectId(empId);

        let myJob = await jobModel.aggregate([
            {
                $match: {
                    stageId: { $in: [2, 3, 4, 5] } // Corrected to use $in for multiple values
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            {
                $unwind: {
                    path: "$creator",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            {
                $unwind: {
                    path: "$partner",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            {
                $unwind: {
                    path: "$jobproducts",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    "jobproducts.employeeId": empObjectId,
                    "jobproducts.isAccepted": true, // Ensure jobStatus is allocated
                },
            },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            {
                $unwind: {
                    path: "$userProducts",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
        ]);
        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );

        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        // Create a Map for easier lookup of product form items
        let requestDataMap = new Map();
        requestDataArray.forEach(requestData => {
            if (requestData?.productForm && Array.isArray(requestData.productForm)) {
                requestData.productForm.forEach(item => {
                    if (item?.userProductId) {
                        // Convert ObjectId to string for proper comparison
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Merge requestData fields into jobData if userProductId matches
        let mergedJobData = myJob.reduce((acc, job) => {
            if (job?.jobproducts?.userProductId) {
                // Convert ObjectId to string for proper comparison
                const userProductIdString = job.jobproducts.userProductId.toString();
                let matchedData = requestDataMap.get(userProductIdString);

                if (matchedData) {
                    // Include only jobs that have a match
                    acc.push({
                        ...job,
                        matchedProductForm: matchedData  // Adding matched data
                    });
                }
            }
            return acc;
        }, []);




        return returnFormatter(true, "Jobs fetched successfully", mergedJobData);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return returnFormatter(false, error.message);
    }
}


// --------------------- get Job by  employeeId -----------------------

export async function getJobByEmpId(requestsObject) {
    try {
        let empId = requestsObject.user.empId;
        let empObjectId = new mongoose.Types.ObjectId(empId);

        let myJob = await jobModel.aggregate([
            {
                $match: {
                    stageId: { $in: [2, 3, 4] } // Corrected to use $in for multiple values
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            {
                $unwind: {
                    path: "$creator",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            {
                $unwind: {
                    path: "$partner",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            {
                $unwind: {
                    path: "$jobproducts",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    "jobproducts.employeeId": empObjectId,
                    "jobproducts.jobStatus": "allocated", // Ensure jobStatus is allocated
                    "jobproducts.isAccepted": true, // Ensure jobStatus is allocated
                },
            },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            {
                $unwind: {
                    path: "$userProducts",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
        ]);
        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );

        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        // Create a Map for easier lookup of product form items
        let requestDataMap = new Map();
        requestDataArray.forEach(requestData => {
            if (requestData?.productForm && Array.isArray(requestData.productForm)) {
                requestData.productForm.forEach(item => {
                    if (item?.userProductId) {
                        // Convert ObjectId to string for proper comparison
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Merge requestData fields into jobData if userProductId matches
        let mergedJobData = myJob.reduce((acc, job) => {
            if (job?.jobproducts?.userProductId) {
                // Convert ObjectId to string for proper comparison
                const userProductIdString = job.jobproducts.userProductId.toString();
                let matchedData = requestDataMap.get(userProductIdString);

                if (matchedData) {
                    // Include only jobs that have a match
                    acc.push({
                        ...job,
                        matchedProductForm: matchedData  // Adding matched data
                    });
                }
            }
            return acc;
        }, []);




        return returnFormatter(true, "Jobs fetched successfully", mergedJobData);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return returnFormatter(false, error.message);
    }
}


// --------------------- get pending Job by  employeeId -----------------------

export async function getPendingJobByEmpId(requestsObject) {
    try {
        let empId = requestsObject.user.empId;

        let empObjectId = new mongoose.Types.ObjectId(empId);

        let myJob = await jobModel.aggregate([
            {
                $match: {
                    stageId: { $in: [2, 3, 4] } // Corrected to use $in for multiple values
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            {
                $unwind: {
                    path: "$creator",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            {
                $unwind: {
                    path: "$partner",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            {
                $unwind: {
                    path: "$jobproducts",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    "jobproducts.autoALoocatedEmpId": { $in: [empObjectId] },
                    "jobproducts.jobStatus": "allocated", // Ensure jobStatus is allocated
                    "jobproducts.isAccepted": false, // Ensure jobStatus is allocated
                },
            },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "userProducts",
                },
            },
            {
                $unwind: {
                    path: "$userProducts",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "userProducts.productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
        ]);
        // Find the request data
        let requestDataArray = await Promise.all(
            myJob.map(async (data) => {
                let requestData = await partnerRequestModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
                                { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "receiverId", // Assuming receiver is the partner
                            foreignField: "_id",
                            as: "partner"
                        }
                    },
                    { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "companies",
                            localField: "partner._id",
                            foreignField: "serviceId",
                            as: "company"
                        }
                    },
                    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: '$productForm',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'forms',
                            let: {
                                allFields: {
                                    $setUnion: [
                                        '$productForm.initFields.fields',
                                        '$productForm.allocationFields.fields',
                                        '$productForm.agentFields.fields',
                                        '$productForm.submitFields.fields'
                                    ]
                                }
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $in: ['$_id', '$$allFields'] }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        fieldName: 1,
                                        dataType: 1
                                    }
                                }
                            ],
                            as: 'formFields'
                        }
                    },
                    {
                        $addFields: {
                            'productForm.initFields.fields': {
                                $map: {
                                    input: '$productForm.initFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.allocationFields.fields': {
                                $map: {
                                    input: '$productForm.allocationFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.agentFields.fields': {
                                $map: {
                                    input: '$productForm.agentFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            },
                            'productForm.submitFields.fields': {
                                $map: {
                                    input: '$productForm.submitFields.fields',
                                    as: 'fieldId',
                                    in: {
                                        $let: {
                                            vars: {
                                                fieldObj: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$formFields',
                                                                as: 'form',
                                                                cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                            }
                                                        }, 0
                                                    ]
                                                }
                                            },
                                            in: {
                                                fieldName: '$$fieldObj.fieldName',
                                                dataType: '$$fieldObj.dataType'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            doc: { $first: '$$ROOT' },
                            productForms: { $push: '$productForm' }
                        }
                    },
                    {
                        $addFields: {
                            'doc.productForm': '$productForms'
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$doc'
                        }
                    }
                ])
                    .sort({ createdAt: -1 });

                return requestData[0]; // return first result if aggregation gives array
            })
        );;

        // Filter out null results
        requestDataArray = requestDataArray.filter(data => data !== null);

        // Create a Map for easier lookup of product form items
        let requestDataMap = new Map();

        requestDataArray.forEach(requestData => {
            if (requestData?.productForm && Array.isArray(requestData.productForm)) {
                requestData.productForm.forEach(item => {
                    if (item?.userProductId) {
                        // Convert ObjectId to string for proper comparison
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });

        // Merge requestData fields into jobData if userProductId matches
        let mergedJobData = myJob.reduce((acc, job) => {
            if (job?.jobproducts?.userProductId) {
                // Convert ObjectId to string for proper comparison
                const userProductIdString = job.jobproducts.userProductId.toString();
                let matchedData = requestDataMap.get(userProductIdString);

                if (matchedData) {
                    // Include only jobs that have a match
                    acc.push({
                        ...job,
                        matchedProductForm: matchedData  // Adding matched data
                    });
                }
            }
            return acc;
        }, []);

        return returnFormatter(true, "Jobs fetched successfully", mergedJobData);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return returnFormatter(false, error.message);
    }
}


// --------------------- get Job by  partnerId -----------------------
// export async function getFinalJobs(requestsObject) {
//     try {


//         let myJob = await jobModel.aggregate([
//             {
//                 $match: {
//                     creatorId: new mongoose.Types.ObjectId(requestsObject.user.serviceId),
//                     stageId: 5 // Combined match condition
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "jobproducts",
//                     localField: "_id",
//                     foreignField: "jobId",
//                     as: "result"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$result",
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $sort: { createdAt: -1 } // Sorting inside aggregation
//             }
//         ]);

//         // Find the request data
//         let requestDataArray = await Promise.all(
//             myJob.map(async (data) => {
//                 return partnerRequestModel.findOne({
//                     $or: [
//                         { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
//                         { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
//                     ]
//                 });
//             })
//         );

//         // Filter out null results
//         requestDataArray = requestDataArray.filter(data => data !== null);

//         // Create a Map for easier lookup of product form items
//         let requestDataMap = new Map();

//         requestDataArray.forEach(requestData => {
//             if (requestData?.productForm && Array.isArray(requestData.productForm)) {
//                 requestData.productForm.forEach(item => {
//                     if (item?.userProductId) {
//                         // Convert ObjectId to string for proper comparison
//                         const idString = item.userProductId.toString();
//                         requestDataMap.set(idString, item);
//                     }
//                 });
//             }
//         });

//         // Merge requestData fields into jobData if userProductId matches
//         let mergedJobData = myJob.reduce((acc, job) => {
//             if (job?.result?.userProductId) {
//                 // Convert ObjectId to string for proper comparison
//                 const userProductIdString = job.result.userProductId.toString();
//                 let matchedData = requestDataMap.get(userProductIdString);

//                 if (matchedData) {
//                     // Include only jobs that have a match
//                     acc.push({
//                         ...job,
//                         matchedProductForm: matchedData  // Adding matched data
//                     });
//                 }
//             }
//             return acc;
//         }, []);

//         return returnFormatter(true, JobSuccessMessage, mergedJobData);

//     } catch (error) {
//         return returnFormatter(false, error.message);
//     }
// }

// merge
export async function getFinalJobs(requestsObject) {
    try {
        let matchCondition;

        if (requestsObject.user.role == "emp_admin") {
            matchCondition = {
                partnerId: new mongoose.Types.ObjectId(requestsObject.user.serviceId),
            }
        } else if (requestsObject.user.userType == "client") {
            matchCondition = {
                creatorId: new mongoose.Types.ObjectId(requestsObject.user.serviceId),
            }
        }
        else {
            matchCondition = {
                allocationId: new mongoose.Types.ObjectId(requestsObject.user.empId),
            }
        }

        let myJob = await jobModel.aggregate([
            {
                $match: matchCondition
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "allUserProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        userProduct: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allUserProducts",
                                                        as: "userProduct",
                                                        cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "allUserProducts.productId",
                    foreignField: "_id",
                    as: "allProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allProducts",
                                                        as: "product",
                                                        cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Lookup employee details
            {
                $lookup: {
                    from: "employees",
                    localField: "jobproducts.employeeId",
                    foreignField: "_id",
                    as: "allEmployees",
                },
            },
            // Add employee details to jobproducts
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        employee: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allEmployees",
                                                        as: "employee",
                                                        cond: { $eq: ["$$employee._id", "$$jobproduct.employeeId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Filter jobproducts based on reportType and stageId
            {
                $addFields: {
                    jobproducts: {
                        $cond: {
                            if: { $eq: ["$reportType", "separated"] },
                            then: {
                                $filter: {
                                    input: "$jobproducts",
                                    as: "jobproduct",
                                    cond: { $eq: ["$$jobproduct.jobStatus", "submitted"] }
                                }
                            },
                            else: {
                                $cond: {
                                    if: { $eq: ["$stageId", 5] },
                                    then: "$jobproducts",
                                    else: []
                                }
                            }
                        }
                    }
                }
            },
            // Filter out jobs with empty jobproducts array
            {
                $match: {
                    jobproducts: { $ne: [] }
                }
            },
            {
                $project: {
                    allUserProducts: 0,
                    allProducts: 0,
                    allEmployees: 0
                }
            }
        ]);

        return returnFormatter(true, "Jobs retrieved successfully", myJob);

    }
    //      try {
    //         let matchCondition = {
    //             [requestsObject.user.role === "emp_admin" ? "partnerId" : "allocationId"]:
    //                 new mongoose.Types.ObjectId(
    //                     requestsObject.user.role === "emp_admin" ? requestsObject.user.serviceId : requestsObject.user.empId
    //                 )
    //         };

    //         // Check stageId from query params


    //         // Determine jobStatus filter based on query stageId
    //         let jobStatusFilter = {"jobproduct.jobStatus": { $in: [ "submitted"]}};
    //         // if (requestsObject.query.stageId) {
    //         //     if (Number(requestsObject.query.stageId) === 2) {
    //         //         jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending"] } };
    //         //     } else if (Number(requestsObject.query.stageId) === 4) {
    //         //         // For stageId 4, we only care about the completed status
    //         //         jobStatusFilter = { "jobproduct.jobStatus": "completed" };
    //         //     } else {
    //         //         jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed",] } };
    //         //     }
    //         // } else {
    //         //     // Default if no stageId provided
    //         //     jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
    //         // }
    //         const myJob = await jobModel.aggregate([
    //             { $match: { ...matchCondition, isAccepted: true } },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "creatorId",
    //                     foreignField: "_id",
    //                     as: "creatorId",
    //                 },
    //             },
    //             { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
    //                 {
    //                 $lookup: {
    //                     from: "companies",
    //                     localField: "creatorId._id",
    //                     foreignField: "serviceId",
    //                     as: "creatorCompany",
    //                 },
    //             },
    //             { $unwind: { path: "$creatorCompany", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "partnerId",
    //                     foreignField: "_id",
    //                     as: "partnerId",
    //                 },
    //             },
    //             { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "jobproducts",
    //                     localField: "_id",
    //                     foreignField: "jobId",
    //                     as: "jobproduct",
    //                 },
    //             },
    //             { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
    //             { $match: jobStatusFilter },
    //             {
    //                 $lookup: {
    //                     from: "userproducts",
    //                     localField: "jobproduct.userProductId",
    //                     foreignField: "_id",
    //                     as: "userProducts",
    //                 },
    //             },
    //             { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
    //                  {
    //                 $lookup: {
    //                     from: "services",
    //                     localField: "userProducts.referId",
    //                     foreignField: "_id",
    //                     as: "services",
    //                 },
    //             },
    //             { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "products",
    //                     localField: "userProducts.productId",
    //                     foreignField: "_id",
    //                     as: "productId",
    //                 },
    //             },
    //             { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },

    //         ]);



    //         let mergeMyJob = await jobModel.aggregate([
    //             { $match: { ...matchCondition, isAccepted: true } },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "creatorId",
    //                     foreignField: "_id",
    //                     as: "creator",
    //                 },
    //             },
    //             { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "partnerId",
    //                     foreignField: "_id",
    //                     as: "partner",
    //                 },
    //             },
    //             { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "jobproducts",
    //                     localField: "_id",
    //                     foreignField: "jobId",
    //                     as: "jobproducts",
    //                 },
    //             },
    //             {
    //                 $lookup: {
    //                     from: "userproducts",
    //                     localField: "jobproducts.userProductId",
    //                     foreignField: "_id",
    //                     as: "allUserProducts",
    //                 },
    //             },
    //             {
    //                 $addFields: {
    //                     jobproducts: {
    //                         $map: {
    //                             input: "$jobproducts",
    //                             as: "jobproduct",
    //                             in: {
    //                                 $mergeObjects: [
    //                                     "$$jobproduct",
    //                                     {
    //                                         userProduct: {
    //                                             $arrayElemAt: [
    //                                                 {
    //                                                     $filter: {
    //                                                         input: "$allUserProducts",
    //                                                         as: "userProduct",
    //                                                         cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
    //                                                     }
    //                                                 },
    //                                                 0
    //                                             ]
    //                                         }
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: "products",
    //                     localField: "allUserProducts.productId",
    //                     foreignField: "_id",
    //                     as: "allProducts",
    //                 },
    //             },
    //             {
    //                 $addFields: {
    //                     jobproducts: {
    //                         $map: {
    //                             input: "$jobproducts",
    //                             as: "jobproduct",
    //                             in: {
    //                                 $mergeObjects: [
    //                                     "$$jobproduct",
    //                                     {
    //                                         product: {
    //                                             $arrayElemAt: [
    //                                                 {
    //                                                     $filter: {
    //                                                         input: "$allProducts",
    //                                                         as: "product",
    //                                                         cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
    //                                                     }
    //                                                 },
    //                                                 0
    //                                             ]
    //                                         }
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             // Lookup employee details
    //             {
    //                 $lookup: {
    //                     from: "employees",
    //                     localField: "jobproducts.employeeId",
    //                     foreignField: "_id",
    //                     as: "allEmployees",
    //                 },
    //             },
    //             // Add employee details to jobproducts
    //             {
    //                 $addFields: {
    //                     jobproducts: {
    //                         $map: {
    //                             input: "$jobproducts",
    //                             as: "jobproduct",
    //                             in: {
    //                                 $mergeObjects: [
    //                                     "$$jobproduct",
    //                                     {
    //                                         employee: {
    //                                             $arrayElemAt: [
    //                                                 {
    //                                                     $filter: {
    //                                                         input: "$allEmployees",
    //                                                         as: "employee",
    //                                                         cond: { $eq: ["$$employee._id", "$$jobproduct.employeeId"] }
    //                                                     }
    //                                                 },
    //                                                 0
    //                                             ]
    //                                         }
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     allUserProducts: 0,
    //                     allProducts: 0,
    //                     allEmployees: 0
    //                 }
    //             }
    //         ]);


    //         // Check if myJob has any results
    //         if (!myJob || myJob.length === 0) {
    //             return returnFormatter(true, "No jobs found", []);
    //         }
    //         // Find the request data
    //         let requestDataArray = await Promise.all(
    //             myJob.map(async (data) => {
    //                 let requestData = await partnerRequestModel.aggregate([
    //                     {
    //                         $match: {
    //                             $or: [
    //                                 { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
    //                                 { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
    //                             ]
    //                         }
    //                     },
    //                     {
    //                         $lookup: {
    //                             from: "users",
    //                             localField: "receiverId", // Assuming receiver is the partner
    //                             foreignField: "_id",
    //                             as: "partner"
    //                         }
    //                     },
    //                     { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
    //                     {
    //                         $lookup: {
    //                             from: "companies",
    //                             localField: "partner._id",
    //                             foreignField: "serviceId",
    //                             as: "company"
    //                         }
    //                     },
    //                     { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
    //                     {
    //                         $unwind: {
    //                             path: '$productForm',
    //                             preserveNullAndEmptyArrays: true
    //                         }
    //                     },
    //                     {
    //                         $lookup: {
    //                             from: 'forms',
    //                             let: {
    //                                 allFields: {
    //                                     $setUnion: [
    //                                         '$productForm.initFields.fields',
    //                                         '$productForm.allocationFields.fields',
    //                                         '$productForm.agentFields.fields',
    //                                         '$productForm.submitFields.fields'
    //                                     ]
    //                                 }
    //                             },
    //                             pipeline: [
    //                                 {
    //                                     $match: {
    //                                         $expr: { $in: ['$_id', '$$allFields'] }
    //                                     }
    //                                 },
    //                                 {
    //                                     $project: {
    //                                         _id: 1,
    //                                         fieldName: 1,
    //                                         dataType: 1
    //                                     }
    //                                 }
    //                             ],
    //                             as: 'formFields'
    //                         }
    //                     },
    //                     {
    //                         $addFields: {
    //                             'productForm.initFields.fields': {
    //                                 $map: {
    //                                     input: '$productForm.initFields.fields',
    //                                     as: 'fieldId',
    //                                     in: {
    //                                         $let: {
    //                                             vars: {
    //                                                 fieldObj: {
    //                                                     $arrayElemAt: [
    //                                                         {
    //                                                             $filter: {
    //                                                                 input: '$formFields',
    //                                                                 as: 'form',
    //                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
    //                                                             }
    //                                                         }, 0
    //                                                     ]
    //                                                 }
    //                                             },
    //                                             in: {
    //                                                 fieldName: '$$fieldObj.fieldName',
    //                                                 dataType: '$$fieldObj.dataType'
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //                             },
    //                             'productForm.allocationFields.fields': {
    //                                 $map: {
    //                                     input: '$productForm.allocationFields.fields',
    //                                     as: 'fieldId',
    //                                     in: {
    //                                         $let: {
    //                                             vars: {
    //                                                 fieldObj: {
    //                                                     $arrayElemAt: [
    //                                                         {
    //                                                             $filter: {
    //                                                                 input: '$formFields',
    //                                                                 as: 'form',
    //                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
    //                                                             }
    //                                                         }, 0
    //                                                     ]
    //                                                 }
    //                                             },
    //                                             in: {
    //                                                 fieldName: '$$fieldObj.fieldName',
    //                                                 dataType: '$$fieldObj.dataType'
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //                             },
    //                             'productForm.agentFields.fields': {
    //                                 $map: {
    //                                     input: '$productForm.agentFields.fields',
    //                                     as: 'fieldId',
    //                                     in: {
    //                                         $let: {
    //                                             vars: {
    //                                                 fieldObj: {
    //                                                     $arrayElemAt: [
    //                                                         {
    //                                                             $filter: {
    //                                                                 input: '$formFields',
    //                                                                 as: 'form',
    //                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
    //                                                             }
    //                                                         }, 0
    //                                                     ]
    //                                                 }
    //                                             },
    //                                             in: {
    //                                                 fieldName: '$$fieldObj.fieldName',
    //                                                 dataType: '$$fieldObj.dataType'
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //                             },
    //                             'productForm.submitFields.fields': {
    //                                 $map: {
    //                                     input: '$productForm.submitFields.fields',
    //                                     as: 'fieldId',
    //                                     in: {
    //                                         $let: {
    //                                             vars: {
    //                                                 fieldObj: {
    //                                                     $arrayElemAt: [
    //                                                         {
    //                                                             $filter: {
    //                                                                 input: '$formFields',
    //                                                                 as: 'form',
    //                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
    //                                                             }
    //                                                         }, 0
    //                                                     ]
    //                                                 }
    //                                             },
    //                                             in: {
    //                                                 fieldName: '$$fieldObj.fieldName',
    //                                                 dataType: '$$fieldObj.dataType'
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     },
    //                     {
    //                         $group: {
    //                             _id: '$_id',
    //                             doc: { $first: '$$ROOT' },
    //                             productForms: { $push: '$productForm' }
    //                         }
    //                     },
    //                     {
    //                         $addFields: {
    //                             'doc.productForm': '$productForms'
    //                         }
    //                     },
    //                     {
    //                         $replaceRoot: {
    //                             newRoot: '$doc'
    //                         }
    //                     }
    //                 ])
    //                 .sort({ createdAt: -1 });

    //                 return requestData[0]; // return first result if aggregation gives array
    //             })
    //         );



    //         // Filter out null results
    //         requestDataArray = requestDataArray.filter(data => data !== null);

    //         // Create a Map to store userProductId mapping
    //         let requestDataMap = new Map();

    //         // Iterate over requestDataArray and populate requestDataMap
    //         requestDataArray.forEach(requestData => {
    //             if (requestData?.productForm && Array.isArray(requestData.productForm)) {
    //                 requestData.productForm.forEach(item => {
    //                     if (item?.userProductId) {
    //                         const idString = item.userProductId.toString();
    //                         requestDataMap.set(idString, item);
    //                     }
    //                 });
    //             }
    //         });

    //         // Merge job data with matched product form and filter out unmatched jobs
    //         let mergedJobData = myJob.reduce((acc, job) => {
    //             if (job?.jobproduct?.userProductId) {
    //                 const userProductIdString = job.jobproduct.userProductId.toString();
    //                 let matchedData = requestDataMap.get(userProductIdString);

    //                 if (matchedData) {
    //                     acc.push({
    //                         ...job,
    //                         matchedProductForm: matchedData
    //                     });
    //                 }
    //             }
    //             return acc;
    //         }, []);
    // // corrected code
    //         let filteredMergedjob = mergeMyJob.filter((data) => 
    //             data.jobproducts.some((jp) => jp.jobStatus === "completed")
    //         );


    //         let isLast = false;
    //         if (requestsObject.query.stageId == 4) {
    //             isLast = filteredMergedjob.map((data) => {

    //                 if (data.reportType == "separated") {
    //                     return true;
    //                 }

    //                 let filterData = data.jobproducts.filter((jData) => {
    //                     return jData.jobStatus !== "submitted";
    //                 });

    //                 // Check if there are any filtered jobs and the last one is completed
    //                 return filterData.length > 0 && filterData[filterData.length - 1].jobStatus == "completed";
    //             });
    //         }



    // // Now map through mergedJobData and add corresponding isLast value
    // mergedJobData = mergedJobData.map((job, index) => {
    //     return {
    //         ...job,
    //         isLast: isLast[index] // Add the corresponding isLast value
    //     };
    // });


    // const partnerId = requestsObject.query.partnerId;
    // const filterType = requestsObject.query.dateFilter; // 'today', 'thisweek', 'thismonth', or 'custom'
    // const startDateParam = requestsObject.query.startDate;
    // const endDateParam = requestsObject.query.endDate;

    // let startDate, endDate;

    // // Handle date filters
    // switch (filterType) {
    //   case 'today':
    //     startDate = moment().startOf('day').toDate();
    //     endDate = moment().endOf('day').toDate();
    //     break;
    //   case 'thisweek':
    //     startDate = moment().startOf('week').toDate();
    //     endDate = moment().endOf('week').toDate();
    //     break;
    //   case 'thismonth':
    //     startDate = moment().startOf('month').toDate();
    //     endDate = moment().endOf('month').toDate();
    //     break;
    //   case 'custom':
    //     if (startDateParam && endDateParam) {
    //       startDate = moment(startDateParam).startOf('day').toDate();
    //       endDate = moment(endDateParam).endOf('day').toDate();
    //     }
    //     break;
    // }

    // // Apply filters only if any filtering is needed
    // if (filterType || partnerId) {
    //   const filteredItems = mergedJobData.filter(item => {
    //     let match = true;

    //     // Partner ID match
    //     if (partnerId) {
    //       match = match && item.creatorId?._id?.toString() === partnerId;
    //     }


    //     // Date range match
    //     if (startDate && endDate) {
    //       const createdAt = new Date(item.createdAt);

    //       match = match && createdAt >= startDate && createdAt <= endDate;
    //     }

    //     return match;
    //   });

    //   return returnFormatter(true, JobSuccessMessage, filteredItems);
    // }


    //         return returnFormatter(true, JobSuccessMessage, mergedJobData);


    //     } 
    //  try {
    //         let matchCondition = {
    //             [requestsObject.user.role === "emp_admin" ? "partnerId" : "allocationId"]:
    //                 new mongoose.Types.ObjectId(
    //                     requestsObject.user.role === "emp_admin" ? requestsObject.user.serviceId : requestsObject.user.empId
    //                 )
    //         };

    //         // Check stageId from query params
    //         if (requestsObject.query.stageId) {
    //             if (Number(requestsObject.query.stageId) === 3) {
    //                 return returnFormatter(false, "This stageId not allowed");
    //             }

    //             // Special handling for stageId 4 - don't add it to matchCondition
    //             // so we can include stageId 3 records too
    //             if (Number(requestsObject.query.stageId) !== 4) {
    //                 matchCondition.stageId = Number(requestsObject.query.stageId);
    //             } else {
    //                 // For stageId 4, we want to match both stageId 3 and 4
    //                 matchCondition.$or = [
    //                     { stageId: 2 },
    //                     { stageId: 3 },
    //                     { stageId: 4 }
    //                 ];
    //             }
    //         }

    //         // Determine jobStatus filter based on query stageId
    //         let jobStatusFilter = {};
    //         if (requestsObject.query.stageId) {
    //             if (Number(requestsObject.query.stageId) === 2) {
    //                 jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending"] } };
    //             } else if (Number(requestsObject.query.stageId) === 4) {
    //                 // For stageId 4, we only care about the completed status
    //                 jobStatusFilter = { "jobproduct.jobStatus": "completed" };
    //             } else {
    //                 jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
    //             }
    //         } else {
    //             // Default if no stageId provided
    //             jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
    //         }
    //         const myJob = await jobModel.aggregate([
    //             { $match: { ...matchCondition, isAccepted: true } },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "creatorId",
    //                     foreignField: "_id",
    //                     as: "creatorId",
    //                 },
    //             },
    //             { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
    //                 {
    //                 $lookup: {
    //                     from: "companies",
    //                     localField: "creatorId._id",
    //                     foreignField: "serviceId",
    //                     as: "creatorCompany",
    //                 },
    //             },
    //             { $unwind: { path: "$creatorCompany", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "partnerId",
    //                     foreignField: "_id",
    //                     as: "partnerId",
    //                 },
    //             },
    //             { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "jobproducts",
    //                     localField: "_id",
    //                     foreignField: "jobId",
    //                     as: "jobproduct",
    //                 },
    //             },
    //             { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
    //                 {
    //                 $lookup: {
    //                     from: "employees",
    //                     localField: "allocationId",
    //                     foreignField: "_id",
    //                     as: "alloctedEmp",
    //                 },
    //             },
    //             { $unwind: { path: "$alloctedEmp", preserveNullAndEmptyArrays: true } },
    //             { $match: {"jobproduct.jobStatus": "submitted"} },
    //             {
    //                 $lookup: {
    //                     from: "userproducts",
    //                     localField: "jobproduct.userProductId",
    //                     foreignField: "_id",
    //                     as: "userProducts",
    //                 },
    //             },
    //             { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
    //                  {
    //                 $lookup: {
    //                     from: "services",
    //                     localField: "userProducts.referId",
    //                     foreignField: "_id",
    //                     as: "services",
    //                 },
    //             },
    //             { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "products",
    //                     localField: "userProducts.productId",
    //                     foreignField: "_id",
    //                     as: "productId",
    //                 },
    //             },
    //             { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },

    //         ]);



    //         let mergeMyJob = await jobModel.aggregate([
    //             { $match: { ...matchCondition, stageId:5 } },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "creatorId",
    //                     foreignField: "_id",
    //                     as: "creator",
    //                 },
    //             },
    //             { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "users",
    //                     localField: "partnerId",
    //                     foreignField: "_id",
    //                     as: "partner",
    //                 },
    //             },
    //             { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "jobproducts",
    //                     localField: "_id",
    //                     foreignField: "jobId",
    //                     as: "jobproducts",
    //                 },
    //             },
    //             {
    //                 $lookup: {
    //                     from: "userproducts",
    //                     localField: "jobproducts.userProductId",
    //                     foreignField: "_id",
    //                     as: "allUserProducts",
    //                 },
    //             },
    //             {
    //                 $addFields: {
    //                     jobproducts: {
    //                         $map: {
    //                             input: "$jobproducts",
    //                             as: "jobproduct",
    //                             in: {
    //                                 $mergeObjects: [
    //                                     "$$jobproduct",
    //                                     {
    //                                         userProduct: {
    //                                             $arrayElemAt: [
    //                                                 {
    //                                                     $filter: {
    //                                                         input: "$allUserProducts",
    //                                                         as: "userProduct",
    //                                                         cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
    //                                                     }
    //                                                 },
    //                                                 0
    //                                             ]
    //                                         }
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: "products",
    //                     localField: "allUserProducts.productId",
    //                     foreignField: "_id",
    //                     as: "allProducts",
    //                 },
    //             },
    //             {
    //                 $addFields: {
    //                     jobproducts: {
    //                         $map: {
    //                             input: "$jobproducts",
    //                             as: "jobproduct",
    //                             in: {
    //                                 $mergeObjects: [
    //                                     "$$jobproduct",
    //                                     {
    //                                         product: {
    //                                             $arrayElemAt: [
    //                                                 {
    //                                                     $filter: {
    //                                                         input: "$allProducts",
    //                                                         as: "product",
    //                                                         cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
    //                                                     }
    //                                                 },
    //                                                 0
    //                                             ]
    //                                         }
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             // Lookup employee details
    //             {
    //                 $lookup: {
    //                     from: "employees",
    //                     localField: "jobproducts.employeeId",
    //                     foreignField: "_id",
    //                     as: "allEmployees",
    //                 },
    //             },
    //             // Add employee details to jobproducts
    //             {
    //                 $addFields: {
    //                     jobproducts: {
    //                         $map: {
    //                             input: "$jobproducts",
    //                             as: "jobproduct",
    //                             in: {
    //                                 $mergeObjects: [
    //                                     "$$jobproduct",
    //                                     {
    //                                         employee: {
    //                                             $arrayElemAt: [
    //                                                 {
    //                                                     $filter: {
    //                                                         input: "$allEmployees",
    //                                                         as: "employee",
    //                                                         cond: { $eq: ["$$employee._id", "$$jobproduct.employeeId"] }
    //                                                     }
    //                                                 },
    //                                                 0
    //                                             ]
    //                                         }
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     allUserProducts: 0,
    //                     allProducts: 0,
    //                     allEmployees: 0
    //                 }
    //             }
    //         ]);


    //         // Check if myJob has any results
    //         if (!myJob || myJob.length === 0) {
    //             return returnFormatter(true, "No jobs found", []);
    //         }
    //         // Find the request data
    //         let requestDataArray = await Promise.all(
    //             myJob.map(async (data) => {
    //                 let requestData = await partnerRequestModel.aggregate([
    //                     {
    //                         $match: {
    //                             $or: [
    //                                 { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
    //                                 { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
    //                             ]
    //                         }
    //                     },
    //                     {
    //                         $lookup: {
    //                             from: "users",
    //                             localField: "receiverId", // Assuming receiver is the partner
    //                             foreignField: "_id",
    //                             as: "partner"
    //                         }
    //                     },
    //                     { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
    //                     {
    //                         $lookup: {
    //                             from: "companies",
    //                             localField: "partner._id",
    //                             foreignField: "serviceId",
    //                             as: "company"
    //                         }
    //                     },
    //                     { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
    //                     {
    //                         $unwind: {
    //                             path: '$productForm',
    //                             preserveNullAndEmptyArrays: true
    //                         }
    //                     },
    //                     {
    //                         $lookup: {
    //                             from: 'forms',
    //                             let: {
    //                                 allFields: {
    //                                     $setUnion: [
    //                                         '$productForm.initFields.fields',
    //                                         '$productForm.allocationFields.fields',
    //                                         '$productForm.agentFields.fields',
    //                                         '$productForm.submitFields.fields'
    //                                     ]
    //                                 }
    //                             },
    //                             pipeline: [
    //                                 {
    //                                     $match: {
    //                                         $expr: { $in: ['$_id', '$$allFields'] }
    //                                     }
    //                                 },
    //                                 {
    //                                     $project: {
    //                                         _id: 1,
    //                                         fieldName: 1,
    //                                         dataType: 1
    //                                     }
    //                                 }
    //                             ],
    //                             as: 'formFields'
    //                         }
    //                     },
    //                     {
    //                         $addFields: {
    //                             'productForm.initFields.fields': {
    //                                 $map: {
    //                                     input: '$productForm.initFields.fields',
    //                                     as: 'fieldId',
    //                                     in: {
    //                                         $let: {
    //                                             vars: {
    //                                                 fieldObj: {
    //                                                     $arrayElemAt: [
    //                                                         {
    //                                                             $filter: {
    //                                                                 input: '$formFields',
    //                                                                 as: 'form',
    //                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
    //                                                             }
    //                                                         }, 0
    //                                                     ]
    //                                                 }
    //                                             },
    //                                             in: {
    //                                                 fieldName: '$$fieldObj.fieldName',
    //                                                 dataType: '$$fieldObj.dataType'
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //                             },
    //                             'productForm.allocationFields.fields': {
    //                                 $map: {
    //                                     input: '$productForm.allocationFields.fields',
    //                                     as: 'fieldId',
    //                                     in: {
    //                                         $let: {
    //                                             vars: {
    //                                                 fieldObj: {
    //                                                     $arrayElemAt: [
    //                                                         {
    //                                                             $filter: {
    //                                                                 input: '$formFields',
    //                                                                 as: 'form',
    //                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
    //                                                             }
    //                                                         }, 0
    //                                                     ]
    //                                                 }
    //                                             },
    //                                             in: {
    //                                                 fieldName: '$$fieldObj.fieldName',
    //                                                 dataType: '$$fieldObj.dataType'
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //                             },
    //                             'productForm.agentFields.fields': {
    //                                 $map: {
    //                                     input: '$productForm.agentFields.fields',
    //                                     as: 'fieldId',
    //                                     in: {
    //                                         $let: {
    //                                             vars: {
    //                                                 fieldObj: {
    //                                                     $arrayElemAt: [
    //                                                         {
    //                                                             $filter: {
    //                                                                 input: '$formFields',
    //                                                                 as: 'form',
    //                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
    //                                                             }
    //                                                         }, 0
    //                                                     ]
    //                                                 }
    //                                             },
    //                                             in: {
    //                                                 fieldName: '$$fieldObj.fieldName',
    //                                                 dataType: '$$fieldObj.dataType'
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //                             },
    //                             'productForm.submitFields.fields': {
    //                                 $map: {
    //                                     input: '$productForm.submitFields.fields',
    //                                     as: 'fieldId',
    //                                     in: {
    //                                         $let: {
    //                                             vars: {
    //                                                 fieldObj: {
    //                                                     $arrayElemAt: [
    //                                                         {
    //                                                             $filter: {
    //                                                                 input: '$formFields',
    //                                                                 as: 'form',
    //                                                                 cond: { $eq: ['$$form._id', '$$fieldId'] }
    //                                                             }
    //                                                         }, 0
    //                                                     ]
    //                                                 }
    //                                             },
    //                                             in: {
    //                                                 fieldName: '$$fieldObj.fieldName',
    //                                                 dataType: '$$fieldObj.dataType'
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     },
    //                     {
    //                         $group: {
    //                             _id: '$_id',
    //                             doc: { $first: '$$ROOT' },
    //                             productForms: { $push: '$productForm' }
    //                         }
    //                     },
    //                     {
    //                         $addFields: {
    //                             'doc.productForm': '$productForms'
    //                         }
    //                     },
    //                     {
    //                         $replaceRoot: {
    //                             newRoot: '$doc'
    //                         }
    //                     }
    //                 ])
    //                 .sort({ createdAt: -1 });

    //                 return requestData[0]; // return first result if aggregation gives array
    //             })
    //         );



    //         // Filter out null results
    //         requestDataArray = requestDataArray.filter(data => data !== null);

    //         // Create a Map to store userProductId mapping
    //         let requestDataMap = new Map();

    //         // Iterate over requestDataArray and populate requestDataMap
    //         requestDataArray.forEach(requestData => {
    //             if (requestData?.productForm && Array.isArray(requestData.productForm)) {
    //                 requestData.productForm.forEach(item => {
    //                     if (item?.userProductId) {
    //                         const idString = item.userProductId.toString();
    //                         requestDataMap.set(idString, item);
    //                     }
    //                 });
    //             }
    //         });

    //         // Merge job data with matched product form and filter out unmatched jobs
    //         let mergedJobData = myJob.reduce((acc, job) => {
    //             if (job?.jobproduct?.userProductId) {
    //                 const userProductIdString = job.jobproduct.userProductId.toString();
    //                 let matchedData = requestDataMap.get(userProductIdString);

    //                 if (matchedData) {
    //                     acc.push({
    //                         ...job,
    //                         matchedProductForm: matchedData
    //                     });
    //                 }
    //             }
    //             return acc;
    //         }, []);
    // // corrected code
    //         let filteredMergedjob = mergeMyJob.filter((data) => 
    //             data.jobproducts.some((jp) => jp.jobStatus === "completed")
    //         );


    //         let isLast = false;
    //         if (requestsObject.query.stageId == 4) {
    //             isLast = filteredMergedjob.map((data) => {

    //                 if (data.reportType == "separated") {
    //                     return true;
    //                 }

    //                 let filterData = data.jobproducts.filter((jData) => {
    //                     return jData.jobStatus !== "submitted";
    //                 });

    //                 // Check if there are any filtered jobs and the last one is completed
    //                 return filterData.length > 0 && filterData[filterData.length - 1].jobStatus == "completed";
    //             });
    //         }



    // // Step 1: Add isLast to each job
    // mergedJobData = mergedJobData.map((job, index) => ({
    //     ...job,
    //     isLast: isLast[index]
    // }));

    // // Step 2: Fetch and merge initModel data for each job
    // mergedJobData = await Promise.all(
    //     mergedJobData.map(async (data) => {
    //         const intFields = await initModel.findOne({ jobId: data.jobproduct.jobId });

    //         return {
    //             ...data,
    //             fileNo: intFields?.fileNo || null,
    //             customerName: intFields?.customerName || null,
    //             fatherName: intFields?.fatherName || null,
    //             phoneNo: intFields?.contactNo || null,
    //             address: intFields?.address || null
    //         };
    //     })
    // );


    // const partnerId = requestsObject.query.partnerId;
    // const filterType = requestsObject.query.dateFilter; // 'today', 'thisweek', 'thismonth', or 'custom'
    // const startDateParam = requestsObject.query.startDate;
    // const endDateParam = requestsObject.query.endDate;

    // let startDate, endDate;

    // // Handle date filters
    // switch (filterType) {
    //   case 'today':
    //     startDate = moment().startOf('day').toDate();
    //     endDate = moment().endOf('day').toDate();
    //     break;
    //   case 'thisweek':
    //     startDate = moment().startOf('week').toDate();
    //     endDate = moment().endOf('week').toDate();
    //     break;
    //   case 'thismonth':
    //     startDate = moment().startOf('month').toDate();
    //     endDate = moment().endOf('month').toDate();
    //     break;
    //   case 'custom':
    //     if (startDateParam && endDateParam) {
    //       startDate = moment(startDateParam).startOf('day').toDate();
    //       endDate = moment(endDateParam).endOf('day').toDate();
    //     }
    //     break;
    // }

    // // Apply filters only if any filtering is needed
    // if (filterType || partnerId) {
    //   const filteredItems = mergedJobData.filter(item => {
    //     let match = true;

    //     // Partner ID match
    //     if (partnerId) {
    //       match = match && item.creatorId?._id?.toString() === partnerId;
    //     }


    //     // Date range match
    //     if (startDate && endDate) {
    //       const createdAt = new Date(item.createdAt);

    //       match = match && createdAt >= startDate && createdAt <= endDate;
    //     }

    //     return match;
    //   });

    //   return returnFormatter(true, JobSuccessMessage, filteredItems);
    // }


    //         return returnFormatter(true, JobSuccessMessage, mergedJobData);


    //     } 
    catch (error) {
        return returnFormatter(false, error.message);
    }
}


// teat data

// Function to process Excel file and extract job data

// function processExcelData(filePath) {
//   try {
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: null });

//     const filteredData = rawData.filter(
//       (row) => row.Product && String(row.Product).trim() !== ''
//     );

//     return filteredData;
//   } catch (error) {
//     console.error("Error processing Excel file:", error);
//     throw new Error("Failed to process Excel file. Please ensure it's a valid Excel format.");
//   }
// }



function processExcelData(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);

        const sheetNames = workbook.SheetNames;

        let allData = [];

        // Start from index 2 (third sheet) if available
        const startIndex = Math.min(2, sheetNames.length - 1);

        for (let i = startIndex; i < sheetNames.length; i++) {
            const sheetName = sheetNames[i];
            const worksheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: null });

            const filteredData = rawData.filter((row) => {
                const productValid = row.Product && String(row.Product).trim() !== '';
                const locationValid = row.Location && String(row.Location).trim() !== '';
                return productValid && locationValid;
            });

            allData = allData.concat(filteredData);
        }

        return allData;
    } catch (error) {
        console.error("Error processing Excel file:", error);
        throw new Error("Failed to process Excel file. Please ensure it's a valid Excel format.");
    }
}


// Validate the Excel data structure
function validateExcelData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Excel file is empty or improperly formatted");
    }



    return true;
}

export async function handleJobsExcelUpload(reqOb) {
    let filePath = reqOb.file.path;

    try {
        // Process the Excel file
        const excelData = processExcelData(filePath);



        // Validate the data structure
        let verified = validateExcelData(excelData);

        // Process each job in the Excel file
        const jobProductList = [];
        for (let job of excelData) {
            let initValues = [];

            // Loop through job object keys and find all initValue properties
            let count = 0;
            for (let key in job) {
                count++;
                if (count <= 2) continue; // Skip first and second keys

                initValues.push(job[key]); // Process from third key onwards
            }

            jobProductList.push({
                userProductId: job.Product,
                locationId: job.Location,
                initValues: initValues
            });
        }

        // Correct way to structure the request object
        const requestObject = {
            ...reqOb,
            body: {
                ...reqOb.body,  // Keep existing body properties
                jobProductList  // Add jobProductList inside body
            }
        };



        let jobData = await addJob(requestObject);
        if (jobData.status == false) {
            return returnFormatter(false, "Job creation failed check sheet data")
        }
        fs.unlinkSync(filePath);

        return returnFormatter(true, "Job created successfully");

    } catch (processError) {

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return returnFormatter(false, processError.message); // Fixed typo (maessage -> message)
    }
}







export async function createExcel(requestObject) {
    try {
        const workbook = new ExcelJS.Workbook();

        // Step 1: Get partner data using aggregation for more complete data
        let partnerData = await partnerRequestModel.aggregate([
            {
                $match: {
                    senderId: new mongoose.Types.ObjectId(requestObject.user.serviceId),
                    receiverId: new mongoose.Types.ObjectId(requestObject.query.partnerId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "partner"
                }
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "partner._id",
                    foreignField: "serviceId",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            {
                $unwind: {
                    path: "$productForm",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "forms",
                    let: {
                        allFields: {
                            $setUnion: [
                                "$productForm.initFields.fields",
                                "$productForm.allocationFields.fields",
                                "$productForm.agentFields.fields",
                                "$productForm.submitFields.fields"
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$allFields"] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1
                            }
                        }
                    ],
                    as: "formFields"
                }
            },
            {
                $addFields: {
                    ...["initFields", "allocationFields", "agentFields", "submitFields"].reduce((acc, fieldType) => {
                        acc[`productForm.${fieldType}.fields`] = {
                            $map: {
                                input: `$productForm.${fieldType}.fields`,
                                as: "fieldId",
                                in: {
                                    $let: {
                                        vars: {
                                            fieldObj: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$formFields",
                                                            as: "form",
                                                            cond: { $eq: ["$$form._id", "$$fieldId"] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        },
                                        in: {
                                            fieldName: "$$fieldObj.fieldName",
                                            dataType: "$$fieldObj.dataType"
                                        }
                                    }
                                }
                            }
                        };
                        return acc;
                    }, {})
                }
            },
            {
                $group: {
                    _id: "$_id",
                    doc: { $first: "$$ROOT" },
                    productForms: { $push: "$productForm" }
                }
            },
            {
                $addFields: {
                    "doc.productForm": "$productForms"
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$doc"
                }
            }
        ]);



        // Step 2: Create userProduct sheet
        const userProductSheet = workbook.addWorksheet("UserProducts");

        // Define userProduct sheet headers
        userProductSheet.columns = [
            { header: "ID", key: "id", width: 30 },
            { header: "Product Name", key: "productName", width: 30 },
        ];

        // Create location sheet
        const locationSheet = workbook.addWorksheet("Locations");

        // Define location sheet headers
        locationSheet.columns = [
            { header: "ID", key: "id", width: 30 },
            { header: "Location Name", key: "locationName", width: 30 },
            { header: "City Name", key: "cityName", width: 30 },
        ];

        // Step 3: Fetch data
        let locations = await locationModel.find({ serviceId: requestObject.user.serviceId });
        let userProducts = await userProductModel.find({ serviceId: requestObject.user.serviceId })
            .populate({
                path: "productId",
                model: "product",
                options: { strictPopulate: false },
            });

        // Add userProduct data
        userProducts.forEach(product => {
            userProductSheet.addRow({
                id: product._id.toString(),
                productName: product.productId ? product.productId.productName : "N/A"
            });
        });

        // Add location data
        locations.forEach(location => {
            locationSheet.addRow({
                id: location._id.toString(),
                locationName: location.locationName || "N/A",
                cityName: location.cityName || "N/A"
            });
        });

        // Step 4: Create individual sheets for each product from partnerData
        //   if (partnerData && partnerData.length > 0 && partnerData[0].productForm && partnerData[0].productForm.length > 0) {
        //     partnerData[0].productForm.forEach(product,index => {
        //       // Create a safe sheet name
        //       const safeSheetName = (product.productName || "Product").replace(/[\\\/\*\?\[\]:]/g, "_");

        //       // Create a sheet for each product
        //       const productSheet = workbook.addWorksheet(index+safeSheetName);

        //       // Update the base columns to include only Product ID and Location
        //       const baseColumns = [
        //         { header: "Product", key: "productId", width: 30 },
        //         { header: "Location", key: "location", width: 30 }
        //       ];

        //       // Extract headers from initFields if available
        //       if (product.initFields && product.initFields.fields && product.initFields.fields.length > 0) {
        //         // Get all keys from initFields to use as headers
        //         const fieldHeaders = product.initFields.fields.map(field => {
        //           return {
        //             header: field.fieldName,
        //             key: field.fieldName.replace(/\s+/g, '_').toLowerCase(), // Create safe keys
        //             width: 30
        //           };
        //         });

        //         // Set columns based on baseColumns + initFields
        //         productSheet.columns = [...baseColumns, ...fieldHeaders];

        //         // Add a sample row with the values
        //         const rowData = {
        //           productId: product.userProductId ? product.userProductId.toString() : "",
        //           location: ""
        //         };

        //         // Add empty fields for all field headers
        //         fieldHeaders.forEach(header => {
        //           rowData[header.key] = "";
        //         });

        //         productSheet.addRow(rowData);
        //       } else {
        //         // Fallback if no fields
        //         productSheet.columns = [
        //           ...baseColumns,
        //           { header: "Charge", key: "charge", width: 15 }
        //         ];

        //         productSheet.addRow({
        //           productId: product.userProductId ? product.userProductId.toString() : "",
        //           location: "",
        //           charge: product.charge || ""
        //         });
        //       }
        //     });
        //   }

        if (partnerData && partnerData.length > 0 && partnerData[0].productForm && partnerData[0].productForm.length > 0) {
            partnerData[0].productForm.forEach((product, index) => {
                // Create a safe sheet name with numbering (starts from 3)
                const safeSheetName = `${index + 3}. ${(product.productName || "Product").replace(/[\\\/\*\?\[\]:]/g, "_")}`;

                // Create a sheet for each product
                const productSheet = workbook.addWorksheet(safeSheetName);

                // Base columns
                const baseColumns = [
                    { header: "Product", key: "productId", width: 30 },
                    { header: "Location", key: "location", width: 30 }
                ];

                // Extract headers from initFields if available
                if (product.initFields && product.initFields.fields && product.initFields.fields.length > 0) {
                    const fieldHeaders = product.initFields.fields.map(field => {
                        return {
                            header: field.fieldName,
                            key: field.fieldName.replace(/\s+/g, '_').toLowerCase(),
                            width: 30
                        };
                    });

                    // Set columns
                    productSheet.columns = [...baseColumns, ...fieldHeaders];

                    // Add a sample row
                    const rowData = {
                        productId: product.userProductId ? product.userProductId.toString() : "",
                        location: ""
                    };

                    fieldHeaders.forEach(header => {
                        rowData[header.key] = "";
                    });

                    productSheet.addRow(rowData);

                } else {
                    // Fallback if no fields
                    productSheet.columns = [
                        ...baseColumns,
                        { header: "Charge", key: "charge", width: 15 }
                    ];

                    productSheet.addRow({
                        productId: product.userProductId ? product.userProductId.toString() : "",
                        location: "",
                        charge: product.charge || ""
                    });
                }
            });
        }


        // Step 5: Format ID columns as text with no quotes
        userProductSheet.getColumn('id').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber > 1) {  // Skip header row
                cell.numFmt = '@';  // Format as text
            }
        });

        locationSheet.getColumn('id').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber > 1) {  // Skip header row
                cell.numFmt = '@';  // Format as text
            }
        });

        // Format product ID columns in each product sheet as text
        workbook.eachSheet((sheet, id) => {
            if (id > 2) { // Skip UserProducts and Locations sheets
                if (sheet.getColumn('productId')) {
                    sheet.getColumn('productId').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
                        if (rowNumber > 1) {  // Skip header row
                            cell.numFmt = '@';  // Format as text
                        }
                    });
                }
            }
        });

        // Step 6: Save the file
        const filePath = `./sheet/${requestObject.user.serviceId}_data_sheet.xlsx`;
        await workbook.xlsx.writeFile(filePath);
        const correctedUrl = filePath.replace(".\/sheet", "/sheet");

        return returnFormatter(true, "Excel sheet created successfully", `https://fintech-api.fincooper.in${correctedUrl}`, partnerData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}







// ----------------------------- get allocation pending jobs ---------------------------------
// sertaed
// export async function getPendingJobByPartnerId(requestsObject) {
//     try {
//         let matchCondition = {
//             [requestsObject.user.role === "admin" ? "partnerId" : "allocationId"]:
//                 new mongoose.Types.ObjectId(
//                     requestsObject.user.role === "admin" ? requestsObject.user.serviceId : requestsObject.user.empId
//                 )
//         };


//         // Check stageId from query params
//         if (requestsObject.query.stageId) {
//             if (Number(requestsObject.query.stageId) === 3) {
//                 return returnFormatter(false, "This stageId not allowed");
//             }

//             // Special handling for stageId 4 - don't add it to matchCondition
//             // so we can include stageId 3 records too
//             if (Number(requestsObject.query.stageId) !== 4) {
//                 matchCondition.stageId = Number(requestsObject.query.stageId);
//             } else {
//                 // For stageId 4, we want to match both stageId 3 and 4
//                 matchCondition.$or = [
//                     { stageId: 3 },
//                     { stageId: 4 }
//                 ];
//             }
//         }

//         // Determine jobStatus filter based on query stageId
//         let jobStatusFilter = {};
//         if (requestsObject.query.stageId) {
//             if (Number(requestsObject.query.stageId) === 2) {
//                 jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending"] } };
//             } else if (Number(requestsObject.query.stageId) === 4) {
//                 // For stageId 4, we only care about the completed status
//                 jobStatusFilter = { "jobproduct.jobStatus": "completed" };
//             } else {
//                 jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
//             }
//         } else {
//             // Default if no stageId provided
//             jobStatusFilter = { "jobproduct.jobStatus": { $in: ["pending", "allocated", "completed"] } };
//         }
//         const myJob = await jobModel.aggregate([
//             { $match: { isAccepted: false } },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "creatorId",
//                     foreignField: "_id",
//                     as: "creatorId",
//                 },
//             },
//             { $unwind: { path: "$creatorId", preserveNullAndEmptyArrays: true } },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "partnerId",
//                     foreignField: "_id",
//                     as: "partnerId",
//                 },
//             },
//             { $unwind: { path: "$partnerId", preserveNullAndEmptyArrays: true } },
//             {
//                 $lookup: {
//                     from: "jobproducts",
//                     localField: "_id",
//                     foreignField: "jobId",
//                     as: "jobproduct",
//                 },
//             },
//             { $unwind: { path: "$jobproduct", preserveNullAndEmptyArrays: true } },
//             { $match: jobStatusFilter },
//             {
//                 $lookup: {
//                     from: "userproducts",
//                     localField: "jobproduct.userProductId",
//                     foreignField: "_id",
//                     as: "userProducts",
//                 },
//             },
//             { $unwind: { path: "$userProducts", preserveNullAndEmptyArrays: true } },
//             {
//                 $lookup: {
//                     from: "products",
//                     localField: "userProducts.productId",
//                     foreignField: "_id",
//                     as: "productId",
//                 },
//             },
//             { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },

//         ]);



//         // Check if myJob has any results
//         if (!myJob || myJob.length === 0) {
//             return returnFormatter(true, "No jobs found", []);
//         }
//         // Find the request data
//         let requestDataArray = await Promise.all(
//             myJob.map(async (data) => {
//                 return partnerRequestModel.findOne({
//                     $or: [
//                         { senderId: data?.creatorId, receiverId: data?.partnerId },
//                         { senderId: data?.partnerId, receiverId: data?.creatorId }
//                     ]
//                 });
//             })
//         );

//         // Filter out null results
//         requestDataArray = requestDataArray.filter(data => data !== null);

//         if (requestDataArray.length === 0) {
//             return returnFormatter(true, JobSuccessMessage, []);
//         }

//         let filterReqData = [];

//         // Iterate over requestDataArray
//         for (let requestData of requestDataArray) {
//             if (Array.isArray(requestData.allocationId)) {
//                 for (let i = 0; i < requestData.allocationId.length; i++) {
//                     if (String(requestData.allocationId[i]) === String(requestsObject.user.empId)) {
//                         filterReqData.push(requestData); // Push the matched data
//                     }
//                 }
//             }
//         }

//         // Ensure filterReqData is not empty
//         if (filterReqData.length === 0) {
//             return returnFormatter(true, JobSuccessMessage, []);
//         }

//         // Create a Map to store userProductId mapping
//         let requestDataMap = new Map();

//         // Iterate over filterReqData, as it's an array
//         filterReqData.forEach(req => {
//             if (req.productForm && Array.isArray(req.productForm)) {
//                 req.productForm.forEach(item => {
//                     if (item?.userProductId) {
//                         const idString = item.userProductId.toString();
//                         requestDataMap.set(idString, item);
//                     }
//                 });
//             }
//         });

//         // Check if requestDataMap is empty
//         if (requestDataMap.size === 0) {
//             return returnFormatter(true, JobSuccessMessage, []);
//         }

//         // Merge job data with matched product form and filter out unmatched jobs
//         let mergedJobData = myJob.reduce((acc, job) => {
//             let userProductIdString = job?.jobproduct?.userProductId?.toString();
//             if (userProductIdString) {
//                 let matchedData = requestDataMap.get(userProductIdString);
//                 if (matchedData) {
//                     acc.push({
//                         ...job,
//                         matchedProductForm: matchedData
//                     });
//                 }
//             }
//             return acc;
//         }, []);




//         return returnFormatter(true, JobSuccessMessage, mergedJobData);
//     } catch (error) {
//         console.error("Error in getJobByPartnerId:", error);
//         return returnFormatter(false, error.message);
//     }
// }





// --------------------- get Job by  employeeId -----------------------









// --------------------- get Job by  partnerId -----------------------
// seprate

// export async function getFinalJobs(requestsObject) {
//     try {


//         let myJob = await jobModel.aggregate([
//             {
//                 $match: {
//                     creatorId: new mongoose.Types.ObjectId(requestsObject.user.serviceId),
//                     stageId: 5 // Combined match condition
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "jobproducts",
//                     localField: "_id",
//                     foreignField: "jobId",
//                     as: "result"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$result",
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $sort: { createdAt: -1 } // Sorting inside aggregation
//             }
//         ]);

//         // Find the request data
//         let requestDataArray = await Promise.all(
//             myJob.map(async (data) => {
//                 return partnerRequestModel.findOne({
//                     $or: [
//                         { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
//                         { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
//                     ]
//                 });
//             })
//         );

//         // Filter out null results
//         requestDataArray = requestDataArray.filter(data => data !== null);

//         // Create a Map for easier lookup of product form items
//         let requestDataMap = new Map();

//         requestDataArray.forEach(requestData => {
//             if (requestData?.productForm && Array.isArray(requestData.productForm)) {
//                 requestData.productForm.forEach(item => {
//                     if (item?.userProductId) {
//                         // Convert ObjectId to string for proper comparison
//                         const idString = item.userProductId.toString();
//                         requestDataMap.set(idString, item);
//                     }
//                 });
//             }
//         });

//         // Merge requestData fields into jobData if userProductId matches
//         let mergedJobData = myJob.reduce((acc, job) => {
//             if (job?.result?.userProductId) {
//                 // Convert ObjectId to string for proper comparison
//                 const userProductIdString = job.result.userProductId.toString();
//                 let matchedData = requestDataMap.get(userProductIdString);

//                 if (matchedData) {
//                     // Include only jobs that have a match
//                     acc.push({
//                         ...job,
//                         matchedProductForm: matchedData  // Adding matched data
//                     });
//                 }
//             }
//             return acc;
//         }, []);

//         return returnFormatter(true, JobSuccessMessage, mergedJobData);

//     } catch (error) {
//         return returnFormatter(false, error.message);
//     }
// }


// merge
// export async function getFinalJobs(requestsObject) {
//     try {
//         let myJob = await jobModel.aggregate([
//             {
//                 $match: {
//                     creatorId: new mongoose.Types.ObjectId(requestsObject.user.serviceId),
//                     stageId: 5
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "creatorId",
//                     foreignField: "_id",
//                     as: "creator",
//                 },
//             },
//             {
//                 $unwind: {
//                     path: "$creator",
//                     preserveNullAndEmptyArrays: true,
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "partnerId",
//                     foreignField: "_id",
//                     as: "partner",
//                 },
//             },
//             {
//                 $unwind: {
//                     path: "$partner",
//                     preserveNullAndEmptyArrays: true,
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "jobproducts",
//                     localField: "_id",
//                     foreignField: "jobId",
//                     as: "jobproducts",
//                 },
//             },
//             // Remove the unwind on jobproducts to keep them in an array
//             {
//                 $lookup: {
//                     from: "userproducts",
//                     localField: "jobproducts.userProductId",
//                     foreignField: "_id",
//                     as: "allUserProducts",
//                 },
//             },
//             // Use $addFields to map related products to each jobproduct
//             {
//                 $addFields: {
//                     jobproducts: {
//                         $map: {
//                             input: "$jobproducts",
//                             as: "jobproduct",
//                             in: {
//                                 $mergeObjects: [
//                                     "$$jobproduct",
//                                     {
//                                         userProduct: {
//                                             $arrayElemAt: [
//                                                 {
//                                                     $filter: {
//                                                         input: "$allUserProducts",
//                                                         as: "userProduct",
//                                                         cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
//                                                     }
//                                                 },
//                                                 0
//                                             ]
//                                         }
//                                     }
//                                 ]
//                             }
//                         }
//                     }
//                 }
//             },
//             // Lookup products for each userProduct
//             {
//                 $lookup: {
//                     from: "products",
//                     localField: "allUserProducts.productId",
//                     foreignField: "_id",
//                     as: "allProducts",
//                 },
//             },
//             // Add product details to each jobproduct
//             {
//                 $addFields: {
//                     jobproducts: {
//                         $map: {
//                             input: "$jobproducts",
//                             as: "jobproduct",
//                             in: {
//                                 $mergeObjects: [
//                                     "$$jobproduct",
//                                     {
//                                         product: {
//                                             $arrayElemAt: [
//                                                 {
//                                                     $filter: {
//                                                         input: "$allProducts",
//                                                         as: "product",
//                                                         cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
//                                                     }
//                                                 },
//                                                 0
//                                             ]
//                                         }
//                                     }
//                                 ]
//                             }
//                         }
//                     }
//                 }
//             },
//             // Remove temporary fields used for lookups
//             {
//                 $project: {
//                     allUserProducts: 0,
//                     allProducts: 0
//                 }
//             }
//         ]);

//         // Find the request data
//         let requestDataArray = await Promise.all(
//             myJob.map(async (data) => {
//                 return partnerRequestModel.findOne({
//                     $or: [
//                         { senderId: data?.creatorId?._id, receiverId: data?.partnerId?._id },
//                         { senderId: data?.partnerId?._id, receiverId: data?.creatorId?._id }
//                     ]
//                 });
//             })
//         );

//         // Filter out null results
//         requestDataArray = requestDataArray.filter(data => data !== null);

//         // Create a Map for easier lookup of product form items
//         let requestDataMap = new Map();

//         requestDataArray.forEach(requestData => {
//             if (requestData?.productForm && Array.isArray(requestData.productForm)) {
//                 requestData.productForm.forEach(item => {
//                     if (item?.userProductId) {
//                         // Convert ObjectId to string for proper comparison
//                         const idString = item.userProductId.toString();
//                         requestDataMap.set(idString, item);
//                     }
//                 });
//             }
//         });

//         // Merge requestData fields into each jobproduct
//         let mergedJobData = myJob.map(job => {
//             if (job.jobproducts && Array.isArray(job.jobproducts)) {
//                 // Map over each jobproduct to add matched form data
//                 job.jobproducts = job.jobproducts.map(jobproduct => {
//                     if (jobproduct?.userProductId) {
//                         const userProductIdString = jobproduct.userProductId.toString();
//                         const matchedData = requestDataMap.get(userProductIdString);

//                         if (matchedData) {
//                             return {
//                                 ...jobproduct,
//                                 matchedProductForm: matchedData
//                             };
//                         }
//                     }
//                     return jobproduct;
//                 });

//                 // Only keep jobproducts that have matching form data
//                 job.jobproducts = job.jobproducts.filter(jobproduct => jobproduct.matchedProductForm);

//                 // Only return jobs that have at least one matching jobproduct
//                 if (job.jobproducts.length > 0) {
//                     return job;
//                 }
//             }
//             return null;
//         }).filter(job => job !== null);

//         return returnFormatter(true, JobSuccessMessage, mergedJobData);

//     } catch (error) {
//         return returnFormatter(false, error.message);
//     }
// }




export async function raiseCaseExcel(requestsObject) {
    try {
        const workbook = new ExcelJS.Workbook();


        const getDateFilter = (filterType, startDateStr, endDateStr) => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // Helper function to parse dates in DD-MM-YYYY format
            const parseCustomDate = (dateStr) => {
                if (!dateStr) return null;

                // Check if it's in DD-MM-YYYY format
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
                    const year = parseInt(parts[2], 10);

                    // Validate date parts
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        return new Date(year, month, day);
                    }
                }

                // Fallback to standard date parsing
                return new Date(dateStr);
            };

            switch (filterType) {
                case 'today':
                    return {
                        $gte: today,
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Add 1 day
                    };
                case 'week':
                    // Start of current week (Sunday as first day)
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());

                    // End of current week
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 7);

                    return {
                        $gte: startOfWeek,
                        $lt: endOfWeek
                    };
                case 'month':
                    // Start of current month
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                    // Start of next month
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

                    return {
                        $gte: startOfMonth,
                        $lt: endOfMonth
                    };
                case 'custom':
                    // Custom date range
                    if (!startDateStr || !endDateStr) {
                        throw new Error("Custom date range requires both start and end dates");
                    }

                    // Parse the custom date strings
                    const start = parseCustomDate(startDateStr);
                    const end = parseCustomDate(endDateStr);

                    if (!start || !end) {
                        throw new Error("Invalid date format provided for custom range");
                    }

                    // Add one day to end date to include the full end date
                    const adjustedEnd = new Date(end);
                    adjustedEnd.setDate(end.getDate() + 1);

                    return {
                        $gte: start,
                        $lt: adjustedEnd
                    };
                default:
                    // No date filter
                    return null;
            }
        };

        // Get the date filter based on request parameters
        const dateFilter = getDateFilter(
            requestsObject.query.dateFilter,
            requestsObject.query.startDate,
            requestsObject.query.endDate
        );

        let myJob = await jobModel.aggregate([
            {
                $match: {
                    creatorId: new mongoose.Types.ObjectId(requestsObject.query.partnerId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "jobproducts",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "jobproducts",
                },
            },
            // Apply date filter to jobproducts if date filter is specified
            ...(dateFilter ? [{
                $addFields: {
                    jobproducts: {
                        $filter: {
                            input: "$jobproducts",
                            as: "jp",
                            cond: {
                                $and: [
                                    { $gte: ["$$jp.updatedAt", dateFilter.$gte] },
                                    { $lt: ["$$jp.updatedAt", dateFilter.$lt] }
                                ]
                            }
                        }
                    }
                }
            }] : []),
            {
                $lookup: {
                    from: "userproducts",
                    localField: "jobproducts.userProductId",
                    foreignField: "_id",
                    as: "allUserProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        userProduct: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allUserProducts",
                                                        as: "userProduct",
                                                        cond: { $eq: ["$$userProduct._id", "$$jobproduct.userProductId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "allUserProducts.productId",
                    foreignField: "_id",
                    as: "allProducts",
                },
            },
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allProducts",
                                                        as: "product",
                                                        cond: { $eq: ["$$product._id", "$$jobproduct.userProduct.productId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Lookup employee details
            {
                $lookup: {
                    from: "employees",
                    localField: "jobproducts.employeeId",
                    foreignField: "_id",
                    as: "allEmployees",
                },
            },
            // Add employee details to jobproducts
            {
                $addFields: {
                    jobproducts: {
                        $map: {
                            input: "$jobproducts",
                            as: "jobproduct",
                            in: {
                                $mergeObjects: [
                                    "$$jobproduct",
                                    {
                                        employee: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$allEmployees",
                                                        as: "employee",
                                                        cond: { $eq: ["$$employee._id", "$$jobproduct.employeeId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Filter jobproducts based on reportType and stageId
            {
                $addFields: {
                    jobproducts: {
                        $cond: {
                            if: { $eq: ["$reportType", "separated"] },
                            then: {
                                $filter: {
                                    input: "$jobproducts",
                                    as: "jobproduct",
                                    cond: { $eq: ["$$jobproduct.jobStatus", "submitted"] }
                                }
                            },
                            else: {
                                $cond: {
                                    if: { $eq: ["$stageId", 5] },
                                    then: "$jobproducts",
                                    else: []
                                }
                            }
                        }
                    }
                }
            },
            // Filter out jobs with empty jobproducts array
            {
                $match: {
                    jobproducts: { $ne: [] }
                }
            },
            {
                $project: {
                    allUserProducts: 0,
                    allProducts: 0,
                    allEmployees: 0
                }
            }
        ]);
        let requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose.Types.ObjectId(requestsObject.query.partnerId), receiverId: new mongoose.Types.ObjectId(requestsObject.user.serviceId) },
                        { senderId: new mongoose.Types.ObjectId(requestsObject.user.serviceId), receiverId: new mongoose.Types.ObjectId(requestsObject.query.partnerId) }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId", // Assuming receiver is the partner
                    foreignField: "_id",
                    as: "partner"
                }
            },
            { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companies",
                    localField: "partner._id",
                    foreignField: "serviceId",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            {
                $unwind: {
                    path: '$productForm',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'forms',
                    let: {
                        allFields: {
                            $setUnion: [
                                '$productForm.initFields.fields',
                                '$productForm.allocationFields.fields',
                                '$productForm.agentFields.fields',
                                '$productForm.submitFields.fields'
                            ]
                        }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$allFields'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                fieldName: 1,
                                dataType: 1
                            }
                        }
                    ],
                    as: 'formFields'
                }
            },
            {
                $addFields: {
                    'productForm.initFields.fields': {
                        $map: {
                            input: '$productForm.initFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.allocationFields.fields': {
                        $map: {
                            input: '$productForm.allocationFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.agentFields.fields': {
                        $map: {
                            input: '$productForm.agentFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    },
                    'productForm.submitFields.fields': {
                        $map: {
                            input: '$productForm.submitFields.fields',
                            as: 'fieldId',
                            in: {
                                $let: {
                                    vars: {
                                        fieldObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$formFields',
                                                        as: 'form',
                                                        cond: { $eq: ['$$form._id', '$$fieldId'] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    },
                                    in: {
                                        fieldName: '$$fieldObj.fieldName',
                                        dataType: '$$fieldObj.dataType'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    productForms: { $push: '$productForm' }
                }
            },
            {
                $addFields: {
                    'doc.productForm': '$productForms'
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$doc'
                }
            }
        ])



        // Create a Map to store userProductId mapping
        let requestDataMap = new Map();

        // Iterate over filterReqData, as it's an array
        requestData.forEach(req => {
            if (req.productForm && Array.isArray(req.productForm)) {
                req.productForm.forEach(item => {
                    if (item?.userProductId) {
                        const idString = item.userProductId.toString();
                        requestDataMap.set(idString, item);
                    }
                });
            }
        });



        // Merge job data with matched product form and filter out unmatched jobs
        let mergedJobData = myJob.map(job => {

            // Process each job to add matchedProductForm to each jobproduct
            if (job.jobproducts && Array.isArray(job.jobproducts)) {
                // Map over each jobproduct to add matched form data
                job.jobproducts = job.jobproducts.map(jobproduct => {
                    if (jobproduct?.userProductId) {
                        const userProductIdString = jobproduct.userProductId.toString();
                        const matchedData = requestDataMap.get(userProductIdString);

                        if (matchedData) {
                            return {
                                ...jobproduct,
                                matchedProductForm: matchedData
                            };
                        }
                    }
                    return jobproduct;
                });

                // Only keep jobproducts that have matching form data
                job.jobproducts = job.jobproducts.filter(jobproduct => jobproduct.matchedProductForm);

                // Only return jobs that have at least one matching jobproduct
                if (job.jobproducts.length > 0) {
                    return job;
                }
            }
            return null;
        }).filter(job => job !== null);


        // Track sheets that have been created
        const createdSheets = {};

        mergedJobData.forEach((jobData) => {
            const creatorName = jobData.creator.fullName
            jobData.jobproducts.forEach((job) => {
                // Skip if essential data is missing
                if (!job.matchedProductForm?.initFields?.fields || !job.initValues || !job.product?.productName) {
                    console.warn("Skipping job with missing data:", job);
                    return;
                }

                const initFields = job.matchedProductForm.initFields.fields.filter(
                    (field) => {
                        return field.dataType !== "file" && field.dataType !== "multiUpload";
                    }
                );


                const initValues = job.initValues;
                const productName = job.product.productName;


                // Create a safe sheet name (Excel has character limitations)
                const safeProductName = productName.replace(/[\\/*?:[\]]/g, '_').substring(0, 31);

                // Determine which sheet to use
                let targetSheet;

                if (createdSheets[safeProductName]) {
                    // If sheet for this product exists, use it
                    targetSheet = createdSheets[safeProductName];
                } else {
                    // Create new sheet with product name
                    targetSheet = workbook.addWorksheet(safeProductName);
                    createdSheets[safeProductName] = targetSheet;

                    // Add columns with appropriate widths based on data type
                    targetSheet.columns = [
                        { header: "partnerName", key: "partnerName", width: 20 },
                        ...initFields.map(field => {
                            // Determine appropriate width based on field type
                            let width = 15; // Default width

                            // Adjust width based on data type
                            if (field.dataType === "string") {
                                width = 25;
                            } else if (field.dataType === "number") {
                                width = 12;
                            } else if (field.dataType === "date") {
                                width = 15;
                            } else if (field.dataType === "boolean") {
                                width = 10;
                            }

                            return {
                                header: field.fieldName,
                                key: field.fieldName,
                                width: width
                            };
                        })
                    ];
                }

                // Build the row data
                const rowData = {
                    partnerName: creatorName,
                };

                // Add data for each field, handling potential mismatches
                initFields.forEach((field, index) => {
                    if (index < initValues.length) {
                        rowData[field.fieldName] = initValues[index];
                    } else {
                        rowData[field.fieldName] = null; // Handle case where there are fewer values than fields
                    }
                });

                // Add the row to the sheet
                targetSheet.addRow(rowData);
            });
        });

        // Apply some formatting to all sheets
        Object.values(createdSheets).forEach(sheet => {
            // Format header row
            const headerRow = sheet.getRow(1);
            headerRow.font = { bold: true };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' } // Light gray background
            };

            // Auto-filter for all columns
            sheet.autoFilter = {
                from: { row: 1, column: 1 },
                to: { row: 1, column: sheet.columnCount }
            };

            // Freeze the header row
            sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
        });


        const filePath = `./sheet/${requestsObject.user.serviceId}_data_sheet.xlsx`;
        await workbook.xlsx.writeFile(filePath);
        const correctedUrl = filePath.replace("./sheet", "/sheet");

        return returnFormatter(true, "Jobs retrieved successfully", `https://fintech-api.fincooper.in${correctedUrl}`);

    } catch (error) {
        return returnFormatter(false, error.message);
    }
}




//---------------------------------- backoffice work count -----------------------------


export async function backOfficeDashboardCount(reqObj) {
    try {
        let requests = await getPendingJobByPartnerId(reqObj);
        let accepted = await getAcceptedJobByPartnerIdPending(reqObj);

        let alocated = await getAllAllocated(reqObj);
        let finalReview = await getAcceptedJobByPartnerIdCompleted(reqObj);

        const pendingRequests = requests?.data?.length || 0;
        const acceptedRequests = accepted?.data?.length || 0;
        const allocatedJobs = alocated?.data?.length || 0;
        const finalReviewJobs = finalReview?.data?.length || 0;

        const counts = {
            pendingRequests,
            acceptedRequests,
            allocatedJobs,
            finalReviewJobs,
            totalCases: pendingRequests + acceptedRequests + allocatedJobs + finalReviewJobs
        };

        return returnFormatter(true, "Dashboard counts fetched successfully", counts);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
