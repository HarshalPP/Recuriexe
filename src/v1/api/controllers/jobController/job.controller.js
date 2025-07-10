import { acceptJobALoocation, acceptJobForEmp, addJob, allocateJobByJobId, backOfficeDashboardCount, createExcel, deleteJobById, fetchAdCasedata, fetchAutoDataFromAi, fetchAutoDataFromAiEmp, getAcceptedJobByPartnerId, getAllAllocated, getAllJob, getCompletedJobByEmpId, getFinalJobs, getJobByEmpId, getJobById, getJobByPartnerId, getPartnerProductInfo, getPendingJobByEmpId, getPendingJobByPartnerId, handleJobsExcelUpload, raiseCaseExcel, resetJob, UnallocateJobByJobId, updateJobById, updateJobStage, updateMyJobById } from "../../helper/job.helper.js"
import { badRequest, created, notFound, success, unknownError } from "../../helper/response.helper.js"



// -------------------------- get partner products -------------------------------


export async function getPartnerProduct(req, res) {
    try {
        const { status, message, data } = await getPartnerProductInfo(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// -------------------------- ftech auto data from ai -------------------------------


export async function fetchAiData(req, res) {
    try {
        const { status, message, data } = await fetchAutoDataFromAi(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// -------------------------- ftech auto ai data -------------------------------


export async function fetchAiDataForAddCase(req, res) {
    try {
        const { status, message, data } = await fetchAdCasedata(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}




// -------------------------- ftech auto data from ai -------------------------------


export async function fetchAiDataEmp(req, res) {
    try {
        const { status, message, data } = await fetchAutoDataFromAiEmp(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// -------------------------- get sample sheet -------------------------------


export async function getSampleSheet(req, res) {
    try {
        const { status, message, data } = await createExcel(req);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// -------------------------- create job -------------------------------


export async function createJob(req, res) {
    try {
        const { status, message, data } = await addJob(req)
        return status ? created(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}




// -------------------------- create job for excel -------------------------------


export async function createJobForExcel(req, res) {
    try {
        const { status, message, data } = await handleJobsExcelUpload(req);
        return status ? created(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// --------------------------- allocate Job ----------------------------------

export async function reAllocateJob(req, res) {
    try {
        
        const { status, message, data } = await UnallocateJobByJobId(req.body.jobProductId,req)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------------remove allocate self Job ----------------------------------

export async function allocateJob(req, res) {
    try {
        
        const { status, message, data } = await allocateJobByJobId(req.body.jobProductId,req)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// --------------------------- update job only ----------------------------------

export async function updateJobOnly(req, res) {
    try {
        
        const { status, message, data } = await updateJobById(req.body.jobProductId,req)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// --------------------------- update job only ----------------------------------

export async function updateMYJobOnly(req, res) {
    try {
        
        const { status, message, data } = await updateMyJobById(req)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// --------------------------- Reset Job ----------------------------------

export async function resetJobById(req, res) {
    try {
        
        const { status, message, data } = await resetJob(req.query.jobId)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// --------------------------- accept allocation  job  ----------------------------------

export async function acceptAllicatorJob(req, res) {
    try {
        
        const { status, message, data } = await acceptJobALoocation(req)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// --------------------------- get allaloocated  job  ----------------------------------

export async function allAllocatedJob(req, res) {
    try {
        
        const { status, message, data } = await getAllAllocated(req)
        return status ? success(res, message,data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// --------------------------- get all  job count  ----------------------------------

export async function getAllJobCount(req, res) {
    try {
        
        const { status, message, data } = await backOfficeDashboardCount(req)
        return status ? success(res, message,data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// --------------------------- accept allocation  job  ----------------------------------

export async function acceptEmpJob(req, res) {
    try {
        
        const { status, message, data } = await acceptJobForEmp(req)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}




// --------------------------- update job stage only ----------------------------------

export async function updateJobSTageInfo(req, res) {
    try {
        
        const { status, message, data } = await updateJobStage(req.body.jobId,req)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------  get Job By Id ----------------------------


export async function getJobIfo(req, res) {
    try {
        const { status, message, data } = await getJobById(req.params.jobId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------  get Job By Id ----------------------------


export async function getAllJobIfo(req, res) {
    try {
        const { status, message, data } = await getAllJob(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------  get Job By Id ----------------------------


export async function getMyJobByPartnerId(req, res) {
    try {
        
        const { status, message, data } = await getJobByPartnerId(req,req.query.stageId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// // ---------------------  get pending Job for alloction ----------------------------


export async function getAllocationPendingjob(req, res) {
    try {
        
        const { status, message, data } = await getPendingJobByPartnerId(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// // ---------------------  get accepted Job fo allocation ----------------------------


export async function getAllocationAcceptedJob(req, res) {
    try {
        
        const { status, message, data } = await getAcceptedJobByPartnerId(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

// ---------------------  get Job By Emp Id ----------------------------


export async function getMyJobByEmployeeId(req, res) {
    try {
        
        const { status, message, data } = await getJobByEmpId(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}



// ---------------------  get completed Job By Emp Id ----------------------------


export async function getMyCompletedJobInfoByEmployeeId(req, res) {
    try {
        
        const { status, message, data } = await getCompletedJobByEmpId(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------  get pending Job By Emp Id ----------------------------


export async function getMyPendingJobByEmployeeId(req, res) {
    try {
        
        const { status, message, data } = await getPendingJobByEmpId(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------  get Final job  ----------------------------


export async function getAllFinalizeJob(req, res) {
    try {
        
        const { status, message, data } = await getFinalJobs(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


// ---------------------  raise case  ----------------------------


export async function raiseFinalCaseExcel(req, res) {
    try {
        
        const { status, message, data } = await raiseCaseExcel(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}






// ---------------  remove Stage -------------------------

export async function removeJob(req, res) {
    try {
        const resData = await getJobById(req.params.jobId);
        
        if(!resData.data){
            return notFound(res,noOJobErrorMessage)
        }
        const { status, message, data } = await deleteJobById(req.params.jobId);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


