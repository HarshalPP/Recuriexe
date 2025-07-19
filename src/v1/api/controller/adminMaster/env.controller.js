const {
    success,
    unknownError,
    serverValidation,
    badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const envModel = require("../../model/adminMaster/Env.Model");



async function addEnvConfig(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        if (req.body.keyName) {
            req.body.keyName = req.body.keyName.toUpperCase().trim();
        }

        const existingConfig = await envModel.findOne({ keyName: req.body.keyName });
        if (existingConfig) {
            return badRequest(res, "Configuration key already exists");
        }

        const newConfig = await envModel.create(req.body);
        success(res, "Configuration added successfully", newConfig);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}



module.exports = { addEnvConfig };
