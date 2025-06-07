import * as formatter from "../../formatters/document.formatter.js"
import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js"

export const createDocument = async (req, res) => {
  try {
    const { name, label } = req.body;

    const doc = await formatter.createVerificationDocument({ name, label });
    return success(res , "create document successfully" , doc)
  } catch (err) {
    return unknownError(res , err)
  }
};

export const getDocuments = async (req, res) => {
  try {
    // const company = req.user.companyId;
    const docs = await formatter.getVerificationDocuments();
    return success(res , "Documents fetched" , docs)
  } catch (err) {
   return unknownError(res , err)
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    // const company = req.user.companyId;

    const doc = await formatter.deleteVerificationDocument({ id });
    return success(res , "Document deleted" , doc)
  } catch (err) {
    return unknownError(res , err)
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, label , status } = req.body;
    // const company = req.user.companyId;

    const doc = await formatter.updateVerificationDocument({ id, name, label , status });
    return success(res , "Update Document" , doc)
  } catch (err) {
    return unknownError(res , err)
  }
};
