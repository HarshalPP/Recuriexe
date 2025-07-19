const {
    success,
    unknownError,
    unauthorized,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const xlsx = require('xlsx');
  const moment = require('moment');
  const fs = require('fs');
  const path = require('path');
  const stream = require('stream');
  const PDFDocument = require('pdfkit');
  const nodemailer = require("nodemailer");
  const uploadToSpaces = require('../../services/spaces.service'); 
  const employeeModel = require("../../model/adminMaster/employe.model")
  const disbursedCustomerModel  = require("../../model/newCollection/disbursedCustomer.model.js");
  const branchModel = require("../../model/adminMaster/newBranch.model")
  const employeeAllocationModel = require("../../model/adminMaster/employeeAllocation.model")
  const newVisitModel = require("../../model/newCollection/newVisit.model.js")
  const newEmiCollectionModel = require("../../model/newCollection/emiCollection.model.js")
  const modeOfCollectionModel = require("../../model/adminMaster/modeOfCollection.model.js")
  const bankNameModel = require("../../model/adminMaster/bank.model.js")
  const okcreditModel = require("../../model/adminMaster/okCredit.model.js")
  const customerFinanceModel = require("../../model/newCollection/customerFinanceSummary.model.js")
  const visitModel = require("../../model/collection/visit.model.js")
  const roleModel = require("../../model/adminMaster/role.model.js")
  const newCashTransferModel = require("../../model/newCollection/transfer.model.js")
  const currentDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");


// Reusable pagination function for aggregation
async function paginateAggregate(model, pipeline = [], page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    // Create count pipeline by taking match stages from original pipeline
    const countPipeline = pipeline.filter(stage => 
      Object.keys(stage)[0] === '$match'
    );
    countPipeline.push({ $count: 'total' });

    // Add pagination to the main pipeline
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

    // Execute both pipelines
    const [countResult, data] = await Promise.all([
      model.aggregate(countPipeline),
      model.aggregate(dataPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        recordsPerPage: limit
      }
    };
  } catch (error) {
    throw error;
  }
}


async function sendEmails(ccEmails , userEmail, subject, html, attachment) {
try {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  userEmail = userEmail ? (Array.isArray(userEmail) ? userEmail : [userEmail]) : [];
  ccEmails = ccEmails ? (Array.isArray(ccEmails) ? ccEmails : [ccEmails]) : [];
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail.join(',') , 
    cc: ccEmails ? ccEmails.join(',') : undefined, 
    subject: subject,
    html: html,
    attachments: attachment, 

  });

  return true;
} catch (error) {
  console.log(error);
  console.error('Error sending email:', error.message);
   return false;
}
}


// ---------------** EMI PDF CREATE CODE **-********------------------------
async function createEmiReceiptPdf(data,customer, receiptNo) {
const timestamp = Date.now();
const sanitizedCustomerName = customer.customerDetail.customerName.replace(/[^a-zA-Z0-9]/g, '-');
const bucketName = 'finexe';
const pdfFilename = `${process.env.PATH_BUCKET}/LOS/PDF/${sanitizedCustomerName}-${customer.LD}-${timestamp}.pdf`;

// Create a buffer stream for the PDF
const bufferStream = new stream.PassThrough();
const doc = new PDFDocument({ margin: 50, size: 'A4' });
doc.pipe(bufferStream);

// Add header
doc.image('src/v1/api/controller/finCooper.png', 50, 45, { width: 100 })
  .fontSize(22).font('Helvetica-Bold').text('FIN COOPERS INDIA PVT. LTD', 160, 50, { align: 'center' })
  .fontSize(16).text('CIN:U74140MP2019PTC048765', 160, 80, { align: 'center' })
  .fontSize(10).font('Helvetica').text('Registered Office: 207-210, Diamond Trade Center, 11 bungalow', 160, 105, { align: 'center' })
  .text('colony, near Hukumchand Ghantaghar marg, Indore', 160, 120, { align: 'center' })
  .text('(M.P.)-452001', 160, 135, { align: 'center' });

// Add EMI Receipt title
doc.fontSize(18).font('Helvetica-Bold').text('EMI Receipt', 50, 180, { align: 'center' });

// Add table
const tableTop = 220;
const tableLeft = 50;
const tableRight = 550;
const rowHeight = 30;
const colWidth = (tableRight - tableLeft) / 2;

const tableData = [
  { label: 'Receipt No.', value: receiptNo },
  { label: 'Collected By', value: data.collectedBy },
  { label: 'LD', value: data.LD },
  { label: 'Customer Name', value: customer.customerDetail.customerName },
  { label: 'Mobile No', value: customer.customerDetail.mobile },
  { label: 'Email', value: data.customerEmail },
  { label: 'Date', value: data.emiReceivedDate },
  { label: 'EMI Amount', value: data.receivedAmount },
  { label: 'Transaction ID', value: data.transactionId },
];

doc.lineWidth(1);
tableData.forEach((row, i) => {
  const y = tableTop + i * rowHeight;

  doc.rect(tableLeft, y, colWidth, rowHeight).stroke();
  doc.rect(tableLeft + colWidth, y, colWidth, rowHeight).stroke();

  doc.fontSize(10).font('Helvetica')
    .text(row.label, tableLeft + 5, y + 10)
    .text(row.value, tableLeft + colWidth + 5, y + 10);
});

// Add note
const noteTop = tableTop + tableData.length * rowHeight + 20;
doc.fontSize(12).font('Helvetica-Bold').text('NOTE', 50, noteTop);
doc.fontSize(10).font('Helvetica')
  .text('1. EMI IS COLLECTED ON BEHALF OF BANK/NBFC', 70, noteTop + 20)
  .text('2. RECEIPT WILL UPDATE TO YOUR LOAN ACCOUNT ONCE EMI RECEIVED IS CONFIRMED', 70, noteTop + 35)
  .text('3. THIS IS SYSTEM GENERATED RECEIPT NO SIGNATURE REQUIRED', 70, noteTop + 50);
doc.end();

// Convert the stream to a buffer
const chunks = [];
for await (const chunk of bufferStream) {
  chunks.push(chunk);
}
const pdfBuffer = Buffer.concat(chunks);

// Upload to DigitalOcean Spaces
const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');

const fileUrl = `https://cdn.fincooper.in/${pdfFilename}`
return fileUrl; 
}

