const {
    success,
    unknownError,
    serverValidation,
    notFound,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const workLocationModel = require("../../model/adminMaster/workLocation.model");
  const branchModel = require("../../model/adminMaster/newBranch.model")
  const {workLocationGoogleSheet} = require('./masterGoogleSheet.controller')

  // ------------------Admin Master Work Location Add  dd .---------------------------------------
  async function workLocationAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      if (req.body.title) {
        req.body.title = req.body.title.toLowerCase().trim();
      }
      const companyExists = await branchModel.findOne({
        companyId: new ObjectId(req.body.companyId)
      });
  
      if (!companyExists) {
        return notFound(res,"Invalid companyId provided.")
      }
  
      const branchExists = await branchModel.findOne({
        companyId: new ObjectId(req.body.companyId),
        _id: new ObjectId(req.body.branchId)
      });
  
      if (!branchExists) {
        return notFound(res, "Invalid branchId provided for the given companyId.");
      }
      const workLocation = await workLocationModel.findOne({title:req.body.title , branchId: new ObjectId(req.body.branchId) , companyId: new ObjectId(req.body.companyId)})
      if(workLocation){
         return badRequest(res, "Work Location Already Exist With Branch") 
      }
      const workLocationDetail = await workLocationModel.create(req.body);
      success(res, "Work Location Added Successful", workLocationDetail);
      await workLocationGoogleSheet(workLocationDetail)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Work Location "active" or "inactive" updated---------------------------------------
  async function workLocationActiveOrInactive(req, res) {
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
                const workLocationUpdateStatus =  await workLocationModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
            success(res, "Work Location Active" ,workLocationUpdateStatus);
            }
           else if (status == "inactive") {
            const workLocationUpdateStatus =  await workLocationModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
            success(res, "Work Location inactive" ,workLocationUpdateStatus);
            }
            else{
                return badRequest(res,  "Status must be 'active' or 'inactive'");
            }
           
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update Work Location Detail ---------------------------------------
  async function updateWorkLocation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { workLocationId, ...updateFields } = req.body;
      if (typeof updateFields.title === 'string') {
        updateFields.title = updateFields.title.trim().toLowerCase();
      }

      if (!workLocationId || workLocationId.trim() === "") {
        return badRequest(res, "Please Select workLocationId");
      }
  
      const workLocation = await workLocationModel.findById({ _id: new ObjectId(workLocationId) });
      if (!workLocation) {
        return badRequest(res, "WorkLocation Id Not Found");
      }

      const updateData = await workLocationModel.findByIdAndUpdate(workLocationId, updateFields, {new :true});
      success(res, "Updated Work Location",updateData);
      await workLocationGoogleSheet(updateData)
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

    // ------------------Admin Master Get All Work Location BY BranchId---------------------------------------
    async function workLocationByBranchId(req, res) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            errorName: "serverValidation",
            errors: errors.array(),
          });
        }
        const workLocationDetail = await workLocationModel.aggregate([
          {$match:{branchId: new ObjectId(req.params.branchId) , status:"active"}},
        {
          $lookup: {
              from : "companies",
              localField:"companyId",
              foreignField:"_id",
              as:"companyDetail"
          }
      },
      {
          $project:{
               "companyDetail.__v":0, "companyDetail.createdAt":0,"companyDetail.updatedAt":0
          }
      },
      {
        $lookup: {
            from : "branches",
            localField:"branchId",
            foreignField:"_id",
            as:"branchDetail"
        }
    },
    {
        $project:{
             "branchDetail.__v":0, "branchDetail.createdAt":0,"branchDetail.updatedAt":0,
             "branchDetail.companyId":0,"branchDetail.branchId":0
        }
    },
   
    ]);
        success(res, "Get All Work Location",workLocationDetail);
      } catch (error) {
        console.log(error);
        unknownError(res, error);
      }
    };
  

  // ------------------Admin Master Get All Work Location---------------------------------------
  // async function getAllWorkLocation(req, res) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(400).json({
  //         errorName: "serverValidation",
  //         errors: errors.array(),
  //       });
  //     }
  //     const workLocationDetail = await workLocationModel.aggregate([
  //     {
  //       $lookup: {
  //           from : "companies",
  //           localField:"companyId",
  //           foreignField:"_id",
  //           as:"companyDetail"
  //       }
  //   },
  //   {
  //       $project:{
  //            "companyDetail.__v":0, "companyDetail.createdAt":0,"companyDetail.updatedAt":0
  //       }
  //   },
  //   {
  //     $lookup: {
  //         from : "branches",
  //         localField:"branchId",
  //         foreignField:"_id",
  //         as:"branchDetail"
  //     }
  // },
  // {
  //     $project:{
  //          "branchDetail.__v":0, "branchDetail.createdAt":0,"branchDetail.updatedAt":0,
  //          "branchDetail.companyId":0,"branchDetail.branchId":0
  //     }
  // },
 
  // ]);
  //     success(res, "All Work Location",workLocationDetail);
  //   } catch (error) {
  //     console.log(error);
  //     unknownError(res, error);
  //   }
  // };
  
  async function getAllWorkLocation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const workLocationDetail = await workLocationModel.aggregate([
        {$match:{status:"active"} },
        {
          $lookup: {
            from: "companies",
            localField: "companyId",
            foreignField: "_id",
            as: "companyDetail",
          },
        },
        {
          $project: {
            "companyDetail.__v": 0,
            "companyDetail.createdAt": 0,
            "companyDetail.updatedAt": 0,
          },
        },
        {
          $lookup: {
            from: "branches",
            localField: "branchId",
            foreignField: "_id",
            as: "branchDetail",
          },
        },
        {
          $project: {
            "branchDetail.__v": 0,
            "branchDetail.createdAt": 0,
            "branchDetail.updatedAt": 0,
            "branchDetail.companyId": 0,
            "branchDetail.branchId": 0,
          },
        },
        {
          $addFields: {
            title: { $toUpper: "$title" },
            "branchDetail": {
              $map: {
                input: "$branchDetail",
                as: "branch",
                in: {
                  _id: "$$branch._id",
                  branch: { $toUpper: "$$branch.branch" },
                },
              },
            },
            "companyDetail": {
              $map: {
                input: "$companyDetail",
                as: "company",
                in: {
                  _id: "$$company._id",
                  companyName: { $toUpper: "$$company.companyName" },
                },
              },
            },
          },
        },
      ]);
  
      success(res, "All Work Location", workLocationDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  module.exports = {
    workLocationAdd,
    workLocationActiveOrInactive,
    updateWorkLocation,
    workLocationByBranchId,
    getAllWorkLocation
  };
  