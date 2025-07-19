const {
  success,
  unknownError,
  unauthorized,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const employeModel = require("../model/adminMaster/employe.model")
const processModel = require("../model/process.model")
const fs = require('fs');
const csvtojson = require("csvtojson");
const bcrypt = require('bcrypt')
const path = require('path');
const { Parser } = require('json2csv');
const workLocationModel = require('../model/adminMaster/workLocation.model')
const costCenterModel = require('../model/adminMaster/costCenter.model');
const companyModel = require('../model/adminMaster/company.model');
const roleModel = require('../model/adminMaster/role.model');
const departmentModel = require('../model/adminMaster/department.model');
const designationModel = require('../model/adminMaster/designation.model');
const employeeModel = require('../model/adminMaster/employe.model');
const employeeTypeModel = require('../model/adminMaster/employeType.model');
const employmentTypeModel = require('../model/adminMaster/employmentType.model');
const NewbranchModel = require("../model/adminMaster/newBranch.model")

// ------------------Loan Calculator---------------------------------------
const loanCalculator = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { loanAmount, roi, tenure } = req.body;
    const interest = (loanAmount * roi) / 100;
    const year = loanAmount + tenure * interest;
    const numberOfMonths = tenure * 12;
    const emi = year / numberOfMonths;
    // console.log("emi", emi);
    const totalLoanAmount = emi * numberOfMonths;

    success(res, "Loan Amount Calculator", {
      loanAmount,
      roi,
      tenure,
      emi,
      totalLoanAmount,
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};



// Helper function to build match query based on role and status
async function buildMatchQuery(req, employeeRole, status, roles) {
  let matchQuery = {};

  if (employeeRole === "sales") {
    matchQuery = await buildSalesMatchQuery(req, status, roles);
  } else if (employeeRole === "cibil") {
    matchQuery = await buildCibilMatchQuery(req, status, roles);
  } else {
    return null;
  }

  return matchQuery;
}

// Build match query for sales role
async function buildSalesMatchQuery(req, status, roles) {
  let matchQuery = {};
  const isAdmin = roles.includes('admin');

  if (isAdmin) {
    matchQuery = buildSalesAdminMatchQuery(status);
  } else {
    matchQuery = buildSalesUserMatchQuery(req.Id, status);
  }

  return matchQuery;
}

function buildSalesAdminMatchQuery(status) {
  switch (status) {
    case 'all':
      return {};
    case 'loginPending':
      return {
        statusByCibil: { $in: ["incomplete", "notAssign"] },
        $or: [
          // { guarantorFormStart: false },
          { applicantFormComplete: false },
          { coApplicantFormComplete: false },
          { guarantorFormComplete: false },
        ]
      };
    case 'cibilQuery':
      return {
        $or: [
          { applicantFormStart: false },
          { coApplicantFormStart: false },
          { guarantorFormStart: false }
        ],
        statusByCibil: "query"
      };
    case 'loginComplete':
      return {
        statusByCibil: { $in: ["incomplete", "notAssign", "query", "pending"] },
        applicantFormStart: true,
        coApplicantFormStart: true,
        guarantorFormStart: true,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
      };
    case 'cibilApproved':
      return {
        statusByCibil: { $in: ["complete", "approved"] },
        // applicantFormStart: true,
        // coApplicantFormStart: true,
        // guarantorFormStart: true,
        // applicantFormComplete: true,
        // coApplicantFormComplete: true,
      };
    case 'cibilReject':
      return {
        statusByCibil: 'rejected',
      };
    default:
      return null;
  }
}

function buildSalesUserMatchQuery(userId, status) {
  const baseQuery = { employeId: new ObjectId(userId) };

  switch (status) {
    case 'all':
      return baseQuery;
    case 'loginPending':
      return {
        ...baseQuery,
        statusByCibil: 'notAssign',
        // statusByCibil: { $in: ["incomplete", "notAssign"] },
        $or: [
          { customerFormComplete: false },
          { applicantFormComplete: false },
          { coApplicantFormComplete: false },
          { guarantorFormComplete: false },
        ]
      };
    case 'cibilQuery':
      return {
        ...baseQuery,
        $or: [
          { applicantFormStart: false },
          { coApplicantFormStart: false },
          { guarantorFormStart: false }
        ],
        statusByCibil: "query"
      };
    case 'loginComplete':
      return {
        ...baseQuery,
        statusByCibil: { $in: ["incomplete", "query", "pending", "notAssign"] },
        customerFormComplete :true , 
        applicantFormStart: true,
        applicantFormComplete: true,
        coApplicantFormStart: true,
        coApplicantFormComplete: true,
        guarantorFormStart: true,
        guarantorFormComplete :true
      };
    case 'cibilApproved':
      return {
        ...baseQuery,
        statusByCibil: { $in: ["complete", "approved"] },
        // applicantFormStart: true,
        // coApplicantFormStart: true,
        // guarantorFormStart: true,
        // applicantFormComplete: true,
        // coApplicantFormComplete: true,
      };
    case 'cibilReject':
      return {
        ...baseQuery,
        statusByCibil: 'rejected',
      };
    default:
      return null;
  }
}

// Build match query for cibil role
async function buildCibilMatchQuery(req, status, roles) {
  let matchQuery = {};
  const isAdmin = roles.includes('admin');

  if (isAdmin) {
    matchQuery = buildCibilAdminMatchQuery(status);
  } else {
    matchQuery = buildCibilUserMatchQuery(req.Id, status);
  }

  return matchQuery;
}

function buildCibilAdminMatchQuery(status) {
  const baseQuery = {
    // applicantFormStart: true,
    // coApplicantFormStart: true,
    // applicantFormComplete: true,
    // coApplicantFormComplete: true,
  };

  switch (status) {
    case 'all':
      return {
        // ...baseQuery,
        statusByCibil: { $in: ["incomplete", "notAssign", "query", "pending"] },
      };
    case 'cibilPending':
      return {
        statusByCibil: { $in: ["incomplete", "notAssign", "query", "pending"] },
        // ...baseQuery,
        customerFormComplete :true ,
        applicantFormStart: true,
        coApplicantFormStart: true,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
        guarantorFormStart: true,
        guarantorFormComplete: true,
      };
    case 'cibilQuery':
      return {
        // ...baseQuery,
        statusByCibil :"query",
        $or: [
          { applicantFormStart: false },
          { coApplicantFormStart: false },
          { guarantorFormStart: false }
        ],
      };
    case 'cibilApproved':
      return {
        // ...baseQuery,
        statusByCibil: { $in: ["complete", "approved"] },
      };
    case 'cibilReject':
      return {
        statusByCibil: 'rejected',
      };
    case 'cibilToPd':
      return {
        // ...baseQuery,
        statusByCibil: { $in: ["complete", "approved"] },
      };
    default:
      return null;
  }
}

function buildCibilUserMatchQuery(userId, status) {
  const baseQuery = {
    cibilId: { $in: [new ObjectId(userId), null] },
    // applicantFormStart: true,
    // coApplicantFormStart: true,
    // applicantFormComplete: true,
    // coApplicantFormComplete: true,
  };

  switch (status) {
    case 'all':
      return {
        // ...baseQuery,
        statusByCibil: { $in: ["incomplete", "query", "notAssign", "pending"] },
      };
    case 'cibilPending':
      return {
        // ...baseQuery,
        statusByCibil: { $in: ["incomplete", "notAssign", "query"] },
        customerFormComplete : true ,
        applicantFormStart: true,
        applicantFormComplete: true,
        coApplicantFormStart: true,
        coApplicantFormComplete: true,
        guarantorFormStart: true,
        guarantorFormComplete: true,
      };
    case 'cibilQuery':
      return {
        // ...baseQuery,
        cibilId: new ObjectId(userId),
        statusByCibil :"query",
        $or: [
          { applicantFormStart: false },
          { coApplicantFormStart: false },
          { guarantorFormStart: false }
        ],
      };
    // case 'salesPending':
    //   return {
    //     // ...baseQuery,
    //     cibilId: new ObjectId(userId),
    //     statusByCibil: { $in: ["query"] },
    //     guarantorFormStart: true,
    //     guarantorFormComplete: true,
    //     applicantFormStart: true,
    //     coApplicantFormStart: true,
    //     applicantFormComplete: true,
    //     coApplicantFormComplete: true,
    //   };
    case 'cibilApproved':
      return {
        // ...baseQuery,
        cibilId: new ObjectId(userId),
        statusByCibil: { $in: ["complete", "approved"] },
      };
    case 'cibilReject':
      return {
        cibilId: new ObjectId(userId),
        statusByCibil: 'rejected',
      };
    case 'cibilToPd':
      return {
        // ...baseQuery,
        cibilId: new ObjectId(userId),
        statusByCibil: { $in: ["complete", "approved"] },
      };
    default:
      return null;
  }
}

// Helper function to get employee IDs for branch
async function getEmployeeIdsForBranch(employeeId) {
  const branchIds = [];
  const findEmployeeData = await employeeModel.findOne({ _id: employeeId });

  if (findEmployeeData?.branchId === '673ef4ef1c600b445add496a') {
    branchIds.push(new ObjectId("673ef4ef1c600b445add496a"));

    const childBranches = await NewbranchModel.find({
      regionalBranchId: new ObjectId("673ef4ef1c600b445add496a")
    });

    branchIds.push(...childBranches
      .filter(branch => findEmployeeData?.branchId === branch._id)
      .map(branch => branch._id)
    );
  }
console.log('branchIds---',branchIds)
  if (branchIds.length === 0) return null;

  const employees = await employeeModel.find({
    branchId: { $in: branchIds }
  }).select('_id');

  return employees.map(emp => emp._id);
}

// Helper function to transform form detail
function transformFormDetail(item, employeeRole) {
  const remarkMessage = employeeRole === "sales" ?
    item.remarkByCibil :
    employeeRole === "cibil" ? item.remarkByExternalManager : "";

  const currentStatus = employeeRole === "sales" ?
    item.statusByCibil :
    employeeRole === "cibil" ? item.statusByExternalManager : "";

  return {
    _id: item._id,
    employeId: item.employeId,
    cibilId: item.cibilId,
    tlPdId: item.tlPdId,
    creditPdId: item.creditPdId,
    customerId: item.customerId,
    customerFormStart: item.customerFormStart,
    customerFormComplete: item.customerFormComplete,
    applicantFormStart: item.applicantFormStart,
    applicantFormComplete: item.applicantFormComplete,
    coApplicantFormStart: item.coApplicantFormStart,
    coApplicantFormComplete: item.coApplicantFormComplete,
    guarantorFormStart: item.guarantorFormStart,
    guarantorFormComplete: item.guarantorFormComplete,
    referenceFormStart: item.referenceFormStart,
    referenceFormComplete: item.referenceFormComplete,
    bankDetailFormStart: item.bankDetailFormStart,
    bankDetailFormComplete: item.bankDetailFormComplete,
    salesCaseDetailFormStart: item.salesCaseDetailFormStart,
    salesCaseDetailFormComplete: item.salesCaseDetailFormComplete,
    cibilFormStart: item.cibilFormStart,
    cibilFormComplete: item.cibilFormComplete,
    remarkByCibil: item.remarkByCibil,
    statusByCibil: item.statusByCibil,
    statusByFinalApproval: item.statusByFinalApproval,
    statusByExternalManager: item.statusByExternalManager,
    remarkByExternalManager: item.remarkByExternalManager,
    remarkByCreditPd: item.remarkByCreditPd,
    statusByCreditPd: item.statusByCreditPd,
    remarkByPd: item.remarkByPd,
    statusByPd: item.statusByPd,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    _v: item._v,
    customerName: item.applicantDetail[0]?.fullName || "",
    customerFinId: item.customerDetail[0]?.customerFinId || "",
    mobileNo: item.customerDetail[0]?.mobileNo || "",
    productName: item.productDetail[0]?.productName || "",
    loanAmount: item.customerDetail[0]?.loanAmount || "",
    applicantImage: item.applicantDetail[0]?.applicantPhoto || "",
    applicantEmail: item.applicantDetail[0]?.email || "",
    remarkMessage,
    currentStatus,
  };
}

// Main API function
async function getCustomerDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { page = 1, limit = 20, search, status, employeeRole } = req.query;
    const currentPage = parseInt(page, 10);
    const itemPerPage = parseInt(limit, 10);

    if (!employeeRole) {
      return res.status(400).json({
        status: false,
        message: "Employee Role Required"
      });
    }

    // Get match query based on role and status
    const roles = Array.isArray(req.roleName) ? req.roleName : [req.roleName];
    let matchQuery = await buildMatchQuery(req, employeeRole, status, roles);

    if (!matchQuery) {
      return res.status(400).json({
        status: false,
        message: `Invalid status for ${employeeRole} role`
      });
    }

    // Handle branch and employee filtering
    const employeeIds = await getEmployeeIdsForBranch(req.Id);
    if (employeeIds && employeeIds.length > 0) {
      matchQuery = { ...matchQuery, employeId: { $in: employeeIds } };
    }

    // Add active file status to match query
    matchQuery = { ...matchQuery, fileStatus: "active" };

    // Build the aggregation pipeline
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetail",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "customerDetail.productId",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerDetail._id",
          foreignField: "customerId",
          as: "applicantDetail",
        },
      },
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "customerDetail._id",
          foreignField: "customerId",
          as: "externalvendorDetail",
        },
      },
    ];

    // Add search filter if search parameter exists
    if (search) {
      const regexPattern = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { "applicantDetail.fullName": regexPattern },
            { "customerDetail.customerFinId": regexPattern }
          ]
        }
      });
    }

    // Get total count for pagination
    const totalItems = await processModel.aggregate([
      ...pipeline,
      { $count: "total" }
    ]);

    // Add sorting and pagination to pipeline
    pipeline.push(
      { $sort: { updatedAt: -1 } },
      { $skip: (currentPage - 1) * itemPerPage },
      { $limit: itemPerPage }
    );

    // Execute the query
    const formDetail = await processModel.aggregate(pipeline);

    // Transform the results
    const formDataByRole = formDetail.map(item => transformFormDetail(item, employeeRole));

    return res.status(200).json({
      status: true,
      subCode: 200,
      message: "Get Customer Detail",
      error: "",
      items: formDataByRole,
      currentPage,
      totalItems: totalItems[0]?.total || 0,
      totalPages: Math.ceil((totalItems[0]?.total || 0) / itemPerPage),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}













///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function newbuildMatchQuery(req, employeeRole, status, roles) {
  let matchQuery = {};

  if (employeeRole === "sales") {
    matchQuery = await newbuildSalesMatchQuery(req, status, roles);
  } else if (employeeRole === "cibil") {
    matchQuery = await newbuildCibilMatchQuery(req, status, roles);
  } else {
    return null;
  }

  return matchQuery;
}