// --------------** GET ALL COLLECTION EMPLOYE LIST **-----------------------
async function getCollectionEmployees(req, res) {
  try {
    // Get collection role ID
    const collectionRole = await roleModel.findOne({ roleName: "collection" });
    if (!collectionRole) {
      return notFound(res, "Collection role not found");
    }

    const collectionEmployees = await employeeModel.find(
      { 
        roleId: { $in: [collectionRole._id] },
        status: "active"
      },
      {
        employeName: 1,
        employeUniqueId: 1,
        employeePhoto:1,
        _id: 1
      }
    );

    if (!collectionEmployees.length) {
      return notFound(res, "No collection employees found",[]);
    }

    return success(res, "Collection employees retrieved successfully", collectionEmployees);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


// ----------------------** GET ALL DASHBOARD API **------------------
async function getDashboardApi(req, res) {
  try {
    const { branchId, regionalBranchId, startDate, endDate, employeUniqueId, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tokenId = new ObjectId(req.Id);
    
    // Use projection to get only the fields we need - optimization #1
    const employeeData = await employeeModel.findOne({ _id: tokenId }, { _id: 1 });
    if (!employeeData) {
      return notFound(res, "Employee not found");
    }

    // Base match condition
    const matchCondition = { status: "active" };
    
    // Create promise array for parallel execution - optimization #2
    const promises = [];
    
    // Handle branch filtering
    if (branchId && branchId !== "all") {
      matchCondition.branchId = new ObjectId(branchId);
    }
    
    // Handle regional branch filtering
    let branchesFromRegional = null;
    if (regionalBranchId && regionalBranchId !== "all") {
      // Start the regional branch query in parallel - optimization #3
      const regionalBranchPromise = (async () => {
        const regionalBranch = await branchModel.findOne({ 
          _id: new ObjectId(regionalBranchId),
          regional: true 
        }, { _id: 1, regional: 1 });
        
        if (!regionalBranch) {
          return null; // We'll handle this later
        }
        
        // Get all branches that belong to this regional branch
        const branchesUnderRegional = await branchModel.find(
          { regionalBranchId: new ObjectId(regionalBranchId) },
          { _id: 1 }
        );
        
        // Extract branch IDs
        const branchIds = branchesUnderRegional.map(branch => branch._id);
        
        // Add regional branch itself to the list
        branchIds.push(new ObjectId(regionalBranchId));
        
        return branchIds;
      })();
      
      promises.push(regionalBranchPromise);
    }

    // Handle employee filtering
    let employeeFilteredLDs = null;
    if (employeUniqueId && employeUniqueId !== "all") {
      // Start the employee query in parallel - optimization #4
      const employeePromise = (async () => {
        // First, find the employee to get both ID and name
        const employee = await employeeModel.findOne(
          { employeUniqueId: employeUniqueId },
          { employeUniqueId: 1, employeName: 1 }
        );
        
        if (!employee) {
          return null; // We'll handle this later
        }
        
        // Run all these queries in parallel - optimization #5
        const [allocatedLDs, visitLDs, collectionLDs] = await Promise.all([
          // Get LDs from allocated customers
          employeeAllocationModel.distinct("customerFinId", {
            $or: [
              { allocation1: employeUniqueId },
              { allocation2: employeUniqueId },
              { allocation3: employeUniqueId },
              { allocation4: employeUniqueId }
            ]
          }),
          
          // Get LDs from visits made by this employee
          newVisitModel.distinct("LD", { 
            $or: [
              { visitBy: employeUniqueId },
              { visitBy: employee.employeName }
            ],
            status: "accept",
            visitUpdateDate: { 
              $gte: startDate || "2000-01-01", 
              $lte: endDate || "2100-12-31" 
            }
          }),
          
          // Get LDs from collections made by this employee
          newEmiCollectionModel.distinct("LD", {
            $or: [
              { collectedBy: employeUniqueId },
              { collectedBy: employee.employeName }
            ],
            status: "accept",
            emiUpdateDate: { 
              $gte: startDate || "2000-01-01", 
              $lte: endDate || "2100-12-31" 
            }
          })
        ]);
        
        // Combine all sets of LDs (remove duplicates)
        return [...new Set([...allocatedLDs, ...visitLDs, ...collectionLDs])];
      })();
      
      promises.push(employeePromise);
    }
    
    // Wait for all our parallel processes to complete - optimization #6
    if (promises.length > 0) {
      const results = await Promise.all(promises);
      
      // Process regional branch results
      if (regionalBranchId && regionalBranchId !== "all") {
        branchesFromRegional = results.shift();
        
        // Check if regional branch was valid
        if (!branchesFromRegional) {
          return badRequest(res, "Invalid regional branch ID or branch is not marked as regional");
        }
        
        // Update match condition with branch IDs
        matchCondition.branchId = { $in: branchesFromRegional };
      }
      
      // Process employee results
      if (employeUniqueId && employeUniqueId !== "all") {
        employeeFilteredLDs = results.shift();
        
        // Check if employee was found
        if (!employeeFilteredLDs) {
          return badRequest(res, `Employee with ID ${employeUniqueId} not found`);
        }
        
        // Check if employee has any associated customers
        if (employeeFilteredLDs.length === 0) {
          return success(res, "No customer data found for this employee", {
            data: [],
            pagination: {
              totalDocs: 0,
              limit: limit,
              totalPages: 0,
              page: page,
              pagingCounter: 0
            },
            summary: {
              totalVisit: 0,
              collectionCount: 0,
              totalEmiReceived: 0
            }
          });
        }
        
        // Update match condition with customer LDs
        matchCondition.LD = { $in: employeeFilteredLDs };
      }
    }

    // Start the customer count query in parallel with the main query - optimization #7
    const countPromise = disbursedCustomerModel.countDocuments(matchCondition);
    
    // Optimization #8: Use a cached list of customer LDs by branch/region for later filtering
    let branchCustomerLDsPromise = null;
    if (branchId && branchId !== "all") {
      branchCustomerLDsPromise = disbursedCustomerModel.distinct("LD", { 
        branchId: new ObjectId(branchId),
        status: "active"
      });
    } else if (branchesFromRegional) {
      branchCustomerLDsPromise = disbursedCustomerModel.distinct("LD", { 
        branchId: { $in: branchesFromRegional },
        status: "active"
      });
    }

    // Use pipeline for aggregation to get customer data - optimization #9: simplified projection
    const customersPromise = disbursedCustomerModel.aggregate([
      { $match: matchCondition },
      // Join branch details
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { 
        $addFields: { 
          branchName: { $ifNull: [{ $arrayElemAt: ["$branch.name", 0] }, ""] } 
        } 
      },
      // Join finance summaries
      {
        $lookup: {
          from: "customerfinancesummaries",
          localField: "LD",
          foreignField: "LD",
          as: "financesummaries"
        }
      },
      // Add fields with proper defaults if finance summaries are missing
      {
        $addFields: {
          financeSummary: { $ifNull: [{ $arrayElemAt: ["$financesummaries", 0] }, {}] }
        }
      },
      // Project base fields
      {
        $project: {
          _id: 0,
          LD: 1,
          branchName: 1,
          customerName: "$customerDetail.customerName",
          fatherName: "$customerDetail.fatherName",
          mobile: "$customerDetail.mobile",
          emiAmount: { $ifNull: ["$financeSummary.emiAmount", 0] },
          oldDueAmount: { $ifNull: ["$financeSummary.oldDueAmount", 0] },
          netDueAmount: { $ifNull: ["$financeSummary.netDueAmount", 0] }
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);
    
    // Wait for customer data and count queries to complete
    const [customers, totalCount, branchCustomerLDs] = await Promise.all([
      customersPromise,
      countPromise,
      branchCustomerLDsPromise
    ]);
    
    // Get all customer LDs
    const customerLDs = customers.map(customer => customer.LD);
    
    // If there are no customers, we can return early - optimization #10
    if (customerLDs.length === 0) {
      return success(res, "No active customers found", {
        data: [],
        summary: {
          totalVisit: 0,
          collectionCount: 0,
          totalEmiReceived: 0
        },
        pagination: {
          totalDocs: totalCount,
          limit: limit,
          totalPages: Math.ceil(totalCount / limit),
          page: page,
          pagingCounter: (page - 1) * limit + 1
        }
      });
    }
    
    // Run the remaining queries in parallel - optimization #11
    const [allocations, visitCounts, collectionSummaries] = await Promise.all([
      // Get allocations for these customers
      employeeAllocationModel.find(
        { customerFinId: { $in: customerLDs } },
        { 
          customerFinId: 1, 
          allocation1: 1, 
          allocation2: 1, 
          allocation3: 1, 
          allocation4: 1,
          _id: 0 
        }
      ),
      
      // Get visit data by status
      (async () => {
        // Base visit match condition without status filter initially
        const baseVisitMatchCondition = {
          LD: { $in: customerLDs }
        };
        
        // Add status filter if provided and not "all"
        if (status && status !== "all") {
          baseVisitMatchCondition.status = status;
        }
        
        // Add date range if provided
        if (startDate && endDate) {
          baseVisitMatchCondition.visitUpdateDate = { 
            $gte: startDate, 
            $lte: endDate 
          };
        }
        
        // Apply employee filter if provided
        if (employeUniqueId && employeUniqueId !== "all") {
          const employee = await employeeModel.findOne(
            { employeUniqueId: employeUniqueId },
            { employeUniqueId: 1, employeName: 1 }
          );
          
          if (employee) {
            baseVisitMatchCondition.$or = [
              { visitBy: employeUniqueId },
              { visitBy: employee.employeName }
            ];
          } else {
            baseVisitMatchCondition.visitBy = employeUniqueId;
          }
        }
        
        // Limit visit data to customers in the branch/region - optimization #12
        if (branchCustomerLDs) {
          // Create intersection of our customer LDs and branch customer LDs
          const filteredLDs = customerLDs.filter(ld => branchCustomerLDs.includes(ld));
          baseVisitMatchCondition.LD = { $in: filteredLDs.length > 0 ? filteredLDs : ["no_results"] };
        }
        
        // Get visit counts grouped by status and LD
        return newVisitModel.aggregate([
          { $match: baseVisitMatchCondition },
          {
            $group: {
              _id: {
                LD: "$LD",
                status: "$status"
              },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: "$_id.LD",
              statusCounts: {
                $push: {
                  status: "$_id.status",
                  count: "$count"
                }
              },
              totalVisit: { $sum: "$count" }
            }
          }
        ]);
      })(),
      
      // Get collection data by status
      (async () => {
        // Base collection match condition without status filter initially
        const baseCollectionMatchCondition = {
          LD: { $in: customerLDs }
        };
        
        // Add status filter if provided and not "all"
        if (status && status !== "all") {
          baseCollectionMatchCondition.status = status;
        }
        
        // Add date range if provided
        if (startDate && endDate) {
          baseCollectionMatchCondition.emiUpdateDate = { 
            $gte: startDate, 
            $lte: endDate 
          };
        }
        
        // Apply employee filter if provided
        if (employeUniqueId && employeUniqueId !== "all") {
          const employee = await employeeModel.findOne(
            { employeUniqueId: employeUniqueId },
            { employeUniqueId: 1, employeName: 1 }
          );
          
          if (employee) {
            baseCollectionMatchCondition.$or = [
              { collectedBy: employeUniqueId },
              { collectedBy: employee.employeName }
            ];
          } else {
            baseCollectionMatchCondition.collectedBy = employeUniqueId;
          }
        }
        
        // Limit collection data to customers in the branch/region - optimization #13
        if (branchCustomerLDs) {
          // Create intersection of our customer LDs and branch customer LDs
          const filteredLDs = customerLDs.filter(ld => branchCustomerLDs.includes(ld));
          baseCollectionMatchCondition.LD = { $in: filteredLDs.length > 0 ? filteredLDs : ["no_results"] };
        }
        
        // Get EMI collection summary grouped by status and LD
        return newEmiCollectionModel.aggregate([
          { $match: baseCollectionMatchCondition },
          {
            $group: {
              _id: {
                LD: "$LD",
                status: "$status"
              },
              count: { $sum: 1 },
              amount: { $sum: "$receivedAmount" }
            }
          },
          {
            $group: {
              _id: "$_id.LD",
              statusData: {
                $push: {
                  status: "$_id.status",
                  count: "$count",
                  amount: "$amount"
                }
              },
              totalCount: { $sum: "$count" }
            }
          }
        ]);
      })()
    ]);
    
    // Create maps for quick lookups - optimization #14: Use Map objects instead of plain objects
    const allocationsMap = new Map();
    allocations.forEach(alloc => {
      allocationsMap.set(alloc.customerFinId, {
        allocation1: alloc.allocation1 || null,
        allocation2: alloc.allocation2 || null,
        allocation3: alloc.allocation3 || null,
        allocation4: alloc.allocation4 || null
      });
    });
    
    // Initialize status counters for visits
    let totalVisitCount = 0;
    let pendingVisitCount = 0;
    let acceptVisitCount = 0;
    let rejectVisitCount = 0;
    
    // Create a map for visit counts per customer
    const visitCountMap = new Map();
    visitCounts.forEach(item => {
      // Track total visit count for this customer
      const totalVisitForCustomer = item.totalVisit || 0;
      totalVisitCount += totalVisitForCustomer;
      
      // Track status-specific counts
      const statusCounts = {
        pending: 0,
        accept: 0,
        reject: 0
      };
      
      // Process status counts for this customer
      if (item.statusCounts && item.statusCounts.length > 0) {
        item.statusCounts.forEach(statusData => {
          const status = statusData.status;
          const count = statusData.count || 0;
          
          if (status === "pending") {
            statusCounts.pending = count;
            pendingVisitCount += count;
          } else if (status === "accept") {
            statusCounts.accept = count;
            acceptVisitCount += count;
          } else if (status === "reject") {
            statusCounts.reject = count;
            rejectVisitCount += count;
          }
        });
      }
      
      // Store customer visit data
      visitCountMap.set(item._id, {
        totalVisit: totalVisitForCustomer,
        pendingVisit: statusCounts.pending,
        acceptVisit: statusCounts.accept,
        rejectVisit: statusCounts.reject
      });
    });
    
    // Initialize status counters for collections
    let totalCollectionCount = 0;
    let pendingCollectionCount = 0;
    let acceptCollectionCount = 0;
    let rejectCollectionCount = 0;
    let pendingCollectionAmount = 0;
    let acceptCollectionAmount = 0;
    let rejectCollectionAmount = 0;
    
    // Process collection data by status
    const collectionSummaryMap = new Map();
    collectionSummaries.forEach(item => {
      // Track total collection count for this customer
      const totalCountForCustomer = item.totalCount || 0;
      totalCollectionCount += totalCountForCustomer;
      
      // Initialize status-specific data for this customer
      const statusData = {
        pendingCount: 0,
        acceptCount: 0,
        rejectCount: 0,
        pendingAmount: 0,
        acceptAmount: 0,
        rejectAmount: 0
      };
      
      // Process status data for this customer
      if (item.statusData && item.statusData.length > 0) {
        item.statusData.forEach(data => {
          const dataStatus = data.status;
          const count = data.count || 0;
          const amount = data.amount || 0;
          
          if (dataStatus === "pending") {
            statusData.pendingCount = count;
            statusData.pendingAmount = amount;
            pendingCollectionCount += count;
            pendingCollectionAmount += amount;
          } else if (dataStatus === "accept") {
            statusData.acceptCount = count;
            statusData.acceptAmount = amount;
            acceptCollectionCount += count;
            acceptCollectionAmount += amount;
          } else if (dataStatus === "reject") {
            statusData.rejectCount = count;
            statusData.rejectAmount = amount;
            rejectCollectionCount += count;
            rejectCollectionAmount += amount;
          }
        });
      }
      
      // Store customer collection data
      collectionSummaryMap.set(item._id, {
        collectionCount: totalCountForCustomer,
        pendingCount: statusData.pendingCount,
        acceptCount: statusData.acceptCount,
        rejectCount: statusData.rejectCount,
        pendingAmount: statusData.pendingAmount,
        acceptAmount: statusData.acceptAmount,
        rejectAmount: statusData.rejectAmount,
        totalEmiReceived: statusData.acceptAmount // For backward compatibility
      });
    });
    
    // Combine all data into final customer objects - optimization #15: More efficient property assignment
    const enrichedCustomers = customers.map(customer => {
      const customerLD = customer.LD;
      
      // Start with base customer data
      const enrichedCustomer = { ...customer };
      
      // Add allocation fields
      const allocation = allocationsMap.get(customerLD);
      if (allocation) {
        enrichedCustomer.allocation1 = allocation.allocation1;
        enrichedCustomer.allocation2 = allocation.allocation2;
        enrichedCustomer.allocation3 = allocation.allocation3;
        enrichedCustomer.allocation4 = allocation.allocation4;
      } else {
        enrichedCustomer.allocation1 = null;
        enrichedCustomer.allocation2 = null;
        enrichedCustomer.allocation3 = null;
        enrichedCustomer.allocation4 = null;
      }
      
      // Add visit summary for this customer
      const visitData = visitCountMap.get(customerLD);
      if (visitData) {
        enrichedCustomer.totalVisit = visitData.totalVisit;
        enrichedCustomer.pendingVisit = visitData.pendingVisit;
        enrichedCustomer.acceptVisit = visitData.acceptVisit;
        enrichedCustomer.rejectVisit = visitData.rejectVisit;
      } else {
        enrichedCustomer.totalVisit = 0;
        enrichedCustomer.pendingVisit = 0;
        enrichedCustomer.acceptVisit = 0;
        enrichedCustomer.rejectVisit = 0;
      }
      
      // Add collection summary for this customer
      const collectionData = collectionSummaryMap.get(customerLD);
      if (collectionData) {
        enrichedCustomer.collectionCount = collectionData.collectionCount;
        enrichedCustomer.pendingCollectionCount = collectionData.pendingCount;
        enrichedCustomer.acceptCollectionCount = collectionData.acceptCount;
        enrichedCustomer.rejectCollectionCount = collectionData.rejectCount;
        enrichedCustomer.pendingCollectionAmount = collectionData.pendingAmount;
        enrichedCustomer.totalEmiReceived = collectionData.acceptAmount;
        enrichedCustomer.rejectCollectionAmount = collectionData.rejectAmount;
      } else {
        enrichedCustomer.collectionCount = 0;
        enrichedCustomer.pendingCollectionCount = 0;
        enrichedCustomer.acceptCollectionCount = 0;
        enrichedCustomer.rejectCollectionCount = 0;
        enrichedCustomer.pendingCollectionAmount = 0;
        enrichedCustomer.totalEmiReceived = 0;
        enrichedCustomer.rejectCollectionAmount = 0;
      }
      
      return enrichedCustomer;
    });
    
    // Create the response with enhanced global summary data
    const result = {
      data: enrichedCustomers,
      summary: {
        totalVisit: totalVisitCount || 0,
        pendingVisitCount: pendingVisitCount || 0,
        acceptVisitCount: acceptVisitCount || 0,
        rejectVisitCount: rejectVisitCount || 0,
        collectionCount: totalCollectionCount || 0,
        pendingCollection: pendingCollectionAmount || 0,
        totalEmiReceived: acceptCollectionAmount || 0,
        rejectCollection: rejectCollectionAmount || 0
      },
      pagination: {
        totalDocs: totalCount,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
        page: page,
        pagingCounter: (page - 1) * limit + 1
      }
    };
    
    return success(res, "Customer details", result);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// ------------** TABLE VIEW API BRANCH NAME WISE CUSTOMER DATA **----------
async function getBranchCustomerTableView(req, res) {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const tokenId = new ObjectId(req.Id);
    
    // Parse pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Verify employee exists - use lean() for faster query
    const employeeData = await employeeModel.findOne({ _id: tokenId }, { _id: 1 }).lean();
    if (!employeeData) {
      return notFound(res, "Employee not found");
    }
    
    // Start all queries in parallel for maximum performance
    const [branches, customerData, visitData, collectionData] = await Promise.all([
      // Get all active branches - use lean() for faster query
      branchModel.find({ status: "active" }, { _id: 1, name: 1 }).lean(),
      
      // Get customer data with optimized aggregation
      disbursedCustomerModel.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: "$branchId",
            customerCount: { $sum: 1 }
          }
        }
      ]),
      
      // Get visit data with optimized pipeline
      newVisitModel.aggregate([
        { 
          $match: {
            status: { $in: ["accept", "reject"] },
            ...(startDate && endDate ? { 
              visitUpdateDate: { $gte: startDate, $lte: endDate }
            } : {})
          }
        },
        // Use a more efficient $lookup to get just the branchId
        {
          $lookup: {
            from: "disbursedcustomers",
            localField: "LD",
            foreignField: "LD",
            as: "customerData"
          }
        },
        // Filter out unmatched lookups
        { $match: { "customerData.0": { $exists: true } } },
        // Extract branch ID from first match
        { $addFields: { branchId: { $arrayElemAt: ["$customerData.branchId", 0] } } },
        // Group by branchId and status
        {
          $group: {
            _id: {
              branchId: "$branchId",
              status: "$status"
            },
            visitCount: { $sum: 1 }
          }
        }
      ]),
      
      // Get collection data with optimized pipeline
      newEmiCollectionModel.aggregate([
        { 
          $match: {
            status: { $in: ["accept", "reject"] },
            ...(startDate && endDate ? { 
              emiUpdateDate: { $gte: startDate, $lte: endDate }
            } : {})
          }
        },
        // Use a more efficient $lookup to get just the branchId
        {
          $lookup: {
            from: "disbursedcustomers",
            localField: "LD",
            foreignField: "LD",
            as: "customerData"
          }
        },
        // Filter out unmatched lookups
        { $match: { "customerData.0": { $exists: true } } },
        // Extract branch ID from first match
        { $addFields: { branchId: { $arrayElemAt: ["$customerData.branchId", 0] } } },
        // Group by branchId and status
        {
          $group: {
            _id: {
              branchId: "$branchId",
              status: "$status"
            },
            collectionAmount: { $sum: "$receivedAmount" }
          }
        }
      ])
    ]);
    
    // Create efficient maps for all data types - much faster than nested loops
    const branchMap = new Map();
    branches.forEach(branch => {
      branchMap.set(branch._id.toString(), {
        branchId: branch._id,
        branchName: branch.name,
        customerCount: 0,
        visitDone: 0,
        visitReject: 0,
        emiReceived: 0,
        emiReject: 0
      });
    });
    
    // Process customer data
    customerData.forEach(item => {
      if (!item._id) return; // Skip if _id is missing
      const branchId = item._id.toString();
      const branchInfo = branchMap.get(branchId);
      if (branchInfo) {
        branchInfo.customerCount = item.customerCount;
      }
    });
    
    // Process visit data
    visitData.forEach(item => {
      if (!item._id.branchId) return; // Skip if branchId is missing
      
      const branchId = item._id.branchId.toString();
      const branchInfo = branchMap.get(branchId);
      if (!branchInfo) return; // Skip if branch not found
      
      if (item._id.status === "accept") {
        branchInfo.visitDone = item.visitCount;
      } else if (item._id.status === "reject") {
        branchInfo.visitReject = item.visitCount;
      }
    });
    
    // Process collection data
    collectionData.forEach(item => {
      if (!item._id.branchId) return; // Skip if branchId is missing
      
      const branchId = item._id.branchId.toString();
      const branchInfo = branchMap.get(branchId);
      if (!branchInfo) return; // Skip if branch not found
      
      if (item._id.status === "accept") {
        branchInfo.emiReceived = item.collectionAmount;
      } else if (item._id.status === "reject") {
        branchInfo.emiReject = item.collectionAmount;
      }
    });
    
    // Convert map to array and sort by customer count (high to low)
    const allBranchSummaries = Array.from(branchMap.values())
      .sort((a, b) => b.customerCount - a.customerCount);
    
    // Apply pagination
    const totalRecords = allBranchSummaries.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedBranchSummaries = allBranchSummaries.slice(skip, skip + limitNum);
    
    // Create pagination metadata
    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalRecords / limitNum),
      totalRecords: totalRecords,
      recordsPerPage: limitNum
    };
    
    return success(res, "Branch summary data retrieved successfully", {
      branches: paginatedBranchSummaries,
      pagination
    });
    
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

// -----------** EMPLOYEE WISE VISIT AND EMI COLLECTION COUNT **-------------
async function getEmployeVisitAndCollectionTableView(req, res) {
  try {
    // Parse date filters from query parameters
    const { startDate, endDate } = req.query;
    
    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Set up date range filters
    let dateFilter = {};
    
    if (startDate && endDate) {
      // If both dates are provided, use them
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    }

    // Get collection role ID
    const collectionRole = await roleModel.findOne({ roleName: "collection" });
    if (!collectionRole) {
      return notFound(res, "Collection role not found");
    }

    // Get collection employees
    const collectionEmployees = await employeeModel.find(
      { 
        roleId: { $in: [collectionRole._id] },
        status: "active"
      },
      {
        employeName: 1,
        employeUniqueId: 1,
        _id: 1
      }
    );

    if (!collectionEmployees.length) {
      return notFound(res, "No collection employees found", []);
    }

    // Extract all unique employee IDs for batch processing
    const employeeIds = collectionEmployees
      .filter(emp => emp.employeUniqueId)
      .map(emp => emp.employeUniqueId);

    // Perform batch queries for all visits and collections
    // Instead of doing individual queries for each employee, get all data at once
    const [allVisitCounts, allCollectionSums] = await Promise.all([
      // Get visit counts for all employees in one go
      newVisitModel.aggregate([
        {
          $match: {
            visitBy: { $regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i') },
            status: "accept",
            ...dateFilter
          }
        },
        {
          $group: {
            _id: {
              $regexFind: {
                input: "$visitBy",
                regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i')
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            employeeId: { $toUpper: { $arrayElemAt: ["$_id.captures", 0] } },
            count: 1,
            _id: 0
          }
        }
      ]),

      // Get collection sums for all employees in one go
      newEmiCollectionModel.aggregate([
        {
          $match: {
            collectedBy: { $regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i') },
            status: "accept",
            ...dateFilter
          }
        },
        {
          $group: {
            _id: {
              $regexFind: {
                input: "$collectedBy",
                regex: new RegExp(`\\b(${employeeIds.join('|')})\\b`, 'i')
              }
            },
            totalReceived: { $sum: "$receivedAmount" }
          }
        },
        {
          $project: {
            employeeId: { $toUpper: { $arrayElemAt: ["$_id.captures", 0] } },
            totalReceived: 1,
            _id: 0
          }
        }
      ])
    ]);

    // Create maps for quick lookups
    const visitCountMap = {};
    const collectionSumMap = {};

    // Fill the visit count map
    allVisitCounts.forEach(item => {
      visitCountMap[item.employeeId] = item.count;
    });

    // Fill the collection sum map
    allCollectionSums.forEach(item => {
      collectionSumMap[item.employeeId] = item.totalReceived;
    });

    // Combine data for each employee
    const allEmployeesWithStats = collectionEmployees.map(employee => {
      const empId = employee.employeUniqueId ? employee.employeUniqueId.toUpperCase() : "";
      return {
        employeName: employee.employeName,
        employeUniqueId: employee.employeUniqueId || "",
        visitAcceptCount: visitCountMap[empId] || 0,
        emiReceivedSum: collectionSumMap[empId] || 0
      };
    });

    // Sort results by emiReceivedSum in descending order
    allEmployeesWithStats.sort((a, b) => b.emiReceivedSum - a.emiReceivedSum);
    
    // Calculate pagination
    const total = allEmployeesWithStats.length;
    const skip = (page - 1) * limit;
    const employeesWithStats = allEmployeesWithStats.slice(skip, skip + limit);
    
    // Prepare pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      recordsPerPage: limit
    };

    return success(res, "Collection employees retrieved successfully", {
      data: employeesWithStats,
      pagination
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}

//--GET METHOD TO GET ALL CUSTOMER API FOR FINEXE CUSTOMER WITH FULL DETAIL----
async function getAllDisbursedCustomer(req, res){
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tokenId = new ObjectId(req.Id);

    // First get employee details
    const employeeData = await employeeModel.findOne({ _id: tokenId });
    if (!employeeData) {
      return notFound(res, "Employee not found");
    }

    const pipeline = [
      // Match active customers and allocated customerFinIds
      {
        $match: { 
          status: "active",
        }
      },

      // Lookup sales person details
      {
        $lookup: {
          from: "employees",
          let: { salesId: "$salesId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$salesId" }] }
              }
            },
            {
              $project: {
                employeUniqueId: 1,
                employeName: 1,
                mobileNo: 1,
                email: 1,
                reportingManagerId: 1,
                _id: 0
              }
            }
          ],
          as: "salesPerson"
        }
      },
      
      // Unwind salesPerson array safely
      {
        $addFields: {
          salesPerson: { $ifNull: [{ $arrayElemAt: ["$salesPerson", 0] }, {}] }
        }
      },
      
      {
        $lookup: {
          from: "employees",
          let: {
            managerId: { $ifNull: ["$salesPerson.reportingManagerId", null] }
          },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $and: [
                    { $ne: ["$$managerId", null] },
                    { $eq: ["$_id", { $toObjectId: "$$managerId" }] }
                  ]
                }
              }
            },
            {
              $project: {
                employeUniqueId: 1,
                employeName: 1,
                mobileNo: 1,
                email: 1,
                _id: 0
              }
            }
          ],
          as: "reportingManagerDetail"
        }
      },
      
      // Unwind reportingManagerDetail array
      {
        $addFields: {
          reportingManagerDetail: {
            $ifNull: [{ $arrayElemAt: ["$reportingManagerDetail", 0] }, {}]
          }
        }
      },

      // Lookup Pd Done Person details
      {
        $lookup: {
          from: "employees",
          let: { pdDoneById: "$pdDoneById" },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $and: [
                    { $ne: ["$$pdDoneById", null] },
                    { $ne: ["$$pdDoneById", ""] },
                    { $eq: ["$_id", { $toObjectId: "$$pdDoneById" }] }
                  ]
                }
              }
            },
            {
              $project: {
                employeUniqueId: 1,
                employeName: 1,
                mobileNo: 1,
                email: 1,
                _id: 0
              }
            }
          ],
          as: "pdPerson"
        }
      },

      // Lookup branch details
      {
        $lookup: {
          from: "newbranches",
          let: { branchId: "$branchId" },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $and: [
                    { $ne: ["$$branchId", null] },
                    { $ne: ["$$branchId", ""] },
                    { $eq: ["$_id", { $toObjectId: "$$branchId" }] }
                  ]
                }
              }
            },
            {
              $project: {
                name: 1,
                location: 1,
                city: 1,
                _id: 0
              }
            }
          ],
          as: "branch"
        }
      },

      // Lookup Partner Name
      {
        $lookup: {
          from: "lenders",
          let: { partnerId: { $ifNull: ["$loanDetail.partnerId", null] } },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $and: [
                    { $ne: ["$$partnerId", null] },
                    { $ne: ["$$partnerId", ""] },
                    { $eq: ["$_id", { $toObjectId: "$$partnerId" }] }
                  ]
                }
              }
            },
            {
              $project: {
                partnerUniqueId: 1,
                fullName: 1,
                email: 1,
                _id: 0
              }
            }
          ],
          as: "partnerDetail"
        }
      },
    
      // Unwind arrays to objects and handle empty cases
      {
        $addFields: {
          pdPerson: { $ifNull: [{ $arrayElemAt: ["$pdPerson", 0] }, {}] },
          branch: { $ifNull: [{ $arrayElemAt: ["$branch", 0] }, {}] },
          partnerDetail: { $ifNull: [{ $arrayElemAt: ["$partnerDetail", 0] }, {}] }
        }
      },
      
      {
        $lookup: {
          from: "employeeallocations",
          let: { customerFinId: "$LD" },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $ne: ["$$customerFinId", null] },
                    { $ne: ["$$customerFinId", ""] },
                    { $eq: ["$customerFinId", "$$customerFinId"] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "employees",
                let: { 
                  allocationIds: { 
                    $filter: {
                      input: ["$allocation1", "$allocation2", "$allocation3", "$allocation4", "$allocation5", "$allocation6", "$allocation7", "$allocation8"],
                      as: "item",
                      cond: { $ne: ["$$item", null] }
                    }
                  }
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$employeUniqueId", "$$allocationIds"] }
                    }
                  },
                  {
                    $project: {
                      _id: 1,
                      employeUniqueId: 1,
                      employeName: 1
                    }
                  }
                ],
                as: "allocationEmployees"
              }
            },
            {
              $addFields: {
                allocationEmployees: {
                  $map: {
                    input: "$allocationEmployees",
                    as: "emp",
                    in: {
                      allocationField: {
                        $switch: {
                          branches: [
                            { case: { $eq: ["$$emp.employeUniqueId", "$allocation1"] }, then: "allocation1" },
                            { case: { $eq: ["$$emp.employeUniqueId", "$allocation2"] }, then: "allocation2" },
                            { case: { $eq: ["$$emp.employeUniqueId", "$allocation3"] }, then: "allocation3" },
                            { case: { $eq: ["$$emp.employeUniqueId", "$allocation4"] }, then: "allocation4" },
                            { case: { $eq: ["$$emp.employeUniqueId", "$allocation5"] }, then: "allocation5" },
                            { case: { $eq: ["$$emp.employeUniqueId", "$allocation6"] }, then: "allocation6" },
                            { case: { $eq: ["$$emp.employeUniqueId", "$allocation7"] }, then: "allocation7" },
                            { case: { $eq: ["$$emp.employeUniqueId", "$allocation8"] }, then: "allocation8" }
                          ],
                          default: "unknown"
                        }
                      },
                      _id: "$$emp._id",
                      employeUniqueId: "$$emp.employeUniqueId",
                      employeName: "$$emp.employeName"
                    }
                  }
                }
              }
            }
          ],
          as: "allocationDetail"
        }
      },

      // Unwind allocationDetail array
      {
        $addFields: {
          allocationDetail: { $ifNull: [{ $arrayElemAt: ["$allocationDetail", 0] }, {}] }
        }
      },
    ];

    const result = await paginateAggregate(disbursedCustomerModel, pipeline, page, limit);

    if (!result.data.length) {
      return notFound(res, "No active customers found");
    }

    return success(res, "Customer details", result);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};


