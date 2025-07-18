import AgencyModel from "../../models/ClientModel/Client.model.js"
import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import ClientCandidateAssignment from "../../models/ClientModel/ClientCandidate.model.js"
import jobApply from "../../models/jobformModel/jobform.model.js"
import mongoose from "mongoose"
import ExcelJS from "exceljs";
import uploadToSpaces from "../../services/spaceservices/space.service.js"
import path from "path";
import fs from "fs";
import ClientModel from "../../models/ClientModel/Client.model.js"

// Create
export const createAgencyClient = async (req, res) => {
  try {
    const { organizationId } = req.employee; // Assuming admin user
    const { companyName, Email, MobileNumber, designationId, location } = req.body;

    if (!companyName || !Email || !MobileNumber) {
      return badRequest(res, "companyName, Email, and MobileNumber are required.");
    }

    const client = await AgencyModel.create({
      organizationId,
      companyName,
      Email,
      MobileNumber,
      designationId,
      location
    });

    return success(res, "Client created successfully", client);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};


// get api for location //

export const getAllAgencyClientsForLocation = async (req, res) => {
  try {
    const { organizationId } = req.employee;
    const { location: locations, clientId } = req.query;

    let filter = { organizationId };

    if (clientId) {
      filter._id = clientId;
    } else if (locations && locations.length > 0) {
      filter.location = { $in: Array.isArray(locations) ? locations : [locations] };
    }

    const agencyClients = await AgencyModel.find(filter).populate({
      path: "location",
      select: "name", // _id is returned by default in Mongoose unless explicitly excluded
    });

    if (!agencyClients || agencyClients.length === 0) {
      return success(res, "No locations found for this organization", []);
    }

    // Collect all populated location objects (supporting both single and multiple references)
    const allLocations = agencyClients.flatMap(client =>
      Array.isArray(client.location) ? client.location : [client.location]
    );

    // Remove duplicates based on _id
    const uniqueLocationMap = new Map();
    for (const loc of allLocations) {
      if (loc && loc._id) {
        uniqueLocationMap.set(loc._id.toString(), { _id: loc._id, locationName: loc.name });
      }
    }

    const response = Array.from(uniqueLocationMap.values());

    return success(res, "Unique client locations fetched successfully", response);
  } catch (error) {
    console.error("Error fetching unique client locations:", error);
    return unknownError(res, error.message || "Something went wrong");
  }
};


// Get All (for organization)
export const getAllAgencyClients = async (req, res) => {
  try {
    const { organizationId } = req.employee;
    const { location, clientId, startDate, endDate } = req.query;

    // Base match
    let matchQuery = { organizationId };

    // Filter by location(s)
    if (location) {
      matchQuery.location = { $in: location.split(",") }; // accepts CSV
    }

    // Filter by specific client ID
    if (clientId) {
      matchQuery._id = clientId;
    }

    // Filter by date range
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate).setHours(0, 0, 0, 0),
        $lte: new Date(endDate).setHours(23, 59, 59, 999)
      };
    } else if (startDate) {
      matchQuery.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      matchQuery.createdAt = { $lte: new Date(endDate) };
    }

    // Fetch filtered clients
    const clients = await AgencyModel.find(matchQuery)
      .sort({ createdAt: -1 })
      .populate({
        path: "designationId",
        select: "name"
      })
      .populate({
        path: "location",
        select: "name"
      });

    return success(res, "Client list fetched", clients);
  } catch (error) {
    console.error("Error in getAllAgencyClients:", error);
    return unknownError(res, error);
  }
};


// Get One
export const getAgencyClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await AgencyModel.findById(id)
      .populate({
        path: "designationId",
        select: 'name'
      })
      .populate({
        path: "location",
        select: 'name'
      });

    if (!client) return badRequest(res, "Client not found");

    return success(res, "Client fetched", client);
  } catch (error) {
    return unknownError(res, error);
  }
};

// Update
export const updateAgencyClient = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await AgencyModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return badRequest(res, "Client not found");

    return success(res, "Client updated", updated);
  } catch (error) {
    return unknownError(res, error);
  }
};

