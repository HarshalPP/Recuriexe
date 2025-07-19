const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt
} = require("../../../../../globalHelper/response.globalHelper");
const axios = require("axios");
const cron = require("node-cron");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
// const moment = require('moment');
const moment = require("moment-timezone");
const ObjectId = mongoose.Types.ObjectId;

const customerModel = require("../../model/customer.model");
const employeModel = require('../../model/adminMaster/employe.model.js')
const loginCashPaymentModel = require("../../model/loginCashPayment.model.js");
const transferBankModel = require("../../model/adminMaster/bank.model.js");
const productModel = require("../../model/adminMaster/product.model");
const processModel = require("../../model/process.model.js");
const okCreditModel= require("../../model/adminMaster/okCredit.model.js")
const newBranchModel = require("../../model/adminMaster/newBranch.model.js")
// -------------Cash Login  List OF Customer--------------------------
async function paginate(model, filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, projection = {}) {
    try {
      const skip = (page - 1) * limit;
  
      const [data, total] = await Promise.all([
        model.find(filter, projection).sort(sort).skip(skip).limit(limit),
        model.countDocuments(filter)
      ]);
  
      return {
        data,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total
      };
    } catch (error) {
      console.error("Error fetching details:", error.message);
      return unknownError(res, "Error fetching list", error);
    }
  }
  

