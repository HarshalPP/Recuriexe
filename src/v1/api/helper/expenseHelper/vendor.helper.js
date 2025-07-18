import vendorModel from "../../models/expenseModels/vendor.model.js";
import { returnFormatter, generateUniqueId } from "../../formatters/common.formatter.js";
import { formatVendorCreation, formatVendorForUpdate } from "../../formatters/expenseFormatter/vendor.formatter.js";
import { createAuditLog } from "./auditLog.helper.js";

export async function createVendor(vendorData, organizationId, createdBy) {
    try {
        const formattedData = formatVendorCreation(vendorData, organizationId, createdBy);
        const newVendor = new vendorModel(formattedData);
        const savedVendor = await newVendor.save();

        // Audit Log
        await createAuditLog({
            organizationId,
            entityType: 'Vendor',
            entityId: savedVendor.vendorId,
            action: 'Created',
            performedBy: createdBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            newValues: savedVendor
        });

        return returnFormatter(true, "Vendor created successfully", savedVendor);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getAllVendors(organizationId, filters = {}) {
    try {
        const { page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;
        console.log("Organization ID:", organizationId);

        const query = { organizationId};

        const vendors = await vendorModel.find(query)
            .select('-__v')
            .sort({ vendorName: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await vendorModel.countDocuments(query);

        const result = {
            vendors,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };

        return returnFormatter(true, "Vendors retrieved successfully", result);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function getVendorById(vendorId, organizationId) {
    try {
        const vendor = await vendorModel.findOne({
            vendorId,
            organizationId,
        }).select('-__v');

        if (!vendor) {
            return returnFormatter(false, "Vendor not found");
        }

        return returnFormatter(true, "Vendor retrieved successfully", vendor);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function updateVendorData(vendorId, updateData, organizationId, updatedBy) {
    try {
        const existingVendor = await vendorModel.findOne({
            vendorId,
            organizationId
         });

        if (!existingVendor) {
            return returnFormatter(false, "Vendor not found");
        }

        const formattedData = formatVendorForUpdate(updateData);

        const updatedVendor = await vendorModel.findOneAndUpdate(
            { vendorId },
            formattedData,
            { new: true }
        ).select('-__v');

        await createAuditLog({
            organizationId,
            entityType: 'Vendor',
            entityId: vendorId,
            action: 'Updated',
            performedBy: updatedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: existingVendor,
            newValues: updatedVendor
        });

        return returnFormatter(true, "Vendor updated successfully", updatedVendor);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

export async function deleteVendorData(vendorId, organizationId, deletedBy) {
    try {
        console.log("Deleting vendor with ID:", vendorId, "for organization:", organizationId);
        const vendor = await vendorModel.findOne({
            vendorId,
            organizationId,
        });

        if (!vendor) {
            return returnFormatter(false, "Vendor not found");
        }

        await vendorModel.findOneAndDelete(
            { vendorId },
        );

        await createAuditLog({
            organizationId,
            entityType: 'Vendor',
            entityId: vendorId,
            action: 'Deleted',
            performedBy: deletedBy,
            performedByName: 'System User',
            performedByRole: 'Admin',
            oldValues: vendor
        });

        return returnFormatter(true, "Vendor deleted successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
