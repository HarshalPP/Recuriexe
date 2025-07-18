import { generateUniqueId } from '../common.formatter.js';

export function formatVendorCreation(data, organizationId, createdBy) {
    const {
        vendorName,
        email,
        phone,
        category,
        address,
        bankDetails
    } = data;

    return {
        vendorId: generateUniqueId('VENDOR_'),
        organizationId,
        vendorName,
        email: email?.toLowerCase(),
        phone,
        category: category || "Monthly",
        address: address || "",
        bankDetails: formatBankDetails(bankDetails),
        isActive: true,
        createdBy
    };
}

export function formatVendorForUpdate(updateData) {
    const allowedFields = [
        'vendorName',
        'email',
        'phone',
        'category',
        'address',
        'bankDetails'
    ];

    const formattedData = {};
    for (const key of allowedFields) {
        if (key in updateData) {
            if (key === 'bankDetails') {
                formattedData[key] = formatBankDetails(updateData[key]);
            } else {
                formattedData[key] = updateData[key];
            }
        }
    }
    return formattedData;
}

function formatBankDetails(details) {
    if (!details) return {};

    return {
        accountHolderName: details.accountHolderName || "",
        bankName: details.bankName || "",
        ifscCode: details.ifscCode?.toUpperCase() || "",
        accountNumber: details.accountNumber || ""
    };
}