// ---------------------GET LIST Cash Person---------------------------
async function getCashLoginListByToken(req, res) {
  try {
    const { paymentStatus, page = 1, limit = 20 } = req.query;
    const tokenId = new ObjectId(req.Id);

    // Step 1: Check if tokenId exists in employeModel
    const employee = await employeModel.findOne({ _id: tokenId });
    if (!employee) {
      return badRequest(res, "Invalid Employee ID");
    }

    // Step 2: Find okCredit records linked to this employee
    const okCreditRecords = await okCreditModel.find({ employeeId: tokenId });

    if (!okCreditRecords.length) {
      return success(res, "No records found in okCreditModel for this employee", { data: [] });
    }

    // Extract okCreditModel _ids
    const okCreditIds = okCreditRecords.map(record => record._id);

    // Step 3: Define customer filter to include only matching okCreditModel _ids
    let customerFilter = { 
      paymentType: "cash",
      cashPersonId: { $in: okCreditIds }
    };

    if (paymentStatus) {
      customerFilter.paymentStatus = paymentStatus;
    }

    // Step 4: Fetch paginated customers
    const paginatedCustomers = await paginate(customerModel, customerFilter, parseInt(page), parseInt(limit));

    // Handle empty data scenario
    if (!paginatedCustomers.data.length) {
      return success(res, `No data available for the requested page with paymentStatus: ${paymentStatus || "All"}`, {
        data: [],
        currentPage: parseInt(page),
        totalPages: paginatedCustomers.totalPages,
        totalRecords: paginatedCustomers.totalRecords
      });
    }

    // Extract IDs for related data
    const employeeIds = paginatedCustomers.data.map(cust => cust.employeId).filter(id => id);
    const branchIds = paginatedCustomers.data.map(cust => cust.branch).filter(id => id);

    // Fetch Employee and Branch Details
    const [assignedEmployees, branches] = await Promise.all([
      employeModel.find({ _id: { $in: employeeIds } }),
      newBranchModel.find({ _id: { $in: branchIds } })
    ]);

    // Process response data
    const result = paginatedCustomers.data.map(customer => {
      const assignedEmployee = assignedEmployees.find(emp => emp._id.toString() === customer.employeId?.toString());
      const branch = branches.find(br => br._id.toString() === customer.branch?.toString());

      return {
        customerId: customer._id,
        customerFinId: customer.customerFinId,
        mobileNo: customer.mobileNo,
        orderId: customer.orderId,
        executiveName: customer.executiveName,
        loginFees: customer.loginFees,
        status: customer.status,
        paymentStatus: customer.paymentStatus,
        employeId: customer.employeId,
        employeName: assignedEmployee?.employeName || "",
        employeMobile: assignedEmployee?.mobileNo || "",
        employeEmail: assignedEmployee?.workEmail || "",
        branchId: customer.branchId,
        branchName: branch?.name || ""  // Add branch name if available
      };
    });

    return success(res, "Cash Login List Detail", { ...paginatedCustomers, data: result });
  } catch (error) {
    console.error("Error fetching details:", error.message);
    return unknownError(res, "Error fetching cash login list", error);
  }
}



  
  // ------------------CASH APPROVAL BY CASH PERSON--------------------
  async function loginCashApprovalApi(req, res) { 
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const tokenId = new ObjectId(req.Id);
      const employeeDetail = await employeModel.findOne({ _id: tokenId, status: "active" });
  
      if (!employeeDetail) {
        return notFound(res, "Active employee not found");
      }
  
      const { customerId, paymentStatus } = req.body; 
  
      // Validate paymentStatus
      if (!["success", "reject"].includes(paymentStatus)) {
        return badRequest(res, "Invalid payment status. Allowed values: 'success', 'reject'");
      }
  
      // Find customer in customerModel
      let customer = await customerModel.findById(customerId);
      if (!customer) {
        return notFound(res, "Customer not found");
      }
  // If already updated, return message
  if (customer.paymentStatus === "success") {
    return success(res, "Payment status is already updated to success", customer);
  }
  
      // Update based on paymentStatus
      if (paymentStatus === "success") {
        // Update customerModel: change paymentStatus from "pending" to "success"
        customer = await customerModel.findByIdAndUpdate(
          customerId, 
          { paymentStatus: "success" }, 
          { new: true } // Return updated document
        );
  
        // Update processModel: set customerFormComplete to true
        await processModel.findOneAndUpdate(
          { customerId: customerId }, 
          { customerFormComplete: true }
        );
  
      } else if (paymentStatus === "reject") {
        // Update customerModel: change paymentStatus from "pending" to "reject"
        customer = await customerModel.findByIdAndUpdate(
          customerId, 
          { paymentStatus: "reject" }, 
          { new: true } // Return updated document
        );
      }
  
      return success(res, "Login Cash Updated Successfully", customer);
  
    } catch (error) {
      console.error("Error in loginCashApprovalApi:", error);
      return unknownError(res, error);
    }
  }
  
 // ------------------CASH PERSON AMOUNT LEDGER TRANSITION LIST-------
 async function getAllLedgerDetail(req, res) {
    try {
      const { employeeId } = req.query;
      let matchQuery = { paymentStatus: "success" };
  
      if (employeeId) {
        matchQuery.cashPersonId = new ObjectId(employeeId);
      }
  
      const receivedPayments = await customerModel.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "employees",
            localField: "employeId",
            foreignField: "_id",
            as: "salesManDetail"
          }
        },
        { $unwind: { path: "$salesManDetail", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
              from: "okcredits",
              localField: "cashPersonId",
              foreignField: "_id",
              as: "cashPerson"
            }
          },
          { $unwind: { path: "$cashPerson", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "employees",
            localField: "cashPerson.employeeId",
            foreignField: "_id",
            as: "cashPersonDetail"
          }
        },
        { $unwind: { path: "$cashPersonDetail", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            LD: "$customerFinId",
            customerName: "$customerName",
            salesManName: { $ifNull: ["$salesManDetail.employeName", ""] },
            cashPersonName: { $ifNull: ["$cashPersonDetail.employeName", ""] },
            receivedAmount: "$loginFees",
            date: "$createdAt",
            customerId: "$_id"
          }
        }
      ]);
  
      const cashTransfers = await loginCashPaymentModel.aggregate([
        { 
          $match: { 
            status: "accept",
            senderId: employeeId ? new ObjectId(employeeId) : { $exists: true }
          } 
        },
        {
            $lookup: {
              from: "okcredits",
              localField: "senderId",
              foreignField: "_id",
              as: "cashPersonData"
            }
          },
          {
            $lookup: {
              from: "employees",
              localField: "cashPersonData.employeeId",
              foreignField: "_id",
              as: "senderDetail"
            }
          },
        {
          $lookup: {
            from: "employees",
            localField: "approvedBy",
            foreignField: "_id",
            as: "approverDetail"
          }
        },
        {
          $lookup: {
            from: "employees",
            localField: "receiverId",
            foreignField: "_id",
            as: "receiverDetail"
          }
        },
        {
          $lookup: {
            from: "banknames",
            localField: "receiverId",
            foreignField: "_id",
            as: "bankDetail"
          }
        },
        {
            $addFields: {
              isBankTransfer: { $in: ["$receiverType", ["bank", "cashPerson"]] },
              receiverName: {
                $cond: {
                  if: { $eq: ["$receiverType", "bank"] },
                  then: { $arrayElemAt: ["$bankDetail.bankName", 0] },
                  else: { $arrayElemAt: ["$receiverDetail.employeName", 0] }
                }
              },
              approvedBy: { $ifNull: [{ $arrayElemAt: ["$approverDetail.employeName", 0] }, ""] },
              senderName: { $ifNull: [{ $arrayElemAt: ["$senderDetail.employeName", 0] }, ""] }
            }
          },
        {
          $project: {
            _id: 1,
            date: { $dateFromString: { dateString: "$transferDate", onError: "$createdAt" } },
            senderName: 1,
            receiverName: 1,
            isBankTransfer: 1,
            transferAmount: { $ifNull: ["$amount", 0] },
            remark: { $ifNull: ["$reason", ""] },
            receiverType: 1,
            approvedBy: 1
          }
        }
      ]);
  
      let runningBalance = 0;
      const transactions = [];
  
      [...receivedPayments, ...cashTransfers]
        .sort((a, b) => {
          if (a.receivedAmount && !b.receivedAmount) return -1;
          if (!a.receivedAmount && b.receivedAmount) return 1;
          return new Date(a.date) - new Date(b.date);
        })
        .forEach((t) => {
          if (t.receivedAmount !== undefined) {
            runningBalance += t.receivedAmount;
            transactions.push({
              customerId: t.customerId,
              LD: t.LD || "",
              salesManName: t.salesManName || "",
              cashPersonName: t.cashPersonName || "",
              date: t.date,
              type: "received",
              receivedAmount: t.receivedAmount,
              balance: runningBalance
            });
          } else {
            runningBalance -= t.transferAmount;
            transactions.push({
              approvedBy: t.approvedBy || "",
              senderName: t.senderName || "",
              receiverName: t.receiverName || "",
              date: t.date,
              type: t.receiverType,
              amount: t.transferAmount,
              remark: t.remark || "",
              balance: runningBalance
            });
          }
        });
  
      const totalReceived = receivedPayments.reduce((sum, txn) => sum + (txn.receivedAmount || 0), 0);
      const totalTransferred = cashTransfers.reduce((sum, txn) => sum + (txn.transferAmount || 0), 0);
      const currentBalance = totalReceived - totalTransferred;
  
      return success(res, {
        data: {
          totalReceived,
          totalTransferred, 
          currentBalance,
          transactionHistory: transactions
        }
      });
    } catch (error) {
      console.error("Error in getAllLedgerDetail:", error);
      return unknownError(res, error.message);
    }
  }
  

//   CASH TRANSFER TO BANK OR OTHER CASH PERSON-----------------------
async function cashLoginTransferAmount(req, res) {
    try {
      const tokenId = new ObjectId(req.Id)
      const employee = await employeModel.findOne({ _id: tokenId });
      if (!employee) {
        return badRequest(res, "Invalid Employee ID");
      }
      const {  receiverId, receiverType, amount,transactionImage, transferDate, remark } = req.body;
  
      // Validate required fields
      if ( !receiverId || !receiverType || !amount) {
        return badRequest(res, "Missing required fields");
      }
  
      // Create new payment entry
      const newPayment = new loginCashPaymentModel({
        senderId: employee._id,
        receiverId: receiverId,
        receiverType:receiverType,
        transactionImage: transactionImage || "",
        amount: amount,
        transferDate: transferDate ,
        remark: remark || "",
      });
  
      // Save to database
      await newPayment.save();
  
      return success(res, "Payment added successfully", newPayment);
    } catch (error) {
        console.error("Error in :", error);
        return unknownError(res, error);
      }
    }
  

  
  module.exports = {
    getCashLoginListByToken,
    loginCashApprovalApi,
    getAllLedgerDetail,
    cashLoginTransferAmount
  };