// Build match query for sales role
async function newbuildSalesMatchQuery(req, status, roles) {
  let matchQuery = {};
  const isAdmin = roles.includes('admin');

  if (isAdmin) {
    matchQuery = newbuildSalesAdminMatchQuery(status);
  } else {
    matchQuery = newbuildSalesUserMatchQuery(req.Id, status);
  }

  return matchQuery;
}

function newbuildSalesAdminMatchQuery(status) {
  switch (status) {
    case 'all':
      return {};
    case 'salesNew':
      return {
        statusByCibil: 'incomplete',
        $or: [
          // { guarantorFormStart: false },
          { applicantFormComplete: false },
          { coApplicantFormComplete: false },
          { guarantorFormComplete: false },
        ]
      };
    case 'cibilPending':
      return {
        $or: [
          { applicantFormStart: false },
          { coApplicantFormStart: false },
          { guarantorFormStart: false }
        ],
        statusByCibil: "pending"
      };
    case 'salesToCibil':
      return {
        statusByCibil: { $in: ["incomplete", "pending"] },
        applicantFormStart: true,
        coApplicantFormStart: true,
        guarantorFormStart: true,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
      };
    case 'cibilOk':
      return {
        statusByCibil: { $in: ["complete", "approved"] },
        applicantFormStart: true,
        coApplicantFormStart: true,
        guarantorFormStart: true,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
      };
    case 'cibilReject':
      return {
        statusByCibil: 'rejected',
      };
    default:
      return null;
  }
}

