const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const modeOfCollectionModel = require("../../model/adminMaster/modeOfCollection.model");
  const bankNameModel = require("../../model/adminMaster/bank.model")
  const okCreditModel = require("../../model/adminMaster/okCredit.model")
  const lenderModel = require("../../model/lender.model")
  const dropdownModel = require("../../model/adminMaster/dropdown.model")
  const employeeModel = require("../../model/adminMaster/employe.model")
  const {modeOfCollectionGoogleSheet} = require('./masterGoogleSheet.controller')
  
  // ------------------Admin Master Add Mode Of Collection---------------------------------------
  async function modeOfCollectionAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.title) {
        req.body.title = req.body.title;
      }
      const mode = await modeOfCollectionModel.findOne({title:req.body.title})
      if(mode){
         return badRequest(res, "Given Title Already Added") 
      }
      const modeDetail = await modeOfCollectionModel.create(req.body);
     
      success(res, "Mode Of Collection Added Successful", modeDetail);
      await modeOfCollectionGoogleSheet(modeDetail)

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Update  update Mode Of Collection Title ---------------------------------------
  async function updateModeOfCollection(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { modeOfCollectionId, ...updateFields } = req.body;
      if (!modeOfCollectionId || modeOfCollectionId.trim() === "") {
        return badRequest(res, "Please Select modeOfCollectionId");
      }
  
      const modeDetail = await modeOfCollectionModel.findById({ _id: new ObjectId(modeOfCollectionId) });
      if (!modeDetail) {
        return badRequest(res, "Mode Of Collection Id Not Found");
      }
      const updateData = await modeOfCollectionModel.findByIdAndUpdate(modeOfCollectionId, updateFields, {new :true});
      success(res, "Updated Mode Of Collection",updateData);
      // await modeOfCollectionGoogleSheet(updateData)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get All Mode OF Collection---------------------------------------
  async function getAllModeOfCollection(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }

        const modeDetail = await modeOfCollectionModel.aggregate([
            { $match: { status: "active" } },
            {
                $lookup: {
                    from: "dropdowns",
                    localField: "dropdownId",
                    foreignField: "_id",
                    as: "dropdownDetail"
                }
            },
            {
                $project: {
                    "dropdownDetail.__v": 0,
                    "dropdownDetail.createdAt": 0,
                    "dropdownDetail.updatedAt": 0
                }
            }
        ]);

        const detail = modeDetail.map(item => {
            if (!item.dropdownDetail || item.dropdownDetail.length === 0) {
                item.dropdownDetail = {};  
            } else {
                item.dropdownDetail = item.dropdownDetail[0]; 
            }
            return item;
        });

        success(res, "All Mode Of Collection", detail);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};


  // async function getModeById(req, res) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(400).json({
  //         errorName: "serverValidation",
  //         errors: errors.array(),
  //       });
  //     }
  
  //     const modeDetail = await modeOfCollectionModel.findById({
  //       _id: new ObjectId(req.query.modeOfCollectionId),
  //     });
  
  //     const dropdownDetail = await dropdownModel.findById({
  //       _id: new ObjectId(modeDetail.dropdownId),
  //     });
  
  //     let detail = [];
  
  //     if (dropdownDetail._id && dropdownDetail.modelName === "okCreditAssign") {
  //       const okCreditData = await okCreditModel.find({ status: 'active' });
  
  //       detail = await Promise.all(
  //         okCreditData.map(async (credit) => {
  //           const employee = await employeeModel.findById(credit.employeeId, 'employeName');
  //           return {
  //             ...credit.toObject(),
  //             title: employee ? employee.employeName : null,
  //           };
  //         })
  //       );
  //     } else if (dropdownDetail._id && dropdownDetail.modelName === "bankName") {
  //       detail = await bankNameModel.find({ status: 'active' });
  //     }
  //      else if (dropdownDetail._id && dropdownDetail.modelName === "partner") {
  //       const partnerData = await lenderModel.find(
  //         { status: 'active' },
  //         '_id fullName' 
  //       );
  
  //       detail = partnerData.map(partner => ({
  //         _id: partner._id,
  //         title: partner.fullName 
  //       }));
  //     }
  
  //     success(res, "Get Detail By Mode Of CollectionId", { modeDetail, dropdownDetail, detail });
  //   } catch (error) {
  //     console.log(error);
  //     unknownError(res, error);
  //   }
  // }
  async function getModeById(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const modeDetail = await modeOfCollectionModel.findById({
        _id: new ObjectId(req.query.modeOfCollectionId),
      });
  
      if (!modeDetail) {
        return res.status(404).json({
          errorName: "notFound",
          message: "Mode of Collection not found",
        });
      }
  
      // If dropdownId is null, return an empty array
      if (!modeDetail.dropdownId) {
        return success(res, "Get Detail By Mode Of CollectionId", {
          modeDetail,
          dropdownDetail: null,
          detail: [],
        });
      }
  
      const dropdownDetail = await dropdownModel.findById({
        _id: new ObjectId(modeDetail.dropdownId),
      });
  
      let detail = [];
  
      if (dropdownDetail && dropdownDetail.modelName === "okCreditAssign") {
        const okCreditData = await okCreditModel.find({ status: "active" });
  
        detail = await Promise.all(
          okCreditData.map(async (credit) => {
            const employee = await employeeModel.findById(credit.employeeId, "employeName");
            return {
              ...credit.toObject(),
              title: employee ? employee.employeName : null,
            };
          })
        );
      } else if (dropdownDetail && dropdownDetail.modelName === "bankName") {
        detail = await bankNameModel.find({ status: "active" });
      } else if (dropdownDetail && dropdownDetail.modelName === "partner") {
        const partnerData = await lenderModel.find({ status: "active" }, "_id fullName");
  
        detail = partnerData.map((partner) => ({
          _id: partner._id,
          title: partner.fullName,
        }));
      }
  
      success(res, "Get Detail By Mode Of CollectionId", { modeDetail, dropdownDetail, detail });
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  
  
  async function ModeOfCollectionActiveOrInactive(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
            const  id = req.body.id;
            const status = req.body.status
            if (!id || id.trim() === "") {
              return badRequest(res , "ID is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest(res , "Invalid ID");
          }
            if (status == "active") {
                const modeOfCollectionUpdateStatus =  await modeOfCollectionModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "ModeOfCollection Active" ,modeOfCollectionUpdateStatus);
            }
           else if (status == "inactive") {
            const modeOfCollectionUpdateStatus =  await ModeOfCollectionModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "ModeOfCollection inactive" ,modeOfCollectionUpdateStatus);
            }
            else{
                return badRequest(res, "Status must be 'active' or 'inactive'");
            }
           
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }

  module.exports = {
    modeOfCollectionAdd,
    updateModeOfCollection,
    getAllModeOfCollection,
    ModeOfCollectionActiveOrInactive,
    getModeById
  };
  