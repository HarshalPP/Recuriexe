
const {
  serverValidation,
  success,
  notFound,
  badRequest,
  unknownError } = require('../../../../../globalHelper/response.globalHelper');
  const { validationResult } = require('express-validator');
const fs = require('fs');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const ExcelJS = require("exceljs");
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const credentials = require('../../../../../credential.json');
const liveCredentials = require('../../../../../liveSheet.json');
const employeModel = require('../../model/adminMaster/employe.model')
const newbranch = require("../../model/adminMaster/newBranch.model")
const collectionModel = require('../../model/collection/collectionSheet.model')
const visitModel = require('../../model/collection/visit.model')
const okcreditModel = require('../../model/adminMaster/okCredit.model')
const roleModel = require('../../model/adminMaster/role.model')
const dropDownModel = require('../../model/adminMaster/dropdown.model')
const baseUrl = process.env.BASE_URL;
const {sendEmail} = require("../functions.Controller")
const axios = require('axios')
const xlsx = require('xlsx');
const moment = require('moment');


  
  // -------------VISIT DASHBOARD BY REPORTING MANAGER BY TOKEN--------------------
  async function visitCustomerGoogleSheet(page, limit, branchFilter = null, minNetDue = null, maxNetDue = null, filterByLD = '') {
    try {
      const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
      const sheetName = process.env.EMIOVERALL_SHEET;
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
      });
  
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No data found.');
      }
  
      const headers = rows[0];
      let data = rows.slice(1).map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });
  
      // 🔍 Apply branch filtering only if branchFilter is set and not "all"
      if (branchFilter && branchFilter.toLowerCase() !== 'all') {
        data = data.filter(
          (row) => row.BRANCH?.toLowerCase() === branchFilter.toLowerCase()
        );
      }
  
      // 🔍 Apply NET DUE range filtering ONLY if both parameters are explicitly provided
      if (minNetDue !== null || maxNetDue !== null) {
        data = data.filter((row) => {
          // Handle cases where NET DUE might be undefined or empty
          if (!row["NET DUE"]) {
            // If minNetDue is specified and non-zero, empty NET DUE values should be excluded
            return minNetDue === null || parseFloat(minNetDue) <= 0;
          }
          
          // Parse the NET DUE value, handling comma-formatted numbers like "12,946"
          const netDueStr = row["NET DUE"];
          const netDueValue = parseFloat(netDueStr.replace(/,/g, ""));
          
          // Check if value is within the specified range
          if (minNetDue !== null && netDueValue < parseFloat(minNetDue)) {
            return false;
          }
          if (maxNetDue !== null && netDueValue > parseFloat(maxNetDue)) {
            return false;
          }
          
          return true;
        });
      }
  
      // 🔍 Apply LD filtering if filterByLD is provided and not empty
      if (filterByLD) {
        data = data.filter(
          (row) => row.LD && row.LD.toString().toLowerCase() === filterByLD.toLowerCase()
        );
      }
  
      const total = data.length;
      const skip = (page - 1) * limit;
      const paginatedData = data.slice(skip, skip + limit);
  
      return {
        data: paginatedData,
        total,
      };
    } catch (error) {
      console.error('Error fetching Google Sheet data:', error.message);
      throw error;
    }
  }
  
  
  // -----------------**ALL CUSTOMER DASHBOARD WITH VISIT AND COLLECTION COUNT **----------------------------
  async function allCustomerDashboard(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const { startDate, endDate, branch, minNetDue, maxNetDue, filterByLD } = req.query;
      const fromDate = startDate
        ? moment(startDate).startOf("day").toDate()
        : moment().startOf("day").toDate();
      const toDate = endDate
        ? moment(endDate).endOf("day").toDate()
        : moment().endOf("day").toDate();
      
      // Pass the NET DUE filter parameters and filterByLD to the Google Sheet function
      const { data: sheetData, total } = await visitCustomerGoogleSheet(
        page, 
        limit, 
        branch, 
        minNetDue, 
        maxNetDue,
        filterByLD || '' // Pass empty string if not provided
      );
      
      // Enrich only paginated records
      const enrichedData = await Promise.all(
        sheetData.map(async (item) => {
          const LD = item.LD;
          let visitDone = 0;
          let emiAcceptCount = 0;
          let emiReceived = 0;
          if (LD) {
            visitDone = await visitModel.countDocuments({
              LD,
              status: "accept" ,
              createdAt: { $gte: fromDate, $lte: toDate },
            });
            const acceptEmis = await collectionModel.find({
              LD,
              status: "accept",
              createdAt: { $gte: fromDate, $lte: toDate },
            });
            emiAcceptCount = acceptEmis.length;
            emiReceived = acceptEmis.reduce((sum, doc) => {
              return sum + (Number(doc.receivedAmount) || 0);
            }, 0);    
          }
          return {
            ...item,
            visitDone,
            emiAcceptCount,
            emiReceived,
          };
        })
      );
      
      // Sort within the page
      const sortedData = enrichedData.sort((a, b) => {
        const totalA = (a.visitDone || 0) + (a.emiAcceptCount || 0);
        const totalB = (b.visitDone || 0) + (b.emiAcceptCount || 0);
        return totalB - totalA; // Descending order
      });
     
      return success(res, "Success", {
        page,
        limit,
        total,
        sortedData,
      });
    } catch (error) {
      console.error("Error in allCustomerDashboard:", error);
      return unknownError(res, error.message);
    }
  }
  
  // ---------- Dashboard API for charts and analytics------------------
  async function piChartDashboardApi(req, res) {
    try {
      const { branchId, regionalBranchId, startDate, endDate, status, page = 1, limit = 20 } = req.query;
      
      // Convert pagination parameters to numbers
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      
      // Create proper date objects
      const fromDate = startDate
        ? moment(startDate).startOf('day').toDate()
        : moment().startOf('day').toDate();
      const toDate = endDate
        ? moment(endDate).endOf('day').toDate()
        : moment().endOf('day').toDate();
      
      // First, get customer data from Google Sheets
      const googleSheetData = await getGoogleSheetData();
      
      // Filter customers by branch or regional branch
      let filteredCustomers = googleSheetData || [];
      let filteredLDs = [];
      let branchName = "";
      let branchNames = [];
      
      // Check if regionalBranchId is provided and not "all"
      if (regionalBranchId && regionalBranchId !== "all" && googleSheetData && googleSheetData.length > 0) {
        // Get all branches that belong to this regional branch
        const branches = await newbranch.find({ regionalBranchId: new ObjectId(regionalBranchId) });
        
        if (branches && branches.length > 0) {
          // Extract all branch names
          branchNames = branches.map(branch => branch.name);
          
          // Filter customers by any of these branch names
          filteredCustomers = googleSheetData.filter(customer => 
            customer.BRANCH && 
            branchNames.some(name => 
              customer.BRANCH.toString().toLowerCase() === name.toLowerCase() || 
              customer.BRANCH.toString().includes(name)
            )
          );
        }
      }
      // If branchId is provided instead (existing functionality)
      else if (branchId && branchId !== "all" && googleSheetData && googleSheetData.length > 0) {
        // Get branch name
        const branch = await newbranch.findOne({ _id: new ObjectId(branchId) });
        branchName = branch ? branch.name : "";
        
        // Filter customers by branch name
        filteredCustomers = googleSheetData.filter(customer => 
          customer.BRANCH && 
          (customer.BRANCH.toString().toLowerCase() === branchName.toLowerCase() || 
           customer.BRANCH.toString().includes(branchName))
        );
      }
      
      // Extract LD numbers from filtered customers
      filteredLDs = filteredCustomers
        .filter(customer => customer.LD)
        .map(customer => customer.LD);
      
      // If no filters applied or no results, use all LDs
      if (filteredLDs.length === 0 && (!branchId || branchId === "all") && (!regionalBranchId || regionalBranchId === "all")) {
        filteredLDs = googleSheetData
          .filter(customer => customer.LD)
          .map(customer => customer.LD);
      }
      
      // Create base match conditions
      const visitMatchCondition = {
        LD: { $in: filteredLDs },
        createdAt: { $gte: fromDate, $lte: toDate }
      };
   
      const collectionMatchCondition = {
        LD: { $in: filteredLDs },
        createdAt: { $gte: fromDate, $lte: toDate }
      };
      
      // Add status filtering if provided
      if (status && status !== "all") {
        visitMatchCondition.status = status;
        collectionMatchCondition.status = status;
      }
      
      // Get today's date range for activity check
      const today = moment().startOf('day').toDate();
      const endOfToday = moment().endOf('day').toDate();
      
      // Run all queries in parallel for performance
      const [visitStats, collectionStats, todayVisits, todayCollections] = await Promise.all([
        // Get visit statistics for filtered customers
        getVisitStatistics(visitMatchCondition),
        
        // Get collection statistics for filtered customers
        getCollectionStatistics(collectionMatchCondition),
        
        // Get today's visit data for all customers
        visitModel.aggregate([
          {
            $match: {
              LD: { $in: filteredLDs },
              createdAt: { $gte: today, $lte: endOfToday }
            }
          },
          {
            $group: {
              _id: "$LD",
              visitDone: { $sum: 1 }
            }
          }
        ]),
        
        // Get today's collection data for all customers
        collectionModel.aggregate([
          {
            $match: {
              LD: { $in: filteredLDs },
              createdAt: { $gte: today, $lte: endOfToday }
            }
          },
          {
            $group: {
              _id: "$LD",
              emiAcceptCount: { $sum: 1 },
              emiReceived: { $sum: "$receivedAmount" }
            }
          }
        ])
      ]);
      
      // Convert today's activity data to maps for fast lookup
      const visitMap = new Map(todayVisits.map(item => [item._id, item.visitDone]));
      const collectionMap = new Map(todayCollections.map(item => [item._id, {
        emiAcceptCount: item.emiAcceptCount,
        emiReceived: item.emiReceived
      }]));
      
      // Enhance customers with visit and collection data
      const enhancedCustomers = filteredCustomers.map(customer => {
        const visitDone = visitMap.get(customer.LD) || 0;
        const collectionData = collectionMap.get(customer.LD) || { emiAcceptCount: 0, emiReceived: 0 };
        
        return {
          ...customer,
          visitDone: visitDone,
          emiAcceptCount: collectionData.emiAcceptCount,
          emiReceived: collectionData.emiReceived,
          hasActivity: visitDone > 0 || collectionData.emiAcceptCount > 0
        };
      });
      
      // Sort customers: those with today's activity first
      const sortedCustomers = enhancedCustomers.sort((a, b) => {
        // If one has activity today and the other doesn't, prioritize the active one
        if (a.hasActivity && !b.hasActivity) return -1;
        if (!a.hasActivity && b.hasActivity) return 1;
        
        // If both have activity or both don't, maintain original order
        return 0;
      });
      
      // Calculate pagination
      const totalCustomers = sortedCustomers.length;
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);
      const totalPages = Math.ceil(totalCustomers / pageSize);
      
      // Format the response
      const result = {
        counts: {
          // Visit counts
          approvalPendingVisits: visitStats.pendingCount || 0,
          acceptVisit: visitStats.acceptCount || 0,
          rejectVisit: visitStats.rejectCount || 0,
          totalVisits: visitStats.totalVisit || 0,
          
          // Collection counts
          approvalPendingEmiAmount: collectionStats.pendingAmount || 0,
          receivedEmiAmount: collectionStats.acceptAmount || 0,
          rejectEmiAmount: collectionStats.rejectAmount || 0,
          totalEmiAmount: (collectionStats.pendingAmount || 0) + 
                          (collectionStats.acceptAmount || 0) + 
                          (collectionStats.rejectAmount || 0),
          
          // Customer count
          customerCount: totalCustomers
        },
        // Add paginated customers array with enhanced data
        customers: paginatedCustomers,
        // Add pagination metadata
        pagination: {
          currentPage: pageNumber,
          pageSize: pageSize,
          totalCustomers: totalCustomers,
          totalPages: totalPages,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1
        }
      };
      
      return success(res, "Dashboard data retrieved successfully", result);
    } catch (error) {
      console.error(error);
      return unknownError(res, error);
    }
  }
  
  async function getVisitStatistics(matchCondition) {
    try {
      // Get visit counts by status with proper status values
      const statusCounts = await visitModel.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Initialize counts
      let pendingCount = 0;
      let acceptCount = 0;
      let rejectCount = 0;
      let totalVisit = 0;
      
      // Process status counts - handle case variations
      statusCounts.forEach(item => {
        const status = item._id ? item._id.toString().toLowerCase() : "";
        const count = item.count || 0;
        
        if (status === "pending") {
          pendingCount = count;
        } else if (status === "accept" || status === "accepted") {
          acceptCount = count;
        } else if (status === "reject" || status === "rejected") {
          rejectCount = count;
        }
        
        totalVisit += count;
      });
      
      return {
        totalVisit,
        pendingCount,
        acceptCount,
        rejectCount
      };
    } catch (error) {
      console.error("Error getting visit statistics:", error);
      return {
        totalVisit: 0,
        pendingCount: 0,
        acceptCount: 0,
        rejectCount: 0
      };
    }
  }
  
  async function getCollectionStatistics(matchCondition) {
    try {
      // Get collection counts and amounts by status
      const statusAmounts = await collectionModel.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: "$receivedAmount" }
          }
        }
      ]);
      
      // Initialize variables
      let pendingAmount = 0;
      let acceptAmount = 0;
      let rejectAmount = 0;
      let pendingCount = 0;
      let acceptCount = 0;
      let rejectCount = 0;
      let totalCount = 0;
      
      // Process status amounts - handle case variations
      statusAmounts.forEach(item => {
        const status = item._id ? item._id.toString().toLowerCase() : "";
        const count = item.count || 0;
        const amount = item.amount || 0;
        
        if (status === "pending") {
          pendingAmount = amount;
          pendingCount = count;
        } else if (status === "accept" || status === "accepted") {
          acceptAmount = amount;
          acceptCount = count;
        } else if (status === "reject" || status === "rejected") {
          rejectAmount = amount;
          rejectCount = count;
        }
        
        totalCount += count;
      });
      
      return {
        totalCount,
        pendingCount,
        acceptCount,
        rejectCount,
        pendingAmount,
        acceptAmount,
        rejectAmount
      };
    } catch (error) {
      console.error("Error getting collection statistics:", error);
      return {
        totalCount: 0,
        pendingCount: 0,
        acceptCount: 0,
        rejectCount: 0,
        pendingAmount: 0,
        acceptAmount: 0,
        rejectAmount: 0
      };
    }
  }

 // Updated getGoogleSheetData function