//------- Customer  Allocation Based Get APi-------------------------
  async function getAllocationCustomerByToken(req, res){
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const tokenId = new ObjectId(req.Id);
  
      // First get employee details
      const employeeData = await employeeModel.findOne({ _id: tokenId });
      if (!employeeData) {
        return notFound(res, "Employee not found");
      }
  
      // Get allocated customers from employeeAllocationModel
      const employeeAllocations = await employeeAllocationModel.find({
        $or: [
          { allocation1: employeeData.employeUniqueId },
          { allocation2: employeeData.employeUniqueId },
          { allocation3: employeeData.employeUniqueId },
          { allocation4: employeeData.employeUniqueId },
          { allocation5: employeeData.employeUniqueId },
          { allocation6: employeeData.employeUniqueId },
          { allocation7: employeeData.employeUniqueId },
          { allocation8: employeeData.employeUniqueId }
        ]
      });
  
      // Extract customerFinIds from allocations
      const allocatedCustomerFinIds = employeeAllocations.map(allocation => allocation.customerFinId);
      const pipeline = [
        { $match: { 
            status: "active",
            LD: { $in: allocatedCustomerFinIds }
          }},
            // Lookup sales person details
            {
              $lookup: {
                from: "employees",
                let: { salesId: "$salesId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", { $toObjectId: "$$salesId" }] }
                    }
                  },
                  {
                    $project: {
                      employeUniqueId: 1,
                      employeName: 1,
                      mobileNo: 1,
                      email: 1,
                      reportingManagerId: 1,
                      _id: 0
                    }
                  }
                ],
                as: "salesPerson"
              }
            },
            
            // Unwind salesPerson array safely
            {
              $addFields: {
                salesPerson: { $ifNull: [{ $arrayElemAt: ["$salesPerson", 0] }, {}] }
              }
            },
            
            {
              $lookup: {
                from: "employees",
                let: {
                  managerId: { $ifNull: ["$salesPerson.reportingManagerId", null] }
                },
                pipeline: [
                  {
                    $match: {
                      $expr: { 
                        $and: [
                          { $ne: ["$$managerId", null] },
                          { $eq: ["$_id", { $toObjectId: "$$managerId" }] }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      employeUniqueId: 1,
                      employeName: 1,
                      mobileNo: 1,
                      email: 1,
                      _id: 0
                    }
                  }
                ],
                as: "reportingManagerDetail"
              }
            },
            
            // Unwind reportingManagerDetail array
            {
              $addFields: {
                reportingManagerDetail: {
                  $ifNull: [{ $arrayElemAt: ["$reportingManagerDetail", 0] }, {}]
                }
              }
            },
      
            // Lookup Pd Done Person details
            {
              $lookup: {
                from: "employees",
                let: { pdDoneById: "$pdDoneById" },
                pipeline: [
                  {
                    $match: {
                      $expr: { 
                        $and: [
                          { $ne: ["$$pdDoneById", null] },
                          { $ne: ["$$pdDoneById", ""] },
                          { $eq: ["$_id", { $toObjectId: "$$pdDoneById" }] }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      employeUniqueId: 1,
                      employeName: 1,
                      mobileNo: 1,
                      email: 1,
                      _id: 0
                    }
                  }
                ],
                as: "pdPerson"
              }
            },
      
            // Lookup branch details
            {
              $lookup: {
                from: "newbranches",
                let: { branchId: "$branchId" },
                pipeline: [
                  {
                    $match: {
                      $expr: { 
                        $and: [
                          { $ne: ["$$branchId", null] },
                          { $ne: ["$$branchId", ""] },
                          { $eq: ["$_id", { $toObjectId: "$$branchId" }] }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      name: 1,
                      location: 1,
                      city: 1,
                      _id: 0
                    }
                  }
                ],
                as: "branch"
              }
            },
      
            // Lookup Partner Name
            {
              $lookup: {
                from: "lenders",
                let: { partnerId: { $ifNull: ["$loanDetail.partnerId", null] } },
                pipeline: [
                  {
                    $match: {
                      $expr: { 
                        $and: [
                          { $ne: ["$$partnerId", null] },
                          { $ne: ["$$partnerId", ""] },
                          { $eq: ["$_id", { $toObjectId: "$$partnerId" }] }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      partnerUniqueId: 1,
                      fullName: 1,
                      email: 1,
                      _id: 0
                    }
                  }
                ],
                as: "partnerDetail"
              }
            },
          
            // Unwind arrays to objects and handle empty cases
            {
              $addFields: {
                pdPerson: { $ifNull: [{ $arrayElemAt: ["$pdPerson", 0] }, {}] },
                branch: { $ifNull: [{ $arrayElemAt: ["$branch", 0] }, {}] },
                partnerDetail: { $ifNull: [{ $arrayElemAt: ["$partnerDetail", 0] }, {}] }
              }
            },

            // Lookup customer finance summaries based on LD
            {
              $lookup: {
                from: "customerfinancesummaries",
                let: { ldNumber: { $toString: "$LD" } }, // Convert LD to string
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$LD", "$$ldNumber"] }
                    }
                  },
                  {
                    $project: {  
                      _id: 1,
                      LD: 1,
                      emiAmount: 1,
                      oldDueAmount: 1,
                      netDueAmount: 1,
                      posOutStanding: 1,
                      collectionType: 1,
                      dpdBucket: 1,
                     } 
                  }
                ],
                as: "customerFinanceSummary"
              }
            },
            {
              $unwind: {
                path: "$customerFinanceSummary",
                preserveNullAndEmptyArrays: true 
              }
            },
                  
            {
              $lookup: {
                from: "employeeallocations",
                let: { customerFinId: "$LD" },
                pipeline: [
                  { 
                    $match: { 
                      $expr: { 
                        $and: [
                          { $ne: ["$$customerFinId", null] },
                          { $ne: ["$$customerFinId", ""] },
                          { $eq: ["$customerFinId", "$$customerFinId"] }
                        ]
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: "employees",
                      let: { 
                        allocationIds: { 
                          $filter: {
                            input: ["$allocation1", "$allocation2", "$allocation3", "$allocation4", "$allocation5", "$allocation6", "$allocation7", "$allocation8"],
                            as: "item",
                            cond: { $ne: ["$$item", null] }
                          }
                        }
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $in: ["$employeUniqueId", "$$allocationIds"] }
                          }
                        },
                        {
                          $project: {
                            _id: 1,
                            employeUniqueId: 1,
                            employeName: 1
                          }
                        }
                      ],
                      as: "allocationEmployees"
                    }
                  },
                  {
                    $addFields: {
                      allocationEmployees: {
                        $map: {
                          input: "$allocationEmployees",
                          as: "emp",
                          in: {
                            allocationField: {
                              $switch: {
                                branches: [
                                  { case: { $eq: ["$$emp.employeUniqueId", "$allocation1"] }, then: "allocation1" },
                                  { case: { $eq: ["$$emp.employeUniqueId", "$allocation2"] }, then: "allocation2" },
                                  { case: { $eq: ["$$emp.employeUniqueId", "$allocation3"] }, then: "allocation3" },
                                  { case: { $eq: ["$$emp.employeUniqueId", "$allocation4"] }, then: "allocation4" },
                                  { case: { $eq: ["$$emp.employeUniqueId", "$allocation5"] }, then: "allocation5" },
                                  { case: { $eq: ["$$emp.employeUniqueId", "$allocation6"] }, then: "allocation6" },
                                  { case: { $eq: ["$$emp.employeUniqueId", "$allocation7"] }, then: "allocation7" },
                                  { case: { $eq: ["$$emp.employeUniqueId", "$allocation8"] }, then: "allocation8" }
                                ],
                                default: "unknown"
                              }
                            },
                            _id: "$$emp._id",
                            employeUniqueId: "$$emp.employeUniqueId",
                            employeName: "$$emp.employeName"
                          }
                        }
                      }
                    }
                  }
                ],
                as: "allocationDetail"
              }
            },
      
            // Unwind allocationDetail array
            {
              $addFields: {
                allocationDetail: { $ifNull: [{ $arrayElemAt: ["$allocationDetail", 0] }, {}] }
              }
            },
          ];
      
          const result = await paginateAggregate(disbursedCustomerModel, pipeline, page, limit);
  
      if (!result.data.length) {
        return notFound(res, "No active customers found");
      }
  
      return success(res, "Allocation Customer Details", result);
    } catch (error) {
      console.error(error);
      return unknownError(res, error);
    }}

