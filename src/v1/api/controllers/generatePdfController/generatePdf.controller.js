import { generatePdfFunc } from "../../helper/generatePdf.helper.js"
import { badRequest, success, unknownError } from "../../helper/response.helper.js"



// -------------------------- generate pdf -------------------------------


export async function generatePdf(req, res) {
    try {
        const { status, message, data } = await generatePdfFunc(req)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}