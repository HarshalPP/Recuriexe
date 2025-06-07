import { returnFormatter } from "../../formatters/common.formatter.js";
import { merchantFormatter } from "../../formatters/expense/merchant.formatter.js";
import merchantModel from "../../models/expense/merchant.model.js";


//----------------------------   add Role ------------------------------

export async function saveMerchants(requestsObject) {
    try {
        const formattedData = merchantFormatter(requestsObject);
        const newTripData = await merchantModel.create(formattedData);
        return returnFormatter(true, "Merchant created succesfully", newTripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- update Field -----------------------

export async function updateMerchantById(merchantId,updateData) {
    try {
        const formattedData = merchantFormatter(updateData);
        console.log(formattedData,"formattedDataformattedData")
        const updatedfieldData = await merchantModel.findOneAndUpdate( { _id: merchantId },formattedData,{new:true, upsert:true})
        return returnFormatter(true, "Merchant updated succesfully", updatedfieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get Field -----------------------

export async function getMerchantById(tripValueId) {
    try {
        const tripData = await merchantModel.findById(tripValueId)//.populate('fields.fieldId')  
        return returnFormatter(true, "Merchant data",tripData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // // --------------------- get all Field -----------------------

export async function getAllMerchants(req) {
    try {
        const FieldData = await merchantModel.find({}).sort({createdAt:-1})
        return returnFormatter(true, "Merchant all data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}
