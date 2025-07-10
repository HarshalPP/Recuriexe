import { returnFormatter } from "../formatters/common.formatter.js";
import formModel from "../models/formLibraryModel/formLibrary.model.js";

//----------------------------   add formdata ------------------------------

export async function addFormadta(requestsObject) {
    try {
         let isexist = await formModel.find({dataType:requestsObject.body.dataType,fieldName:requestsObject.body.fieldName});
         if(isexist.length>0){
            return returnFormatter(false,"Alredy exsited")
         }
        const newData = await formModel.create({...requestsObject.body});
        return returnFormatter(true,"Form data created succesfully" )
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// // --------------------- update form -----------------------

export async function updateFormById(requestsObject) {
    try {
       let isVarible = await formModel.findById(requestsObject.body.formId);
       if(!isVarible){
        return returnFormatter(false,"No form found")
       }
       await variableModel.findByIdAndUpdate(requestsObject.body.formId,{...requestsObject.body},{new:true});
        return returnFormatter(true, "Data updated succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- delete form -----------------------

export async function removeForm(formId) {
    try {
        let isVarible = await formModel.findById(formId);
        if(!isVarible){
         return returnFormatter(false,"No variable found")
        }
         await formModel.findByIdAndDelete(formId);
        return returnFormatter(true, "Data deleted succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// // --------------------- get Form -----------------------

export async function getFormById(formId) {
    try {
        const varData = await formModel.findById(formId)
              
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// // --------------------- get all Form -----------------------

export async function getAllForm(requestsObject) {
    try {
        const varData = await formModel.find();
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}




