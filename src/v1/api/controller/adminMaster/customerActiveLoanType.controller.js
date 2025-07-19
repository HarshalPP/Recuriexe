const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { validationResult } = require("express-validator");
const customerModel = require('./../../model/customer.model')
const coApplicantModel = require("./../../model/co-Applicant.model")
const activeloanTypeModel = require("./../../model/adminMaster/customerActiveLoanType.model")

async function addActiveLoanType(req, res) {
    try {
        const { customerId, applicant, coApplicants } = req.body;
        const employeeId = new ObjectId(req.Id);

        let existingLoan = await activeloanTypeModel.findOne({ customerId });

        // Validate Co-Applicant IDs
        if (coApplicants && coApplicants.length) {
            for (let coApplicant of coApplicants) {
                const { coApplicantId } = coApplicant;
                const isValidCoApplicant = await coApplicantModel.findById(coApplicantId);

                if (!isValidCoApplicant) {
                    return notFound(res, `Invalid Co-Applicant Id `);
                }
            }
        }

        // If Loan Exists (Update Process)
        if (existingLoan) {
            // Add Applicant Loans without Duplicates
            // if (applicant && applicant.length) {

            //     // applicant.forEach((newLoan) => {
            //     //     const isDuplicate = existingLoan.applicant.some(
            //     //         (loan) => JSON.stringify(loan) === JSON.stringify(newLoan)
            //     //     );

            //     //     if (!isDuplicate) {
            //             existingLoan.applicant.push(newLoan);
            //         // }
            //     // });
            // }

            // // Process Co-Applicants Loans
            // if (coApplicants && coApplicants.length) {
            //     coApplicants.forEach((newCoApplicant) => {
            //         const { coApplicantId, loans } = newCoApplicant;
            //         let existingCoApplicant = existingLoan.coApplicants.find(
            //             (co) => co.coApplicantId.toString() === coApplicantId
            //         );

            //         if (existingCoApplicant) {
            //             loans.forEach((loan) => {
            //                 const isDuplicate = existingCoApplicant.loans.some(
            //                     (l) => JSON.stringify(l) === JSON.stringify(loan)
            //                 );

            //                 if (!isDuplicate) {
            //                     existingCoApplicant.loans.push(loan);
            //                 }
            //             });
            //         } else {
            //             existingLoan.coApplicants.push(newCoApplicant);
            //         }
            //     });
            // }

            existingLoan.customerId = customerId,
            existingLoan.applicant = applicant,
            existingLoan.coApplicants = coApplicants,
            existingLoan.employeeId = employeeId,

            await existingLoan.save();
            return success(res, "Loan Type Updated Successfully", { data: existingLoan });
        }

        // If Loan Does Not Exist (Add New Loan)
        const newLoan = new activeloanTypeModel({
            employeeId,
            customerId,
            applicant,
            coApplicants,
        });

        await newLoan.save();
        return success(res, "Loan Type Added Successfully", { data: newLoan });

    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}




// Get Loan Type by ID
async function activeLoanTypeDetail(req, res) {
    try {
        const { customerId } = req.query
        const loanType = await activeloanTypeModel.findOne({customerId:customerId});
        if (!loanType) {
            return notFound(res, "Loan Type Not Found");
        }
        return success(res, "Loan Type Details Fetched", { data: loanType });
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}


// Get All Active Loan Types
async function activeLoanTypeGetList(req, res) {
    try {
        const { page = 1, limit = 100 } = req.query; // Default Page = 1, Limit = 10
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);

        // Total Count
        const totalCount = await activeloanTypeModel.countDocuments();

        // Fetch Paginated Data
        const activeLoans = await activeloanTypeModel
            .find()
            .skip((pageNumber - 1) * pageSize) // Skip records based on page
            .limit(pageSize) // Limit records per page
            .sort({ createdAt: -1 }); // Optional Sorting by latest entry

        return success(res, "Active Loan Types Fetched", {
            totalCount,
            page: pageNumber,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
            data: activeLoans,
        });
    } catch (error) {
        console.error(error);
        unknownError(res, error);
    }
}



module.exports = { addActiveLoanType, activeLoanTypeDetail, activeLoanTypeGetList }
