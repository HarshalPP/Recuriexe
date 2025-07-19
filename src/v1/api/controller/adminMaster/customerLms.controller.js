const {
    success,
    unknownError,
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
  const uploadToSpaces = require('../../services/spaces.service'); // Ensure the correct path to the upload function
  const employeeModel     = require("../../model/adminMaster/employe.model")
  const disbursedCustomerModel  = require("../../model/newCollection/disbursedCustomer.model.js");
  const newBranchModel    = require("../../model/adminMaster/newBranch.model")
  const employeeAllocationModel = require("../../model/adminMaster/employeeAllocation.model")
  const customerModel      = require("../../model/customer.model")
  const applicantModel     = require("../../model/applicant.model")
  const coApplicantModel   = require("../../model/co-Applicant.model")
  const guarantorModel     = require("../../model/guarantorDetail.model")
  const cibilModel         = require("../../model/cibilDetail.model")
  const bankStatementModel = require("../../model/branchPendency/bankStatementKyc.model.js")
  const guarantorBankModel = require("../../model/branchPendency/gurrantorbankStatment.model.js")
  const finalSanctionModel = require("../../model/finalSanction/finalSnction.model.js")
  const technicalFormModel = require("../../model/branchPendency/approverTechnicalFormModel.js")
  const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js");
  const processModel       = require("../../model/process.model.js")
  const externalVendorModel = require("../../model/externalManager/externalVendorDynamic.model.js");
  const disbursementModel = require("../../model/fileProcess/disbursement.model.js")
  const customerFinanceModel = require("../../model/newCollection/customerFinanceSummary.model.js")

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

//---------------Finexe Customer ADd After Disbursment---------------------
async function customerFinexeAdd(req, res) {
  try {
    const { customerId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return badRequest(res, "Invalid customerId");
    }

    // Execute all database queries in parallel using Promise.all
    const [
      customerDetail,
      processDetail,
      pdDoneDetail,
      applicant,
      coApplicants,
      guarantor,
      cibilRecords,
      bankStatementKyc,
      guarantorBank,
      finalSanctionDetail,
      technicalFormDetail,
      internalLegalDetail,
      disbursementDetail
    ] = await Promise.all([
      customerModel.findById(customerId),
      processModel.findOne({ customerId }),
      externalVendorModel.findOne({ customerId }),
      applicantModel.findOne({ customerId }),
      coApplicantModel.find({ customerId }),
      guarantorModel.findOne({ customerId }),
      cibilModel.findOne({ customerId }),
      bankStatementModel.findOne({ customerId }),
      guarantorBankModel.findOne({ customerId }),
      finalSanctionModel.findOne({ customerId }),
      technicalFormModel.findOne({ customerId }),
      internalLegalModel.findOne({ customerId }),
      disbursementModel.findOne({ customerId })
    ]);

    if (!customerDetail) {
      return notFound(res, "Customer ID not found");
    }

    // Prepare co-applicant data
    const coApplicantData = coApplicants.map((coApp, index) => ({
      coAppId: coApp._id,
      name: coApp.fullName || "",
      mobile: coApp.mobileNo || null,
      email: coApp.email || "",
      address: coApp.permanentAddress?.addressLine1 || "",
      state: coApp.permanentAddress?.state || "",
      gender: coApp.gender || "",
      dob: coApp.dob || "",
      age: coApp.age || "",
      cibilScore:
        cibilRecords?.coApplicantData && cibilRecords.coApplicantData[index]?.coApplicantCibilScore || null,
      // kycUpload: {
        aadharFrontImage: coApp.kycUpload?.aadharFrontImage || "",
        aadharBackImage: coApp.kycUpload?.aadharBackImage || "",
        panFrontImage: coApp.kycUpload?.panFrontImage || "",
        drivingLicenceImage: coApp.kycUpload?.drivingLicenceImage || "",
        voterIdImage: coApp.kycUpload?.voterIdImage || "",
      // },
    }));

    // Prepare guarantor data
    const guarantorData = guarantor
      ? {
          gtrName: guarantor.fullName || "",
          gtrFatherName: guarantor.fatherName || "",
          gtrMobNo: guarantor.mobileNo || null,
          gtrAddress: guarantor.permanentAddress?.addressLine1 || "",
          gtrState: guarantor.permanentAddress?.state || "",
          gtrGender: guarantor.gender || "",
          gtrDob: guarantor.dob || "",
          gtrAge: guarantor.age || "",
          gtrCibilScore: cibilRecords?.guarantorCibilScore || null,
          // gtrKycUpload: {
            aadharFrontImage: guarantor.kycUpload?.aadharFrontImage || "",
            aadharBackImage: guarantor.kycUpload?.aadharBackImage || "",
            docImage: guarantor.kycUpload?.docImage || "",
          // },
        }
      : {};

    let guarantorBankDetail = {};
    if (guarantorBank && Array.isArray(guarantorBank.bankDetails)) {
      const grtBankDetail = guarantorBank.bankDetails.find(
        (bank) => bank.Type === "guarantor"
      );

      if (grtBankDetail) {
        guarantorBankDetail = {
          gtrBankName: grtBankDetail.bankName || "",
          gtrBankBranch: grtBankDetail.branchName || "",
          gtrAcHolderName: grtBankDetail.acHolderName || "",
          gtrAcNumber: grtBankDetail.accountNumber || "",
          gtrIfscCode: grtBankDetail.ifscCode || "",
          gtrAcType: grtBankDetail.accountType || "",
        };
      }
    }

    let bankStatementKycDetail = {};
    if (bankStatementKyc && Array.isArray(bankStatementKyc.bankDetails)) {
      const repaymentBank = bankStatementKyc.bankDetails.find(
        (bank) => bank.E_Nach_Remarks === "true"
      );

      if (repaymentBank) {
        bankStatementKycDetail = {
          repaymentBankName: repaymentBank.bankName || "",
          bankBranch: repaymentBank.branchName || "",
          accountHolder: repaymentBank.acHolderName || "",
          accountNumber: repaymentBank.accountNumber || "",
          ifscCode: repaymentBank.ifscCode || "",
          accountType: repaymentBank.accountType || "",
          nachDoneBy: "", // Add logic if required
          nachTokenId: "", // Add logic if required
        };
      }
    }

    // Income Detail
    const incomeData = finalSanctionDetail
      ? {
        customerProfile: finalSanctionDetail.customerProfile,
        customerSegment: finalSanctionDetail.customerSegment,
        foir: finalSanctionDetail.foir,
        monthlyIncome: finalSanctionDetail.totalIncome,
        monthlyObligations: finalSanctionDetail.totalObligations,
        }
      : {};

    // Prepare Loan Detail
    const finalSanction = finalSanctionDetail
      ? {
          productId: customerDetail.productId,
          caseType: finalSanctionDetail.loanType,
          partnerId: finalSanctionDetail.partnerId,
          loanAmount: finalSanctionDetail.finalLoanAmount,
          tenure: finalSanctionDetail.tenureInMonth,
          roi: finalSanctionDetail.roi,
          emi: finalSanctionDetail.emiAmount,
          pfCharges: finalSanctionDetail.charges?.processingFeesInclusiveOfGst,
          documentCharges: finalSanctionDetail.charges?.documentationChargesInclusiveOfGst,
          cersaiCharges: finalSanctionDetail.charges?.cersaiChargesInRs,
          insuranceCharges: finalSanctionDetail.charges?.insurancePremiumInRs,
          actualPreEmi: finalSanctionDetail.charges?.preEmiInterestInRs,
          netDisbursementAmount: "",
          sanctionDate: finalSanctionDetail.finalSanctionStatusDate,
          disbursementDate: disbursementDetail?.postDisbursement.dateOfDisbursement || "",
          disbursementMonth: disbursementDetail?.postDisbursement.dateOfDisbursement || "",
        }
      : {};

    // Property Paper Detail
    const propertyPaper = technicalFormDetail
      ? {
          propertyPaperType: internalLegalDetail?.propertyPaperType || "",
          propertyType: technicalFormDetail.propertyType,
          marketValue: technicalFormDetail.fairMarketValueOfLand,
          ltv: technicalFormDetail.Ltv,
          lat: technicalFormDetail.latitude,
          long: technicalFormDetail.longitude,
        }
      : {};

    // Emi Detail
    const emiData = finalSanctionDetail
    ? {
        emiCycle: finalSanctionDetail.emiCycle || "",
        firstEmiDate: disbursementDetail?.postDisbursement.dateOfFirstEmi || "",
        firstEmiMonth: disbursementDetail?.postDisbursement.dateOfFirstEmi || "",
      }
    : {};

    // Prepare customer data object
    const customerDataObj = {
      branchId: customerDetail.branch || null,
      salesId: processDetail?.employeId || null,
      pdDoneById: pdDoneDetail?.creditPdId || null,
      customerId: customerDetail._id,
      LD: customerDetail.customerFinId || "",
      loanNo: disbursementDetail?.postDisbursement?.loanNumber || "",
      customerDetail: {
        applicantId: applicant?._id || null,
        customerPhoto: applicant?.applicantPhoto || "",
        customerName: applicant?.fullName || "",
        fatherName: applicant?.fatherName || "",
        mobile: applicant?.mobileNo || null,
        email: applicant?.email || "",
        village: applicant?.village || "",
        address: applicant?.permanentAddress?.addressLine1 || "",
        state: applicant?.permanentAddress?.state || "",
        gender: applicant?.gender || "",
        dob: applicant?.dob || "",
        age: applicant?.age || "",
        // customerKycUpload: {
          aadharFrontImage: applicant?.kycUpload?.aadharFrontImage || "",
          aadharBackImage: applicant?.kycUpload?.aadharBackImage || "",
          panFrontImage: applicant?.kycUpload?.panFrontImage || "",
          drivingLicenceImage: applicant?.kycUpload?.drivingLicenceImage || "",
          voterIdImage: applicant?.kycUpload?.voterIdImage || "",
        // },
        cibilScore: cibilRecords?.applicantCibilScore || null,
      },
      coApplicant: coApplicantData,
      gurantorDetail: guarantorData,
      repaymentDetail: bankStatementKycDetail,
      gtrBankDetail: guarantorBankDetail,
      loanDetail: finalSanction,
      incomeData: incomeData,
      propertDetail: propertyPaper,
      emiDetail: emiData
    };

    // Prepare finance summary data
    const LD = customerDetail.customerFinId || "";
    let financeSummaryData = null;
    
    if (LD) {
      financeSummaryData = {
        LD: LD,
        emiAmount: finalSanctionDetail?.emiAmount || 0,
        oldDueAmount: 0,
        netDueAmount: finalSanctionDetail?.emiAmount || 0,
        posOutStanding: 0,
        dpdBucket: 0,
        collectionType: "",
        lastEmiDate: "",
        lastEmiReceivedDate: "",
      };
    }

    // Execute both database updates in parallel
    const [customerData] = await Promise.all([
      disbursedCustomerModel.findOneAndUpdate(
        { customerId },
        customerDataObj,
        { upsert: true, new: true }
      ),
      // Only update finance model if LD exists
      LD && financeSummaryData ? 
        customerFinanceModel.findOneAndUpdate(
          { LD },
          financeSummaryData,
          { upsert: true, new: true }
        ) : 
        Promise.resolve()
    ]);

    return success(res, "Customer added/updated successfully", customerData);
  } catch (error) {
    console.error("Error:", error.message);
    return unknownError(res, error.message);
  }
}

//--GET METHOD TO GET ALL CUSTOMER API FOR FINEXE CUSTOMER WITH FULL DETAIL----
async function getAllFinexeCustomer(req, res){
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
    
      // Unwind arrays to objects and handle empty cases
      {
        $addFields: {
          pdPerson: { $ifNull: [{ $arrayElemAt: ["$pdPerson", 0] }, {}] },
          branch: { $ifNull: [{ $arrayElemAt: ["$branch", 0] }, {}] },
          partnerDetail: { $ifNull: [{ $arrayElemAt: ["$partnerDetail", 0] }, {}] }
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



//------------------Add OR Get Detail Customer Add When Disbursement Done---------------------------
async function customerLmsAdd(req, res) {
    try {
        const {
            LD, loanNo, branch, customerName, fatherName, mobile, village, address, state, gender, dob, age, cibilScore,
            latitude, longitude, salesId, pdDoneById, salesManagerId, clusterManagerId, 
            coApplicant = [],
            gtrName, gtrFatherName, gtrAddress, gtrMobNo, gtrState, gtrGender, gtrDob, gtrAge, gtrCibilScore,
            gtrBankName, gtrBankBranch, gtrAcHolderName, gtrAcNumber, gtrIfscCode, gtrAcType
        } = req.body;

        // Check if LD already exists
        const existingCustomer = await disbursedCustomerModel.findOne({ LD });
        if (existingCustomer) {
            return badRequest(res, "LD number already exists. Please use update API.");
        }

        // Process coApplicants to ensure proper type numbering
        const processedCoApplicants = coApplicant.map((applicant, index) => ({
            ...applicant,
            type: `coApplicant${String(index + 1).padStart(2, '0')}` // Creates coApplicant01, coApplicant02, etc.
        }));

        // Creating a new customer document
        const newCustomer = new disbursedCustomerModel({
            LD,
            loanNo,
            branch,
            customerName,
            fatherName,
            mobile,
            village,
            address,
            state,
            gender,
            dob,
            age,
            cibilScore,
            salesId,
            pdDoneById,
            salesManagerId,
            clusterManagerId,
            coApplicant: processedCoApplicants,
            gtrName,
            gtrFatherName,
            gtrAddress,
            gtrMobNo,
            gtrState,
            gtrGender,
            gtrDob,
            gtrAge,
            gtrCibilScore,
            gtrBankName,
            gtrBankBranch,
            gtrAcHolderName,
            gtrAcNumber,
            gtrIfscCode,
            gtrAcType,
            status: "pending"
        });

        const savedCustomer = await newCustomer.save();
        return success(res, "Customer LMS entry created successfully", savedCustomer);

    } catch (error) {
        console.error("Error in customerLmsAdd:", error);
        return unknownError(res, error);
    }
}


// ----------------EMI Detail Download Xecl--------------------------------------------------------
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






  module.exports = {
    customerFinexeAdd,
    getAllFinexeCustomer,
    customerLmsAdd,
    emiDetailXcelDownload,
    uploadEmiDetails,
  };