function newbuildSalesUserMatchQuery(userId, status) {
  // const baseQuery = { employeId: new ObjectId(userId) };
  const baseQuery = {};

  switch (status) {
    case 'all':
      return baseQuery;
    case 'salesNew':
      return {
        ...baseQuery,
        statusByCibil: 'incomplete',
        $or: [
          { guarantorFormStart: false },
          { applicantFormComplete: false },
          { coApplicantFormComplete: false },
          { guarantorFormComplete: false },
        ]
      };
    case 'cibilPending':
      return {
        ...baseQuery,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
        statusByCibil: "pending"
      };
    case 'salesToCibil':
      return {
        ...baseQuery,
        statusByCibil: { $in: ["incomplete", "pending"] },
        applicantFormStart: true,
        coApplicantFormStart: true,
        guarantorFormStart: true,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
      };
    case 'cibilOk':
      return {
        ...baseQuery,
        statusByCibil: { $in: ["complete", "approved"] },
        applicantFormStart: true,
        coApplicantFormStart: true,
        guarantorFormStart: true,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
      };
    case 'cibilReject':
      return {
        ...baseQuery,
        statusByCibil: 'rejected',
      };
    default:
      return null;
  }
}

// Build match query for cibil role
async function newbuildCibilMatchQuery(req, status, roles) {
  let matchQuery = {};
  const isAdmin = roles.includes('admin');

  if (isAdmin) {
    matchQuery = newbuildCibilAdminMatchQuery(status);
  } else {
    matchQuery = newbuildCibilUserMatchQuery(req.Id, status);
  }

  return matchQuery;
}

function newbuildCibilAdminMatchQuery(status) {
  const baseQuery = {
    // applicantFormStart: true,
    // coApplicantFormStart: true,
    // applicantFormComplete: true,
    // coApplicantFormComplete: true,
  };

  switch (status) {
    case 'all':
      return {
        // ...baseQuery,
        statusByCibil: { $in: ["incomplete", "pending"] },
      };
    case 'salesNewFile':
      return {
        statusByCibil: { $in: ["incomplete", "pending"] },
        // ...baseQuery,
        applicantFormStart: true,
        coApplicantFormStart: true,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
        guarantorFormStart: true,
        guarantorFormComplete: true,
      };
    case 'salesPending':
      return {
        // ...baseQuery,
        $or: [
          { applicantFormStart: false },
          { coApplicantFormStart: false },
          { guarantorFormStart: false }
        ],
      };
    case 'cibilOk':
      return {
        // ...baseQuery,
        statusByCibil: { $in: ["complete", "approved"] },
      };
    case 'cibilReject':
      return {
        statusByCibil: 'rejected',
      };
    case 'cibilToPd':
      return {
        // ...baseQuery,
        statusByCibil: { $in: ["complete", "approved"] },
      };
    default:
      return null;
  }
}

function newbuildCibilUserMatchQuery(userId, status) {
  const baseQuery = {
    cibilId: { $in: [new ObjectId(userId), null] },
    // applicantFormStart: true,
    // coApplicantFormStart: true,
    // applicantFormComplete: true,
    // coApplicantFormComplete: true,
  };

  switch (status) {
    case 'all':
      return {
        ...baseQuery,
        statusByCibil: { $in: ["incomplete", "pending"] },
      };
    case 'salesNewFile':
      return {
        ...baseQuery,
        statusByCibil: { $in: ["incomplete", "pending"] },
        guarantorFormStart: true,
        guarantorFormComplete: true,
        applicantFormStart: true,
        coApplicantFormStart: true,
        applicantFormComplete: true,
        coApplicantFormComplete: true,
      };
    case 'salesPending':
      return {
        // ...baseQuery,
        cibilId: new ObjectId(userId),
        $or: [
          { applicantFormStart: false },
          { coApplicantFormStart: false },
          { guarantorFormStart: false }
        ],
      };
    case 'cibilOk':
      return {
        // ...baseQuery,
        cibilId: new ObjectId(userId),
        statusByCibil: { $in: ["complete", "approved"] },
      };
    case 'cibilReject':
      return {
        cibilId: new ObjectId(userId),
        statusByCibil: 'rejected',
      };
    case 'cibilToPd':
      return {
        // ...baseQuery,
        cibilId: new ObjectId(userId),
        statusByCibil: { $in: ["complete", "approved"] },
      };
    default:
      return null;
  }
}


// Helper function to transform form detail
function newtransformFormDetail(item, employeeRole) {
  // const remarkMessage = employeeRole === "sales" ?
  //   item.remarkByCibil :
  //   employeeRole === "cibil" ? item.remarkByExternalManager : "";

  // const currentStatus = employeeRole === "sales" ?
  //   item.statusByCibil :
  //   employeeRole === "cibil" ? item.statusByExternalManager : "";

  return {
    customerId: item?.customerId,
    customerFinId: item.customerDetail[0]?.customerFinId || "",
    customerName: item.applicantDetail[0]?.fullName || "",
    customerFatherName: item.applicantDetail[0]?.fatherName || "",
    cutomerEmail: item.applicantDetail[0]?.email || "",
    cutomerMobileNo: item.customerDetail[0]?.mobileNo || "",
    cutomerImage: item.applicantDetail[0]?.applicantPhoto || "",
    salesEmployeeName: item.employeeInfo?.employeName || "",
    salesManagerName: item.salesReportingManager?.employeName || "",
    branchDetail: {
      name: item.newbrancheDetail?.name || "",
      city: item.newbrancheDetail?.city || "",
      state: item.newbrancheDetail?.state || "",
      _id: item.newbrancheDetail?._id || "",
    },
    // employeId: item.employeId,

    // customerFormStart: item.customerFormStart,
    // customerFormComplete: item.customerFormComplete,
    // applicantFormStart: item.applicantFormStart,
    // applicantFormComplete: item.applicantFormComplete,
    // coApplicantFormStart: item.coApplicantFormStart,
    // coApplicantFormComplete: item.coApplicantFormComplete,
    // guarantorFormStart: item.guarantorFormStart,
    // guarantorFormComplete: item.guarantorFormComplete,
    // referenceFormStart: item.referenceFormStart,
    // referenceFormComplete: item.referenceFormComplete,
    // bankDetailFormStart: item.bankDetailFormStart,
    // bankDetailFormComplete: item.bankDetailFormComplete,
    // salesCaseDetailFormStart: item.salesCaseDetailFormStart,
    // salesCaseDetailFormComplete: item.salesCaseDetailFormComplete,

    remarkByCibil: item.remarkByCibil || "",
    statusByCibil: item.statusByCibil || "",
  };
}