async function getGoogleSheetData() {
  try {
    const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
    const sheetName = process.env.EMIOVERALL_SHEET;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found.');
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = row[index] !== undefined ? row[index].trim() : null;
      });
      return obj;
    });

    // Helper to parse amounts safely
    const parseAmountField = (value) => {
      if (!value) return 0;
      const numbers = value.replace(/,/g, '').match(/\d+(\.\d+)?/g);
      if (!numbers) return 0;
      return numbers.reduce((sum, num) => sum + parseFloat(num), 0);
    };

    // Aggregating branch-level data
    const branchMap = new Map();
    const branchEmployees = new Map();

    data.forEach(row => {
      // IMPORTANT FIX: Skip rows with empty branch names
      const rawBranchName = row["BRANCH"]?.trim() || "";
      if (!rawBranchName) return; // Skip records with empty branch names
      
      const branch = rawBranchName.toUpperCase();
      const netDue = parseAmountField(row["NET DUE"]);
      const oldDue = parseAmountField(row["OLD DUE"]);
      const allocation1EmpId = row["Allocation 1 emp id"]?.trim();

      if (allocation1EmpId) {
        if (!branchEmployees.has(branch)) {
          branchEmployees.set(branch, new Set());
        }
        branchEmployees.get(branch).add(allocation1EmpId);
      }

      if (!branchMap.has(branch)) {
        branchMap.set(branch, {
          branchName: branch,
          CUST: 0,
          TE: 0,
          NET_DUE_COUNT: 0,
          ZERO_COUNT: 0,
          OLD_DUE_AMT: 0,
          NET_DUE_AMT: 0,
          BCT_X_COUNT: 0,
          BCT_X_AMT: 0,
        });
      }

      const summary = branchMap.get(branch);

      summary.CUST += 1;
      summary.OLD_DUE_AMT += oldDue;
      summary.NET_DUE_AMT += netDue;

      if (netDue > 0) summary.NET_DUE_COUNT += 1;
      if (netDue === 0) summary.ZERO_COUNT += 1;

      if (oldDue === 0 && netDue > 0) {
        summary.BCT_X_COUNT += 1;
        summary.BCT_X_AMT += netDue;
      }
    });

    branchEmployees.forEach((empSet, branch) => {
      if (branchMap.has(branch)) {
        branchMap.get(branch).TE = empSet.size;
      }
    });

    // IMPORTANT FIX: Filter out any branches with empty names before returning
    Array.from(branchMap.keys()).forEach(branchName => {
      if (!branchName.trim()) {
        branchMap.delete(branchName);
      }
    });

    const branchSummaries = Array.from(branchMap.values());

    return { rawData: data, branchSummaries };
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error.message);
    throw error;
  }
}
  
// -----------------BRANCH WISE DASHBOARD DATA---------------------------
// async function branchWiseTable(req, res) {
//   try {
//     let { 
//       startDate, 
//       endDate, 
//       page = 1, 
//       limit = 20,
//       branchId = "all",
//       regionalBranchId = "all"
//     } = req.query;
    
//     // Convert page and limit to numbers
//     const pageNum = parseInt(page, 10);
//     const limitNum = parseInt(limit, 10);

//     // Date normalization
//     startDate = startDate ? moment(startDate).startOf('day').toISOString() : moment().startOf('day').toISOString();
//     endDate = endDate ? moment(endDate).endOf('day').toISOString() : moment().endOf('day').toISOString();

//     // Get current month start/end for monthly tracking
//     const currentMonthStart = moment().startOf('month').toISOString();
//     const currentMonthEnd = moment().endOf('month').toISOString();
//     const today = moment().startOf('day').toDate();

//     // STEP 1: Apply branch filtering if branchId or regionalBranchId is specified
//     let filteredBranchNames = [];
    
//     if (regionalBranchId !== "all") {
//       const regionalBranches = await newbranch.find({
//         regionalBranchId: new ObjectId(regionalBranchId)
//       }, { _id: 1, name: 1 }).lean();
      
//       filteredBranchNames = regionalBranches.map(branch => branch.name?.toUpperCase()).filter(Boolean);
      
//       if (filteredBranchNames.length === 0) {
//         return notFound(res, "No branches found for the specified regional branch");
//       }
//     }
    
//     if (branchId !== "all") {
//       const branch = await newbranch.findById(branchId).lean();
//       if (!branch) {
//         return notFound(res, "Branch not found");
//       }
//       filteredBranchNames = [branch.name?.toUpperCase()].filter(Boolean);
//     }

//     // STEP 2: Get all active employees from the database
//     const allEmployees = await employeModel.find({
//       status: "active"
//     }).lean();
    
//     // Create a map of all unique employee IDs for lookup
//     const employeeByIdMap = new Map();
//     allEmployees.forEach(emp => {
//       if (emp.employeUniqueId) {
//         // Store the employee object by their unique ID (case insensitive)
//         employeeByIdMap.set(emp.employeUniqueId.toLowerCase(), emp);
//       }
//     });

//     // STEP 3: Fetch all required data in parallel
//     const [
//       { rawData: googleCustomers }, 
//       visits, 
//       collections,
//       monthlyVisits,
//       monthlyCollections
//     ] = await Promise.all([
//       // Get customer data from Google Sheets
//       getGoogleSheetData(),
      
//       // Get visits for the specified date range
//       visitModel.find({
//         status: "accept",
//         createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
//       }).lean(),
      
//       // Get collections for the specified date range
//       collectionModel.find({
//         status: "accept",
//         createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
//       }).lean(),
      
//       // Get visits for the current month up to yesterday
//       visitModel.find({
//         status: "accept",
//         createdAt: { 
//           $gte: new Date(currentMonthStart), 
//           $lte: new Date(currentMonthEnd),
//           $lt: today
//         }
//       }).lean(),
      
//       // Get collections for the current month up to yesterday
//       collectionModel.find({
//         status: "accept",
//         createdAt: { 
//           $gte: new Date(currentMonthStart), 
//           $lte: new Date(currentMonthEnd),
//           $lt: today
//         }
//       }).lean()
//     ]);

//     // STEP 4: Create data structures for processing
//     const ldToBranchMap = new Map();       // Maps LD to branch name
//     const branchMap = new Map();           // Stores branch summaries
//     const visitedLDs = new Set();          // Tracks visited LDs
//     const monthlyVisitedLDs = new Set();   // Tracks LDs visited earlier in month
//     const branchVisitCounts = new Map();   // Tracks visit count per branch
//     const branchEmployees = new Map();     // Maps branch to real employees
//     const allocationToEmployeeMap = new Map(); // Maps allocation strings to employee objects

//     // STEP 5: Initialize branch data structures
//     // First pass: collect all branch names and initialize structures
//     googleCustomers.forEach(cust => {
//       const rawBranchName = cust["BRANCH"]?.trim() || "";
//       if (!rawBranchName) return;
      
//       const branchName = rawBranchName.toUpperCase();
      
//       // Skip if branch filtering is active and this branch is not in the filter
//       if (filteredBranchNames.length > 0 && !filteredBranchNames.includes(branchName)) {
//         return;
//       }
      
//       if (!branchMap.has(branchName)) {
//         branchMap.set(branchName, {
//           branchName: branchName,
//           CUST: 0,
//           TE: 0,
//           NET_DUE_COUNT: 0,
//           ZERO_COUNT: 0,
//           OLD_DUE_AMT: 0,
//           NET_DUE_AMT: 0,
//           BCT_X_COUNT: 0,
//           BCT_X_AMT: 0,
//           VP: 0,
//           TFV: 0,
//           TV: 0,
//           TR_COUNT: 0,
//           TR_AMT: 0,
//           pendingLDs: new Set(),
//           allocatedLDs: new Set()
//         });
        
//         branchVisitCounts.set(branchName, 0);
//         branchEmployees.set(branchName, new Set());
//       }
//     });
    
//     // STEP 6: Create allocation pattern matchers
//     // This will be used to accurately match allocation strings to actual employees
//     allEmployees.forEach(emp => {
//       if (emp.employeUniqueId) {
//         const empId = emp._id.toString();
//         const empUniqueId = emp.employeUniqueId.toLowerCase();
        
//         // Match exact ID
//         allocationToEmployeeMap.set(empUniqueId, emp);
        
//         // Match name-ID format (if employee name exists)
//         if (emp.employeName) {
//           const fullName = emp.employeName.toLowerCase();
//           const firstName = fullName.split(' ')[0];
          
//           // Various formats an employee might appear in the allocation field
//           allocationToEmployeeMap.set(`${fullName}-${empUniqueId}`, emp);
//           allocationToEmployeeMap.set(`${firstName}-${empUniqueId}`, emp);
          
//           // With space around dash
//           allocationToEmployeeMap.set(`${fullName} - ${empUniqueId}`, emp);
//           allocationToEmployeeMap.set(`${firstName} - ${empUniqueId}`, emp);
//         }
//       }
//     });

//     // STEP 7: Process customer data and count only customers with allocations
//     googleCustomers.forEach(cust => {
//       const ld = cust["LD"];
//       if (!ld) return;
      
//       const rawBranchName = cust["BRANCH"]?.trim() || "";
//       if (!rawBranchName) return;
      
//       const branchName = rawBranchName.toUpperCase();
//       ldToBranchMap.set(ld, branchName);
      
//       // Skip if branch filtering is active and this branch is not in the filter
//       if (filteredBranchNames.length > 0 && !filteredBranchNames.includes(branchName)) {
//         return;
//       }
      
//       if (!branchMap.has(branchName)) return;
      
//       // Skip "ACCOUNT COLLECTION" and "CLOSED" entries
//       const status = cust["STATUS"]?.trim().toUpperCase();
//       if (status === "ACCOUNT COLLECTION" || status === "CLOSED") {
//         return;
//       }
      
//       // Parse NET_DUE and OLD_DUE values - handle commas in the numbers
//       const netDueStr = (cust["NET DUE"] || "0").toString().replace(/,/g, '');
//       const oldDueStr = (cust["OLD DUE"] || "0").toString().replace(/,/g, '');
      
//       const netDue = parseFloat(netDueStr) || 0;
//       const oldDue = parseFloat(oldDueStr) || 0;
      
//       // Check if this customer has an allocation
//       const allocEmpId = cust["Allocation 1 emp id"]?.trim();
      
//       // Skip empty, "ACCOUNT COLLECTION" or "CLOSED" allocations
//       if (!allocEmpId || allocEmpId === "ACCOUNT COLLECTION" || allocEmpId === "CLOSED") {
//         return;
//       }
      
//       // Try to find a real employee that matches this allocation
//       let matchedEmployee = null;
      
//       // 1. Direct lookup in allocation map
//       if (allocationToEmployeeMap.has(allocEmpId.toLowerCase())) {
//         matchedEmployee = allocationToEmployeeMap.get(allocEmpId.toLowerCase());
//       } else {
//         // 2. Try matching with all employee unique IDs
//         for (const [empUniqueId, emp] of employeeByIdMap.entries()) {
//           if (allocEmpId.toLowerCase().includes(empUniqueId)) {
//             matchedEmployee = emp;
//             break;
//           }
//         }
//       }
      
//       // Only process if we found a real employee
//       if (matchedEmployee) {
//         const branchSummary = branchMap.get(branchName);
        
//         // Track this LD as allocated
//         branchSummary.allocatedLDs.add(ld);
        
//         // Count this customer
//         branchSummary.CUST += 1;
        
//         // Add this employee to the branch (ensures only unique real employees are counted)
//         branchEmployees.get(branchName).add(matchedEmployee._id.toString());
        
//         // Update financial metrics
//         branchSummary.OLD_DUE_AMT += oldDue;
//         branchSummary.NET_DUE_AMT += netDue;
        
//         if (netDue > 0) {
//           branchSummary.NET_DUE_COUNT += 1;
//           branchSummary.pendingLDs.add(ld);
//         }
        
//         if (netDue === 0) {
//           branchSummary.ZERO_COUNT += 1;
//         }
        
//         if (oldDue === 0 && netDue > 0) {
//           branchSummary.BCT_X_COUNT += 1;
//           branchSummary.BCT_X_AMT += netDue;
//         }
//       }
//     });

//     // Update employee count for each branch
//     branchEmployees.forEach((empSet, branchName) => {
//       if (branchMap.has(branchName)) {
//         branchMap.get(branchName).TE = empSet.size;
//       }
//     });

//     // STEP 8: Process monthly historical data
//     monthlyVisits.forEach(visit => {
//       if (visit.LD) monthlyVisitedLDs.add(visit.LD);
//     });
    
//     monthlyCollections.forEach(col => {
//       if (col.LD) monthlyVisitedLDs.add(col.LD);
//     });

//     // STEP 9: Process visit data - only count visits for allocated LDs
//     visits.forEach((visit) => {
//       const ld = visit.LD;
//       if (!ld) return;
      