// Delete
export const deleteAgencyClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AgencyModel.findByIdAndDelete(id);

    if (!deleted) return badRequest(res, "Client not found");

    return success(res, "Client deleted", deleted);
  } catch (error) {
    return unknownError(res, error);
  }
};

// Assing 
export const assignMultipleCandidatesToClient = async (req, res) => {
  try {
    const { clientId, candidateIds } = req.body;
    const organizationId = req.employee.organizationId;
    const assignedBy = req.employee.id;

    if (!clientId || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return badRequest(res, "clientId and at least one candidateId are required.");
    }

    const existingAssignment = await ClientCandidateAssignment.findOne({
      clientId,
      organizationId,
    });

    let alreadyAssigned = [];
    let newCandidateIds = candidateIds;

    if (existingAssignment) {
      alreadyAssigned = candidateIds.filter(id =>
        existingAssignment.candidateIds.includes(id.toString())
      );
      newCandidateIds = candidateIds.filter(id => !alreadyAssigned.includes(id));
    }

    if (newCandidateIds.length > 0) {
      if (existingAssignment) {
        await ClientCandidateAssignment.updateOne(
          { _id: existingAssignment._id },
          { $addToSet: { candidateIds: { $each: newCandidateIds } } }
        );
      } else {
        await ClientCandidateAssignment.create({
          clientId,
          organizationId,
          assignedBy,
          candidateIds: newCandidateIds,
        });
      }

      await jobApply.updateMany(
        {
          _id: { $in: newCandidateIds.map(id => new mongoose.Types.ObjectId(id)) },
          orgainizationId: organizationId,
        },
        { $set: { clientId } }
      );
    }

    // ✅ Fetch the final assigned list (old + new)
    const updatedAssignment = await ClientCandidateAssignment.findOne({
      clientId,
      organizationId,
    });

    const allAssignedCandidateIds = updatedAssignment?.candidateIds || [];

    if (!allAssignedCandidateIds.length) {
      return success(res, "No assigned candidates found.", {
        assignedCount: 0,
        skippedCount: 0,
        url: null,
      });
    }

    // 📦 Fetch complete candidate data for Excel
    const candidates = await jobApply.aggregate([
      {
        $match: {
          _id: { $in: allAssignedCandidateIds.map(id => new mongoose.Types.ObjectId(id)) },
          orgainizationId: new mongoose.Types.ObjectId(organizationId),
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newbranches",
          let: { branchIds: "$branchId" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$branchIds"] } } },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "branches",
        },
      },

      {
        $lookup: {
          from: "jobposts",
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPost",
        },
      },
      { $unwind: { path: "$jobPost", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPost.designationId",
          foreignField: "_id",
          as: "designation",
        },
      },
      { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPost.subDepartmentId",
          foreignField: "subDepartments._id",
          as: "subDeptContainer",
        },
      },
      {
        $addFields: {
          subDepartment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $arrayElemAt: ["$subDeptContainer.subDepartments", 0] },
                  as: "sub",
                  cond: { $eq: ["$$sub._id", "$jobPost.subDepartmentId"] },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          candidateUniqueId: 1,
          name: 1,
          emailId: 1,
          mobileNumber: 1,
          resume: 1,
          currentCTC: 1,
          expectedCTC: 1,
          matchPercentage: 1,
          summary: 1,
          AI_Score: 1,
          AI_Screeing_Result: 1,
          resumeShortlisted: 1,
          lastOrganization: 1,
          position: 1,
          createdAt: 1,
          departmentName: "$department.name",
          subDepartmentName: "$subDepartment.name",
          designationName: "$designation.name",
          branches: "$branches",
          resume:1
        },
      },
    ]);

    const formattedData = candidates.map((c) => ({
      candidateUniqueId: c.candidateUniqueId,
      name: c.name,
      emailId: c.emailId,
      mobileNumber: c.mobileNumber,
      department: c.departmentName || "",
      subDepartment: c.subDepartmentName || "",
      designation: c.designationName || "",
      currentCTC: c.currentCTC || "",
      expectedCTC: c.expectedCTC || "",
      AI_Score: c.AI_Score ?? "",
      AI_Screeing_Result: c.AI_Screeing_Result || "",
      resumeShortlisted: c.resumeShortlisted || "",
      lastOrganization: Array.isArray(c.lastOrganization)
        ? c.lastOrganization.join(", ")
        : c.lastOrganization || "",
      locations: c.branches?.map((b) => b.name).join(", ") || "",
      resume: c.resume || "",
      createdAt: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",

    }));

    // // 📄 Create Excel in-memory
    // const workbook = new ExcelJS.Workbook();
    // const worksheet = workbook.addWorksheet("Candidates");

    // worksheet.columns = Object.keys(formattedData[0]).map(key => ({
    //   header: key,
    //   key,
    //   width: 25
    // }));

    // worksheet.addRows(formattedData);


    // 📄 Create Excel in-memory with styles
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Candidates");

// Define headers and styles
const columns = Object.keys(formattedData[0]).map((key) => ({
  header: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize header
  key,
  width: 25,
}));

worksheet.columns = columns;

// Add header styling (bold, background color, center aligned)
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' }, // Blue header
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.border = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  };
});

