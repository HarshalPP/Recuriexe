import auditLogModel from "../../models/expenseModels/auditLog.model.js";
import { returnFormatter, generateUniqueId } from "../../formatters/common.formatter.js";

export async function createAuditLog(auditData) {
    try {
        const formattedAuditLog = {
            auditId: generateUniqueId('AUDIT_'),
            organizationId: auditData.organizationId,
            entityType: auditData.entityType,
            entityId: auditData.entityId,
            action: auditData.action,
            performedBy: auditData.performedBy,
            performedByName: auditData.performedByName || 'Unknown User',
            performedByRole: auditData.performedByRole || 'Unknown Role',
            oldValues: auditData.oldValues || {},
            newValues: auditData.newValues || {},
            changes: calculateChanges(auditData.oldValues, auditData.newValues),
            comments: auditData.comments || '',
            ipAddress: auditData.ipAddress || '',
            userAgent: auditData.userAgent || '',
            metadata: auditData.metadata || {}
        };
        
        const auditLog = new auditLogModel(formattedAuditLog);
        await auditLog.save();
        
        return returnFormatter(true, "Audit log created successfully", auditLog);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAuditLogs(organizationId, filters) {
    try {
        const { page, limit, entityType, entityId, action, performedBy, startDate, endDate } = filters;
        const skip = (page - 1) * limit;
        
        let query = { organizationId };
        
        if (entityType) query.entityType = entityType;
        if (entityId) query.entityId = entityId;
        if (action) query.action = action;
        if (performedBy) query.performedBy = performedBy;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const auditLogs = await auditLogModel
            .find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await auditLogModel.countDocuments(query);
        
        const result = {
            auditLogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "Audit logs retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAuditLogsByEntity(organizationId, entityType, entityId) {
    try {
        const auditLogs = await auditLogModel
            .find({ 
                organizationId, 
                entityType, 
                entityId 
            })
            .select('-__v')
            .sort({ createdAt: -1 });
        
        return returnFormatter(true, "Entity audit trail retrieved successfully", auditLogs);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getUserActivity(organizationId, userId, filters = {}) {
    try {
        const { page = 1, limit = 20, startDate, endDate } = filters;
        const skip = (page - 1) * limit;
        
        let query = { organizationId, performedBy: userId };
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const activities = await auditLogModel
            .find(query)
            .select('entityType entityId action createdAt comments')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await auditLogModel.countDocuments(query);
        
        const result = {
            activities,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
        
        return returnFormatter(true, "User activity retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

function calculateChanges(oldValues, newValues) {
    const changes = [];
    
    if (!oldValues || !newValues) {
        return changes;
    }
    
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    
    for (const key of allKeys) {
        const oldValue = oldValues[key];
        const newValue = newValues[key];
        
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
                field: key,
                oldValue: oldValue,
                newValue: newValue
            });
        }
    }
    
    return changes;
}

export async function getAuditStatistics(organizationId, timeFrame = '30d') {
    try {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeFrame) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }
        
        const stats = await auditLogModel.aggregate([
            {
                $match: {
                    organizationId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        action: '$action',
                        entityType: '$entityType'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.action',
                    entities: {
                        $push: {
                            entityType: '$_id.entityType',
                            count: '$count'
                        }
                    },
                    totalCount: { $sum: '$count' }
                }
            }
        ]);
        
        const totalActivities = await auditLogModel.countDocuments({
            organizationId,
            createdAt: { $gte: startDate, $lte: endDate }
        });
        
        const result = {
            timeFrame,
            totalActivities,
            actionBreakdown: stats
        };
        
        return returnFormatter(true, "Audit statistics retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
