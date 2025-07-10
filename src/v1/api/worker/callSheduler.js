import cron from "node-cron";
import CallSchedule from "../models/airPhoneModels/callschedule.model.js";
import axios from "axios";
import InterviewDetail from "../models/InterviewDetailsModel/interviewdetails.model.js";
import JobApplyForm from "../models/jobformModel/jobform.model.js";
import Employee from "../models/airPhoneModels/agent.model.js";
import CallLog from "../models/airPhoneModels/calllog.model.js";


// Airphone API token
const AIRPHONE_TOKEN = "DqazlkMZ6Rk3nHLyyDDHLqLUh9vSav7DadnLmzx5z76FWYYDQRtY1fsoyN4PMC1S";

// Run every minute
// cron.schedule("* * * * *", async () => {
//   export function startCallScheduler() {
//   // console.log("CallSheduler worker started!");
//   cron.schedule("*/10 * * * * *", async () => {
//   console.log("Running scheduled call check...");
//   // Find next pending call whose scheduleAt <= now and not running
//   const nextCall = await CallSchedule.findOneAndUpdate(
//     { status: "pending",
//        scheduleAt: { $lte: new Date() }
//      },
//     { status: "running" }
//   );
//   // console.log("Next call to process:", nextCall);
//   if (nextCall) {
//     try {
//       // Prepare form data
//       const formData = new URLSearchParams();
//       formData.append('vnm', nextCall.vnm);
//       // console.log("Processing call for VNM:", nextCall.vnm);
//       formData.append('agent', nextCall.agent);
//       formData.append('caller', nextCall.caller);
//       formData.append('token', AIRPHONE_TOKEN);

//       // Call Airphone API
//       const apiResponse = await axios.post(
//         'https://airphone.in/api/c2c',
//         formData.toString(),
//         { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
//       );

//       // Mark as done
//       nextCall.status = "done";
//       nextCall.result = apiResponse.data;
//       await nextCall.save();
//       console.log("Scheduled call done:", nextCall._id);
//     } catch (err) {
//       nextCall.status = "failed";
//       nextCall.result = { error: err.message };
//       await nextCall.save();
//       console.error("Scheduled call failed:", nextCall._id, err.message);
//     }
//   }
// });
//   }




// const AIRPHONE_TOKEN = process.env.AIRPHONE_TOKEN;
export function startCallScheduler() {
  cron.schedule("*/10 * * * * *", async () => {
    // console.log("Running interview call scheduler...");

    //  const all = await InterviewDetail.find();
    // console.log("📋 Total Interviews in DB:", all.length);

    // // Individual condition checks
    // const matchType = await InterviewDetail.find({ interviewType: "Call" });
    // console.log("🔎 interviewType = 'Call':", matchType.length);

    // const matchStatus = await InterviewDetail.find({ status: "schedule" });
    // console.log("🔎 status = 'schedule':", matchStatus.length);

    // const matchDate = await InterviewDetail.find({ scheduleAt: { $lte: new Date() } });
    // console.log("🔎 scheduleDate <= now:", matchDate.length);


    const nextInterview = await InterviewDetail.findOneAndUpdate(
      {
        interviewType: "Call",
        status: {$in:["schedule","reSchedule"]},
        scheduleDate: { $lte: new Date() },
      },
      // { status: "running" }
    );

    // console.log("Next interview to process:", nextInterview);
    // console.log("Next interview to process:", nextInterview?._id);
    if (!nextInterview) return;

    try {
      // Fetch caller (candidate) mobile number from jobApplyForm
      const candidate = await JobApplyForm.findById(nextInterview.candidateId);
      // const candidate = await JobApplyForm.findOne({
      //   _id: nextInterview.candidateId,
      //   organizationId: nextInterview.organizationId,
      // });
      // console.log("Candidate found:", candidate);
      const caller = candidate?.mobileNumber || "";
      // console.log("Caller mobile:", caller);

      // Fetch agent and vnm from interviewer (employee)
      // console.log("Fetching interviewer details...",nextInterview.interviewerId);
      const interviewer = await Employee.findOne({ employeeId: nextInterview.interviewerId});
      // console.log("Interviewer found:", interviewer);
      const agent =await interviewer?.mobile || "";
      // console.log("Agent mobile:", agent);

      const vnm =await interviewer?.virtual_number || "";
      // console.log("Virtual number:", vnm);

      if (!caller || !agent || !vnm) {
        throw new Error("Missing caller, agent, or vnm information.");
      }

      const formData = new URLSearchParams();
      formData.append("caller", caller);
      formData.append("agent", agent);
      formData.append("vnm", vnm);
      formData.append("token", AIRPHONE_TOKEN);

      const apiResponse = await axios.post(
        "https://airphone.in/api/c2c",
        formData.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 10000 }
      );

      // Update interview document
      nextInterview.callResult = {
        unique_id: apiResponse.data?.unique_id || "",
        status: apiResponse.data?.status || "success",
      };
      nextInterview.status = "complete";
      await nextInterview.save();

      console.log("Interview call done:", nextInterview._id);
    } catch (err) {
      console.error("Call scheduling failed:", nextInterview._id, err.message);
      nextInterview.callResult = {
        status: "failed",
        unique_id: "",
      };
      nextInterview.status = "failed";
      await nextInterview.save();
    }
  });
}