// Main API function
async function newGetCustomerFilesDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { page = 1, limit = 10, search, branchId } = req.query;
    const status = "salesToCibil"
    const employeeRole = "sales"
    const currentPage = parseInt(page, 10);
    const itemPerPage = parseInt(limit, 10);

    if (!employeeRole) {
      return badRequest(res, "Employee Role Required");
    }

    // Get match query based on role and status
    const roles = Array.isArray(req.roleName) ? req.roleName : [req.roleName];
    // console.log('role----', roles)
    let matchQuery = await newbuildMatchQuery(req, employeeRole, status, roles,);

    if (!matchQuery) {
      return badRequest(res, `Invalid status`);
    }

    // // Handle branch and employee filtering
    // const employeeIds = await newgetEmployeeIdsForBranch(req.Id);
    // if (employeeIds && employeeIds.length > 0) {
    //   matchQuery = { ...matchQuery, employeId: { $in: employeeIds } };
    // }

    // Add active file status to match query
    matchQuery = { ...matchQuery, fileStatus: "active" };

    const pipeline = []

    if (employeeRole === 'sales') {
      pipeline.push(
        {
          $lookup:
          {
            from: "employees",
            localField: "employeId",
            foreignField: "_id",
            as: "employeeInfo"
          }
        },
        {
          $unwind: {
            path: "$employeeInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup:
          {
            from: "employees",
            localField: "employeeInfo.reportingManagerId",
            foreignField: "_id",
            as: "salesReportingManager"
          }
        },
        {
          $unwind: {
            path: "$salesReportingManager",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup:
          {
            from: "newbranches",
            localField: "employeeInfo.branchId",
            foreignField: "_id",
            as: "newbrancheDetail"
          }
        },
        {
          $unwind: {
            path: "$newbrancheDetail",
            preserveNullAndEmptyArrays: true
          }
        }
      );

      if (roles.includes('admin') || roles.includes('ceo')) {
        if (!branchId) {
          return badRequest(res, "Branch Required")
        }
        if (branchId !== "all") {
          pipeline.push({
            $match: {
              "employeeInfo.branchId": new ObjectId(branchId)
            }
          });
        }
      } else {
        const employeeBranchId = await employeeModel.findById(req.Id).select('branchId');
        if (employeeBranchId) {
          pipeline.push({
            $match: {
              "employeeInfo.branchId": employeeBranchId.branchId
            }
          });
        }
      }
    }


    pipeline.push(
      { $match: matchQuery },
      {
        $lookup: {
          from: "customerdetails",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetail",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "customerDetail.productId",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $lookup: {
          from: "applicantdetails",
          localField: "customerDetail._id",
          foreignField: "customerId",
          as: "applicantDetail",
        },
      },
      {
        $lookup: {
          from: "externalvendordynamics",
          localField: "customerDetail._id",
          foreignField: "customerId",
          as: "externalvendorDetail",
        },
      },
    );

    // console.log('pipline----/---', pipeline)
    // Add search filter if search parameter exists
    if (search) {
      const regexPattern = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { "applicantDetail.fullName": regexPattern },
            { "customerDetail.customerFinId": regexPattern }
          ]
        }
      });
    }

    // Get total count for pagination
    const totalItems = await processModel.aggregate([
      ...pipeline,
      { $count: "total" }
    ]);

    // Add sorting and pagination to pipeline
    pipeline.push(
      { $sort: { updatedAt: -1 } },
      { $skip: (currentPage - 1) * itemPerPage },
      { $limit: itemPerPage }
    );

    // Execute the query
    const formDetail = await processModel.aggregate(pipeline);

    // Transform the results
    const formDataByRole = formDetail.map(item => newtransformFormDetail(item, employeeRole));

    return success(res, "Get Customer Detail", {
      items: formDataByRole,
      currentPage,
      totalItems: totalItems[0]?.total || 0,
      totalPages: Math.ceil((totalItems[0]?.total || 0) / itemPerPage)
    })
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}




async function cibilAndPdStatusUpdate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errorName: "serverValidation", errors: errors.array() });
    }
    const processId = req.body.processId;
    const tokenId = new ObjectId(req.Id);
    const role = req.roleName;
    const remark = req.body.remark || "";
    const validStatuses = ["approved", "pending", "reject"];
    const status = req.body.status?.toLowerCase() || "";
    if (!validStatuses.includes(status)) {
      return badRequest(res, "Invalid status provided. Valid options are approved, pending, reject");
    }
    const process = await processModel.findById(processId);
    if (!process) {
      return badRequest(res, "Process not found");
    }

    if (role === "cibil") {
      console.log("Dd", role);
      if (status) {

        let updateData = { statusByCibil: status, remarkByCibil: remark };

        if (status == "pending" || status == "rejected") {
          updateData = {
            ...updateData,
            pdId: null,
            statusByPd: "incomplete"
          };
        }
        const update = await processModel.findByIdAndUpdate({ _id: processId }, updateData, { new: true });

        success(res, "Cibil Update Status", update);
      }
    } else if (role === "pd") {
      if (status) {
        const update = await processModel.findByIdAndUpdate(
          { _id: processId },
          { statusByPd: status, remarkByPd: remark },
          { new: true }
        );
        success(res, "PD Update Status", update);
      }
    } else if (role === "admin") {
      if (!req.body.asignId || !req.body.roleName) {
        return badRequest(res, "asignId and roleName are required");
      }
      if (req.body.asignId && req.body.roleName === "cibil") {
        const update = await processModel.findByIdAndUpdate(
          { _id: processId },
          {
            cibilId: req.body.asignId,
            statusByCibil: status,
            remarkByCibil: remark,
          },
          { new: true }
        );
        success(res, "Admin Update Status", update);
      }
      if (req.body.asignId && req.body.roleName === "pd") {
        const update = await processModel.findByIdAndUpdate(
          { _id: processId },
          { pdId: req.body.asignId, statusByPd: status, remarkByPd: remark },
          { new: true }
        );
        success(res, "Admin Update Status", update);
      }
    } else {
      return badRequest(res, "Status not updated");
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

async function getProcessDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { processId } = req.params
    if (!processId) {
      return badRequest(res, "Process Id Required")
    }
    const processDetail = await processModel.findById(processId)
    if (processDetail) {
      return success(res, "process Detail", processDetail);
    } else {
      const processDetailByCustomerId = await processModel.findOne({ customerId: processId })
      if (processDetailByCustomerId) {
        return success(res, "process Detail", processDetailByCustomerId);
      } else {
        return notFound(res, "process Not Found");
      }
    }
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}



// const xlsx = require('xlsx');
// const moment = require('moment');

// async function csvToJson(req, res) {
//   const filePath = req.file.path;
//   try {
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = "Finnexe Master Employee data";
//     const worksheet = workbook.Sheets[sheetName];

//     if (!worksheet) {
//       return badRequest(res, `Sheet named "${sheetName}" not found in the file.`);
//     }

//     const jsonArray = xlsx.utils.sheet_to_json(worksheet);
//     // const uniqueTitles = [...new Set(jsonArray.map(row => row['constCenterId']))];
//     // const updatedArray = await Promise.all(uniqueTitles.map(async title => {
//     //   // Check if the costCenter with the title already exists in the database
//     //   let costCenter = await costCenterModel.findOne({ title });

