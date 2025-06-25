import axios from 'axios';
import FormData from "form-data";
// import AIRPHONE_API_CONFIG from '../config/airson.config.js'; // 
import { AIRPHONE_API_CONFIG } from '../../config/airson.config.js';
import Agent from '../../models/airPhoneModels/agent.model.js'; // 
import C2CCall from '../../models/airPhoneModels/c2cCall.model.js'; // 
import CallLog from "../../models/airPhoneModels/calllog.model.js";
import CallConnect from '../../models/airPhoneModels/callconnect.model.js'; //


import { badRequest,unknownError,success } from '../../formatters/globalResponse.js';
const AIRPHONE_AUTH_TOKEN ="DqazlkMZ6Rk3nHLyyDDHLqLUh9vSav7DadnLmzx5z76FWYYDQRtY1fsoyN4PMC1S";


const getAuthHeaders = (authToken) => ({
    'Content-Type': AIRPHONE_API_CONFIG.contentType,
    'Authorization': `Bearer ${authToken}`
});

const handleApiError = (res, error, message) => {
    console.error(message, error.message);
    if (error.response) {
        res.status(error.response.status).json(error.response.data);
    } else {
        res.status(500).json({ message: 'Internal Server Error or API unavailable', error: error.message });
    }
};

export const recordCallLog = async (req, res) => {
    try {
        const authToken = process.env.AIRPHONE_AUTH_TOKEN;
        if (!authToken) {
            return res.status(401).json({ message: 'Authentication token is missing. Please set AIRPHONE_AUTH_TOKEN in .env' });
        }

        const callLogData = req.body;

        const response = await axios.post(
            `${AIRPHONE_API_CONFIG.clientUrl}/api`,
            new URLSearchParams(callLogData).toString(),
            {
                headers: getAuthHeaders(authToken),
                timeout: AIRPHONE_API_CONFIG.timeout
            }
        );
        res.status(response.status).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'Error recording call log:');
    }
};

// export const beforeCallConnect = async (req, res) => {
//     try {
//         const beforeConnectData = req.body;

//         const response = await axios.post(
//             `${AIRPHONE_API_CONFIG.clientUrl}/api`,
//             new URLSearchParams(beforeConnectData).toString(),
//             {
//                 headers: { 'Content-Type': AIRPHONE_API_CONFIG.contentType },
//                 timeout: AIRPHONE_API_CONFIG.timeout
//             }
//         );
//         res.status(response.status).json(response.data);
//     } catch (error) {
//         handleApiError(res, error, 'Error processing before call connect event:');
//     }
// };

// export const afterCallConnect = async (req, res) => {
//     try {
//         const afterConnectData = req.body;

//         const response = await axios.post(
//             `${AIRPHONE_API_CONFIG.clientUrl}/api`,
//             new URLSearchParams(afterConnectData).toString(),
//             {
//                 headers: { 'Content-Type': AIRPHONE_API_CONFIG.contentType },
//                 timeout: AIRPHONE_API_CONFIG.timeout
//             }
//         );
//         res.status(response.status).json(response.data);
//     } catch (error) {
//         handleApiError(res, error, 'Error processing after call connect event:');
//     }
// };

// export const initiateC2C = async (req, res) => {
//     try {
//         const c2cData = req.body;
//         const agentMobile = c2cData.agent;

//         const agent = await Agent.findOne({ mobile: agentMobile });
//         if (!agent) {
//             return res.status(404).json({ message: `Agent with mobile number ${agentMobile} not found in database. Please add the agent first.` });
//         }

//         const apiResponse = await axios.post(
//             `${AIRPHONE_API_CONFIG.baseUrl}/c2c`,
//             new URLSearchParams(c2cData).toString(),
//             {
//                 headers: { 'Content-Type': AIRPHONE_API_CONFIG.contentType },
//                 timeout: AIRPHONE_API_CONFIG.timeout
//             }
//         );

//         const newC2CCall = new C2CCall({
//             vnm: c2cData.vnm,
//             agent: agent._id,
//             caller: c2cData.caller,
//             reqId: c2cData.reqId,
//             callToken: c2cData.token
//         });
//         const savedC2CCall = await newC2CCall.save();
//         console.log("C2C Call data saved to MongoDB with ID:", savedC2CCall._id);