// ...existing imports...

// export function startCallScheduler() {
//   cron.schedule("*/10 * * * * *", async () => {
//     console.log("Running interview call scheduler...");

//     // 1. Find all agents (interviewerId) jinke status "running" hai
//     const runningInterviews = await InterviewDetail.find({ status: "running" });
//     const busyAgents = runningInterviews.map(i => String(i.interviewerId));

//     // 2. Find next interview for scheduling (not already running for this agent)
//     const nextInterview = await InterviewDetail.findOne(
//       {
//         interviewType: "Call",
//         status: "schedule",
//         scheduleDate: { $lte: new Date() },
//         interviewerId: { $nin: busyAgents }
//       }
//     );

//     console.log("Next interview to process:", nextInterview?._id);
//     if (!nextInterview) return;

//     // 3. Check if last callResult.unique_id exists in CallLog
//     if (nextInterview.callResult?.unique_id) {
//       const logExists = await CallLog.findOne({ unique_id: nextInterview.callResult.unique_id });
//       if (!logExists) {
//         console.log("Previous call for this agent not ended yet, skipping...");
//         return;
//       }
//     }

//     try {
//       // Fetch candidate (caller)
//       const candidate = await JobApplyForm.findOne({
//         _id: nextInterview.candidateId,
//         organizationId: nextInterview.organizationId,
//       });
//       const caller = candidate?.mobileNumber || "";
//       console.log("Caller mobile:", caller);

//       // Fetch agent and vnm from interviewer (employee)
//       const interviewer = await Employee.findOne({ employeeId: nextInterview.interviewerId });
//       console.log("Interviewer found:", interviewer);
//       const agent = interviewer?.mobile || "";
//       const vnm = interviewer?.virtual_number || "";
//       console.log("Agent mobile:", agent);
//       console.log("Virtual number:", vnm);

//       if (!caller || !agent || !vnm) {
//         throw new Error("Missing caller, agent, or vnm information.");
//       }

//       // Mark this interview as running
//       nextInterview.status = "running";
//       await nextInterview.save();

//       // Prepare form data
//       const formData = new URLSearchParams();
//       formData.append("caller", caller);
//       formData.append("agent", agent);
//       formData.append("vnm", vnm);
//       formData.append("token", AIRPHONE_TOKEN);

//       // Call Airphone API
//       const apiResponse = await axios.post(
//         "https://airphone.in/api/c2c",
//         formData.toString(),
//         { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 10000 }
//       );

//       // Update interview document after call
//       nextInterview.callResult = {
//         unique_id: apiResponse.data?.unique_id || "",
//         status: apiResponse.data?.status || "success",
//       };
//       nextInterview.status = "complete";
//       await nextInterview.save();

//       console.log("Interview call done:", nextInterview._id);
//     } catch (err) {
//       console.error("Call scheduling failed:", nextInterview._id, err.message);
//       nextInterview.callResult = {
//         status: "failed",
//         unique_id: "",
//       };
//       nextInterview.status = "failed";
//       await nextInterview.save();
//     }
//   });
// }
