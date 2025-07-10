import { returnFormatter } from "../formatters/common.formatter.js";
import templateModel from "../models/templateModel/template.model.js";
import { addVariableAuto } from "./variable.helper.js";

//----------------------------   add Template ------------------------------

export async function addTemplate(requestsObject) {
    try {
        const newData = await templateModel.create({organizationId:requestsObject.employee.organizationId,...requestsObject.body});
        return returnFormatter(true,"Template created succesfully" )
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}

// --------------------- update Template -----------------------

export async function updateTemplateById(requestsObject) {
    try {
       let isVarible = await templateModel.findById(requestsObject.body.tempId)
       if(!isVarible){
        return returnFormatter(false,"No Template found")
       }
    //    let html = `
    //    <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>Generated Content</title>
    //         <style>
    //             body { font-family: Arial, sans-serif; }
    //             table { width: 100%; border: 1px solid black; border-collapse: collapse; }
    //             th, td { border: 1px solid black; padding: 10px; text-align: center; }
    //             img { display: block; margin: 0 auto; }
    //         </style>
    //     </head>
    //     <body>
    //         ${requestsObject.body.htmlContent}
    //     </body>
    //     </html>`
       
       await storeBackupLog("template",isVarible);
       await templateModel.findByIdAndUpdate(requestsObject.body.tempId,{...requestsObject.body},{new:true});
        return returnFormatter(true, "Data updated succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// --------------------- delete Template -----------------------

export async function removeTemplate(tempId) {
    try {
        let isVarible = await templateModel.findById(tempId);
        if(!isVarible){
         return returnFormatter(false,"No Template found")
        }
         await templateModel.findByIdAndDelete(tempId);
        return returnFormatter(true, "Data deleted succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get Template -----------------------

export async function getTemplateId(tempId) {
    try {
        const varData = await templateModel.findById(tempId)
              
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}




// --------------------- get Product Related Template -----------------------

export async function getProductTemplateId(req) {
    try {
        const varData = await templateModel.find({userProductId:req.query.productId,organizationId:req.employee.organizationId})
        return returnFormatter(true, "Data fetched succesfully",varData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get all template -----------------------

export async function getAllTemplates(requestsObject) {
    try {
        const varData = await templateModel.find({ organizationId: requestsObject.employee.organizationId })
            .populate({
                path: "userProductId",
                model: "userProduct",
                options: { strictPopulate: false },
            })
            .sort({ createdAt: -1 });
            
        await addVariableAuto(requestsObject);
        return returnFormatter(true, "Data fetched successfully", varData);
    } catch (error) {
        console.error("Error fetching templates:", error);  // Added logging
        return returnFormatter(false, error.message);
    }
}




