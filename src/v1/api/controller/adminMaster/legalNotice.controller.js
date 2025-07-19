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
 const legalNoticeModel = require("../../model/adminMaster/legalNotice.model");
 const noticeTypeModel = require("../../model/adminMaster/noticeType.model")
 const employeModel = require("../../model/adminMaster/employe.model")
  // ------------------Admin Master Legal Notice Add---------------------------------------
  // async function legalNoticeAdd(req, res) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(400).json({
  //         errorName: "serverValidation",
  //         errors: errors.array(),
  //       });
  //     }
  //    const  {customerFincNo, noticeTypeId,document} = req.body;
  //     if (!noticeTypeId || noticeTypeId.trim() === "") {
  //       return badRequest(res, "Please Select noticeType");
  //     }
  
  //     const noticeTypeDetail = await noticeTypeModel.findById({ _id: noticeTypeId });
  //     if (!noticeTypeDetail) {
  //       return badRequest(res, "noticeTypeId Not Found");
  //     }

  //     const notice = await legalNoticeModel.create(req.body);
     
  //     success(res, "Legal Notice Added Successful", notice);

  //   } catch (error) {
  //     console.log(error);
  //     unknownError(res, error);
  //   }
  // };

  async function legalNoticeAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const token = req.Id;
      const employeDetail = await employeModel.findById({
        _id: new ObjectId(token),
      });
  
      if (!employeDetail) {
        return badRequest(res, "Invalid employe Details");
      }
      const notices = req.body;
      if (!Array.isArray(notices)) {
        return badRequest(res, "Input data must be an array");
      }
  
      const savedNotices = [];
  
      for (const noticeData of notices) {
        const { customerFincNo, noticeTypeId, document } = noticeData;
  
        if (!noticeTypeId || noticeTypeId.trim() === "") {
          return badRequest(res, "Please Select noticeType");
        }
  
        const noticeTypeDetail = await noticeTypeModel.findById({ _id: noticeTypeId });
        if (!noticeTypeDetail) {
          return badRequest(res, "noticeTypeId Not Found");
        }
  
        noticeData.employeeId = employeDetail._id;
        const notice = await legalNoticeModel.create(noticeData);
        savedNotices.push(notice);
      }
  
      success(res, "Legal Notices Added Successfully", savedNotices);
  
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  
  // ------------------Admin Master Get All Legal Detail---------------------------------------
  async function getAllLegalNotice(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      } 
              const legalNoticeDetail = await legalNoticeModel.aggregate([
                {$match:{status:"active"} },
                {
                    $lookup: {
                        from : "noticetypes",
                        localField:"noticeTypeId",
                        foreignField:"_id",
                        as:"noticeTypeDetail"
                    }
                },
                {
                    $project:{
                         "noticeTypeDetail.__v":0, 
                    }
                },
                {
                    $unwind: "$noticeTypeDetail"
                }
              ]).sort({ createdAt: -1 });
              success(res, "Get All Legal Notice Detail",legalNoticeDetail);
          
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  


async function InactiveLegalNotice(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const id = req.query.id;
    if (!id || id.trim() === "") {
      return badRequest(res, "ID is required and cannot be empty");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid ID");
    }
    const data = await legalNoticeModel.findByIdAndUpdate(
      id, 
      { status: "inactive" },
      { new: true }
    );

    if (!data) {
      return notFound(res, "Legal notice not found");
    }

    return success(res, "Legal notice inactive", data);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

  module.exports = {
    legalNoticeAdd,
    getAllLegalNotice,
    InactiveLegalNotice
  };
  