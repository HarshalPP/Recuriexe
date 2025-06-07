import { returnFormatter } from "../../formatters/common.formatter.js";
import { fieldFormatter } from "../../formatters/expense/field.formatter.js";
import fieldModel from "../../models/expense/field.model.js";


//----------------------------   add Role ------------------------------

export async function addField(requestsObject) {
    try {
        const formattedData = fieldFormatter(requestsObject);
        const data = await fieldModel.findOne({ labelName: formattedData.labelName, moduleType: formattedData.moduleType })
        if(data){
            return returnFormatter(true, "Field name is already used for this module")
        }
        const newRoleData = await fieldModel.create({...formattedData,createdBy:requestsObject.employee.id});
        return returnFormatter(true, "field created succesfully", newRoleData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- update Field -----------------------

export async function updateFieldById(fieldId,updateData) {
    try {
        let field = await fieldModel.findById(fieldId);
        if(!field){
            return returnFormatter(false,"No field data found")
        }
        const formattedData = fieldFormatter(updateData);
        const updatedfieldData = await fieldModel.findByIdAndUpdate(fieldId,formattedData,{new:true})
        return returnFormatter(true, "field updated succesfully", updatedfieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- get Field -----------------------

export async function getFieldById(fieldId) {
    try {
        const FieldData = await fieldModel.findById(fieldId)  
              
        return returnFormatter(true, "field data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- get all Field -----------------------

export async function getAllFields(req) {
    try {
         const moduleType = req.query.type 
         console.log(req.query)
        const filter = moduleType ? { moduleType } : {};
        const FieldData = await fieldModel.find(filter).sort({createdAt:-1})
        return returnFormatter(true, "Field data",FieldData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}
