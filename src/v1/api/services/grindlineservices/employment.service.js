// services/gridlineservices/dlVerification.service.js
import axios from "axios";
import { headers } from "../../config/api.config.js"

const DL_VERIFY_URL = "https://api.gridlines.io/dl-api/fetch";
const PAN_VERIFY_URL = "https://api.gridlines.io/pan-api/fetch-detailed";
const BANK_VERIFY_URL = "https://api.gridlines.io/bank-api/verify"
const GSTIN_DETAILED_URL = "https://api.gridlines.io/gstin-api/fetch-detailed";
const FETCH_UAN_URL = "https://api.gridlines.io/epfo-api/fetch-uan";
const VOTER_DETAILS_URL = "https://api.gridlines.io/voter-api/boson/fetch";
const PASSPORT_VERIFY_URL = "https://api.gridlines.io/passport-api/verify";

// Driving Licence Verification //
export const verifyDLService = async ({ driving_license_number, date_of_birth, consent, source = 1 }) => {
  driving_license_number = driving_license_number.replace(/\s+/g, '');

  const payload = {
    driving_license_number,
    date_of_birth,
    consent: "Y"
  };




  try {
    const response = await axios.post(DL_VERIFY_URL, payload, { headers });

    const {
      code,
      message,
      driving_license_data,
    } = response.data?.data || {};

    return {
      code,
      message,
      driving_license_data,
    };
  } catch (error) {
    console.error("Error in verifyDLService:", error.message);
    if (error.response?.data?.data) {
      throw {
        code: error.response.data.data.code,
        message: error.response.data.data.message || "Driving license verification failed",
      };
    } else {
      throw {
        code: "INTERNAL_ERROR",
        message: "Could not connect to verification service",
      };
    }
  }
};


// Pan Verfication //
export const verifypanServices = async ({ pan_number, consent }) => {
  const payload = {
    pan_number,
    consent: "Y",
  };


  try {
    const response = await axios.post(PAN_VERIFY_URL, payload, { headers });


    const {
      data: {
        code,
        message,
        pan_data,
      },
    } = response.data;

    return {
      code,
      message,
      pan_data,
    };

  } catch (error) {
    console.error("Error in verifypanServices:", error.message);

    if (error.response?.data?.data) {
      throw {
        code: error.response.data.data.code,
        message: error.response.data.data.message || "Pan verification failed",
      };
    } else {
      throw {
        code: "INTERNAL_ERROR",
        message: "Could not connect to verification service",
      };
    }
  }
};

// Bank Verification //
export const verifyBankAccountService = async ({ account_number, ifsc, consent }) => {
  const payload = {
    account_number,
    ifsc,
    consent: "Y",
  };



  try {
    const response = await axios.post(BANK_VERIFY_URL, payload, { headers });
    const { code, message, bank_account_data } = response.data.data;

    return {
      code,
      message,
      bank_account_data,
    };
  } catch (error) {
    console.error("Error in verifyBankAccountService:", error.message);

    if (error.response?.data?.data) {
      throw {
        code: error.response.data.data.code,
        message: error.response.data.data.message || "Bank account verification failed",
      };
    } else {
      throw {
        code: "INTERNAL_ERROR",
        message: "Could not connect to verification service",
      };
    }
  }
};

//company details //
export const fetchCompanyDetails = async ({ name, consent }) => {
  const payload = {
    name,
    consent
  };

  try {
    const response = await axios.post(FetchCompany_UAT, payload, { headers });
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      code: error.response?.data?.code || null,
      message: error.response?.data?.message || error.message || "API Error"
    };
  }
};

// fetch GSTN Details //

export const fetchGstinDetailedService = async ({
  gstin,
  consent,
  include_hsn_data = false,
  include_filing_data = false,
  include_filing_frequency = false,
}) => {
  try {
    const payload = {
      gstin,
      consent
    };


    const response = await axios.post(GSTIN_DETAILED_URL, payload,
      {
        headers
      }
    );

    const { code, message, gstin_data } = response.data.data;

    return {
      success: true,
      code,
      message,
      gstin_data,
    };
  } catch (error) {
    const errData = error.response?.data?.data || {};
    return {
      success: false,
      code: errData.code || "INTERNAL_ERROR",
      message: errData.message || "GSTIN fetch failed",
    };
  }
};

// fetch UAN Number //


export const fetchUanService = async ({ mobile_number, consent }) => {
  const payload = { mobile_number, consent };

  try {
    const response = await axios.post(FETCH_UAN_URL, payload, { headers });

    const {
      code,
      message,
      uan_list = [],
    } = response.data?.data || {};

    return {
      code,
      message,
      uan_list,
    };
  } catch (error) {
    console.error("Error in fetchUanService:", error.message);
    if (error.response?.data?.data) {
      throw {
        code: error.response.data.data.code,
        message: error.response.data.data.message || "Failed to fetch UAN",
      };
    } else {
      throw {
        code: "INTERNAL_ERROR",
        message: "Unable to reach UAN fetch service",
      };
    }
  }
};



// fetch Voter Details //

export const fetchVoterDetailsService = async ({ voter_id, consent }) => {
  try {
    const response = await axios.post(
      VOTER_DETAILS_URL,
      { voter_id, consent },
      { headers }
    );

    const { code, message, voter_data } = response.data.data;

    return {
      success: true,
      code,
      message,
      voter_data,
    };
  } catch (error) {
    const errData = error.response?.data?.data || {};
    return {
      success: false,
      code: errData.code || "INTERNAL_ERROR",
      message: errData.message || "Failed to fetch voter details.",
    };
  }
};


// Fetch Passport Details //

export const passportFetchService = async ({ file_number, date_of_birth, consent }) => {
    try {
      const response = await axios.post(
        "https://api.gridlines.io/passport-api/fetch",
        { file_number, date_of_birth, consent },
        { headers }
      );
  
      const { code, message, passport_data } = response.data.data;
  
      return {
        success: true,
        code,
        message,
        passport_data,
      };
    } catch (error) {
      console.error("Passport Fetch Service Error:", error.message);
  
      const errData = error.response?.data?.data;
      return {
        success: false,
        code: errData?.code || "INTERNAL_ERROR",
        message: errData?.message || "Passport fetch failed",
      };
    }
  };

