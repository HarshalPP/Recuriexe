const pdExpenceModel = require("../../model/forms/pdExpence.model");
const { returnFormatter } = require("../../formatter/common.formatter");
const employeModel = require("../../model/adminMaster/employe.model");
const { getFormConfigByName } = require("../formConfig.helper")
const CsvParser = require("json2csv").Parser;
const { default: mongoose } = require("mongoose");

// create the pdExpence
async function addPdExpence(bodyData , userId){
    try{
        bodyData.createdBy = userId;
        bodyData.updatedBy = userId;
        const formConfig = await getFormConfigByName('pdExpence');
        bodyData.l1Approver = formConfig.data.defaultL1
        bodyData.l2Approver = formConfig.data.defaultL2
        bodyData.l3Approver = formConfig.data.defaultL3
        const saveData = new pdExpenceModel(bodyData);
        await saveData.save();
        return returnFormatter(true, "Data saved successfully" , saveData);
    }catch(err){
        return returnFormatter(false, err.message);
    }
}


// get pdExpence by pdExpenceId

async function getPdExpenceById(pdExpenceId){
    try{

        const pdExpenceData = await pdExpenceModel.findOne({pdExpenceId})
        if(!pdExpenceData){
            return returnFormatter(false, "No data found");
        }
        return returnFormatter(true, "Data found", pdExpenceData);

    }catch(err){
        return returnFormatter(false, err.message);
    }
}


// Update an pdExpence //

async function updatePdExpence(pdExpenceId, updateData, userId){
    try{
        updateData.updatedBy = userId;
        const pdExpenceData = await pdExpenceModel.findOneAndUpdate(
            {pdExpenceId},
            updateData,
            {new: true}
        )

    if(!pdExpenceData){
        return returnFormatter(false, "pdExpence not found");
    }
    return returnFormatter(true, "pdExpence updated", pdExpenceData);

    }catch(err){
        return returnFormatter(false, err.message);
    }
}


// set isActive to false instead of deleteiung an pdExpence //

async function deactivePdExpence(pdExpenceId){
    try{
        const pdExpenceData = await pdExpenceModel.findOneAndUpdate(
            {pdExpenceId},
            {isActive: false},
            {new: true}
        )
        if(!pdExpenceData){
            return returnFormatter(false, "pdExpence not found");
        }
        return returnFormatter(true, "pdExpence deactivated", pdExpenceData);
    }catch(err){
        return returnFormatter(false, err.message);
    }
}


// GET ALL ACTIVE pdExpence //

async function getAllActivePdExpence(){
    try{
        const pdExpenceData = await pdExpenceModel.find({isActive: true})
        .sort({createdAt: -1});
        if(pdExpenceData.length === 0){
            return returnFormatter(false, "No pdExpence found");
        }
        return returnFormatter(true, "Active pdExpence found", pdExpenceData);
    }catch(err){
        return returnFormatter(false, err.message);
    }
}


// get all active pdExpence of creator //

