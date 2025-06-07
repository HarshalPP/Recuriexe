import { jobSaveAddRemoveById , jobSaveById } from '../../helper/jobSave.helper.js';
import { created, success ,  badRequest, unknownError  } from '../../formatters/globalResponse.js';


// ------------------------------------ Job Save ------------------------------------//

export async function jobSaveAddRemove(req, res) {
    try {
        const { status, message, data } = await jobSaveAddRemoveById(req);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

//------------------------------------ Get Job Save ------------------------------------//

export async function getJobSaveList(req, res) {
    try {
        const { status, message, data } = await jobSaveById(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