// Add rows and apply alternate row shading
formattedData.forEach((data, index) => {
  const row = worksheet.addRow(data);
  const isEven = index % 2 === 0;
  row.eachCell((cell , colNumber) => {
        const key = worksheet.getColumn(colNumber).key;

    // Make resume cell a hyperlink
    if (key === "resume" && data.resume) {
      cell.value = {
        text: "View Resume",
        hyperlink: data.resume
      };
      cell.font = { color: { argb: 'FF0000FF' }, underline: true };
    }
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
    if (isEven) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F4FD' }, // Light blue for alternate rows
      };
    }
  });
});


    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `HRMS/exports/assigned-candidates-${Date.now()}.xlsx`;

    const url = await uploadToSpaces(
      "finexe",
      fileName,
      buffer,
      "public-read",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    // ✅ Update the assignment with the Excel URL
    await ClientCandidateAssignment.updateOne(
      { clientId, organizationId },
      { $set: { excelUrl: url } }
    );



    return success(res, "Candidate assignment updated and Excel uploaded.", {
      assignedCount: newCandidateIds.length,
      skippedCount: alreadyAssigned.length,
      totalCandidates: formattedData.length,
      url,
    });

  } catch (err) {
    console.error("Error assigning candidates to client:", err);
    return unknownError(res, err);
  }
};