//         res.status(apiResponse.status).json({
//             airphoneApiResponse: apiResponse.data,
//             mongoDocId: savedC2CCall._id,
//             message: 'C2C call initiated and data saved successfully.'
//         });
//     } catch (error) {
//         handleApiError(res, error, 'Error initiating C2C call and saving to MongoDB:');
//     }
// };
export const beforeCallConnect = async (req, res) => {
  try {
    const { mobile_number, virtual_number, call_id } = req.body;

    if (!mobile_number || !virtual_number || !call_id) {
      return badRequest(res, 'mobile_number, virtual_number, and call_id are required.');
    }

    const saved = await CallConnect.create({
      type: 'before',
      mobile_number,
      virtual_number,
      call_id
    });

    return success(res, 'Before call connect data saved successfully.', {
      id: saved._id,
      call_id:saved.call_id,
      mobile_number:saved.mobile_number,
      virtual_number: saved.virtual_number
    });
  } catch (error) {
    console.error('Error in beforeCallConnect:', error.message);
    return unknownError(res, error);
  }
};

export const afterCallConnect = async (req, res) => {
  try {
    const { caller, receiver, call_id } = req.body;

    if (!caller || !receiver || !call_id) {
      return badRequest(res, 'caller, receiver, and call_id are required.');
    }

    const saved = await CallConnect.create({
      type: 'after',
      caller,
      receiver,
      call_id
    });

    return success(res, 'After call connect data saved successfully.', {
      id: saved._id,
      call_id
    });
  } catch (error) {
    console.error('Error in afterCallConnect:', error.message);
    return unknownError(res, error);
  }
};


export const initiateC2C22 = async (req, res) => {
    try {
        const { vnm, agent, caller } = req.body;

        // Validate required fields
        if (!vnm || !agent || !caller) {
            return badRequest(res, "vnm, agent, and caller are required.");
        }

        const token = 'DqazlkMZ6Rk3nHLyyDDHLqLUh9vSav7DadnLmzx5z76FWYYDQRtY1fsoyN4PMC1S'; 

        // Prepare form data
        const formData = new URLSearchParams();
        formData.append('vnm', vnm);
        formData.append('agent', agent);
        formData.append('caller', caller);
        formData.append('token', token);

        // Make API request
        const apiResponse = await axios.post(
            'https://airphone.in/api/c2c',
            formData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000 // Optional timeout
            }
        );

        return success(res, "Call dialed successfully.", {
            airphoneResponse: apiResponse.data
        });

    } catch (error) {
        console.error('Error calling Airphone API:', error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                status: 'error',
                message: error.response.data?.message || 'Airphone API error',
                details: error.response.data
            });
        }

        return unknownError(res, error);
    }
};

// ...existing code...
// export const initiateC2C = async (req, res) => {
//     try {
//         const { vnm, agent, caller, reqId } = req.body;
//         console.log("vnm", vnm);

//         if (!vnm || !agent || !caller) {
//             return badRequest(res, "vnm, agent, and caller are required.");
//         }

//         const token = 'DqazlkMZ6Rk3nHLyyDDHLqLUh9vSav7DadnLmzx5z76FWYYDQRtY1fsoyN4PMC1S';

//         const formData = new URLSearchParams();
//         formData.append('vnm', vnm);
//         formData.append('agent', agent);
//         formData.append('caller', caller);
//         formData.append('token', token);

//         // Airphone API call
//         const apiResponse = await axios.post(
//             'https://airphone.in/api/c2c',
//             formData.toString(),
//             {
//                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//                 timeout: 10000
//             }
//         );
//         console.log('Airphone API Response:', apiResponse.data);

//         // Get unique_id from Airphone API response
//         const uniqueId = apiResponse.data.unique_id || apiResponse.data.uniqueId;

        

//         // Find agent in DB
//         // const agentDoc = await Agent.findOne({ mobile: agent });
//         // if (!agentDoc) {
//         //     return badRequest(res, "Agent not found in database.");
//         // }

//         // Save C2C call in DB
//         const newC2CCall = new C2CCall({
//             vnm,
//             agent,
//             caller,
            
//             callToken: token,
//             uniqueId // Make sure your model has this field
//         });
//         const savedC2CCall = await newC2CCall.save();

//         return success(res, "Call dialed successfully.", {
//             // airphoneResponse: apiResponse.data,
//             unique_id: apiResponse.data.unique_id,
//             status: apiResponse.data.status ,
//             message: apiResponse.data.message ,
//             _id: savedC2CCall._id,
//             // uniqueId: uniqueId
//         });

//     } catch (error) {
//         console.error('Error calling Airphone API:', error.message);

//         if (error.response) {
//             return badRequest(res, error.response.data?.message || 'Airphone API error', error.response.data);
//         }

//         return unknownError(res, error);
//     }
// };