//       // Mark this LD as visited
//       visitedLDs.add(ld);
      
//       const branchName = ldToBranchMap.get(ld);
//       if (!branchName || !branchMap.has(branchName)) return;
      
//       // Skip if branch filtering is active and this branch is not in the filter
//       if (filteredBranchNames.length > 0 && !filteredBranchNames.includes(branchName)) {
//         return;
//       }
      
//       // Only count visits for allocated LDs
//       if (!branchMap.get(branchName).allocatedLDs.has(ld)) return;

//       // Get branch summary
//       const summary = branchMap.get(branchName);
      
//       // Increment TV count (Total Visits)
//       branchVisitCounts.set(branchName, branchVisitCounts.get(branchName) + 1);

//       // Count today's FIRST visits in this month (TFV)
//       const isToday = moment(visit.createdAt).isSame(moment(), 'day');
//       if (isToday && !monthlyVisitedLDs.has(ld)) {
//         summary.TFV += 1;
//         monthlyVisitedLDs.add(ld);
//       }
//     });

//     // STEP 10: Process collection data - only count collections for allocated LDs
//     collections.forEach((col) => {
//       const ld = col.LD;
//       if (!ld) return;
      
//       const branchName = ldToBranchMap.get(ld);
//       if (!branchName || !branchMap.has(branchName)) return;
      
//       // Skip if branch filtering is active and this branch is not in the filter
//       if (filteredBranchNames.length > 0 && !filteredBranchNames.includes(branchName)) {
//         return;
//       }
      
//       // Only count collections for allocated LDs
//       if (!branchMap.get(branchName).allocatedLDs.has(ld)) return;

//       // Get branch summary
//       const summary = branchMap.get(branchName);
      
//       // Process today's collections (TR_COUNT, TR_AMT)
//       const isToday = moment(col.createdAt).isSame(moment(), 'day');
//       if (isToday) {
//         const amount = parseFloat(col.receivedAmount) || 0;
//         summary.TR_COUNT += 1;
//         summary.TR_AMT += amount;
//       }
//     });

//     // STEP 11: Calculate final metrics for each branch
//     branchMap.forEach((summary, branchName) => {
//       // Remove visited LDs from pending
//       visitedLDs.forEach(ld => {
//         summary.pendingLDs.delete(ld);
//       });
      
//       // VP = Count of allocated LDs with NET_DUE > 0 that haven't been visited
//       summary.VP = summary.pendingLDs.size;
      
//       // TV = Total visits from visit model
//       summary.TV = branchVisitCounts.get(branchName) || 0;
      
//       // Remove the temporary sets
//       delete summary.pendingLDs;
//       delete summary.allocatedLDs;
//     });

//     // Filter out any branches with empty names or no allocated customers
//     Array.from(branchMap.keys()).forEach(branchName => {
//       if (!branchName.trim() || branchMap.get(branchName).CUST === 0) {
//         branchMap.delete(branchName);
//       }
//     });

//     // STEP 12: Convert to array, sort, and paginate
//     const allSummaries = Array.from(branchMap.values()).sort((a, b) => b.CUST - a.CUST);
//     const totalRecords = allSummaries.length;
//     const skip = (pageNum - 1) * limitNum;
//     const paginatedSummaries = allSummaries.slice(skip, skip + limitNum);

//     // STEP 13: Calculate grand totals
//     const summaryTotalCount = {
//       CUST: allSummaries.reduce((sum, branch) => sum + branch.CUST, 0),
//       TE: allSummaries.reduce((sum, branch) => sum + branch.TE, 0),
//       NET_DUE_COUNT: allSummaries.reduce((sum, branch) => sum + branch.NET_DUE_COUNT, 0),
//       ZERO_COUNT: allSummaries.reduce((sum, branch) => sum + branch.ZERO_COUNT, 0),
//       OLD_DUE_AMT: allSummaries.reduce((sum, branch) => sum + branch.OLD_DUE_AMT, 0),
//       NET_DUE_AMT: allSummaries.reduce((sum, branch) => sum + branch.NET_DUE_AMT, 0),
//       BCT_X_COUNT: allSummaries.reduce((sum, branch) => sum + branch.BCT_X_COUNT, 0),
//       BCT_X_AMT: allSummaries.reduce((sum, branch) => sum + branch.BCT_X_AMT, 0),
//       VP: allSummaries.reduce((sum, branch) => sum + branch.VP, 0),
//       TFV: allSummaries.reduce((sum, branch) => sum + branch.TFV, 0),
//       TV: allSummaries.reduce((sum, branch) => sum + branch.TV, 0),
//       TR_COUNT: allSummaries.reduce((sum, branch) => sum + branch.TR_COUNT, 0),
//       TR_AMT: allSummaries.reduce((sum, branch) => sum + branch.TR_AMT, 0)
//     };
    
//     // STEP 14: Prepare pagination info
//     const pagination = {
//       currentPage: pageNum,
//       totalPages: Math.ceil(totalRecords / limitNum),
//       totalRecords,
//       recordsPerPage: limitNum
//     };
    
//     // Return formatted response
//     return success(res, "Branch summary retrieved successfully", {
//       branches: paginatedSummaries,
//       pagination,
//       summaryTotalCount,
//       filters: { branchId, regionalBranchId, startDate, endDate }
//     });

