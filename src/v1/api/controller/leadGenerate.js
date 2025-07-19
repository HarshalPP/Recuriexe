const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
} = require("../../../../globalHelper/response.globalHelper");

const proccessModel = require("../model/process.model.js")
const leadGenerateModel = require("../model/leadGenerate.model.js");
const websiteLeadModel = require("../model/website/websitelead.model.js");
const employeeModel = require("../model/adminMaster/employe.model.js");
const productModel = require("../model/adminMaster/product.model.js");
const newBranchModel = require("../model/adminMaster/newBranch.model.js");
const customerModel = require("../model/customer.model.js")
const {
  leadGenerateGoogleSheet,
  leadGenerateGoogleSheetListBatch,
} = require("../controller/googleSheet.controller.js");
const moment = require("moment");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { calculateTotalMonths } = require('../controller/pd.Controller.js')
const { generateUniqueCustomerFinId } = require('../controller/customer.Controller.js')

async function leadGenerateSalesMan(req, res) {
  try {
    const tokenData = parseJwt(req.headers.token);
    let tokenId;
    let checkTime = moment().tz("Asia/Kolkata");
    const formAssignDate = checkTime.format("YYYY-MM-DDThh:mm:ss A");

    const dateStr = checkTime.format("YYYY-MM-DD"); // Extract only date
    const timeStr = checkTime.format("hh:mm:ss A");
    if (tokenData) {
      let role = Array.isArray(tokenData.roleName)
        ? tokenData.roleName
        : [tokenData.roleName];
      tokenId = tokenData.Id;
    } else {
      tokenId = null;
    }
    const { customerMobileNo, loanTypeId, branchId, leadGeneratedBy, latitude, longitude } =
      req.body;

    const lat = latitude ? parseFloat(latitude) : 0;
    const lng = longitude ? parseFloat(longitude) : 0;

    if (!customerMobileNo || customerMobileNo.trim() === "") {
      return badRequest(res, "Mobile Number is required");
    }

    if (customerMobileNo.length !== 10) {
      return badRequest(res, "Mobile Number must be exactly 10 digits long");
    }

    const mobileNoExist = await leadGenerateModel.findOne({ customerMobileNo });
    if (mobileNoExist) {
      return badRequest(res, "Mobile Number already exists");
    }

    let productName = "";
    if (loanTypeId) {
      const productFind = await productModel.findById(loanTypeId);
      productName = productFind?.productName || "";
    } else if (!loanTypeId) {
      return badRequest(res, "loan Type  required");
    }

    let branchName = "";
    if (branchId) {
      const branchFind = await newBranchModel.findById(branchId);
      branchName = branchFind?.name || "";
    } else if (!branchId) {
      return badRequest(res, "branch required");
    }

    // console.log("tokenId", tokenId);
    if (tokenId) {
      const employeeData = await employeeModel
        .findById(tokenId)
        .populate({ path: "branchId", select: "branch _id" });

      if (!employeeData) {
        return notFound(res, "Sales employee not found");
      }

      // Create new lead
      const leadData = new leadGenerateModel(req.body);
      leadData.employeeGenerateId = tokenId;
      leadData.leadGeneratedBy = "sales";
      leadData.companyName = employeeData?.branchId?.branch || "";
      leadData.location = {
        type: "Point",
        coordinates: [lng, lat],
      };
      await leadData.save();

      // Send success response and log data to Google Sheets
      success(res, "Lead generated  successfully", leadData);
      (leadData.productNameStr = productName),
        (leadData.branchNameStr = branchName),
        (leadData.employeeIdStr = employeeData.employeUniqueId || ""),
        (leadData.employeeUserNameStr = employeeData.userName || ""),
        (leadData.employeeNameStr = employeeData.employeName || "");
      leadData.dateStr = dateStr;
      leadData.timeStr = timeStr;
      leadData.idStr = leadData._id;
      // console.log("productNameStr", leadData.branchNameStr);
      await leadGenerateGoogleSheet(leadData);
    } else {
      const leadData = new leadGenerateModel(req.body);
      leadData.leadGeneratedBy = leadGeneratedBy || "website";
      leadData.location = {
        type: "Point",
        coordinates: [lng, lat],
      };
      await leadData.save();

      // Send success response and log data to Google Sheets
      success(res, "Lead generated successfully", leadData);

      (leadData.productNameStr = productName),
        (leadData.branchNameStr = branchName),
        (leadData.employeeIdStr = ""),
        (leadData.employeeUserNameStr = ""),
        (leadData.employeeNameStr = "");
      leadData.dateStr = dateStr;
      leadData.timeStr = timeStr;
      leadData.idStr = leadData._id;
      await leadGenerateGoogleSheet(leadData);
    }
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, error.message);
  }
}

async function leadGenerateWebsite(req, res) {
  try {
    let checkTime = moment().tz("Asia/Kolkata");
    const dateStr = checkTime.format("YYYY-MM-DD"); // Extract only date
    const timeStr = checkTime.format("hh:mm:ss A");

    const { customerMobileNo, loanTypeId, branchId, leadGeneratedBy, latitude, longitude } = req.body;

    const lat = latitude ? parseFloat(latitude) : 0;
    const lng = longitude ? parseFloat(longitude) : 0;

    if (!customerMobileNo || customerMobileNo.trim() === "") {
      return badRequest(res, "Mobile Number is required");
    }

    if (customerMobileNo.length !== 10) {
      return badRequest(res, "Mobile Number must be exactly 10 digits long");
    }

    const mobileNoExist = await leadGenerateModel.findOne({ customerMobileNo });
    if (mobileNoExist) {
      return badRequest(res, "Mobile Number already exists");
    }

    let productName = "";
    if (loanTypeId) {
      const productFind = await productModel.findById(loanTypeId);
      productName = productFind?.productName || "";
    } else {
      return badRequest(res, "Loan Type is required");
    }

    // let branchName = "";
    // if (branchId) {
    //   const branchFind = await newBranchModel.findById(branchId);
    //   branchName = branchFind?.name || "";
    // } else {
    //   return badRequest(res, "Branch is required");
    // }

    // Create new lead only for website
    const leadData = new leadGenerateModel(req.body);
    leadData.leadGeneratedBy = leadGeneratedBy || "website";
    leadData.location = {
      type: "Point",
      coordinates: [lng, lat],
    };

    await leadData.save();

    // Send success response and log data to Google Sheets
    success(res, "Lead generated successfully", leadData);

    leadData.productNameStr = productName;
    leadData.branchNameStr = branchName;
    leadData.employeeIdStr = "";
    leadData.employeeUserNameStr = "";
    leadData.employeeNameStr = "";
    leadData.dateStr = dateStr;
    leadData.timeStr = timeStr;
    leadData.idStr = leadData._id;

    await leadGenerateGoogleSheet(leadData);
  } catch (error) {
    console.error("Error", error);
    return unknownError(res, error.message);
  }
}


async function newLeadGenerateSalesMan(req, res) {
  try {
    const tokenData = parseJwt(req.headers.token);
    let tokenId;
    let checkTime = moment().tz("Asia/Kolkata");
    const formAssignDate = checkTime.format("YYYY-MM-DDThh:mm:ss A");

    const dateStr = checkTime.format("YYYY-MM-DD"); // Extract only date
    const timeStr = checkTime.format("hh:mm:ss A");
    if (tokenData) {
      let role = Array.isArray(tokenData.roleName)
        ? tokenData.roleName
        : [tokenData.roleName];
      tokenId = tokenData.Id;
    } else {
      tokenId = null;
    }
    const { customerMobileNo, loanTypeId, branchId, leadGeneratedBy, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return badRequest(res, "latitude and longitude Required");
    }

    const lat = latitude ? parseFloat(latitude) : 0;
    const lng = longitude ? parseFloat(longitude) : 0;

    if (!customerMobileNo || customerMobileNo.trim() === "") {
      return badRequest(res, "Mobile Number is required");
    }

    if (customerMobileNo.length !== 10) {
      return badRequest(res, "Mobile Number must be exactly 10 digits long");
    }

    const mobileNoExist = await leadGenerateModel.findOne({ customerMobileNo });
    if (mobileNoExist) {
      return badRequest(res, "Mobile Number already exists");
    }

    let productName = "";
    if (loanTypeId) {
      const productFind = await productModel.findById(loanTypeId);
      productName = productFind?.productName || "";
    } else if (!loanTypeId) {
      return badRequest(res, "loan Type  required");
    }

    let branchName = "";
    if (branchId) {
      const branchFind = await newBranchModel.findById(branchId);
      branchName = branchFind?.name || "";
    } else if (!branchId) {
      return badRequest(res, "branch required");
    }

    // console.log("tokenId", tokenId);
    if (tokenId) {
      const employeeData = await employeeModel
        .findById(tokenId)
        .populate({ path: "branchId", select: "name _id" });

      if (!employeeData) {
        return notFound(res, "Sales employee not found");
      }

      // Create new lead
      const leadData = new leadGenerateModel(req.body);
      leadData.employeeGenerateId = tokenId;
      leadData.leadGeneratedBy = "sales";
      leadData.location = {
        type: "Point",
        coordinates: [lng, lat],
      };
      leadData.companyName = employeeData?.branchId?.name || "";

      await leadData.save();

      // Send success response and log data to Google Sheets
      success(res, "Lead generated  successfully", leadData);

      (leadData.productNameStr = productName),
        (leadData.branchNameStr = branchName),
        (leadData.employeeIdStr = employeeData.employeUniqueId || ""),
        (leadData.employeeUserNameStr = employeeData.userName || ""),
        (leadData.employeeNameStr = employeeData.employeName || "");
      leadData.dateStr = dateStr;
      leadData.timeStr = timeStr;
      leadData.idStr = leadData._id;
      // console.log("productNameStr", leadData.branchNameStr);
      await leadGenerateGoogleSheet(leadData);

    } else {
      const leadData = new leadGenerateModel(req.body);
      leadData.leadGeneratedBy = leadGeneratedBy || "website";

      await leadData.save();

      // Send success response and log data to Google Sheets
      success(res, "Lead generated successfully", leadData);

      (leadData.productNameStr = productName),
        (leadData.branchNameStr = branchName),
        (leadData.employeeIdStr = ""),
        (leadData.employeeUserNameStr = ""),
        (leadData.employeeNameStr = "");
      leadData.dateStr = dateStr;
      leadData.timeStr = timeStr;
      leadData.idStr = leadData._id;
      await leadGenerateGoogleSheet(leadData);
    }
  } catch (error) {
    console.error("Error in leadGenerateSalesMan:", error);
    return unknownError(res, error.message);
  }
}

async function leadGenerateApproveByAdmin(req, res) {
  try {
    const tokenData = parseJwt(req.headers.token);
    let role = "";
    let tokenId = "";

    if (tokenData) {
      role = Array.isArray(tokenData.roleName)
        ? tokenData.roleName
        : [tokenData.roleName];
      tokenId = tokenData.Id;
    }

      const { formId, status, employeeAssignId, remark } = req.body;

      const leadToUpdate = await leadGenerateModel.findById(formId);
      if (!leadToUpdate) {
        return notFound(res, "Lead not found");
      }

      if (status === "approved" && employeeAssignId) {
        const employeeFound = await employeeModel.findById(employeeAssignId);
        if (!employeeFound) {
          return notFound(res, "Sales employee not found");
        }

        leadToUpdate.employeeAssignIdStr = employeeFound.userName;
        leadToUpdate.employeeAssignNameStr = employeeFound.employeName;
        leadToUpdate.managerId = tokenId;
      }
      leadToUpdate.employeeAssignId = employeeAssignId?employeeAssignId:null;
      leadToUpdate.status = status;
      leadToUpdate.remark = remark;
      leadToUpdate.managerId = tokenId;

      await leadToUpdate.save();

      success(res, `Lead ${status} successfully`, leadToUpdate);

      leadToUpdate.idStr = leadToUpdate._id.toString();
      // console.log("leadToUpdate._id", leadToUpdate.idStr);
      await leadGenerateGoogleSheet(leadToUpdate);
  } catch (error) {
    console.error("Error:", error);
    return unknownError(res, error.message);
  }
}

