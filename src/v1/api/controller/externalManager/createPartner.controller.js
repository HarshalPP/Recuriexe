const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require('bcrypt')
const externalPartnerModel = require('../../model/externalManager/createPartner.model')

// ------------------------External Manager Add partner---------------------------------------
async function addPartner(req, res) {
    try {
        // Validate the incoming request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Normalize and check if username exists
        if (req.body.userName) {
            req.body.userName = req.body.userName;
            const partnerFind = await externalPartnerModel.findOne({ userName: req.body.userName });
            if (partnerFind) {
                return badRequest(res, "Partner already exists");
            }
        }

        // Hash the password using bcrypt with 10 rounds of salt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword; // Save the hashed password

        // Create the new partner with hashed password
        const partnerDetail = await externalPartnerModel.create(req.body);
        success(res, "Partner Added Successfully", partnerDetail);
    } catch (error) {
        console.log(error);
        unknownError(res, error.message);
    }
}

// ------------------ External Manager partner "active" or "inactive" updated---------------------------------------
async function partnerActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
            const id = req.body.id;
            if (!id || id.trim() === "") {
                return badRequest(res, "ID is required and cannot be empty");
            }
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return badRequest(res, "Invalid ID");
            }
            const status = req.body.status
            if (status == "active") {
                const partnerStatusUpdate = await externalPartnerModel.findByIdAndUpdate({ _id: id }, { status: "active" }, { new: true })
                success(res, "partner Active", partnerStatusUpdate);
            }
            else if (status == "inactive") {
                const partnerStatusUpdate = await externalPartnerModel.findByIdAndUpdate({ _id: id }, { status: "inactive" }, { new: true })
                success(res, "partner inactive", partnerStatusUpdate);
            }
            else {
                return badRequest(res, "Status must be 'active' or 'inactive'");
            }
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}

// ------------------ External Manager Update  partner ---------------------------------------

// async function updatePartner(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errorName: "serverValidation",
//                 errors: errors.array(),
//             });
//         }
//         let { partnerId} = req.query;
//         if (typeof req.body.partnerName === 'string') {
//             req.body.partnerName = req.body.partnerName.trim().toLowerCase();
//         }
//         const updateData = await externalPartnerModel.findByIdAndUpdate(partnerId, req.body, { new: true });
//         success(res, "Updated partner", updateData);
//     } catch (error) {
//         console.log(error);
//         unknownError(res, error);
//     }
// };


async function updatePartner(req, res) {
    try {
        // Validate incoming request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        // Extract partnerId from query
        let { partnerId } = req.query;
        
        // Check if partner exists
        const partnerExist = await externalPartnerModel.findById(partnerId);
        if (!partnerExist) {
            return res.status(400).json({ errorName: "notFound", message: "Partner Not Found" });
        }

        // Initialize update fields
        let updateFields = { ...req.body };  // Copy all fields from req.body
        let fieldsToProcess = ['partnerName', 'email', 'userName'];  // Fields that need to be processed

        // Process fields: trimming and lowercasing
        fieldsToProcess.forEach(field => {
            if (req.body[field]) {
                updateFields[field] = req.body[field].trim().toLowerCase();
            }
        });

        // Check if password is present in the request body
        if (req.body.password) {
            // Hash the password before updating
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(req.body.password, salt);
        }

        // Update the partner's information
        const updateData = await externalPartnerModel.findByIdAndUpdate(partnerId, updateFields, { new: true });

        // Respond with success message and updated partner data
        success(res, "Updated partner", updateData);

    } catch (error) {
        // Log and handle errors
        console.error(error);
        unknownError(res, error);
    }
}
// ------------------External Manager Get partner Detai ---------------------------------------
async function partnerDetail(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const partnerDetail = await externalPartnerModel.findById(req.query.partnerId)
        success(res, "Get partner Detail", partnerDetail);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};

// ------------------External Manager Get All partner---------------------------------------

async function getAllPartner(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const partnerList = await externalPartnerModel.find({status:'active'})
        success(res, "Get All partner", partnerList);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};


module.exports = {
    addPartner,
    partnerActiveOrInactive,
    updatePartner,
    partnerDetail,
    getAllPartner,
};
