import {
  pinCodeList,
} from "../../helper/pinCode.helper.js";

import { created, success, badRequest, unknownError } from "../../formatters/globalResponse.js";

// export async function createOrganizationType(req, res) {
//   try {
//     const { status, message, data } = await addOrganizationType(req);
//     return status ? created(res, message, data) : badRequest(res, message);
//   } catch (err) {
//     return unknownError(res, err.message);
//   }
// }

export async function getPinCodeList(req, res) {
  try {
    const { status, message, data } = await pinCodeList(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (err) {
    return unknownError(res, err.message);
  }
}

