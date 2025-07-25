import reportTemplateModel from "../../models/reportTemplateModel/reportTemplate.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js";
import { addVariableAuto } from "./reportVarible.helper.js";

//----------------------------   add Template ------------------------------

export async function addTemplate(requestsObject) {
    try {
        const newData = await reportTemplateModel.create({organizationId:requestsObject.employee.organizationId,...requestsObject.body});
        return returnFormatter(true,"Template created succesfully" )
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}

// --------------------- update Template -----------------------

export async function updateTemplateById(requestsObject) {
    try {
       let isVarible = await reportTemplateModel.findById(requestsObject.body.tempId)
       if(!isVarible){
        return returnFormatter(false,"No Template found")
       }       
       await reportTemplateModel.findByIdAndUpdate(requestsObject.body.tempId,{...requestsObject.body},{new:true});
        return returnFormatter(true, "Data updated succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// --------------------- delete Template -----------------------

export async function removeTemplate(tempId) {
    try {
        let isVarible = await reportTemplateModel.findById(tempId);
        if(!isVarible){
         return returnFormatter(false,"No Template found")
        }
         await reportTemplateModel.findByIdAndDelete(tempId);
        return returnFormatter(true, "Data deleted succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get Template -----------------------

export async function getTemplateId(tempId) {
    try {
        const varData = await reportTemplateModel.findById(tempId)
              
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}




// --------------------- get template by reportId -----------------------

export async function gettemplatebyReportId(req) {
    try {
        const varData = await reportTemplateModel.find({reportId:req.query.reportId,organizationId:req.employee.organizationId})
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get all template -----------------------

export async function getAllTemplates(requestsObject) {
    try {
        const varData = await reportTemplateModel.find({ organizationId: requestsObject.employee.organizationId });
            
        await addVariableAuto(requestsObject);
        return returnFormatter(true, "Data fetched successfully", varData);
    } catch (error) {
        console.error("Error fetching templates:", error);  // Added logging
        return returnFormatter(false, error.message);
    }
}




