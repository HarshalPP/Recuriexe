import { returnFormatter } from "../formatters/common.formatter.js";
import emailTemplateModel from "../models/emailTemplateModel/pdfTemplate.model.js";
import { addVariableAuto } from "./variable.helper.js";

//----------------------------   add Template ------------------------------

export async function addEmailTemplate(requestsObject) {
    try {
        const newData = await emailTemplateModel.create({serviceId:requestsObject.user.serviceId,...requestsObject.body});
        return returnFormatter(true,"Template created succesfully" )
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}

// --------------------- update Template -----------------------

export async function updateEmailTemplateById(requestsObject) {
    try {
       let isVarible = await emailTemplateModel.findById(requestsObject.body.tempId)
       if(!isVarible){
        return returnFormatter(false,"No Template found")
       }
       await storeBackupLog("template",isVarible);
       await emailTemplateModel.findByIdAndUpdate(requestsObject.body.tempId,{...requestsObject.body},{new:true});
        return returnFormatter(true, "Data updated succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- delete Template -----------------------

// export async function removeEmailTemplate(tempId) {
//     try {
//         let isVarible = await emailTemplateModel.findById(tempId);
//         if(!isVarible){
//          return returnFormatter(false,"No Template found")
//         }
//          await emailTemplateModel.findByIdAndDelete(varId);
//         return returnFormatter(true, "Data deleted succesfully")
//     } catch (error) {
//         return returnFormatter(false, error.message)
//     }
// }



// --------------------- get Template -----------------------

export async function getEmailTemplateId(tempId) {
    try {
        const varData = await emailTemplateModel.findById(tempId)
              
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}







// --------------------- get all template -----------------------

export async function getAllEmailTemplates(requestsObject) {
    try {
        const varData = await emailTemplateModel.find({ serviceId: requestsObject.user.serviceId })
            .sort({ createdAt: -1 });
            
        await addVariableAuto(requestsObject);
        return returnFormatter(true, "Data fetched successfully", varData);
    } catch (error) {
        console.error("Error fetching templates:", error);  // Added logging
        return returnFormatter(false, error.message);
    }
}




