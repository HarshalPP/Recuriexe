const loanSathiModel = require("../model/loanSathi.model");
const { returnFormatter } = require("../formatter/common.formatter");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Assuming you're using JWT for login tokens
const {laonSathiFormatter,laonSathiUpdateFormatter} = require("../formatter/laonSathi.formatter");
const employeModel = require("../model/adminMaster/employe.model");

// Create a new Loan Sathi
async function addLoanSathi(bodyData, salesPersonId) {
    try {
        const salt = await bcrypt.genSalt(10);
        bodyData.password = await bcrypt.hash(bodyData.password, salt);
        const formattedData = laonSathiFormatter(bodyData, salesPersonId);
        const saveData = await loanSathiModel.create(formattedData);
        return returnFormatter(true, "Loan Sathi created", saveData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Create a sales person by finId
async function salePersonByFinId(employeUniqueId) {
    try {
        let returnData = await employeModel.findOne({employeUniqueId})
        return returnData ? returnData._id : false
    } catch (error) {
        return false;
    }
}

// Get a Loan Sathi by loanSathiId
async function getLoanSathiById(loanSathiId) {
    try {
        const loanSathi = await loanSathiModel.findOne({ loanSathiId });
        if (!loanSathi) {
            return returnFormatter(false, "Loan Sathi not found");
        }
        return returnFormatter(true, "Loan Sathi found", loanSathi);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Get all Loan Sathi records by salesPersonId
async function getLoanSathiBySalesPerson(salesPersonId) {
    try {
        const loanSathis = await loanSathiModel.find({ salesPersonId });
        if (loanSathis.length === 0) {
            return returnFormatter(false, "No Loan Sathi records found for the Sales Person");
        }
        return returnFormatter(true, "Loan Sathi records found", loanSathis);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Update a Loan Sathi
async function updateLoanSathi(loanSathiId, updateData) {
    try {
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        const formattedData = laonSathiUpdateFormatter(updateData)
        const updatedLoanSathi = await loanSathiModel.findOneAndUpdate(
            { loanSathiId },
            formattedData,
            { new: true }
        );
        if (!updatedLoanSathi) {
            return returnFormatter(false, "Loan Sathi not found");
        }
        return returnFormatter(true, "Loan Sathi updated", updatedLoanSathi);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Set isActive to false instead of deleting a Loan Sathi
async function deactivateLoanSathi(loanSathiId) {
    try {
        const deactivatedLoanSathi = await loanSathiModel.findOneAndUpdate(
            { loanSathiId },
            { isActive: false },
            { new: true }
        );
        if (!deactivatedLoanSathi) {
            return returnFormatter(false, "Loan Sathi not found");
        }
        return returnFormatter(true, "Loan Sathi deactivated", deactivatedLoanSathi);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Login Loan Sathi
async function loginLoanSathi(userName, password) {
    try {
        const loanSathi = await loanSathiModel.findOne({ userName });
        if (!loanSathi) {
            return returnFormatter(false, "User not found");
        }
        const isMatch = await bcrypt.compare(password, loanSathi.password);
        if (!isMatch) {
            return returnFormatter(false, "Invalid credentials");
        }
        // Generate token (assuming JWT)
        const token = jwt.sign({ Id: loanSathi.loanSathiId, roleName: "loan-sathi" }, "FIN-COOPER");
        return returnFormatter(true, "Login successful", { token, loanSathi });
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

// Change Password
async function changeLoanSathiPassword(loanSathiId, oldPassword, newPassword) {
    try {
        const loanSathi = await loanSathiModel.findOne({ loanSathiId });
        if (!loanSathi) {
            return returnFormatter(false, "Loan Sathi not found");
        }
        const isMatch = await bcrypt.compare(oldPassword, loanSathi.password);
        if (!isMatch) {
            return returnFormatter(false, "Old password is incorrect");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        loanSathi.password = hashedPassword;
        await loanSathi.save();
        return returnFormatter(true, "Password updated successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

module.exports = {
    addLoanSathi,
    getLoanSathiById,
    salePersonByFinId,
    getLoanSathiBySalesPerson,
    updateLoanSathi,
    deactivateLoanSathi,
    loginLoanSathi,
    changeLoanSathiPassword
};