async function getAllActivePdExpencesOfCreator(userId) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const pdExpences = await pdExpenceModel.aggregate([
        {
          $match: {
            isActive: true,
            $or: [
              { createdBy: userObjectId },
              { l1Approver: userObjectId },
              { l2Approver: userObjectId },
              { l3Approver: userObjectId },
              { viewer: userObjectId },
            ],
          },
        },
        {
          $addFields: {
            l1Permitted: { $eq: ["$l1Approver", userObjectId] },
            l2Permitted: { $eq: ["$l2Approver", userObjectId] },
            l3Permitted: { $eq: ["$l3Approver", userObjectId] },
          },
        },
        // Lookups
        {
          $lookup: {
            from: "employees",
            localField: "l1Approver",
            foreignField: "_id",
            as: "l1ApproverDetails",
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "l2Approver",
            foreignField: "_id",
            as: "l2ApproverDetails",
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "l3Approver",
            foreignField: "_id",
            as: "l3ApproverDetails",
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdByDetails",
          },
        },
        // Unwinds
        {
          $unwind: {
            path: "$l1ApproverDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$l2ApproverDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$l3ApproverDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$createdByDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

         {
            $sort: { createdAt: -1 },

          },

        // Project with $ifNull to ensure fields are set to null if missing
        {
          $project: {
            pdExpenceId: 1,
            entries: 1,
            approvalRequired: 1,
            l1Approver: 1,
            l1Status: 1,
            l1Remark: 1,
            l2Approver: 1,
            l2Status: 1,
            l2Remark: 1,
            l3Approver: 1,
            l3Status: 1,
            l3Remark: 1,
            viewer: 1,
            isActive: 1,
            createdBy: 1,
            updatedBy: 1,
            createdAt: 1,
            updatedAt: 1,
            l1Permitted: 1,
            l2Permitted: 1,
            l3Permitted: 1,
            l1ApproverName: {
              $ifNull: ["$l1ApproverDetails.employeName", null],
            },
            l2ApproverName: {
              $ifNull: ["$l2ApproverDetails.employeName", null],
            },
            l3ApproverName: {
              $ifNull: ["$l3ApproverDetails.employeName", null],
            },
            createdByName: {
              $ifNull: ["$createdByDetails.employeName", null],
            },
          },
        },
      ]);
  
      const formConfig = await getFormConfigByName("pdExpence");
      const config = {
        canManage: formConfig.data.managementEmployee == userId ? true : false,
        canAdd: formConfig.data.viewer.includes(userId) ? true : false,
      };
  
      if (pdExpences.length === 0) {
        return returnFormatter(false, "No active pdExpences found");
      }
      return returnFormatter(true, "Active pdExpences found", { pdExpences, config });
    } catch (error) {
      return returnFormatter(false, error.message);
    }
  }

// pd expence helper functions //