// --------------* VIST FORM ADD BY COLLECTION PERSON *---------------
async function newVisitEntry(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }
  const tokenId = new ObjectId(req.Id);
  const employeDetail = await employeeModel.findById({ _id: tokenId });
  const name =  employeDetail.employeUniqueId;
  const { longitude = 0 , latitude = 0 , ...otherData } = req.body;

  const visitDetail = await newVisitModel.create({
    ...otherData,
    visitBy:name,
    location: {
      coordinates: [longitude, latitude],
    },
  });

  return success(res, "Visit details saved successfully.", visitDetail);
} catch (error) {
  console.log(error);
  return unknownError(res, error);
}
}

// -------------------Visit Form Update  Api---------------------------
async function visitDetailUpdate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id); // Ensure req.Id is valid
    const { status, visitId, reason } = req.body;

    // Validate required fields
    if (!status || !visitId) {
      return badRequest(res, "Status and VisitId are required.");
    }

    // Allow only "reject" or "accept" statuses
    if (!["reject", "accept"].includes(status)) {
      return badRequest(res, "Invalid status. Only 'reject' or 'accept' is allowed.");
    }

    // Check if employee exists
    const employeeData = await employeeModel.findOne({ _id: tokenId, status: "active" });
    if (!employeeData) {
      return notFound(res, "Employee not found", {});
    }

    // Find visit by ID
    const visitDetail = await newVisitModel.findById(visitId);
    if (!visitDetail) {
      return badRequest(res, "VisitId not found.");
    }

    // Handle "reject" status
    if (status === "reject") {
      visitDetail.status = status;
      visitDetail.reason = reason || "";
      visitDetail.visitStatusUpdateBy = tokenId;
      visitDetail.visitUpdateDate = currentDate;
      await visitDetail.save();
      return success(res, "Visit rejected successfully.", visitDetail);
    }

    // Handle "accept" status
    visitDetail.status = status;
    visitDetail.visitStatusUpdateBy = tokenId;
    visitDetail.visitUpdateDate = currentDate;
    await visitDetail.save();

    return success(res, "Visit accepted successfully.", visitDetail);

  } catch (error) {
    console.error("Error in visitUpdate:", error);
    return unknownError(res, error);
  }
}

// --------Get All Visit Api Status: pending , accept, reject--------
async function getAllVisitDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const pipeline = [
      { $match: { status: status } }, // Match visits by status
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "disbursedcustomers", // Collection name of disbursementModel
          localField: "LD", // Field in visitModel
          foreignField: "LD", // Matching field in disbursementModel
          as: "customerInfo", // Output field for matched data
        },
      },
      {
        $addFields: {
          customerName: { $arrayElemAt: ["$customerInfo.customerDetail.customerName", 0] }, 
        },
      },
      { $project: { customerInfo: 0 } }, // Remove unnecessary field

      {
        $lookup: {
          from: "employees", // Collection name of employees
          localField: "visitBy", // Field in visitModel
          foreignField: "employeUniqueId", // Matching field in employees
          as: "employeeVisitDetail", // Output field for matched data
        },
      },
      {
        $addFields: {
          visitDoneBy: { $arrayElemAt: ["$employeeVisitDetail.employeName", 0] },
        },
      },
      {
        $addFields: {
          visitBy: {
            $concat: [
              { $ifNull: ["$visitDoneBy", ""] }, // If visitDoneBy is null, keep it empty
              "-",
              "$visitBy"
            ]
          }
        }
      },
      { $project: { employeeVisitDetail: 0, visitDoneBy: 0 } }, // Remove unnecessary fields
    ];

    const result = await paginateAggregate(newVisitModel, pipeline, page, limit);

    if (!result.data.length) {
      return success(res, "No Record", result);
    }

    success(res, `Visit Detail List For ${status}`, result);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// --------------* EMi Collection Form Api *--------------------------