//     //   if (!costCenter) {
//     //     // If not found, create a new costCenter entry and save it
//     //     costCenter = new costCenterModel({ title });
//     //     await costCenter.save();
//     //   }
//     //   const newCostCenterId = costCenter._id 
//     //   console.log("newCostCenterId",newCostCenterId);
//     //   let role = await roleModel.findOne({ roleName: row['roleId']   });
//     //   if (!role) {
//     //     role = await new roleModel({ roleName: row['roleId']   })
//     //     await role.save()
//     //   }
//     //   const newRoleId = role._id

//     //   let employmentType = await employmentTypeModel.findOne({ title: row['employementTypeId']   });
//     //   if (!employmentType) {
//     //     employmentType = await new employmentTypeModel({ title: row['employementTypeId']   });
//     //     await employmentType.save()
//     //   }
//     //   const newEmploymentTypeId = employmentType._id

//     //   let employeeType = await employeeTypeModel.findOne({ title: row['employeeTypeId']   });
//     //   if (!employeeType) {
//     //     employeeType = await new employeeTypeModel({ title: row['employeeTypeId']   });
//     //   }
//     //   const newEmployeeTypeId = employeeType._id

//     //   let company = await companyModel.findOne({ companyName: row['companyId']   });
//     //   if (!company) {
//     //     company = await new companyModel({ companyName: row['companyId']   })
//     //     await company.save()
//     //   }
//     //   const newCompanyId = company._id

//     //   const defaultLatitude = 22.7243; 
//     //   const defaultLongitude = 75.8797;
//     //   let branch = await branchModel.findOne({ branch: row['branchId']   });
//     //   if (!branch) {
//     //     branch = new branchModel({
//     //       branch: row['branchId']  ,
//     //       companyId : newCompanyId,
//     //       location: {
//     //         type: "Point",
//     //         coordinates: [defaultLatitude , defaultLongitude]
//     //       }
//     //     });
//     //     await branch.save();
//     //   }
//     //   const newBranchId = branch._id

//     //   let workLocation = await workLocationModel.findOne({ title: row['workLocationId']   });
//     //   if (!workLocation) {
//     //     workLocation = await new workLocationModel({
//     //       branchId : newBranchId ,
//     //       companyId: newCompanyId ,
//     //        title: row['workLocationId']  ,
//     //        location: {
//     //         type: "Point",
//     //         coordinates: [defaultLatitude , defaultLongitude]
//     //       }
//     //        })
//     //     await workLocation.save();
//     //   }
//     //   const newWorkLocationId = workLocation._id


//     //   let department = await departmentModel.findOne({ departmentName: row['departmentId']   });
//     //   if (!department) {
//     //     department = await new departmentModel({
//     //       branchId : newBranchId ,
//     //       companyId: newCompanyId ,
//     //       workLocationId: newWorkLocationId ,
//     //       departmentName: row['departmentId']   
//     //     })
//     //     await department.save()
//     //   }
//     //   const newDepartmentId = department._id

//     //   let designation = await designationModel.findOne({ designationName: row['designationId'] });
//     //   if (!designation) {
//     //     designation = await new designationModel({
//     //       branchId : newBranchId ,
//     //       companyId: newCompanyId ,
//     //       workLocationId: newWorkLocationId ,
//     //       departmentId : newDepartmentId,
//     //       designationName: row['designationId']   
//     //     })
//     //     await designation.save()
//     //   }
//     //   const newDesignationId = designation._id

//     //   let employeeId = await employeeModel.findOne({ employeUniqueId: row['employeUniqueId'] });

//     //   let newEmployee;
//     //   if (!employeeId && employeeId == null) {
//     //     const mobileNo = row['mobileNo'] && typeof row['mobileNo'] === 'string'
//     //     ? row['mobileNo'].replace(/\s/g, '')
//     //     : row['mobileNo'];

//     //     let password = row['password'];
//     //     if (typeof password !== 'string') {
//     //       password = String(password); 
//     //     }
//     //     password = password.replace(/\s/g, '');
//     //     let hashPassword;
//     //     if (password) {
//     //       const salt = await bcrypt.genSalt(10);
//     //       hashPassword = await bcrypt.hash(password, salt); 
//     //     }

//     //     let joiningDate = null;
//     //     if (row['joiningDate']) {
//     //       const excelSerial = row['joiningDate'];
//     //       joiningDate = moment(new Date((excelSerial - 25569) * 86400 * 1000)).format('YYYY-MM-DD');
//     //     }
//     //     let dateOfBirth = null;
//     //     if (row['dateOfBirth']) {
//     //       const excelSerial = row['dateOfBirth'];
//     //       dateOfBirth = moment(new Date((excelSerial - 25569) * 86400 * 1000)).format('YYYY-MM-DD');
//     //     }

//     //     newEmployee = new employeeModel({
//     //       employeUniqueId: row['employeUniqueId'],
//     //       employeName: row['employeName'],
//     //       userName: row['userName'],
//     //       password: hashPassword,
//     //       email: row['email'] || "",
//     //       workEmail: row['workEmail'] || "",
//     //       mobileNo: mobileNo,
//     //       joiningDate: joiningDate,
//     //       dateOfBirth: dateOfBirth,
//     //       fatherName: row['fatherName'],
//     //       currentAddress: row['currentAddress'],
//     //       permanentAddress: row['permanentAddress'],
//     //       branchId: newBranchId,
//     //       companyId: newCompanyId,
//     //       roleId: newRoleId,
//     //       employementTypeId: newEmploymentTypeId,
//     //       departmentId: newDepartmentId,
//     //       designationId: newDesignationId,
//     //       workLocationId: newWorkLocationId,
//     //       constCenterId: newCostCenterId,
//     //       employementTypeId: newEmploymentTypeId,
//     //       employeeTypeId: newEmployeeTypeId,
//     //       status: 'active'
//     //     });

//     //     try {
//     //       const newEmployees = await newEmployee.save();
//     //       console.log('newEmployee save data', newEmployees);
//     //     } catch (saveError) {
//     //       console.error('Error saving new employee:', saveError.message);
//     //     }
//     //   } else {
//     //     console.log('employee in db', employeeId);
//     //   }

//     //   return {
//     //     ...row,
//     //     constCenterId: costCenter._id.toString(),
//     //     workLocationId: workLocation._id.toString(),
//     //     branchId: branch._id.toString(),
//     //     companyId: company._id.toString(),
//     //     roleId: role._id.toString(),
//     //     designationId: designation._id.toString(),
//     //     departmentId: department._id.toString(),
//     //     employementTypeId: employmentType._id.toString(),
//     //     employeeTypeId: employeeType._id.toString(),
//     //     employeUniqueId: row['employeUniqueId'],
//     //   };
//     // }));
//     const uniqueCostCenters = new Set();
// const uniqueRoles = new Set();
// const uniqueEmploymentTypes = new Set();
// const uniqueEmployeeTypes = new Set();
// const uniqueCompanies = new Set();
// const uniqueBranches = new Set();
// const uniqueWorkLocations = new Set();
// const uniqueDepartments = new Set();
// const uniqueDesignations = new Set();

// const updatedArray = await Promise.all(jsonArray.map(async row => {
//   let branch = null;

//   const title = row['constCenterId'];
//   const roleName = row['roleId'];
//   const employmentTypeTitle = row['employementTypeId'];
//   const employeeTypeTitle = row['employeeTypeId'];
//   const companyName = row['companyId'];
//   const branchName = row['branchId'];
//   const workLocationTitle = row['workLocationId'];
//   const departmentName = row['departmentId'];
//   const designationName = row['designationId'];

