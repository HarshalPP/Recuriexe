import cron from "node-cron";
import CallSchedule from "../models/airPhoneModels/callschedule.model.js";
import axios from "axios";

// Airphone API token
const AIRPHONE_TOKEN = "DqazlkMZ6Rk3nHLyyDDHLqLUh9vSav7DadnLmzx5z76FWYYDQRtY1fsoyN4PMC1S";

// Run every minute
// cron.schedule("* * * * *", async () => {
  export function startCallScheduler() {
  // console.log("CallSheduler worker started!");
  cron.schedule("*/10 * * * * *", async () => {
  // console.log("Running scheduled call check...");
  // Find next pending call whose scheduleAt <= now and not running
  const nextCall = await CallSchedule.findOneAndUpdate(
    { status: "pending",
       scheduleAt: { $lte: new Date() }
     },
    { status: "running" }
  );
  // console.log("Next call to process:", nextCall);
  if (nextCall) {
    try {
      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('vnm', nextCall.vnm);
      // console.log("Processing call for VNM:", nextCall.vnm);
      formData.append('agent', nextCall.agent);
      formData.append('caller', nextCall.caller);
      formData.append('token', AIRPHONE_TOKEN);

      // Call Airphone API
      const apiResponse = await axios.post(
        'https://airphone.in/api/c2c',
        formData.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
      );

      // Mark as done
      nextCall.status = "done";
      nextCall.result = apiResponse.data;
      await nextCall.save();
      console.log("Scheduled call done:", nextCall._id);
    } catch (err) {
      nextCall.status = "failed";
      nextCall.result = { error: err.message };
      await nextCall.save();
      console.error("Scheduled call failed:", nextCall._id, err.message);
    }
  }
});
  }