async function newEmiCollectionEntry(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const employeeDetail = await employeeModel.findById({ _id: tokenId });
    const name =  employeeDetail.employeUniqueId;

    const {
      LD,  receivedAmount, transactionId, transactionImage, modeOfCollectionId,
      commonId, customerEmail, emiReceivedDate, emiReceivedTime ,longitude = 0 , latitude = 0
    } = req.body;

    
    // Fetch modeOfCollection details
    const modeDetail = await modeOfCollectionModel.findById(modeOfCollectionId);
    if (!modeDetail) {
      return badRequest(res, "Invalid modeOfCollectionId.");
    }

    // Set the status based on the modeOfCollection title
    const status = modeDetail.title === "cashCollection" ? "initiate" : "pending";
      // Prepare data for saving
      const collectionData = {
        ...req.body,
        status: status,
        collectedBy: name,
        location: {
          type: "Point",
          coordinates: [longitude , latitude]
        }
      };  

    // Create the collection entry
    const collectionDetail = await newEmiCollectionModel.create(collectionData);
    success(res, "Collection EMI Added Successfully", collectionDetail);

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// --------Collection Form Fill Then SHow  Manager  For Update Status accept Or reject-----------
async function updateEmiStatus(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
  
    const tokenId = new ObjectId(req.Id);
    const approvalDetail = await employeeModel.findById({ _id: tokenId });
    const name = approvalDetail.employeName;
    const { emiId, status, reason } = req.body;
    let emiData = await newEmiCollectionModel.findById(emiId);
    if (!emiData) {
      return notFound(res, "EMI not found");
    }
  
    let emiDetail = await newEmiCollectionModel.findOne({ _id: new ObjectId(emiId), status: "accept" });
    if (emiDetail) {
      return badRequest(res, "Emi Already Paid");
    }
  
    let emiRejectDetail = await newEmiCollectionModel.findOne({ _id: new ObjectId(emiId), status: "reject" });
    if (emiRejectDetail) {
      return badRequest(res, "Emi Already Reject");
    }
    const modeOfCollection = await modeOfCollectionModel.findById({ _id: new ObjectId(emiData.modeOfCollectionId) });
    const mode = modeOfCollection && modeOfCollection.title ? modeOfCollection.title : null;
    const bankNameDetail = await bankNameModel.findById({ _id: new ObjectId(emiData.commonId) });
    const bankName = bankNameDetail && bankNameDetail.title ? bankNameDetail.title : null;
    const okCreditDetail = await okcreditModel.findById({ _id: new ObjectId(emiData.commonId) });
    const credit = okCreditDetail && okCreditDetail._id ? okCreditDetail._id : null;
    let okCreditIn = null;
    if (credit) {
      const employeDetail = await employeeModel.findById({ _id: new ObjectId(okCreditDetail.employeeId) });
      okCreditIn = employeDetail && employeDetail.employeName ? employeDetail.employeName : null;
    }
  
    if (status === "accept" && emiData.status === "pending") {
      const customerFinance = await customerFinanceModel.findOne({
        LD: emiData.LD,
      });
      if (!customerFinance) {
        return notFound(res, "Customer Finance Data Not Found");
      }

      let { emiAmount, netDueAmount, oldDueAmount } = customerFinance;
      let emiReceived = emiData.receivedAmount || 0;
      let overDueAmount = oldDueAmount; // Assuming overdue amount is stored in oldDueAmount

      // **Logic Implementation**
      if (emiReceived >= emiAmount) {
        emiReceived -= emiAmount;
        emiAmount = 0;
        overDueAmount = Math.max(0, overDueAmount - emiReceived);
      } else {
        emiAmount -= emiReceived;
      }

      netDueAmount = emiAmount + overDueAmount;

      // **Update Customer Finance Model**
      await customerFinanceModel.findByIdAndUpdate(customerFinance._id, {
        emiAmount,
        netDueAmount,
        oldDueAmount: overDueAmount,
        // lastEmiReceivedDate: currentDate
      });

      emiData.status = "accept";
      emiData.reason = reason;
      emiData.emiStatusUpdateBy = tokenId; 
      emiData.emiUpdateDate = currentDate;
      data = await emiData.save();
      const customer = await disbursedCustomerModel.findOne({LD: data.LD});
      const custData = customer.customerDetail.customerName
      const lastReceipt = await newEmiCollectionModel.findOne({}).sort({ receiptNo: -1 });
      let receiptNo = 1001;
      if (lastReceipt && lastReceipt.receiptNo) {
        receiptNo = lastReceipt.receiptNo + 1;
      }
  
      const pdfRelativePath = await createEmiReceiptPdf(data, customer, receiptNo);
  
      await newEmiCollectionModel.findByIdAndUpdate({ _id: emiId }, { pdf: pdfRelativePath, receiptNo: receiptNo });
      success(res, "EMI Collection Status Accepted Successfully", { data, pdfRelativePath });
  
      const pdfEmailContent = `
        <p>Hello ${custData},</p>
        <p>Thank you for paying EMI</p>
      `;
      
      const baseURL = process.env.BASE_URL;
      const ccEmails = [process.env.PDF_CCEMAIL1, process.env.PDF_CCEMAIL2];
      
      const attachments = [{
        path: pdfRelativePath,
        filename: 'file.pdf',
        contentType: 'application/pdf'
      }];
      if(data.customerEmail && data.customerEmail.trim().toLowerCase() !== "null") {
        sendEmails(ccEmails, data.customerEmail, `The ${emiData.LD} EMI Collection Reciept.`, pdfEmailContent, attachments);
      } else if (data.customerEmail === null) {
        console.log("email null ", data.customerEmail)
        sendEmails(ccEmails, null, `The ${emiData.LD} EMI Collection Receipt.`, pdfEmailContent, attachments);
      }
       
  
    } else if (status === "reject" && emiData.status === "pending") {
      emiData.status = "reject";
      emiData.reason = reason;
      emiData.remarkByManager = "payment Not Received";
      emiData.emiStatusUpdateBy = tokenId; 
      emiData.emiUpdateDate = currentDate;
      data = await emiData.save();
      // if (mode === "cashCollection") {
      //   const totalCashBalance = await totalCashModel.findOne({ employeeId: okCreditDetail.employeeId });
      //   if (totalCashBalance) {
      //     totalCashBalance.creditAmount -= emiData.receivedAmount; 
      //     await totalCashBalance.save();
      //   }
      // }
      success(res, "EMI Collection Status Rejected Successfully", data);
    }
  
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
  }

// --------------STATUS : pending , accept , reject api Add On Approval DashBoard-----
async function getAllEmiCollection(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const googleSheetData = await disbursedCustomerModel.find({}); 

    const { status,  LD, date } = req.query; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filterConditions = { status };
    if (LD) filterConditions.LD = LD;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      filterConditions.createdAt = { $gte: startOfDay, $lt: endOfDay };
    }

    const totalRecords = await newEmiCollectionModel.countDocuments(filterConditions);

    const emiStatus = await newEmiCollectionModel.aggregate([
      { $match: filterConditions },
      {
        $lookup: {
          from: "modelofcollections",
          localField: "modeOfCollectionId",
          foreignField: "_id",
          as: "modeOfCollectionDetail"
        }
      },
      {
        $lookup: {
          from: "banknames",
          localField: "commonId",
          foreignField: "_id",
          as: "bankNameDetail"
        }
      },
      {
        $lookup: {
          from: "okcredits",
          localField: "commonId",
          foreignField: "_id",
          as: "okCreditDetail"
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "okCreditDetail.employeeId",
          foreignField: "_id",
          as: "employeDetail"
        }
      },
      {
        $addFields: {
          employeDetail: {
            $map: {
              input: "$employeDetail",
              as: "employee",
              in: {
                _id: "$$employee._id",
                employeName: "$$employee.employeName",
                email: "$$employee.email",
                workEmail: "$$employee.workEmail",
                mobileNo: "$$employee.mobileNo",
                employeePhoto: { $ifNull: ["$$employee.employeePhoto", ""] }
              }
            }
          }
        }
      },
      
      {
        $lookup: {
          from: "lenders",
          localField: "commonId",
          foreignField: "_id",
          as: "partnerDetail"
        }
      },
      {
        $lookup: {
          from: "customerfinancesummaries",
          localField: "LD",
          foreignField: "LD",
          as: "customerFinanceDetail"
        }
      },
      {
        $project: {
          "modeOfCollectionDetail.__v": 0,
          "bankNameDetail.__v": 0,
          "okCreditDetail.__V": 0,
          "partnerDetail.__v": 0,
          "customerFinanceDetail.__v": 0
        }
      }
    ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const matchedData = emiStatus.filter(emi => {
      const matchingLDData = googleSheetData.find(detail => detail.LD === emi.LD);
      if (matchingLDData) {
        emi.customerData = matchingLDData;
        return true;
      }
      return false;
    });

    if (matchedData.length === 0) {
      return notFound(res, 'No Matching Data Found From The Google Sheet', []);
    }

    success(res, `Emi Collection List For ${status}`, {
      data: matchedData,
      currentPage: Number(page),
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    });
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


// ----------------** Ok Cash  Person Update Emi **------------------
async function emiStatusUpdateByCashPerson(req, res) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return serverValidation(res, {
      errorName: "serverValidation",
      errors: errors.array(),
    });
  }

  const tokenId = new ObjectId(req.Id);
  const approvalDetail = await employeeModel.findById({ _id: tokenId });
  const name = approvalDetail.employeName;

  const { emiId, status, reason } = req.body;

  // Find the EMI by ID
  let emiData = await newEmiCollectionModel.findById(emiId);
  if (!emiData) {
    return notFound(res, "EMI not found");
  }

  // Handle status transitions: initiate -> pending / reject
  if (status === "pending") {
    if (emiData.status !== "initiate") {
      return badRequest(res, "Status can only be updated from 'initiate' to 'pending'.");
    }
    emiData.status = "pending";
    emiData.reason = reason;

    const updatedEmi = await emiData.save();
    return success(res, "EMI status updated to 'pending'.", updatedEmi);

  } else if (status === "reject") {
    if (emiData.status === "initiate") {
      emiData.status = "reject";
      emiData.reason = reason;
      const updatedEmi = await emiData.save();
      return success(res, "EMI status updated to 'reject'.", updatedEmi);

  } else if (emiData.status === "pending") {
      emiData.status = "reject";
      emiData.reason = reason;
      return success(res, "EMI status updated to 'reject'.", updatedEmi);
  }
   
   
  } else {
    return badRequest(res, "Invalid status update. Only 'pending' or 'reject' are allowed.");
  }

} catch (error) {
  console.log(error);
  return unknownError(res, error);
}
}