//   // Handle costCenter
//   // let costCenter = null;
//   if (!uniqueCostCenters.has(title)) {
//     uniqueCostCenters.add(title);
//     costCenter = await costCenterModel.findOne({ title });
//     if (!costCenter) {
//       costCenter = new costCenterModel({ title });
//       await costCenter.save();
//     }
//   }

//   // Handle role
//   // let role = null;
//   if (!uniqueRoles.has(roleName)) {
//     uniqueRoles.add(roleName);
//     role = await roleModel.findOne({ roleName });
//     if (!role) {
//       role = new roleModel({ roleName });
//       await role.save();
//     }
//   }

//   // Handle employmentType
//   // let employmentType = null;
//   if (!uniqueEmploymentTypes.has(employmentTypeTitle)) {
//     uniqueEmploymentTypes.add(employmentTypeTitle);
//     employmentType = await employmentTypeModel.findOne({ title: employmentTypeTitle });
//     if (!employmentType) {
//       employmentType = new employmentTypeModel({ title: employmentTypeTitle });
//       await employmentType.save();
//     }
//   }

//   // Handle employeeType
//   // let employeeType = null;
//   if (!uniqueEmployeeTypes.has(employeeTypeTitle)) {
//     uniqueEmployeeTypes.add(employeeTypeTitle);
//     employeeType = await employeeTypeModel.findOne({ title: employeeTypeTitle });
//     if (!employeeType) {
//       employeeType = new employeeTypeModel({ title: employeeTypeTitle });
//       await employeeType.save();
//     }
//   }

//   // Handle company
//   // let company = null;
//   if (!uniqueCompanies.has(companyName)) {
//     uniqueCompanies.add(companyName);
//     company = await companyModel.findOne({ companyName });
//     if (!company) {
//       company = new companyModel({ companyName });
//       await company.save();
//     }
//   }


//   // Handle branch
//   // let branch = null;
//   if (!uniqueBranches.has(branchName)) {
//     uniqueBranches.add(branchName);
//     branch = await branchModel.findOne({ branch: branchName });
//     if (!branch) {
//       branch = new branchModel({
//         branch: branchName,
//         companyId: company._id, // Now company._id is guaranteed to exist
//         location: {
//           type: "Point",
//           coordinates: [22.7243, 75.8797] // Default coordinates
//         }
//       });
//       await branch.save();
//     }
//   }

//   // Handle workLocation
//   // let workLocation = null;
//   if (!uniqueWorkLocations.has(workLocationTitle)) {
//     uniqueWorkLocations.add(workLocationTitle);
//     workLocation = await workLocationModel.findOne({ title: workLocationTitle });
//     if (!workLocation) {
//       workLocation = new workLocationModel({
//         branchId: branch._id,
//         companyId: company._id,
//         title: workLocationTitle,
//         location: {
//           type: "Point",
//           coordinates: [22.7243, 75.8797] // Default coordinates
//         }
//       });
//       await workLocation.save();
//     }
//   }

//   // Handle department
//   // let department = null;
//   if (!uniqueDepartments.has(departmentName)) {
//     uniqueDepartments.add(departmentName);
//     department = await departmentModel.findOne({ departmentName });
//     if (!department) {
//       department = new departmentModel({
//         branchId: branch._id,
//         companyId: company._id,
//         workLocationId: workLocation._id,
//         departmentName: departmentName
//       });
//       await department.save();
//     }
//   }

//   // Handle designation
//   // let designation = null;
//   if (!uniqueDesignations.has(designationName)) {
//     uniqueDesignations.add(designationName);
//     designation = await designationModel.findOne({ designationName });
//     if (!designation) {
//       designation = new designationModel({
//         branchId: branch._id,
//         companyId: company._id,
//         workLocationId: workLocation._id,
//         departmentId: department._id,
//         designationName: designationName
//       });
//       await designation.save();
//     }
//   }

//   // Handle employee
//   let employee = await employeeModel.findOne({ employeUniqueId: row['employeUniqueId'] });
//   if (!employee) {
//     const mobileNo = row['mobileNo'] && typeof row['mobileNo'] === 'string'
//   ? row['mobileNo'].replace(/\s/g, '')
//   : row['mobileNo'] !== null && row['mobileNo'] !== undefined
//   ? String(row['mobileNo']).replace(/\s/g, '')
//   : null;
//     let password = row['password'] ? String(row['password']).replace(/\s/g, '') : '';
//     const hashPassword = password ? await bcrypt.hash(password, 10) : '';

//     const joiningDate = row['joiningDate'] ? moment(new Date((row['joiningDate'] - 25569) * 86400 * 1000)).format('YYYY-MM-DD') : null;
//     const dateOfBirthRaw = row['dateOfBirth'];
//     const dateOfBirth = dateOfBirthRaw ? moment(new Date((dateOfBirthRaw - 25569) * 86400 * 1000)).isValid() ? moment(new Date((dateOfBirthRaw - 25569) * 86400 * 1000)).format('YYYY-MM-DD') : null : null;

//     employee = new employeeModel({
//       employeUniqueId: row['employeUniqueId'],
//       employeName: row['employeName'],
//       userName: row['userName'],
//       password: hashPassword,
//       email: row['email'] || "",
//       workEmail: row['workEmail'] || "",
//       mobileNo: mobileNo,
//       joiningDate: joiningDate,
//       dateOfBirth: dateOfBirth,
//       fatherName: row['fatherName'],
//       currentAddress: row['currentAddress'],
//       permanentAddress: row['permanentAddress'],
//       branchId: branch._id,
//       companyId: company._id,
//       roleId: role._id,
//       employementTypeId: employmentType._id,
//       departmentId: department._id,
//       designationId: designation._id,
//       workLocationId: workLocation._id,
//       constCenterId: costCenter._id,
//       employeeTypeId: employeeType._id,
//       status: 'active'
//     });

//     try {
//       const newEmployee = await employee.save();
//       console.log('New employee saved:', newEmployee);
//     } catch (error) {
//       console.error('Error saving new employee:', error.message);
//     }
//   }

//   return {
//     ...row,
//     constCenterId: costCenter._id.toString(),
//     workLocationId: workLocation._id.toString(),
//     branchId: branch._id.toString(),
//     companyId: company._id.toString(),
//     roleId: role._id.toString(),
//     designationId: designation._id.toString(),
//     departmentId: department._id.toString(),
//     employementTypeId: employmentType._id.toString(),
//     employeeTypeId: employeeType._id.toString(),
//     employeUniqueId: row['employeUniqueId'],
//   };
// }));

//     const filteredArray = updatedArray.filter(item => item !== null);
//     const parser = new Parser();

//     const updatedCsv = parser.parse(filteredArray);

//     const timestamp = Date.now();

//     const originalFileName = path.basename(filePath);
//     const updatedFileName = `csv_${timestamp}_${originalFileName}`;
//     const updatedFilePath = path.join('uploads/csvFile', updatedFileName);

//     fs.writeFileSync(updatedFilePath, updatedCsv);
//     fs.unlinkSync(filePath);

//     return success(res, 'File Convert Successfully');
//   } catch (error) {
//     console.log(error);
//     return badRequest(res, 'Error occurred', error.message);
//   }
// }



