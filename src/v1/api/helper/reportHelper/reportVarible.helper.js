import mongoose from "mongoose";
import { returnFormatter } from "../../formatters/common.formatter.js";
import reportVariableModel from "../../models/reportvariableModel/reportVariable.model.js";
import reportFormModel from "../../models/reportFormModel/reportForm.model.js";

//----------------------------   add variable ------------------------------

export async function addVariable(requestsObject) {
    try {
        const newData = await reportVariableModel.create({organizationId:req.employee.organizationId,variableName:`{${requestsObject.body.variableName}}`})
        return returnFormatter(true,"Variable created succesfully" )
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- update Variable -----------------------

export async function updateVaribleById(requestsObject) {
    try {
       let isVarible = await reportVariableModel.findById(requestsObject.body.varId);
       if(!isVarible){
        return returnFormatter(false,"No variable found")
       }
       await reportVariableModel.findByIdAndUpdate(requestsObject.body.varId,{...requestsObject.body},{new:true});
        return returnFormatter(true, "Data updated succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// --------------------- delete variable -----------------------

export async function removeVaribale(varId) {
    try {
        let isVarible = await reportVariableModel.findById(varId);
        if(!isVarible){
         return returnFormatter(false,"No variable found")
        }
         await reportVariableModel.findByIdAndDelete(varId);
        return returnFormatter(true, "Data deleted succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get variable -----------------------

export async function getVaribleById(varId) {
    try {
        const varData = await reportVariableModel.findById(varId)
              
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get all varible -----------------------

export async function getAllVarible(requestsObject) {
    try {
        const varData = await reportVariableModel.find({organizationId:requestsObject.employee.organizationId});
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}




// --------------------------------------------- updated according to sir ----------------------------------------

export async function addVariableAuto(requestsObject) {
  try {
    // Step 1: Fetch forms with populated fields
    const formData = await reportFormModel.find({
      organizationId: requestsObject.employee.organizationId
    }).populate("fields");

    // Step 2: Extract fieldNames from all forms
    let allFieldNames = [];
    formData.forEach(form => {
      // Assuming `fields` is an array of inputField docs
      const fields = form.fields || [];
      
      fields.forEach(field => {
        
        if (field?.label) {
          allFieldNames.push(field.label);
        }
      });
    });

    // Step 3: Remove duplicates
    allFieldNames = [...new Set(allFieldNames)];

    // Step 4: Combine with default field names
    const defaultFieldNames = [
      "doneBy",
      "reportStatus",
      "reportType"
    ];
    const combinedFieldNames = [...new Set([...allFieldNames, ...defaultFieldNames])];

    // Step 5: Format as {variableName}
    const variableNames = combinedFieldNames.map(name => `{${name}}`);

    // Step 6: Get existing variables
    const existingVariables = await reportVariableModel.find({
      organizationId: requestsObject.employee.organizationId
    });
    const existingVariableNames = existingVariables.map(v => v.variableName);

    // Step 7: Filter out already existing variables
    const newVariablesToCreate = variableNames.filter(
      varName => !existingVariableNames.includes(varName)
    );

    // Step 8: Insert new variables if any
    if (newVariablesToCreate.length > 0) {
      const variablesToInsert = newVariablesToCreate.map(variableName => ({
        organizationId: requestsObject.employee.organizationId,
        variableName
      }));

      await reportVariableModel.insertMany(variablesToInsert);

      return returnFormatter(
        true,
        `${newVariablesToCreate.length} new variables created successfully`,
        newVariablesToCreate
      );
    }

    return returnFormatter(true, "No new variables to insert", []);
  } catch (error) {
    console.error("Error in addVariableAuto:", error);
    return returnFormatter(false, error.message || "Unexpected error occurred");
  }
}