export const getAssignedCandidatesToClients = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const { clientId, designationId, search, page = 1, limit = 100 } = req.query;

    const matchConditions = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };

    if (clientId) {
      matchConditions.clientId = new mongoose.Types.ObjectId(clientId);
    }

    const pipeline = [
      { $match: matchConditions },

      // Lookup client details
      {
        $lookup: {
          from: "agencies",
          localField: "clientId",
          foreignField: "_id",
          as: "clientDetails"
        }
      },
      { $unwind: "$clientDetails" },

      // Unwind candidateIds array
      { $unwind: "$candidateIds" },

      // Lookup candidate details from jobApplyForm
      {
        $lookup: {
          from: "jobapplyforms",
          localField: "candidateIds",
          foreignField: "_id",
          as: "candidateDetails"
        }
      },
      { $unwind: "$candidateDetails" },

      // Lookup job post for designation & subDepartment
      {
        $lookup: {
          from: "jobposts",
          localField: "candidateDetails.jobPostId",
          foreignField: "_id",
          as: "jobPostDetail"
        }
      },
      {
        $unwind: {
          path: "$jobPostDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup department
      {
        $lookup: {
          from: "newdepartments",
          localField: "candidateDetails.departmentId",
          foreignField: "_id",
          as: "departmentDetail"
        }
      },
      {
        $unwind: {
          path: "$departmentDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup branches
      {
        $lookup: {
          from: "newbranches",
          let: { branchIds: "$candidateDetails.branchId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$branchIds"]
                }
              }
            },
            { $project: { _id: 1, name: 1 } }
          ],
          as: "branchDetails"
        }
      },

      // Lookup designation
      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPostDetail.designationId",
          foreignField: "_id",
          as: "designationDetail"
        }
      },
      {
        $unwind: {
          path: "$designationDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup sub-department
      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPostDetail.subDepartmentId",
          foreignField: "subDepartments._id",
          as: "subDepartmentDetail"
        }
      },
      {
        $unwind: {
          path: "$subDepartmentDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          subDepartment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$subDepartmentDetail.subDepartments",
                  as: "sub",
                  cond: {
                    $eq: ["$$sub._id", "$jobPostDetail.subDepartmentId"]
                  }
                }
              },
              0
            ]
          }
        }
      },

      // Optional filtering
      ...(designationId
        ? [{
          $match: {
            "jobPostDetail.designationId": new mongoose.Types.ObjectId(designationId)
          }
        }]
        : []),

      ...(search
        ? [{
          $match: {
            $or: [
              { "candidateDetails.name": { $regex: search, $options: "i" } },
              { "candidateDetails.emailId": { $regex: search, $options: "i" } },
              { "candidateDetails.mobileNumber": { $regex: search, $options: "i" } },
              { "clientDetails.companyName": { $regex: search, $options: "i" } }
            ]
          }
        }]
        : []),

      // Final projection
      {
        $project: {
          _id: 0,
          clientId: "$clientId",
          clientName: "$clientDetails.companyName",
          excelUrl: "$excelUrl", // <-- Include excel URL
          candidate: {
            _id: "$candidateDetails._id",
            candidateUniqueId: "$candidateDetails.candidateUniqueId",
            name: "$candidateDetails.name",
            emailId: "$candidateDetails.emailId",
            mobileNumber: "$candidateDetails.mobileNumber",
            resume: "$candidateDetails.resume",
            currentCTC: "$candidateDetails.currentCTC",
            expectedCTC: "$candidateDetails.expectedCTC",
            matchPercentage: "$candidateDetails.matchPercentage",
            summary: "$candidateDetails.summary",
            AI_Score: "$candidateDetails.AI_Score",
            AI_Confidence: "$candidateDetails.AI_Confidence",
            AI_Screeing_Result: "$candidateDetails.AI_Screeing_Result",
            resumeShortlisted: "$candidateDetails.resumeShortlisted",
            lastOrganization: "$candidateDetails.lastOrganization",
            position: "$candidateDetails.position",
            createdAt: "$candidateDetails.createdAt",
            department: "$departmentDetail.name",
            branches: "$branchDetails",
            designation: "$designationDetail.name",
            subDepartment: "$subDepartment.name"
          }
        }
      },

      // Group by client
      {
        $group: {
          _id: "$clientId",
          clientName: { $first: "$clientName" },
          excelUrl: { $first: "$excelUrl" }, // 👈 Add this
          candidates: { $push: "$candidate" }
        }
      },

      { $sort: { clientName: 1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ];

    const results = await ClientCandidateAssignment.aggregate(pipeline);

    return success(res, "Assigned candidates fetched successfully.", {
      page: parseInt(page),
      limit: parseInt(limit),
      data: results
    });

  } catch (err) {
    console.error("Error in getAssignedCandidatesToClients:", err);
    return unknownError(res, err);
  }
};


