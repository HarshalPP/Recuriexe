// Expense submission helper functions
import mongoose from "mongoose";
import expenseSubmissionModel from "../../models/expenseModels/expenseSubmission.model.js";
import { returnFormatter, generateUniqueId } from "../../formatters/common.formatter.js";
import { formatExpenseSubmission, formatSubmissionForUpdate } from "../../formatters/expenseFormatter/expenseSubmission.formatter.js";
import { createAuditLog } from "./auditLog.helper.js";

import workflowModel from "../../models/expenseModels/workflow.model.js";
import expenseTypeModel from "../../models/expenseModels/expenseType.model.js";
import dynamicFormModel from "../../models/expenseModels/dynamicForm.model.js";

export async function createExpenseSubmission(submissionData) {
    try {
                const { organizationId, submittedBy, workflowId, expenseTypeId, formData } = submissionData;
                console.log("Creating expense submission with data:", submissionData);

            const workflowExists = await workflowModel.exists({ workflowId, organizationId });
        if (!workflowExists) {
            return returnFormatter(false, `Workflow with ID '${workflowId}' not found`);
        }

        // 2. Check expenseTypeId exists
        const expenseTypeExists = await expenseTypeModel.exists({ expenseTypeId, organizationId });
        if (!expenseTypeExists) {
            return returnFormatter(false, `Expense Type with ID '${expenseTypeId}' not found`);
        }

        // 3. Check formId in formData exists
        // console.log("Checking formData for fieldId:", formData.fieldId);
        //         console.log("Checking ex for fieldId:", expenseTypeExists.formId );

        // if (!expenseTypeExists?.fieldId) {
        //     return returnFormatter(false, "fieldId is required inside formData");
        // }

        // const formExists = await dynamicFormModel.exists({ fieldId: formData.fieldId, organizationId });
        // if (!formExists) {
        //     return returnFormatter(false, `Dynamic Form with ID '${formData.fieldId}' not found`);
        // }
        const formattedData = formatExpenseSubmission(
      submissionData,
      submissionData.organizationId,
      submissionData.submittedBy
    );

        // const formattedData = formatExpenseSubmission(formattedData);
        console.log("Formatted data for submission:", formattedData);
        const newSubmission = new expenseSubmissionModel(formattedData);
        const savedSubmission = await newSubmission.save();
        
        // Create audit log
        await createAuditLog({
            organizationId: submissionData.organizationId,
            entityType: 'ExpenseSubmission',
            entityId: savedSubmission.submissionId,
            action: 'Created',
            performedBy: submissionData.submittedBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            newValues: savedSubmission
        });
        
        return returnFormatter(true, "Expense submission created successfully", savedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// export async function getAllExpenseSubmissions(organizationId, filters) {
//     try {
//         const { page, limit, status, expenseTypeId, submittedBy, startDate, endDate } = filters;
//         const skip = (page - 1) * limit;
        
//         let query = { organizationId, 
//             status: 'Submitted'
//         };
        
//         if (status) query.status = status;
//         if (expenseTypeId) query.expenseTypeId = expenseTypeId;
//         if (submittedBy) query.submittedBy = submittedBy;
        
//         if (startDate || endDate) {
//             query.createdAt = {};
//             if (startDate) query.createdAt.$gte = new Date(startDate);
//             if (endDate) query.createdAt.$lte = new Date(endDate);
//         }
        
//         const submissions = await expenseSubmissionModel
//             .find(query)
//             .select('-__v')
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(parseInt(limit))
//   .populate({
//     path: 'expenseTypeId',
//     model: 'expenseType',
//     localField: 'expenseTypeId',
//     foreignField: 'expenseTypeId',
//     justOne: true,
//     select: '-_id expenseTypeId name'
//   })
//   .populate({
//         path: 'approvedBy',
//         select: 'employeName email' // adjust fields as needed
//     })
//     .populate({
//         path: 'submittedBy',
//         select: 'employeName email' // adjust fields as needed
//     })
//   .populate({
//         path: 'workflowInstance.workflowId',
//     model: 'workflow',
//     localField: 'workflowId',
//     foreignField: 'workflowId',
//     justOne: true,
//     select: '-_id workflowId name'
//   })
//   ;            
//         const total = await expenseSubmissionModel.countDocuments(query);
        
//         const result = {
//             submissions,
//             pagination: {
//                 currentPage: parseInt(page),
//                 totalPages: Math.ceil(total / limit),
//                 totalItems: total,
//                 itemsPerPage: parseInt(limit)
//             }
//         };
        
//         return returnFormatter(true, "Expense submissions retrieved successfully", result);
//     } catch (error) {
//         return returnFormatter(false, error.message);
//     }
// }

// export async function getAllemployeeExpenseSubmissions(organizationId,Id, filters) {
//     try {
//         const { page, limit, status, expenseTypeId, submittedBy, startDate, endDate } = filters;
//         const skip = (page - 1) * limit;
        
//         let query = { organizationId, 
//             submittedBy: Id,
//             status: 'Submitted'
//         };
        
//         if (status) query.status = status;
//         if (expenseTypeId) query.expenseTypeId = expenseTypeId;
//         if (submittedBy) query.submittedBy = submittedBy;
        
//         if (startDate || endDate) {
//             query.createdAt = {};
//             if (startDate) query.createdAt.$gte = new Date(startDate);
//             if (endDate) query.createdAt.$lte = new Date(endDate);
//         }
        
//         const submissions = await expenseSubmissionModel
//             .find(query)
//             .select('-__v')
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(parseInt(limit))
//   .populate({
//     path: 'expenseTypeId',
//     model: 'expenseType',
//     localField: 'expenseTypeId',
//     foreignField: 'expenseTypeId',
//     justOne: true,
//     select: '-_id expenseTypeId name'
//   })
//   .populate({
//         path: 'approvedBy',
//         select: 'employeName email' // adjust fields as needed
//     })
//     .populate({
//         path: 'submittedBy',
//         select: 'employeName email' // adjust fields as needed
//     })
//   .populate({
//         path: 'workflowInstance.workflowId',
//     model: 'workflow',
//     localField: 'workflowId',
//     foreignField: 'workflowId',
//     justOne: true,
//     select: '-_id workflowId name'
//   })
//   ;   
  
//    const formId = submissions.expenseTypeId?.formId;

//     if (formId) {
//       const dynamicForm = await dynamicFormModel.findOne({
//         formId,
//         organizationId,
//         isActive: true
//       });

//       if (dynamicForm?.fields?.length > 0) {
//         const labeledFormData = {};

//         for (const field of dynamicForm.fields) {
//           const rawValue = submissions.formData?.[field.fieldId];
//           labeledFormData[field.label] = rawValue ?? null;
//         }

//         // 🔄 Replace the raw formData with labeled version
//         submissions._doc.formData = labeledFormData;
//       }
//     }
//         const total = await expenseSubmissionModel.countDocuments(query);
        
//         const result = {
//             submissions,
//             pagination: {
//                 currentPage: parseInt(page),
//                 totalPages: Math.ceil(total / limit),
//                 totalItems: total,
//                 itemsPerPage: parseInt(limit)
//             }
//         };


        
//         return returnFormatter(true, "Expense submissions retrieved successfully", result);
//     } catch (error) {
//         return returnFormatter(false, error.message);
//     }
// }

export async function getAllExpenseSubmissions(organizationId,Id, filters) {
  try {
        const { page, limit, status, expenseTypeId, submittedBy, startDate, endDate } = filters;
    const skip = (page - 1) * limit;
  console.log("Id----------",Id)
    let query = { organizationId, status: 'Submitted'};

    if (status) query.status = status;
    if (expenseTypeId) query.expenseTypeId = expenseTypeId;
    if (submittedBy) query.submittedBy = submittedBy;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let submissions = await expenseSubmissionModel
      .find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'expenseTypeId',
        model: 'expenseType',
        localField: 'expenseTypeId',
        foreignField: 'expenseTypeId',
        justOne: true,
        select: '-_id expenseTypeId name formId'
      })
      .populate({
        path: 'approvedBy',
        select: 'employeName email'
      })
      .populate({
        path: 'submittedBy',
        select: 'employeName email'
      })
      .populate({
        path: 'workflowInstance.workflowId',
        model: 'workflow',
        localField: 'workflowId',
        foreignField: 'workflowId',
        justOne: true,
        select: '-_id workflowId name'
      });

    // 💡 Loop through submissions and enrich formData
    for (const submission of submissions) {
      const formId = submission.expenseTypeId?.formId;

      if (formId) {
        const dynamicForm = await dynamicFormModel.findOne({
          formId,
          organizationId,
          isActive: true
        });

        if (dynamicForm?.fields?.length > 0) {
          const enrichedFormData = {};

          for (const field of dynamicForm.fields) {
            const value = submission.formData?.[field.fieldId] ?? null;

            enrichedFormData[field.fieldId] = {
              type: field.fieldType,
              name: field.fieldName,
              value: value
            };
          }

          // Replace raw formData with enriched one
          submission._doc.formData = enrichedFormData;
        }
      }
    }

    const total = await expenseSubmissionModel.countDocuments(query);

    const result = {
      submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    };

    return returnFormatter(true, "Expense submissions retrieved successfully", result);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function getAllemployeeExpenseSubmissions(organizationId,Id, filters) {
  try {
    const { page, limit, status, expenseTypeId, submittedBy, startDate, endDate } = filters;
    const skip = (page - 1) * limit;
  console.log("Id----------",Id)
    let query = { organizationId,submittedBy:Id };

    if (status) query.status = status;
    if (expenseTypeId) query.expenseTypeId = expenseTypeId;
    if (submittedBy) query.submittedBy = submittedBy;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let submissions = await expenseSubmissionModel
      .find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'expenseTypeId',
        model: 'expenseType',
        localField: 'expenseTypeId',
        foreignField: 'expenseTypeId',
        justOne: true,
        select: '-_id expenseTypeId name formId'
      })
      .populate({
        path: 'approvedBy',
        select: 'employeName email'
      })
      .populate({
        path: 'submittedBy',
        select: 'employeName email'
      })
      .populate({
        path: 'workflowInstance.workflowId',
        model: 'workflow',
        localField: 'workflowId',
        foreignField: 'workflowId',
        justOne: true,
        select: '-_id workflowId name'
      });

    // 💡 Loop through submissions and enrich formData
    for (const submission of submissions) {
      const formId = submission.expenseTypeId?.formId;

      if (formId) {
        const dynamicForm = await dynamicFormModel.findOne({
          formId,
          organizationId,
          isActive: true
        });

        if (dynamicForm?.fields?.length > 0) {
          const enrichedFormData = {};

          for (const field of dynamicForm.fields) {
            const value = submission.formData?.[field.fieldId] ?? null;

            enrichedFormData[field.fieldId] = {
              type: field.fieldType,
              name: field.fieldName,
              value: value
            };
          }

          // Replace raw formData with enriched one
          submission._doc.formData = enrichedFormData;
        }
      }
    }

    const total = await expenseSubmissionModel.countDocuments(query);

    const result = {
      submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    };

    return returnFormatter(true, "Expense submissions retrieved successfully", result);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


export async function getExpenseSubmissionById1(submissionId, organizationId) {
    try {
        const submission = await expenseSubmissionModel.findOne({
            submissionId, 
            organizationId ,
        }).select('-__v')
         .populate({
    path: 'expenseTypeId',
    model: 'expenseType',
    localField: 'expenseTypeId',
    foreignField: 'expenseTypeId',
    justOne: true,
    select: '-_id expenseTypeId name'
  })
  .populate({
        path: 'approvedBy',
        select: 'employeName email' // adjust fields as needed
    })
    .populate({
        path: 'submittedBy',
        select: 'employeName email' // adjust fields as needed
    })
  .populate({
        path: 'workflowInstance.workflowId',
    model: 'workflow',
    localField: 'workflowId',
    foreignField: 'workflowId',
    justOne: true,
    select: '-_id workflowId name'
  });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        return returnFormatter(true, "Expense submission retrieved successfully", submission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getExpenseSubmissionById(submissionId, organizationId) {
  try {
    const submission = await expenseSubmissionModel.findOne({
      submissionId,
      organizationId
    }).select('-__v')
       .populate({
    path: 'expenseTypeId',
    model: 'expenseType',
    localField: 'expenseTypeId',
    foreignField: 'expenseTypeId',
    justOne: true,
    select: '-_id expenseTypeId name formId'
  })
  .populate({
        path: 'approvedBy',
        select: 'employeName email' // adjust fields as needed
    })
    .populate({
        path: 'submittedBy',
        select: 'employeName email' // adjust fields as needed
    })
  .populate({
        path: 'workflowInstance.workflowId',
    model: 'workflow',
    localField: 'workflowId',
    foreignField: 'workflowId',
    justOne: true,
    select: '-_id workflowId name'
  });

    // if (!submission) {
    //   return returnFormatter(false, "Expense submission not found");
    // }

    // const formId = submission.expenseTypeId?.formId;

    // if (formId) {
    //   const dynamicForm = await dynamicFormModel.findOne({
    //     formId,
    //     organizationId,
    //     isActive: true
    //   });

    //   if (dynamicForm) {
    //     const enrichedFormData = dynamicForm.fields.map(field => ({
    //       fieldId: field.fieldId,
    //       label: field.label,
    //       fieldType: field.fieldType,
    //       value: submission.formData?.[field.fieldId] ?? null
    //     }));

    //     submission._doc.enrichedFormData = enrichedFormData;
    //   }
    // }
    if (!submission) {
      return returnFormatter(false, "Expense submission not found1");
    }

    // 👇 Extract formId from populated expenseType
    const formId = submission.expenseTypeId?.formId;

    if (formId) {
      const dynamicForm = await dynamicFormModel.findOne({
        formId,
        organizationId,
        isActive: true
      });

      if (dynamicForm?.fields?.length > 0) {
        const labeledFormData = {};

        for (const field of dynamicForm.fields) {
          const rawValue = submission.formData?.[field.fieldId];
          labeledFormData[field.label] = rawValue ?? null;
        }

        // 🔄 Replace the raw formData with labeled version
        submission._doc.formData = labeledFormData;
      }
    }


    return returnFormatter(true, "Expense submission retrieved successfully", submission);

  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


export async function updateExpenseSubmissionData(submissionId, updateData, organizationId, updatedBy) {
    try {
        const existingSubmission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!existingSubmission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        // Only allow updates if submission is in draft status
        if (existingSubmission.status !== 'Draft') {
            return returnFormatter(false, "Cannot update submission in current status");
        }
        
        const formattedData = formatSubmissionForUpdate(updateData);
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            formattedData,
            { new: true }
        ).select('-__v');
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Updated',
            performedBy: updatedBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            oldValues: existingSubmission,
            newValues: updatedSubmission
        });
        
        return returnFormatter(true, "Expense submission updated successfully", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function deleteExpenseSubmissionData(submissionId, organizationId, deletedBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        // Only allow deletion if submission is in draft status
        if (submission.status !== 'Draft') {
            return returnFormatter(false, "Cannot delete submission in current status");
        }
        
        await expenseSubmissionModel.findOneAndDelete({ submissionId });
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Deleted',
            performedBy: deletedBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            oldValues: submission
        });
        
        return returnFormatter(true, "Expense submission deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


export async function approveExpenseSubmission(submissionId, comments, approvedAmount, organizationId, approvedBy,status,rejectionReason,rejectedBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId,
            organizationId
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        if (submission.status !== 'Submitted') {
            return returnFormatter(false, "Invalid submission status for approval");
        }
        
        const workflow = await workflowModel.findOne({
            workflowId: submission.workflowInstance.workflowId,
            organizationId
        });
        console.log("Workflow for approval:", workflow);
        // if (!workflow) {
        //     return returnFormatter(false, "Workflow not found for this submission");
        // }
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            { 
                status: status,
                approvedAt: new Date(),
                approvedBy,
                approvedAmount: approvedAmount || submission.totalAmount,
                rejectionReason: rejectionReason || "",

                $push: {
                    'workflowInstance.stageHistory': {
                        stageId: submission.workflowInstance.currentStageId,
                        stageName: submission.workflowInstance.currentStageName,
                        assignedTo: submission.workflowInstance.currentAssignee,
                        action: status,
                        comments: comments || status,
                        actionDate: new Date()
                    }
                }
            },
            { new: true }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Approved',
            performedBy: approvedBy,
            performedByName: 'Manager',
            performedByRole: 'Manager',
            newValues: updatedSubmission,
            comments: comments || 'Approved'
        });
        
        return returnFormatter(true, "Expense submission approved", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function withdrawExpenseSubmission(submissionId, organizationId, withdrawnBy) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        });
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        if (submission.submittedBy !== withdrawnBy) {
            return returnFormatter(false, "You can only withdraw your own submissions");
        }
        
        if (submission.status === 'Approved' || submission.status === 'Rejected') {
            return returnFormatter(false, "Cannot withdraw processed submission");
        }
        
        const updatedSubmission = await expenseSubmissionModel.findOneAndUpdate(
            { submissionId },
            { 
                status: 'Withdrawn',
                $push: {
                    'workflowInstance.stageHistory': {
                        stageId: submission.workflowInstance.currentStageId,
                        stageName: submission.workflowInstance.currentStageName,
                        assignedTo: submission.workflowInstance.currentAssignee,
                        action: 'Returned',
                        comments: 'Withdrawn by submitter',
                        actionDate: new Date()
                    }
                }
            },
            { new: true }
        );
        
        // Create audit log
        await createAuditLog({
            organizationId,
            entityType: 'ExpenseSubmission',
            entityId: submissionId,
            action: 'Withdrawn',
            performedBy: withdrawnBy,
            performedByName: 'Employee',
            performedByRole: 'Employee',
            newValues: updatedSubmission,
            comments: 'Withdrawn by submitter'
        });
        
        return returnFormatter(true, "Expense submission withdrawn", updatedSubmission);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSubmissionsByUser(userId, organizationId, filters) {
    try {
        const { page, limit, status } = filters;
        const skip = (page - 1) * limit;
        
        let query = { submittedBy: userId, organizationId };
        
        if (status) query.status = status;
        
        const submissions = await expenseSubmissionModel
            .find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await expenseSubmissionModel.countDocuments(query);
        
        const result = {
            submissions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "User submissions retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSubmissionsForApproval(userId, organizationId, filters) {
    try {
        const { page, limit, priority } = filters;
        const skip = (page - 1) * limit;
        
        let query = {
            organizationId,
            status: { $in: ['Submitted', 'In_Review'] },
            'workflowInstance.currentAssignee': userId
        };
        
        if (priority) {
            query.priority = priority;
        }
        
        const submissions = await expenseSubmissionModel
            .find(query)
            .select('-__v')
            .sort({ 
                priority: -1, 
                createdAt: 1 
            })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await expenseSubmissionModel.countDocuments(query);
        
        const result = {
            submissions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "Approval queue retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getSubmissionHistory(submissionId, organizationId) {
    try {
        const submission = await expenseSubmissionModel.findOne({ 
            submissionId, 
            organizationId 
        }).select('workflowInstance.stageHistory submissionId');
        
        if (!submission) {
            return returnFormatter(false, "Expense submission not found");
        }
        
        return returnFormatter(true, "Submission history retrieved successfully", submission.workflowInstance.stageHistory);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function bulkApproveSubmissions(submissionIds, comments, organizationId, approvedBy) {
    try {
        const results = [];
        
        for (const submissionId of submissionIds) {
            const result = await approveExpenseSubmission(
                submissionId, 
                comments, 
                null, // Use original amount
                organizationId, 
                approvedBy
            );
            results.push({
                submissionId,
                success: result.status,
                message: result.message
            });
        }
        
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        return returnFormatter(
            true, 
            `Bulk approval completed: ${successCount}/${totalCount} successful`, 
            results
        );
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function exportSubmissions(organizationId, filters) {
    try {
        const { format, startDate, endDate, status } = filters;
        
        let query = { organizationId };
        
        if (status) query.status = status;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const submissions = await expenseSubmissionModel
            .find(query)
            .select('-__v -workflowInstance.stageHistory')
            .sort({ createdAt: -1 });
        
        if (format === 'csv') {
            // Convert to CSV format
            const csvHeader = 'Submission ID,Expense Type,Amount,Status,Submitted By,Created At,Description\n';
            const csvData = submissions.map(sub => 
                `${sub.submissionId},${sub.expenseTypeId},${sub.totalAmount},${sub.status},${sub.submittedBy},${sub.createdAt},"${sub.formData?.description || ''}"`
            ).join('\n');
            
            return returnFormatter(true, "CSV export generated", csvHeader + csvData);
        } else {
            return returnFormatter(true, "JSON export generated", submissions);
        }
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function validateSubmissionData(formData, expenseTypeId) {
    try {
        const validationErrors = [];
        
        // Basic validations
        if (!formData.description) {
            validationErrors.push("Description is required");
        }
        
        if (!formData.amount || formData.amount <= 0) {
            validationErrors.push("Valid amount is required");
        }
        
        if (validationErrors.length > 0) {
            return returnFormatter(false, "Validation failed", { errors: validationErrors });
        }
        
        return returnFormatter(true, "Validation successful", { isValid: true });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function calculateTotalAmount(formData) {
    try {
        let total = 0;
        
        // Calculate based on form data structure
        if (formData.amount) {
            total += parseFloat(formData.amount);
        }
        
        // Add any additional amounts from line items
        if (formData.lineItems && Array.isArray(formData.lineItems)) {
            total += formData.lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        }
        
        return returnFormatter(true, "Amount calculated successfully", { total });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAllSubmission(employee, queryParams) {
    try {
        const organizationId = employee.organizationId;
        const employeeId = employee.id;

        const {
            status,
            allDataShow,
            page = 1,
            limit = 10
        } = queryParams;

        if (!organizationId) {
            return returnFormatter(false, "Missing organizationId in token");
        }

        const filter = { organizationId };

        if (allDataShow !== "all") {
            filter.submittedBy = employeeId;
        }

        // if (interviewType) {
        //     filter.interviewType = new RegExp("^" + interviewType + "$", "i");
        // }

        if (status) {
            const statusArray = status.split(",").map(s => s.trim().toLowerCase());
            filter.status = { $in: statusArray };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [interviews, total] = await Promise.all([
            expenseSubmissionModel.find(filter)
                .select("-__v")
                .populate({
                    path: "candidateId",
                    select: "name emailId mobileNumber position jobPostId"
                })
                .populate({
                    path: "interviewerId",
                    select: "userName workEmail mobileNo"
                })
                .sort({ scheduleDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),

            InterviewDetailModel.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return returnFormatter(true, "Scheduled interviews fetched successfully", {
            totalRecords: total,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit),
            interviews
        });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// export async function getDashboardData(organizationId, page = 1, limit = 5) {
//   try {
//     const orgObjectId = new mongoose.Types.ObjectId(organizationId);
//     const skip = (page - 1) * limit;

//     const [
//       totalExpensesAgg,
//       pendingApprovalsAgg,
//       budgetUtilAgg,
//       approvedCount,
//       rejectedCount,
//       recentExpensesData,
//       recentTotalCount,
//       pendingApprovalsListData,
//       pendingTotalCount
//     ] = await Promise.all([
//       // Total Approved Amount
//       expenseSubmissionModel.aggregate([
//         { $match: { organizationId: orgObjectId, isActive: true, status: "Approved" } },
//         { $group: { _id: null, total: { $sum: "$approvedAmount" } } }
//       ]),

//       // Pending Approvals Count
//       expenseSubmissionModel.aggregate([
//         { $match: { organizationId: orgObjectId, status: "Submitted", isActive: true } },
//         { $count: "pendingApprovals" }
//       ]),

//       // Budget Utilization
//       expenseSubmissionModel.aggregate([
//         { $match: { organizationId: orgObjectId, isActive: true, status: "Approved" } },
//         { $group: { _id: null, totalApprovedAmount: { $sum: "$approvedAmount" } } },
//         { $project: { totalApprovedAmount: 1, _id: 0 } }
//       ]),

//       // Approved Count
//       expenseSubmissionModel.countDocuments({
//         organizationId: orgObjectId,
//         status: "Approved",
//         isActive: true
//       }),

//       // Rejected Count
//       expenseSubmissionModel.countDocuments({
//         organizationId: orgObjectId,
//         status: "Rejected",
//         isActive: true
//       }),

//       // Recent Approved/Rejected Expenses (Paginated)
//       expenseSubmissionModel.find({
//         organizationId: orgObjectId,
//         status: { $in: ["Approved", "Rejected"] }
//       }, {
//         submissionId: 1,
//         formData: 1,
//         status: 1,
//         approvedAmount: 1,
//         createdAt: 1
//       }).sort({ createdAt: -1 }).skip(skip).limit(limit),

//       // Total Count for Recent Expenses
//       expenseSubmissionModel.countDocuments({
//         organizationId: orgObjectId,
//         status: { $in: ["Approved", "Rejected"] }
//       }),

//       // Pending Approvals List (Paginated)
//       expenseSubmissionModel.find({
//         organizationId: orgObjectId,
//         status: "Submitted"
//       }).populate("submittedBy", "employeName email").sort({ createdAt: -1 }).skip(skip).limit(limit),

//       // Total Count for Pending Approvals List
//       expenseSubmissionModel.countDocuments({
//         organizationId: orgObjectId,
//         status: "Submitted"
//       })
//     ]);

//     return returnFormatter(true, "Dashboard data fetched successfully", {
//       totalExpenses: totalExpensesAgg[0]?.total || 0,
//       budgetUtilization: budgetUtilAgg[0]?.totalApprovedAmount || 0,
//       pendingApprovals: pendingApprovalsAgg[0]?.pendingApprovals || 0,
//       approvedCount,
//       rejectedCount,

//       recentExpenses: {
//          recentExpensesData,
//         pagination: {
//           currentPage: parseInt(page),
//           itemsPerPage: parseInt(limit),
//           totalItems: recentTotalCount,
//           totalPages: Math.ceil(recentTotalCount / limit)
//         }
//       },

//       pendingApprovalsList: {
//          pendingApprovalsListData,
//         pagination: {
//           currentPage: parseInt(page),
//           itemsPerPage: parseInt(limit),
//           totalItems: pendingTotalCount,
//           totalPages: Math.ceil(pendingTotalCount / limit)
//         }
//       }
//     });

//   } catch (error) {
//     return returnFormatter(false, error.message);
//   }
// }

export const expenseSubmissionPopulates = [
  {
    path: 'expenseTypeId',
    model: 'expenseType',
    localField: 'expenseTypeId',
    foreignField: 'expenseTypeId',
    justOne: true,
    select: '-_id expenseTypeId name formId'
  },
  {
    path: 'approvedBy',
    select: 'employeName email'
  },
  {
    path: 'submittedBy',
    select: 'employeName email'
  }
//   {
//     path: 'workflowInstance.workflowId',
//     model: 'workflow',
//     localField: 'workflowId',
//     foreignField: 'workflowId',
//     justOne: true,
//     select: '-_id workflowId name'
//   }
];


export async function enrichFormDataList(submissions, organizationId) {
  for (const submission of submissions) {
    const formId = submission.expenseTypeId?.formId;

    if (formId) {
      const dynamicForm = await dynamicFormModel.findOne({
        formId,
        organizationId,
        isActive: true
      });

      if (dynamicForm?.fields?.length > 0) {
        const enrichedFormData = {};

        for (const field of dynamicForm.fields) {
          const value = submission.formData?.[field.fieldId] ?? null;

          enrichedFormData[field.fieldId] = {
            type: field.fieldType,
            name: field.fieldName,
            value: value
          };
        }

        submission._doc.formData = enrichedFormData;
      }
    }
  }

  return submissions;
}



export async function getDashboardData(organizationId, page = 1, limit = 5) {
  try {
    const orgObjectId = new mongoose.Types.ObjectId(organizationId);
    const skip = (page - 1) * limit;

    const [
      totalExpensesAgg,
      pendingApprovalsAgg,
      budgetUtilAgg,
      approvedCount,
      rejectedCount,
      recentExpensesData,
      recentTotalCount,
      pendingApprovalsListData,
      pendingTotalCount
    ] = await Promise.all([
      expenseSubmissionModel.aggregate([
        { $match: { organizationId: orgObjectId, isActive: true, status: "Approved" } },
        { $group: { _id: null, total: { $sum: "$approvedAmount" } } }
      ]),
      expenseSubmissionModel.aggregate([
        { $match: { organizationId: orgObjectId, status: "Submitted", isActive: true } },
        { $count: "pendingApprovals" }
      ]),
      expenseSubmissionModel.aggregate([
        { $match: { organizationId: orgObjectId, isActive: true, status: "Approved" } },
        { $group: { _id: null, totalApprovedAmount: { $sum: "$approvedAmount" } } },
        { $project: { totalApprovedAmount: 1, _id: 0 } }
      ]),
      expenseSubmissionModel.countDocuments({
        organizationId: orgObjectId,
        status: "Approved",
        isActive: true
      }),
      expenseSubmissionModel.countDocuments({
        organizationId: orgObjectId,
        status: "Rejected",
        isActive: true
      }),

      expenseSubmissionModel.find({
        organizationId: orgObjectId,
        status: { $in: ["Approved", "Rejected"] }
      })
        .select('-__v -isDraft -internalNotes -schemaVersion -rejectionReason -_id -workflowInstance') // ❌ exclude these

      .populate(expenseSubmissionPopulates)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

      expenseSubmissionModel.countDocuments({
        organizationId: orgObjectId,
        status: { $in: ["Approved", "Rejected"] }
      }),

      expenseSubmissionModel.find({
        organizationId: orgObjectId,
        status: "Submitted"
      })
    .select('-__v -isDraft -internalNotes -schemaVersion -rejectionReason -_id -workflowInstance') // ❌ exclude these

      .populate(expenseSubmissionPopulates)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

      expenseSubmissionModel.countDocuments({
        organizationId: orgObjectId,
        status: "Submitted"
      })
    ]);

   
    await enrichFormDataList(recentExpensesData, organizationId);
await enrichFormDataList(pendingApprovalsListData, organizationId);

    return returnFormatter(true, "Dashboard data fetched successfully", {
      totalExpenses: totalExpensesAgg[0]?.total || 0,
      budgetUtilization: budgetUtilAgg[0]?.totalApprovedAmount || 0,
      pendingApprovals: pendingApprovalsAgg[0]?.pendingApprovals || 0,
      approvedCount,
      rejectedCount,

      recentExpenses: {
         ...recentExpensesData,
        pagination: {
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          totalItems: recentTotalCount,
          totalPages: Math.ceil(recentTotalCount / limit)
        },
      },

      pendingApprovalsList: {
       ...pendingApprovalsListData,
        pagination: {
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          totalItems: pendingTotalCount,
          totalPages: Math.ceil(pendingTotalCount / limit)
        }
      }
    });

  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
