import { returnFormatter } from "../formatters/common.formatter.js";
import docModel from "../models/docModel/doc.model.js";


//----------------------------   add Grade ------------------------------

export async function addDoc(requestsObject) {
    try {
      
        let doc = await docModel.create({serviceId:requestsObject.user.serviceId,requestId:requestsObject.body.requestId,reportId:requestsObject.body.reportId,documentName:requestsObject.body.documentName})

        return returnFormatter(true, "Data creted succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// --------------------- delete Grade -----------------------

export async function deleteDocById(docId) {
    try {
        const updatedCompanyData = await docModel.findByIdAndDelete(docId)
        return returnFormatter(true, "Removed succesfully")
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get grade -----------------------

export async function getallDocList(requestObject) {
    try {
        const desigantionData = await docModel.find({reportId:requestObject.query.reportId})
              
        return returnFormatter(true, "Doc data",desigantionData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



