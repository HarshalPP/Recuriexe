import reportCategoryModel from "../../models/ReportModel/reportCategory.model.js";
import { success, unknownError, badRequest } from "../../formatters/globalResponse.js";
import { generateReportTemplate } from "../../controllers/pdfTemplateController/report-template-generator.js"
import { generatePdfFromHtml } from "../../controllers/pdfTemplateController/enhanced-pdf-generator.js"
// Define here Employee Verification apis //

import { verifyDLService, verifypanServices, verifyBankAccountService , fetchGstinDetailedService , fetchUanService , fetchVoterDetailsService} from "../../services/grindlineservices/employment.service.js";
import jobApply from "../../models/jobformModel/jobform.model.js";



// Define payloads for each category
const categoryPayloadMap = {
  verifypanServices: {
    pan_number: "",
    consent: "Y"
  },

  fetchGstinByPanService:{
   gstin: "",
    consent: "Y"
  },

  fetchPanLitePlusService: {
    pan_number: "",
    consent: "Y"
  },
  verifyBankAccountService: {
    account_number: "",
    ifsc: "",
    consent: "Y"
  },
  drivingLicense: {
    driving_license_number: "MH1234567890123",
    date_of_birth: "1990-01-01",
    consent: "Y"
  },

  fetchCompanyDetails: {
    name: "",
    consent: "Y"
  },

  fetchElectricityBillService: {
    electricity_provider: "",
    consumer_number: "",
    mobile_number: "",
    consent: "Y"
  },

  fetchUanService: {
    mobile_number: "",
    consent: "Y"
  },

  fetchVoterDetailsService: {
    voter_id: "",
    consent: "Y"
  },

  fetchGstinDetailedService:{
    gstin: "",
    consent: "Y"
  },

  fetchUanService:{
    mobile_number: "",
    consent: "Y"
  },

  fetchVoterDetailsService:{
    voter_id: "",
    consent: "Y"
  }
};






// Add or Create a Report //
export const UpdateCategoryReport = async (req, res) => {
  try {

    const { reportName, categories } = req.body;
    const organizationId = req.employee.organizationId;
    if (!reportName || !categories) {
      return badRequest(res, "Please Provide the ReportName and categories")
    }

    const Updatedata = await reportCategoryModel.findOneAndUpdate({
      reportName, organizationId
    },

      {
        $set: {
          categories,
          isActive: true
        }
      }, {
      upsert: true, new: true
    }
    )

    return success(res, "Report category saved", Updatedata);

  } catch (error) {

    return unknownError(res, "Internal Server Error")

  }
}



export const createReport = async ({ reportName, categories, organizationId }) => {
  if (!reportName || !categories) {
    throw new Error("Please provide the reportName and categories");
  }

  const updatedData = await reportCategoryModel.findOneAndUpdate(
    { reportName, organizationId },
    {
      $set: {
        categories,
        isActive: true
      }
    },
    {
      upsert: true,
      new: true
    }
  );

  return updatedData;
};

// delete Report //
export const deleteCategoryReport = async (req, res) => {
  try {
    const ID = req.params.id
    if (!reportName) {
      return badRequest(res, "Please provide the reportName to delete.");
    }

    const deleted = await reportCategoryModel.findByIdAndDelete(ID)

    if (!deleted) {
      return badRequest(res, "Report category not found.");
    }

    return success(res, "Report category deleted successfully", deleted);
  } catch (error) {
    console.error("Delete error:", error);
    return unknownError(res, "Internal server error");
  }
};


// Get Api //

export const GetCategoryReport = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    const findReport = await reportCategoryModel.find({ organizationId });

    if (findReport.length == 0) {
      return success(res, "No reports found", []);
    }
    const enrichedReports = findReport.map((report) => {
      const categoryWithPayload = report.categories.map((category) => ({
        type: category,
        payload: categoryPayloadMap[category] || {}
      }));

      return {
        ...report.toObject(),
        categoryWithPayload
      };
    });

    return success(res, "Reports fetched successfully", enrichedReports);

  } catch (error) {
    console.error("Error fetching reports:", error);
    return unknownError(res, "Internal Server Error");
  }
};