//-------------------** EMi List OkCredit Person Account commonId those Id pr payment hua hai **-----------------
async function getcashEmiPerson(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tokenId = new ObjectId(req.Id);
    const employeDetail = await employeeModel.findById({ _id: tokenId });
    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }

    // Get the okCreditDetail for the logged-in employee
    const okCreditDetail = await okcreditModel.findOne({
      employeeId: employeDetail._id,
    });
    if (!okCreditDetail) {
      return badRequest(res, "OkCredit details not found.");
    }
    const totalRecords = await newEmiCollectionModel.countDocuments({
      status: status,
      commonId: okCreditDetail._id,
    });

    const emiStatus = await newEmiCollectionModel
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
          $addFields: {
            employeDetail: {
              $map: {
                input: "$employeDetail",
                as: "emp",
                in: {
                  _id: "$$emp._id",
                  employeName: "$$emp.employeName",
                  employeUniqueId: "$$emp.employeUniqueId",
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "collectedBy",
            foreignField: "employeUniqueId",
            as: "collectedByDetail",
          },
        },
        {
          $addFields: {
            collectedBy: {
              $cond: {
                if: { $gt: [{ $size: "$collectedByDetail" }, 0] },
                then: {
                  $concat: [
                    { $arrayElemAt: ["$collectedByDetail.employeName", 0] },
                    "-",
                    { $arrayElemAt: ["$collectedByDetail.employeUniqueId", 0] },
                    
                  ],
                },
                else: "",
              },
            },
          },
        },
        {
          $project: {
            collectedByDetail: 0, // Remove unnecessary lookup field
          },
        },
        
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      const response = {
        currentPage: page,
        limit: limit,
        totalRecords: totalRecords,
        currentPageRecords: emiStatus.length,
        data: emiStatus,
      };

    success(res, `Emi Collection List For ${status}`, response);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// -----------------** COLLECTION GALLERY VIST AND EMI COLLECTED **--------------------------------------------
async function getCollectionGalleryApi(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { startDate, endDate, filterBy, branchId } = req.query;

    // Prepare date filters
    const today = new Date();
    const defaultStartDate = new Date(today);
    defaultStartDate.setHours(0, 0, 0, 0);
    const defaultEndDate = new Date(today);
    defaultEndDate.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Prepare queries
    let transactionQuery = { createdAt: { $gte: start, $lte: end } };
    let visitQuery = { createdAt: { $gte: start, $lte: end } };

    if (filterBy) {
      transactionQuery.collectedBy = { $regex: new RegExp(filterBy, 'i') };
      visitQuery.visitBy = { $regex: new RegExp(filterBy, 'i') };
    }

    // Execute all database queries in parallel
    const [transactions, visits] = await Promise.all([
      newEmiCollectionModel.find(transactionQuery)
        .select('LD collectedBy transactionImage remarkByCollection receivedAmount status location createdAt')
        .sort({ createdAt: -1 })
        .lean(), // Use lean() for better performance

      newVisitModel.find(visitQuery)
        .select('LD visitBy visitSelfie customerResponse reasonForNotPay solution reasonForCustomerNotContactable status location createdAt')
        .sort({ createdAt: -1 })
        .lean() // Use lean() for better performance
    ]);

    // Extract unique LD numbers for customer details lookup
    const ldNumbers = [...new Set([...transactions.map(t => t.LD), ...visits.map(v => v.LD)])];
    
    // Get customer details in parallel with total visits count
    const [disbursedData, totalVisits] = await Promise.all([
      disbursedCustomerModel.find({ LD: { $in: ldNumbers } })
        .select('LD customerDetail.customerName customerDetail.customerPhoto')
        .lean(),
      
      newVisitModel.countDocuments({ ...visitQuery, status: "accept" })
    ]);

    // Create customer map for faster lookups
    const customerMap = disbursedData.reduce((map, item) => {
      map[item.LD] = item.customerDetail.customerName;
      return map;
    }, {});

    const customerPhotoMap = disbursedData.reduce((map, item) => {
      map[item.LD] = item.customerDetail.customerPhoto;
      return map;
    }, {});

    // Helper function to extract employee ID
    const extractEmployeeId = (identifier) => {
      const match = identifier.match(/([A-Za-z]+[-]?\d+)/);
      return match ? match[1].toUpperCase() : null;
    };

    // Group data by employee ID (more efficient algorithm)
    const groupedData = {};
    
    // Process transactions
    for (const transaction of transactions) {
      const visitAndEmiBy = extractEmployeeId(transaction.collectedBy);
      if (!visitAndEmiBy) continue;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      
      groupedData[visitAndEmiBy].transactionImages.push({
        transactionImage: transaction.transactionImage,
        LD: transaction.LD,
        customerName: customerMap[transaction.LD] || "",
        customerPhoto: customerPhotoMap[transaction.LD] || "",
        remarkByCollection: transaction.remarkByCollection,
        receivedAmount: transaction.receivedAmount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      });
    }

    // Process visits
    for (const visit of visits) {
      const visitAndEmiBy = extractEmployeeId(visit.visitBy);
      if (!visitAndEmiBy) continue;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      
      groupedData[visitAndEmiBy].visitSelfies.push({
        visitSelfie: visit.visitSelfie,
        LD: visit.LD,
        customerName: customerMap[visit.LD] || "",
        customerPhoto: customerPhotoMap[visit.LD] || "",
        customerResponse: visit.customerResponse,
        reasonForNotPay: visit.reasonForNotPay,
        solution: visit.solution,
        reasonForCustomerNotContactable: visit.reasonForCustomerNotContactable,
        status: visit.status,
        location: visit.location,
        createdAt: visit.createdAt,
      });
    }

    // Apply branch filtering if needed
    let filteredGroupedArray;
    let branchEmployeeIds = [];
    
    if (branchId) {
      // Get all employees from the specified branch
      const branchEmployees = await employeeModel.find({ branchId: branchId })
        .select('employeUniqueId employeePhoto')
        .lean();
      
      branchEmployeeIds = branchEmployees.map(emp => emp.employeUniqueId);
    }

    // Convert to array 
    let groupedArray = Object.entries(groupedData).map(([employeeId, data]) => ({
      visitAndEmiBy: employeeId,
      ...data,
    }));

    // Apply branch filter if provided
    if (branchId && branchEmployeeIds.length > 0) {
      groupedArray = groupedArray.filter(item => 
        branchEmployeeIds.includes(item.visitAndEmiBy)
      );
    }

    // Calculate pagination values
    const totalRecords = groupedArray.length;
    const paginatedData = groupedArray.slice(skip, skip + limit);
    const employeeIds = paginatedData.map(item => item.visitAndEmiBy);

    // Get employee details
    const employees = await employeeModel.find({ employeUniqueId: { $in: employeeIds } })
      .select('employeUniqueId employeName mobileNo workEmail employeePhoto fatherName joiningDate branchId')
      .lean();
    
    // Extract all branch IDs from employees
    const branchIds = employees.map(emp => emp.branchId).filter(Boolean);
    
    // Fetch branch details in parallel
    const branches = await branchModel.find({ _id: { $in: branchIds } })
      .select('_id name')
      .lean();
    
    // Create branch map for faster lookups
    const branchMap = branches.reduce((map, branch) => {
      map[branch._id.toString()] = branch.name;
      return map;
    }, {});
    
    const employeeDet = employees.reduce((map, employee) => {
      map[employee.employeUniqueId] = `${employee.employeName} (${employee.employeUniqueId})`;
      return map;
    }, {});

    // Create employee map with branch name included
    const employeeMap = employees.reduce((map, employee) => {
      // Add branch name to employee object if branchId exists
      const employeeWithBranch = { ...employee };
      if (employee.branchId) {
        const branchIdStr = employee.branchId.toString();
        employeeWithBranch.branchName = branchMap[branchIdStr] || "Unknown Branch";
      } else {
        employeeWithBranch.branchName = "No Branch Assigned";
      }
      
      map[employee.employeUniqueId] = employeeWithBranch;
      return map;
    }, {});

    // Format final result
    const result = employeeIds.map((employeeId) => ({
      visitAndEmiBy:     employeeDet[employeeId] || employeeId,
      transactionImages: groupedData[employeeId].transactionImages,
      visitSelfies:      groupedData[employeeId].visitSelfies,
      employeeDetail:    employeeMap[employeeId] || null,
    }));

    // Prepare pagination data
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    };

    success(res, "Grouped Visit and Transaction Data", { result, pagination });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ---------------COLLECTION GALLERY  VISIT AND EMI BY EMPLOYEID------------------
async function getCollectionGalleryEmployeeId(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { filterBy, branchId, employeeId } = req.query;

    // Check if employeeId exists and get employee details
    let employeeUniqueId;
    if (employeeId) {
      const employee = await employeeModel.findById(employeeId)
        .select('employeUniqueId')
        .lean();
      
      if (!employee) {
        return failure(res, "Employee not found");
      }
      
      employeeUniqueId = employee.employeUniqueId;
    }

    // Prepare queries without date restrictions
    let transactionQuery = {};
    let visitQuery = {};

    if (filterBy) {
      transactionQuery.collectedBy = { $regex: new RegExp(filterBy, 'i') };
      visitQuery.visitBy = { $regex: new RegExp(filterBy, 'i') };
    }

    // Add employee filter if employeeId was provided
    if (employeeUniqueId) {
      transactionQuery.collectedBy = { $regex: new RegExp(employeeUniqueId, 'i') };
      visitQuery.visitBy = { $regex: new RegExp(employeeUniqueId, 'i') };
    }

    // Execute all database queries in parallel
    const [transactions, visits] = await Promise.all([
      newEmiCollectionModel.find(transactionQuery)
        .select('LD collectedBy transactionImage remarkByCollection receivedAmount status createdAt')
        .sort({ createdAt: -1 })
        .lean(), // Use lean() for better performance

      newVisitModel.find(visitQuery)
        .select('LD visitBy visitSelfie customerResponse reasonForNotPay solution reasonForCustomerNotContactable status location createdAt')
        .sort({ createdAt: -1 })
        .lean() // Use lean() for better performance
    ]);

    // Extract unique LD numbers for customer details lookup
    const ldNumbers = [...new Set([...transactions.map(t => t.LD), ...visits.map(v => v.LD)])];
    
    // Get customer details in parallel with total visits count
    const [disbursedData, totalVisits] = await Promise.all([
      disbursedCustomerModel.find({ LD: { $in: ldNumbers } })
        .select('LD customerDetail.customerName')
        .lean(),
      
      newVisitModel.countDocuments({ ...visitQuery, status: "accept" })
    ]);

    // Create customer map for faster lookups
    const customerMap = disbursedData.reduce((map, item) => {
      map[item.LD] = item.customerDetail.customerName;
      return map;
    }, {});

    // Helper function to extract employee ID
    const extractEmployeeId = (identifier) => {
      const match = identifier.match(/([A-Za-z]+[-]?\d+)/);
      return match ? match[1].toUpperCase() : null;
    };

    // Group data by employee ID (more efficient algorithm)
    const groupedData = {};
    
    // Process transactions
    for (const transaction of transactions) {
      const visitAndEmiBy = extractEmployeeId(transaction.collectedBy);
      if (!visitAndEmiBy) continue;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      
      groupedData[visitAndEmiBy].transactionImages.push({
        transactionImage: transaction.transactionImage,
        LD: transaction.LD,
        customerName: customerMap[transaction.LD] || "",
        remarkByCollection: transaction.remarkByCollection,
        receivedAmount: transaction.receivedAmount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      });
    }

    // Process visits
    for (const visit of visits) {
      const visitAndEmiBy = extractEmployeeId(visit.visitBy);
      if (!visitAndEmiBy) continue;

      if (!groupedData[visitAndEmiBy]) {
        groupedData[visitAndEmiBy] = { transactionImages: [], visitSelfies: [] };
      }
      
      groupedData[visitAndEmiBy].visitSelfies.push({
        visitSelfie: visit.visitSelfie,
        LD: visit.LD,
        customerName: customerMap[visit.LD] || "",
        customerResponse: visit.customerResponse,
        reasonForNotPay: visit.reasonForNotPay,
        solution: visit.solution,
        reasonForCustomerNotContactable: visit.reasonForCustomerNotContactable,
        status: visit.status,
        location: visit.location,
        createdAt: visit.createdAt,
      });
    }

    // Apply branch filtering if needed
    let filteredGroupedArray;
    let branchEmployeeIds = [];
    
    if (branchId) {
      // Get all employees from the specified branch
      const branchEmployees = await employeeModel.find({ branchId: branchId })
        .select('employeUniqueId')
        .lean();
      
      branchEmployeeIds = branchEmployees.map(emp => emp.employeUniqueId);
    }

    // Convert to array 
    let groupedArray = Object.entries(groupedData).map(([employeeId, data]) => ({
      visitAndEmiBy: employeeId,
      ...data,
    }));

    // Apply branch filter if provided
    if (branchId && branchEmployeeIds.length > 0) {
      groupedArray = groupedArray.filter(item => 
        branchEmployeeIds.includes(item.visitAndEmiBy)
      );
    }

    // Calculate pagination values
    const totalRecords = groupedArray.length;
    const paginatedData = groupedArray.slice(skip, skip + limit);
    const employeeIds = paginatedData.map(item => item.visitAndEmiBy);

    // Get employee details
    const employees = await employeeModel.find({ employeUniqueId: { $in: employeeIds } })
      .select('employeUniqueId employeName mobileNo workEmail employeePhoto fatherName joiningDate branchId')
      .lean();
    
    // Extract all branch IDs from employees
    const branchIds = employees.map(emp => emp.branchId).filter(Boolean);
    
    // Fetch branch details in parallel
    const branches = await branchModel.find({ _id: { $in: branchIds } })
      .select('_id name')
      .lean();
    
    // Create branch map for faster lookups
    const branchMap = branches.reduce((map, branch) => {
      map[branch._id.toString()] = branch.name;
      return map;
    }, {});
    
    const employeeDet = employees.reduce((map, employee) => {
      map[employee.employeUniqueId] = `${employee.employeName} (${employee.employeUniqueId})`;
      return map;
    }, {});

    // Create employee map with branch name included
    const employeeMap = employees.reduce((map, employee) => {
      // Add branch name to employee object if branchId exists
      const employeeWithBranch = { ...employee };
      if (employee.branchId) {
        const branchIdStr = employee.branchId.toString();
        employeeWithBranch.branchName = branchMap[branchIdStr] || "Unknown Branch";
      } else {
        employeeWithBranch.branchName = "No Branch Assigned";
      }
      
      map[employee.employeUniqueId] = employeeWithBranch;
      return map;
    }, {});

    // Format final result
    const result = employeeIds.map((employeeId) => ({
      visitAndEmiBy:     employeeDet[employeeId] || employeeId,
      transactionImages: groupedData[employeeId].transactionImages,
      visitSelfies:      groupedData[employeeId].visitSelfies,
      employeeDetail:    employeeMap[employeeId] || null,
    }));

    // Prepare pagination data
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
    };

    success(res, "Grouped Visit and Transaction Data", { result, pagination });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}



// Define all key mappings in one place
const MODEL_MAPPINGS = {
  customerLms: {
    model: disbursedCustomerModel,
    fields: {
      "LD": "LD",
      "LOAN NO .": "loanNo",
      "CUSTOMER NAME": "customerDetail.customerName",
      "FATHER NAME": "customerDetail.fatherName",
      "MOBILE": "customerDetail.mobile",
      "EMAIL": "customerDetail.email",
      "VILLAGE": "customerDetail.village",
      "ADDRESS": "customerDetail.address",
      "STATE": "customerDetail.state",
      "GENDER": "customerDetail.gender",
      "DOB": "customerDetail.dob",
      "AGE": "customerDetail.age",
      "CIBIL SCORE": "customerDetail.cibilScore",

      "PRODUCT": "loanDetail.productId",
      "CASE TYPE": "loanDetail.caseType",
      "PARTNER NAME": "loanDetail.partnerId",
      "LOAN AMOUNT": "loanDetail.loanAmount",
      "TENURE": "loanDetail.tenure",
      "ROI": "loanDetail.roi",
      "EMI": "loanDetail.emi",
      "PF CHARGES": "loanDetail.pfCharges",
      "DOCUMENT CHARGES": "loanDetail.documentCharges",
      "CERSAI CHARGES": "loanDetail.cersaiCharges",
      "INSURANCE CHARGES": "loanDetail.insuranceCharges",
      "ACTUAL PRE EMI": "loanDetail.actualPreEmi",
      "NET DISBURSEMENT AMOUNT": "loanDetail.netDisbursementAmount",
      "SANCTION DATE": "loanDetail.sanctionDate",
      "DISBURSEMENT DATE": "loanDetail.disbursementDate",
      "DISBURSEMENT MONTH": "loanDetail.disbursementMonth",

      "EMI CYCLE": "emiDetail.emiCycle",
      "FIRST EMI DATE": "emiDetail.firstEmiDate",
      "FIRST EMI MONTH": "emiDetail.firstEmiMonth",

      "PROPERTY PAPER TYPE": "propertyDetail.propertyPaperType",
      "PROPERTY TYPE": "propertyDetail.propertyType",
      "MARKET VALUE": "propertyDetail.marketValue",
      "LTV": "propertyDetail.ltv",
      "LAT": "propertyDetail.lat",
      "LONG": "propertyDetail.long",

      "MONTHLY INCOME": "incomeDetail.monthlyIncome",
      "MONTHLY OBLIGATIONS": "incomeDetail.monthlyObligations",
      "FOIR": "incomeDetail.foir",
      "CUSTOMER PROFILE": "incomeDetail.customerProfile",
      "CUSTOMER SEGMENT": "incomeDetail.customerSegment"
    }
  },
  customerfinanceDetail: {
    model: customerFinanceModel,
    fields: {
      "LD": "LD",
      "COLLECTION TYPE": "collectionType",
      "EMI": "emiAmount",
      "LAST EMI DATE": "lastEmiDate",
      "LAST EMI RECEIVED DATE": "lastEmiReceivedDate",
      "NET DUE": "netDueAmount",
      "OLD DUE": "oldDueAmount",
      "POS OUTSTANDING": "posOutstanding",
      "DPD BUCKET": "dpdBucket",
    }
  }
};

// Helper functions
const formatExcelDate = (value) => {
  if (!value) return "";
  
  // Handle string format dd-mm-yyyy
  if (typeof value === 'string') {
    value = value.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      return value;
    }
    // Try to parse other date string formats
    const parsedDate = new Date(value);
    if (!isNaN(parsedDate.getTime())) {
      return `${String(parsedDate.getDate()).padStart(2, '0')}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${parsedDate.getFullYear()}`;
    }
  }
  
  // Handle Excel numeric date (days since 1900-01-00)
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numericValue = Number(value);
    // Excel's date system has a leap year bug where it thinks 1900 was a leap year
    // We need to adjust for dates after February 28, 1900
    let adjustedValue = numericValue;
    if (numericValue > 59) { // March 1, 1900 is represented as day 61
      adjustedValue -= 1;
    }
    
    const baseDate = new Date(1900, 0, 0);
    const date = new Date(baseDate.getTime() + (adjustedValue * 24 * 60 * 60 * 1000));
    
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    }
  }
  
  // Handle JavaScript Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${String(value.getDate()).padStart(2, '0')}-${String(value.getMonth() + 1).padStart(2, '0')}-${value.getFullYear()}`;
  }
  
  // Return original value if we couldn't format it
  return value.toString().trim();
};

