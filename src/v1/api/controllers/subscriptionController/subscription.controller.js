import Subscription from "../../models/subscribeModel/Subscription.model.js"
import SubscriptionPlan from "../../models/subscribeModel/SubscriptionPlan.model.js"
import SuperAdminModel from "../../models/AuthModel/superadmin.model.js"
import { badRequest, serverValidation, success, unknownError} from "../../formatters/globalResponse.js"
import crypto from 'crypto'
import axios from 'axios';


// Subscrible a SuperAdmin to Plan //
export const subscribeToPlan = async(req , res)=>{
    try {

        const {superAdminId , planId}=req.body;

        const plan = await SubscriptionPlan.findById(planId)
        if(!plan){
            return badRequest(res , "Plan not found")
        }

        const superAdmin = await SuperAdminModel.findById(superAdminId)
        if(!superAdmin){
            return badRequest(res , "Super Admin not found")
        }

     const expiresAt = new Date();
     expiresAt.setDate(expiresAt.getDate() + plan.durationInDays);

       const apiKey = crypto.randomBytes(16).toString("hex");

    const newSubscription = new Subscription({
      superAdminId,
      planId,
      apiKey,
      expiresAt
    });

    const savedSub = await newSubscription.save();

        // Optionally link subscription to SuperAdmin
    superAdmin.subscription = savedSub._id;
    superAdmin.API_Key = apiKey;
    await superAdmin.save();


        // 🔐 Call external verification API
    const registrationPayload = {
      name:superAdmin.userName,
      email: superAdmin.email,
      password: superAdmin.email, // Password same as email
      API_Key:superAdmin.API_Key
    };

        try {
      const { data } = await axios.post(
        'https://varification-api.fincooperstech.com/v1/api/Auth/register',
        registrationPayload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log("Verification API response:", data);
    } catch (apiError) {
      console.error("Verification API error:", apiError.response?.data || apiError.message);
    }

    return success(res , "Subscription successful" , savedSub)
        
    } catch (error) {
        return unknownError(res ,  error)
    }
}


// Get Super Admin's subscription
export const getSubscription = async(req, res)=>{
    try {

        const {superAdminId}= req.parmas;
        if(!superAdminId){
            return badRequest(res , 'Please provide the Id')
        }

         const subscription = await Subscription.findOne({ superAdminId })
      .populate("planId");


      if(!subscription){
        return badRequest(res , "No Subscription found")
      }

      return success(res , subscription )
        
    } catch (error) {
        return unknownError(res , error)
    }
}