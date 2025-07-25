import reportCaseModel from "../../models/reportinitModel/reportInitt.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js";
import mongoose from "mongoose";
import moment from "moment-timezone";


//---------------------------------  add case ----------------------------

export async function addCase(requestsObject) {
    try {

        const valueData = {
            ...requestsObject.body,
            organizationId: requestsObject.employee.organizationId,
            doneBy: requestsObject.employee.id,
        };
        // Save to DB
        const newValue = await reportCaseModel.create(valueData);

        return returnFormatter(true, "Value created successfully", newValue);

    } catch (error) {
        console.error("Error in addValue:", error);
        return returnFormatter(false, error.message);
    }
}



//--------------------------------------- update case ----------------------------------

export async function updateCase(requestsObject) {
    try {
        let data = await reportCaseModel.findById(requestsObject.body.id)
        if(!data){
          return returnFormatter(false,"No data found")
        }
        // Save to DB
        const newValue = await reportCaseModel.findByIdAndUpdate(requestsObject.body.id,{...requestsObject.body});

        return returnFormatter(true, "Value updated successfully", newValue);

    } catch (error) {
        console.error("Error in addValue:", error);
        return returnFormatter(false, error.message);
    }
}


//--------------------------------------- get case by id ----------------------------------

export async function getCaseById(requestsObject) {
    try {

        // Save to DB
        const newValue = await reportCaseModel.findById(requestsObject.params.id).populate([
        { path: "reportTypeId", model: "reportType" },
        { path: "doneBy", model: "employee" },
        { path: "formValues.fieldId", model: "inputField" }
      ]);;

        return returnFormatter(true, "Value fetched successfully", newValue);

    } catch (error) {
        console.error("Error in addValue:", error);
        return returnFormatter(false, error.message);
    }
}


//--------------------------------------- get all case ----------------------------------

export async function getAllCases(requestsObject) {
  try {
    const { query } = requestsObject;
    const organizationId = requestsObject.employee.organizationId;

    const filter = {
      organizationId:new mongoose.Types.ObjectId(organizationId),
    };

    // Filter by reportTypeId
    if (query.reportTypeId) {
      filter.reportTypeId = new mongoose.Types.ObjectId(query.reportTypeId);
    }

    // Filter by workStatus
    if (query.workStatus) {
      filter.workStatus = query.workStatus;
    }

    // Date filters
    const today = moment().startOf("day");
    const endOfToday = moment().endOf("day");

    if (query.dateFilter === "today") {
      filter.createdAt = {
        $gte: today.toDate(),
        $lte: endOfToday.toDate(),
      };
    } else if (query.dateFilter === "thisWeek") {
      filter.createdAt = {
        $gte: moment().startOf("week").toDate(),
        $lte: moment().endOf("week").toDate(),
      };
    } else if (query.dateFilter === "thisMonth") {
      filter.createdAt = {
        $gte: moment().startOf("month").toDate(),
        $lte: moment().endOf("month").toDate(),
      };
    } else if (query.startDate && query.endDate) {
      filter.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    const result = await reportCaseModel
      .find(filter)
      .populate([
        { path: "reportTypeId", model: "reportType" },
        { path: "doneBy", model: "employee" },
        { path: "formValues.fieldId", model: "inputField" },
      ])
      .sort({ createdAt: -1 });

    return returnFormatter(true, "Cases fetched successfully", result);
  } catch (error) {
    console.error("Error in getAllCases:", error);
    return returnFormatter(false, error.message);
  }
}


//----------------------------------- get counts --------------------------------------



export async function getCasesCount(requestsObject) {
  try {
    const organizationId =new mongoose.Types.ObjectId(requestsObject.employee.organizationId);

    const [wipCases, completedCases] = await Promise.all([
      reportCaseModel
        .find({ organizationId, workStatus: "wip" })
        .populate([
          { path: "reportTypeId", model: "reportType" },
          { path: "doneBy", model: "employee" },
          { path: "formValues.fieldId", model: "inputField" },
        ])
        .sort({ createdAt: -1 }),

      reportCaseModel
        .find({ organizationId, workStatus: "completed" })
        .populate([
          { path: "reportTypeId", model: "reportTypes" },
          { path: "doneBy", model: "employees" },
          { path: "formValues.fieldId", model: "inputFields" },
        ])
        .sort({ createdAt: -1 }),
    ]);

    const responseData = {
      wipCount: wipCases?.length,
      completedCount: completedCases?.length,
      totalCount: wipCases?.length + completedCases?.length,
 
    };

    return returnFormatter(true, "Cases count fetched successfully", responseData);
  } catch (error) {
    console.error("Error in getCasesCount:", error);
    return returnFormatter(false, error.message);
  }
}
