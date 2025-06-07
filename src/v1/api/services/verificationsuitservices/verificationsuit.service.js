import axios from "axios";
import {
  badRequest,
  success,
  unknownError,
} from "../../../../../src/v1/api/formatters/globalResponse.js";
import { PanverificatioURL  , BankAccountverificationURL ,UanVerificationURL , AadressValidationURL , AadharVerificationURL} from "../../apiUrl/apiUrl.js";
import verifydocs from "../../models/verificationModel/verifydocs.js"


const verificationURLs = {
 panverification: PanverificatioURL,
 bankverification:BankAccountverificationURL,
 uanverification:UanVerificationURL,
 addressvalidation:AadressValidationURL,
 aadharverification:AadharVerificationURL
}

export const verifyDocument = async (req, res) => {
  const { type, ...payload } = req.body; // Move outside try so `type` is always available
  const { candidateId, employeeId } = req.query;
  const clientAuthToken = req.headers.authorization;

  try {
    if (!type) {
      return badRequest(res, "Please provide the verification type (e.g., panverification)");
    }

    const verificationURL = verificationURLs[type.toLowerCase()];
    if (!verificationURL) {
      return badRequest(res, `Unsupported verification type: ${type}`);
    }

    if (!clientAuthToken) {
      return badRequest(res, "Authorization token missing in headers");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: clientAuthToken,
    };

    const response = await axios.post(verificationURL, payload, { headers });

if(response?.data?.status == false){
  return badRequest(res , "Could not connect to verification service / API Limit Reach")
}



    // Parse API response
    const responseData = response?.data?.items || {};
    const nestedKey = {
      panverification: "pan_data",
      bankverification: "bank_data",
      aadharverification: "aadhar_data",
      addressverification: "address_data",
    }[type.toLowerCase()];

    const apiData = nestedKey && responseData[nestedKey] ? responseData[nestedKey] : responseData;

    // Prepare fields to update
    const verificationField = {
      [type.toLowerCase()]: "true",
    };

    const dataFieldName = {
      panverification: "panData",
      bankverification: "bankData",
      aadharverification: "aadharData",
      addressverification: "addressData",
    }[type.toLowerCase()];

    if (!dataFieldName) {
      return badRequest(res, `Unsupported data field for type: ${type}`);
    }

    verificationField[dataFieldName] = apiData;

    const query = candidateId ? { candidateId } : { employeeId };
    if (!query) {
      return badRequest(res, "Please provide either candidateId or employeeId");
    }

    const updatedDoc = await verifydocs.findOneAndUpdate(
      query,
      {
        $set: {
          ...verificationField,
          candidateId: candidateId || null,
          employeeId: employeeId || null,
          type,
        },
      },
      { new: true, upsert: true }
    );

    return success(res, `${type} verified successfully`, updatedDoc);
  } catch (error) {
    console.error(`${type || "unknown"} verification error:`, error?.response?.data || error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        message: `${type || "Unknown"} Verification API error`,
        error: error.response.data,
      });
    }

    return unknownError(res, error);
  }
};



// verify by id
export const verifybyId = async (req, res) => {
  try {
    const { candidateId, employeeId } = req.query;

    // Allow either candidateId or employeeId (at least one required)
    if (!candidateId && !employeeId) {
      return badRequest(res, "Please provide either candidateId or employeeId");
    }

    // Build query depending on what is provided
    const query = candidateId ? { candidateId } : { employeeId };

    const finddocs = await verifydocs.findOne(query);

    if (!finddocs) {
      return badRequest(res, "No verification record found for the provided ID");
    }

    return success(res, "Verification record fetched successfully", finddocs);
  } catch (error) {
    return unknownError(res, error);
  }
};


   