async function multipleDataUpdate(req, res) {
  try {
    const fieldToUpdate = 'designationName';
    const updateData = designationModel.updateMany(
      {},
      [{ $set: { [fieldToUpdate]: { $toLower: `$${fieldToUpdate}` } } }]
    );
    return success(res, "Update All Data", updateData);
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}

const xlsx = require('xlsx');
const moment = require('moment');

async function csvToJson(req, res) {
  const filePath = req.file.path;
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = "Finnexe Master Employee data";
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return badRequest(res, `Sheet named "${sheetName}" not found in the file.`);
    }

    const jsonArray = xlsx.utils.sheet_to_json(worksheet);
    // const uniqueTitles = [...new Set(jsonArray.map(row => row['constCenterId']))];
    // const updatedArray = await Promise.all(uniqueTitles.map(async title => {
    //   // Check if the costCenter with the title already exists in the database
    //   let costCenter = await costCenterModel.findOne({ title });

    //   if (!costCenter) {
    //     // If not found, create a new costCenter entry and save it
    //     costCenter = new costCenterModel({ title });
    //     await costCenter.save();
    //   }
    //   const newCostCenterId = costCenter._id 
    //   console.log("newCostCenterId",newCostCenterId);
    //   let role = await roleModel.findOne({ roleName: row['roleId']   });
    //   if (!role) {
    //     role = await new roleModel({ roleName: row['roleId']   })
    //     await role.save()
    //   }
    //   const newRoleId = role._id

    //   let employmentType = await employmentTypeModel.findOne({ title: row['employementTypeId']   });
    //   if (!employmentType) {
    //     employmentType = await new employmentTypeModel({ title: row['employementTypeId']   });
    //     await employmentType.save()
    //   }
    //   const newEmploymentTypeId = employmentType._id

    //   let employeeType = await employeeTypeModel.findOne({ title: row['employeeTypeId']   });
    //   if (!employeeType) {
    //     employeeType = await new employeeTypeModel({ title: row['employeeTypeId']   });
    //   }
    //   const newEmployeeTypeId = employeeType._id

    //   let company = await companyModel.findOne({ companyName: row['companyId']   });
    //   if (!company) {
    //     company = await new companyModel({ companyName: row['companyId']   })
    //     await company.save()
    //   }
    //   const newCompanyId = company._id

    //   const defaultLatitude = 22.7243; 
    //   const defaultLongitude = 75.8797;
    //   let branch = await branchModel.findOne({ branch: row['branchId']   });
    //   if (!branch) {
    //     branch = new branchModel({
    //       branch: row['branchId']  ,
    //       companyId : newCompanyId,
    //       location: {
    //         type: "Point",
    //         coordinates: [defaultLatitude , defaultLongitude]
    //       }
    //     });
    //     await branch.save();
    //   }
    //   const newBranchId = branch._id

    //   let workLocation = await workLocationModel.findOne({ title: row['workLocationId']   });
    //   if (!workLocation) {
    //     workLocation = await new workLocationModel({
    //       branchId : newBranchId ,
    //       companyId: newCompanyId ,
    //        title: row['workLocationId']  ,
    //        location: {
    //         type: "Point",
    //         coordinates: [defaultLatitude , defaultLongitude]
    //       }
    //        })
    //     await workLocation.save();
    //   }
    //   const newWorkLocationId = workLocation._id


    //   let department = await departmentModel.findOne({ departmentName: row['departmentId']   });
    //   if (!department) {
    //     department = await new departmentModel({
    //       branchId : newBranchId ,
    //       companyId: newCompanyId ,
    //       workLocationId: newWorkLocationId ,
    //       departmentName: row['departmentId']   
    //     })
    //     await department.save()
    //   }
    //   const newDepartmentId = department._id

    //   let designation = await designationModel.findOne({ designationName: row['designationId'] });
    //   if (!designation) {
    //     designation = await new designationModel({
    //       branchId : newBranchId ,
    //       companyId: newCompanyId ,
    //       workLocationId: newWorkLocationId ,
    //       departmentId : newDepartmentId,
    //       designationName: row['designationId']   
    //     })
    //     await designation.save()
    //   }
    //   const newDesignationId = designation._id

    //   let employeeId = await employeeModel.findOne({ employeUniqueId: row['employeUniqueId'] });

    //   let newEmployee;
    //   if (!employeeId && employeeId == null) {
    //     const mobileNo = row['mobileNo'] && typeof row['mobileNo'] === 'string'
    //     ? row['mobileNo'].replace(/\s/g, '')
    //     : row['mobileNo'];

    //     let password = row['password'];
    //     if (typeof password !== 'string') {
    //       password = String(password); 
    //     }
    //     password = password.replace(/\s/g, '');
    //     let hashPassword;
    //     if (password) {
    //       const salt = await bcrypt.genSalt(10);
    //       hashPassword = await bcrypt.hash(password, salt); 
    //     }

    //     let joiningDate = null;
    //     if (row['joiningDate']) {
    //       const excelSerial = row['joiningDate'];
    //       joiningDate = moment(new Date((excelSerial - 25569) * 86400 * 1000)).format('YYYY-MM-DD');
    //     }
    //     let dateOfBirth = null;
    //     if (row['dateOfBirth']) {
    //       const excelSerial = row['dateOfBirth'];
    //       dateOfBirth = moment(new Date((excelSerial - 25569) * 86400 * 1000)).format('YYYY-MM-DD');
    //     }

    //     newEmployee = new employeeModel({
    //       employeUniqueId: row['employeUniqueId'],
    //       employeName: row['employeName'],
    //       userName: row['userName'],
    //       password: hashPassword,
    //       email: row['email'] || "",
    //       workEmail: row['workEmail'] || "",
    //       mobileNo: mobileNo,
    //       joiningDate: joiningDate,
    //       dateOfBirth: dateOfBirth,
    //       fatherName: row['fatherName'],
    //       currentAddress: row['currentAddress'],
    //       permanentAddress: row['permanentAddress'],
    //       branchId: newBranchId,
    //       companyId: newCompanyId,
    //       roleId: newRoleId,
    //       employementTypeId: newEmploymentTypeId,
    //       departmentId: newDepartmentId,
    //       designationId: newDesignationId,
    //       workLocationId: newWorkLocationId,
    //       constCenterId: newCostCenterId,
    //       employementTypeId: newEmploymentTypeId,
    //       employeeTypeId: newEmployeeTypeId,
    //       status: 'active'
    //     });

    //     try {
    //       const newEmployees = await newEmployee.save();
    //       console.log('newEmployee save data', newEmployees);
    //     } catch (saveError) {
    //       console.error('Error saving new employee:', saveError.message);
    //     }
    //   } else {
    //     console.log('employee in db', employeeId);
    //   }

    //   return {
    //     ...row,
    //     constCenterId: costCenter._id.toString(),
    //     workLocationId: workLocation._id.toString(),
    //     branchId: branch._id.toString(),
    //     companyId: company._id.toString(),
    //     roleId: role._id.toString(),
    //     designationId: designation._id.toString(),
    //     departmentId: department._id.toString(),
    //     employementTypeId: employmentType._id.toString(),
    //     employeeTypeId: employeeType._id.toString(),
    //     employeUniqueId: row['employeUniqueId'],
    //   };
    // }));
    const uniqueCostCenters = new Set();
    const uniqueRoles = new Set();
    const uniqueEmploymentTypes = new Set();
    const uniqueEmployeeTypes = new Set();
    const uniqueCompanies = new Set();
    const uniqueBranches = new Set();
    const uniqueWorkLocations = new Set();
    const uniqueDepartments = new Set();
    const uniqueDesignations = new Set();

    const updatedArray = await Promise.all(jsonArray.map(async row => {


      const title = row['constCenterId'];
      const roleName = row['roleId'];
      const employmentTypeTitle = row['employementTypeId'];
      const employeeTypeTitle = row['employeeTypeId'];
      const companyName = row['companyId'];
      const branchName = row['branchId'];
      const workLocationTitle = row['workLocationId'];
      const departmentName = row['departmentId'];
      const designationName = row['designationId'];

      // Handle costCenter
      // let costCenter = null;
      if (!uniqueCostCenters.has(title)) {
        uniqueCostCenters.add(title);
        costCenter = await costCenterModel.findOne({ title });
        if (!costCenter) {
          costCenter = new costCenterModel({ title });
          await costCenter.save();
        }
      }

      // Handle role
      // let role = null;
      if (!uniqueRoles.has(roleName)) {
        uniqueRoles.add(roleName);
        role = await roleModel.findOne({ roleName });
        if (!role) {
          role = new roleModel({ roleName });
          await role.save();
        }
      }

      // Handle employmentType
      // let employmentType = null;
      if (!uniqueEmploymentTypes.has(employmentTypeTitle)) {
        uniqueEmploymentTypes.add(employmentTypeTitle);
        employmentType = await employmentTypeModel.findOne({ title: employmentTypeTitle });
        if (!employmentType) {
          employmentType = new employmentTypeModel({ title: employmentTypeTitle });
          await employmentType.save();
        }
      }

      // Handle employeeType
      // let employeeType = null;
      if (!uniqueEmployeeTypes.has(employeeTypeTitle)) {
        uniqueEmployeeTypes.add(employeeTypeTitle);
        employeeType = await employeeTypeModel.findOne({ title: employeeTypeTitle });
        if (!employeeType) {
          employeeType = new employeeTypeModel({ title: employeeTypeTitle });
          await employeeType.save();
        }
      }

      // Handle company
      // let company = null;
      if (!uniqueCompanies.has(companyName)) {
        uniqueCompanies.add(companyName);
        company = await companyModel.findOne({ companyName });
        if (!company) {
          company = new companyModel({ companyName });
          await company.save();
        }
      }


      // Handle branch
      // let branch = null;
      if (!uniqueBranches.has(branchName)) {
        uniqueBranches.add(branchName);
        branch = await branchModel.findOne({ branch: branchName });
        if (!branch) {
          branch = new branchModel({
            branch: branchName,
            companyId: company._id, // Now company._id is guaranteed to exist
            location: {
              type: "Point",
              coordinates: [22.7243, 75.8797] // Default coordinates
            }
          });
          await branch.save();
        }
      }

      // Handle workLocation
      // let workLocation = null;
      if (!uniqueWorkLocations.has(workLocationTitle)) {
        uniqueWorkLocations.add(workLocationTitle);
        workLocation = await workLocationModel.findOne({ title: workLocationTitle });
        if (!workLocation) {
          workLocation = new workLocationModel({
            branchId: branch._id,
            companyId: company._id,
            title: workLocationTitle,
            location: {
              type: "Point",
              coordinates: [22.7243, 75.8797] // Default coordinates
            }
          });
          await workLocation.save();
        }
      }

      // Handle department
      // let department = null;
      if (!uniqueDepartments.has(departmentName)) {
        uniqueDepartments.add(departmentName);
        department = await departmentModel.findOne({ departmentName });
        if (!department) {
          department = new departmentModel({
            branchId: branch._id,
            companyId: company._id,
            workLocationId: workLocation._id,
            departmentName: departmentName
          });
          await department.save();
        }
      }

      // Handle designation
      // let designation = null;
      if (!uniqueDesignations.has(designationName)) {
        uniqueDesignations.add(designationName);
        designation = await designationModel.findOne({ designationName });
        if (!designation) {
          designation = new designationModel({
            branchId: branch._id,
            companyId: company._id,
            workLocationId: workLocation._id,
            departmentId: department._id,
            designationName: designationName
          });
          await designation.save();
        }
      }

      // Handle employee
      let employee = await employeeModel.findOne({ employeUniqueId: row['employeUniqueId'] });
      if (!employee) {
        const mobileNo = row['mobileNo'] && typeof row['mobileNo'] === 'string'
          ? row['mobileNo'].replace(/\s/g, '')
          : row['mobileNo'] !== null && row['mobileNo'] !== undefined
            ? String(row['mobileNo']).replace(/\s/g, '')
            : null;
        let password = row['password'] ? String(row['password']).replace(/\s/g, '') : '';
        const hashPassword = password ? await bcrypt.hash(password, 10) : '';

        const joiningDate = row['joiningDate'] ? moment(new Date((row['joiningDate'] - 25569) * 86400 * 1000)).format('YYYY-MM-DD') : null;
        const dateOfBirthRaw = row['dateOfBirth'];
        const dateOfBirth = dateOfBirthRaw ? moment(new Date((dateOfBirthRaw - 25569) * 86400 * 1000)).isValid() ? moment(new Date((dateOfBirthRaw - 25569) * 86400 * 1000)).format('YYYY-MM-DD') : null : null;

        employee = new employeeModel({
          employeUniqueId: row['employeUniqueId'],
          employeName: row['employeName'],
          userName: row['userName'],
          password: hashPassword,
          email: row['email'] || "",
          workEmail: row['workEmail'] || "",
          mobileNo: mobileNo,
          joiningDate: joiningDate,
          dateOfBirth: dateOfBirth,
          fatherName: row['fatherName'],
          currentAddress: row['currentAddress'],
          permanentAddress: row['permanentAddress'],
          branchId: branch._id,
          companyId: company._id,
          roleId: role._id,
          employementTypeId: employmentType._id,
          departmentId: department._id,
          designationId: designation._id,
          workLocationId: workLocation._id,
          constCenterId: costCenter._id,
          employeeTypeId: employeeType._id,
          status: 'active'
        });

        try {
          const newEmployee = await employee.save();
          console.log('New employee saved:', newEmployee);
        } catch (error) {
          console.error('Error saving new employee:', error.message);
        }
      }

      return {
        ...row,
        constCenterId: costCenter._id.toString(),
        workLocationId: workLocation._id.toString(),
        branchId: branch._id.toString(),
        companyId: company._id.toString(),
        roleId: role._id.toString(),
        designationId: designation._id.toString(),
        departmentId: department._id.toString(),
        employementTypeId: employmentType._id.toString(),
        employeeTypeId: employeeType._id.toString(),
        employeUniqueId: row['employeUniqueId'],
      };
    }));

    const filteredArray = updatedArray.filter(item => item !== null);
    const parser = new Parser();

    const updatedCsv = parser.parse(filteredArray);

    const timestamp = Date.now();

    const originalFileName = path.basename(filePath);
    const updatedFileName = `csv_${timestamp}_${originalFileName}`;
    const updatedFilePath = path.join('uploads/csvFile', updatedFileName);

    fs.writeFileSync(updatedFilePath, updatedCsv);
    fs.unlinkSync(filePath);

    return success(res, 'File Convert Successfully');
  } catch (error) {
    console.log(error);
    return badRequest(res, 'Error occurred', error.message);
  }
}



async function reqBodyDataInRes(req, res) {
  try {
    const bodyData = req.body;
    console.log('req.body :--', req.body)
    return success(res, "Data successfully", bodyData);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
}


module.exports = {
  loanCalculator,
  getCustomerDetail,
  cibilAndPdStatusUpdate,
  getProcessDetail,
  csvToJson,
  multipleDataUpdate,
  reqBodyDataInRes,
  newGetCustomerFilesDetail
};