// Get Report by Id //

export const GetCategoryReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return badRequest(res, "reportId is required");
    }

    const report = await reportCategoryModel.findOne({ _id: reportId });

    if (!report) {
      return success(res, "Report not found", null);
    }

    const categoryWithPayload = report.categories.map((category) => ({
      type: category,
      payload: categoryPayloadMap[category] || {}
    }));

    return success(res, "Report fetched successfully", {
      ...report.toObject(),
      categoryWithPayload
    });

  } catch (error) {
    console.error("Error fetching report by ID:", error);
    return unknownError(res, "Internal Server Error");
  }
};




export const generateReportByType = async (req, res) => {
  try {
    const { payload, candidateId } = req.body


    const findCandidate = await jobApply.findById(candidateId).populate({
      path: 'ReportId',
      select: 'reportName '
    })


    if (!findCandidate) {
      return badRequest(res, "Candidate not found")
    }


  const organizationId = findCandidate.orgainizationId

    const reportName = findCandidate.ReportId?.reportName
    const report = await reportCategoryModel.findOne({
      reportName,
      organizationId,
      isActive: true,
    })

    if (!report || !Array.isArray(report.categories) || report.categories.length === 0) {
      return badRequest(res, "No valid categories found for the given report")
    }

    const tasks = report.categories.map(async (category) => {
      try {
        switch (category) {

          // bank verification //
          case "verifyBankAccountService":
            const bankResult = await verifyBankAccountService({
              account_number: payload.account_number,
              ifsc: payload.ifsc,
              consent: "Y",
            })
            return { category, success: true, data: bankResult }

          case "drivingLicense":
            const dlResult = await verifyDLService({
              driving_license_number: payload.driving_license_number,
              date_of_birth: payload.date_of_birth,
              consent: "Y",
            })
            return { category, success: true, data: dlResult }

          case "verifypanServices":
            const PanResult = await verifypanServices({
              pan_number: payload.pan_number,
              consent: "Y",
            })
            return { category, success: true, data: PanResult }


            case "fetchGstinDetailedService":
            const gstinResult = await fetchGstinDetailedService({
              gstin: payload.gstin,
              consent: "Y",
            })


            case "fetchUanService":
            const uanResult = await fetchUanService({
              mobile_number: payload.mobile_number,
              consent: "Y",
            })

            case "fetchVoterDetailsService":
            const voterResult = await fetchVoterDetailsService({
              voter_id: payload.voter_id,
              consent: "Y",
            })

          default:
            return { category, success: false, error: "Unsupported category" }
        }
      } catch (err) {
        return {
          category,
          success: false,
          error: err.message || "Error processing category",
        }
      }
    })

    const results = await Promise.allSettled(tasks)
    const formatted = {}

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const item = result.value
        formatted[item.category] = item.success ? item.data : { error: item.error }
      } else {
        formatted[result.reason.category || "unknown"] = {
          error: result.reason.message || "Failed",
        }
      }
    })

    // Generate PDF Report
    try {

      const htmlContent = generateReportTemplate(formatted, reportName, findCandidate )
      const pdfResult = await generatePdfFromHtml(htmlContent, req)

      const findandUpdatecandidate = await jobApply.findByIdAndUpdate(
        candidateId,
        {
          $set: {
            Reporturl: pdfResult.report,
            ReportRequest: "submitted",
          }
        },
        { new: true }
      )



      // Return both the verification data and PDF URL
      return success(res, "Report generated successfully", {
        verificationData: formatted,
        reportUrl: pdfResult.report,
        reportName: reportName,
        generatedAt: new Date().toISOString(),
      })
    } catch (pdfError) {
      console.error("PDF Generation Error:", pdfError)
      // Still return the verification data even if PDF generation fails
      return success(res, "Report generated (PDF generation failed)", {
        verificationData: formatted,
        pdfError: "Failed to generate PDF report",
      })
    }
  } catch (error) {
    console.error("generateReportByType Error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