async function getPdExpenceStats() {
  try {
 
      // Retrieve all pdExpence entries with lookup for employee details (creator)
      const pdExpences = await pdExpenceModel.aggregate([
          {
              $lookup: {
                  from: 'employees', // Collection name should be 'employees'
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'creatorDetails',
              },
          },
          { $unwind: '$creatorDetails' },
      ]);

      if (pdExpences.length === 0) {
          return returnFormatter(false, 'No pdExpences found');
      }

      // Overall stats calculations
      const overAllStats = pdExpences.reduce(
          (acc, pdExpence) => {
              // Check each status and increment counters based on approval status
              const isApproved =
                  pdExpence.l1Status === 'approved' ||
                  pdExpence.l2Status === 'approved' ||
                  pdExpence.l3Status === 'approved';
              const isPending =
                  pdExpence.l1Status === 'pending' ||
                  pdExpence.l2Status === 'pending' ||
                  pdExpence.l3Status === 'pending';

              acc.totalPdExpences += 1;
              if (isApproved) {
                  acc.pdExpencesApproved += 1;
                  acc.amountApproved += pdExpence.entries.reduce((sum, entry) => sum + entry.kmtravel, 0); // Add kmtravel or any other value you want
              }
              if (isPending) {
                  acc.pdExpencesPending += 1;
                  acc.amountPending += pdExpence.entries.reduce((sum, entry) => sum + entry.kmtravel, 0); // Add kmtravel or any other value you want
              }
              return acc;
          },
          {
              totalPdExpences: 0,
              pdExpencesApproved: 0,
              pdExpencesPending: 0,
              amountApproved: 0,
              amountPending: 0,
          }
      );

      // Branch-wise case count with amount approved and amount pending
      const branchWiseCases = await pdExpenceModel.aggregate([
          {
              $lookup: {
                  from: 'employees',
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'creatorDetails',
              },
          },
          { $unwind: '$creatorDetails' },
          {
              $group: {
                  _id: '$creatorDetails.branchId',
                  totalPdExpences: { $sum: 1 },
                  pdExpencesApproved: {
                      $sum: {
                          $cond: [
                              {
                                  $or: [
                                      { $eq: ['$l1Status', 'approved'] },
                                      { $eq: ['$l2Status', 'approved'] },
                                      { $eq: ['$l3Status', 'approved'] },
                                  ],
                              },
                              1,
                              0,
                          ],
                      },
                  },
                  pdExpencesPending: {
                      $sum: {
                          $cond: [
                              {
                                  $or: [
                                      { $eq: ['$l1Status', 'pending'] },
                                      { $eq: ['$l2Status', 'pending'] },
                                      { $eq: ['$l3Status', 'pending'] },
                                  ],
                              },
                              1,
                              0,
                          ],
                      },
                  },
                  amountApproved: {
                      $sum: {
                          $cond: [
                              {
                                  $or: [
                                      { $eq: ['$l1Status', 'approved'] },
                                      { $eq: ['$l2Status', 'approved'] },
                                      { $eq: ['$l3Status', 'approved'] },
                                  ],
                              },
                              { $sum: '$entries.kmtravel' }, // Adjust based on the value to sum
                              0,
                          ],
                      },
                  },
                  amountPending: {
                      $sum: {
                          $cond: [
                              {
                                  $or: [
                                      { $eq: ['$l1Status', 'pending'] },
                                      { $eq: ['$l2Status', 'pending'] },
                                      { $eq: ['$l3Status', 'pending'] },
                                  ],
                              },
                              { $sum: '$entries.kmtravel' }, // Adjust based on the value to sum
                              0,
                          ],
                      },
                  },
              },
          },
          {
              $lookup: {
                  from: 'newbranches', // Branch collection name
                  localField: '_id',
                  foreignField: '_id',
                  as: 'branch',
              },
          },
          { $unwind: '$branch' },
          {
              $project: {
                  _id: 0,
                  branchId: '$branch._id',
                  branchName: '$branch.name',
                  totalPdExpences: 1,
                  pdExpencesApproved: 1,
                  pdExpencesPending: 1,
                  amountApproved: 1,
                  amountPending: 1,
              },
          },
      ]);

      // Department-wise case count with amount approved and amount pending
      const departmentWiseCases = await pdExpenceModel.aggregate([
          {
              $lookup: {
                  from: 'employees',
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'creatorDetails',
              },
          },
          { $unwind: '$creatorDetails' },
          {
              $group: {
                  _id: '$creatorDetails.departmentId',
                  totalPdExpences: { $sum: 1 },
                  pdExpencesApproved: {
                      $sum: {
                          $cond: [
                              {
                                  $or: [
                                      { $eq: ['$l1Status', 'approved'] },
                                      { $eq: ['$l2Status', 'approved'] },
                                      { $eq: ['$l3Status', 'approved'] },
                                  ],
                              },
                              1,
                              0,
                          ],
                      },
                  },
                  pdExpencesPending: {
                      $sum: {
                          $cond: [
                              {
                                  $or: [
                                      { $eq: ['$l1Status', 'pending'] },
                                      { $eq: ['$l2Status', 'pending'] },
                                      { $eq: ['$l3Status', 'pending'] },
                                  ],
                              },
                              1,
                              0,
                          ],
                      },
                  },
                  amountApproved: {
                      $sum: {
                          $cond: [
                              {
                                  $or: [
                                      { $eq: ['$l1Status', 'approved'] },
                                      { $eq: ['$l2Status', 'approved'] },
                                      { $eq: ['$l3Status', 'approved'] },
                                  ],
                              },
                              { $sum: '$entries.kmtravel' }, // Adjust based on the value to sum
                              0,
                          ],
                      },
                  },
                  amountPending: {
                      $sum: {
                          $cond: [
                              {
                                  $or: [
                                      { $eq: ['$l1Status', 'pending'] },
                                      { $eq: ['$l2Status', 'pending'] },
                                      { $eq: ['$l3Status', 'pending'] },
                                  ],
                              },
                              { $sum: '$entries.kmtravel' }, // Adjust based on the value to sum
                              0,
                          ],
                      },
                  },
              },
          },
          {
              $lookup: {
                  from: 'newdepartments', // Department collection name
                  localField: '_id',
                  foreignField: '_id',
                  as: 'department',
              },
          },
          { $unwind: '$department' },
          {
              $project: {
                  _id: 0,
                  departmentId: '$department._id',
                  departmentName: '$department.name',
                  totalPdExpences: 1,
                  pdExpencesApproved: 1,
                  pdExpencesPending: 1,
                  amountApproved: 1,
                  amountPending: 1,
              },
          },
      ]);

      // Return formatted result
      return returnFormatter(true, 'pdExpences stats calculated', {
          overAll: [overAllStats],
          branchWiseCases,
          departmentWiseCases,
      });
  } catch (error) {
      return returnFormatter(false, error.message);
  }
}


// make a pdExpence entry // 







module.exports = {
    addPdExpence,
    getPdExpenceById,
    updatePdExpence,
    deactivePdExpence,
    getAllActivePdExpence,
    getAllActivePdExpencesOfCreator,
    getPdExpenceStats
}
  