import { success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError} from "../../../../src/v1/api/formatters/globalResponse.js"


    export const sendToken = (user, statusCode, res) => {
        const token = user.getSignedToken();
        const options = {
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
            httpOnly: true,
             secure: true,
             sameSite: "none",
        }

       return res.status(statusCode).cookie('token', token, options).json({
            success: true,
            user,
            token
        });
    }


