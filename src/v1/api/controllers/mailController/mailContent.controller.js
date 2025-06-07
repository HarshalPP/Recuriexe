import { newMailContent  , mailContentDetail} from '../../helper/mail/mailContent.helper.js';
import { created, success ,  badRequest, unknownError  } from '../../formatters/globalResponse.js';


// ------------------------------------ add mail content ------------------------------------//

export async function addMailContent(req, res) {
    try {
        const { status, message, data } = await newMailContent(req);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// ------------------------------------ get mail content ------------------------------------//

export async function getMailContent(req, res) {
    try {
        const { status, message, data } = await mailContentDetail(req);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}