import { returnFormatter } from "../../formatters/common.formatter.js";
import { userExpenseFormatter } from "../../formatters/expense/userExpense.formatter.js";
import userExpenseModel from "../../models/expense/userExpense.model.js";
import expenseRoleAssignmentModel from "../../models/expense/expenseRole.model.js";

//----------------------------   add Role ------------------------------

export async function addUserExpenses(requestsObject) {
  try {
    const { id, organizationId } = requestsObject.employee;

    if (!organizationId) {
      return returnFormatter(false, "organizationId is required");
    }
    // console.log(id, organizationId, "id,organizationIdid,organizationId");

    const roleData = await expenseRoleAssignmentModel.findOne({
      organizationId,
    });

    if (
      !roleData ||
      !roleData.roleSubmitter ||
      !roleData.roleSubmitter.employeeId
    ) {
      return returnFormatter(false, "Submitter role data not found");
    }

    const submitterId = roleData.roleSubmitter.employeeId.toString();
    console.log("Submitter ID:", submitterId);
    console.log("Current ID:", id.toString());
    console.log("ID match?", id.toString() === submitterId);

    if (id.toString() != submitterId) {
      return returnFormatter(false, "only submitter can add expense");
    }

    const formattedData = userExpenseFormatter(requestsObject);
    const newTripData = await userExpenseModel.create(formattedData);
    return returnFormatter(
      true,
      "user Expense created succesfully",
      newTripData
    );
  } catch (error) {
    console.log(error, "error<<>><<>>");
    return returnFormatter(false, error.message);
  }
}

// // --------------------- update Field -----------------------

export async function updateUserExpenseById(userExpenseId, requestsObject) {
  try {
    const { id, organizationId } = requestsObject.employee;

    if (!organizationId) {
      return returnFormatter(false, "organizationId is required");
    }
    // console.log(id, organizationId, "id,organizationIdid,organizationId");

    const roleData = await expenseRoleAssignmentModel.findOne({
      organizationId,
    });

    if (
      !roleData ||
      !roleData.roleSubmitter ||
      !roleData.roleSubmitter.employeeId
    ) {
      return returnFormatter(false, "Submitter role data not found");
    }

    const submitterId = roleData.roleSubmitter.employeeId.toString();
    console.log("Submitter ID:", submitterId);
    console.log("Current ID:", id.toString());
    console.log("ID match?", id.toString() === submitterId);

    if (id.toString() != submitterId) {
      return returnFormatter(false, "only submitter can add expense");
    }
    const formattedData = userExpenseFormatter(requestsObject);
    // console.log(formattedData, "formattedDataformattedData");
    const updatedfieldData = await userExpenseModel.findOneAndUpdate(
      { _id: userExpenseId },
      formattedData,
      { new: true }
    );
    return returnFormatter(
      true,
      "user Expense updated succesfully",
      updatedfieldData
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// // // --------------------- get Field -----------------------

export async function getUserExpenseById(userExpenseId) {
  try {
    const tripData = await userExpenseModel
      .findById(userExpenseId)
      .populate("expenseId");
    return returnFormatter(true, "user Expense data", tripData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// // // --------------------- get all Field -----------------------

export async function getAllUserExpenses(req) {
  try {
    const { id, organizationId } = req.employee;
    if (!organizationId) {
      return returnFormatter(false, "organizationId is required");
    }
    const FieldData = await userExpenseModel
      .find({ organizationId })
      .sort({ createdAt: -1 })
      .populate("expenseId");
    return returnFormatter(true, "user Expense all data", FieldData);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
