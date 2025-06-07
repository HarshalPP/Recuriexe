import SubscriptionPlan from "../../models/subscribeModel/SubscriptionPlan.model.js"
import { badRequest, serverValidation, success, unknownError} from "../../formatters/globalResponse.js"

// create a subscription Plan //


export const createPlan = async(req , res)=>{
    try {

        const {
           name,
           description,
           price,
           durationInDays,
           creditlimit
        } =  req.body;

        const findName = await SubscriptionPlan.findOne({name})
        if(findName){
            return badRequest(res , "Use Another Plan Name")
        }

        const newPlan = new SubscriptionPlan({
            name, description, price, durationInDays, creditlimit
        })

        const savedPlan = await newPlan.save();
        return success(res , "Subscription plan created" , savedPlan)
        
    } catch (error) {
        return unknownError(res , error)
    }
}



// Get All Plan 
export const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({isActive:"true"});
    return success(res, "Subscription plans fetched successfully", plans);
  } catch (error) {
    return unknownError(res, error);
  }
};



//Update Plan 

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedPlan) return badRequest(res, "Subscription plan not found");

    return success(res, "Subscription plan updated", updatedPlan);
  } catch (error) {
    return unknownError(res, error);
  }
};



export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SubscriptionPlan.findByIdAndDelete(id);
    if (!deleted) return badRequest(res, "Subscription plan not found");

    return success(res, "Subscription plan deleted");
  } catch (error) {
    return unknownError(res, error);
  }
};