//   } catch (error) {
//     console.error(error);
//     return unknownError(res, error);
//   }
// }
async function branchWiseTable(req, res) {
  try {
    let { 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20,
      branchId = "all",
      regionalBranchId = "all"
    } = req.query;
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Date normalization
    startDate = startDate ? moment(startDate).startOf('day').toISOString() : moment().startOf('day').toISOString();
    endDate = endDate ? moment(endDate).endOf('day').toISOString() : moment().endOf('day').toISOString();

    // Get current month start/end for monthly tracking
    const currentMonthStart = moment().startOf('month').toISOString();
    const currentMonthEnd = moment().endOf('month').toISOString();
    const today = moment().startOf('day').toDate();

    // STEP 1: Apply branch filtering if branchId or regionalBranchId is specified
    let filteredBranchNames = [];
    
    if (regionalBranchId !== "all") {
      const regionalBranches = await newbranch.find({
        regionalBranchId: new ObjectId(regionalBranchId)
      }, { _id: 1, name: 1 }).lean();
      
      filteredBranchNames = regionalBranches.map(branch => branch.name?.toUpperCase()).filter(Boolean);
      
      if (filteredBranchNames.length === 0) {
        return notFound(res, "No branches found for the specified regional branch");
      }
    }
    
    if (branchId !== "all") {
      const branch = await newbranch.findById(branchId).lean();
      if (!branch) {
        return notFound(res, "Branch not found");
      }
      filteredBranchNames = [branch.name?.toUpperCase()].filter(Boolean);
    }

    // STEP 2: Get all active employees from the database
    const allEmployees = await employeModel.find({
      status: "active"
    }).lean();
    
    // Create maps for efficient employee lookups
    const employeeById = new Map();
    const employeeByUniqueId = new Map();
    
    allEmployees.forEach(emp => {
      employeeById.set(emp._id.toString(), emp);
      
      if (emp.employeUniqueId) {
        // Store by unique ID (case insensitive)
        employeeByUniqueId.set(emp.employeUniqueId.toLowerCase(), emp);
      }
    });

    // STEP 3: Fetch all required data in parallel
    const [
      { rawData: googleCustomers }, 
      visits, 
      collections,
      monthlyVisits,
      monthlyCollections
    ] = await Promise.all([
      // Get customer data from Google Sheets
      getGoogleSheetData(),
      
      // Get visits for the specified date range
      visitModel.find({
        status: "accept",
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).lean(),
      
      // Get collections for the specified date range
      collectionModel.find({
        status: "accept",
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).lean(),
      
      // Get visits for the current month up to yesterday
      visitModel.find({
        status: "accept",
        createdAt: { 
          $gte: new Date(currentMonthStart), 
          $lte: new Date(currentMonthEnd),
          $lt: today
        }
      }).lean(),
      
      // Get collections for the current month up to yesterday
      collectionModel.find({
        status: "accept",
        createdAt: { 
          $gte: new Date(currentMonthStart), 
          $lte: new Date(currentMonthEnd),
          $lt: today
        }
      }).lean()
    ]);

    // STEP 4: Create data structures for processing
    const ldToBranchMap = new Map();       // Maps LD to branch name
    const branchMap = new Map();           // Stores branch summaries
    const visitedLDs = new Set();          // Tracks visited LDs
    const monthlyVisitedLDs = new Set();   // Tracks LDs visited earlier in month
    const branchVisitCounts = new Map();   // Tracks visit count per branch
    const branchEmployees = new Map();     // Maps branch to unique employee IDs
    
    // STEP 5: Create mapping from allocation string to employee
    // This will help us identify which employees are in which allocation
    const allocationToEmployeeMap = new Map();
    
    // First, identify all unique allocation patterns from the sheet
    const uniqueAllocations = new Set();
    googleCustomers.forEach(cust => {
      const allocEmpId = cust["Allocation 1 emp id"]?.trim();
      if (allocEmpId && allocEmpId !== "ACCOUNT COLLECTION" && allocEmpId !== "CLOSED") {
        uniqueAllocations.add(allocEmpId);
      }
    });
    
    // Then, match each allocation pattern to an employee
    uniqueAllocations.forEach(allocation => {
      // For each allocation, try to match it to an employee
      let matchedEmp = null;
      
      // First check if allocation contains an exact employee unique ID
      for (const [empUniqueId, emp] of employeeByUniqueId.entries()) {
        // Case insensitive match for the ID portion
        const idPattern = new RegExp(`-${empUniqueId}$`, 'i');
        const idPatternWithSpace = new RegExp(`- ${empUniqueId}$`, 'i');
        
        if (allocation.toLowerCase() === empUniqueId.toLowerCase() || 
            idPattern.test(allocation.toLowerCase()) ||
            idPatternWithSpace.test(allocation.toLowerCase())) {
          matchedEmp = emp;
          break;
        }
      }
      
      // If no match yet, check if the allocation contains any part of employee ID
      if (!matchedEmp) {
        for (const [empUniqueId, emp] of employeeByUniqueId.entries()) {
          if (allocation.toLowerCase().includes(empUniqueId.toLowerCase())) {
            matchedEmp = emp;
            break;
          }
        }
      }
      
      // If we found a match, store it
      if (matchedEmp) {
        allocationToEmployeeMap.set(allocation, matchedEmp);
      }
    });

    // STEP 6: Initialize branch data structures
    googleCustomers.forEach(cust => {
      const rawBranchName = cust["BRANCH"]?.trim() || "";
      if (!rawBranchName) return;
      
      const branchName = rawBranchName.toUpperCase();
      
      // Skip if branch filtering is active and this branch is not in the filter
      if (filteredBranchNames.length > 0 && !filteredBranchNames.includes(branchName)) {
        return;
      }
      
      if (!branchMap.has(branchName)) {
        branchMap.set(branchName, {
          branchName: branchName,
          CUST: 0,
          TE: 0,
          NET_DUE_COUNT: 0,
          ZERO_COUNT: 0,
          OLD_DUE_AMT: 0,
          NET_DUE_AMT: 0,
          BCT_X_COUNT: 0,
          BCT_X_AMT: 0,
          VP: 0,
          TFV: 0,
          TV: 0,
          TR_COUNT: 0,
          TR_AMT: 0,
          pendingLDs: new Set(),
          allocatedLDs: new Set()
        });
        
        branchVisitCounts.set(branchName, 0);
        branchEmployees.set(branchName, new Set());
      }
    });

    // STEP 7: Process customer data and count only customers with valid allocations
    googleCustomers.forEach(cust => {
      const ld = cust["LD"];
      if (!ld) return;
      
      const rawBranchName = cust["BRANCH"]?.trim() || "";
      if (!rawBranchName) return;
      
      const branchName = rawBranchName.toUpperCase();
      ldToBranchMap.set(ld, branchName);
      
      // Skip if branch filtering is active and this branch is not in the filter
      if (filteredBranchNames.length > 0 && !filteredBranchNames.includes(branchName)) {
        return;
      }
      
      if (!branchMap.has(branchName)) return;
      
      // Skip "ACCOUNT COLLECTION" and "CLOSED" entries
      const status = cust["STATUS"]?.trim().toUpperCase();
      if (status === "ACCOUNT COLLECTION" || status === "CLOSED") {
        return;
      }
      
      // Parse NET_DUE and OLD_DUE values - handle commas in the numbers
      const netDueStr = (cust["NET DUE"] || "0").toString().replace(/,/g, '');
      const oldDueStr = (cust["OLD DUE"] || "0").toString().replace(/,/g, '');
      
      const netDue = parseFloat(netDueStr) || 0;
      const oldDue = parseFloat(oldDueStr) || 0;
      
      // Check if this customer has an allocation
      const allocEmpId = cust["Allocation 1 emp id"]?.trim();
      
      // Skip empty, "ACCOUNT COLLECTION" or "CLOSED" allocations
      if (!allocEmpId || allocEmpId === "ACCOUNT COLLECTION" || allocEmpId === "CLOSED") {
        return;
      }
      
      // Look up the real employee for this allocation
      const matchedEmployee = allocationToEmployeeMap.get(allocEmpId);
      
      // Only process if we found a real employee
      if (matchedEmployee) {
        const branchSummary = branchMap.get(branchName);
        
        // Track this LD as allocated
        branchSummary.allocatedLDs.add(ld);
        
        // Count this customer
        branchSummary.CUST += 1;
        
        // Add this employee to the branch's unique employee set
        branchEmployees.get(branchName).add(matchedEmployee._id.toString());
        
        // Update financial metrics
        branchSummary.OLD_DUE_AMT += oldDue;
        branchSummary.NET_DUE_AMT += netDue;
        
        if (netDue > 0) {
          branchSummary.NET_DUE_COUNT += 1;
          branchSummary.pendingLDs.add(ld);
        }
        
        if (netDue === 0) {
          branchSummary.ZERO_COUNT += 1;
        }
        
        if (oldDue === 0 && netDue > 0) {
          branchSummary.BCT_X_COUNT += 1;
          branchSummary.BCT_X_AMT += netDue;
        }
      }
    });

    // Update employee count for each branch
    branchEmployees.forEach((empSet, branchName) => {
      if (branchMap.has(branchName)) {
        branchMap.get(branchName).TE = empSet.size;
      }
    });

    // STEP 8: Process monthly historical data
    monthlyVisits.forEach(visit => {
      if (visit.LD) monthlyVisitedLDs.add(visit.LD);
    });
    
    monthlyCollections.forEach(col => {
      if (col.LD) monthlyVisitedLDs.add(col.LD);
    });

    // STEP 9: Process visit data - only count visits for allocated LDs
    visits.forEach((visit) => {
      const ld = visit.LD;
      if (!ld) return;
      
      // Mark this LD as visited
      visitedLDs.add(ld);
      
      const branchName = ldToBranchMap.get(ld);
      if (!branchName || !branchMap.has(branchName)) return;
      
      // Skip if branch filtering is active and this branch is not in the filter
      if (filteredBranchNames.length > 0 && !filteredBranchNames.includes(branchName)) {
        return;
      }
      
      // Only count visits for allocated LDs
      if (!branchMap.get(branchName).allocatedLDs.has(ld)) return;

      // Get branch summary
      const summary = branchMap.get(branchName);
      
      // Increment TV count (Total Visits)
      branchVisitCounts.set(branchName, branchVisitCounts.get(branchName) + 1);

      // Count today's FIRST visits in this month (TFV)
      const isToday = moment(visit.createdAt).isSame(moment(), 'day');
      if (isToday && !monthlyVisitedLDs.has(ld)) {
        summary.TFV += 1;
        monthlyVisitedLDs.add(ld);
      }
    });

    // STEP 10: Process collection data - only count collections for allocated LDs
    collections.forEach((col) => {
      const ld = col.LD;
      if (!ld) return;
      
      const branchName = ldToBranchMap.get(ld);
      if (!branchName || !branchMap.has(branchName)) return;
      
      // Skip if branch filtering is active and this branch is not in the filter
      if (filteredBranchNames.length > 0 && !filteredBranchNames.includes(branchName)) {
        return;
      }
      
      // Only count collections for allocated LDs
      if (!branchMap.get(branchName).allocatedLDs.has(ld)) return;

      // Get branch summary
      const summary = branchMap.get(branchName);
      
      // Process today's collections (TR_COUNT, TR_AMT)
      const isToday = moment(col.createdAt).isSame(moment(), 'day');
      if (isToday) {
        const amount = parseFloat(col.receivedAmount) || 0;
        summary.TR_COUNT += 1;
        summary.TR_AMT += amount;
      }
    });

    // STEP 11: Calculate final metrics for each branch
    branchMap.forEach((summary, branchName) => {
      // Remove visited LDs from pending
      visitedLDs.forEach(ld => {
        summary.pendingLDs.delete(ld);
      });
      
      // VP = Count of allocated LDs with NET_DUE > 0 that haven't been visited
      summary.VP = summary.pendingLDs.size;
      
      // TV = Total visits from visit model
      summary.TV = branchVisitCounts.get(branchName) || 0;
      
      // Remove the temporary sets
      delete summary.pendingLDs;
      delete summary.allocatedLDs;
    });

    // Filter out any branches with empty names or no allocated customers
    Array.from(branchMap.keys()).forEach(branchName => {
      if (!branchName.trim() || branchMap.get(branchName).CUST === 0) {
        branchMap.delete(branchName);
      }
    });

    // STEP 12: Convert to array, sort, and paginate
    const allSummaries = Array.from(branchMap.values()).sort((a, b) => b.CUST - a.CUST);
    const totalRecords = allSummaries.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedSummaries = allSummaries.slice(skip, skip + limitNum);

    // STEP 13: Calculate grand totals
    const summaryTotalCount = {
      CUST: allSummaries.reduce((sum, branch) => sum + branch.CUST, 0),
      TE: allSummaries.reduce((sum, branch) => sum + branch.TE, 0),
      NET_DUE_COUNT: allSummaries.reduce((sum, branch) => sum + branch.NET_DUE_COUNT, 0),
      ZERO_COUNT: allSummaries.reduce((sum, branch) => sum + branch.ZERO_COUNT, 0),
      OLD_DUE_AMT: allSummaries.reduce((sum, branch) => sum + branch.OLD_DUE_AMT, 0),
      NET_DUE_AMT: allSummaries.reduce((sum, branch) => sum + branch.NET_DUE_AMT, 0),
      BCT_X_COUNT: allSummaries.reduce((sum, branch) => sum + branch.BCT_X_COUNT, 0),
      BCT_X_AMT: allSummaries.reduce((sum, branch) => sum + branch.BCT_X_AMT, 0),
      VP: allSummaries.reduce((sum, branch) => sum + branch.VP, 0),
      TFV: allSummaries.reduce((sum, branch) => sum + branch.TFV, 0),
      TV: allSummaries.reduce((sum, branch) => sum + branch.TV, 0),
      TR_COUNT: allSummaries.reduce((sum, branch) => sum + branch.TR_COUNT, 0),
      TR_AMT: allSummaries.reduce((sum, branch) => sum + branch.TR_AMT, 0)
    };
    
    // STEP 14: Prepare pagination info
    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      totalRecords,
      recordsPerPage: limitNum
    };
    
    // Return formatted response
    return success(res, "Branch summary retrieved successfully", {
      branches: paginatedSummaries,
      pagination,
      summaryTotalCount,
      filters: { branchId, regionalBranchId, startDate, endDate }
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}
  
// -----------** REPORTING MANAGER WISE DASHBOARD DATA **----------------
async function managerWiseTable(req, res) {
  try {
    let { 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50,
      reportingManagerId = "all",
      branchId = "all",
      regionalBranchId = "all"
    } = req.query;
    
    const tokenId = new ObjectId(req.Id);
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Date normalization
    startDate = startDate ? moment(startDate).startOf('day').toISOString() : moment().startOf('day').toISOString();
    endDate = endDate ? moment(endDate).endOf('day').toISOString() : moment().endOf('day').toISOString();

    // Get current month start/end for monthly tracking
    const currentMonthStart = moment().startOf('month').toISOString();
    const todayStart = moment().startOf('day').toISOString();
    const todayEnd = moment().endOf('day').toISOString();

    const employeeData = await employeModel.findOne({ _id: tokenId }, { _id: 1 }).lean();
    if (!employeeData) return notFound(res, "Employee not found");

    // Fetch Google Sheet data first to get the list of allocated employees
    const { rawData: googleCustomers } = await getGoogleSheetData();
    
    // Extract all unique allocated employee IDs from sheet
    const allocatedEmployeeIdsSet = new Set();
    googleCustomers.forEach(cust => {
      const allocEmpId = cust["Allocation 1 emp id"]?.trim();
      // Skip ACCOUNT COLLECTION and CLOSED entries
      if (!allocEmpId || allocEmpId === "ACCOUNT COLLECTION" || allocEmpId === "CLOSED") {
        return;
      }
      allocatedEmployeeIdsSet.add(allocEmpId);
    });
    
    // Convert to array for later use
    const allocatedEmployeeIds = Array.from(allocatedEmployeeIdsSet);
    
    // Get all active employees from database
    const allEmployees = await employeModel.find({
      status: "active"
    }).lean();
    
    // Create maps for matching employees in different formats
    const employeesByID = new Map();
    const employeesByAllocationID = new Map();
    const employeesByVisitID = new Map(); // New map for tracking visit IDs
    const employeeIdToManager = new Map(); // Map to link employee to manager
    
    // Map all employees by their unique ID
    allEmployees.forEach(emp => {
      if (emp.employeUniqueId) {
        employeesByID.set(emp.employeUniqueId.toLowerCase(), emp);
        
        // Track employee to manager relationship if manager exists
        if (emp.reportingManagerId) {
          employeeIdToManager.set(emp._id.toString(), emp.reportingManagerId.toString());
          employeeIdToManager.set(emp.employeUniqueId.toLowerCase(), emp.reportingManagerId.toString());
          
          // Store the visit format used in visitBy field
          if (emp.employeName) {
            const visitFormat = `${emp.employeName.toLowerCase()}-${emp.employeUniqueId.toLowerCase()}`;
            employeesByVisitID.set(visitFormat, emp);
            employeeIdToManager.set(visitFormat, emp.reportingManagerId.toString());
          }
        }
      }
    });
    
    // Match allocated employees to database records using improved matching
    allocatedEmployeeIds.forEach(allocID => {
      // Skip ACCOUNT COLLECTION and CLOSED
      if (!allocID || allocID === "ACCOUNT COLLECTION" || allocID === "CLOSED") {
        return;
      }
      
      // Try to find matching employee using precise ID matching
      let matchedEmployee = null;
      
      for (const [empUniqueId, emp] of employeesByID.entries()) {
        // Try exact match on the unique ID
        if (allocID.toLowerCase() === empUniqueId.toLowerCase()) {
          matchedEmployee = emp;
          break;
        }
        
        // Try matching with word boundaries
        const idPattern = new RegExp(`\\b${escapeRegExp(empUniqueId)}\\b`, 'i');
        if (idPattern.test(allocID)) {
          matchedEmployee = emp;
          break;
        }
        
        // Check for ID at end of string
        if (allocID.toLowerCase().endsWith(empUniqueId.toLowerCase())) {
          // Get the character before the ID start
          const beforeIdChar = allocID.toLowerCase().charAt(
            allocID.toLowerCase().length - empUniqueId.length - 1
          );
          
          // Only match if the character before is a separator (like dash or space)
          if (beforeIdChar === '-' || beforeIdChar === ' ') {
            matchedEmployee = emp;
            break;
          }
        }
      }
      
      // If we found a match, store it
      if (matchedEmployee) {
        employeesByAllocationID.set(allocID, matchedEmployee);
      }
    });
    
    // Get all managers from the database
    let managersQuery = {};
    
    // Add reportingManagerId filter if provided
    if (reportingManagerId !== "all") {
      try {
        managersQuery._id = new ObjectId(reportingManagerId);
      } catch (err) {
        return badRequest(res, "Invalid reportingManagerId format");
      }
    }
    
    // Get all managers with active status
    const allManagers = await employeModel.find(managersQuery).lean();
    
    // Get list of manager IDs
    const managerIds = allManagers.map(manager => manager._id.toString());
    
    // Fetch manager data with proper branch information
    const managerData = new Map();
    for (const manager of allManagers) {
      const managerId = manager._id.toString();
      
      // Get branch name - still retrieve branch name for display purposes
      let branchName = "";
      if (manager.branchId) {
        const branch = await newbranch.findById(manager.branchId);
        if (branch?.name) {
          branchName = branch.name;
        }
      }

      managerData.set(managerId, {
        managerName: manager.employeName || "",
        employeUniqueId: manager.employeUniqueId || "",
        branchId: manager.branchId || null,
        branchName: branchName
      });
    }
    
    // Fetch remaining required data
    const [
      visits, 
      collections,
      monthlyVisits,
      monthlyCollections
    ] = await Promise.all([
      visitModel.find({
        status: "accept",
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).lean(),
      collectionModel.find({
        status: "accept",
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).lean(),
      visitModel.find({
        status: "accept",
        createdAt: { 
          $gte: new Date(currentMonthStart), 
          $lt: new Date(todayStart) 
        }
      }).lean(),
      collectionModel.find({
        status: "accept",
        createdAt: { 
          $gte: new Date(currentMonthStart), 
          $lt: new Date(todayStart)
        }
      }).lean()
    ]);

    // Create maps for faster lookups
    const ldToBranchMap = new Map();
    const ldToManager = new Map();
    const managerMap = new Map();
    const visitedLDs = new Set();
    const monthlyVisitedLDs = new Set();
    const managerVisitCounts = new Map();
    
    // Track allocated employees per manager (based on reporting relationships)
    const managerAllocatedEmployees = new Map();
    managerIds.forEach(id => managerAllocatedEmployees.set(id, new Set()));
    
    // Create additional maps for tracking visits by employee
    const visitsByEmployee = new Map(); // Track visits by employee
    const employeeToVisitCountMap = new Map(); // Track visit counts by employee

    // Create empty summary for each manager
    for (const managerId of managerIds) {
      if (managerData.has(managerId)) {
        const manager = managerData.get(managerId);
        
        managerMap.set(managerId, {
          branchName: manager.branchName || "",
          branchId: manager.branchId ? manager.branchId.toString() : "",
          managerName: manager.managerName || "",
          managerId: managerId,
          CUST: 0,
          TE: 0, // Will be calculated from allocated employees only
          NET_DUE_COUNT: 0,
          ZERO_COUNT: 0,
          OLD_DUE_AMT: 0,
          NET_DUE_AMT: 0,
          BCT_X_COUNT: 0,
          BCT_X_AMT: 0,
          VP: 0,
          TFV: 0,
          TV: 0,
          TR_COUNT: 0,
          TR_AMT: 0,
          pendingLDs: new Set(),
          allocatedLDs: new Set()
        });
        
        managerVisitCounts.set(managerId, 0);
      }
    }
    
    // Build a map from allocation ID to manager ID
    const employeeToManagerMap = new Map();
    const allocatedEmployeeObjects = [];
    
    // From the matched employees, find which ones are allocated in the sheet
    employeesByAllocationID.forEach((emp, allocId) => {
      if (emp.reportingManagerId) {
        const managerId = emp.reportingManagerId.toString();
        
        // Store this mapping for later use
        employeeToManagerMap.set(emp._id.toString(), managerId);
        
        if (emp.employeUniqueId) {
          employeeToManagerMap.set(emp.employeUniqueId.toLowerCase(), managerId);
        }
        
        // Store the allocation ID mapping
        employeeToManagerMap.set(allocId.toLowerCase(), managerId);
        
        // Also track the employee for counting purposes
        allocatedEmployeeObjects.push(emp);
        
        // Add to manager's allocated employees set
        if (managerAllocatedEmployees.has(managerId)) {
          managerAllocatedEmployees.get(managerId).add(emp._id.toString());
        }
      }
    });

    // Process customer data - only count customers with allocations
    googleCustomers.forEach((cust) => {
      const ld = cust["LD"];
      if (!ld) return;
      
      const rawBranchName = cust["BRANCH"]?.trim() || "";
      if (!rawBranchName) return;
      
      const branchNameFromSheet = rawBranchName.toUpperCase();
      ldToBranchMap.set(ld, branchNameFromSheet);
      
      // Parse numeric fields - handle commas in the numbers
      const netDueStr = (cust["NET DUE"] || "0").toString().replace(/,/g, '');
      const oldDueStr = (cust["OLD DUE"] || "0").toString().replace(/,/g, '');
      
      const netDue = parseFloat(netDueStr) || 0;
      const oldDue = parseFloat(oldDueStr) || 0;
      
      // Get allocation employee ID - exactly as it appears in sheet
      const allocEmpId = cust["Allocation 1 emp id"]?.trim();
      
      // Skip ACCOUNT COLLECTION and CLOSED entries
      if (!allocEmpId || allocEmpId === "ACCOUNT COLLECTION" || allocEmpId === "CLOSED") {
        return;
      }
      
      // Try to find manager for this allocated employee
      let managerId = employeeToManagerMap.get(allocEmpId.toLowerCase());
      
      // If not found directly, try using the matched employee from previous step
      if (!managerId) {
        const matchedEmployee = employeesByAllocationID.get(allocEmpId);
        if (matchedEmployee && matchedEmployee.reportingManagerId) {
          managerId = matchedEmployee.reportingManagerId.toString();
        } else {
          // If still not found, try precise ID matching with employees
          for (const emp of allocatedEmployeeObjects) {
            if (emp.employeUniqueId) {
              // Use word boundary matching
              const idPattern = new RegExp(`\\b${escapeRegExp(emp.employeUniqueId)}\\b`, 'i');
              if (idPattern.test(allocEmpId)) {
                if (emp.reportingManagerId) {
                  managerId = emp.reportingManagerId.toString();
                  break;
                }
              }
              
              // Check for ID at the end of string
              if (allocEmpId.toLowerCase().endsWith(emp.employeUniqueId.toLowerCase())) {
                const beforeIdChar = allocEmpId.toLowerCase().charAt(
                  allocEmpId.toLowerCase().length - emp.employeUniqueId.length - 1
                );
                if (beforeIdChar === '-' || beforeIdChar === ' ') {
                  if (emp.reportingManagerId) {
                    managerId = emp.reportingManagerId.toString();
                    break;
                  }
                }
              }
            }
          }
        }
      }
      
      // If manager not found or not in our filtered list, skip this customer
      if (!managerId || !managerMap.has(managerId)) return;
      
      // Link LD to manager
      ldToManager.set(ld, managerId);
      
      // Update manager summary
      const managerSummary = managerMap.get(managerId);
      
      // Track allocated LD
      managerSummary.allocatedLDs.add(ld);
      
      // Update counts
      managerSummary.CUST += 1;
      managerSummary.OLD_DUE_AMT += oldDue;
      managerSummary.NET_DUE_AMT += netDue;
      
      if (netDue > 0) {
        managerSummary.NET_DUE_COUNT += 1;
        managerSummary.pendingLDs.add(ld);
      }
      
      if (netDue === 0) {
        managerSummary.ZERO_COUNT += 1;
      }
      
      if (oldDue === 0 && netDue > 0) {
        managerSummary.BCT_X_COUNT += 1;
        managerSummary.BCT_X_AMT += netDue;
      }
    });

    // Count employees who have allocations in the sheet for each manager
    managerIds.forEach(managerId => {
      if (managerMap.has(managerId) && managerAllocatedEmployees.has(managerId)) {
        const allocatedEmployeeCount = managerAllocatedEmployees.get(managerId).size;
        managerMap.get(managerId).TE = allocatedEmployeeCount;
      }
    });

    // Track all LDs already visited from earlier in the month
    monthlyVisits.forEach(visit => {
      if (visit.LD) monthlyVisitedLDs.add(visit.LD);
    });
    
    monthlyCollections.forEach(col => {
      if (col.LD) monthlyVisitedLDs.add(col.LD);
    });

    // Process visit data - improved to count both allocation-based and direct visits
    visits.forEach((visit) => {
      const ld = visit.LD;
      if (!ld) return;
      
      // Mark this LD as visited
      visitedLDs.add(ld);
      
      let countedForManager = false;
      
      // Method 1: Count visit based on LD allocation (customer assigned to manager's team)
      const managerId = ldToManager.get(ld);
      if (managerId && managerMap.has(managerId)) {
        // Only count visits for allocated LDs
        if (managerMap.get(managerId).allocatedLDs.has(ld)) {
          // Increment TV count for this manager and get the summary
          managerVisitCounts.set(managerId, (managerVisitCounts.get(managerId) || 0) + 1);
          const summary = managerMap.get(managerId);

          // Count today's FIRST visits in this month
          const isToday = moment(visit.createdAt).isSame(moment(), 'day');
          if (isToday && !monthlyVisitedLDs.has(ld)) {
            summary.TFV += 1;
            monthlyVisitedLDs.add(ld);
          }
          
          countedForManager = true;
        }
      }
      
      // Method 2: Count visit based on who actually made the visit (visitBy field)
      if (visit.visitBy) {
        const visitByLower = visit.visitBy.toLowerCase();
        let visitByEmpId = null;
        let visitByManagerId = null;
        
        // Try to match the visitBy string to an employee and then to a manager
        
        // First try direct lookup in our visit format map
        const matchedEmployee = employeesByVisitID.get(visitByLower);
        if (matchedEmployee && matchedEmployee.reportingManagerId) {
          visitByManagerId = matchedEmployee.reportingManagerId.toString();
        } else {
          // Try to match by employee ID pattern and then find their manager
          for (const emp of allEmployees) {
            if (emp.employeUniqueId && emp.reportingManagerId) {
              const idPattern = new RegExp(`\\b${escapeRegExp(emp.employeUniqueId)}\\b`, 'i');
              if (idPattern.test(visitByLower)) {
                visitByManagerId = emp.reportingManagerId.toString();
                break;
              }
              
              // Check for ID at end of string
              if (visitByLower.endsWith(emp.employeUniqueId.toLowerCase())) {
                const beforeIdChar = visitByLower.charAt(
                  visitByLower.length - emp.employeUniqueId.length - 1
                );
                if (beforeIdChar === '-' || beforeIdChar === ' ') {
                  visitByManagerId = emp.reportingManagerId.toString();
                  break;
                }
              }
            }
          }
        }
        
        // If we found the manager for who made the visit
        if (visitByManagerId && managerMap.has(visitByManagerId) && 
            (!countedForManager || visitByManagerId !== managerId)) {
          // This is a direct visit by an employee under this manager (not counted via allocation)
          managerVisitCounts.set(visitByManagerId, (managerVisitCounts.get(visitByManagerId) || 0) + 1);
          
          // Don't double-count for TFV, since it's allocation-based
        }
      }
    });

    // Process collection data - only count collections for allocated LDs
    collections.forEach((col) => {
      const ld = col.LD;
      if (!ld) return;
      
      // Get manager for this LD
      const managerId = ldToManager.get(ld);
      if (!managerId || !managerMap.has(managerId)) return;
      
      // Only count collections for allocated LDs
      if (!managerMap.get(managerId).allocatedLDs.has(ld)) return;

      const summary = managerMap.get(managerId);
      const isToday = moment(col.createdAt).isSame(moment(), 'day');
      
      if (isToday) {
        const amount = parseFloat(col.receivedAmount) || 0;
        summary.TR_COUNT += 1;
        summary.TR_AMT += amount;
      }
    });

    // Calculate VP and update TV for each manager
    managerMap.forEach((summary, managerId) => {
      // Remove visited LDs from pending
      visitedLDs.forEach(ld => {
        summary.pendingLDs.delete(ld);
      });
      
      // VP = count of pending LDs that haven't been visited
      summary.VP = summary.pendingLDs.size;
      
      // TV = count from visitModel
      summary.TV = managerVisitCounts.get(managerId) || 0;
      
      // Remove the temporary sets
      delete summary.pendingLDs;
      delete summary.allocatedLDs;
    });

    // Filter out any managers with no customers
    Array.from(managerMap.keys()).forEach(managerId => {
      const summary = managerMap.get(managerId);
      if (summary.CUST === 0) {
        managerMap.delete(managerId);
      }
    });

    // Clean up temporary data
    managerAllocatedEmployees.clear();

    // Convert to array and paginate
    const allSummaries = Array.from(managerMap.values()).sort((a, b) => b.CUST - a.CUST);
    const totalRecords = allSummaries.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedSummaries = allSummaries.slice(skip, skip + limitNum);

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      totalRecords,
      recordsPerPage: limitNum
    };

    // Calculate summaryTotalCount
    const summaryTotalCount = {
      CUST: allSummaries.reduce((sum, manager) => sum + manager.CUST, 0),
      TE: allSummaries.reduce((sum, manager) => sum + manager.TE, 0),
      NET_DUE_COUNT: allSummaries.reduce((sum, manager) => sum + manager.NET_DUE_COUNT, 0),
      ZERO_COUNT: allSummaries.reduce((sum, manager) => sum + manager.ZERO_COUNT, 0),
      OLD_DUE_AMT: allSummaries.reduce((sum, manager) => sum + manager.OLD_DUE_AMT, 0),
      NET_DUE_AMT: allSummaries.reduce((sum, manager) => sum + manager.NET_DUE_AMT, 0),
      BCT_X_COUNT: allSummaries.reduce((sum, manager) => sum + manager.BCT_X_COUNT, 0),
      BCT_X_AMT: allSummaries.reduce((sum, manager) => sum + manager.BCT_X_AMT, 0),
      VP: allSummaries.reduce((sum, manager) => sum + manager.VP, 0),
      TFV: allSummaries.reduce((sum, manager) => sum + manager.TFV, 0),
      TV: allSummaries.reduce((sum, manager) => sum + manager.TV, 0),
      TR_COUNT: allSummaries.reduce((sum, manager) => sum + manager.TR_COUNT, 0),
      TR_AMT: allSummaries.reduce((sum, manager) => sum + manager.TR_AMT, 0)
    };

    // Add filter information to the response
    const filters = {
      branchId,
      regionalBranchId,
      reportingManagerId,
      startDate,
      endDate
    };

    return success(res, "Manager summary retrieved successfully", {
      managers: paginatedSummaries,
      pagination,
      summaryTotalCount,
      filters
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}
  
// -----------** EMPLOYEE WISE VISIT AND EMI COLLECTION COUNT **-------------
async function employeeWiseTable(req, res) {
  try {
    let { 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20, 
      reportingManagerId = "all",
      branchId = "all",
      regionalBranchId = "all",
      employeeId = "all"
    } = req.query;
    
    const tokenId = new ObjectId(req.Id);
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Date normalization
    startDate = startDate ? moment(startDate).startOf('day').toISOString() : moment().startOf('day').toISOString();
    endDate = endDate ? moment(endDate).endOf('day').toISOString() : moment().endOf('day').toISOString();

    // Get current month start/end for monthly tracking
    const currentMonthStart = moment().startOf('month').toISOString();
    const todayStart = moment().startOf('day').toISOString();
    const todayEnd = moment().endOf('day').toISOString();

    const employeeData = await employeModel.findOne({ _id: tokenId }, { _id: 1 }).lean();
    if (!employeeData) return notFound(res, "Employee not found");

    // Get branches by regionalBranchId if specified
    let filteredBranchIds = [];
    if (regionalBranchId !== "all") {
      try {
        const regionalBranches = await newbranch.find({
          regionalBranchId: new ObjectId(regionalBranchId)
        }, { _id: 1 }).lean();
        
        filteredBranchIds = regionalBranches.map(branch => branch._id.toString());
        
        if (filteredBranchIds.length === 0) {
          return notFound(res, "No branches found for the specified regional branch");
        }
      } catch (err) {
        return badRequest(res, "Invalid regionalBranchId format");
      }
    }

    // First get all active employees from the database
    const allEmployees = await employeModel.find({ 
      status: "active" 
    }).lean();
    
    // Create maps for efficient lookups
    const employeeByIdMap = new Map();
    const employeeByUniqueIdMap = new Map();
    const employeeByVisitId = new Map(); // Map to track visit IDs
    
    allEmployees.forEach(emp => {
      // Store by MongoDB ObjectId
      employeeByIdMap.set(emp._id.toString(), emp);
      
      if (emp.employeUniqueId) {
        // Store by unique ID (case insensitive)
        employeeByUniqueIdMap.set(emp.employeUniqueId.toLowerCase(), emp);
      }
    });

    // Fetch Google Sheet data to get the list of employees
    const { rawData: googleCustomers } = await getGoogleSheetData();
    
    // Extract unique employee IDs from allocations that aren't "ACCOUNT COLLECTION"
    const allocationsMap = new Map(); // Maps allocation string to actual employee
    const allocatedEmployeeIds = new Set();
    
    googleCustomers.forEach(cust => {
      const allocEmpId = cust["Allocation 1 emp id"]?.trim();
      
      // Skip empty, "ACCOUNT COLLECTION" or "CLOSED" allocations
      if (!allocEmpId || allocEmpId === "ACCOUNT COLLECTION" || allocEmpId === "CLOSED") {
        return;
      }
      
      // Match the employee using strict ID matching
      let matchedEmployee = null;
      
      // Check if the allocation contains a valid employee unique ID
      for (const [empUniqueId, emp] of employeeByUniqueIdMap.entries()) {
        // First try exact match on the unique ID
        if (allocEmpId.toLowerCase() === empUniqueId.toLowerCase()) {
          matchedEmployee = emp;
          break;
        }
        
        // Try matching with word boundaries to ensure we match the whole ID
        // This handles formats like "name-ID" or "name - ID"
        const idPattern = new RegExp(`\\b${escapeRegExp(empUniqueId)}\\b`, 'i');
        if (idPattern.test(allocEmpId)) {
          matchedEmployee = emp;
          break;
        }
        
        // For IDs at the end of the string (without trailing word boundary)
        if (allocEmpId.toLowerCase().endsWith(empUniqueId.toLowerCase())) {
          // Get the character before the ID start
          const beforeIdChar = allocEmpId.toLowerCase().charAt(
            allocEmpId.toLowerCase().length - empUniqueId.length - 1
          );
          
          // Only match if the character before is a separator (like dash or space)
          if (beforeIdChar === '-' || beforeIdChar === ' ') {
            matchedEmployee = emp;
            break;
          }
        }
      }
      
      // If we found a match, store it
      if (matchedEmployee) {
        allocationsMap.set(allocEmpId, matchedEmployee);
        allocatedEmployeeIds.add(matchedEmployee._id.toString());
      }
    });
    
    // Base employee query - filter to only include those found in allocations
    const employeeQuery = {
      _id: { $in: Array.from(allocatedEmployeeIds).map(id => new ObjectId(id)) },
      status: "active"
    };

    // Add reportingManagerId filter if provided
    if (reportingManagerId !== "all") {
      try {
        employeeQuery.reportingManagerId = new ObjectId(reportingManagerId);
      } catch (err) {
        return badRequest(res, "Invalid reportingManagerId format");
      }
    }

    // Add branchId filter if provided
    if (branchId !== "all") {
      try {
        employeeQuery.branchId = new ObjectId(branchId);
      } catch (err) {
        return badRequest(res, "Invalid branchId format");
      }
    } else if (filteredBranchIds.length > 0) {
      // If regionalBranchId was specified, filter by the resulting branch IDs
      employeeQuery.branchId = { 
        $in: filteredBranchIds.map(id => new ObjectId(id)) 
      };
    }

    // Add employeeId filter if provided
    if (employeeId !== "all") {
      try {
        employeeQuery._id = new ObjectId(employeeId);
      } catch (err) {
        return badRequest(res, "Invalid employeeId format");
      }
    }

    // Get all employees that appear in the Google Sheet allocations
    const employees = await employeModel.find(employeeQuery).lean();
    if (!employees.length) {
      return notFound(res, "No employees found in the allocation sheet with the specified filters");
    }

    // Get all manager and branch data for employees
    const managerIds = employees
      .filter(emp => emp.reportingManagerId)
      .map(emp => emp.reportingManagerId);
    const branchIds = employees
      .filter(emp => emp.branchId)
      .map(emp => emp.branchId);

    // Fetch branch details
    const branches = await newbranch.find({
      _id: { $in: branchIds }
    }).lean();

    const branchMap = {};
    branches.forEach(branch => {
      branchMap[branch._id.toString()] = branch.name || "";
    });

    // Fetch manager details
    const managers = await employeModel.find({
      _id: { $in: managerIds }
    }).lean();

    const managerMap = {};
    managers.forEach(manager => {
      managerMap[manager._id.toString()] = manager.employeName || "";
    });

    // Fetch remaining required data
    const [
      visits, 
      collections,
      monthlyVisits,
      monthlyCollections
    ] = await Promise.all([
      visitModel.find({
        status: "accept",
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).lean(),
      collectionModel.find({
        status: "accept",
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).lean(),
      visitModel.find({
        status: "accept",
        createdAt: { 
          $gte: new Date(currentMonthStart), 
          $lt: new Date(todayStart) 
        }
      }).lean(),
      collectionModel.find({
        status: "accept",
        createdAt: { 
          $gte: new Date(currentMonthStart), 
          $lt: new Date(todayStart)
        }
      }).lean()
    ]);

    // Create maps for faster lookups
    const ldToBranchMap = new Map();
    const ldToEmpMap = new Map();
    const employeeMap = new Map();
    const visitedLDs = new Set();
    const monthlyVisitedLDs = new Set();
    const employeeVisitCounts = new Map();
    const visitsByEmployee = new Map(); // Track visits by employee ID
    
    // Create a reverse lookup map from allocation string to employee ID
    const allocationToEmployeeMap = new Map();
    
    // Initialize employee summary objects
    employees.forEach(emp => {
      const empId = emp._id.toString();
      
      // Create a summary object for each employee
      employeeMap.set(empId, {
        employeeId: empId,
        employeeName: emp.employeName || "",
        employeeUniqueId: emp.employeUniqueId || "",
        branchName: branchMap[emp.branchId ? emp.branchId.toString() : ""] || "",
        managerName: managerMap[emp.reportingManagerId ? emp.reportingManagerId.toString() : ""] || "",
        CUST: 0,
        TE: 1, // Always 1 for employee-level reports
        NET_DUE_COUNT: 0,
        ZERO_COUNT: 0,
        OLD_DUE_AMT: 0,
        NET_DUE_AMT: 0,
        BCT_X_COUNT: 0,
        BCT_X_AMT: 0,
        VP: 0,
        TFV: 0,
        TV: 0,
        TR_COUNT: 0,
        TR_AMT: 0,
        pendingLDs: new Set(),
        allocatedLDs: new Set()
      });
      
      employeeVisitCounts.set(empId, 0);
      visitsByEmployee.set(empId, new Set()); // Initialize empty set to track visit IDs
      
      // Build allocation matching patterns
      if (emp.employeUniqueId) {
        const empUniqueId = emp.employeUniqueId.toLowerCase();
        
        // Store exact ID match
        allocationToEmployeeMap.set(empUniqueId, empId);
        
        // Store name-ID combinations if name exists
        if (emp.employeName) {
          const fullName = emp.employeName.toLowerCase();
          const firstName = fullName.split(' ')[0];
          
          // Common allocation formats
          allocationToEmployeeMap.set(`${fullName}-${empUniqueId}`, empId);
          allocationToEmployeeMap.set(`${firstName}-${empUniqueId}`, empId);
          allocationToEmployeeMap.set(`${fullName} - ${empUniqueId}`, empId);
          allocationToEmployeeMap.set(`${firstName} - ${empUniqueId}`, empId);
          
          // Also store the format exactly as it appears in visitBy field
          const visitFormat = `${emp.employeName.toLowerCase()}-${empUniqueId}`;
          employeeByVisitId.set(visitFormat, empId);
        }
      }
    });

    // Process customer data - only count customers with allocations
    googleCustomers.forEach((cust) => {
      const ld = cust["LD"];
      if (!ld) return;
      
      const rawBranchName = cust["BRANCH"]?.trim() || "";
      if (!rawBranchName) return;
      
      const branchName = rawBranchName.toUpperCase();
      ldToBranchMap.set(ld, branchName);
      
      // Parse numeric fields - handle commas in the numbers
      const netDueStr = (cust["NET DUE"] || "0").toString().replace(/,/g, '');
      const oldDueStr = (cust["OLD DUE"] || "0").toString().replace(/,/g, '');
      
      const netDue = parseFloat(netDueStr) || 0;
      const oldDue = parseFloat(oldDueStr) || 0;
      
      // Get allocation employee ID - exactly as it appears in sheet
      const allocEmpId = cust["Allocation 1 emp id"]?.trim();
      
      // Skip ACCOUNT COLLECTION
      if (!allocEmpId || allocEmpId === "ACCOUNT COLLECTION" || allocEmpId === "CLOSED") {
        return;
      }
      
      // Find the matching employee using strict matching
      let matchedEmployeeId = null;
      
      // Use the pre-processed allocation map first
      const matchedEmployee = allocationsMap.get(allocEmpId);
      if (matchedEmployee) {
        matchedEmployeeId = matchedEmployee._id.toString();
      } else {
        // If not in our map, try exact lookup by ID
        const allocLower = allocEmpId.toLowerCase();
        
        // Check direct match in our pattern map
        if (allocationToEmployeeMap.has(allocLower)) {
          matchedEmployeeId = allocationToEmployeeMap.get(allocLower);
        } else {
          // Last resort - try to extract ID and match
          for (const emp of employees) {
            if (emp.employeUniqueId) {
              const idPattern = new RegExp(`\\b${escapeRegExp(emp.employeUniqueId)}\\b`, 'i');
              if (idPattern.test(allocEmpId)) {
                matchedEmployeeId = emp._id.toString();
                break;
              }
              
              // Check for ID at end of string
              if (allocEmpId.toLowerCase().endsWith(emp.employeUniqueId.toLowerCase())) {
                const beforeIdChar = allocEmpId.toLowerCase().charAt(
                  allocEmpId.toLowerCase().length - emp.employeUniqueId.length - 1
                );
                if (beforeIdChar === '-' || beforeIdChar === ' ') {
                  matchedEmployeeId = emp._id.toString();
                  break;
                }
              }
            }
          }
        }
      }
      
      // If no employee matched, skip this customer
      if (!matchedEmployeeId || !employeeMap.has(matchedEmployeeId)) {
        return;
      }
      
      // Link LD to employee
      ldToEmpMap.set(ld, matchedEmployeeId);
      
      // Update employee data
      const empSummary = employeeMap.get(matchedEmployeeId);
      
      // Track allocated LD
      empSummary.allocatedLDs.add(ld);
      
      // Update counts
      empSummary.CUST += 1;
      empSummary.OLD_DUE_AMT += oldDue;
      empSummary.NET_DUE_AMT += netDue;
      
      if (netDue > 0) {
        empSummary.NET_DUE_COUNT += 1;
        empSummary.pendingLDs.add(ld);
      }
      
      if (netDue === 0) {
        empSummary.ZERO_COUNT += 1;
      }
      
      if (oldDue === 0 && netDue > 0) {
        empSummary.BCT_X_COUNT += 1;
        empSummary.BCT_X_AMT += netDue;
      }
    });

    // Track all LDs already visited from earlier in the month
    monthlyVisits.forEach(visit => {
      if (visit.LD) monthlyVisitedLDs.add(visit.LD);
    });
    
    monthlyCollections.forEach(col => {
      if (col.LD) monthlyVisitedLDs.add(col.LD);
    });

    // Process visit data - FIXED to avoid double-counting
    visits.forEach((visit) => {
      const ld = visit.LD;
      if (!ld) return;
      
      // Mark this LD as visited
      visitedLDs.add(ld);
      
      // Create a unique identifier for this visit
      const visitId = visit._id.toString();
      
      // Find the employee who made the visit
      let visitByEmpId = null;
      if (visit.visitBy) {
        const visitByLower = visit.visitBy.toLowerCase();
        
        // Try direct lookup in our visit format map
        if (employeeByVisitId.has(visitByLower)) {
          visitByEmpId = employeeByVisitId.get(visitByLower);
        } else {
          // Try to extract the employee ID using regex
          for (const emp of employees) {
            if (emp.employeUniqueId) {
              const idPattern = new RegExp(`\\b${escapeRegExp(emp.employeUniqueId)}\\b`, 'i');
              if (idPattern.test(visitByLower)) {
                visitByEmpId = emp._id.toString();
                break;
              }
              
              // Check for ID at end of string
              if (visitByLower.endsWith(emp.employeUniqueId.toLowerCase())) {
                const beforeIdChar = visitByLower.charAt(
                  visitByLower.length - emp.employeUniqueId.length - 1
                );
                if (beforeIdChar === '-' || beforeIdChar === ' ') {
                  visitByEmpId = emp._id.toString();
                  break;
                }
              }
            }
          }
        }
      }
      
      // Find the employee who is allocated this LD
      const allocatedEmpId = ldToEmpMap.get(ld);
      
      // PRIORITY 1: If visit was made by an employee in our filtered list, count it for them
      if (visitByEmpId && employeeMap.has(visitByEmpId)) {
        // Make sure we don't double-count (using our visit tracking Set)
        if (!visitsByEmployee.get(visitByEmpId).has(visitId)) {
          visitsByEmployee.get(visitByEmpId).add(visitId);
          employeeVisitCounts.set(visitByEmpId, (employeeVisitCounts.get(visitByEmpId) || 0) + 1);
          
          // Count today's FIRST visits in this month
          const isToday = moment(visit.createdAt).isSame(moment(), 'day');
          if (isToday && !monthlyVisitedLDs.has(ld)) {
            employeeMap.get(visitByEmpId).TFV += 1;
            monthlyVisitedLDs.add(ld);
          }
        }
      }
      
      // PRIORITY 2: If the LD is allocated to a different employee, don't count it again
      // We're only counting visits made BY the employee, not visits to their allocated customers
      // This prevents double-counting and matches the database
    });

    // Process collection data - handle format in collectedBy field
    collections.forEach((col) => {
      const ld = col.LD;
      if (!ld) return;
      
      const isToday = moment(col.createdAt).isSame(moment(), 'day');
      if (!isToday) return; // Only process today's collections for TR_COUNT and TR_AMT
      
      const amount = parseFloat(col.receivedAmount) || 0;
      
      // Try to find employee by collector ID
      let matchedEmpId = null;
      
      if (col.collectedBy) {
        const collectorId = col.collectedBy.trim();
        
        // Skip if ACCOUNT COLLECTION
        if (collectorId === "ACCOUNT COLLECTION" || collectorId === "CLOSED") {
          return;
        }
        
        // Find matching employee using strict matching
        // Check if this collector ID matches any of our employees
        const matchedEmployee = allocationsMap.get(collectorId);
        if (matchedEmployee) {
          matchedEmpId = matchedEmployee._id.toString();
        } else {
          // Try to match by employee unique ID using regex
          for (const emp of employees) {
            if (emp.employeUniqueId) {
              const idPattern = new RegExp(`\\b${escapeRegExp(emp.employeUniqueId)}\\b`, 'i');
              if (idPattern.test(collectorId)) {
                matchedEmpId = emp._id.toString();
                break;
              }
              
              // Check for ID at end of string
              if (collectorId.toLowerCase().endsWith(emp.employeUniqueId.toLowerCase())) {
                const beforeIdChar = collectorId.toLowerCase().charAt(
                  collectorId.toLowerCase().length - emp.employeUniqueId.length - 1
                );
                if (beforeIdChar === '-' || beforeIdChar === ' ') {
                  matchedEmpId = emp._id.toString();
                  break;
                }
              }
            }
          }
        }
        
        // If we found a match, assign the collection to that employee
        if (matchedEmpId && employeeMap.has(matchedEmpId)) {
          const summary = employeeMap.get(matchedEmpId);
          summary.TR_COUNT += 1;
          summary.TR_AMT += amount;
          return;
        }
      }
      
      // Fallback to LD-based assignment
      const empId = ldToEmpMap.get(ld);
      if (empId && employeeMap.has(empId)) {
        // Only count collections for allocated LDs
        if (employeeMap.get(empId).allocatedLDs.has(ld)) {
          const summary = employeeMap.get(empId);
          summary.TR_COUNT += 1;
          summary.TR_AMT += amount;
        }
      }
    });

    // Calculate VP and update TV for each employee
    employeeMap.forEach((summary) => {
      // Remove visited LDs from pending
      visitedLDs.forEach(ld => {
        summary.pendingLDs.delete(ld);
      });
      
      // VP = count of pending LDs that haven't been visited
      summary.VP = summary.pendingLDs.size;
      
      // TV = count from visitModel
      summary.TV = employeeVisitCounts.get(summary.employeeId) || 0;
      
      // Remove the temporary sets
      delete summary.pendingLDs;
      delete summary.allocatedLDs;
    });

    // Filter out any employees with empty branch names or no customers
    Array.from(employeeMap.keys()).forEach(empId => {
      const summary = employeeMap.get(empId);
      if (!summary.branchName.trim() || summary.CUST === 0) {
        employeeMap.delete(empId);
      }
    });

    // Convert to array and paginate
    const allSummaries = Array.from(employeeMap.values()).sort((a, b) => b.CUST - a.CUST);
    const totalRecords = allSummaries.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedSummaries = allSummaries.slice(skip, skip + limitNum);

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      totalRecords,
      recordsPerPage: limitNum
    };

    // Calculate summaryTotalCount
    const summaryTotalCount = {
      CUST: allSummaries.reduce((sum, emp) => sum + emp.CUST, 0),
      TE: allSummaries.reduce((sum, emp) => sum + emp.TE, 0),
      NET_DUE_COUNT: allSummaries.reduce((sum, emp) => sum + emp.NET_DUE_COUNT, 0),
      ZERO_COUNT: allSummaries.reduce((sum, emp) => sum + emp.ZERO_COUNT, 0),
      OLD_DUE_AMT: allSummaries.reduce((sum, emp) => sum + emp.OLD_DUE_AMT, 0),
      NET_DUE_AMT: allSummaries.reduce((sum, emp) => sum + emp.NET_DUE_AMT, 0),
      BCT_X_COUNT: allSummaries.reduce((sum, emp) => sum + emp.BCT_X_COUNT, 0),
      BCT_X_AMT: allSummaries.reduce((sum, emp) => sum + emp.BCT_X_AMT, 0),
      VP: allSummaries.reduce((sum, emp) => sum + emp.VP, 0),
      TFV: allSummaries.reduce((sum, emp) => sum + emp.TFV, 0),
      TV: allSummaries.reduce((sum, emp) => sum + emp.TV, 0),
      TR_COUNT: allSummaries.reduce((sum, emp) => sum + emp.TR_COUNT, 0),
      TR_AMT: allSummaries.reduce((sum, emp) => sum + emp.TR_AMT, 0)
    };

    // Add filter information to the response
    const filters = {
      branchId,
      regionalBranchId,
      reportingManagerId,
      employeeId,
      startDate,
      endDate
    };

    return success(res, "Employee summary retrieved successfully", {
      employees: paginatedSummaries,
      pagination,
      summaryTotalCount,
      filters
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
  
  async function getCustomerAllocationsForEmployees(employeeIds) {
    try {
      const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
      const sheetName = process.env.EMIOVERALL_SHEET;
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
      });
  
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in Google Sheet.');
        return {};
      }
  
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
      });
  
      const allocationFields = [
        'Allocation 1 emp id',
        'Allocation 2 emp id',
        'Allocation 3 emp id',
        'Allocation 4 emp id',
      ];
  
      // Count customers for each employee
      const customerCounts = {};
      
      // Initialize counts for all employees with zero
      employeeIds.forEach(empId => {
        customerCounts[empId.toUpperCase()] = 0;
      });
  
      // Count the allocations
      data.forEach(row => {
        // Only count rows with positive NET DUE (unless it's non-numeric)
        const netDue = parseFloat(row['NET DUE'] || 0);
        if (isNaN(netDue) || netDue > 0) {
          allocationFields.forEach(field => {
            if (row[field]) {
              // Clean up and normalize the employee ID for comparison
              const allocEmpId = row[field].trim().toUpperCase();
              
              // Check if this ID matches any of our employees
              employeeIds.forEach(empId => {
                const normalizedEmpId = empId.toUpperCase();
                if (allocEmpId === normalizedEmpId || allocEmpId.includes(normalizedEmpId)) {
                  customerCounts[normalizedEmpId] = (customerCounts[normalizedEmpId] || 0) + 1;
                }
              });
            }
          });
        }
      });
  
      return customerCounts;
    } catch (error) {
      console.error("Error fetching customer allocations:", error.message);
      return {}; // Return empty object if there's an error
    }
  }
  
  // --------CUSTOMER LIST HAVE NOT VISIT OR COLLECTION---------------
  async function customerListNotVisitOrCollection(req, res) {
    try {
      // Parse query parameters
      let { startDate, endDate, employeeId } = req.query;
      
      // Set date range (default to today if not provided)
      const today = new Date();
      if (!startDate || !endDate) {
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      } else {
        startDate = new Date(startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999);
      }
  
      console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
      // Get pagination parameters
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
  
      // Get collection employee by ID
      const employee = await employeModel.findById(
        employeeId,
        { _id: 1, employeName: 1, employeUniqueId: 1, employeePhoto: 1, branchId: 1 }
      ).lean();
  
      if (!employee) return notFound(res, "Employee not found.", []);
      if (!employee.employeUniqueId) return notFound(res, "Employee has no unique ID.", []);
  
      // Use the single employee's unique ID
      const employeeUniqueId = employee.employeUniqueId;
      
      // Get branch info if branchId exists
      let branchName = '';
      if (employee.branchId) {
        const branch = await newbranch.findById(
          employee.branchId, 
          { _id: 1, name: 1 }
        ).lean();
        if (branch) branchName = branch.name;
      }
  
      // IMPORTANT: Get LDs visited or collected for the specified date range
      const dateFilter = { 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "accept" // Only include status "accept"
  
      };
  
      // Get all LD numbers from visits and collections within the date range
      const [visitedLDNumbers, collectedLDNumbers] = await Promise.all([
        visitModel.distinct("LD", dateFilter),  // Only get LDs for the date range
        collectionModel.distinct("LD", dateFilter)  // Only get LDs for the date range
      ]);
  
      // Create processed set of LDs that have been processed in the date range
      const processedSet = new Set([...visitedLDNumbers, ...collectedLDNumbers].map(ld => 
        ld ? ld.toString().trim().toLowerCase() : ''
      ).filter(ld => ld));
  
      // For debugging
      // console.log(`Total visited LD numbers in date range: ${visitedLDNumbers.length}`);
      // console.log(`Total collected LD numbers in date range: ${collectedLDNumbers.length}`);
      // console.log(`Total processed LD numbers in date range: ${processedSet.size}`);
      
      // Prepare result structure for this employee
      const employeeResult = {
        _id: employee._id,
        employeName: employee.employeName,
        employeUniqueId: employee.employeUniqueId,
        employeePhoto: employee.employeePhoto,
        branchId: employee.branchId,
        branchName: branchName,
        unprocessedCustomers: []
      };
  
      // Get customer data from Google Sheet
      const spreadsheetId = process.env.VISIT_GOOGLE_SHEET_KEY;
      const sheetName = process.env.EMIOVERALL_SHEET;
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
      const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: sheetName });
  
      if (!response.data.values || response.data.values.length === 0) {
        employeeResult.unprocessedCustomerCount = 0;
        return success(res, "No customer data found in Google Sheet", { 
          data: [employeeResult], 
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 1,
            recordsPerPage: limit
          }
        });
      }
  
      // Process Google Sheet data
      const headers = response.data.values[0];
      const headerIndices = {};
      
      // Map column indices
      headers.forEach((header, index) => {
        headerIndices[header] = index;
      });
  
      // Define allocation fields
      const allocationFields = ['Allocation 1 emp id', 'Allocation 2 emp id'];
      const empIdUpper = employeeUniqueId.toUpperCase();
  
      // Process each row in the Google Sheet to find unprocessed customers
      const data = response.data.values.slice(1);
      for (const row of data) {
        // Get LD number and net due - skip early if possible
        const ldNoIdx = headerIndices['LD'];
        const netDueIdx = headerIndices['NET DUE'];
        
        if (ldNoIdx === undefined || netDueIdx === undefined || !row[ldNoIdx]) continue;
        
        const ldNo = row[ldNoIdx];
        const netDueStr = row[netDueIdx] || '0';
        const netDue = parseFloat(netDueStr.replace(/,/g, ''));
      
        
        // Skip if no amount due
        if (netDue <= 0) continue;
        
        // Check if this LD exists in visitModel or collectionModel within date range
        if (processedSet.has(ldNo.toString().trim().toLowerCase())) {
          console.log(`Skipping LD ${ldNo} as it has been visited or collected within date range`);
          continue;
        }
  
        // Check if this employee is allocated to this customer
        let isAllocated = false;
        for (const field of allocationFields) {
          const fieldIdx = headerIndices[field];
          if (fieldIdx === undefined || !row[fieldIdx]) continue;
          
          const allocEmpId = row[fieldIdx].trim().toUpperCase();
          if (allocEmpId === empIdUpper || allocEmpId.includes(empIdUpper)) {
            isAllocated = true;
            break;
          }
        }
        
        // If not allocated to this employee, skip
        if (!isAllocated) continue;
        
        // Helper function to safely get column value
        const getValue = (columnName) => {
          const idx = headerIndices[columnName];
          return idx !== undefined && row[idx] !== undefined ? row[idx] : '';
        };
        
        // Add to unprocessed customers
        employeeResult.unprocessedCustomers.push({
          'LD': ldNo,
          'branch': getValue('BRANCH'),
          'customerName': getValue('CUSTOMER NAME') || getValue('CUSTOMER NAME ') || '',
          'fatherName': getValue('FATHER NAME') || getValue('FATHER NAME ') || '',
          'mobile': getValue('MOBILE') || '',
          'village': getValue('VILLAGE') || '',
          'address': getValue('ADDRESS') || '',
          'patner': getValue('PATNER') || '',
          'mode': getValue('MODE') || '',
          'emiAmount': parseFloat(getValue(('EMI AMOUNT ') || 0).replace(/,/g, '')),
          'oldDue': parseFloat(getValue(('OLD DUE ') || 0).replace(/,/g, '')),
          'netDue': netDue,
          'collectionType': getValue('COLLECTION TYPE') || '',
          'lat': getValue('LAT') || getValue('LAT ') || '',
          'long': getValue('LONG') || getValue('LONG ') || ''
        });
      }
  
      // Count unprocessed customers
      employeeResult.unprocessedCustomerCount = employeeResult.unprocessedCustomers.length;
      
      // Return result with the employee
      return success(res, "Unprocessed customers retrieved for employee", {
        data: [employeeResult],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalRecords: 1,
          recordsPerPage: limit
        }
      });
    } catch (error) {
      console.error(error);
      return unknownError(res, error);
    }
  }
  
  // -------------HIERARACHY VIEW TABLE DATA SHOW -------------------
  async function reportingDashBoardVisit(req, res) {
    try {
      const { employeeId, startDate, endDate } = req.query;
      
      // Find the employee
      const employee = await employeModel.findOne({ _id: new ObjectId(employeeId) });
      
      if (!employee) {
        return notFound(res, 'Employee not found', []);
      }
      
      // Parse the date parameters or use current date if not provided
      let parsedStartDate = null;
      let parsedEndDate = null;
      
      if (startDate) {
        parsedStartDate = new Date(startDate);
        // Ensure start of day
        parsedStartDate.setHours(0, 0, 0, 0);
      } else {
        // Default to current day's start
        parsedStartDate = new Date();
        parsedStartDate.setHours(0, 0, 0, 0);
      }
      
      if (endDate) {
        parsedEndDate = new Date(endDate);
        // Ensure end of day
        parsedEndDate.setHours(23, 59, 59, 999);
      } else {
        // Default to current day's end
        parsedEndDate = new Date();
        parsedEndDate.setHours(23, 59, 59, 999);
      }
      
      // Log date range for debugging
      // console.log(`Date Range: ${parsedStartDate.toISOString()} to ${parsedEndDate.toISOString()}`);
      
      // Get optimized hierarchy data with efficient statistics calculation
      const hierarchyData = await buildOptimizedHierarchy(
        employee._id, 
        parsedStartDate, 
        parsedEndDate
      );
      
      return success(res, "success", {
        data: hierarchyData
      });
    } catch (error) {
      console.log(error);
      return unknownError(res, error.message);
    }
  }
  
  // New optimized function with better performance and accurate visit counting
  async function buildOptimizedHierarchy(employeeId, startDate, endDate) {
    try {
      // Get the main employee
      const mainEmployee = await employeModel.findById(employeeId);
      if (!mainEmployee) {
        return null;
      }
      
      // Get all direct subordinates of this employee
      const directSubordinates = await employeModel.find({ 
        reportingManagerId: employeeId,
        status: "active"
      });
      
      // Get all direct subordinate IDs
      const directSubordinateIds = directSubordinates.map(emp => emp._id);
      
      // Get all employees in the hierarchy under directSubordinates in a single query
      // This avoids recursive DB queries and gets the full hierarchy at once
      const allSubordinates = await getAllSubordinatesFlat(directSubordinateIds);
      
      // Get all employees in a single array
      const allEmployees = [mainEmployee, ...directSubordinates, ...allSubordinates];
      
      // Process all roles in a single query
      const allRoleIds = [];
      allEmployees.forEach(emp => {
        if (emp.roleId && Array.isArray(emp.roleId)) {
          emp.roleId.forEach(id => allRoleIds.push(id));
        }
      });
      
      const allRoles = await roleModel.find({ _id: { $in: allRoleIds } });
      
      // Create role map for quick lookups
      const roleMap = {};
      allRoles.forEach(role => {
        roleMap[role._id.toString()] = role;
      });
      
      // Collect all branch IDs to fetch branch names in a single query
      const allBranchIds = [];
      allEmployees.forEach(emp => {
        if (emp.branchId) {
          allBranchIds.push(emp.branchId);
        }
      });
      
      // Fetch all branches in a single query
      const allBranches = await newbranch.find({ _id: { $in: allBranchIds } });
      
      // Create branch map for quick lookups
      const branchMap = {};
      allBranches.forEach(branch => {
        branchMap[branch._id.toString()] = branch.name || "";
      });
      
      // Identify collectors and create employee to visitKey mapping
      const employeeToVisitKeyMap = new Map();
      const collectorIds = [];
      
      allEmployees.forEach(emp => {
        const isCollector = emp.roleId && Array.isArray(emp.roleId) && emp.roleId.some(roleId => {
          const role = roleMap[roleId.toString()];
          return role && role.roleName && role.roleName.toLowerCase().includes('collection');
        });
        
        if (isCollector) {
          const visitKey = `${emp.employeName}-${emp.employeUniqueId}`;
          employeeToVisitKeyMap.set(emp._id.toString(), visitKey);
          collectorIds.push(visitKey);
        }
      });
      
      // Get all visit stats in a single query with explicit date filtering
      // Ensure we're using proper date objects for the query
      const visitQuery = {
        visitBy: { $in: collectorIds }
      };
      
      // Add date range filter if valid dates are provided
      if (startDate instanceof Date && !isNaN(startDate.getTime()) &&
          endDate instanceof Date && !isNaN(endDate.getTime())) {
        visitQuery.createdAt = { 
          $gte: startDate, 
          $lte: endDate 
        };
      }
      
      const allVisits = await visitModel.find(visitQuery);
      
      // Create a map to store visit counts per collector
      const visitCountMap = new Map();
      collectorIds.forEach(id => {
        visitCountMap.set(id, { accepted: 0, rejected: 0 });
      });
      
      // Count visits for each collector
      allVisits.forEach(visit => {
        const visitBy = visit.visitBy;
        if (!visitCountMap.has(visitBy)) {
          visitCountMap.set(visitBy, { accepted: 0, rejected: 0 });
        }
        
        const stats = visitCountMap.get(visitBy);
        if (visit.status === 'accept') {
          stats.accepted++;
        } else if (visit.status === 'reject') {
          stats.rejected++;
        }
      });
      
      // Get all collections in a single query with the same date filtering
      const collectionQuery = {};
      
      // Add date range filter if valid dates are provided
      if (startDate instanceof Date && !isNaN(startDate.getTime()) &&
          endDate instanceof Date && !isNaN(endDate.getTime())) {
        collectionQuery.createdAt = { 
          $gte: startDate, 
          $lte: endDate 
        };
      }
      
      const allCollections = await collectionModel.find(collectionQuery);
      
      // Create a map to store collection counts per collector
      const collectionStatsMap = new Map();
      collectorIds.forEach(id => {
        collectionStatsMap.set(id, { 
          emiAcceptCount: 0, 
          emiReceivedSum: 0 
        });
      });
      
      // Process collections for each collector
      allCollections.forEach(collection => {
        if (collection.status === 'accept') {
          const collectedBy = collection.collectedBy;
          
          // Check if collectedBy matches any of our known collectors
          if (collectionStatsMap.has(collectedBy)) {
            const stats = collectionStatsMap.get(collectedBy);
            
            // Increment the count
            stats.emiAcceptCount++;
            
            // Add the EMI amount if it exists
            if (collection.receivedAmount && !isNaN(Number(collection.receivedAmount))) {
              stats.emiReceivedSum
               += Number(collection.receivedAmount);
            }
          }
        }
      });
      
      // Debug log to verify counts
      console.log(`Found ${allVisits.length} total visits for ${collectorIds.length} collectors`);
      console.log(`Found ${allCollections.length} total collections`);
      
      // Function to get stats for an employee (including their own stats only)
      function getEmployeeStats(empId) {
        const visitKey = employeeToVisitKeyMap.get(empId);
        if (!visitKey) return { accepted: 0, rejected: 0 };
        
        return visitCountMap.get(visitKey) || { accepted: 0, rejected: 0 };
      }
      
      // Function to get collection stats for an employee
      function getEmployeeCollectionStats(empId) {
        const visitKey = employeeToVisitKeyMap.get(empId);
        if (!visitKey) return { emiAcceptCount: 0, emiReceivedSum: 0 };
        
        return collectionStatsMap.get(visitKey) || { emiAcceptCount: 0, emiReceivedSum: 0 };
      }
      
      // Function to calculate the total stats for an employee and all their descendants
      function calculateTotalStats(empId, descendants = []) {
        // Start with the employee's own stats
        const ownStats = getEmployeeStats(empId);
        const totalStats = { ...ownStats };
        
        // Add stats from all descendants
        for (const desc of descendants) {
          const descStats = getEmployeeStats(desc._id.toString());
          totalStats.accepted += descStats.accepted;
          totalStats.rejected += descStats.rejected;
        }
        
        return totalStats;
      }
      
      // Function to calculate the total collection stats for an employee and all descendants
      function calculateTotalCollectionStats(empId, descendants = []) {
        // Start with the employee's own collection stats
        const ownStats = getEmployeeCollectionStats(empId);
        const totalStats = { ...ownStats };
        
        // Add collection stats from all descendants
        for (const desc of descendants) {
          const descStats = getEmployeeCollectionStats(desc._id.toString());
          totalStats.emiAcceptCount += descStats.emiAcceptCount;
          totalStats.emiReceivedSum += descStats.emiReceivedSum;
        }
        
        return totalStats;
      }
      
      // Calculate stats for each direct subordinate (including their descendants)
      const directSubordinateStatsMap = new Map();
      const directSubordinateCollectionStatsMap = new Map();
      
      for (const sub of directSubordinates) {
        const subId = sub._id.toString();
        const descendants = getDescendantsFromList(subId, allSubordinates);
        const totalStats = calculateTotalStats(subId, descendants);
        const totalCollectionStats = calculateTotalCollectionStats(subId, descendants);
        
        directSubordinateStatsMap.set(subId, totalStats);
        directSubordinateCollectionStatsMap.set(subId, totalCollectionStats);
      }
      
      // Build main employee node
      const isMainCollector = mainEmployee.roleId && Array.isArray(mainEmployee.roleId) && 
        mainEmployee.roleId.some(roleId => {
          const role = roleMap[roleId.toString()];
          return role && role.roleName && role.roleName.toLowerCase().includes('collection');
        });
      
      // Get branch name for main employee
      const mainEmployeeBranchName = mainEmployee.branchId ? 
        branchMap[mainEmployee.branchId.toString()] || "" : 
        "No Branch Assigned";
      
      // Calculate main employee's complete stats (including all descendants)
      const allDescendants = [...directSubordinates, ...allSubordinates];
      const mainEmployeeStats = calculateTotalStats(mainEmployee._id.toString(), allDescendants);
      const mainEmployeeCollectionStats = calculateTotalCollectionStats(mainEmployee._id.toString(), allDescendants);
      
      const mainNode = {
        id: mainEmployee._id,
        employeUniqueId: mainEmployee.employeUniqueId,
        employeName: mainEmployee.employeName,
        employeeBranch: mainEmployee.branchId || null,
        employeeBranchName: mainEmployeeBranchName,
        mobileNo: mainEmployee.mobileNo,
        isCollector: isMainCollector,
        visitStats: mainEmployeeStats,
        emiAcceptCount: mainEmployeeCollectionStats.emiAcceptCount,
        emiReceivedSum: mainEmployeeCollectionStats.emiReceivedSum,
        children: []
      };
      
      // Build children nodes (only direct subordinates) with aggregated stats
      for (const sub of directSubordinates) {
        const subId = sub._id.toString();
        const isCollector = sub.roleId && Array.isArray(sub.roleId) && sub.roleId.some(roleId => {
          const role = roleMap[roleId.toString()];
          return role && role.roleName && role.roleName.toLowerCase().includes('collection');
        });
        
        // Check if this employee has any subordinates
        const hasSubordinates = allSubordinates.some(emp => 
          emp.reportingManagerId && emp.reportingManagerId.toString() === subId
        );
        
        // Get branch name for this subordinate
        const subBranchName = sub.branchId ? 
          branchMap[sub.branchId.toString()] || "" : 
          "No Branch Assigned";
        
        // Get aggregated stats for this subordinate
        const subStats = directSubordinateStatsMap.get(subId) || { accepted: 0, rejected: 0 };
        const subCollectionStats = directSubordinateCollectionStatsMap.get(subId) || { 
          emiAcceptCount: 0, 
          emiReceivedSum: 0 
        };
        
        // Create child node with aggregated stats
        const childNode = {
          id: sub._id,
          employeUniqueId: sub.employeUniqueId,
          employeName: sub.employeName,
          employeeBranch: sub.branchId || null,
          employeeBranchName: subBranchName,
          mobileNo: sub.mobileNo,
          isCollector: isCollector,
          visitStats: subStats,
          emiAcceptCount: subCollectionStats.emiAcceptCount,
          emiReceivedSum: subCollectionStats.emiReceivedSum,
          hasChildren: hasSubordinates
        };
        
        // Add child to main node's children array
        mainNode.children.push(childNode);
      }
      
      // Sort children by accepted count in descending order (max to min)
      mainNode.children.sort((a, b) => b.visitStats.accepted - a.visitStats.accepted);
      
      return mainNode;
    } catch (error) {
      console.log("Error in buildOptimizedHierarchy:", error);
      throw error;
    }
  }
  
  // Helper function to get all subordinates in a flat list using a single database query
  async function getAllSubordinatesFlat(rootIds) {
    try {
      // Start with an empty result array
      let allSubordinates = [];
      
      // Keep track of IDs we need to query for
      let idsToQuery = [...rootIds.map(id => id.toString())];
      
      // Keep fetching until we have no more IDs to query
      while (idsToQuery.length > 0) {
        // Query for employees that report to any of these managers
        const subordinates = await employeModel.find({
          reportingManagerId: { $in: idsToQuery },
          status: "active"
        });
        
        // No more subordinates found, we're done
        if (subordinates.length === 0) {
          break;
        }
        
        // Add these subordinates to our result
        allSubordinates = [...allSubordinates, ...subordinates];
        
        // Get the IDs of these subordinates to find their subordinates in the next iteration
        idsToQuery = subordinates.map(emp => emp._id.toString());
      }
      
      return allSubordinates;
    } catch (error) {
      console.log("Error in getAllSubordinatesFlat:", error);
      throw error;
    }
  }
  
  // Helper function to extract descendants from a flat list of employees
  function getDescendantsFromList(employeeId, allEmployees) {
    // Start with direct descendants
    const directDescendants = allEmployees.filter(emp => 
      emp.reportingManagerId && emp.reportingManagerId.toString() === employeeId
    );
    
    // Initialize result with direct descendants
    const allDescendants = [...directDescendants];
    
    // For each direct descendant, add its descendants recursively
    for (const desc of directDescendants) {
      const moreDescendants = getDescendantsFromList(desc._id.toString(), allEmployees);
      allDescendants.push(...moreDescendants);
    }
    
    return allDescendants;
  }






  module.exports = {
  allCustomerDashboard,
  piChartDashboardApi,
  branchWiseTable,
  managerWiseTable,
  employeeWiseTable,
  customerListNotVisitOrCollection,
  reportingDashBoardVisit,
  }