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
const xlsx = require("xlsx");
const moment = require("moment");
const { GoogleAuth } = require("google-auth-library");

const credentials = require("../../../../../credential.json");
const collectionModel = require("../../model/collection/collectionSheet.model");
const employeModel = require("../../model/adminMaster/employe.model");
const okCreditModel = require("../../model/adminMaster/okCredit.model");
const modeOfcollectionModel = require("../../model/adminMaster/modeOfCollection.model");
const cashTransferModel = require("../../model/collection/cashTransfer.model");
const bankNameModel = require("../../model/adminMaster/bank.model");
const transferBankNameModel = require("../../model/adminMaster/transferBankName.model");
const totalCashCollectionModel = require("../../model/collection/totalCashBalance.model");

// -------------Ok Credit Person Emi Amount Trnafer To Bank Then Fill Given Form---------------------------
async function cashTransferToBank(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Get employee details
    const employeDetail = await employeModel.findById({
      _id: new ObjectId(req.Id),
      status: "active",
    });
    if (!employeDetail) {
      return badRequest(res, "Invalid employee details");
    }

    const { transferRecipt, tranferDate, transferAmount,payeeTo, bankNameId } =
      req.body;
      if (payeeTo === (req.Id)) {
        return badRequest(res, "Cannot transfer to yourself");
    }
    if (!payeeTo && !bankNameId) {
      return badRequest(res, "Please provide either payeeTo or bankNameId");
    }
    // Validate bankNameId
    // if (!bankNameId || bankNameId.trim() === "") {
    //   return badRequest(res, "Please Select bankNameId");
    // }
    if (transferAmount <= 0) {
      return badRequest(res, "Minimum transfer amount should be 1");
    }
    // Get cash data for the employee
    const cashData = await totalCashCollectionModel.findOne({
      employeeId: employeDetail._id,
    });
    if (!cashData) {
      return badRequest(res, "No cash data found for the employee");
    }

    // Validate if holdAmount is less than or equal to creditAmount
    const creditAmount = cashData.creditAmount; // Assuming this is in the cashData
    if (transferAmount > creditAmount) {
      return badRequest(res, "Insufficient Balance");
    }

    // const bankName = await transferBankNameModel.findById({ _id: new ObjectId(bankNameId) });
    // if (!bankName) {
    //   return badRequest(res, "Transfer Bank Name Not Found");
    // }

    // Update the totalCashCollectionModel by adding holdAmount
    const newCreditAmount = parseInt(creditAmount) - parseInt(transferAmount);
    const newHoldAmount =
      parseInt(cashData.holdAmount) + parseInt(transferAmount);
    await totalCashCollectionModel.updateOne(
      { employeeId: employeDetail._id },
      { $set: { creditAmount: newCreditAmount, holdAmount: newHoldAmount } }
    );

    // Create cash transfer request
    const cashTransferData = {
      ...req.body,
      employeeId: employeDetail._id,
      transferRecipt: transferRecipt.replace(/&#x2F;/g, "/"), // Decode if needed
    };
    const cashDetail = await cashTransferModel.create(cashTransferData);

    // Respond with success
    success(res, "Cash Transfer For Approval", cashDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------Get Cash Transfer To Bank List Particular employeeId-------------------------------------------------------------
async function getCashTransferDetail(req, res) {
  try {
    // Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    // Fetch employee details
    const employeDetail = await employeModel.findById({ _id: tokenId });

    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }
    const totalCashDetail = await cashTransferModel.aggregate([
      {
        $match: { employeeId: new ObjectId(tokenId) },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail",
        },
      },
      {
        $unwind: {
          path: "$employeeDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "transferbanknames",
          localField: "bankNameId",
          foreignField: "_id",
          as: "bankNameDetail",
        },
      },
      {
        $unwind: {
          path: "$bankNameDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "payeeTo",
          foreignField: "_id",
          as: "payeeDetail",
        },
      },
      {
        $unwind: {
          path: "$payeeDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          employeeId: 1,
          bankNameId: 1,
          payeeTo: 1,
          tranferDate: 1,
          transferAmount: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
    
          employeeDetail: {
            _id: "$employeeDetail._id",
            employeName: "$employeeDetail.employeName",
            employeUniqueId: "$employeeDetail.employeUniqueId",
            mobileNo: "$employeeDetail.mobileNo",
          },
    
          payeToDetail: {
            $cond: {
              if: { $ne: ["$payeeTo", null] },
              then: {
                _id: "$payeeDetail._id",
                employeName: "$payeeDetail.employeName",
                employeUniqueId: "$payeeDetail.employeUniqueId",
                mobileNo: "$payeeDetail.mobileNo",
              },
              else: {},
            },
          },
    
          bankDetail: {
            $cond: {
              if: { $ne: ["$bankNameId", null] },
              then: {
                _id: "$bankNameDetail._id",
                bankName: "$bankNameDetail.bankName",
              },
              else: {},
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 } // sort by createdAt in descending order
      }
    ]);
    
    
    
    return success(res, "Get Cash Transfer To Bank Or Person", totalCashDetail);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

// ------------Get All Cash Transfer To Bank List ADMIN CHECK-------------------------------------------------------------
async function getAllCashTransfer(req, res) {
  try {
    // Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);

    // Fetch employee details
    const employeDetail = await employeModel.findById({ _id: tokenId, status: "active" });
    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Match condition for status filter
    const matchCondition = req.query.status ? { status: req.query.status } : {};

    // Get total count for pagination
    const totalCount = await cashTransferModel.countDocuments(matchCondition);

    // Main aggregation with pagination
    const cashTransferData = await cashTransferModel.aggregate([
      {
        $match: matchCondition, // Apply status filter if provided
      },
      {
        $sort: { createdAt: -1 } // Sort by creation date (newest first)
      },
      {
        $skip: skip // Skip documents for pagination
      },
      {
        $limit: limit // Limit results per page
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail",
        },
      },
      {
        $unwind: "$employeeDetail",
      },
      {
        $lookup: {
          from: "transferbanknames",
          localField: "bankNameId",
          foreignField: "_id",
          as: "bankNameDetail",
        },
      },
      // {
      //   $unwind: "$bankNameDetail",
      // },
      {
        $lookup: {
          from: "employees",
          localField: "payeeTo",
          foreignField: "_id",
          as: "payeeDetail",
        },
      },
      // {
      //   $unwind: "$payeeDetail",
      // },
      {
        $project: {
          "employeeDetail.__v": 0,
          "employeeDetail.createdAt": 0,
          "employeeDetail.updatedAt": 0,
          "bankNameDetail.__v": 0,
          "bankNameDetail.createdAt": 0,
          "bankNameDetail.updatedAt": 0,
        },
      },
    ]);

    // Prepare pagination info
    const paginationInfo = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount,
      recordsPerPage: limit
    };

    return success(res, "Get Cash Transfer To Bank List..", {
      data: cashTransferData,
      pagination: paginationInfo
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

// ------------GET ALL CASH TRNASFER TO PERSON TO PERSON LIST (PARTICULAR)---------------------------
async function getCashTransferToPersonList(req, res) {
  try {
    // Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);

    // Fetch employee details
    const employeDetail = await employeModel.findOne({ _id: tokenId, status: "active" });
    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }

    // Build match condition
    const matchCondition = {
      payeeTo: tokenId,
    };

    // Check for optional status filter
    if (req.query.status) {
      // Allow filtering for multiple statuses
      const statusArray = req.query.status.split(","); // e.g., "accept,hold,reject"
      matchCondition.status = { $in: statusArray };
    } else {
      // Default to all statuses if no filter is provided
      matchCondition.status = { $in: ["accept", "hold", "reject"] };
    }

    // Check for bankNameId filter
    if (req.query.bankNameId !== undefined) {
      matchCondition.bankNameId = req.query.bankNameId === "null" ? null : { $ne: null };
    }

    const totalCashDetail = await cashTransferModel.aggregate([
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail",
        },
      },
      {
        $unwind: "$employeeDetail",
      },
      {
        $lookup: {
          from: "employees",
          localField: "payeeTo",
          foreignField: "_id",
          as: "payeeDetail",
        },
      },
      {
        $unwind: "$payeeDetail",
      },
      {
        $project: {
          "employeeDetail.__v": 0,
          "employeeDetail.createdAt": 0,
          "employeeDetail.updatedAt": 0,
          bankNameDetail: 0, // Explicitly exclude bank details
        },
      },
    ])
      .sort({ createdAt: -1 });

    return success(res, "Get Cash Transfer To Cash Person", totalCashDetail);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}



//-------------------EMi List OkCredit Person Account commonId those Id pr payment hua hai-----------------
async function getcashEmiCollection(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { status } = req.query;
    const tokenId = new ObjectId(req.Id);
    const employeDetail = await employeModel.findById({ _id: tokenId });
    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }

    // Get the okCreditDetail for the logged-in employee
    const okCreditDetail = await okCreditModel.findOne({
      employeeId: employeDetail._id,
    });
    if (!okCreditDetail) {
      return badRequest(res, "OkCredit details not found.");
    }

    const emiStatus = await collectionModel
      .aggregate([
        {
          $match: {
            status: status,
            commonId: okCreditDetail._id,
          },
        },
        {
          $lookup: {
            from: "modelofcollections",
            localField: "modeOfCollectionId",
            foreignField: "_id",
            as: "modeOfCollectionDetail",
          },
        },
        {
          $match: {
            "modeOfCollectionDetail.title": "cashCollection",
          },
        },
        {
          $project: {
            "modeOfCollectionDetail.__v": 0,
            "modeOfCollectionDetail.createdAt": 0,
            "modeOfCollectionDetail.updatedAt": 0,
          },
        },

        {
          $lookup: {
            from: "okcredits",
            localField: "commonId",
            foreignField: "_id",
            as: "okCreditDetail",
          },
        },
        {
          $project: {
            "okCreditDetail.__v": 0,
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "okCreditDetail.employeeId",
            foreignField: "_id",
            as: "employeDetail",
          },
        },
        {
          $project: {
            "employeDetail.__v": 0,
          },
        },
      ])
      .sort({ createdAt: -1 });

    success(res, `Emi Collection List For ${status}`, emiStatus);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//-----------------OK CREDIT PERSON DASHBOARD OF EMI AMOUNT TOTAL SUM------------------------------------
async function getCashEmidashboard(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const employeDetail = await employeModel.findById({ _id: tokenId });
    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }

    const okCreditDetail = await okCreditModel.findOne({
      employeeId: employeDetail._id,
    });
    if (!okCreditDetail) {
      return badRequest(res, "OkCredit details not found.");
    }

    // Aggregation to sum amounts based on status
    const statusSums = await collectionModel.aggregate([
      {
        $match: {
          commonId: okCreditDetail._id,
        },
      },
      {
        $lookup: {
          from: "modelofcollections",
          localField: "modeOfCollectionId",
          foreignField: "_id",
          as: "modeOfCollectionDetail",
        },
      },
      {
        $unwind: "$modeOfCollectionDetail",
      },
      {
        $match: {
          "modeOfCollectionDetail.title": "cashCollection",
        },
      },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$receivedAmount" },
          // count: { $sum: 1 },
        },
      },
    ]);

    // Format the results into the required structure
    const result = {
      initiateAmount: 0,
      pendingAmount: 0,
      approvalAmount: 0,
      rejectAmount: 0,
      cashCollectionCount: 0, // Add a field for the count
    };

    // Map the aggregation results to the appropriate fields
    statusSums.forEach((item) => {
      switch (item._id) {
        case "initiate":
          result.initiateAmount = item.totalAmount;
          break;
        case "pending":
          result.pendingAmount = item.totalAmount;
          break;
        case "accept":
          result.approvalAmount = item.totalAmount;
          break;
        case "reject":
          result.rejectAmount = item.totalAmount;
          break;
      }
    });

    // Calculate the total count for cashCollection
    // result.cashCollectionCount = statusSums.reduce((sum, item) => sum + item.count, 0);

    success(res, "Status-wise EMI Amounts and Cash Collection Count", result);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

// ---------------- Get All OkCredit Person Account Emi => Pending Accept Reject-------------------
async function getCashCollectionDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const tokenId = new ObjectId(req.Id);

    // Fetch employee details
    const employeDetail = await employeModel.findById({
      _id: tokenId,
      status: "active",
    });
    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }
    const totalCashDetail = await totalCashCollectionModel.findOne({
      employeeId: employeDetail._id,
    });
    if (!totalCashDetail) {
      badRequest(res, "No Record Of Cash Collection");
    }

    success(res, "Cash collection details successfully", totalCashDetail);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

// -------------CASH APPROVAL BY ADMIN----------------------------------------
async function cashTransferApprovalApi(req, res) {
  try {
    // Validate request input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Find the employee by ID and ensure they are active
    const tokenId = new ObjectId(req.Id);
    const employeeDetail = await employeModel.findOne({
      _id: tokenId,
      status: "active",
    });

    if (!employeeDetail) {
      return notFound(res, "Active employee not found");
    }

    const { cashTransferId, status, reason } = req.body;
    let cashData = await cashTransferModel.findOne({
      _id: new ObjectId(cashTransferId),
      status: "accept",
    });
    if (cashData) {
      return badRequest(res, "Cash Transfer Already Approved");
    }
    let detail = await cashTransferModel.findOne({
      _id: new ObjectId(cashTransferId),
      status: "reject",
    });
    if (detail) {
      return badRequest(res, "Cash Transfer Already Rejected");
    }

    // Fetch the cash collection entry by ID
    let cashTransferData = await cashTransferModel.findById(cashTransferId);
    if (!cashTransferData) {
      return notFound(res, "cashTransferId not found");
    }

    const { transferAmount, employeeId } = cashTransferData;

    // Ensure the employee ID in the transfer matches the provided one
    if (!employeeId.equals(cashTransferData.employeeId)) {
      return notFound(res, "Employee ID mismatch in cash transfer record");
    }

    // Fetch the total cash collection record
    let totalCashCollection = await totalCashCollectionModel.findOne({
      employeeId: cashTransferData.employeeId,
    });
    if (!totalCashCollection) {
      return notFound(res, "Cash collection record not found for employee");
    }

    // Handle status-based logic
    if (status === "accept") {
      // Add the transfer amount to the debitAmount
      totalCashCollection.debitAmount =
        (totalCashCollection.debitAmount || 0) + transferAmount;
      totalCashCollection.holdAmount =
        (totalCashCollection.holdAmount || 0) - transferAmount;
    } else if (status === "reject") {
      // Set transfer amount to 0 and add to creditAmount
      totalCashCollection.creditAmount =
        (totalCashCollection.creditAmount || 0) + transferAmount;
      totalCashCollection.holdAmount =
        (totalCashCollection.holdAmount || 0) - transferAmount; // Set holdAmount to 0
    } else {
      return badRequest(res, "Invalid status value");
    }

    // Save the updated cash collection record
    await totalCashCollection.save();

    // Optionally, update the cash transfer entry with status and reason
    cashTransferData.status = status;
    cashTransferData.reason = reason;
    cashTransferData.approvedOrRejectedBy = employeeDetail._id;
    // await cashTransferToBankSheet(cashTransferData)
    const data = await cashTransferData.save();

    return success(res, "Cash transfer updated successfully", data);
  } catch (error) {
    console.error("Error in cashTransferApprovalApi:", error);
    return unknownError(res, error);
  }
}

// -------------CASH APPROVAL BY CASH PERSON APPROVAL----------------------------------------
async function cashApprovalByCashPerson(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const employeeDetail = await employeModel.findOne({
      _id: tokenId,
      status: "active",
    });

    if (!employeeDetail) {
      return notFound(res, "Active employee not found");
    }

    const { cashTransferId, status, reason } = req.body;
    
    // Check existing status
    let existingTransfer = await cashTransferModel.findOne({
      _id: new ObjectId(cashTransferId),
      status: { $in: ["accept", "reject"] }
    });

    if (existingTransfer) {
      return badRequest(res, `Cash Transfer Already ${existingTransfer.status === 'accept' ? 'Approved' : 'Rejected'}`);
    }

    let cashTransferData = await cashTransferModel.findById(cashTransferId);
    if (!cashTransferData) {
      return notFound(res, "cashTransferId not found");
    }

    const { transferAmount, payeeTo } = cashTransferData;

    if (!payeeTo.equals(cashTransferData.payeeTo)) {
      return notFound(res, "Employee ID mismatch in cash transfer record");
    }

    if (status === "accept") {
      // Handle recipient's cash collection
      let recipientCashCollection = await totalCashCollectionModel.findOne({
        employeeId: cashTransferData.payeeTo,
      });

      if (!recipientCashCollection) {
        recipientCashCollection = new totalCashCollectionModel({
          employeeId: cashTransferData.payeeTo,
          creditAmount: transferAmount,  // Set initial credit amount
          debitAmount: 0,
          holdAmount: 0
        });
      } else {
        recipientCashCollection.creditAmount = (recipientCashCollection.creditAmount || 0) + transferAmount;
      }
      await recipientCashCollection.save();

      // Handle sender's cash collection
      let senderCashCollection = await totalCashCollectionModel.findOne({
        employeeId: cashTransferData.employeeId
      });

      if (senderCashCollection) {
        // Update existing sender's record
        senderCashCollection.holdAmount = Math.max((senderCashCollection.holdAmount || 0) - transferAmount, 0);
        await senderCashCollection.save();
      }
    } 
    else if (status === "reject") {
      // Handle sender's cash collection for rejection
      let senderCashCollection = await totalCashCollectionModel.findOne({
        employeeId: cashTransferData.employeeId
      });

      if (senderCashCollection) {
        // Return amount from hold to credit
        senderCashCollection.creditAmount = (senderCashCollection.creditAmount || 0) + transferAmount;
        senderCashCollection.holdAmount = Math.max((senderCashCollection.holdAmount || 0) - transferAmount, 0);
        await senderCashCollection.save();
      }
    } 
    else {
      return badRequest(res, "Invalid status value");
    }

    // Update cash transfer record
    cashTransferData.status = status;
    cashTransferData.reason = reason;
    cashTransferData.approvedOrRejectedBy = employeeDetail._id;
    const data = await cashTransferData.save();

    return success(res, "Cash transfer updated successfully", data);
  } catch (error) {
    console.error("Error in cashTransferApprovalApi:", error);
    return unknownError(res, error);
  }
}

async function cashTransferToBankSheet(data) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  const spreadsheetId = process.env.FINAL_APPROVAL_SHEET;
  const sheetName = "CASH TRANSFER TO BANK";

  console.time("Google Sheet Update");

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:BH`,
  });

  console.timeEnd("Google Sheet Update");

  let rows = response.data.values || [];
  let headers = rows.length > 0 ? rows[0] : [];

  // Define headers if the sheet is empty
  if (rows.length === 0) {
    headers = [
      "OK CREDIT PERSON",
      "BANK NAME",
      "TRANSFER RECEIPT",
      "TRANSFER DATE",
      "TRANSFER AMOUNT",
      "REASON",
      "APPROVED BY",
      "STATUS",
    ];
    rows.push(headers);
  }

  const employeeIdIndex = headers.indexOf("EMPLOYEE ID");
  if (employeeIdIndex === -1) {
    throw new Error("EMPLOYEE ID field not found in the sheet.");
  }

  const existingRowIndex = rows
    .slice(1)
    .findIndex((row) => row[employeeIdIndex] === data.employeeId);

  const dataMappings = {
    "OK CREDIT PERSON": "employeeId",
    "BANK NAME": "bankNameId",
    "TRANSFER RECEIPT": "transferRecipt",
    "TRANSFER DATE": "tranferDate",
    "TRANSFER AMOUNT": "transferAmount",
    REASON: "reason",
    "APPROVED BY": "approvedOrRejectedBy",
    STATUS: "status",
  };

  let rowToUpdate = Array(headers.length).fill("");

  headers.forEach((header, index) => {
    if (dataMappings[header]) {
      let value = data[dataMappings[header]] || "";
      rowToUpdate[index] = value;
    }
  });

  if (existingRowIndex === -1) {
    // Insert new row
    rows.push(rowToUpdate);
  } else {
    // Update existing row
    rows[existingRowIndex + 1] = rowToUpdate;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    resource: {
      values: rows,
    },
  });

  console.log("Data saved to Google Sheets successfully");
}

// --------------LADGER BANK TRANSFER DETAIL WITH BALANCE PERTICULAR CASH COLLECTION PERSON---------------------------
async function getLedgerDetailByToken(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const employeDetail = await employeModel.findById({ _id: tokenId });
    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }

    const okCreditDetail = await okCreditModel.findOne({
      employeeId: employeDetail._id,
    });
    if (!okCreditDetail) {
      return badRequest(res, "OkCredit details not found.");
    }

    const totalReceivedFromCollection = await collectionModel.aggregate([
      {
        $match: {
          status: "accept",
          commonId: okCreditDetail._id,
        },
      },
      {
        $lookup: {
          from: "modelofcollections",
          localField: "modeOfCollectionId",
          foreignField: "_id",
          as: "modeOfCollectionDetail",
        },
      },
      {
        $match: {
          "modeOfCollectionDetail.title": "cashCollection",
        },
      },
      {
        $lookup: {
          from: "okcredits",
          localField: "commonId",
          foreignField: "_id",
          as: "okCreditDetail",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "okCreditDetail.employeeId",
          foreignField: "_id",
          as: "employeDetail",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$receivedAmount" },
          collections: {
            $push: {
              _id: "$_id",
              receivedAmount: "$receivedAmount",
              status: "$status",
              modeOfCollection: "$modeOfCollectionDetail",
              okCredit: "$okCreditDetail",
              employee: "$employeDetail",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          collections: {
            $sortArray: {
              input: "$collections",
              sortBy: { createdAt: -1 },
            },
          },
        },
      },
    ]);

    // Get detailed transactions with running balance
    const cashCollections = await collectionModel.aggregate([
      {
        $match: {
          commonId: new ObjectId(okCreditDetail._id),
          status: "accept",
        },
      },
      {
        $lookup: {
          from: "modelofcollections",
          localField: "modeOfCollectionId",
          foreignField: "_id",
          as: "modeOfCollectionDetail",
        },
      },
      {
        $unwind: "$modeOfCollectionDetail",
      },
      {
        $match: {
          "modeOfCollectionDetail.title": "cashCollection",
        },
      },
      {
        $project: {
          _id: 1,
          receivedAmount: 1,
          LD: 1,
          customerName: 1,
          customerId: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ]);

    const transfers = await cashTransferModel.aggregate([
      {
        $match: {
          $or: [
            { employeeId: new ObjectId(employeDetail._id), status: "accept" },
            { payeeTo: new ObjectId(employeDetail._id), status: "accept" }
          ]
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      {
        $unwind: {
          path: "$employeeDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "transferbanknames",
          localField: "bankNameId",
          foreignField: "_id",
          as: "bankNameDetail"
        }
      },
      {
        $unwind: {
          path: "$bankNameDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "payeeTo",
          foreignField: "_id",
          as: "payeeDetail"
        }
      },
      {
        $unwind: {
          path: "$payeeDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          isReceived: { $eq: ["$payeeTo", new ObjectId(tokenId)] }
        }
      },
      {
        $project: {
          transferAmount: 1,
          transferDate: "$createdAt",
          bankName: { $ifNull: ["$bankNameDetail.bankName", ""] },
          payeeTo: { $ifNull: ["$payeeDetail.employeName", ""] },
          employeeName: { $ifNull: ["$employeeDetail.employeName", ""] },
          employeUniqueId: "$employeeDetail.employeUniqueId",
          transactionId: 1,
          remark: 1,
          isReceived: 1,
          employeeDetail: {
            employeName: "$employeeDetail.employeName",
            employeUniqueId: "$employeeDetail.employeUniqueId"
          },
          payeeDetail: {
            employeName: "$payeeDetail.employeName",
            employeUniqueId: "$payeeDetail.employeUniqueId"
          }
        }
      },
      {
        $sort: {
          transferDate: 1
        }
      }
    ]);

    // Calculate modified totals
    const totalSent = transfers
      .filter(t => !t.isReceived)
      .reduce((sum, t) => sum + t.transferAmount, 0);

    const totalReceivedTransfers = transfers
      .filter(t => t.isReceived)
      .reduce((sum, t) => sum + t.transferAmount, 0);

    const received = (totalReceivedFromCollection[0]?.totalAmount || 0) + totalReceivedTransfers;
    const transferred = totalSent;
    const currentBalance = received - transferred;

    // Modified transaction history calculation
    let runningBalance = 0;
    const transactions = [];

    [...cashCollections, ...transfers]
      .sort((a, b) => 
        new Date(a.createdAt || a.transferDate) - 
        new Date(b.createdAt || b.transferDate)
      )
      .forEach((t) => {
        if (t.receivedAmount) {
          // Cash Collection entry
          runningBalance += t.receivedAmount;
          transactions.push({
            LD: t.LD,
            customerName: t.customerName,
            date: t.createdAt,
            type: "collection",
            receivedAmount: t.receivedAmount,
            customerId: t.customerId,
            emiId: t._id,
            balance: runningBalance
          });
        } else {
          // Transfer entry
          if (t.isReceived) {
        
            runningBalance += t.transferAmount;
            transactions.push({
              employeUnqiueId: employeDetail.employeUniqueId,
              cashPersonName: employeDetail.employeName,
              date: t.transferDate,
              type: "receivedTransfer",
              amount: t.transferAmount,
              bankName: t.bankName,
              fromPerson: `${t.employeUniqueId}-${t.employeeName}`,
              transactionId: t.transactionId,
              remark: t.remark,
              balance: runningBalance
            });
          } else {
            runningBalance -= t.transferAmount;
            transactions.push({
              employeUnqiueId: employeDetail.employeUniqueId,
              cashPersonName: employeDetail.employeName,
              date: t.transferDate,
              type: "transfer",
              amount: t.transferAmount,
              bankName: t.bankName,
              payeeTo: t.payeeTo,
              transactionId: t.transactionId,
              remark: t.remark,
              balance: runningBalance
            });
          }
        }
      });

    const response = {
      totalReceived: received,
      totalTransferred: transferred,
      currentBalance,
      // detailedTransfers: transfers,
      transactionHistory: transactions
    };

    return success(
      res,
      "Get Cash Transfer To Bank List with Balance Details....",
      response
    );
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


//-------------ALL BANK CASH COLLECTION PERSON LIST DATA API------------------------
async function getAllCashPersonBalanceFilter(req, res) {
  try {
      // Validate the request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return serverValidation(res, {
              errorName: "serverValidation",
              errors: errors.array(),
          });
      }

      const { employeeId } = req.query; // Optional parameter for searching specific employee

      // Find all okCredit details or filter by employeeId if provided
      let okCreditQuery = {
        status: "active"
    };
      if (employeeId) {
          okCreditQuery.employeeId = new ObjectId(employeeId);
      }

      const okCreditDetails = await okCreditModel.find(okCreditQuery);
      if (!okCreditDetails.length) {
          return badRequest(res, employeeId ? "Employee not found." : "No OkCredit details found.");
      }

      // Get employee details for all relevant employees
      const employeeIds = okCreditDetails.map(detail => detail.employeeId);
      const employeeDetails = await employeModel.find({ 
          _id: { $in: employeeIds } 
      });

      // Process each employee's data
      const cashCollectionPersonDetail = await Promise.all(okCreditDetails.map(async (okCreditDetail) => {
          const employeeDetail = employeeDetails.find(emp => 
              emp._id.toString() === okCreditDetail.employeeId.toString()
          );

          // Get total received amount
          const totalReceived = await collectionModel.aggregate([
              {
                  $match: {
                      status: "accept",
                      commonId: okCreditDetail._id
                  }
              },
              {
                  $lookup: {
                      from: "modelofcollections",
                      localField: "modeOfCollectionId",
                      foreignField: "_id",
                      as: "modeOfCollectionDetail"
                  }
              },
              {
                  $match: {
                      "modeOfCollectionDetail.title": "cashCollection",
                  }
              },
              {
                  $group: {
                      _id: null,
                      totalAmount: { $sum: "$receivedAmount" },
                      collections: {
                          $push: {
                              _id: "$_id",
                              receivedAmount: "$receivedAmount",
                              status: "$status",
                              createdAt: "$createdAt"
                          }
                      }
                  }
              }
          ]);

          // Get total transferred amount
          const totalTransferred = await cashTransferModel.aggregate([
              {
                  $match: {
                      employeeId: okCreditDetail.employeeId,
                      status: "accept"
                  }
              },
              {
                  $group: {
                      _id: null,
                      total: { $sum: "$transferAmount" }
                  }
              }
          ]);

          const received = totalReceived[0]?.totalAmount || 0;
          const transferred = totalTransferred[0]?.total || 0;
          const currentBalance = received - transferred;

          // Get transaction history
          const cashCollections = await collectionModel
              .find({
                  commonId: okCreditDetail._id,
                  status: "accept"
              })
              .sort({ createdAt: 1 });

          const transfers = await cashTransferModel.aggregate([
              {
                  $match: {
                      employeeId: okCreditDetail.employeeId,
                      status: "accept"
                  }
              },
              {
                  $lookup: {
                      from: "transferbanknames",
                      localField: "bankNameId",
                      foreignField: "_id",
                      as: "bankNameDetail",
                  }
              },
              {
                  $unwind: "$bankNameDetail"
              },
              {
                  $project: {
                      transferAmount: 1,
                      transferDate: "$createdAt",
                      bankName: "$bankNameDetail.bankName",
                      transactionId: 1,
                      remark: 1
                  }
              },
              {
                  $sort: { transferDate: 1 }
              }
          ]);

          // Calculate running balance
          let runningBalance = 0;
          const transactions = [];

          [...cashCollections, ...transfers]
              .sort((a, b) => new Date(a.createdAt || a.transferDate) - new Date(b.createdAt || b.transferDate))
              .forEach(t => {
                  if (t.receivedAmount) {
                      runningBalance += t.receivedAmount;
                      transactions.push({
                          LD: t.LD,
                          customerName: t.customerName,
                          date: t.createdAt,
                          type: 'collection',
                          receivedAmount: t.receivedAmount,
                          customerId: t.customerId,
                          emiId: t._id,
                          balance: runningBalance
                      });
                  } else {
                      runningBalance -= t.transferAmount;
                      transactions.push({
                          employeUnqiueId: employeeDetail.employeUniqueId,
                          cashPersonName: employeeDetail.employeName,
                          date: t.transferDate,
                          type: 'transfer',
                          amount: t.transferAmount,
                          bankName: t.bankName,
                          transactionId: t.transactionId,
                          remark: t.remark,
                          balance: runningBalance
                      });
                  }
              });

          return {
              employeeId: employeeDetail._id,
              employeeName: employeeDetail.employeName,
              employeeUniqueId: employeeDetail.employeUniqueId,
              totalReceived: received,
              totalTransferred: transferred,
              currentBalance,
              detailedTransfers: transfers,
              transactionHistory: transactions
          };
      }));

      const response = {
          totalEmployees: cashCollectionPersonDetail.length,
          totalReceived: cashCollectionPersonDetail.reduce((sum, emp) => sum + emp.totalReceived, 0),
          totalTransferred: cashCollectionPersonDetail.reduce((sum, emp) => sum + emp.totalTransferred, 0),
          totalCurrentBalance: cashCollectionPersonDetail.reduce((sum, emp) => sum + emp.currentBalance, 0),
          cashCollectionPersonDetail
      };

      return success(res, 'Get Cash Transfer To Bank List with Balance Details', response);

  } catch (error) {
      console.log(error);
      return unknownError(res, error);
  }
}

// --------------LADGER BANK TRANSFER DETAIL WITH ALL BALANCE CASH COLLECTION PERSON---------------------------
async function getAllLedgerDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation", 
        errors: errors.array()
      });
    }
 
    const { employeeId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const okCreditQuery = { status: { $in: ["active", "inactive"] } };
    // const okCreditQuery = { status: "active" };
    if (employeeId) {
      okCreditQuery.employeeId = employeeId;
    }
    const okCreditDetails = await okCreditModel.find(okCreditQuery);
  // return console.log("ss",okCreditDetails.length)
    if (!okCreditDetails.length) {
      return badRequest(res, "No OkCredit details found.");
    }
 
    // Get total received amount
    const totalReceived = await collectionModel.aggregate([
      {
        $match: {
          status: "accept",
          commonId: { $in: okCreditDetails.map(detail => detail._id) }
        }
      },
      {
        $lookup: {
          from: "modelofcollections",
          localField: "modeOfCollectionId",
          foreignField: "_id", 
          as: "modeOfCollectionDetail"
        }
      },
      {
        $match: {
          "modeOfCollectionDetail.title": "cashCollection"
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$receivedAmount" },
          collections: {
            $push: {
              _id: "$_id",
              LD: "$LD",
              customerName: "$customerName", 
              date: "$createdAt",
              receivedAmount: "$receivedAmount",
              emiId: "$_id"
            }
          }
        }
      }
    ]);
 
    // Get outgoing transfers
    const totalTransferred = await cashTransferModel.aggregate([
      {
        $match: {
          status: "accept",
          ...(employeeId ? {
            employeeId: new mongoose.Types.ObjectId(employeeId)
          } : { payeeTo: null })
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId", 
          foreignField: "_id",
          as: "employeeDetail"
        }
      },
      {
        $unwind: {
          path: "$employeeDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "transferbanknames",
          localField: "bankNameId",
          foreignField: "_id",
          as: "bankNameDetail"
        }
      },
      {
        $unwind: {
          path: "$bankNameDetail",
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$transferAmount" },
          transfers: {
            $push: {
              _id: "$_id",
              transferAmount: "$transferAmount",
              remark: "$remark",
              transferDate: "$createdAt",
              employeeUniqueId: "$employeeDetail.employeeUniqueId",
              employeeName: "$employeeDetail.employeName",
              bankName: { $ifNull: ["$bankNameDetail.bankName", ""] },
              payeeName: { $ifNull: ["$payeeTo", ""] }
            }
          }
        }
      }
    ]);
 
    // Get received transfers if employeeId provided
    const receivedTransfers = employeeId ? await cashTransferModel.aggregate([
      {
        $match: {
          status: "accept",
          payeeTo: new mongoose.Types.ObjectId(employeeId)
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail"  
        }
      },
      {
        $unwind: {
          path: "$employeeDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$transferAmount" },
          transfers: {
            $push: {
              _id: "$_id", 
              transferAmount: "$transferAmount",
              remark: "$remark",
              transferDate: "$createdAt",
              employeeUniqueId: "$employeeDetail.employeeUniqueId",
              employeeName: "$employeeDetail.employeName",
              bankName: "",
              payeeName: { $ifNull: ["$payeeTo", ""] }
            }
          }
        }
      }
    ]) : [{ total: 0, transfers: [] }];
 
    const received = totalReceived[0]?.totalAmount || 0;
    const transferred = totalTransferred[0]?.total || 0;
    const receivedTransfersAmount = receivedTransfers[0]?.total || 0;
 
    // Calculate final balance
    const currentBalance = received + receivedTransfersAmount - transferred;
 
    // Combine all transfers
    const allTransfers = [
      ...(totalTransferred[0]?.transfers || []),
      ...(receivedTransfers[0]?.transfers || [])
    ];
 
    // Combine collections and transfers into transaction history
    const cashCollections = totalReceived[0]?.collections || [];
    
    let runningBalance = 0;
    const transactionHistory = [...cashCollections, ...allTransfers]
      .sort((a, b) => new Date(a.date || a.transferDate) - new Date(b.date || b.transferDate))
      .map(transaction => {
        if (transaction.receivedAmount) {
          runningBalance += transaction.receivedAmount;
          return {
            LD: transaction.LD,
            customerName: transaction.customerName,
            date: transaction.date,
            type: "collection",
            receivedAmount: transaction.receivedAmount,
            emiId: transaction.emiId,
            balance: runningBalance
          };
        } else {
          const isReceivedTransfer = transaction.payeeName && employeeId && 
                                   transaction.payeeName === employeeId;
          if (isReceivedTransfer) {
            runningBalance += transaction.transferAmount;
          } else {
            runningBalance -= transaction.transferAmount;
          }
          return {
            employeeUniqueId: transaction.employeeUniqueId,
            cashPersonName: transaction.employeeName,
            date: transaction.transferDate,
            type: "transfer", 
            amount: transaction.transferAmount,
            bankName: transaction.bankName || "",
            payeeTo: transaction.payeeName || "",
            remark: transaction.remark || "",
            balance: runningBalance
          };
        }
      });
      const paginatedTransactionHistory = transactionHistory.slice(
        skip,
        skip + parseInt(limit)
      );
 
    const response = {
      totalReceived: received + receivedTransfersAmount,
      totalTransferred: transferred,
      currentBalance,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      currentPageData: paginatedTransactionHistory.length,
      totalRecords: transactionHistory.length,
      totalPages : Math.ceil(transactionHistory.length / parseInt(limit)),
      detailedTransfers: allTransfers,
      transactionHistory: paginatedTransactionHistory,
    };
 
    return success(res, "Get Cash Transfer To Bank List with Balance Details", response);
 
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
 }




module.exports = {
  cashTransferToBank,
  getCashTransferDetail,
  getAllCashTransfer,
  getCashTransferToPersonList,
  getCashCollectionDetail,
  getcashEmiCollection,
  getCashEmidashboard,
  cashTransferApprovalApi,
  cashApprovalByCashPerson,
  cashTransferToBankSheet,
  getLedgerDetailByToken,
  getAllCashPersonBalanceFilter,
  getAllLedgerDetail,
};
