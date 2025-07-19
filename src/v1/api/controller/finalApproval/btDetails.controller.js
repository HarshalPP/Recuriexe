const btDetailsModel = require("../../model/finalApproval/btBankDetail.model");
const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js");

const mongoose = require("mongoose");
const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
    parseJwt,
} = require("../../../../../globalHelper/response.globalHelper");


// Create BT Details (POST)
async function createOrUpdateBtDetails(req, res) {
    try {
        const { customerId, ...updateFields } = req.body;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return badRequest(res, "Invalid customerId");
        }

        const btDetailsExist = await btDetailsModel.findOne({customerId})

        const updatedBtDetails = await btDetailsModel.findOneAndUpdate(
            { customerId },  
            { $set: updateFields },  
            { new: true, upsert: true } 
        );

        return success(res, `BT details ${btDetailsExist?"Update":"Add"} successfully`, updatedBtDetails);
    } catch (error) {
        console.error("Error creating/updating BT details:", error);
        return unknownError(res, error);
    }
}


// Get All BT Details (GET)
async function getAllBtDetails(req, res) {
    try {
        const btDetails = await btDetailsModel.find();
        return success(res, "All BT details fetched successfully", btDetails);
    } catch (error) {
        console.error("Error fetching BT details:", error);
        return unknownError(res, error);
    }
}

// Get BT Details by Customer ID (GET)
// async function getBtDetailsByCustomerId(req, res) {
//     try {
//         const { customerId } = req.query;

//         if (!mongoose.Types.ObjectId.isValid(customerId)) {
//             return badRequest(res, "Invalid customerId");
//         }

//         const btDetails = await btDetailsModel.findOne({ customerId });
//         if (!btDetails) {
//             return notFound(res, "BT details not found for this customer");
//         }

//         return success(res, "BT details fetched successfully", btDetails);
//     } catch (error) {
//         console.error("Error fetching BT details by customerId:", error);
//         return unknownError(res, error);
//     }
// }

async function getBtDetailsByCustomerId(req, res) {
    try {
        const { customerId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return badRequest(res, "Invalid customerId");
        }

        const btDetails = await btDetailsModel.findOne({ customerId });
        
        const data = await internalLegalModel.findOne({ customerId },);
if (!data) {
//   return notFound(res, "Internal legal details not found.");
return success(res, "BT details not fetched ", {loanType: null});
}

// const combinedata = {
//     btDetails,
//     loanType: data.LoanType}

console.log(data.data);
        return success(res, "BT details fetched successfully", {btDetails: btDetails ? btDetails : {},
            loanType: data.LoanType});
    } catch (error) {
        console.error("Error fetching BT details by customerId:", error);
        return unknownError(res, error);
    }
}



module.exports = {
    createOrUpdateBtDetails,
    getAllBtDetails,
    getBtDetailsByCustomerId,
};
