import { addSenderDetail , senderDetailget , senderListDropDown , senderMailUpdateById } from '../../helper/mail/senderMail.helper.js';
import { created, success ,  badRequest, unknownError  } from '../../formatters/globalResponse.js';


// ------------------------------------ save mail switch ------------------------------------//

export async function senderMailAdd(req, res) {
    try {
        const { status, message, data } = await addSenderDetail(req);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

//------------------------------------ get mail switch ------------------------------------//
export async function detailById(req, res) {
    try {
        const { status, message, data } = await senderDetailget(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


//------------------------------------ get mail switch ------------------------------------//
export async function dropDownList(req, res) {
    try {
        const { status, message, data } = await senderListDropDown(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



//------------------------------------ sender mail update ------------------------------------//
export async function senderMailUpdate(req, res) {
    try {
        const { status, message, data } = await senderMailUpdateById(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}