export const initiateC2C = async (req, res) => {
  try {
    const { vnm, agent, caller } = req.body;
    console.log("vnm", vnm);

    if (!vnm || !agent || !caller) {
      return badRequest(res, "vnm, agent, and caller are required.");
    }

    const token = 'DqazlkMZ6Rk3nHLyyDDHLqLUh9vSav7DadnLmzx5z76FWYYDQRtY1fsoyN4PMC1S';

    const formData = new URLSearchParams();
    formData.append('vnm', vnm);
    formData.append('agent', agent);
    formData.append('caller', caller);
    formData.append('token', token);

    // Airphone API call
    const apiResponse = await axios.post(
      'https://airphone.in/api/c2c',
      formData.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      }
    );

    console.log('Airphone API Response:', apiResponse.data);

    const { unique_id, status, message } = apiResponse.data;

    // 👉 Only save in DB if response is success and unique_id is present
    if (status === 'success' && unique_id) {
      const newC2CCall = new C2CCall({
        vnm,
        agent,
        caller,
        callToken: token,
        uniqueId: unique_id,
      });

      const savedC2CCall = await newC2CCall.save();

      return success(res, "Call dialed successfully.", {
        unique_id,
        status,
        message,
        _id: savedC2CCall._id,
      });
    }

    // Else just return the response without saving
    return success(res, "Call dial attempted but not successful.", {
      unique_id: unique_id || null,
      status: status || 'failed',
      message: message || 'No message',
    });

  } catch (error) {
    console.error('Error calling Airphone API:', error.message);

    if (error.response) {
      return badRequest(res, error.response.data?.message || 'Airphone API error', error.response.data);
    }

    return unknownError(res, error);
  }
};

export const addAgent = async (req, res) => {
    try {
        const { name, mobile, status, virtual_number, product } = req.body;
    const organizationId = req.employee.organizationId;

        if (!organizationId) {
            return badRequest(res, 'Missing organizationId in headers');
        }

        const auth_token = AIRPHONE_AUTH_TOKEN;
        if (!auth_token) {
            return badRequest(res, 'Airphone auth token not configured in environment variables.');
        }

        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('mobile', mobile);
        formData.append('status', status);
        formData.append('virtual_number', virtual_number);
        formData.append('auth_token', auth_token);

        const apiResponse = await axios.post(
            `https://airphone.in/api/add-c2c-agent`,
            formData.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: AIRPHONE_API_CONFIG.timeout
            }
        );

        const apiData = apiResponse.data;

        if (apiData.status !== "1") {
            return badRequest(res, `Airphone API Error: ${apiData.message}`);
        }

        const newAgent = new Agent({
            name,
            product,
            mobile,
            status,
            virtual_number,
            organizationId
        });

        const savedAgent = await newAgent.save();

        return success(res, "Agent added and data saved successfully.", {
            airphoneApiResponse: apiData,
            _id: savedAgent._id
        });
    } catch (error) {
        console.error('Error adding agent and saving to MongoDB:', error.message);
        return unknownError(res, error);
    }
};

