import pinCodeModel from "../models/pinCodeModel/pinCode.model.js";
import { returnFormatter } from "../formatters/common.formatter.js";
// Add

// Get All
export async function pinCodeList(req) {
    try {
        const { pinCode } = req.query
        if (!pinCode) {
            return returnFormatter(false, "pinCode is required.");
        }

        const list = await pinCodeModel.findOne({ pincode: pinCode })

        return returnFormatter(true, `Pincode ${pinCode} Match Detail`, list);

    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