const transformValue = (value, fieldName) => {
  // Skip undefined or null values
  if (value === undefined || value === null) {
    return fieldName.includes('Date') ? "" : 
           (numericFields.includes(fieldName) ? 0 : "");
  }
  
  const dateFields = [
    'firstEmiDate', 'lastEmiDate', 'lastEmiReceivedDate', 
    'sanctionDate', 'disbursementDate', 'dob'
  ];
  
  const numericFields = [
    'netDue', 'oldDue', 'posOutstanding', 'interestOutstanding', 
    'dpdBucket', 'loanAmount', 'emi', 'pfCharges', 'documentCharges', 
    'cersaiCharges', 'insuranceCharges', 'actualPreEmi', 
    'netDisbursementAmount', 'marketValue', 'ltv', 'lat', 'long', 
    'monthlyIncome', 'monthlyObligations', 'foir', 'age', 'cibilScore',
    'tenure', 'roi', 'emiAmount'
  ];
  
  // Handle date fields
  if (dateFields.includes(fieldName)) {
    return formatExcelDate(value);
  }
  
  // Handle numeric fields
  if (numericFields.includes(fieldName)) {
    // Handle Excel error values and empty strings
    if (typeof value === 'string' && (
        value.includes('#VALUE!') || 
        value.includes('#DIV/0!') || 
        value.includes('#N/A') || 
        value.trim() === '')
    ) {
      return 0;
    }
    
    // Convert to number
    if (typeof value === 'number') {
      return value;
    } else if (typeof value === 'string') {
      // Remove non-numeric characters except decimal point and negative sign
      const cleanedValue = value.toString().replace(/[^0-9.-]/g, '');
      return parseFloat(cleanedValue) || 0;
    }
    return 0;
  }
  
  // Handle phone numbers - ensure they're numbers
  if (fieldName === 'customerDetail.mobile' || fieldName === 'mobile') {
    if (typeof value === 'string') {
      // Remove non-numeric characters
      const cleanedValue = value.toString().replace(/\D/g, '');
      return cleanedValue ? cleanedValue : null;
    }
    return typeof value === 'number' ? value.toString() : null;
  }
  
  // Default string handling
  return value ? value.toString().trim() : "";
};

// No validation function

async function importAllData(req, res) {
  let fileCleanupNeeded = false;
  
  try {
    // Validate request
    if (!req.file) {
      return badRequest(res, "No file uploaded.");
    }
    
    fileCleanupNeeded = true;
    
    // Read file
    const fileBuffer = fs.readFileSync(req.file.path);
    const workbook = xlsx.read(fileBuffer, { 
      type: "buffer",
      cellDates: true,
      cellNF: true,
      cellText: false
    });
    
    // Validate workbook
    if (!workbook || workbook.SheetNames.length === 0) {
      return badRequest(res, "The uploaded file contains no sheets.");
    }
    
    // Check for required sheet
    const sheetName = "LEGAL CASES DATA";
    if (!workbook.SheetNames.includes(sheetName)) {
      return badRequest(res, `Sheet "${sheetName}" not found in the workbook.`);
    }
    
    // Extract data
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, {
      raw: false,
      dateNF: 'DD-MM-YYYY',
      defval: '' // Default value for empty cells
    });
    
    // Validate data
    if (!data || data.length === 0) {
      return badRequest(res, "No data found in the sheet.");
    }

    // Process branch data for customerLms model
    let branchMap = {};
    if (data.some(item => item["BRANCH"])) {
      try {
        const uniqueBranchNames = [...new Set(data.map(item => item["BRANCH"]).filter(Boolean))];
        
        if (uniqueBranchNames.length > 0) {
          const branchDocs = await branchModel.find({ 
            name: { $in: uniqueBranchNames } 
          }).select("_id name").lean();
          
          branchMap = branchDocs.reduce((acc, doc) => {
            acc[doc.name] = doc._id;
            return acc;
          }, {});
        }
      } catch (branchError) {
        console.error("Error fetching branch data:", branchError);
        // Continue with import even if branch mapping fails
      }
    }

    // Process data for each model
    const allResults = {};
    
    for (const [modelKey, modelConfig] of Object.entries(MODEL_MAPPINGS)) {
      // Transform data according to model mappings
      const transformedData = [];
      
      data.forEach((item, index) => {
        const newItem = {};
        const nestedFields = {};
        
        // Process all fields according to mappings
        for (const [key, mappedKey] of Object.entries(modelConfig.fields)) {
          if (item[key] !== undefined) {
            // Check if this is a nested field
            if (mappedKey.includes('.')) {
              const [parent, child] = mappedKey.split('.');
              if (!nestedFields[parent]) nestedFields[parent] = {};
              nestedFields[parent][child] = transformValue(item[key], mappedKey);
            } else {
              newItem[mappedKey] = transformValue(item[key], mappedKey);
            }
          }
        }
        
        // Add nested fields to the item
        for (const [parent, children] of Object.entries(nestedFields)) {
          newItem[parent] = children;
        }
        
        // Special handling for customerLms model's branchId
        if (modelKey === 'customerLms' && item['BRANCH']) {
          const branchValue = item['BRANCH'].toString().trim();
          newItem.branchId = branchMap[branchValue] ? new ObjectId(branchMap[branchValue]) : null;
        }
        
        // Add to transformedData if it has an LD field
        if (Object.keys(newItem).length > 0 && newItem.LD) {
          transformedData.push(newItem);
        }
      });
      
      // No invalid records tracking
      
      // Skip if no valid data for this model
      if (transformedData.length === 0) {
        allResults[modelKey] = { created: 0, updated: 0, failed: 0, skipped: 0 };
        continue;
      }

      // Get existing records to determine updates vs inserts
      const ldNumbers = transformedData.map(item => item.LD);
      const existingDocs = await modelConfig.model.find({ 
        LD: { $in: ldNumbers } 
      }).select('LD').lean();
      
      const existingLDs = new Set(existingDocs.map(doc => doc.LD));

      // Prepare operations
      const operations = [];
      const results = { created: 0, updated: 0, failed: 0, skipped: 0 };
      
      transformedData.forEach(item => {
        if (existingLDs.has(item.LD)) {
          operations.push({
            updateOne: {
              filter: { LD: item.LD },
              update: { $set: item },
              upsert: false
            }
          });
          results.updated++;
        } else {
          operations.push({
            insertOne: {
              document: item
            }
          });
          results.created++;
        }
      });

      // Execute operations in batches
      if (operations.length > 0) {
        const batchSize = 100;
        try {
          for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize);
            await modelConfig.model.bulkWrite(batch, { 
              ordered: false // Continue processing remaining operations even if some fail
            });
          }
        } catch (bulkWriteError) {
          console.error(`Error during bulkWrite for ${modelKey}:`, bulkWriteError);
          // Count failed operations from writeErrors array if available
          if (bulkWriteError.writeErrors && Array.isArray(bulkWriteError.writeErrors)) {
            results.failed += bulkWriteError.writeErrors.length;
            // Adjust created/updated counts based on failures
            const failedIndexes = new Set(bulkWriteError.writeErrors.map(e => e.index));
            results.created = operations.filter((op, idx) => 
              !failedIndexes.has(idx) && op.insertOne).length;
            results.updated = operations.filter((op, idx) => 
              !failedIndexes.has(idx) && op.updateOne).length;
          } else {
            // If we can't determine exact failures, assume half the operations failed
            results.failed = Math.floor(operations.length / 2);
            results.created = Math.ceil(results.created / 2);
            results.updated = Math.ceil(results.updated / 2);
          }
        }
      }

      allResults[modelKey] = results;
    }

    // Clean up the temporary file
    try {
      fs.unlinkSync(req.file.path);
      fileCleanupNeeded = false;
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
      // Continue execution despite cleanup error
    }

    // Return success with results
    return success(res, { 
      message: "Data import completed",
      results: allResults
    });

  } catch (error) {
    console.error("Error importing data:", error);
    
    // Clean up file if needed
    if (fileCleanupNeeded && req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file after error:", cleanupError);
      }
    }
    
    // Return appropriate error
    if (error.name === 'ValidationError') {
      return badRequest(res, "Data validation error: " + error.message);
    } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return badRequest(res, "Database error: " + error.message);
    } else {
      return unknownError(res, error);
    }
  }
}

// ----------------EMI Detail Download Xecl---------------------------------------------------
async function emiDetailXcelDownload(req, res) {
    try {
      // Fetch data from MongoDB
      const emiDetails = await emiDetailModel.find({});
  
      if (emiDetails.length === 0) {
        return badRequest(res,'No EMI details found.');
      }
  
      // Create a new workbook
      const workbook = xlsx.utils.book_new();
  
      // Define headers
      const headers = [
        ['LD Number', 'EMI Cycle', 'First EMI Date', 'First EMI Month', 'Last EMI Date',
         'Collection Type', 'Last Received Date', 'Net Due', 'Old Due', 'POS Outstanding',
         'Interest Outstanding', 'DPD Bucket', 'Created At', 'Updated At']
      ];
  
      // Convert EMI details to a 2D array
      const data = emiDetails.map(detail => [
        detail.LD,
        detail.emiCycle,
        detail.firstEmiDate,
        detail.firstEmiMonth,
        detail.lastEmiDate,
        detail.collectionType,
        detail.lastEmiReceivedDate || 'N/A',
        detail.netDue,
        detail.oldDue,
        detail.posOutstanding,
        detail.interestOutstanding,
        detail.dpdBucket,
        detail.createdAt.toISOString(),
        detail.updatedAt.toISOString()
      ]);
  
      // Merge headers and data
      const worksheetData = [...headers, ...data];
  
      // Create a worksheet
      const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
  
      // Append the worksheet to the workbook
      xlsx.utils.book_append_sheet(workbook, worksheet, 'EMI Details');
  
      // Define temporary file path
      const tempFilePath = path.join(__dirname, '../temp', `emi-details-${Date.now()}.xlsx`);
  
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
  
      // Write the workbook to a temporary file
      xlsx.writeFile(workbook, tempFilePath);
  
      // Read the file content
      const fileContent = fs.readFileSync(tempFilePath);
      
      // Upload to DigitalOcean Spaces
      const bucketName = 'finexe';
      const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/DOWNLOAD/${Date.now()}_emi-details.xlsx`;
      const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  
      const uploadResponse = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType);
  
      // Construct the file URL
      const fileUrl = `https://cdn.fincooper.in/${filePathInBucket}`;
  
      // Delete the temporary file after upload
      fs.unlinkSync(tempFilePath);
  
      return success(res,'File generated and uploaded successfully', fileUrl);
  } catch (error) {
      console.error("Error in createEmiDetail:", error);
      return unknownError(res, error);
  }
  }


