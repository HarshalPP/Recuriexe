import axios from 'axios';
import FormData from "form-data";
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
// import AIRPHONE_API_CONFIG from '../config/airson.config.js'; // 
import { AIRPHONE_API_CONFIG } from '../../config/airson.config.js';
import Agent from '../../models/airPhoneModels/agent.model.js'; // 
import C2CCall from '../../models/airPhoneModels/c2cCall.model.js'; // 
import CallLog from "../../models/airPhoneModels/calllog.model.js";
import CallConnect from '../../models/airPhoneModels/callconnect.model.js'; //
import Employee from '../../models/employeemodel/employee.model.js'; //
import CallSchedule from "../../models/airPhoneModels/callschedule.model.js";


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
     const organizationId = req.employee.organizationId;

        if (!organizationId) {
            return badRequest(res, 'Missing organizationId in token');
        }

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
      const newC2CCall = new CallSchedule({
        organizationId,
        vnm,
        agent,
        caller,
        result:apiResponse.data,
        status: 'done', // Set initial status
        // uniqueId: unique_id,
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
        const { name, mobile, status, virtual_number, product,employeeId } = req.body;
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
            organizationId,
            employeeId
        });

        const savedAgent = await newAgent.save();

        return success(res, "Agent added and data saved successfully.", {
            // airphoneApiResponse: apiData,
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

        return success(res, "Agents fetched successfully",  agents );
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

export const getAgentsByToken = async (req, res) => {
    try {
        // const { organizationId, employeeId } = req.user;
        const organizationId = req.employee.organizationId;
        const {employeeId} = req.params;

        // if (!organizationId || !employeeId) {
        //     return res.status(400).json({ message: "organizationId or employeeId missing in token" });
        // }
        if (!organizationId) {
            return badRequest(res, 'Missing organizationId in token');
        }
        if (!employeeId) {
            return badRequest(res, 'Missing employeeId in token');
        }

        const agents = await Agent.find({
            organizationId,
            employeeId
        });

        // return res.status(200).json({
        //     success: true,
        //     count: agents.length,
        //     data: agents
        // });
        return success(res, "Agents fetched successfully", agents);
    } catch (err) {
        console.error("Error in getAgentsByToken:", err);
        return unknownError(res, err);
    }
};


export const getAgentCallLogs = async (req, res) => {
  try {
    console.log("Fetching call logs for organizationId:", req.employee.organizationId);
        const organizationId = req.employee.organizationId;

    const agents = await Agent.find({ organizationId })
                              .select('mobile');
                              console.log("Agents found:", agents);

    if (!agents.length)
      return success(res, 'No agents found for this organization', { callLogs: [] });

    const mobiles = agents.map(a => a.mobile);

    // 3️ Call logs where received_id == agent mobile
    const callLogs = await CallLog.find({ received_id: { $in: mobiles } });
    console.log("Call logs found:", callLogs);

    // 4️ Agent detail attach — optional
    const logsWithAgent = callLogs.map(log => {
      const agent = agents.find(a => a.mobile === log.received_id);
      return {
        ...log.toObject(),
        agentId: agent?._id,
        agentName: agent?.name,
        agentStatus: agent?.status,
      };
    });

    return success(res, 'Call logs fetched successfully', { callLogs: logsWithAgent });
  } catch (err) {
    console.error(err);
    return unknownError(res, 'Something went wrong while fetching call logs');
  }
};


export const getAgentByMobileParam = async (req, res) => {
    try {
        const organizationId = req.employee.organizationId;
        const { mobile } = req.params;

        if (!organizationId || !mobile) {
            return badRequest(res, 'organizationId or mobile is missing');
        }

        const agent = await Agent.findOne({
            organizationId,
            mobile: mobile.trim()
        });

        if (!agent) {
            return badRequest(res, 'Agent not found');
        }

        return success(res, 'Agent found', agent);
    } catch (err) {
        console.error("Error in getAgentByMobileParam:", err);
        return unknownError(res, err);
    }
};

export const getAgentByTokenEmployeeId = async (req, res) => {
    try {
        const organizationId = req.employee.organizationId;
        console.log("Organization ID from token:", organizationId);
        const employeeId = new ObjectId(req.employee.id);
        console.log("Employee ID from token:", employeeId);

        if (!organizationId || !employeeId) {
            return badRequest(res, 'Missing organizationId or employeeId in token');
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return badRequest(res, 'Invalid employeeId');
        }

        // 1. Get mobile number from employee
        const employee = await Employee.findOne({ _id: employeeId });
        if (!employee || !employee.mobileNo) {
            return badRequest(res, 'Mobile number not found for this employee');
        }

        console.log("Employee mobile number:", employee.mobileNo);
        // 2. Search agent with same mobile & organizationId
        const agent = await Agent.findOne({
            organizationId,
            mobile: employee.mobileNo
        });

        if (!agent) {
            return badRequest(res, 'Agent not found');
        }

        return success(res, 'Agent found', agent);
    } catch (err) {
        console.error("Error in getAgentByTokenEmployeeId:", err);
        return unknownError(res, err);
    }
};

// export const scheduleC2CCalls = async (req, res) => {
//   try {
//     const { agent, callers, vnm, scheduleAt } = req.body; // callers: array of numbers
//     if (!agent || !Array.isArray(callers) || !callers.length || !vnm || !scheduleAt) {
//       return badRequest(res, "agent, callers[], vnm, scheduleAt required");
//     }
//     const schedules = await CallSchedule.insertMany(
//       callers.map(caller => ({
//         agent,
//         caller,
//         vnm,
//         scheduleAt: new Date(scheduleAt),
//       }))
//     );
//     return success(res, "Calls scheduled", schedules);
//   } catch (err) {
//     return unknownError(res, err);
//   }
// };


export const scheduleC2CCalls = async (req, res) => {
  try {
    const { agent, callers, vnm, scheduleAt, gapInMinutes = 2 } = req.body;
    const organizationId = req.employee.organizationId;

        if (!organizationId) {
            return badRequest(res, 'Missing organizationId in token');
        }

    if (!agent || !Array.isArray(callers) || !callers.length || !vnm || !scheduleAt) {
      return badRequest(res, "agent, callers[], vnm, scheduleAt required");
    }

    const baseTime = new Date(scheduleAt);
    if (isNaN(baseTime.getTime())) {
  return badRequest(res, "Invalid scheduleAt date");
}
    const schedules = await CallSchedule.insertMany(
      callers.map((caller, index) => ({
        agent,
        caller,
        vnm,
        scheduleAt: new Date(baseTime.getTime() + index * gapInMinutes * 60000),
        organizationId,
        gapInMinutes,
        status:'pending'  // ✅ store in model
      }))
    );

    return success(res, "Calls scheduled with individual gap", schedules);
  } catch (err) {
    return unknownError(res, err);
  }
};


export const getCallDashboardStats11 = async (req, res) => {
  try {
    const organizationId =req.employee.organizationId;
    if (!organizationId) return badRequest(res, "organizationId is required in headers.");

    // Step 1: Get all scheduled calls
    const scheduledCalls = await CallSchedule.find({ organizationId });

    const uniqueIds = scheduledCalls
      .map(s => s.result?.unique_id)
      .filter(Boolean);

    if (uniqueIds.length === 0) {
      return success(res, "No call logs found", {
        totalCalls: 0,
        agentAnswered: 0,
        callerNoAnswer: 0,
        failed: 0,
        agentNoAnswer: 0,
        callerAnswered: 0,
        callMissed: 0,
        logs: [],
      });
    }

    // Step 2: Fetch all call logs
    const callLogs = await CallLog.find({ unique_id: { $in: uniqueIds } });

    // Step 3: Prepare dashboard stats
    const stats = {
      totalCalls: callLogs.length,
      agentAnswered: 0,
      callerNoAnswer: 0,
      failed: 0,
      agentNoAnswer: 0,
      callerAnswered: 0,
      callMissed: 0,
    };

    for (const log of callLogs) {
      const status = log.call_status?.toLowerCase();
      const type = log.call_type?.toLowerCase();

      if (status === "answered") {
        if (type === "incoming") {
          stats.callerAnswered += 1;
        } else if (type === "outgoing") {
          stats.agentAnswered += 1;
        }
      } else if (status === "caller_no_answer") {
        stats.callerNoAnswer += 1;
      } else if (status === "agent_no_answer") {
        stats.agentNoAnswer += 1;
      } else if (status === "call missed") {
        stats.callMissed += 1;
      } else {
        stats.failed += 1;
      }
    }

    return success(res, "Dashboard stats fetched", {
      ...stats,
      logs: callLogs
    });

  } catch (err) {
    console.error("Error in getCallDashboardStats:", err);
    return unknownError(res, err.message);
  }
};


export const getCallDashboardStats = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    if (!organizationId) return badRequest(res, "organizationId is required in headers.");

    // ✅ Extract filters
    const {
      search = "",
      startDate,
      endDate,
      agent,
      status,
      minDuration,
      maxDuration
    } = req.query;

    // Step 1: Get CallSchedules for the org
    const schedules = await CallSchedule.find({ organizationId });
    const uniqueIds = schedules.map(s => s.result?.unique_id).filter(Boolean);

    // Step 2: Build filter conditions
    const filter = {
      unique_id: { $in: uniqueIds }
    };

    if (status) {
  filter.call_status = new RegExp("^" + status + "$", "i");  // case-insensitive
}

if (agent) {
  filter.received_id = agent; // OR use correct field from your DB
}


    if (search) {
      filter.$or = [
        { caller_id: { $regex: search, $options: "i" } },
        { received_id: { $regex: search, $options: "i" } },
        { ivr_number: { $regex: search, $options: "i" } },
        { call_type: { $regex: search, $options: "i" } },
        { call_status: { $regex: search, $options: "i" } },
        { unique_id: { $regex: search, $options: "i" } },
        {call_status: { $regex: search, $options: "i" } }

      ]; 
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        // $lte: new Date(endDate)
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    if (minDuration || maxDuration) {
      filter.duration = {};
      if (minDuration) filter.duration.$gte = minDuration;
      if (maxDuration) filter.duration.$lte = maxDuration;
    }

    // Step 3: Fetch filtered logs
    const callLogs = await CallLog.find(filter);

    // Step 4: Process statistics same as before
    const stats = {
      totalCalls: callLogs.length,
      agentAnswered: 0,
      callerNoAnswer: 0,
      failed: 0,
      agentNoAnswer: 0,
      callerAnswered: 0,
      callMissed: 0,
    };

    for (const log of callLogs) {
      const status = log.call_status?.toLowerCase();
      const type = log.call_type?.toLowerCase();

      if (status === "answered") {
        if (type === "incoming") {
          stats.callerAnswered += 1;
        } else if (type === "outgoing") {
          stats.agentAnswered += 1;
        }
      } else if (status === "caller_no_answer") {
        stats.callerNoAnswer += 1;
      } else if (status === "agent_no_answer") {
        stats.agentNoAnswer += 1;
      } else if (status === "call missed") {
        stats.callMissed += 1;
      } else {
        stats.failed += 1;
      }
    }

    return success(res, "Dashboard data with filters", {
      ...stats,
      logs: callLogs
    });

  } catch (err) {
    console.error("Error in getCallDashboardStats:", err);
    return unknownError(res, err.message);
  }
};

export const getPendingScheduledCalls = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    if (!organizationId) return badRequest(res, "Missing organizationId in token");

    const records = await CallSchedule.find({
      organizationId,
      status: "pending"
    }).sort({ scheduleAt: 1 });

    return success(res, "Pending scheduled calls", records);
  } catch (err) {
    return unknownError(res, err);
  }
};


