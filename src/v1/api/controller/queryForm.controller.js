const {
  success,
  unknownError,
  serverValidation,
  notFound,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const queryFormModel = require("../model/queryForm.model");
const customerModel = require("../model/customer.model")
const employeeModel = require("../model/adminMaster/employe.model")
const applicantModel = require('../model/applicant.model')
const { sendEmailByVendor } = require("./functions.Controller.js")


// ------------------Admin Master Add query Form ---------------------------------------
async function addQueryForm(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Extract `employeeId` from token
    const tokenId = new ObjectId(req.Id);
    const querySendBy = tokenId;
    const { customerId,type,formType, queries } = req.body;

    // Validate required fields
    if (!customerId || customerId.trim() === "") {
      return badRequest(res, "customerId is required and cannot be empty");
    }
    if (!Array.isArray(queries) || queries.length === 0) {
      return badRequest(res, "queries must be an array and cannot be empty");
    }

    // Prepare data for savin
    const queryFormData = queries.map((query) => {
      const { queryDetail , status, docUpload, remark, ...otherData } = query;

      return {
        querySendBy,
        customerId,
        queryDetail,
        ...otherData,
      };
    });

    const customerDetails = await customerModel.findById(customerId);
    if (!customerDetails) {
      return badRequest(res, "Customer not found");
    }

    const { employeId, customerFinId } = customerDetails;

    const employeeDetails = await employeeModel.findById(employeId);
    if (!employeeDetails) {
      return badRequest(res, "Employee not found");
    }


    const toEmails = [employeeDetails.workEmail];
    const ccEmails = [];

    if (req.headers.host.includes("prod.fincooper.in")) {
      ccEmails.push("finexe@fincoopers.com");
    } else {
      ccEmails.push("");
    }

    const applicantDetails = await applicantModel.findOne({ customerId });
    if (!applicantDetails) {
      return badRequest(res, "Applicant details not found");
    }
    const fullName = applicantDetails.fullName?.toUpperCase() || "";

    // Prepare Email Content
    const subject = `Urgent: Resolution Required on File Pendancies // ${customerFinId} // ${fullName}`;

    const pdfContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="border-top: 1px solid #cccccc; padding-top: 10px; margin-top: 10px;">
          <p>Dear Team,</p>
          <p>Please find attached the list of pendencies related to your files. We kindly request you to review and resolve these as soon as possible to ensure smooth operations.</p>
          
          <ol>
            ${queries.map((query, index) => `
              <li>${query.queryDetail || "No Detail Provided"}</li>
            `).join('')}
          </ol>
    
          <p>If you need any assistance or further clarification, feel free to reach out.</p>
      
          <p>Best regards,</p>
          <p>Team Fin Coopers</p>
        </div>
      </div>
    `;

    await sendEmailByVendor("finalApproverQuery", toEmails, ccEmails, subject, pdfContent);

    // Save all entries in the database
    const queryFormDetails = await queryFormModel.insertMany(queryFormData);
    return success(res, "Query Form(s) Added Successfully", queryFormDetails);

  } catch (error) {
    console.error(error);
    unknownError(res, error.message || error);
  }
}

// ------------------Admin Master query Form "active" or "inactive" updated------------------
async function queryFormStatus(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
    } else {
      const queryFormId = req.body.queryFormId;
      const status = req.body.status
      if (!queryFormId || queryFormId.trim() === "") {
        return badRequest(res, "queryFormId is required and cannot be empty");
      }
      const queryForm = await queryFormModel.findById({ _id: new ObjectId(req.body.queryFormId) })
      if (!queryForm) {
        return notFound(res, "Not Found queryFormId")
      }

      if (status == "pending") {
        const queryForm = await queryFormModel.findByIdAndUpdate({ _id: new ObjectId(queryFormId) }, { status: "pending" }, { new: true })
        success(res, "query Form Pending", queryForm);
      }
      else if (status == "resolve") {
        const queryForm = await queryFormModel.findByIdAndUpdate({ _id: new ObjectId(queryFormId) }, { status: "resolve" }, { new: true })
        success(res, "query Form Resolve", queryForm);
      }
      else if (status == "done") {
        const queryForm = await queryFormModel.findByIdAndUpdate({ _id: new ObjectId(queryFormId) }, { status: "done" }, { new: true })
        success(res, "query Form Done", queryForm);
      }
      else {
        return badRequest(res, "Status must be pending , resolve ,done ");
      }

    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Update query Form Title -----------------------------------
async function updateQueryForm(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const queryDoneBy = tokenId;
    const { queries, customerId } = req.body;

    if (!Array.isArray(queries) || queries.length === 0) {
      return badRequest(res, "queries must be an array and cannot be empty");
    }

    const updatedQueries = [];

    // Validate and update each query in the array
    for (const query of queries) {
      // Validate required fields
      if (!query.queryFormId || query.queryFormId.trim() === "") {
        return badRequest(res, "queryFormId is required for each query and cannot be empty");
      }
      if (!query.queryDetail || query.queryDetail.trim() === "") {
        return badRequest(res, "queryDetail is required for each query");
      }
      // if (!query.type) {
      //   return badRequest(res, "type is required for each query");
      // }
      // if (query.type === "document" && (!query.docUpload || query.docUpload.trim() === "")) {
      //   if (!query.docUpload || query.docUpload.trim() === "") {
      //   return badRequest(res, "docUpload is required when type is 'document'");
      // }
      // if (!query.remark || query.remark.trim() === "") {
      //   return badRequest(res, "remark is required when type is 'response'");
      // }

      // Update the document with the new values
      const updatedQuery = await queryFormModel.findByIdAndUpdate(
        query.queryFormId,
        {
          $set: {
            queryDoneBy,
            queryDetail: query.queryDetail,
             formType: query.formType,
            status: query.status,
            docUpload: query.docUpload || "", // Only update if provided
            remark: query.remark || "", // Only update if provided
          },
        },
        { new: true }
      );

      if (updatedQuery) {
        updatedQueries.push(updatedQuery);
      } else {
        return badRequest(res, `Query Form with ID ${query.queryFormId} not found`);
      }
    }



    if (!customerId) {
      return badRequest(res, "Customer Id Required");
    }
    const customerDetails = await customerModel.findById(customerId);
    if (!customerDetails) {
      return badRequest(res, "Customer not found");
    }

    const { customerFinId } = customerDetails;

    const toEmails = [];
    const ccEmails = [];

    if (req.headers.host.includes("prod.fincooper.in")) {
      ccEmails.push("finexe@fincoopers.com");
      // toEmails.push("")
    } else {
      ccEmails.push("")
      toEmails.push("");
    }

    const applicantDetails = await applicantModel.findOne({ customerId });
    if (!applicantDetails) {
      return badRequest(res, "Applicant details not found");
    }
    const fullName = applicantDetails.fullName?.toUpperCase() || "";


    const tableRows = updatedQueries.map(
      (query) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${query.queryDetail}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${query.status}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${query.remark}</td>
        </tr>`
    )
      .join("");

    const pdfContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear Team,</p>
        <p>We are pleased to inform you that all the queries raised by the head office have been successfully resolved. The details are as follows:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Pendancy Details</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Status</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <p>We have ensured that all issues are addressed, and necessary measures have been implemented to prevent any future occurrences.</p>
        <p>Please let us know if there is anything further we can do or if additional information is required.</p>
        <p>Best regards,<br>Team Fin Coopers</p>
      </div>
    `;


    await sendEmailByVendor(
      "finalApproverQuery",
      toEmails,
      ccEmails,
      `Confirmation of Pendancies Resolution // ${customerFinId} // ${fullName}`,
      pdfContent
    );

    // Return success response with all updated queries
    success(res, "Query Form(s) Updated Successfully", updatedQueries);
  } catch (error) {
    console.error(error);
    unknownError(res, error.message);
  }
}


// ------------------Admin Master DELETE query Form-----------------------------------
async function deleteQueryForm(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { queryId } = req.body;

    if (!ObjectId.isValid(queryId)) {
      return badRequest(res, "Invalid query ID");
    }

    // Delete the document
    const deletedQuery = await queryFormModel.findByIdAndDelete(queryId);

    if (!deletedQuery) {
      return notFound(res, "Query Form not found");
    }
    // Return success response with all updated queries
    success(res, "Query Form Deleted Successfully", deletedQuery);
  } catch (error) {
    console.error(error);
    unknownError(res, error.message);
  }
}


// ------------------Admin Master Get All query Form List queryFormId------------------------------------
async function getQueryFormByCustomerId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const customerId = req.query.customerId;
    const detail = await queryFormModel.find({ customerId: new ObjectId(customerId) }).sort({ createdAt: -1 });

    success(res, "All query Form List", detail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};



module.exports = {
  addQueryForm,
  getQueryFormByCustomerId,
  updateQueryForm,
  deleteQueryForm,
  queryFormStatus
};