async function leadGenerateList(req, res) {
  try {
    // const employeeRole = req.roleName;

    const employeeRole = Array.isArray(req.roleName)
      ? req.roleName
      : [req.roleName];


    const tokenId = req.Id;
    const { status, role, leadGeneratedBy } = req.query;

    const { page = 1, limit = 500 } = req.query;

    const currentPage = parseInt(page, 10);
    const itemPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemPerPage;
    const searchQuery = req.query.search;

    let query = {};


    if (status && ["pending", "reject", "approved"].includes(status)) {
      query.status = status;
    }

    if (status === "approved") {
      if (role === "generate") {
        // For approved leads in generate role, check both conditions:
        // 1. Either they were generated by this employee
        // 2. OR they were assigned to this employee
        query.$or = [
          { employeeGenerateId: tokenId },
        ];
      } else if (role === "assign") {
        // For assign role, check if assigned to this employee OR
        // (if employeeAssignId is null and employeeGenerateId matches)
        query.$or = [
          { employeeAssignId: tokenId },
          {
            $and: [
              { employeeAssignId: null },
              { employeeGenerateId: tokenId }
            ]
          }
        ];
      }
    } else {
      // For other statuses (pending, reject), use the original logic
      if (role === "generate") {
        query.employeeGenerateId = tokenId;
      } else if (role === "assign") {
        query.employeeAssignId = tokenId;
      } else {
        return notFound(
          res,
          "role value. It should be either assign or generate"
        );
      }
    }

    // if (role === "generate") {
    //   query.employeeGenerateId = tokenId;
    // } else if (role === "assign") {
    //   query.employeeAssignId = tokenId;
    // } else {
    //   return notFound(
    //     res,
    //     "role value. It should be either assign or generate"
    //   );
    // }

    const leadData = await leadGenerateModel
      .find(query)
      .skip(skip)
      .limit(itemPerPage)
      .populate({
        path: "employeeGenerateId",
        select: "employeName _id branchId",
        populate: [
          { path: "branchId", select: "name _id" },
        ],
      })
      .populate({ path: "employeeAssignId", select: "employeName _id" })
      .populate({ path: "loanTypeId", select: "productName _id" })
      .populate({ path: "branchId", select: "name _id" });

    const leadDataCount = await leadGenerateModel
      .find(query)
      .populate({
        path: "employeeGenerateId",
        select: "employeName _id branchId",
        populate: [
          { path: "branchId", select: "branch _id" },
          // { path: "companyId", select: "companyName _id" }
        ],
      })
      .populate({ path: "employeeAssignId", select: "employeName _id" })
      .populate({ path: "loanTypeId", select: "productName _id" })
      .populate({ path: "branchId", select: "branch _id" });

    let leadDataSearch = leadData;
    let leadDataSearchCount = leadDataCount;

    if (searchQuery) {
      const regexPattern = new RegExp(searchQuery, "i");

      leadDataSearch = leadDataSearchCount.filter((lead) => {
        return (
          lead?.branchId?.branch.toString().match(regexPattern) ||
          lead?.loanTypeId?.productName.toString().match(regexPattern) ||
          lead?.employeeAssignId?.employeName.toString().match(regexPattern) ||
          lead?.leadGeneratedBy.toString().match(regexPattern) ||
          lead?.customerName.toString().match(regexPattern)
        );
      });
    }

    const totaldata = leadDataCount.length;
    // console.log(totaldata, "totalItems");

    const totalpages = Math.ceil(totaldata / itemPerPage);
    // console.log(totalpages, "totalpages");

    // success(res, `Lead ${status} List`, leadData);

    return res.status(200).json({
      status: true,
      subCode: 200,
      message: `Lead ${status} List`,
      error: "",
      items: leadDataSearch,
      currentPage,
      totalItems: leadDataSearch.length,
      totalPages: Math.ceil(totaldata / itemPerPage),
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}

// async function leadGenerateListForAdmin(req, res) {
//   try {
//     const employeeRole = Array.isArray(req.roleName)
//       ? req.roleName
//       : [req.roleName];
//     const tokenId = req.Id;
//     const { status, role, leadGeneratedBy } = req.query;
//     let query = {};
//     const { page = 1, limit = 50000 } = req.query;
//     const currentPage = parseInt(page, 10);
//     const itemPerPage = parseInt(limit, 10);
//     const skip = (currentPage - 1) * itemPerPage;
//     const searchQuery = req.query.search;

//     if (employeeRole.includes("admin") || employeeRole.includes("crm")) {
//       if (leadGeneratedBy && !["sales", "website"].includes(leadGeneratedBy)) {
//         return notFound(
//           res,
//           "leadGeneratedBy value. It should be either sales or website "
//         );
//       }
//       if (status) {
//         if (!["pending", "reject", "approved", "all"].includes(status)) {
//           return notFound(res, "Invalid status for admin");
//         }
//         console.log("status", status);

//         if (status !== "all") {
//           query.status = status;
//         }
//       }

//       if (leadGeneratedBy) {
//         query.leadGeneratedBy = leadGeneratedBy;
//       }
//     }

//     console.log("query", query);
//     const leadData = await leadGenerateModel
//       .find(query)
//       .skip(skip)
//       .limit(itemPerPage)
//       .populate({
//         path: "employeeGenerateId",
//         select: "employeName _id employeUniqueId userName",
//         populate: [{ path: "branchId", select: "branch _id" }],
//       })
//       .populate({
//         path: "employeeAssignId",
//         select: "employeName employeUniqueId userName _id",
//       })
//       .populate({ path: "managerId", select: "employeName userName _id" })
//       .populate({ path: "loanTypeId", select: "productName _id" })
//       .populate({ path: "branchId", select: "branch _id" });

//     const leadDatacount = await leadGenerateModel
//       .find(query)
//       .populate({
//         path: "employeeGenerateId",
//         select: "employeName _id employeUniqueId userName",
//         populate: [{ path: "branchId", select: "branch _id" }],
//       })
//       .populate({
//         path: "employeeAssignId",
//         select: "employeName employeUniqueId userName _id",
//       })
//       .populate({ path: "managerId", select: "employeName userName _id" })
//       .populate({ path: "loanTypeId", select: "productName _id" })
//       .populate({ path: "branchId", select: "branch _id" });

//     // with limit and skip //
//     let leadDataSearch = leadData;

//     // without limit and skip //
//     let leadDatacountSearch = leadDatacount;

//     // Apply search filter
//     if (searchQuery) {
//       // Convert `searchQuery` to regex pattern
//       const regexPattern = new RegExp(searchQuery, "i");

//       // Modify the search query to search by branch and productName
//       leadDataSearch = leadDatacountSearch.filter((lead) => {
//         return (
//           lead?.branchId?.branch.toString().match(regexPattern) ||
//           lead?.loanTypeId?.productName.toString().match(regexPattern) ||
//           lead?.employeeAssignId?.employeName.toString().match(regexPattern) ||
//           lead?.leadGeneratedBy.toString().match(regexPattern)
//         );
//       });
//     }

//     const totaldata = leadDatacount.length;
//     console.log(totaldata, "totalItems");

//     const totalpages = Math.ceil(totaldata / itemPerPage);
//     console.log(totalpages, "totalpages");

//     // success(res, `Lead ${status} List`, leadData);

//     return res.status(200).json({
//       status: true,
//       subCode: 200,
//       message: `Lead ${status} List`,
//       error: "",
//       items: leadDataSearch,
//       currentPage,
//       totalItems: leadDataSearch.length,
//       totalPages: Math.ceil(totaldata / itemPerPage),
//     });

//     // await leadGenerateGoogleSheetListBatch(leadDataSearch)
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error.message);
//   }
// }


async function leadGenerateListForAdmin(req, res) {
  try {
    const employeeRole = Array.isArray(req.roleName) ? req.roleName : [req.roleName];
    const tokenId = req.Id;
    const { page = 1, limit = 50000, searchQuery, status, role, leadGeneratedBy } = req.query;
    let query = {};
    const currentPage = parseInt(page, 10);
    const itemPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemPerPage;

    if (employeeRole.includes("admin") || employeeRole.includes("crm")) {
      if (leadGeneratedBy && !["sales", "website"].includes(leadGeneratedBy)) {
        return notFound(res, "leadGeneratedBy value. It should be either sales or website ");
      }
      if (status) {
        if (!["pending", "reject", "approved", "all"].includes(status)) {
          return notFound(res, "Invalid status for admin");
        }

        if (status !== "all") {
          query.status = status;
        }
      }

      if (leadGeneratedBy) {
        query.leadGeneratedBy = leadGeneratedBy;
      }
    }

    // Aggregation Pipeline
    const pipeline = [
      {
        $match: query, // Apply initial query (status, leadGeneratedBy, etc.)
      },
      {
        $lookup: {
          from: "employees", // Assuming employeeGenerateId and employeeAssignId are referencing the 'employees' collection
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "employeeGenerateId",
        },
      },
      {
        $unwind: { path: "$employeeGenerateId", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "employees", // Same for employeeAssignId
          localField: "employeeAssignId",
          foreignField: "_id",
          as: "employeeAssignId",
        },
      },
      {
        $unwind: { path: "$employeeAssignId", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "employees", // Assuming managerId is referencing the 'managers' collection
          localField: "managerId",
          foreignField: "_id",
          as: "managerId",
        },
      },
      {
        $unwind: { path: "$managerId", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "products", // Assuming loanTypeId is referencing the 'loanTypes' collection
          localField: "loanTypeId",
          foreignField: "_id",
          as: "loanTypeId",
        },
      },
      {
        $unwind: { path: "$loanTypeId", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "newbranches", // Assuming branchId is referencing the 'branches' collection
          localField: "branchId",
          foreignField: "_id",
          as: "branchId",
        },
      },
      {
        $unwind: { path: "$branchId", preserveNullAndEmptyArrays: true },
      },
      // Apply search filter using regex if searchQuery exists
      ...(searchQuery
        ? [
          {
            $match: {
              $or: [
                { "employeeGenerateId.employeName": { $regex: searchQuery, $options: "i" } },
                { "customerMobileNo": { $regex: searchQuery, $options: "i" } },
                { "customerName": { $regex: searchQuery, $options: "i" } },
              ],
            },
          },
        ]
        : []),
      { $sort: { createdAt: -1 } },
      // Pagination: skip and limit
      { $skip: skip },
      { $limit: itemPerPage },
      // Add any necessary projection here
      {
        $project: {
          _id: 1,
          employeeGenerateId: {
            _id: 1,
            employeName: 1,
            userName: 1,
            // branchId: 1,
            employeUniqueId: 1,
          },
          employeeAssignId: {
            _id: 1,
            employeName: 1,
            employeUniqueId: 1,
            userName: 1,
          },
          managerId: {
            _id: 1,
            employeName: 1,
            userName: 1,
          },
          loanTypeId: {
            _id: 1,
            productName: 1,
          },
          branchId: {
            _id: 1,
            name: 1,
          },
          customerName: 1,
          city: 1,
          customerMobileNo: 1,
          loanAmount: 1,
          pincode: 1,
          monthlyIncome: 1,
          selfieWithCustomer: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          leadGeneratedBy: 1,
          otherSourceOfIncome: 1,
          pakkaHouse: 1,
          remark: 1,
          formCompleteDate: 1,
        },
      },
    ];

    // Aggregate the data with the pipeline
    const leadData = await leadGenerateModel.aggregate(pipeline);

    // Get total count for pagination
    const totaldata = await leadGenerateModel.aggregate([
      { $match: query },
      { $count: "totalItems" },
    ]);
    const totalItems = totaldata.length > 0 ? totaldata[0].totalItems : 0;
    const totalPages = Math.ceil(totalItems / itemPerPage);

    return res.status(200).json({
      status: true,
      subCode: 200,
      message: `Lead ${status} List`,
      error: "",
      items: leadData,
      currentPage,
      totalItems,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}


async function getLeadGenerateDetails(req, res) {
  try {
    const { _id } = req.query;
    if (!_id) {
      return badRequest(res, "Lead ID is required");
    }
    const leadData = await leadGenerateModel
      .findById(_id)
      .populate({
        path: "employeeGenerateId",
        select: "employeName _id branchId companyId",
        populate: [
          { path: "branchId", select: "branch _id" },
          { path: "companyId", select: "companyName _id" },
        ],
      })
      .populate({ path: "employeeAssignId", select: "employeName _id" })
      .populate({ path: "loanTypeId", select: "productName _id" })
      .populate({ path: "branchId", select: "branch _id" });
    if (!leadData) {
      return notFound(res, "Lead not found");
    }
    return success(res, "Lead details retrieved successfully", leadData);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// async function leadGenerateDashboardList(req, res) {
//   try {
//     const { leadGeneratedBy } = req.query;

//     let query = {};
//     if (leadGeneratedBy) {
//       query.leadGeneratedBy = leadGeneratedBy;
//     }

//     // Fetch the lead data from the database with all the necessary population
//     const leadData = await leadGenerateModel.find(query)
//       .populate({
//         path: "employeeGenerateId",
//         select: "employeName _id branchId companyId",
//         populate: [
//           { path: "branchId", select: "branch _id" },
//           { path: "companyId", select: "companyName _id" }
//         ]
//       })
//       .populate({ path: "employeeAssignId", select: "employeName _id" })
//       .populate({ path: "loanTypeId", select: "productName _id" })
//       .populate({ path: "branchId", select: "branch _id" });

//     // Initialize counters
//     let totalLead = 0;
//     let approvedCount = 0;
//     let pendingCount = 0;
//     let rejectCount = 0;

//     // Iterate over leadData to calculate status counts
//     leadData.forEach((lead) => {
//       totalLead += 1;
//       if (lead.status === "approved") {
//         approvedCount += 1;
//       } else if (lead.status === "pending") {
//         pendingCount += 1;
//       } else if (lead.status === "reject") {
//         rejectCount += 1;
//       }
//     });

//     // Send response with the status counts
//     success(res, `Lead ${leadGeneratedBy ? leadGeneratedBy : ''} List`, {
//       totalLead,
//       approved: approvedCount,
//       pending: pendingCount,
//       reject: rejectCount,
//       items: leadData // Original lead data, if needed
//     });
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error.message);
//   }
// }

async function leadGenerateDashboardList(req, res) {
  try {
    const { leadGeneratedBy } = req.query;

    let query = {};
    if (leadGeneratedBy) {
      query.leadGeneratedBy = leadGeneratedBy;
    }

    // Fetch the lead data from the database
    const leadData = await leadGenerateModel
      .find(query)
      .populate({
        path: "employeeGenerateId",
        select: "employeName _id branchId companyId",
        populate: [
          { path: "branchId", select: "branch _id" },
          { path: "companyId", select: "companyName _id" },
        ],
      })
      .populate({ path: "employeeAssignId", select: "employeName _id" })
      .populate({ path: "loanTypeId", select: "productName _id" })
      .populate({ path: "branchId", select: "branch _id" });

    // Initialize counters
    let totalLead = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectCount = 0;

    // Iterate over leadData to calculate status counts
    leadData.forEach((lead) => {
      totalLead += 1;
      if (lead.status === "approved") {
        approvedCount += 1;
      } else if (lead.status === "pending") {
        pendingCount += 1;
      } else if (lead.status === "reject") {
        rejectCount += 1;
      }
    });

    const approvedPercentage = Math.round((approvedCount / totalLead) * 100);
    const pendingPercentage = Math.round((pendingCount / totalLead) * 100);
    const rejectPercentage = Math.round((rejectCount / totalLead) * 100);

    // Send response with the status counts and percentages
    success(res, `Lead ${leadGeneratedBy ? leadGeneratedBy : ""} List`, {
      total: totalLead,
      approved: approvedCount,
      pending: pendingCount,
      reject: rejectCount,
      totalCase: totalLead,
      approvedCase: `${approvedPercentage}%`,
      pendingCase: `${pendingPercentage}%`,
      rejectCase: `${rejectPercentage}%`,
      items: leadData, // Original lead data if needed
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}


async function leadGenerateMonthlyStats(req, res) {
  try {
    const { filterType } = req.query;
    const currentStart =
      filterType === "weekly"
        ? moment().startOf("week").toDate() // Monday
        : moment().startOf("month").toDate(); // First day of month
    const currentEnd =
      filterType === "weekly"
        ? moment().endOf("week").toDate()
        : moment().endOf("month").toDate();

    const lastStart =
      filterType === "weekly"
        ? moment().subtract(1, "week").startOf("week").toDate()
        : moment().subtract(1, "month").startOf("month").toDate();
    const lastEnd =
      filterType === "weekly"
        ? moment().subtract(1, "week").endOf("week").toDate()
        : moment().subtract(1, "month").endOf("month").toDate();

    // Fetch the leads for current and previous periods
    const currentSalesLeads = await leadGenerateModel.find({
      createdAt: { $gte: currentStart, $lte: currentEnd },
    });
    const lastSalesLeads = await leadGenerateModel.find({
      createdAt: { $gte: lastStart, $lte: lastEnd },
    });

    const currentWebsiteLeads = await websiteLeadModel.find({
      createdAt: { $gte: currentStart, $lte: currentEnd },
    });
    const lastWebsiteLeads = await websiteLeadModel.find({
      createdAt: { $gte: lastStart, $lte: lastEnd },
    });

    // Calculate stats for the leads
    const calculateStats = (leads) => {
      const total = leads.length;
      let approved = 0,
        pending = 0,
        rejected = 0;

      leads.forEach((lead) => {
        if (lead.status === "approved") approved++;
        else if (lead.status === "pending") pending++;
        else if (lead.status === "reject") rejected++;
      });

      return {
        total,
        approved,
        pending,
        rejected,
        // percentages: {
        //   approved: `${Math.round((approved / total) * 100) || 0}%`,
        //   pending: `${Math.round((pending / total) * 100) || 0}%`,
        //   rejected: `${Math.round((rejected / total) * 100) || 0}%`
        // }
      };
    };

    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? "∞%" : "0%"; // Handle division by zero
      const difference = current - previous;
      return `${Math.round((difference / previous) * 100)}%`;
    };

    // Weekly grouping logic
    const groupByDay = (leads) => {
      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const dayWiseStats = daysOfWeek.map((day) => ({
        day,
        approved: 0,
        pending: 0,
        rejected: 0,
        total: 0,
      }));

      leads.forEach((lead) => {
        const dayIndex = moment(lead.createdAt).isoWeekday() - 1; // ISO weekday: Monday = 1
        const stats = dayWiseStats[dayIndex];
        stats.total++;
        if (lead.status === "approved") stats.approved++;
        else if (lead.status === "pending") stats.pending++;
        else if (lead.status === "reject") stats.rejected++;
      });

      return dayWiseStats;
    };

    // Monthly stats for the whole year (January to December)
    const getMonthlyStats = async () => {
      const monthlyStats = [];
      const currentYear = moment().year();

      for (let month = 0; month < 12; month++) {
        const startOfMonth = moment()
          .year(currentYear)
          .month(month)
          .startOf("month")
          .toDate();
        const endOfMonth = moment()
          .year(currentYear)
          .month(month)
          .endOf("month")
          .toDate();

        const salesLeads = await leadGenerateModel.find({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const websiteLeads = await websiteLeadModel.find({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const salesStats = calculateStats(salesLeads);
        const websiteStats = calculateStats(websiteLeads);

        monthlyStats.push({
          month: moment().month(month).format("MMMM"),
          totalSalesLeads: salesStats.total,
          totalWebsiteLeads: websiteStats.total,
          totalSalesAndWebsiteLeads: salesStats.total + websiteStats.total,
          salesStats,
          websiteStats,
        });
      }

      return monthlyStats;
    };

    // Calculate current and last period stats
    const currentSalesStats = calculateStats(currentSalesLeads);
    const lastSalesStats = calculateStats(lastSalesLeads);

    const currentWebsiteStats = calculateStats(currentWebsiteLeads);
    const lastWebsiteStats = calculateStats(lastWebsiteLeads);

    // Day-wise stats if weekly filter is selected
    const salesDayWiseStats =
      filterType === "weekly" ? groupByDay(currentSalesLeads) : [];
    const websiteDayWiseStats =
      filterType === "weekly" ? groupByDay(currentWebsiteLeads) : [];

    // Combine sales and website stats for day-wise data
    const combinedDayWiseStats = salesDayWiseStats.map((salesStats, index) => {
      const websiteStats = websiteDayWiseStats[index];
      return {
        day: salesStats.day,
        total: salesStats.total + websiteStats.total,
        approved: salesStats.approved + websiteStats.approved,
        pending: salesStats.pending + websiteStats.pending,
        rejected: salesStats.rejected + websiteStats.rejected,
      };
    });

    // Sales and Website Leads Percentage Change Calculation
    const salesPercentagesChange = {
      // approved: calculatePercentageChange(currentSalesStats.approved, lastSalesStats.approved),
      // pending: calculatePercentageChange(currentSalesStats.pending, lastSalesStats.pending),
      // rejected: calculatePercentageChange(currentSalesStats.rejected, lastSalesStats.rejected)

      total: calculatePercentageChange(
        currentSalesStats.total,
        lastSalesStats.total
      ),
    };

    const websitePercentagesChange = {
      // approved: calculatePercentageChange(currentWebsiteStats.approved, lastWebsiteStats.approved),
      // pending: calculatePercentageChange(currentWebsiteStats.pending, lastWebsiteStats.pending),
      // rejected: calculatePercentageChange(currentWebsiteStats.rejected, lastWebsiteStats.rejected)

      total: calculatePercentageChange(
        currentWebsiteStats.total,
        lastWebsiteStats.total
      ),
    };

    // Function to calculate total change for overallStats
    const calculateTotalChange = (
      currentSalesStats,
      lastSalesStats,
      currentWebsiteStats,
      lastWebsiteStats
    ) => {
      // const totalApproved = currentSalesStats.approved + currentWebsiteStats.approved;
      // const totalPending = currentSalesStats.pending + currentWebsiteStats.pending;
      // const totalRejected = currentSalesStats.rejected + currentWebsiteStats.rejected;

      // const lastTotalApproved = lastSalesStats.approved + lastWebsiteStats.approved;
      // const lastTotalPending = lastSalesStats.pending + lastWebsiteStats.pending;
      // const lastTotalRejected = lastSalesStats.rejected + lastWebsiteStats.rejected;

      const totolCount = currentSalesStats.total + currentWebsiteStats.total;
      const lastTotal = lastSalesStats.total + lastWebsiteStats.total;

      return {
        // approved: calculatePercentageChange(totalApproved, lastTotalApproved),
        // pending: calculatePercentageChange(totalPending, lastTotalPending),
        // rejected: calculatePercentageChange(totalRejected, lastTotalRejected)
        total: calculatePercentageChange(totolCount, lastTotal),
      };
    };

    const overallStats = {
      totalLeads: currentSalesStats.total + currentWebsiteStats.total,
      websiteLeads: currentWebsiteStats.total,
      salesLeads: currentSalesStats.total,
      weeklyStats: combinedDayWiseStats,
      increment_decrement: calculateTotalChange(
        currentSalesStats,
        lastSalesStats,
        currentWebsiteStats,
        lastWebsiteStats
      ),
    };

    // Get the monthly stats from January to December
    const monthlyStats = await getMonthlyStats();

    // Send response
    // Prepare the final response including current and last month's sales and website leads with percentage changes
    success(res, "Lead Generate Stats", {
      filterType: filterType || "monthly",
      salesLead: {
        currentMonth: {
          ...currentSalesStats,
          Increment_decrement: salesPercentagesChange,
        },
        // lastMonth: {
        //   ...lastSalesStats,
        //   Increment_decrement: salesPercentagesChange
        // }
      },
      websiteLead: {
        currentMonth: {
          ...currentWebsiteStats,
          Increment_decrement: websitePercentagesChange,
        },
        // lastMonth: {
        //   ...lastWebsiteStats,
        //   percentageChange: websitePercentagesChange
        // }
      },
      overall: overallStats,
      monthlyStats, // Include monthly stats in the response
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}

// async function allFilesLeadGenerateDashBoard(req, res) {
//   try {
//     const {
//       page = 1,
//       limit = 100000,
//       status,
//       branch,
//       employee,
//       product,
//       startDateFilter,
//       endDateFilter,
//     } = req.query;

//     let matchConditions = {};

//     const today = new Date();
//     const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start at 12:00 AM
//     const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // End at 11:59 PM

//     function formatDateToISO(date) {
//       return date.toISOString(); // Convert to ISO format
//     }

//     // Adjust start and end dates based on filters
//     let formattedStart =
//       startDateFilter && startDateFilter !== "all"
//         ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set start of day
//         : defaultStartDate;

//     let formattedEnd =
//       endDateFilter && endDateFilter !== "all"
//         ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set end of day
//         : defaultEndDate;

//     // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
//     if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//       formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//       formattedEnd = new Date(
//         new Date(startDateFilter).setHours(23, 59, 59, 999)
//       );
//     }

//     // Convert to ISO format for MongoDB query
//     formattedStart = formatDateToISO(formattedStart);
//     formattedEnd = formatDateToISO(formattedEnd);

//     // Add match conditions for `createdAt`
//     if (
//       startDateFilter &&
//       endDateFilter &&
//       startDateFilter !== "all" &&
//       endDateFilter !== "all"
//     ) {
//       matchConditions["createdAt"] = {
//         $gte: new Date(formattedStart),
//         $lt: new Date(formattedEnd),
//       };
//     }

//     if (branch && branch !== "all") {
//       const branchArray = Array.isArray(branch) ? branch : branch.split(",");
//       matchConditions["generateEmployeeDetails.branchId"] = {
//         $in: branchArray.map((id) => new ObjectId(id)),
//       };
//     }

//     if (employee && employee !== "all") {
//       const employeeArray = Array.isArray(employee)
//         ? employee
//         : employee.split(",");
//       matchConditions["employeeGenerateId"] = {
//         $in: employeeArray.map((id) => new ObjectId(id)),
//       };
//     }

//     if (status && status !== "all") {
//       const statusArray = Array.isArray(status) ? status : status.split(",");
//       matchConditions["status"] = { $in: statusArray };
//     }

//     if (product && product !== "all") {
//       const productArray = Array.isArray(product)
//         ? product
//         : product.split(",");
//       matchConditions["loanTypeId"] = {
//         $in: productArray.map((id) => new ObjectId(id)),
//       };
//     }

//     console.log("matchConditions---", matchConditions);
//     const aggregationPipeline = [
//       {
//         $lookup: {
//           from: "employees",
//           localField: "employeeGenerateId",
//           foreignField: "_id",
//           as: "generateEmployeeDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$generateEmployeeDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "generateEmployeeDetails.branchId",
//           foreignField: "_id",
//           as: "branchDetails",
//         },
//       },
//       { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "products",
//           localField: "loanTypeId",
//           foreignField: "_id",
//           as: "productDetails",
//         },
//       },
//       {
//         $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
//       },

//       {
//         $lookup: {
//           from: "employees",
//           localField: "employeeAssignId",
//           foreignField: "_id",
//           as: "employeeAssignDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$employeeAssignDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       {
//         $lookup: {
//           from: "employees",
//           localField: "managerId",
//           foreignField: "_id",
//           as: "approveEmployeeDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$approveEmployeeDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       {
//         $addFields: {
//           leadDate: { $ifNull: ["$createdAt", ""] },
//           branchName: { $ifNull: ["$branchDetails.name", ""] },
//           loanTypeId: { $ifNull: ["$loanTypeId", ""] },
//           productName: { $ifNull: ["$productDetails.productName", ""] },
//           generateEmployeeName: {
//             $ifNull: ["$generateEmployeeDetails.employeName", ""],
//           },
//           generateEmployeeId: {
//             $ifNull: ["$generateEmployeeDetails._id", ""],
//           },
//           assignEmployeeName: {
//             $ifNull: ["$employeeAssignDetails.employeName", ""],
//           },
//           approvedEmployeeName: {
//             $ifNull: ["$approveEmployeeDetails.employeName", ""],
//           },
//           remark: { $ifNull: ["$remark", ""] },
//           customerName: { $ifNull: ["$customerName", ""] },
//           city: { $ifNull: ["$city", ""] },
//           customerMobileNo: { $ifNull: ["$customerMobileNo", ""] },
//           loanAmount: { $ifNull: ["$loanAmount", ""] },
//           pincode: { $ifNull: ["$pincode", ""] },
//           monthlyIncome: { $ifNull: ["$monthlyIncome", ""] },
//           distrctName: { $ifNull: ["$distrctName", ""] },
//           pakkaHouse: { $ifNull: ["$pakkaHouse", ""] },
//           agriland: { $ifNull: ["$agriland", ""] },
//           otherSourceOfIncome: { $ifNull: ["$otherSourceOfIncome", ""] },
//           customerFeedback: { $ifNull: ["$customerFeedback", ""] },
//         },
//       },

//       { $match: matchConditions },

//       {
//         $facet: {
//           fileDetails: [
//             { $skip: (page - 1) * limit },
//             { $limit: parseInt(limit) },
//             {
//               $project: {
//                 _id: 0,
//                 leadDate: 1,
//                 branchName: 1,
//                 loanTypeId: 1,
//                 productName: 1,
//                 approvedEmployeeName: 1,
//                 generateEmployeeId: 1,
//                 assignEmployeeName: 1,
//                 generateEmployeeName: 1,
//                 status: 1,
//                 remark: 1,
//                 customerName: 1,
//                 city: 1,
//                 customerMobileNo: 1,
//                 loanAmount: 1,
//                 pincode: 1,
//                 monthlyIncome: 1,
//                 distrctName: 1,
//                 pakkaHouse: 1,
//                 agriland: 1,
//                 otherSourceOfIncome: 1,
//                 customerFeedback: 1,
//               },
//             },
//           ],

//           // Count total leads
//           totalCount: [{ $count: "count" }],

//           // Count leads by status
//           statusCounts: [
//             {
//               $group: {
//                 _id: "$status",
//                 count: { $sum: 1 },
//               },
//             },
//           ],
//         },
//       },

//       {
//         $addFields: {
//           total: { $arrayElemAt: ["$totalCount.count", 0] },
//           statusCounts: {
//             $arrayToObject: {
//               $map: {
//                 input: "$statusCounts",
//                 as: "status",
//                 in: { k: "$$status._id", v: "$$status.count" },
//               },
//             },
//           },
//         },
//       },

//       {
//         $project: {
//           total: 1,
//           fileDetails: 1,
//           statusCounts: {
//             approved: { $ifNull: ["$statusCounts.approved", 0] },
//             pending: { $ifNull: ["$statusCounts.pending", 0] },
//             reject: { $ifNull: ["$statusCounts.reject", 0] },
//           },
//         },
//       },
//     ];

//     const result = await leadGenerateModel.aggregate(aggregationPipeline);

//     return success(res, "Lead Generate Dashboard", {
//       total: result[0]?.total || 0,
//       approved: result[0]?.statusCounts?.approved || 0,
//       pending: result[0]?.statusCounts?.pending || 0,
//       reject: result[0]?.statusCounts?.reject || 0,
//       fileDetails: result[0]?.fileDetails || [],
//     });
//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error.message);
//   }
// }


async function allFilesLeadGenerateDashBoard(req, res) {
  try {
    const { page = 1, limit = 100000, status, branch, searchQuery, regionalbranch, employee, product, startDateFilter, endDateFilter } = req.query;

    let matchConditions = {leadStatus :"active"};

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start at 12:00 AM
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // End at 11:59 PM

    function formatDateToISO(date) {
      return date.toISOString(); // Convert to ISO format
    }

    // Adjust start and end dates based on filters
    let formattedStart =
      startDateFilter && startDateFilter !== "all"
        ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set start of day
        : defaultStartDate;

    let formattedEnd =
      endDateFilter && endDateFilter !== "all"
        ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set end of day
        : defaultEndDate;

    // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(
        new Date(startDateFilter).setHours(23, 59, 59, 999)
      );
    }

    // Convert to ISO format for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Add match conditions for `createdAt`
    if (
      startDateFilter &&
      endDateFilter &&
      startDateFilter !== "all" &&
      endDateFilter !== "all"
    ) {
      matchConditions["createdAt"] = {
        $gte: new Date(formattedStart),
        $lt: new Date(formattedEnd),
      };
    }

    if (searchQuery) {
      matchConditions.$or = [
        { "customerName": { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      matchConditions["generateEmployeeDetails.branchId"] = {
        $in: branchArray.map((id) => new ObjectId(id)),
      };
    }
    if (regionalbranch && regionalbranch !== "all") {
      const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
      matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
    }

    if (employee && employee !== "all") {
      const employeeArray = Array.isArray(employee)
        ? employee
        : employee.split(",");
      matchConditions["employeeGenerateId"] = {
        $in: employeeArray.map((id) => new ObjectId(id)),
      };
    }

    if (status && status !== "all") {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      matchConditions["status"] = { $in: statusArray };
    }

    if (product && product !== "all") {
      const productArray = Array.isArray(product)
        ? product
        : product.split(",");
      matchConditions["loanTypeId"] = {
        $in: productArray.map((id) => new ObjectId(id)),
      };
    }

    // console.log("matchConditions---", matchConditions);
    const aggregationPipeline = [
      {
        $lookup: {
          from: "employees",
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "generateEmployeeDetails",
        },
      },
      {
        $unwind: {
          path: "$generateEmployeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "newbranches",
          localField: "generateEmployeeDetails.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "branchDetails.regionalBranchId",
          foreignField: "_id",
          as: "regionalBranchDetails"
        }
      },
      { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "products",
          localField: "loanTypeId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "employees",
          localField: "employeeAssignId",
          foreignField: "_id",
          as: "employeeAssignDetails",
        },
      },
      {
        $unwind: {
          path: "$employeeAssignDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "employees",
          localField: "managerId",
          foreignField: "_id",
          as: "approveEmployeeDetails",
        },
      },
      {
        $unwind: {
          path: "$approveEmployeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          leadDate: { $ifNull: ["$createdAt", ""] },
          branchName: { $ifNull: ["$branchDetails.name", ""] },
          regionalBranchName: { $ifNull: ["$regionalBranchDetails.name", ""] },
          loanTypeId: { $ifNull: ["$loanTypeId", ""] },
          productName: { $ifNull: ["$productDetails.productName", ""] },
          generateEmployeeName: {
            $ifNull: ["$generateEmployeeDetails.employeName", ""],
          },
          generateEmployeUniqueId: {
            $ifNull: ["$generateEmployeeDetails.employeUniqueId", ""],
          },
          generateEmployeeId: {
            $ifNull: ["$generateEmployeeDetails._id", ""],
          },
          assignEmployeeName: {
            $ifNull: ["$employeeAssignDetails.employeName", ""],
          },
          assignEmployeUniqueId: {
            $ifNull: ["$employeeAssignDetails.employeUniqueId", ""],
          },
          approvedEmployeeName: {
            $ifNull: ["$approveEmployeeDetails.employeName", ""],
          },
          remark: { $ifNull: ["$remark", ""] },
          customerName: { $ifNull: ["$customerName", ""] },
          city: { $ifNull: ["$city", ""] },
          customerMobileNo: { $ifNull: ["$customerMobileNo", ""] },
          roi: { $ifNull: ["$roi", ""] },
          tenure: { $ifNull: ["$tenure", ""] },
          emi: { $ifNull: ["$emi", ""] },
          salesRejectRemark: { $ifNull: ["$salesRejectRemark", ""] },
          loanAmount: { $ifNull: ["$loanAmount", ""] },
          pincode: { $ifNull: ["$pincode", ""] },
          monthlyIncome: { $ifNull: ["$monthlyIncome", ""] },
          distrctName: { $ifNull: ["$distrctName", ""] },
          pakkaHouse: { $ifNull: ["$pakkaHouse", ""] },
          agriland: { $ifNull: ["$agriland", ""] },
          otherSourceOfIncome: { $ifNull: ["$otherSourceOfIncome", ""] },
          customerFeedback: { $ifNull: ["$customerFeedback", ""] },
        },
      },

      { $match: matchConditions },

      {
        $facet: {
          fileDetails: [
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            {
              $project: {
                _id: 1,
                leadDate: 1,
                branchName: 1,
                regionalBranchName: 1,
                loanTypeId: 1,
                productName: 1,
                generateEmployeeId: 1,
                generateEmployeeName: 1,
                generateEmployeUniqueId:1,
                approvedEmployeeName: 1,
                assignEmployeeName: 1,
                assignEmployeUniqueId:1,
                status: 1,
                remark: 1,
                customerName: 1,
                city: 1,
                customerMobileNo: 1,
                emi: 1,
                salesRejectRemark: 1,
                tenure: 1,
                roi: 1,
                loanAmount: 1,
                pincode: 1,
                monthlyIncome: 1,
                distrctName: 1,
                pakkaHouse: 1,
                agriland: 1,
                otherSourceOfIncome: 1,
                customerFeedback: 1,
              },
            },
          ],

          // Count total leads
          totalCount: [{ $count: "count" }],

          // Count leads by status
          statusCounts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },

      {
        $addFields: {
          total: { $arrayElemAt: ["$totalCount.count", 0] },
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: "$statusCounts",
                as: "status",
                in: { k: "$$status._id", v: "$$status.count" },
              },
            },
          },
        },
      },

      {
        $project: {
          total: 1,
          fileDetails: 1,
          statusCounts: {
            approved: { $ifNull: ["$statusCounts.approved", 0] },
            pending: { $ifNull: ["$statusCounts.pending", 0] },
            reject: { $ifNull: ["$statusCounts.reject", 0] },
            rejectBySales: { $ifNull: ["$statusCounts.rejectBySales", 0] },
            leadConvert: { $ifNull: ["$statusCounts.leadConvert", 0] },
          },
        },
      },
    ];

    const result = await leadGenerateModel.aggregate(aggregationPipeline);
    const totalLeads = result[0]?.total || 0;
    const convertedLeads = result[0]?.statusCounts?.leadConvert || 0;
    const convertPercentage = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return success(res, "Lead Generate Dashboard", {
      total: result[0]?.total || 0,
      approved: result[0]?.statusCounts?.approved || 0,
      pending: result[0]?.statusCounts?.pending || 0,
      reject:(result[0]?.statusCounts?.reject || 0) + (result[0]?.statusCounts?.rejectBySales || 0),
      leadConvert: result[0]?.statusCounts?.leadConvert || 0,
      rejectBySales: result[0]?.statusCounts?.rejectBySales || 0,
      convertPercentage: convertPercentage.toFixed(2),
      fileDetails: result[0]?.fileDetails || [],
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}


async function leadGenerateMonthlyDashbord(req, res) {
  try {
    const { page = 1, limit = 100000, status, branch, searchQuery, regionalbranch, employee, product, startDateFilter, endDateFilter } = req.query;

    let matchConditions = {};

    // Determine if we're dealing with a full year request
    const currentYear = new Date().getFullYear();
    let isFullYearRequest = false;
    let requestedYear = currentYear;

    function formatDateToISO(date) {
      return date.toISOString(); // Convert to ISO format
    }

    // Default date range: Jan 1 - Dec 31 of current year
    let formattedStart, formattedEnd;

    // If no dates are provided, default to current year Jan-Dec
    if (!startDateFilter || startDateFilter === "all") {
      formattedStart = new Date(currentYear, 0, 1, 0, 0, 0, 0); // Jan 1, 00:00:00
      formattedEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31, 23:59:59
      isFullYearRequest = true;
    } 
    // If only a year is specified (e.g., "2024" or "2025")
    else if (/^\d{4}$/.test(startDateFilter) && (!endDateFilter || endDateFilter === "all" || /^\d{4}$/.test(endDateFilter))) {
      requestedYear = parseInt(startDateFilter);
      formattedStart = new Date(requestedYear, 0, 1, 0, 0, 0, 0); // Jan 1, 00:00:00
      
      // If endDateFilter is also a year, use the end of that year
      if (/^\d{4}$/.test(endDateFilter)) {
        const endYear = parseInt(endDateFilter);
        formattedEnd = new Date(endYear, 11, 31, 23, 59, 59, 999); // Dec 31, 23:59:59
        isFullYearRequest = startDateFilter === endDateFilter; // Only consider it a full year request if same year
      } else {
        formattedEnd = new Date(requestedYear, 11, 31, 23, 59, 59, 999); // Dec 31, 23:59:59
        isFullYearRequest = true;
      }
    } 
    // If we have specific date range
    else {
      // Parse dates, handling potential parsing errors
      let parsedStartDate = new Date(startDateFilter);
      let parsedEndDate = endDateFilter ? new Date(endDateFilter) : new Date();
      
      // Verify dates are valid
      if (isNaN(parsedStartDate.getTime())) {
        console.warn("Invalid start date, using current year start");
        parsedStartDate = new Date(currentYear, 0, 1);
      }
      
      if (isNaN(parsedEndDate.getTime())) {
        console.warn("Invalid end date, using current date");
        parsedEndDate = new Date();
      }
      
      // Check if both dates are from the same year
      const startYear = parsedStartDate.getFullYear();
      const endYear = parsedEndDate.getFullYear();
      
      if (startYear === endYear) {
        // Same year - show the full year regardless of specific dates
        formattedStart = new Date(startYear, 0, 1, 0, 0, 0, 0); // Jan 1
        formattedEnd = new Date(startYear, 11, 31, 23, 59, 59, 999); // Dec 31
        isFullYearRequest = true;
        requestedYear = startYear;
        console.log(`Same year detected (${startYear}), showing full year data`);
      } else {
        // Different years - use the actual date range with proper ordering
        // Always ensure start date is before end date
        if (parsedEndDate < parsedStartDate) {
          console.log("Swapping dates because end date is before start date");
          [parsedStartDate, parsedEndDate] = [parsedEndDate, parsedStartDate];
        }
        
        formattedStart = new Date(parsedStartDate.setHours(0, 0, 0, 0));
        formattedEnd = new Date(parsedEndDate.setHours(23, 59, 59, 999));
        isFullYearRequest = false;
      }
    }

    // ✅ If startDateFilter and endDateFilter are the same specific date, ensure correct filtering for that day
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter && !/^\d{4}$/.test(startDateFilter)) {
      const parsedDate = new Date(startDateFilter);
      if (!isNaN(parsedDate.getTime())) {
        formattedStart = new Date(parsedDate.setHours(0, 0, 0, 0));
        formattedEnd = new Date(parsedDate.setHours(23, 59, 59, 999));
        isFullYearRequest = false;
      }
    }

    // Convert to ISO format for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Add match conditions for `createdAt`
    matchConditions["createdAt"] = {
      $gte: new Date(formattedStart),
      $lt: new Date(formattedEnd),
    };

    if (searchQuery) {
      matchConditions.$or = [
        { "customerName": { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      matchConditions["generateEmployeeDetails.branchId"] = {
        $in: branchArray.map((id) => new ObjectId(id)),
      };
    }
    
    if (regionalbranch && regionalbranch !== "all") {
      const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
      matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
    }

    if (employee && employee !== "all") {
      const employeeArray = Array.isArray(employee)
        ? employee
        : employee.split(",");
      matchConditions["employeeGenerateId"] = {
        $in: employeeArray.map((id) => new ObjectId(id)),
      };
    }

    if (status && status !== "all") {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      matchConditions["status"] = { $in: statusArray };
    }

    if (product && product !== "all") {
      const productArray = Array.isArray(product)
        ? product
        : product.split(",");
      matchConditions["loanTypeId"] = {
        $in: productArray.map((id) => new ObjectId(id)),
      };
    }

    const aggregationPipeline = [
      // Keep only necessary lookups for filtering
      {
        $lookup: {
          from: "employees",
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "generateEmployeeDetails",
        },
      },
      {
        $unwind: {
          path: "$generateEmployeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "generateEmployeeDetails.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      { 
        $unwind: { 
          path: "$branchDetails", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchDetails.regionalBranchId",
          foreignField: "_id",
          as: "regionalBranchDetails"
        }
      },
      { 
        $unwind: { 
          path: "$regionalBranchDetails", 
          preserveNullAndEmptyArrays: true 
        } 
      },

      // Add only fields necessary for filtering and monthly counts
      {
        $addFields: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
      },

      // Apply all filters
      { $match: matchConditions },

      {
        $facet: {
          // Count total leads
          totalCount: [{ $count: "count" }],

          // Count leads by status
          statusCounts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          
          // Count leads by month
          monthlyLeadCounts: [
            {
              $group: {
                _id: {
                  month: "$month",
                  year: "$year"
                },
                count: { $sum: 1 },
                approved: { 
                  $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
                },
                pending: { 
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                },
                reject: { 
                  $sum: { $cond: [{ $eq: ["$status", "reject"] }, 1, 0] }
                },
                rejectBySales: { 
                  $sum: { $cond: [{ $eq: ["$status", "rejectBySales"] }, 1, 0] }
                },
                leadConvert: { 
                  $sum: { $cond: [{ $eq: ["$status", "leadConvert"] }, 1, 0] }
                }
              }
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
              $project: {
                _id: 0,
                month: "$_id.month",
                year: "$_id.year",
                total: "$count",
                approved: 1,
                pending: 1,
                reject: 1,
                rejectBySales: 1,
                leadConvert: 1
              }
            }
          ]
        },
      },

      {
        $addFields: {
          total: { $arrayElemAt: ["$totalCount.count", 0] },
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: "$statusCounts",
                as: "status",
                in: { k: "$$status._id", v: "$$status.count" },
              },
            },
          },
        },
      },
      {
        $project: {
          total: 1,
          statusCounts: {
            approved: { $ifNull: ["$statusCounts.approved", 0] },
            pending: { $ifNull: ["$statusCounts.pending", 0] },
            reject: { $ifNull: ["$statusCounts.reject", 0] },
            rejectBySales: { $ifNull: ["$statusCounts.rejectBySales", 0] },
            leadConvert: { $ifNull: ["$statusCounts.leadConvert", 0] },
          },
          monthlyLeadCounts: 1
        },
      },
    ];

    const result = await leadGenerateModel.aggregate(aggregationPipeline);
    const totalLeads = result[0]?.total || 0;
    const convertedLeads = result[0]?.statusCounts?.leadConvert || 0;
    const convertPercentage = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Format monthly data for graph
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyData = result[0]?.monthlyLeadCounts || [];
    
    // For full year requests, ensure all months are included (Jan to Dec)
    if (isFullYearRequest) {
      // Create a complete set of months for the requested year
      const completeMonthlyData = [];
      for (let month = 1; month <= 12; month++) {
        // Find if we have data for this month
        const existingData = monthlyData.find(item => 
          item.month === month && item.year === requestedYear
        );
        
        if (existingData) {
          completeMonthlyData.push(existingData);
        } else {
          // Add empty data for this month
          completeMonthlyData.push({
            month: month,
            year: requestedYear,
            total: 0,
            approved: 0,
            pending: 0,
            reject: 0,
            rejectBySales: 0,
            leadConvert: 0
          });
        }
      }
      monthlyData = completeMonthlyData;
    }
    
    // Format the monthly data
    const formattedMonthlyData = monthlyData.map(item => ({
      month: monthNames[item.month - 1],
      monthYear: `${monthNames[item.month - 1]} ${item.year}`,
      year: item.year,
      total: item.total || 0,
      approved: item.approved || 0,
      pending: item.pending || 0,
      reject: item.reject || 0,
      rejectBySales: item.rejectBySales || 0,
      leadConvert: item.leadConvert || 0
    }));

    // Create a custom message with date range when filters are applied
    let message = "Lead Generate Dashboard";
    
    if (isFullYearRequest) {
      message = `Lead Generate Dashboard (${requestedYear})`;
    } else if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      // Format dates for display
      let startFormatted, endFormatted;
      
      // Check if the dates are years only
      if (/^\d{4}$/.test(startDateFilter) && /^\d{4}$/.test(endDateFilter)) {
        startFormatted = startDateFilter;
        endFormatted = endDateFilter;
        message = `Lead Generate Dashboard (${startFormatted} to ${endFormatted})`;
      } else {
        // Use try-catch to handle potential date formatting errors
        try {
          startFormatted = new Date(formattedStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          endFormatted = new Date(formattedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          message = `Lead Generate Dashboard (${startFormatted} to ${endFormatted})`;
        } catch (e) {
          console.warn("Error formatting dates for display:", e);
          message = "Lead Generate Dashboard (Custom Date Range)";
        }
      }
    }

    return success(res, message, {
      total: result[0]?.total || 0,
      approved: result[0]?.statusCounts?.approved || 0,
      pending: result[0]?.statusCounts?.pending || 0,
      reject: result[0]?.statusCounts?.reject || 0,
      leadConvert: result[0]?.statusCounts?.leadConvert || 0,
      rejectBySales: result[0]?.statusCounts?.rejectBySales || 0,
      monthlyLeadCounts: formattedMonthlyData
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}

// leadProductPercentageDashbord

async function leadProductPercentageDashbord(req, res) {
  try {
    const { page = 1, limit = 100000, status, branch, searchQuery, regionalbranch, employee, product, startDateFilter, endDateFilter } = req.query;

    let matchConditions = {};

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start at 12:00 AM
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // End at 11:59 PM

    function formatDateToISO(date) {
      return date.toISOString(); // Convert to ISO format
    }

    // Adjust start and end dates based on filters
    let formattedStart =
      startDateFilter && startDateFilter !== "all"
        ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set start of day
        : defaultStartDate;

    let formattedEnd =
      endDateFilter && endDateFilter !== "all"
        ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set end of day
        : defaultEndDate;

    // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(
        new Date(startDateFilter).setHours(23, 59, 59, 999)
      );
    }

    // Convert to ISO format for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Add match conditions for `createdAt`
    if (
      startDateFilter &&
      endDateFilter &&
      startDateFilter !== "all" &&
      endDateFilter !== "all"
    ) {
      matchConditions["createdAt"] = {
        $gte: new Date(formattedStart),
        $lt: new Date(formattedEnd),
      };
    }

    if (searchQuery) {
      matchConditions.$or = [
        { "customerName": { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (branch && branch !== "all") {
      const branchArray = Array.isArray(branch) ? branch : branch.split(",");
      matchConditions["generateEmployeeDetails.branchId"] = {
        $in: branchArray.map((id) => new ObjectId(id)),
      };
    }
    if (regionalbranch && regionalbranch !== "all") {
      const regionalbranchArray = Array.isArray(regionalbranch) ? regionalbranch : regionalbranch.split(",");
      matchConditions["regionalBranchDetails._id"] = { $in: regionalbranchArray.map(id => new ObjectId(id)) };
    }

    if (employee && employee !== "all") {
      const employeeArray = Array.isArray(employee)
        ? employee
        : employee.split(",");
      matchConditions["employeeGenerateId"] = {
        $in: employeeArray.map((id) => new ObjectId(id)),
      };
    }

    if (status && status !== "all") {
      const statusArray = Array.isArray(status) ? status : status.split(",");
      matchConditions["status"] = { $in: statusArray };
    }

    if (product && product !== "all") {
      const productArray = Array.isArray(product)
        ? product
        : product.split(",");
      matchConditions["loanTypeId"] = {
        $in: productArray.map((id) => new ObjectId(id)),
      };
    }

    const aggregationPipeline = [
      {
        $lookup: {
          from: "employees",
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "generateEmployeeDetails",
        },
      },
      {
        $unwind: {
          path: "$generateEmployeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "newbranches",
          localField: "generateEmployeeDetails.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          localField: "branchDetails.regionalBranchId",
          foreignField: "_id",
          as: "regionalBranchDetails"
        }
      },
      { $unwind: { path: "$regionalBranchDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "products",
          localField: "loanTypeId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
      },

      { $match: matchConditions },

      // First stage to count total documents after all matches
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          products: {
            $push: {
              productId: "$loanTypeId",
              productName: "$productDetails.productName"
            }
          }
        }
      },
      
      // Second stage to unwind products for grouping
      { $unwind: "$products" },
      
      // Group by product to get count per product
      {
        $group: {
          _id: {
            totalCount: "$totalCount",
            productId: "$products.productId",
            productName: "$products.productName"
          },
          count: { $sum: 1 }
        }
      },
      
      // Calculate percentages
      {
        $project: {
          _id: 0,
          productName: "$_id.productName",
          count: "$count",
          percentage: {
            $cond: [
              { $eq: ["$_id.totalCount", 0] },
              0,
              { $multiply: [{ $divide: ["$count", "$_id.totalCount"] }, 100] }
            ]
          }
        }
      },
      
      // Sort by product name
      { $sort: { productName: 1 } }
    ];

    const results = await leadGenerateModel.aggregate(aggregationPipeline);
    
    // Format percentages to 2 decimal places
    const formattedResults = results.map(item => ({
      productName: item.productName || "Unknown",
      count: item.count,
      percentage: parseFloat(item.percentage.toFixed(2))
    }));

    return success(res, "Product Percentage Analysis", formattedResults);
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}



async function leadDashBoardEmployeeTable(req, res) {
  try {
    const { startDateFilter, endDateFilter, matchStatus } = req.query;
    const employeeId = req.Id; // Employee ID from request

    // Check if the requesting employee exists and is active
    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    let matchConditions = { leadStatus: "active" }; // Filter leads

    function formatDateToISO(date) {
      return new Date(date).toISOString();
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : new Date("2024-08-30"); // Default to August 30, 2024

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : new Date();

    if (formattedStart) formattedStart = formatDateToISO(formattedStart);
    if (formattedEnd) formattedEnd = formatDateToISO(formattedEnd);

    if (formattedStart && formattedEnd) {
      matchConditions.createdAt = { $gte: new Date(formattedStart), $lte: new Date(formattedEnd) };
    }

    // 🔥 **Aggregation pipeline**
    const aggregationPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "employees",
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      { $unwind: "$employeeDetails" },
    ];

    // 🆕 Conditionally add employee status filter
    if (matchStatus && matchStatus !== "all") {
      aggregationPipeline.push({
        $match: {
          "employeeDetails.status": matchStatus
        }
      });
    }

    // Continue with the rest of the pipeline
    aggregationPipeline.push(
      {
        $group: {
          _id: "$employeeDetails._id",
          employeeName: { $first: "$employeeDetails.employeName" },
          employeeId: { $first: "$employeeDetails._id" },
          employeeStatus: { $first: "$employeeDetails.status" }, // Add employee status
          approvedFiles: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          rejectedFiles: {
            $sum: {
              $cond: [
                { $in: ["$status", ["reject", "rejectBySales"]] },
                1,
                0
              ]
            }
          },
          leadConvertFiles: { $sum: { $cond: [{ $eq: ["$status", "leadConvert"] }, 1, 0] } },
          pendingFiles: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          employeeTarget: { $first: "$employeeDetails.employeeTarget" },
        },
      },
      {
        $project: {
          _id: 0,
          employeeName: 1,
          employeeId: 1,
          employeeStatus: 1, // Include employee status in projection
          pendingFiles: 1,
          rejectedFiles: 1,
          approvedFiles: 1,
          leadConvertFiles: 1,
          employeeTarget: 1,
          totalFiles: { $add: ["$pendingFiles", "$rejectedFiles", "$approvedFiles", "$leadConvertFiles"] },
        },
      }
    );

    // Execute the aggregation
    const resultEmployee = await leadGenerateModel.aggregate(aggregationPipeline);

    // Calculate totals across all employees
    let totalApprovedFiles = 0;
    let totalRejectedFiles = 0;
    let totalLeadConvertFiles = 0;
    let totalPendingFiles = 0;
    let grandTotalFiles = 0;

    // Calculate employee targets and collect totals
    resultEmployee.forEach((employee) => {
      // Add to totals
      totalApprovedFiles += employee.approvedFiles;
      totalRejectedFiles += employee.rejectedFiles;
      totalLeadConvertFiles += employee.leadConvertFiles;
      totalPendingFiles += employee.pendingFiles;
      grandTotalFiles += employee.totalFiles;

      // Employee target calculation
      const salesTarget = employee.employeeTarget?.find((target) => target.title === "lead generate");

      if (employee.totalFiles > 0) {
        employee.leadConvertPercentage = Number(((employee.leadConvertFiles / employee.totalFiles) * 100).toFixed(2));
      } else {
        employee.leadConvertPercentage = 0;
      }

      if (salesTarget && salesTarget.value) {
        const targetValue = parseInt(salesTarget.value, 10);

        // Calculate the number of months
        const startDate = new Date(formattedStart);
        const endDate = new Date(formattedEnd);
        
        // Include the current month
        const totalMonths = calculateTotalMonths(startDate, endDate) + 1;
        employee.leadTargetValue = targetValue * totalMonths;
      } else {
        employee.leadTargetValue = 0;
      }

      // Check if totalFiles meets or exceeds the target
      if (employee.leadTargetValue > 0 && employee.totalFiles >= employee.leadTargetValue) {
        employee.achieveStatus = true;
      } else {
        employee.achieveStatus = false;
      }
      delete employee.employeeTarget;
    });

    // **Sorting: achieveStatus (true first), then by totalFiles (descending), then by approvedFiles (descending)**
    resultEmployee.sort((a, b) => {
      if (b.achieveStatus !== a.achieveStatus) {
        return b.achieveStatus - a.achieveStatus; // true first
      }
      if (b.totalFiles !== a.totalFiles) {
        return b.totalFiles - a.totalFiles; // Sort by totalFiles descending
      }
      return b.approvedFiles - a.approvedFiles; // Sort by approvedFiles descending
    });

    const response = {
      filterStatus: matchStatus, // Show the status filter applied
      TotalCases: resultEmployee.length || 0,
      totalmonths: calculateTotalMonths(new Date(formattedStart), new Date(formattedEnd)) + 1,
      // Add totals to the response
      totalApprovedFiles: totalApprovedFiles,
      totalRejectedFiles: totalRejectedFiles,
      totalLeadConvertFiles: totalLeadConvertFiles,
      totalPendingFiles: totalPendingFiles,
      totalFiles: grandTotalFiles,
      Detail: resultEmployee,
    };

    return success(res, "Lead Files Employee Table Dashboard", response);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


// Updated leadDashBoardProductTable with totals and matchStatus filter
// async function leadDashBoardProductTable(req, res) {
//   try {
//     const { startDateFilter, endDateFilter, matchStatus } = req.query; // 🆕 Added matchStatus
//     const employeeId = req.Id;

//     const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
//     if (!employeeExist) {
//       return badRequest(res, "Employee Not Found");
//     }
//     let matchConditions = {leadStatus :"active"};

//     const today = new Date();
//     const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start at 12:00 AM
//     const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // End at 11:59 PM

//     function formatDateToISO(date) {
//       return date.toISOString(); // Convert to ISO format
//     }

//     // Adjust start and end dates based on filters
//     let formattedStart =
//       startDateFilter && startDateFilter !== "all"
//         ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set start of day
//         : defaultStartDate;

//     let formattedEnd =
//       endDateFilter && endDateFilter !== "all"
//         ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set end of day
//         : defaultEndDate;

//     // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
//     if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//       formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//       formattedEnd = new Date(
//         new Date(startDateFilter).setHours(23, 59, 59, 999)
//       );
//     }

//     // Convert to ISO format for MongoDB query
//     formattedStart = formatDateToISO(formattedStart);
//     formattedEnd = formatDateToISO(formattedEnd);

//     // Add match conditions for `createdAt`
//     if (
//       startDateFilter &&
//       endDateFilter &&
//       startDateFilter !== "all" &&
//       endDateFilter !== "all"
//     ) {
//       matchConditions["createdAt"] = {
//         $gte: new Date(formattedStart),
//         $lt: new Date(formattedEnd),
//       };
//     }

//     // 🔥 **Aggregation pipeline with conditional product status filtering**
//     const aggregationPipeline = [
//       { $match: matchConditions },
//       {
//         $lookup: {
//           from: "products",
//           localField: "loanTypeId",
//           foreignField: "_id",
//           as: "productDetail",
//         },
//       },
//       { $unwind: "$productDetail" },
//     ];

//     // 🆕 Conditionally add product status filter
//     if (matchStatus && matchStatus !== "all") {
//       aggregationPipeline.push({
//         $match: {
//           "productDetail.status": matchStatus // Filter by product status
//         }
//       });
//     }

//     // Continue with the rest of the pipeline
//     aggregationPipeline.push(
//       {
//         $unwind: "$status", // Unwind statusByCreditPd to process each status separately
//       },
//       {
//         $group: {
//           _id: "$productDetail._id",
//           productName: { $first: "$productDetail.productName" },
//           productId: { $first: "$productDetail._id" },
//           productStatus: { $first: "$productDetail.status" }, // 🆕 Add product status
//           approvedFiles: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
//             },
//           },
//           rejectedFiles: {
//             $sum: {
//               $cond: [
//                 { $in: ["$status", ["reject", "rejectBySales"]] },
//                 1,
//                 0
//               ]
//             }
//           },
//           leadConvertFiles: {
//             $sum: {
//               $cond: [{ $eq: ["$status","leadConvert"] }, 1, 0],
//             },
//           },
//           pendingFiles: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           productName: 1,
//           productId: 1,
//           productStatus: 1, // 🆕 Include product status in projection
//           pendingFiles: 1,
//           rejectedFiles: 1,
//           approvedFiles: 1,
//           leadConvertFiles: 1,
//           totalFiles: {
//             $add: [
//               "$pendingFiles",
//               "$rejectedFiles",
//               "$approvedFiles",
//               "$leadConvertFiles",
//             ],
//           },
//         },
//       }
//     );

//     // Execute the aggregation
//     const resultProduct = await leadGenerateModel.aggregate(aggregationPipeline);

//     // Calculate the totals across all products
//     let totalApprovedFiles = 0;
//     let totalRejectedFiles = 0;
//     let totalLeadConvertFiles = 0;
//     let totalPendingFiles = 0;
//     let grandTotalFiles = 0;

//     // Add up all the totals
//     resultProduct.forEach(product => {
//       totalApprovedFiles += product.approvedFiles;
//       totalRejectedFiles += product.rejectedFiles;
//       totalLeadConvertFiles += product.leadConvertFiles;
//       totalPendingFiles += product.pendingFiles;
//       grandTotalFiles += product.totalFiles;
//     });

//     const response = {
//       filterStatus: matchStatus, // 🆕 Show the status filter applied
//       TotalCases: resultProduct.length || 0,
//       // Add totals to the response
//       totalApprovedFiles,
//       totalRejectedFiles,
//       totalLeadConvertFiles,
//       totalPendingFiles,
//       totalFiles: grandTotalFiles,
//       productDetail: resultProduct,
//     };

//     return success(res, "Lead Files Product Table Dashboard", response);

//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }

async function leadDashBoardProductTable(req, res) {
  try {
    const { startDateFilter, endDateFilter, matchStatus } = req.query; // 🆕 Added matchStatus
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }
    let matchConditions = {leadStatus :"active"};

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start at 12:00 AM
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // End at 11:59 PM

    function formatDateToISO(date) {
      return date.toISOString(); // Convert to ISO format
    }

    // Adjust start and end dates based on filters
    let formattedStart =
      startDateFilter && startDateFilter !== "all"
        ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set start of day
        : defaultStartDate;

    let formattedEnd =
      endDateFilter && endDateFilter !== "all"
        ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set end of day
        : defaultEndDate;

    // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(
        new Date(startDateFilter).setHours(23, 59, 59, 999)
      );
    }

    // Convert to ISO format for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Add match conditions for `createdAt`
    if (
      startDateFilter &&
      endDateFilter &&
      startDateFilter !== "all" &&
      endDateFilter !== "all"
    ) {
      matchConditions["createdAt"] = {
        $gte: new Date(formattedStart),
        $lt: new Date(formattedEnd),
      };
    }

    // 🔥 **First aggregation to get employee data with targets**
    const employeeDataPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "employees",
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      { $unwind: "$employeeDetails" },
      {
        $group: {
          _id: "$employeeGenerateId",
          employeeTarget: { $first: "$employeeDetails.employeeTarget" },
          products: { $addToSet: "$loanTypeId" } // Get unique products per employee
        }
      }
    ];

    const employeeTargetData = await leadGenerateModel.aggregate(employeeDataPipeline);
    
    // Create a map for employee targets and product counts
    const employeeTargetMap = new Map();
    employeeTargetData.forEach(emp => {
      const salesTarget = emp.employeeTarget?.find((target) => target.title === "lead generate");
      const targetValue = salesTarget?.value ? parseInt(salesTarget.value, 10) : 0;
      
      // Calculate total months
      const startDate = new Date(formattedStart);
      const endDate = new Date(formattedEnd);
      const totalMonths = calculateTotalMonths(startDate, endDate) + 1;
      
      employeeTargetMap.set(emp._id.toString(), {
        leadTargetValue: targetValue * totalMonths,
        productCount: emp.products.length
      });
    });

    // 🔥 **Second aggregation for product data**
    const aggregationPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "products",
          localField: "loanTypeId",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      { $unwind: "$productDetail" },
    ];

    // 🆕 Conditionally add product status filter
    if (matchStatus && matchStatus !== "all") {
      aggregationPipeline.push({
        $match: {
          "productDetail.status": matchStatus // Filter by product status
        }
      });
    }

    // Continue with the rest of the pipeline
    aggregationPipeline.push(
      {
        $lookup: {
          from: "employees",
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      { $unwind: "$employeeDetails" },
      {
        $unwind: "$status", // Unwind statusByCreditPd to process each status separately
      },
      {
        $group: {
          _id: "$productDetail._id",
          productName: { $first: "$productDetail.productName" },
          productId: { $first: "$productDetail._id" },
          productStatus: { $first: "$productDetail.status" },
          approvedFiles: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
            },
          },
          rejectedFiles: {
            $sum: {
              $cond: [
                { $in: ["$status", ["reject", "rejectBySales"]] },
                1,
                0
              ]
            }
          },
          leadConvertFiles: {
            $sum: {
              $cond: [{ $eq: ["$status","leadConvert"] }, 1, 0],
            },
          },
          pendingFiles: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          // Collect employee data for target calculations
          employeeData: {
            $push: {
              employeeId: "$employeeGenerateId"
            }
          }
        },
      },
      {
        $project: {
          _id: 0,
          productName: 1,
          productId: 1,
          productStatus: 1,
          pendingFiles: 1,
          rejectedFiles: 1,
          approvedFiles: 1,
          leadConvertFiles: 1,
          employeeData: 1,
          totalFiles: {
            $add: [
              "$pendingFiles",
              "$rejectedFiles",
              "$approvedFiles",
              "$leadConvertFiles",
            ],
          },
        },
      }
    );

    // Execute the aggregation
    const resultProduct = await leadGenerateModel.aggregate(aggregationPipeline);

    // Calculate the totals across all products
    let totalApprovedFiles = 0;
    let totalRejectedFiles = 0;
    let totalLeadConvertFiles = 0;
    let totalPendingFiles = 0;
    let grandTotalFiles = 0;

    // Process results to calculate percentages
    const processedResults = resultProduct.map(product => {
      // Calculate target for this product
      let totalProductTarget = 0;
      const uniqueEmployees = [...new Set(product.employeeData.map(e => e.employeeId.toString()))];
      
      uniqueEmployees.forEach(employeeId => {
        const employeeData = employeeTargetMap.get(employeeId);
        if (employeeData && employeeData.productCount > 0) {
          totalProductTarget += employeeData.leadTargetValue / employeeData.productCount;
        }
      });

      // Calculate percentages based on aggregated totals
      const productPercentage = totalProductTarget > 0 
        ? Number(((product.totalFiles / totalProductTarget) * 100).toFixed(2))
        : 0;

      // ✅ Fix: Calculate leadConvertPercentage based on aggregated totals
      const leadConvertPercentage = product.totalFiles > 0
        ? Number(((product.leadConvertFiles / product.totalFiles) * 100).toFixed(2))
        : 0;

      // Add to grand totals
      totalApprovedFiles += product.approvedFiles;
      totalRejectedFiles += product.rejectedFiles;
      totalLeadConvertFiles += product.leadConvertFiles;
      totalPendingFiles += product.pendingFiles;
      grandTotalFiles += product.totalFiles;

      return {
        productName: product.productName,
        productId: product.productId,
        productStatus: product.productStatus,
        pendingFiles: product.pendingFiles,
        rejectedFiles: product.rejectedFiles,
        approvedFiles: product.approvedFiles,
        leadConvertFiles: product.leadConvertFiles,
        totalFiles: product.totalFiles,
        productTargetValue: totalProductTarget, // Total target allocated to this product
        productPercentage: productPercentage, // Achievement percentage
        leadConvertPercentage: leadConvertPercentage // Correct conversion percentage
      };
    });

    const response = {
      filterStatus: matchStatus, // 🆕 Show the status filter applied
      TotalCases: processedResults.length || 0,
      // Add totals to the response
      totalApprovedFiles,
      totalRejectedFiles,
      totalLeadConvertFiles,
      totalPendingFiles,
      totalFiles: grandTotalFiles,
      productDetail: processedResults,
    };

    return success(res, "Lead Files Product Table Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// // Updated leadDashBoardProductTable with totals
// async function leadDashBoardProductTable(req, res) {
//   try {
//     const { startDateFilter, endDateFilter } = req.query;
//     const employeeId = req.Id;

//     const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
//     if (!employeeExist) {
//       return badRequest(res, "Employee Not Found");
//     }
//     let matchConditions = {leadStatus :"active"};

//     const today = new Date();
//     const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start at 12:00 AM
//     const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // End at 11:59 PM

//     function formatDateToISO(date) {
//       return date.toISOString(); // Convert to ISO format
//     }

//     // Adjust start and end dates based on filters
//     let formattedStart =
//       startDateFilter && startDateFilter !== "all"
//         ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set start of day
//         : defaultStartDate;

//     let formattedEnd =
//       endDateFilter && endDateFilter !== "all"
//         ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set end of day
//         : defaultEndDate;

//     // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
//     if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
//       formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
//       formattedEnd = new Date(
//         new Date(startDateFilter).setHours(23, 59, 59, 999)
//       );
//     }

//     // Convert to ISO format for MongoDB query
//     formattedStart = formatDateToISO(formattedStart);
//     formattedEnd = formatDateToISO(formattedEnd);

//     // Add match conditions for `createdAt`
//     if (
//       startDateFilter &&
//       endDateFilter &&
//       startDateFilter !== "all" &&
//       endDateFilter !== "all"
//     ) {
//       matchConditions["createdAt"] = {
//         $gte: new Date(formattedStart),
//         $lt: new Date(formattedEnd),
//       };
//     }

//     const resultProduct = await leadGenerateModel.aggregate([
//       { $match: matchConditions },
//       {
//         $lookup: {
//           from: "products",
//           localField: "loanTypeId",
//           foreignField: "_id",
//           as: "productDetail",
//         },
//       },
//       { $unwind: "$productDetail" },
//       {
//         $unwind: "$status", // Unwind statusByCreditPd to process each status separately
//       },
//       {
//         $group: {
//           _id: "$productDetail._id",
//           productName: { $first: "$productDetail.productName" },
//           productId: { $first: "$productDetail._id" },
//           approvedFiles: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
//             },
//           },
//           rejectedFiles: {
//             $sum: {
//               $cond: [
//                 { $in: ["$status", ["reject", "rejectBySales"]] },
//                 1,
//                 0
//               ]
//             }
//           },
//           leadConvertFiles: {
//             $sum: {
//               $cond: [{ $eq: ["$status","leadConvert"] }, 1, 0],
//             },
//           },
//           pendingFiles: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
//             },
//           },
//         },
//       },

//       {
//         $project: {
//           _id: 0,
//           productName: 1,
//           productId: 1,
//           pendingFiles: 1,
//           rejectedFiles: 1,
//           approvedFiles: 1,
//           leadConvertFiles: 1,
//           totalFiles: {
//             $add: [
//               "$pendingFiles",
//               "$rejectedFiles",
//               "$approvedFiles",
//               "$leadConvertFiles",
//             ],
//           },
//         },
//       },
//     ]);

//     // Calculate the totals across all products
//     let totalApprovedFiles = 0;
//     let totalRejectedFiles = 0;
//     let totalLeadConvertFiles = 0;
//     let totalPendingFiles = 0;
//     let grandTotalFiles = 0;

//     // Add up all the totals
//     resultProduct.forEach(product => {
//       totalApprovedFiles += product.approvedFiles;
//       totalRejectedFiles += product.rejectedFiles;
//       totalLeadConvertFiles += product.leadConvertFiles;
//       totalPendingFiles += product.pendingFiles;
//       grandTotalFiles += product.totalFiles;
//     });

//     const response = {
//       TotalCases: resultProduct.length || 0,
//       // Add totals to the response
//       totalApprovedFiles,
//       totalRejectedFiles,
//       totalLeadConvertFiles,
//       totalPendingFiles,
//       totalFiles: grandTotalFiles,
//       productDetail: resultProduct,
//     };

//     return success(res, "Lead Files Product Table Dashboard", response);

//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }


async function leadDashBoardBranchTable(req, res) {
  try {
    const { startDateFilter, endDateFilter, matchStatus = "active" } = req.query;
    const employeeId = req.Id;

    const employeeExist = await employeeModel.findOne({ _id: employeeId, status: "active" });
    if (!employeeExist) {
      return badRequest(res, "Employee Not Found");
    }

    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start at 12:00 AM
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // End at 11:59 PM

    function formatDateToISO(date) {
      return date.toISOString(); // Convert to ISO format
    }

    // Adjust start and end dates based on filters
    let formattedStart =
      startDateFilter && startDateFilter !== "all"
        ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0)) // Set start of day
        : defaultStartDate;

    let formattedEnd =
      endDateFilter && endDateFilter !== "all"
        ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999)) // Set end of day
        : defaultEndDate;

    // ✅ If startDateFilter and endDateFilter are the same, ensure correct filtering for that day
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(
        new Date(startDateFilter).setHours(23, 59, 59, 999)
      );
    }

    // Convert to ISO format for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // First, get all employee targets grouped by branch
    const employeeTargetsPipeline = [
      {
        $lookup: {
          from: "employees",
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      { $unwind: "$employeeDetails" },
      {
        $lookup: {
          from: "newbranches",
          localField: "employeeDetails.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      { $unwind: "$branchDetails" },
      {
        $group: {
          _id: "$branchDetails._id",
          branchId: { $first: "$branchDetails._id" },
          employees: {
            $addToSet: {
              employeeId: "$employeeDetails._id",
              employeeTarget: "$employeeDetails.employeeTarget"
            }
          }
        }
      }
    ];

    const branchEmployeeTargets = await leadGenerateModel.aggregate(employeeTargetsPipeline);

    // Calculate total target for each branch
    const branchTargetMap = new Map();
    branchEmployeeTargets.forEach(branch => {
      let totalBranchTarget = 0;
      
      branch.employees.forEach(emp => {
        const salesTarget = emp.employeeTarget?.find((target) => target.title === "lead generate");
        if (salesTarget && salesTarget.value) {
          const targetValue = parseInt(salesTarget.value, 10);
          
          // Calculate the number of months
          const startDate = new Date(formattedStart);
          const endDate = new Date(formattedEnd);
          const totalMonths = calculateTotalMonths(startDate, endDate) + 1;
          
          totalBranchTarget += targetValue * totalMonths;
        }
      });
      
      branchTargetMap.set(branch.branchId.toString(), totalBranchTarget);
    });

    // Main aggregation for branch data
    const aggregationPipeline = [
      {
        $lookup: {
          from: "employees",  // Your employees collection name
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails", // Unwind to access employee details
      },
      {
        $lookup: {
          from: "newbranches",  // Your branches collection name
          localField: "employeeDetails.branchId",
          foreignField: "_id",
          as: "newbrancheDetails",
        },
      },
      {
        $unwind: "$newbrancheDetails", // Unwind to access branch details
      },
      {
        $lookup: {
          from: "newbranches",  // Your branches collection name
          localField: "newbrancheDetails.regionalBranchId",
          foreignField: "_id",
          as: "regionalBranchDetails",
        },
      },
      // Use addFields instead of unwind to handle missing regionalBranchDetails
      {
        $addFields: {
          regionalBranchDetails: {
            $cond: {
              if: { $gt: [{ $size: "$regionalBranchDetails" }, 0] },
              then: { $arrayElemAt: ["$regionalBranchDetails", 0] },
              else: { name: "No Branch", _id: null } // Default value when regionalBranchId is not set
            }
          }
        }
      }
    ];

    // First filter: Apply branch status filter if provided
    if (matchStatus && matchStatus !== "all") {
      aggregationPipeline.push({
        $match: {
          "newbrancheDetails.status": matchStatus
        }
      });
    }

    // Second filter: Apply date filter only to the matched branches
    if (
      startDateFilter &&
      endDateFilter &&
      startDateFilter !== "all" &&
      endDateFilter !== "all"
    ) {
      aggregationPipeline.push({
        $match: {
          "createdAt": {
            $gte: new Date(formattedStart),
            $lt: new Date(formattedEnd),
          }
        }
      });
    }

    // Continue with the rest of the aggregation
    aggregationPipeline.push(
      {
        $unwind: "$status", // Unwind status to process each status separately
      },
      {
        $group: {
          _id: "$newbrancheDetails._id",
          branchName: { $first: "$newbrancheDetails.name" },
          regionalBranchName: { $first: "$regionalBranchDetails.name" },
          branchId: { $first: "$newbrancheDetails._id" },
          branchStatus: { $first: "$newbrancheDetails.newBranchStatus" },

          approvedFiles: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
            },
          },
          rejectedFiles: {
            $sum: {
              $cond: [
                { $in: ["$status", ["reject", "rejectBySales"]] },
                1,
                0
              ]
            }
          },
          leadConvertFiles: {
            $sum: {
              $cond: [{ $eq: ["$status", "leadConvert"] }, 1, 0],
            },
          },
          pendingFiles: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          branchName: 1,
          regionalBranchName: 1,
          branchId: 1,
          branchStatus: 1,
          pendingFiles: 1,
          rejectedFiles: 1,
          approvedFiles: 1,
          leadConvertFiles: 1,
          totalFiles: {
            $add: [
              "$pendingFiles",
              "$rejectedFiles",
              "$approvedFiles",
              "$leadConvertFiles",
            ],
          },
        },
      }
    );

    // Execute the aggregation
    const resultBranch = await leadGenerateModel.aggregate(aggregationPipeline);

    // Calculate the totals across all branches and add percentage calculations
    let totalApprovedFiles = 0;
    let totalRejectedFiles = 0;
    let totalLeadConvertFiles = 0;
    let totalPendingFiles = 0;
    let grandTotalFiles = 0;

    // Process and add target calculations to each branch
    const processedBranches = resultBranch.map(branch => {
      // Add to grand totals
      totalApprovedFiles += branch.approvedFiles;
      totalRejectedFiles += branch.rejectedFiles;
      totalLeadConvertFiles += branch.leadConvertFiles;
      totalPendingFiles += branch.pendingFiles;
      grandTotalFiles += branch.totalFiles;

      // Get branch target from map
      const branchTargetValue = branchTargetMap.get(branch.branchId.toString()) || 0;

      // Calculate branch percentage (achievement vs target)
      const branchPercentage = branchTargetValue > 0
        ? Number(((branch.totalFiles / branchTargetValue) * 100).toFixed(2))
        : 0;

      // Calculate lead conversion percentage
      const leadConvertPercentage = branch.totalFiles > 0
        ? Number(((branch.leadConvertFiles / branch.totalFiles) * 100).toFixed(2))
        : 0;

      return {
        ...branch,
        branchTargetValue,
        branchPercentage,
        leadConvertPercentage
      };
    });

    const response = {
      TotalCases: processedBranches.length || 0,
      appliedFilters: {
        startDate: formattedStart,
        endDate: formattedEnd,
        matchStatus: matchStatus || "all",
      },
      // Add totals to the response
      totalApprovedFiles,
      totalRejectedFiles,
      totalLeadConvertFiles,
      totalPendingFiles,
      totalFiles: grandTotalFiles,
      branchDetail: processedBranches,
    };

    return success(res, "Lead Files Branch Table Dashboard", response);

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


async function getEmployeeLeadsWithLocation(req, res) {
  try {
    const { employeeId, startDateFilter, endDateFilter } = req.query;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return badRequest(res, "Invalid Employee ID");
    }

    // Set default date range (Full day from 00:00:00 to 23:59:59)
    const today = new Date();
    const defaultStartDate = new Date(today.setHours(0, 0, 0, 0)); // Start of today
    const defaultEndDate = new Date(today.setHours(23, 59, 59, 999)); // End of today

    function formatDateToISO(date) {
      return new Date(date).toISOString();
    }

    let formattedStart = startDateFilter && startDateFilter !== "all"
      ? new Date(new Date(startDateFilter).setHours(0, 0, 0, 0))
      : defaultStartDate;

    let formattedEnd = endDateFilter && endDateFilter !== "all"
      ? new Date(new Date(endDateFilter).setHours(23, 59, 59, 999))
      : defaultEndDate;

    // Ensure correct filtering when start and end dates are the same
    if (startDateFilter && endDateFilter && startDateFilter === endDateFilter) {
      formattedStart = new Date(new Date(startDateFilter).setHours(0, 0, 0, 0));
      formattedEnd = new Date(new Date(startDateFilter).setHours(23, 59, 59, 999));
    }

    // Convert to ISO format for MongoDB query
    formattedStart = formatDateToISO(formattedStart);
    formattedEnd = formatDateToISO(formattedEnd);

    // Match conditions
    const matchConditions = {
      employeeGenerateId: new mongoose.Types.ObjectId(employeeId),
    };

    if (startDateFilter && endDateFilter && startDateFilter !== "all" && endDateFilter !== "all") {
      matchConditions.createdAt = {
        $gte: new Date(formattedStart),
        $lte: new Date(formattedEnd),
      };
    }

    const employeeLeads = await leadGenerateModel.aggregate([
      { $match: matchConditions }, // Apply Date Filter

      {
        $lookup: {
          from: "employees",
          localField: "employeeGenerateId",
          foreignField: "_id",
          as: "employeesDetails",
        },
      },

      { $unwind: { path: "$employeesDetails", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0,
          employeeGenerateId: "$employeeGenerateId",
          employeeName: { $ifNull: ["$employeesDetails.employeName", ""] },
          latitude: { $ifNull: [{ $arrayElemAt: ["$location.coordinates", 1] }, 0] },
          longitude: { $ifNull: [{ $arrayElemAt: ["$location.coordinates", 0] }, 0] },
          selfieWithCustomer: { $ifNull: ["$selfieWithCustomer", ""] }, // Include Selfie Image
          createdAt: 1, // Include Created Date
        },
      },

      {
        $group: {
          _id: "$employeeGenerateId",
          employeeName: { $first: "$employeeName" },
          leads: {
            $push: {
              latitude: "$latitude",
              longitude: "$longitude",
              selfieWithCustomer: "$selfieWithCustomer",
              createdAt: "$createdAt",
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          employeeGenerateId: "$_id",
          employeeName: 1,
          leads: 1,
        },
      },
    ]);

    return success(res, "Employee lead details", { list: employeeLeads[0] });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


const leadConvertToCustomerBySalesPerson = async (req, res) => {
  try {
    const { leadId, status, salesRejectRemark, emi, tenure, roi } = req.body;

    if (!leadId || !ObjectId.isValid(leadId)) {
      return badRequest(res, "Lead ID is required");
    }

    const lead = await leadGenerateModel.findById(leadId);
    if (!lead) {
      return notFound(res, "Lead not found");
    }

    // Handle rejection by sales
    if (status === "rejectBySales") {
      if (!salesRejectRemark) {
        return notFound(res, "Sales Person Reject Remark Required");
      }
      lead.status = status
      lead.salesRejectRemark = salesRejectRemark || "";
      await lead.save();
      return success(res, "Lead rejected by sales");
    } else if (status === "leadConvert") {
      // If any of emi, tenure, or roi are missing in lead, try using values from req.body
      if (!lead.emi && emi) lead.emi = emi;
      if (!lead.tenure && tenure) lead.tenure = tenure;
      if (!lead.roi && roi) lead.roi = roi;

      // If still missing any field, return error
      if (!lead.emi) {
        return badRequest(res, "EMI must be required");
      }

      if (!lead.tenure) {
        return badRequest(res, "Tenure must be required");
      }
      if (!lead.roi) {
        return badRequest(res, "ROI must be required");
      }
      // Save updated lead with new EMI/Tenure/ROI
      await lead.save();

      let employee;
      if (lead.employeeAssignId) {
        employee = await employeeModel.findById(lead.employeeAssignId);
        if (!employee) {
          return notFound(res, "Employee not found for this lead");
        }
      } else {
        employee = await employeeModel.findById(lead.employeeGenerateId);
        if (!employee) {
          return notFound(res, "Employee not found for this lead");
        }
      }

      const productDetail = await productModel.findById(lead.loanTypeId);
      if (!productDetail) {
        return notFound(res, "Product Details Not Found");
      }

      const newCustomerFinId = await generateUniqueCustomerFinId(productDetail.productFinId);

      const leadConvertStatus = await customerModel.findOne({ leadId: lead._id });
      if (leadConvertStatus) {
        return badRequest(res, "Lead already converted to customer");
      }
      // Create the customer
      const newCustomer = new customerModel({
        employeId: lead.employeeAssignId ? lead.employeeAssignId : lead.employeeGenerateId,
        loginFees: productDetail.loginFees > 0 ? productDetail.loginFees : 0,
        paymentStatus: productDetail.loginFees > 0 ? "pending" : "noLoginFees",
        branch: employee?.branchId || null,
        productId: lead.loanTypeId,
        customerFinId: newCustomerFinId,
        mobileNo: lead.customerMobileNo,
        fullName: lead.customerName,
        branch: employee.branchId,
        nearestBranchId: employee.branchId,
        roi: parseFloat(lead.roi),
        tenure: parseInt(lead.tenure),
        emi: parseFloat(lead.emi),
        loanAmount: parseFloat(lead.loanAmount),
        location: lead.location,
        leadId: lead._id,
      });

      await newCustomer.save();

      lead.status = "leadConvert";
      await lead.save();

      const processDetail = new proccessModel({
        customerId: newCustomer._id,
        employeId: lead.employeeAssignId ? lead.employeeAssignId : lead.employeeGenerateId,
        customerFormStart: true,
        customerFormComplete: productDetail.loginFees > 0 ? false : true
      })
      return success(res, "Lead converted to customer successfully",
        { newCustomer: newCustomer });
    } else {
      return badRequest(res, "Invalid status provided");
    }

  } catch (error) {
    console.error("Lead conversion failed:", error);
    return unknownError(res, "Internal server error");
  }
};


module.exports = {
  leadGenerateSalesMan,
  leadGenerateWebsite,
  newLeadGenerateSalesMan,
  getEmployeeLeadsWithLocation,
  leadGenerateApproveByAdmin,
  getLeadGenerateDetails,
  leadGenerateList,
  leadGenerateListForAdmin,
  leadGenerateDashboardList,
  leadGenerateMonthlyStats,
  allFilesLeadGenerateDashBoard,
  leadDashBoardProductTable,
  leadDashBoardEmployeeTable,
  leadDashBoardBranchTable,
  leadConvertToCustomerBySalesPerson,
  leadGenerateMonthlyDashbord,
  leadProductPercentageDashbord,
};