export const updateAgentStatus = async (req, res) => {
    try {
        const updateAgentData = req.body;
        const { mobile, status } = updateAgentData;

        const apiResponse = await axios.post(
            `${AIRPHONE_API_CONFIG.baseUrl}/update-c2c-agent`,
            new URLSearchParams(updateAgentData).toString(),
            {
                headers: { 'Content-Type': AIRPHONE_API_CONFIG.contentType },
                timeout: AIRPHONE_API_CONFIG.timeout
            }
        );

        const updatedAgent = await Agent.findOneAndUpdate(
            { mobile: mobile },
            { status: status, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedAgent) {
            console.warn("Agent not found in MongoDB for mobile:", mobile);
            return res.status(404).json({
                airphoneApiResponse: apiResponse.data,
                message: 'Agent not found in database for update.'
            });
        }
        console.log("Agent status updated in MongoDB for ID:", updatedAgent._id);

        res.status(apiResponse.status).json({
            airphoneApiResponse: apiResponse.data,
            mongoDocId: updatedAgent._id,
            message: 'Agent status updated successfully.'
        });
    } catch (error) {
        handleApiError(res, error, 'Error updating agent status and MongoDB:');
    }
};

export const getAgentStatus = async (req, res) => {
  try {
    const { mobile, virtual_number, auth_token } = req.body;

    if (!mobile || !virtual_number || !auth_token) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const formData = new FormData();
    formData.append("mobile", mobile);
    formData.append("virtual_number", virtual_number);
    formData.append("auth_token", auth_token);

    const response = await axios.post("https://airphone.in/api/get-agent-status", formData, {
      headers: formData.getHeaders()
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in getAgentStatus:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const initiateDirectCall = async (req, res) => {
    try {
        const { vn_number, agent, caller } = req.body;

        if (!vn_number || !agent || !caller) {
            return badRequest(res, "vn_number, agent, and caller are required.");
        }

        const token = 'DqazlkMZ6Rk3nHLyyDDHLqLUh9vSav7DadnLmzx5z76FWYYDQRtY1fsoyN4PMC1S';

        console.log('Dial Call Data:', { token, agent, caller, vn_number });
        // Create form-data
        const formData = new FormData();
        formData.append('token', token);
        formData.append('agent', agent);
        formData.append('caller', caller);
        formData.append('vn_number', vn_number);

        // Airphone API call with multipart/form-data
        const apiResponse = await axios.post(
            'https://airphone.in/api/dial-call',
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 10000
            }
        );
        console.log('Airphone API Response:', apiResponse.data);

        return success(res, "Call dialed successfully.", {
            unique_id: apiResponse.data?.unique_id,
            status: apiResponse.data?.status,
            message: apiResponse.data?.message,
        });

    } catch (error) {
       // Yeh block update karein:
        if (error.response) {
            console.error('Airphone API Error Response:', error.response.data);
            return badRequest(res, error.response.data?.message || 'Airphone API error', error.response.data);
        }
        console.error('Error calling Airphone API:', error.message);
        return unknownError(res, error.message);
    }
};

export const getAgentNumber = async (req, res) => {
    try {
        const { Caller, unique_id, previouscaller, vnm } = req.query;

        const params = new URLSearchParams({
            Caller,
            unique_id,
            vnm
        });
        if (previouscaller) {
            params.append('previouscaller', previouscaller);
        }

        const response = await axios.get(
            `${AIRPHONE_API_CONFIG.clientUrl}/api?${params.toString()}`,
            {
                timeout: AIRPHONE_API_CONFIG.timeout
            }
        );
        res.status(response.status).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'Error getting agent number:');
    }
};

export const getSingleExtensionStatus = async (req, res) => {
    try {
        const { extension } = req.params;
        const authToken = process.env.AIRPHONE_AUTH_TOKEN;
        if (!authToken) {
            return res.status(401).json({ message: 'Authentication token is missing.' });
        }

        const response = await axios.post(
            `${AIRPHONE_API_CONFIG.baseUrl}/getExtensionStatus/${extension}`,
            null,
            {
                headers: getAuthHeaders(authToken),
                timeout: AIRPHONE_API_CONFIG.timeout
            }
        );
        res.status(response.status).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'Error getting single extension status:');
    }
};

export const getMultipleExtensionStatus = async (req, res) => {
    try {
        const { extensions } = req.params;
        const authToken = process.env.AIRPHONE_AUTH_TOKEN;
        if (!authToken) {
            return res.status(401).json({ message: 'Authentication token is missing.' });
        }

        const response = await axios.post(
            `${AIRPHONE_API_CONFIG.baseUrl}/getExtensionStatus/${extensions}`,
            null,
            {
                headers: getAuthHeaders(authToken),
                timeout: AIRPHONE_API_CONFIG.timeout
            }
        );
        res.status(response.status).json(response.data);
    } catch (error) {
        handleApiError(res, error, 'Error getting multiple extension statuses:');
    }
};

// export const getAllSavedAgents = async (req, res) => {
//     try {
//         const agents = await Agent.find().select('-auth_token');
//         res.status(200).json({ agents });
//     } catch (error) {
//         handleApiError(res, error, 'Error getting all saved agents from MongoDB:');
//     }
// };

export const getAllSavedAgents = async (req, res) => {
    try {
    const organizationId = req.employee.organizationId;

        if (!organizationId) {
            return badRequest(res, 'Missing organizationId in headers');
        }

        const agents = await Agent.find({ organizationId }).select('-auth_token');

        return success(res, "Agents fetched successfully", { agents });
    } catch (error) {
        console.error('Error getting all saved agents from MongoDB:', error.message);
        return unknownError(res, error);
    }
};

export const getAllSavedC2CCalls = async (req, res) => {
    try {
        const c2cCalls = await C2CCall.find().populate({
            path: 'agent',
            select: 'name mobile status virtual_number -_id'
        }).select('-callToken');

        res.status(200).json({ c2cCalls });
    } catch (error) {
        handleApiError(res, error, 'Error getting all saved C2C calls from MongoDB:');
    }
};


export const receiveCallLog = async (req, res) => {
  try {
    const {
      unique_id = "",
      caller_id = "",
      received_id = "",
      ivr_number = "",
      recording_url = "",
      Rec_duration = "",
      call_type = "",
      call_status = "",
      datetime = "",
      duration = ""
    } = req.body;

    const callLog = new CallLog({
      unique_id,
      caller_id,
      received_id,
      ivr_number,
      recording_url,
      Rec_duration,
      call_type,
      call_status,
      datetime,
      duration
    });

    await callLog.save();

    return success(res, "Call log saved successfully", callLog);
  } catch (error) {
    console.error("Error in call log webhook:", error.message);
    return unknownError(res, "Internal server error", error.message);
  }
};

