import { badRequest, created, success, unknownError } from "../../helper/response.helper.js";
import {
    addInit,
    updateInitById,
    getInitById,
    getAllInitsByServiceId,
    createExcelForInit,
    readExcelForInit,
    getAllInitsByEmpId,
    allocateInitById,
    getAllCompleteInits,
    getAllUnAllocatedInits,
    getAllAllocatedInits,
    getAllAllInits,
    getAllDatCount,
    getAllInitsByEmpIdJobCreated,
    getAllInitForInitiationUnfiltered,
    getInitiationDashboard,
    getAlladdCases,
    getAllInitatedFilters,
    getAllIniatedData,
    getAllForBackOffice,
    getAllInvoicedata,
    getInvoiceDashboard,
    getfiles
} from "../../helper/init.helper.js";

// -------------------------- Create Init -------------------------------

export async function saveInit(req, res) {
    try {
        const { status, message, data } = await addInit(req);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// -------------------------- Update Init -------------------------------

export async function updateInit(req, res) {
    try {
        const { status, message, data } = await updateInitById(req.body.id, req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// -------------------------- allocate Init -------------------------------

export async function empManyAllocation(req, res) {
    try {
        const { status, message, data } = await allocateInitById(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// -------------------------- dashboard count -------------------------------

export async function dashboardCount(req, res) {
    try {
        const { status, message, data } = await getAllDatCount(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



// -------------------------- Get Init by ID -------------------------------

export async function getInit(req, res) {
    try {
        const { status, message, data } = await getInitById(req.params.id);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}





// -------------------------- Get Initated filtered -------------------------------

export async function getIniatedFiltered(req, res) {
    try {
        const { status, message, data } = await getAllInitatedFilters(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}




// -------------------------- Get Init by emp ID not created -------------------------------

export async function getInitByEmp(req, res) {
    try {
        const { status, message, data } = await getAllInitsByEmpId(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// -------------------------- Get Init by emp ID job created -------------------------------

export async function getJobCreatedInit(req, res) {
    try {
        const { status, message, data } = await getAllInitsByEmpIdJobCreated(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// -------------------------- Get all iniated -------------------------------

export async function getAllIniatited(req, res) {
    try {
        const { status, message, data } = await getAllInitForInitiationUnfiltered(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// -------------------------- Get all iniated dashboard -------------------------------

export async function getAllIniatitedDashboard(req, res) {
    try {
        const { status, message, data } = await getInitiationDashboard(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// -------------------------- Get All filtered Inits -------------------------------

export async function getAllFiltered(req, res) {
    try {
        const { status, message, data } = await getAlladdCases(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// -------------------------- Get All unallocated Inits -------------------------------

export async function getAllInit(req, res) {
    try {
        const { status, message, data } = await getAllUnAllocatedInits(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



// -------------------------- Get All allocated Inits -------------------------------

export async function getAllAllocatedInitData(req, res) {
    try {
        const { status, message, data } = await getAllAllocatedInits(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// -------------------------- Get All  Inits -------------------------------

export async function getAllUnfiltered(req, res) {
    try {
        const { status, message, data } = await getAllAllInits(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// -------------------------- Get All complete Inits -------------------------------

export async function getAllInitCompleted(req, res) {
    try {
        
        const { status, message, data } = await getAllCompleteInits(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// -------------------------- Get All Inits by Service ID -------------------------------

export async function getAllInitByServiceId(req, res) {
    try {
        const { status, message, data } = await getAllInitsByServiceId(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// -------------------------- createexcel sheet -------------------------------

export async function generateExcelSheet(req, res) {
    try {
        const { status, message, data } = await createExcelForInit(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// -------------------------- read sheet and create -------------------------------

export async function readSheet(req, res) {
    try {
        const { status, message, data } = await readExcelForInit(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}





//--------------------------------------------  all initated data according to sir-------------------------



export async function getIniatedDataInfo(req, res) {
    try {
        const { status, message, data } = await getAllIniatedData(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



//--------------------------------------------  all back office data according to sir-------------------------



export async function getBackOfficeInfo(req, res) {
    try {
        const { status, message, data } = await getAllForBackOffice(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



//--------------------------------------------  all back office for invoice data according to sir-------------------------



export async function invoiceDataInfo(req, res) {
    try {
        const { status, message, data } = await getAllInvoicedata(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


//--------------------------------------------  all back office for files data according to sir-------------------------



export async function filesData(req, res) {
    try {
        const { status, message, data } = await getfiles(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



//--------------------------------------------  all back office for invoice count data according to sir-------------------------



export async function invoiceCount(req, res) {
    try {
        const { status, message, data } = await getInvoiceDashboard(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

