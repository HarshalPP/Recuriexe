import cron from 'node-cron';
import Subscription from '../models/subscribeModel/Subscription.model.js';
import SuperAdminModel from '../models/AuthModel/superadmin.model.js';
import { sendEmail } from '../Utils/sendEmail.js';



// Run every day at midnight

cron.schedule("0 0 * * *" , async()=>{
    console.log("Running daily subscription check...");
    const now = new Date();

    const expiredSubs = await Subscription.find({
    expiresAt: { $lt: now },
    isActive: true
  }).populate("planId");


   for (const sub of expiredSubs) {
    sub.isActive = false;
    await sub.save();

    const superAdmin = await SuperAdminModel.findById(sub.superAdminId);
    if (superAdmin?.email) {
      await sendEmail({
        to: superAdmin.email,
        subject: "Your subscription has expired",
        text: `Hi ${superAdmin.userName},\n\nYour "${sub.planId.name}" subscription expired on ${sub.expiresAt.toDateString()}.\nPlease renew it to continue using verification services.\n\n- HRMS Team`
      });
    }
  }

})