export const deleteOneCallSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.employee.organizationId;

    if (!organizationId) return badRequest(res, "Missing organizationId in token");

    const result = await CallSchedule.deleteOne({
      _id: id,
      organizationId
    });

    return success(res, "Record deleted", result);
  } catch (err) {
    return unknownError(res, err);
  }
};

export const updateOnePendingCallSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleAt, caller } = req.body;
    const organizationId = req.employee.organizationId;

    if (!organizationId) return badRequest(res, "Missing organizationId in token");
    if (!scheduleAt || !caller) return badRequest(res, "scheduleAt and caller required");

    const date = new Date(scheduleAt);
    if (isNaN(date.getTime())) return badRequest(res, "Invalid scheduleAt date");

    const result = await CallSchedule.updateOne(
      {
        _id: id,
        organizationId,
        status: "pending"
      },
      {
        $set: { scheduleAt: date, caller }
      }
    );

    return success(res, "Record updated", result);
  } catch (err) {
    return unknownError(res, err);
  }
};

export const deleteManyCallSchedules = async (req, res) => {
  try {
    const { ids } = req.body; // Array of _id
    const organizationId = req.employee.organizationId;

    if (!organizationId) return badRequest(res, "Missing organizationId in token");
    if (!Array.isArray(ids) || !ids.length) return badRequest(res, "ids[] required");

    const result = await CallSchedule.deleteMany({
      _id: { $in: ids },
      organizationId
    });

    return success(res, "Deleted records", result);
  } catch (err) {
    return unknownError(res, err);
  }
};


export const updateManyPendingCallSchedules = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { _id, scheduleAt, caller }
    const organizationId = req.employee.organizationId;

    if (!organizationId) return badRequest(res, "Missing organizationId in token");
    if (!Array.isArray(updates) || !updates.length) return badRequest(res, "Updates array required");

    const bulkOps = [];

    for (const { _id, scheduleAt, caller } of updates) {
      if (!_id || !scheduleAt || !caller) continue;

      const date = new Date(scheduleAt);
      if (isNaN(date.getTime())) continue;

      bulkOps.push({
        updateOne: {
          filter: {
            _id,
            organizationId,
            status: "pending",
          },
          update: {
            $set: { scheduleAt: date, caller }
          }
        }
      });
    }

    if (!bulkOps.length) return badRequest(res, "No valid update operations");

    const result = await CallSchedule.bulkWrite(bulkOps);
    return success(res, "Bulk update completed", result);
  } catch (err) {
    return unknownError(res, err);
  }
};
