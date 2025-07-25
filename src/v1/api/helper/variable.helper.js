import mongoose from "mongoose";
import { returnFormatter } from "../formatters/common.formatter.js";
import partnerRequestModel from "../models/partnerRequestModel/partnerRequest.model.js";
import variableModel from "../models/variableModel/variable.model.js";
import companyModel from "../models/companyModel/company.model.js";
import { getAllInitFields } from "./initFields.helper.js";

//----------------------------   add variable ------------------------------

export async function addVariable(requestsObject) {
    try {
        const newData = await variableModel.create({serviceId:requestsObject.user.serviceId,variableName:`{${requestsObject.body.variableName}}`})
        return returnFormatter(true,"Variable created succesfully" )
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


//----------------------------   add auto varible ------------------------------

// export async function addVariableAuto(requestsObject) {
//     try {
//         let requestData = await partnerRequestModel.aggregate([
//             {
//                 $match: {
//                     senderId: new mongoose.Types.ObjectId(requestsObject.user.serviceId)
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "receiverId",
//                     foreignField: "_id",
//                     as: "partner"
//                 }
//             },
//             { $unwind: { path: "$partner", preserveNullAndEmptyArrays: true } },
//             {
//                 $lookup: {
//                     from: "companies",
//                     localField: "partner._id",
//                     foreignField: "serviceId",
//                     as: "company"
//                 }
//             },
//             { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
//             {
//                 $unwind: {
//                     path: "$productForm",
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "forms",
//                     let: {
//                         allFields: {
//                             $setUnion: [
//                                 { $ifNull: ["$productForm.initFields.fields", []] },
//                                 { $ifNull: ["$productForm.allocationFields.fields", []] },
//                                 { $ifNull: ["$productForm.agentFields.fields", []] },
//                                 { $ifNull: ["$productForm.submitFields.fields", []] }
//                             ]
//                         }
//                     },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $in: ["$_id", "$$allFields"] }
//                             }
//                         },
//                         {
//                             $project: {
//                                 _id: 1,
//                                 fieldName: 1,
//                                 dataType: 1
//                             }
//                         }
//                     ],
//                     as: "formFields"
//                 }
//             },
//             {
//                 $addFields: {
//                     ...["initFields", "allocationFields", "agentFields", "submitFields"].reduce((acc, fieldType) => {
//                         acc[`productForm.${fieldType}.fields`] = {
//                             $map: {
//                                 input: { $ifNull: [`$productForm.${fieldType}.fields`, []] },
//                                 as: "fieldId",
//                                 in: {
//                                     $let: {
//                                         vars: {
//                                             fieldObj: {
//                                                 $arrayElemAt: [
//                                                     {
//                                                         $filter: {
//                                                             input: "$formFields",
//                                                             as: "form",
//                                                             cond: { $eq: ["$$form._id", "$$fieldId"] }
//                                                         }
//                                                     },
//                                                     0
//                                                 ]
//                                             }
//                                         },
//                                         in: {
//                                             fieldName: "$$fieldObj.fieldName",
//                                             dataType: "$$fieldObj.dataType"
//                                         }
//                                     }
//                                 }
//                             }
//                         };
//                         return acc;
//                     }, {})
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$_id",
//                     doc: { $first: "$$ROOT" },
//                     productForms: { $push: "$productForm" }
//                 }
//             },
//             {
//                 $addFields: {
//                     "doc.productForm": "$productForms"
//                 }
//             },
//             {
//                 $replaceRoot: {
//                     newRoot: "$doc"
//                 }
//             }
//         ]);

//         // Array to collect all field names from forms
//         let allFieldNames = [];

//         // Iterate through each request's product form
//         requestData.forEach((data) => {
//             const productForm = data.productForm;

//             if (Array.isArray(productForm)) {
//                 productForm.forEach(form => {
//                     // Extract from initFields
//                     if (Array.isArray(form?.initFields?.fields)) {
//                         form.initFields.fields.forEach(field => {
//                             if (field.fieldName) allFieldNames.push(field.fieldName);
//                         });
//                     }

//                     // Extract from allocationFields
//                     if (Array.isArray(form?.allocationFields?.fields)) {
//                         form.allocationFields.fields.forEach(field => {
//                             if (field.fieldName) allFieldNames.push(field.fieldName);
//                         });
//                     }

//                     // Extract from agentFields
//                     if (Array.isArray(form?.agentFields?.fields)) {
//                         form.agentFields.fields.forEach(field => {
//                             if (field.fieldName) allFieldNames.push(field.fieldName);
//                         });
//                     }

//                     // Extract from submitFields
//                     if (Array.isArray(form?.submitFields?.fields)) {
//                         form.submitFields.fields.forEach(field => {
//                             if (field.fieldName) allFieldNames.push(field.fieldName);
//                         });
//                     }
//                 });
//             }
//         });

//         // Remove duplicates from the array
//         allFieldNames = [...new Set(allFieldNames)];

//         // Format all field names as variables
//         const variableNames = allFieldNames.map(name => `{${name}}`);

//         // Get all existing variables for this service
//         const existingVariables = await variableModel.find({
//             serviceId: requestsObject.user.serviceId
//         });

//         // Extract just the variable names from existing variables
//         const existingVariableNames = existingVariables.map(v => v.variableName);

//         // Filter out variables that already exist
//         const newVariablesToCreate = variableNames.filter(varName =>
//             !existingVariableNames.includes(varName)
//         );

//         // Create all new variables in bulk
//         if (newVariablesToCreate.length > 0) {
//             const variablesToInsert = newVariablesToCreate.map(variableName => ({
//                 serviceId: requestsObject.user.serviceId,
//                 variableName
//             }));

//             await variableModel.insertMany(variablesToInsert);

//             return returnFormatter(true, `${newVariablesToCreate.length} new variables created successfully`);
//         } else {
//             return returnFormatter(true, "No new variables to create");
//         }
//     } catch (error) {
//         return returnFormatter(false, error.message);
//     }
// }





// --------------------- update Variable -----------------------

export async function updateVaribleById(requestsObject) {
    try {
       let isVarible = await variableModel.findById(requestsObject.body.varId);
       if(!isVarible){
        return returnFormatter(false,"No variable found")
       }
       await variableModel.findByIdAndUpdate(requestsObject.body.varId,{...requestsObject.body},{new:true});
        return returnFormatter(true, "Data updated succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// --------------------- delete variable -----------------------

export async function removeVaribale(varId) {
    try {
        let isVarible = await variableModel.findById(varId);
        if(!isVarible){
         return returnFormatter(false,"No variable found")
        }
         await variableModel.findByIdAndDelete(varId);
        return returnFormatter(true, "Data deleted succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get variable -----------------------

export async function getVaribleById(varId) {
    try {
        const varData = await variableModel.findById(varId)
              
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get all varible -----------------------

export async function getAllVarible(requestsObject) {
    try {
        const varData = await variableModel.find({serviceId:requestsObject.user.serviceId});
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}




// --------------------------------------------- updated according to sir ----------------------------------------

export async function addVariableAuto(requestsObject) {
  try {
    const serviceId = new mongoose.Types.ObjectId(requestsObject.employee.organizationId);

    // Step 1: Get all initial fields
    const initData = await getAllInitFields(requestsObject);

    if (!initData.data.length) {
      return returnFormatter(true, "No init data found", []);
    }

    // Step 2: Find the company (you might use this later, so I kept it)
    const company = await companyModel.findOne({ organizationId:serviceId });

    // Step 3: Determine partnerId

    // Step 4: Aggregate requests with form fields
   const requestData = await partnerRequestModel.aggregate([
  {
    $match: {
      
      $or: [
        { senderId: serviceId },
      ]
    }
  },
  {
    $lookup: {
      from: "organizations",
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
      foreignField: "organizationId",
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
            { $ifNull: ["$productForm.initFields.fields", []] },
            { $ifNull: ["$productForm.allocationFields.fields", []] },
            { $ifNull: ["$productForm.agentFields.fields", []] },
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
            dataType: 1
          }
        }
      ],
      as: "formFields"
    }
  },
  {
    $addFields: {
      // Handle initFields, allocationFields, agentFields
      "productForm.initFields.fields": {
        $map: {
          input: { $ifNull: ["$productForm.initFields.fields", []] },
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
      },
      "productForm.allocationFields.fields": {
        $map: {
          input: { $ifNull: ["$productForm.allocationFields.fields", []] },
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
      },
      "productForm.agentFields.fields": {
        $map: {
          input: { $ifNull: ["$productForm.agentFields.fields", []] },
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
      },
      // Handle submitFields (special case with fieldId structure)
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
                    },
                    0
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
]);

    // Step 5: Extract all field names
    let allFieldNames = [];
    requestData.forEach(data => {
      const productForms = data.productForm || [];
      productForms.forEach(form => {
        ["initFields", "allocationFields", "agentFields", "submitFields"].forEach(section => {
          const fields = form?.[section]?.fields || [];
          fields.forEach(field => {
            if (field.fieldName) allFieldNames.push(field.fieldName);
          });
        });
      });
    });

    // Remove duplicates
    allFieldNames = [...new Set(allFieldNames)];

    // Step 6: Combine with default field names
    const defaultFieldNames = [
      "allocatedOfficeEmp",
      "workStatus",
      "allocatedDate",
      "initiatedDate",
      "doneBy",
      "reportStatus",
      "serviceName",
      "partnerName",
      "reportType"
    ];

    const combinedFieldNames = [...new Set([...allFieldNames, ...defaultFieldNames])];

    // Format as {variableName}
    const variableNames = combinedFieldNames.map(name => `{${name}}`);

    // Step 7: Get existing variables
    const existingVariables = await variableModel.find({
      organizationId: requestsObject.employee.organizationId
    });
    const existingVariableNames = existingVariables.map(v => v.variableName);

    // Step 8: Filter out already existing variables
    const newVariablesToCreate = variableNames.filter(varName => !existingVariableNames.includes(varName));

    // Step 9: Insert new variables
    if (newVariablesToCreate.length > 0) {
      const variablesToInsert = newVariablesToCreate.map(variableName => ({
        organizationId: requestsObject.employee.organizationId,
        variableName
      }));

      await variableModel.insertMany(variablesToInsert);

      return returnFormatter(true, `${newVariablesToCreate.length} new variables created successfully`, newVariablesToCreate);
    } else {
      return returnFormatter(true, "No new variables to create");
    }

  } catch (error) {
    console.error("Error in addVariableAuto:", error);
    return returnFormatter(false, error.message || "Unexpected error occurred");
  }
}
