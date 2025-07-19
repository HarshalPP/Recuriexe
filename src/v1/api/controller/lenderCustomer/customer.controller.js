const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
    parseJwt,
  } = require("../../../../../globalHelper/response.globalHelper");
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const customerModel = require("../../model/customer.model");
  const { paginationData } = require("../../helper/pagination.helper.js");
  
  
  //old api
  const customerDetailsList = async (req, res) => {
    try {
       const _id = req.Id
      //  console.log(_id,"id<><><><><><><><><>") 
    //    lenderId = 
      const { pageLimit, pageNumber, search } = req.query;
      const { offset, limit } = paginationData(pageLimit, pageNumber);
  
      // Build search filter
      const searchFilter = {};
      if (search) {
        searchFilter.$or = [
          { "nearestBranchData.name": { $regex: search, $options: "i" } }, // Branch name (case-insensitive)
          { "applicantDetail.fullName": { $regex: search, $options: "i" } }, // Applicant name (case-insensitive)
          { customerFinId: { $regex: search, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$mobileNo" }, // Convert numeric field to string
                regex: search,
                options: "i",
              },
            },
          }, // Mobile number as string (case-insensitive)
        ];
      }
  
      const userData = await customerModel.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productData",
          },
        },
        {
          $unwind: {
            path: "$productData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "newbranches",
            localField: "nearestBranchId",
            foreignField: "_id",
            as: "nearestBranchData",
          },
        },
        {
          $unwind: {
            path: "$nearestBranchData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "_id",
            foreignField: "customerId",
            as: "applicantDetail",
          },
        },
        {
          $unwind: {
            path: "$applicantDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "cibildetails",
            localField: "_id",
            foreignField: "customerId",
            as: "cibildetailDetail",
          },
        },
        {
          $unwind: {
            path: "$cibildetailDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "pdformdatas",
            localField: "_id",
            foreignField: "customerId",
            as: "pdData",
          },
        },
        {
          $unwind: {
            path: "$pdData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "pdData.status": "approve",
          },
        },
        {
          $project: {
            _id: 1,
            pdData:1,
            employeId: 1,
            productId: 1,
            customerFinId: 1,
            mobileNo: 1,
            loanAmount: 1,
            roi: 1,
            tenure: 1,
            emi: 1,
            executiveName: 1,
            createdAt: 1,
            updatedAt: 1,
            "applicantDetail.fullName": 1,
            "applicantDetail.applicantPhoto": 1,
            "cibildetailDetail.applicantCibilScore": 1,
            "nearestBranchData.name": 1,
            "productData.productName": 1,
            tvrDetails: {
              income: "7%",
              propertyValue: "50L",
              foir: "30%",
              ltv: "9%",
            },
          },
        },
        // Apply search filter
        { $match: searchFilter },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
      ]);
  
      // Fetch total count without pagination for accurate results
      const totalCount = await customerModel.aggregate([
        {
          $lookup: {
            from: "newbranches",
            localField: "nearestBranchId",
            foreignField: "_id",
            as: "nearestBranchData",
          },
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "_id",
            foreignField: "customerId",
            as: "applicantDetail",
          },
        },
        {
          $unwind: {
            path: "$applicantDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "cibildetails",
            localField: "_id",
            foreignField: "customerId",
            as: "cibildetailDetail",
          },
        },
        {
          $unwind: {
            path: "$cibildetailDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "pdformdatas",
            localField: "_id",
            foreignField: "customerId",
            as: "pdData",
          },
        },
        {
          $unwind: {
            path: "$pdData",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Add a match condition for pdData.status === "approve"
        {
          $match: {
            "pdData.status": "approve",
          },
        },
        {
          $project: {
            "nearestBranchData.name": 1,
            "applicantDetail.fullName": 1,
            mobileNo: 1,
          },
        },
        // Match filter for total count
        { $match: searchFilter },
      ]);    
  
      return success(res, "All customer details List", {
        totalCount: totalCount.length,
        userDataLength: userData.length,
        userData,
      });
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  };
  
  
  const customerDetails = async (req, res) => {
    try {
      let { customerId } = req.params;
      customerId = new mongoose.Types.ObjectId(req.params.customerId);
      const userData = await customerModel.aggregate([
        {
          $match: {
            _id: customerId,
          },
        },
        {
          $lookup: {
            from: "newbranches",
            localField: "branch",
            foreignField: "_id",
            as: "branchData",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productData",
          },
        },
        {
          $unwind: {
            path: "$productData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "newbranches",
            localField: "nearestBranchId",
            foreignField: "_id",
            as: "nearestBranchData",
          },
        },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "_id",
            foreignField: "customerId",
            as: "applicantDetail",
          },
        },
        {
          $unwind: {
            path: "$applicantDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "cibildetails",
            localField: "_id",
            foreignField: "customerId",
            as: "cibildetailDetail",
          },
        },
        {
          $unwind: {
            path: "$cibildetailDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            employeId: 1,
            productId: 1,
            customerFinId: 1,
            mobileNo: 1,
            loanAmount: 1,
            roi: 1,
            tenure: 1,
            emi: 1,
            executiveName: 1,
            createdAt: 1,
            updatedAt: 1,
            "applicantDetail.fullName": 1,
            "applicantDetail.applicantPhoto": 1,
            "cibildetailDetail.applicantCibilScore": 1,
            "productData.productName": 1,
            tvrDetails: {
              income: "7%",
              propertyValue: "50L",
              foir: "30%",
              ltv: "9%",
            },
          },
        },
        {
          $group: {
            _id: "$_id", // Group by customer ID to remove duplicates
            employeId: { $first: "$employeId" },
            productId: { $first: "$productId" },
            customerFinId: { $first: "$customerFinId" },
            mobileNo: { $first: "$mobileNo" },
            loanAmount: { $first: "$loanAmount" },
            roi: { $first: "$roi" },
            tenure: { $first: "$tenure" },
            emi: { $first: "$emi" },
            executiveName: { $first: "$executiveName" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            applicantDetail: { $first: "$applicantDetail" },
            cibildetailDetail: { $first: "$cibildetailDetail" },
            productData: { $first: "$productData" },
            tvrDetails: { $first: "$tvrDetails" },
          },
        },
      ]);
  
      return success(res, "customer details", {
        userData,
      });
    } catch (error) {
      console.log(error);
      return unknownError(res, error);
    }
  };



  module.exports = {
    customerDetailsList
}