export const getAgencyDashboard = async (req, res) => {
  try {
    const { organizationId } = req.employee;
    const { timeFilter } = req.query; // 'today', 'week', 'month', 'year', 'all'

    // Build date filter based on timeFilter
    let dateFilter = {};
    const now = new Date();
    
    switch (timeFilter) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = {
          createdAt: {
            $gte: weekStart,
            $lt: now
          }
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'year':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'all':
      default:
        dateFilter = {};
        break;
    }
    

    // Combine organization filter with date filter
    const baseFilter = { organizationId, ...dateFilter };

    // Execute all queries in parallel for better performance
    const [
      totalClients,
      activeClients,
      inactiveClients,
      assignedCandidatesCount,
      recentActiveClients,
      recentInactiveClients,
      locationBreakdown,
      monthlyStats
    ] = await Promise.all([
      // Total clients count
      ClientModel.countDocuments(baseFilter),
      
      // Active clients count
      ClientModel.countDocuments({ ...baseFilter, isActive: true }),
      
      // Inactive clients count
      ClientModel.countDocuments({ ...baseFilter, isActive: false }),

      
      // Assigned candidates count - using aggregation for accurate count
      ClientCandidateAssignment.aggregate([
        {
          $match: {
            organizationId: new mongoose.Types.ObjectId(organizationId),
            ...(Object.keys(dateFilter).length > 0 && { assignedAt: dateFilter.createdAt })
          }
        },
        {
          $unwind: "$candidateIds"
        },
        {
          $group: {
            _id: null,
            totalAssignedCandidates: { $sum: 1 }
          }
        }
      ]).then(result => result[0]?.totalAssignedCandidates || 0),
      
      // Recent active clients with details
      ClientModel.find({ ...baseFilter, isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: "designationId",
          select: 'name'
        })
        .populate({
          path: "location",
          select: 'name'
        })
        .select('ClientUniqueId companyName Email MobileNumber createdAt isActive'),
      
      // Recent inactive clients with details
      ClientModel.find({ ...baseFilter, isActive: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: "designationId",
          select: 'name'
        })
        .populate({
          path: "location",
          select: 'name'
        })
        .select('ClientUniqueId companyName Email MobileNumber createdAt isActive'),

      // Location breakdown
      ClientModel.aggregate([
        {
          $match: { organizationId }
        },
        {
          $unwind: {
            path: "$location",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "newbranches", // Adjust collection name as needed
            localField: "location",
            foreignField: "_id",
            as: "locationInfo"
          }
        },
        {
          $unwind: {
            path: "$locationInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$locationInfo._id",
            locationName: { $first: "$locationInfo.name" },
            totalClients: { $sum: 1 },
            activeClients: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
            },
            inactiveClients: {
              $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
            }
          }
        },
        {
          $sort: { totalClients: -1 }
        },
        {
          $limit: 10
        }
      ]),

      // Monthly statistics for the last 12 months
      ClientModel.aggregate([
        {
          $match: {
            organizationId,
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
              $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            totalClients: { $sum: 1 },
            activeClients: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
            },
            inactiveClients: {
              $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
            }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ])
    ]);

    // Calculate assigned candidates from actual assignments
    const assignedCandidates = assignedCandidatesCount;

    // Format monthly stats with month names
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formattedMonthlyStats = monthlyStats.map(stat => ({
      ...stat,
      monthName: monthNames[stat._id.month - 1],
      period: `${monthNames[stat._id.month - 1]} ${stat._id.year}`
    }));

    // Handle location breakdown with null locations
    const formattedLocationBreakdown = locationBreakdown.map(loc => ({
      ...loc,
      locationName: loc.locationName || "No Location Assigned"
    }));

    // Prepare comprehensive dashboard data
    const dashboardData = {
      // Main summary cards
      summary: {
        totalClients,
        activeClients,
        inactiveClients,
        assignedCandidates
      },
      
      // Recent clients for display
      recentClients: {
        active: recentActiveClients,
        inactive: recentInactiveClients
      },
      
      // Location-wise breakdown
      locationBreakdown: formattedLocationBreakdown,
      
      // Monthly trend data
      monthlyStats: formattedMonthlyStats,
      
      // Additional metrics
      metrics: {
        clientGrowthRate: monthlyStats.length > 1 ? 
          ((monthlyStats[monthlyStats.length - 1]?.totalClients || 0) - 
           (monthlyStats[monthlyStats.length - 2]?.totalClients || 0)) : 0,
        activeClientPercentage: totalClients > 0 ? 
          Math.round((activeClients / totalClients) * 100) : 0,
        inactiveClientPercentage: totalClients > 0 ? 
          Math.round((inactiveClients / totalClients) * 100) : 0
      },
      
      // Applied filters
      appliedFilters: {
        timeFilter: timeFilter || 'all',
        organizationId
      }
    };

    return success(res, "Dashboard data fetched successfully", dashboardData);
    
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return unknownError(res, error);
  }
};


// get api for agency client //

export const getAgencyClient = async (req, res) => {
  try{
        const { organizationId } = req.employee;
    console.log("orgainizationId", organizationId);

    const findClient = await AgencyModel.find({organizationId:organizationId}).select("companyName");
    if(!findClient || findClient.length === 0){
      return success(res, "No clients found for this organization");
    }
    return success(res, "Agency clients fetched successfully", findClient);
    
  }catch(error){
    console.error("Error in getAgencyClient:", error);
    return unknownError(res, error);
  }
}