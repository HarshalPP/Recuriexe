const axios = require('axios');
const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../globalHelper/response.globalHelper");
require('dotenv').config({ path: '../.env' });

const PREFILL_API_URL = "https://apiuat.cibilhawk.com/digital-onboarding/acquire/v1/prefill";

async function prefillCibil(req, res) {
  try {
    const payload = req.body;

    console.log("Payload", payload);

    const headers = {
      "apikey": "l77edbc029b0924d30b32615ff8639b423",
      "member-ref-id": "NB4088",
      "sub-bu-code": "A01",
      "cust-ref-id": "1557313",
      "client-secret": "86e1ba520a6648afbe63db543678c50e",
      "Content-Type": "application/json"
    };


    const response = await axios.post(PREFILL_API_URL,  JSON.stringify(payload), { headers });
    console.log("Response"  ,  response)

    if (response && response) {
      return success(res, "Prefill data fetched successfully", response.data);
    } else {

      return badRequest(res, "No data returned from the API");
    }
  } catch (error) {

    console.error("Error in prefillCibil:", error);


    if (error.response) {

      return unknownError(res, `API error: ${error.response.status} - ${error.response.data?.message || "Unknown error"}`);
    } else if (error.request) {

      return unknownError(res, "No response received from API");
    } else {

      return unknownError(res, `Unexpected error: ${error.message}`);
    }
  }
}

module.exports = {
  prefillCibil,
};
