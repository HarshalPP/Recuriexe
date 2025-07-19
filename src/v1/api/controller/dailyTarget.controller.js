const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt
} = require("../../../../globalHelper/response.globalHelper");
const axios = require("axios");
const cron = require("node-cron");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const employeeModel = require("../model/adminMaster/employe.model")
const dailyTargetModel = require("../model/dailyTarget.model");

// --------------------Daily Target Add Api----------------------------
async function dailyTargetAdd(req, res) {
    try {
        const tokenId = new ObjectId(req.Id)
      const { sales, pd, collectionEmi, fileProcess, finalApproval } = req.body;
  
      const newTarget = new dailyTargetModel({
        employeeId: tokenId || null,
        sales: sales || {},
        pd: pd || {},
        collectionEmi: collectionEmi || {},
        fileProcess: fileProcess || {},
        finalApproval: finalApproval || {},
      });
  
      const savedTarget = await newTarget.save();
      success(res, "Today Target Submitted",savedTarget );
    } catch (error) {
        console.error('Error :', error);
        return unknownError(res, error.message);
      }
    }

//----------------------Daily Target Get APi By TokenId----------------
async function dailyTargetByTokenId(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const tokenId = new ObjectId(req.Id);

        // First get employee details
        const employeeDetail = await employeeModel.findById(
            { _id: tokenId },
            'employeUniqueId employeName mobileNo workEmail'
        );

        if (!employeeDetail) {
            return badRequest(res, "No Employee Found");
        }

        // Then get target details
        const targetDetail = await dailyTargetModel.find({ employeeId: tokenId });

        // If no target details found, return employee detail with empty target array
        if (!targetDetail || targetDetail.length === 0) {
            return success(res, "Get Target Detail", {
                employeeDetail: {
                    _id: employeeDetail._id,
                    employeUniqueId: employeeDetail.employeUniqueId,
                    employeName: employeeDetail.employeName,
                    mobileNo: employeeDetail.mobileNo,
                    workEmail: employeeDetail.workEmail
                },
                targetDetail: []
            });
        }

        // // If target details exist, format the response
        // const formattedTargets = targetDetail.map(target => {
        //     const targetObj = target.toObject();
        //     // Remove employeeId field from target details since it's already in employeeDetail
        //     const { employeeId, ...restTarget } = targetObj;
        //     return restTarget;
        // });

        // Return final formatted response
        return success(res, "Get Target Detail", {
            employeeDetail: {
                _id: employeeDetail._id,
                employeUniqueId: employeeDetail.employeUniqueId,
                employeName: employeeDetail.employeName,
                mobileNo: employeeDetail.mobileNo,
                workEmail: employeeDetail.workEmail
            },
            targetDetail: targetDetail
        });

    } catch (error) {
        console.log(error);
        return unknownError(res, error);
    }
}

    module.exports = {
        dailyTargetAdd,
        dailyTargetByTokenId
    }