// ---------------Upload Xecl Sheet ANd Update Data By LD Number------------------------------
async function uploadEmiDetails(req, res) {
    try {
        if (!req.file) {
            return badRequest(res, 'No file uploaded.');
        }

        // Read the uploaded Excel file
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = "EMI Details";
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (sheetData.length === 0) {
            return badRequest(res, 'Uploaded file is empty.');
        }

        // Get all existing records in a single query to avoid multiple DB calls
        const ldNumbers = sheetData.map(row => row['LD Number']).filter(Boolean);
        const existingRecords = await emiDetailModel.find({ LD: { $in: ldNumbers } });

        const bulkOperations = [];
        const updatedRecords = [];

        for (const row of sheetData) {
            const ldNumber = row['LD Number'];
            if (!ldNumber) continue;

            const existingRecord = existingRecords.find(record => record.LD === ldNumber);

            if (existingRecord) {
                const updatedData = {
                    emiCycle: row['EMI Cycle'] || existingRecord.emiCycle,
                    firstEmiDate: row['First EMI Date'] || existingRecord.firstEmiDate,
                    firstEmiMonth: row['First EMI Month'] || existingRecord.firstEmiMonth,
                    lastEmiDate: row['Last EMI Date'] || existingRecord.lastEmiDate,
                    collectionType: row['Collection Type'] || existingRecord.collectionType,
                    lastEmiReceivedDate: row['Last Received Date'] || existingRecord.lastEmiReceivedDate,
                    netDue: row['Net Due'] || existingRecord.netDue,
                    oldDue: row['Old Due'] || existingRecord.oldDue,
                    posOutstanding: row['POS Outstanding'] || existingRecord.posOutstanding,
                    interestOutstanding: row['Interest Outstanding'] || existingRecord.interestOutstanding,
                    dpdBucket: row['DPD Bucket'] || existingRecord.dpdBucket,
                    updatedAt: new Date(),
                };

                bulkOperations.push({
                    updateOne: {
                        filter: { LD: ldNumber },
                        update: { $set: updatedData }
                    }
                });

                updatedRecords.push({
                    LD: ldNumber,
                    ...updatedData
                });
            }
        }

        // Perform bulk update
        if (bulkOperations.length > 0) {
            await emiDetailModel.bulkWrite(bulkOperations);
        }

        // Remove the uploaded file after processing
        fs.unlinkSync(filePath);

        return success(res, `${updatedRecords.length} records updated successfully.`, updatedRecords);
    } catch (error) {
        console.error('Error in uploadEmiDetails:', error);
        return unknownError(res, error);
    }
} 


// ---------------------** CASH TRANSFER API START FROM HERE **------------------------------
// --------------** CASH TRANSFER TO BANK **------------------
async function depositCashToBank(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Get employee details
    const employeDetail = await employeeModel.findById({
      _id: new ObjectId(req.Id),
      status: "active",
    });
    if (!employeDetail) {
      return badRequest(res, "Invalid employee details");
    }

    const { transferRecipt, tranferDate, transferAmount,payeeTo, bankNameId } = req.body;
      if (payeeTo === (req.Id)) {
        return badRequest(res, "Cannot transfer to yourself");
    }
    if (!payeeTo && !bankNameId) {
      return badRequest(res, "Please provide either payeeTo or bankNameId");
    }

    // Create cash transfer request
    const cashTransferData = {
      ...req.body,
      employeeId: employeDetail._id,
      transferRecipt: transferRecipt.replace(/&#x2F;/g, "/"), // Decode if needed
    };
    const cashDetail = await newCashTransferModel.create(cashTransferData);

    // Respond with success
    success(res, "Cash transfer submitted for approval.", cashDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// -------------** Get Deposit Cash Transfer List By Token **------------------------------
async function getDepositCashDetail(req, res) {
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
    const employeDetail = await employeeModel.findById({ _id: tokenId });
    if (!employeDetail) {
      return badRequest(res, "Employee not found.");
    }
    
    // Pagination parameters
    let { page, limit, status } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering condition for newcashTransferModel
    let newCashMatchCondition = { employeeId: employeDetail._id };
    if (status) {
      newCashMatchCondition.status = status;
    }
    
    // Fetch total count for pagination
    const total = await newCashTransferModel.countDocuments(newCashMatchCondition);
    
    if (total === 0) {
      return success(res, "No records found", { data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
    }
    
    // Fetch cash transfer details with specific fields
    const totalCashDetail = await newCashTransferModel.aggregate([
      { $match: newCashMatchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetail",
        },
      },
      {
        $addFields: {
          employeeDetail: {
            $cond: {
              if: { $gt: [{ $size: "$employeeDetail" }, 0] },
              then: {
                _id: { $arrayElemAt: ["$employeeDetail._id", 0] },
                employeUniqueId: { $arrayElemAt: ["$employeeDetail.employeUniqueId", 0] },
                employeName: { $arrayElemAt: ["$employeeDetail.employeName", 0] }
              },
              else: {}
            }
          }
        }
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
        $addFields: {
          bankNameDetail: {
            $cond: {
              if: { $gt: [{ $size: "$bankNameDetail" }, 0] },
              then: {
                _id: { $arrayElemAt: ["$bankNameDetail._id", 0] },
                bankName: { $arrayElemAt: ["$bankNameDetail.bankName", 0] }
              },
              else: {}
            }
          }
        }
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
        $addFields: {
          payeeDetail: {
            $cond: {
              if: { $gt: [{ $size: "$payeeDetail" }, 0] },
              then: {
                _id: { $arrayElemAt: ["$payeeDetail._id", 0] },
                employeUniqueId: { $arrayElemAt: ["$payeeDetail.employeUniqueId", 0] },
                employeName: { $arrayElemAt: ["$payeeDetail.employeName", 0] }
              },
              else: {}
            }
          }
        }
      },
      { $skip: skip },
      { $limit: limit },
    ]).sort({ createdAt: -1 });
    
    // Response with pagination details
    return success(res, "Get Cash Transfer To Bank List", {
      data: totalCashDetail,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


// --------------LADGER BANK TRANSFER DETAIL WITH ALL BALANCE CASH COLLECTION PERSON---------------------------
async function getAllLedgerEntries(req, res) {
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
    const okCreditDetails = await okcreditModel.find(okCreditQuery);
  // return console.log("ss",okCreditDetails.length)
    if (!okCreditDetails.length) {
      return badRequest(res, "No OkCredit details found.");
    }
 
    // Get total received amount
    const totalReceived = await newEmiCollectionModel.aggregate([
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
    const totalTransferred = await newCashTransferModel.aggregate([
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
    const receivedTransfers = employeeId ? await newCashTransferModel.aggregate([
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


// ---------------** WORK MAIL SETUP ALLOCATION EMPLOYEE FOR CUSTOMER **----------------------------------
async function getAllocationSendEmail(value) {
  try {
    // Fetching collection roles
    const collectionRoles = await roleModel.find({ roleName: "collection" });
    const collectionRoleIds = collectionRoles.map((role) => role._id);

    // Fetching active employees with roles related to collection
    const employees = await employeeModel.find({
      roleId: { $in: collectionRoleIds },
      status: "active",
    });

    // Iterate over each employee
    for (const employee of employees) {
      // Skip employee if 'employeUniqueId' is empty or invalid
      if (!employee.employeUniqueId || employee.employeUniqueId.trim() === "") {
        continue;
      }

      // Get employee ID
      const employeeId = Array.isArray(employee.employeUniqueId) 
        ? employee.employeUniqueId[0].trim() 
        : employee.employeUniqueId.trim();

      // Find all allocations for this employee with NET DUE > 0
      const allocations = await employeeAllocationModel.find({
        $or: [
          { 'allocation1EmpId': { $regex: new RegExp(employeeId, 'i') } },
          { 'allocation2EmpId': { $regex: new RegExp(employeeId, 'i') } },
          { 'allocation3EmpId': { $regex: new RegExp(employeeId, 'i') } },
          { 'allocation4EmpId': { $regex: new RegExp(employeeId, 'i') } }
        ],
        netDue: { $gt: 0 }
      }).lean();

      // If no allocation data, skip the email for this employee
      if (allocations.length === 0) {
        continue;
      }

      // Get all LD numbers to fetch customer details
      const ldNumbers = allocations.map(allocation => allocation.LD);
      
      // Fetch customer details from disbursement model
      const customerDetails = await disbursedCustomerModel.find({ 
        LD: { $in: ldNumbers } 
      })
      .select('LD customerDetail.customerName customerDetail.village customerDetail.mobile branchId')
      .lean();
      
      // Get all branch IDs from customer details
      const branchIds = customerDetails
        .map(customer => customer.branchId)
        .filter(branchId => branchId); // Filter out null/undefined
      
      // Fetch branch details
      const branches = await branchModel.find({ 
        _id: { $in: branchIds } 
      })
      .select('_id name')
      .lean();
      
      // Create branch lookup map
      const branchMap = {};
      branches.forEach(branch => {
        branchMap[branch._id.toString()] = branch.name;
      });
      
      // Create customer detail lookup map
      const customerMap = {};
      customerDetails.forEach(customer => {
        // Get branch name using branchId
        const branchId = customer.branchId ? customer.branchId.toString() : null;
        const branchName = branchId ? (branchMap[branchId] || 'N/A') : 'N/A';
        
        customerMap[customer.LD] = {
          customerName: customer.customerDetail?.customerName || 'N/A',
          branch: branchName,
          village: customer.customerDetail?.village || 'N/A',
          mobile: customer.customerDetail?.mobile || 'N/A'
        };
      });

      // Skip email sending if the employee doesn't have a work email
      if (!employee.workEmail) {
        continue;
      }

      // Compile email body with details for the employee
      let emailBody = `
        <p>Dear ${employee.employeName} (${employeeId}),</p>
        <p>I hope this email finds you well. As part of our ongoing efforts to manage and streamline EMI collections, we are reaching out to provide you with the relevant data regarding your allocated collection accounts.:</p>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>LD</th>
              <th>CUSTOMER NAME</th>
              <th>BRANCH</th>
              <th>VILLAGE</th>
              <th>MOBILE</th>
              <th>EMI AMOUNT</th>
              <th>OLD DUE</th>
              <th>NET DUE</th>
            </tr>
          </thead>
          <tbody>
      `;

      allocations.forEach((allocation) => {
        const customer = customerMap[allocation.LD] || {
          customerName: 'N/A',
          branch: 'N/A',
          village: 'N/A',
          mobile: 'N/A'
        };

        emailBody += `
          <tr>
            <td>${allocation.LD || "N/A"}</td>
            <td>${customer.customerName}</td>
            <td>${customer.branch}</td>
            <td>${customer.village}</td>
            <td>${customer.mobile}</td>
            <td>${allocation.emiAmount || "N/A"}</td>
            <td>${allocation.oldDue || "N/A"}</td>
            <td>${allocation.netDue || "N/A"}</td>
          </tr>
        `;
      });

      emailBody += `
          </tbody>
        </table>
        <p>You need to collect this asap.</p>
        <p>Thank you.</p>
      `;

      // Send email to the employee
      const subject = "EMI Due Data Allocation";
      const isEmailSent = await sendEmail(
        value ? employee.workEmail : '',
        "",
        subject,
        emailBody,
        null
      );

      if (!isEmailSent) {
        console.error(`Failed to send email to ${employee.workEmail}`);
        continue;
      }
    }

    console.log("Emails sent successfully to all relevant employees");
  } catch (error) {
    console.error('Error in getAllocationDetailsAndSendEmail:', error);
    // Handle errors appropriately
  }
}


  module.exports = {
    getCollectionEmployees,
    getDashboardApi,
    getBranchCustomerTableView,
    getEmployeVisitAndCollectionTableView,
    getAllDisbursedCustomer,
    getAllocationCustomerByToken,
    newVisitEntry,
    visitDetailUpdate,
    getAllVisitDetail,
    newEmiCollectionEntry,
    getAllEmiCollection,
    emiStatusUpdateByCashPerson,
    getcashEmiPerson,
    getCollectionGalleryApi,
    getCollectionGalleryEmployeeId,
    importAllData,
    updateEmiStatus,
    emiDetailXcelDownload,
    uploadEmiDetails,

    depositCashToBank,
    getDepositCashDetail,
    getAllLedgerEntries
    
  };