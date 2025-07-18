import caseInitiationModel from "../../models/ReportModel/caseInitiation.model.js"
import jobApply from "../../models/jobformModel/jobform.model.js";
import { success , badRequest , unknownError } from "../../formatters/globalResponse.js"




// User case Inition //
export const usercaseInit = async(req , res)=>{
    try {

        const {candidateId , stageId} = req.body;
        const organizationId = req.employee.organizationId;
        if(!candidateId){
            return badRequest(res , "Please Provide the candidateId")
        }

        const findJobApply = await jobApply.findById(candidateId)
        if(findJobApply){
            const createcase = await caseInitiationModel.create({

                organizationId:organizationId,
                candidateId:organizationId,
                candidateInfo:{
                    name:findJobApply.name,
                    emailId:findJobApply.emailId,
                    mobileNumber:findJobApply.mobileNumber
                },
                stageId:stageId || null

            })

            return success(res , "created" , createcase)
        }
  
    } catch (error) {
        return unknownError(res , "Internal Server Error")
    }
}


export const createUserCase = async ({ candidateId, organizationId, stageId , StageName , ReportId }) => {
  try {
    if (!candidateId || !organizationId) {
      throw new Error("candidateId and organizationId are required");
    }

    const findJobApply = await jobApply.findById(candidateId);
    if (!findJobApply) {
      throw new Error("Candidate not found");
    }

    const createdCase = await caseInitiationModel.create({
      organizationId,
      candidateId,
      candidateInfo: {
        name: findJobApply.name,
        emailId: findJobApply.emailId,
        mobileNumber: findJobApply.mobileNumber,
      },
      stageId: stageId || null,
      StageName:StageName,
      ReportId:ReportId || null
    });

    return { status: true, data: createdCase };
  } catch (error) {
    return { status: false, message: error.message };
  }
};



// get User case Init //
export const getcaseInit = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1)*limit

    const data = await caseInitiationModel.find({ organizationId })
    .populate({
      path:'ReportId',
      select:'reportName categories'
    })
    .skip(skip).limit(limit).sort({ createdAt: -1 })

    if (!data || data.length === 0) {
      return success(res, "No case data found!", []);
    }

    const result = {
         data,
         pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
    }

    return success(res, "Case data fetched successfully", result);
  } catch (error) {
    console.error("Error in getcaseInit:", error);
    return unknownError(res, "Internal server error");
  }
};