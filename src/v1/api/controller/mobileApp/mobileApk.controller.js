const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
    parseJwt
} = require("../../../../../globalHelper/response.globalHelper");
const { validationResult } = require("express-validator");
const mobileApkModel = require('../../model/mobileApk.model')



async function mobileApkVersion(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const mobileApkDetail = await mobileApkModel.findOne({ status: "active" });
        console.log('mobileApkDetail',mobileApkDetail)
       return success(res, "mobile Version Get", mobileApkDetail);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};


async function mobileApkVersionCreate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const mobileApkDetail = await mobileApkModel.create(req.body);
     return  success(res, "mobile Apk  Added Successful", mobileApkDetail);
    } catch (error) {
      unknownError(res, error);
    }
  }


module.exports = { mobileApkVersion  , mobileApkVersionCreate};
